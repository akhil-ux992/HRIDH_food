create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  name text not null,
  role text not null check (role in ('donor','receiver','admin')),
  sub_role text check (sub_role in ('self','distributor')),
  organization_or_area text not null default '',
  phone text not null default '',
  revoked_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  donor_id uuid not null references public.profiles(id),
  donor_name text not null,
  donor_type text not null,
  title text not null,
  description text not null default '',
  quantity text not null,
  food_category text not null,
  location text not null,
  expires_in text not null,
  image_url text not null default '',
  status text not null default 'pending' check (status in ('pending','available','claim-pending','claimed','delivered','rejected')),
  claimed_by uuid references public.profiles(id),
  claimed_name text,
  claimed_sub_role text check (claimed_sub_role in ('self','distributor')),
  beneficiary_note text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.admin_activity (
  id bigint generated always as identity primary key,
  actor_id uuid references public.profiles(id),
  action text not null,
  target_id text,
  details text not null default '',
  created_at timestamptz not null default now()
);

create index if not exists posts_status_created_idx on public.posts(status, created_at desc);
create index if not exists posts_donor_idx on public.posts(donor_id);
create index if not exists posts_claimed_by_idx on public.posts(claimed_by);

create or replace function public.is_active_admin()
returns boolean language sql stable security definer set search_path = public
as $$ select exists (select 1 from public.profiles where id = auth.uid() and role = 'admin' and revoked_at is null) $$;

create or replace function public.is_active_user()
returns boolean language sql stable security definer set search_path = public
as $$ select exists (select 1 from public.profiles where id = auth.uid() and revoked_at is null) $$;

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public
as $$
declare requested_role text := coalesce(new.raw_user_meta_data->>'role', 'receiver');
begin
  if requested_role not in ('donor','receiver') then requested_role := 'receiver'; end if;
  insert into public.profiles(id,email,name,role,sub_role,organization_or_area,phone)
  values (
    new.id, lower(new.email), coalesce(nullif(new.raw_user_meta_data->>'name',''),'Member'), requested_role,
    case when requested_role='receiver' and new.raw_user_meta_data->>'sub_role'='distributor' then 'distributor' when requested_role='receiver' then 'self' else null end,
    coalesce(new.raw_user_meta_data->>'organization_or_area',''), coalesce(new.raw_user_meta_data->>'phone','')
  );
  return new;
end $$;

drop trigger if exists on_auth_user_created_profile on auth.users;
create trigger on_auth_user_created_profile after insert on auth.users for each row execute procedure public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.posts enable row level security;
alter table public.admin_activity enable row level security;
revoke all on public.profiles from anon,authenticated;
revoke all on public.posts from anon,authenticated;
revoke all on public.admin_activity from anon,authenticated;
grant select on public.profiles to authenticated;
grant select,insert on public.posts to anon,authenticated;

drop policy if exists profile_self_or_admin_read on public.profiles;
create policy profile_self_or_admin_read on public.profiles for select to authenticated using (id=auth.uid() or public.is_active_admin());
drop policy if exists profile_self_update on public.profiles;
create policy profile_self_update on public.profiles for update to authenticated using (id=auth.uid() and revoked_at is null) with check (id=auth.uid() and role in ('donor','receiver'));
drop policy if exists posts_public_or_owner_read on public.posts;
create policy posts_public_or_owner_read on public.posts for select to anon,authenticated using (status in ('available','claim-pending','claimed','delivered') or donor_id=auth.uid() or public.is_active_admin());
drop policy if exists donors_insert_pending on public.posts;
create policy donors_insert_pending on public.posts for insert to authenticated with check (donor_id=auth.uid() and status='pending' and exists (select 1 from public.profiles where id=auth.uid() and role='donor' and revoked_at is null));

create or replace function public.request_claim(p_post_id uuid,p_note text default '')
returns boolean language plpgsql security definer set search_path=public
as $$
declare profile_row public.profiles%rowtype;
begin
  select * into profile_row from public.profiles where id=auth.uid() and revoked_at is null;
  if not found or profile_row.role<>'receiver' then raise exception 'Active receiver account required'; end if;
  update public.posts set status='claim-pending',claimed_by=profile_row.id,claimed_name=profile_row.name,claimed_sub_role=profile_row.sub_role,beneficiary_note=left(coalesce(p_note,''),240),updated_at=now() where id=p_post_id and status='available';
  return found;
end $$;

create or replace function public.review_donation(p_post_id uuid,p_decision text)
returns void language plpgsql security definer set search_path=public
as $$
begin
  if not public.is_active_admin() then raise exception 'Administrator access required'; end if;
  if p_decision not in ('approve','reject') then raise exception 'Invalid decision'; end if;
  update public.posts set status=case when p_decision='approve' then 'available' else 'rejected' end,updated_at=now() where id=p_post_id and status='pending';
  if not found then raise exception 'Listing is no longer awaiting review'; end if;
  insert into public.admin_activity(actor_id,action,target_id) values(auth.uid(),'donation-'||p_decision,p_post_id::text);
end $$;

create or replace function public.review_claim(p_post_id uuid,p_decision text)
returns void language plpgsql security definer set search_path=public
as $$
begin
  if not public.is_active_admin() then raise exception 'Administrator access required'; end if;
  if p_decision not in ('approve','reject') then raise exception 'Invalid decision'; end if;
  update public.posts set status=case when p_decision='approve' then 'delivered' else 'available' end,
    claimed_by=case when p_decision='approve' then claimed_by else null end,
    claimed_name=case when p_decision='approve' then claimed_name else null end,
    claimed_sub_role=case when p_decision='approve' then claimed_sub_role else null end,
    beneficiary_note=case when p_decision='approve' then beneficiary_note else '' end,updated_at=now()
  where id=p_post_id and status='claim-pending';
  if not found then raise exception 'Request is no longer awaiting review'; end if;
  insert into public.admin_activity(actor_id,action,target_id) values(auth.uid(),'claim-'||p_decision,p_post_id::text);
end $$;

create or replace function public.mark_post_delivered(p_post_id uuid)
returns void language plpgsql security definer set search_path=public
as $$
begin
  if not public.is_active_user() then raise exception 'Active account required'; end if;
  update public.posts set status='delivered',updated_at=now() where id=p_post_id and status='claimed'
    and (donor_id=auth.uid() or claimed_by=auth.uid());
  if not found then raise exception 'Listing cannot be marked delivered by this account'; end if;
end $$;

create or replace function public.remove_post(p_post_id uuid)
returns void language plpgsql security definer set search_path=public
as $$
declare title_value text;
begin
  if not public.is_active_admin() then raise exception 'Administrator access required'; end if;
  delete from public.posts where id=p_post_id returning title into title_value;
  if title_value is null then raise exception 'Listing not found'; end if;
  insert into public.admin_activity(actor_id,action,target_id,details) values(auth.uid(),'listing-removed',p_post_id::text,title_value);
end $$;

create or replace function public.set_user_revoked(p_user_id uuid,p_revoke boolean)
returns void language plpgsql security definer set search_path=public
as $$
begin
  if not public.is_active_admin() then raise exception 'Administrator access required'; end if;
  if p_user_id=auth.uid() then raise exception 'You cannot revoke your own administrator account'; end if;
  update public.profiles set revoked_at=case when p_revoke then now() else null end where id=p_user_id and role<>'admin';
  if not found then raise exception 'User not found or cannot be changed'; end if;
  insert into public.admin_activity(actor_id,action,target_id) values(auth.uid(),case when p_revoke then 'user-revoked' else 'user-restored' end,p_user_id::text);
end $$;

create or replace function public.get_post_whatsapp_contact(p_post_id uuid)
returns table(contact_name text,contact_phone text) language plpgsql stable security definer set search_path=public
as $$
declare listing public.posts%rowtype;
begin
  select * into listing from public.posts where id=p_post_id;
  if not found or listing.status<>'delivered' or not public.is_active_user() then return; end if;
  if auth.uid()=listing.donor_id then return query select p.name,p.phone from public.profiles p where p.id=listing.claimed_by;
  elsif auth.uid()=listing.claimed_by then return query select p.name,p.phone from public.profiles p where p.id=listing.donor_id;
  end if;
end $$;

create or replace function public.admin_list_users()
returns table(id uuid,email text,name text,role text,sub_role text,organization_or_area text,phone text,revoked_at timestamptz,created_at timestamptz)
language plpgsql stable security definer set search_path=public
as $$ begin
  if not public.is_active_admin() then raise exception 'Administrator access required'; end if;
  return query select p.id,p.email,p.name,p.role,p.sub_role,p.organization_or_area,p.phone,p.revoked_at,p.created_at from public.profiles p order by p.created_at desc;
end $$;

create or replace function public.admin_get_activity()
returns table(id bigint,action text,target_id text,details text,actor text,created_at timestamptz)
language plpgsql stable security definer set search_path=public
as $$ begin
  if not public.is_active_admin() then raise exception 'Administrator access required'; end if;
  return query select a.id,a.action,a.target_id,a.details,coalesce(p.email,'Administrator'),a.created_at from public.admin_activity a left join public.profiles p on p.id=a.actor_id order by a.created_at desc limit 200;
end $$;

create or replace function public.update_my_phone(p_phone text)
returns void language plpgsql security definer set search_path=public
as $$ begin
  update public.profiles set phone=left(coalesce(p_phone,''),40) where id=auth.uid() and revoked_at is null;
  if not found then raise exception 'Active account required'; end if;
end $$;

revoke all on function public.request_claim(uuid,text) from public;
revoke all on function public.review_donation(uuid,text) from public;
revoke all on function public.review_claim(uuid,text) from public;
revoke all on function public.mark_post_delivered(uuid) from public;
revoke all on function public.remove_post(uuid) from public;
revoke all on function public.set_user_revoked(uuid,boolean) from public;
revoke all on function public.get_post_whatsapp_contact(uuid) from public;
revoke all on function public.admin_list_users() from public;
revoke all on function public.admin_get_activity() from public;
revoke all on function public.update_my_phone(text) from public;
grant execute on function public.request_claim(uuid,text) to authenticated;
grant execute on function public.review_donation(uuid,text) to authenticated;
grant execute on function public.review_claim(uuid,text) to authenticated;
grant execute on function public.mark_post_delivered(uuid) to authenticated;
grant execute on function public.remove_post(uuid) to authenticated;
grant execute on function public.set_user_revoked(uuid,boolean) to authenticated;
grant execute on function public.get_post_whatsapp_contact(uuid) to authenticated;
grant execute on function public.admin_list_users() to authenticated;
grant execute on function public.admin_get_activity() to authenticated;
grant execute on function public.update_my_phone(text) to authenticated;

do $$ begin
  if not exists (select 1 from pg_publication_tables where pubname='supabase_realtime' and schemaname='public' and tablename='posts') then
    alter publication supabase_realtime add table public.posts;
  end if;
  if not exists (select 1 from pg_publication_tables where pubname='supabase_realtime' and schemaname='public' and tablename='profiles') then
    alter publication supabase_realtime add table public.profiles;
  end if;
end $$;
