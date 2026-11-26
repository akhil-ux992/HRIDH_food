import { useMemo } from 'react'
import { Check, Clock3, ShieldCheck, Users, X } from 'lucide-react'
import { useFood } from '../context/FoodContext'
import { roleLabel } from '../utils/helpers'

const dateLabel = (value) => value ? new Date(value).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }) : 'Recently'

export default function AdminPage({ navigate }) {
  const { currentUser, accounts, posts, auditLog, reviewPost, reviewClaim, removePost, setAccountRevoked } = useFood()
  const pendingPosts = posts.filter((post) => post.status === 'pending')
  const pendingClaims = posts.filter((post) => post.status === 'claim-pending')
  const activity = useMemo(() => [...posts.flatMap((post) => [
    { id: `${post.id}-post`, date: post.createdAt, text: `${post.donorName} posted “${post.title}”` },
    ...(post.claimedBy ? [{ id: `${post.id}-claim`, date: post.createdAt, text: `${post.claimedBy} requested “${post.title}”` }] : []),
  ]), ...auditLog.map((entry) => ({ id: entry.id, date: entry.createdAt, text: `${entry.actor || 'Administrator'} ${entry.action === 'listing-removed' ? `removed “${entry.title || 'a listing'}”` : entry.action?.replaceAll('-', ' ') || 'updated a listing'}` }))].sort((a, b) => new Date(b.date) - new Date(a.date)), [posts, auditLog])

  const handleRemove = (post) => {
    if (window.confirm(`Remove “${post.title}” from NourishBridge? This will remove it from the feed and the review queue.`)) removePost(post.id)
  }

  if (currentUser?.role !== 'admin') return (
    <main className="shell py-20 text-center">
      <ShieldCheck className="mx-auto text-clay" size={36} />
      <h1 className="mt-4 font-display text-3xl text-forest-deep">Administrator access required</h1>
      <p className="mt-2 text-sm text-ink/55">Sign in with the administrator account to review listings and receiver requests.</p>
      <button className="btn-primary mt-6" onClick={() => navigate('login')}>Go to sign in</button>
    </main>
  )

  const ReviewCard = ({ post, isClaim }) => (
    <article key={`${isClaim ? 'claim' : 'post'}-${post.id}`} className="rounded-2xl border border-forest/10 bg-white p-5 shadow-card">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <span className="text-[9px] font-extrabold uppercase tracking-widest text-clay">{isClaim ? 'Receiver request' : 'Donation listing'}</span>
          <h3 className="mt-1 font-display text-xl text-forest-deep">{post.title}</h3>
          <p className="mt-1 text-xs text-ink/55">{isClaim ? `Requested by ${post.claimedBy} · ${post.claimedEmail || 'No email on record'}` : `Posted by ${post.donorName} · ${post.donorEmail || 'No email on record'}`}</p>
        </div>
        <span className="inline-flex items-center gap-1 rounded-full bg-saffron-light px-3 py-1 text-[9px] font-bold text-clay"><Clock3 size={12} /> Awaiting review</span>
      </div>
      <p className="mt-3 text-sm leading-relaxed text-ink/60">{post.description || post.beneficiaryNote || 'No additional details provided.'}</p>
      <p className="mt-3 text-xs font-semibold text-forest/60">{post.quantity} · {post.location} · {post.expiresIn}</p>
      <div className="mt-4 flex gap-2">
        <button className="btn-primary px-4 py-2.5 text-xs" onClick={() => isClaim ? reviewClaim(post.id, 'approve') : reviewPost(post.id, 'approve')}><Check size={14} /> {isClaim ? 'Approve & close listing' : 'Approve listing'}</button>
        <button className="btn-secondary px-4 py-2.5 text-xs" onClick={() => isClaim ? reviewClaim(post.id, 'reject') : reviewPost(post.id, 'reject')}><X size={14} /> Reject</button>
      </div>
    </article>
  )

  return (
    <main className="shell py-10 lg:py-14">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div><span className="eyebrow"><ShieldCheck size={13} /> Admin console</span><h1 className="mt-4 font-display text-4xl text-forest-deep">Review the bridge.</h1><p className="mt-2 text-sm text-ink/55">Approve donations and receiver requests before they reach the community feed.</p></div>
        <div className="rounded-2xl border border-forest/10 bg-white px-4 py-3 text-xs font-bold text-forest"><Users className="mr-2 inline" size={15} />{accounts.length} registered accounts</div>
      </div>

      <section className="mt-9 grid gap-8 lg:grid-cols-2">
        <div><h2 className="mb-3 font-display text-2xl text-forest">Donation approvals <span className="text-base text-ink/40">({pendingPosts.length})</span></h2><div className="space-y-3">{pendingPosts.length ? pendingPosts.map((post) => <ReviewCard key={post.id} post={post} isClaim={false} />) : <p className="rounded-2xl border border-dashed border-forest/20 p-6 text-sm text-ink/45">No donations waiting for review.</p>}</div></div>
        <div><h2 className="mb-3 font-display text-2xl text-forest">Receiver requests <span className="text-base text-ink/40">({pendingClaims.length})</span></h2><div className="space-y-3">{pendingClaims.length ? pendingClaims.map((post) => <ReviewCard key={post.id} post={post} isClaim />) : <p className="rounded-2xl border border-dashed border-forest/20 p-6 text-sm text-ink/45">No receiver requests waiting for review.</p>}</div></div>
      </section>

      <section className="mt-10 grid gap-8 lg:grid-cols-[1fr_1.3fr]">
        <div><h2 className="mb-3 font-display text-2xl text-forest">People</h2><div className="overflow-hidden rounded-2xl border border-forest/10 bg-white">{accounts.length ? accounts.map((account) => <div key={account.id} className="flex flex-wrap items-center justify-between gap-3 border-b border-forest/10 p-4 last:border-0"><div><p className="font-bold text-forest">{account.profile.name}</p><p className="mt-1 text-xs text-ink/55">{account.profile.email} · {roleLabel(account.profile)}</p><p className="mt-1 text-[10px] text-ink/35">{account.profile.organizationOrArea} · {account.profile.phone || 'No phone number'} · Joined {dateLabel(account.createdAt)}</p>{account.revokedAt && <p className="mt-1 text-[10px] font-bold text-clay">Access suspended</p>}</div>{account.profile.role !== 'admin' && <button type="button" onClick={() => setAccountRevoked(account.id, !account.revokedAt)} className={`rounded-full border px-3 py-2 text-[10px] font-bold ${account.revokedAt ? 'border-moss/30 text-moss hover:bg-moss/5' : 'border-clay/25 text-clay hover:bg-clay/5'}`}>{account.revokedAt ? 'Restore access' : 'Revoke access'}</button>}</div>) : <p className="p-5 text-sm text-ink/45">No accounts registered yet.</p>}</div><p className="mt-2 text-[10px] text-ink/40">Passwords are never displayed.</p></div>
        <div><h2 className="mb-3 font-display text-2xl text-forest">Recent activity</h2><div className="max-h-[28rem] overflow-y-auto rounded-2xl border border-forest/10 bg-white">{activity.length ? activity.map((item) => <div key={item.id} className="flex justify-between gap-4 border-b border-forest/10 p-4 last:border-0"><p className="text-sm text-forest">{item.text}</p><time className="shrink-0 text-[10px] text-ink/40">{dateLabel(item.date)}</time></div>) : <p className="p-5 text-sm text-ink/45">Activity will appear as people use the site.</p>}</div></div>
      </section>

      <section className="mt-10">
        <h2 className="mb-3 font-display text-2xl text-forest">Manage listings</h2>
        <div className="overflow-hidden rounded-2xl border border-forest/10 bg-white">
          {posts.length ? posts.map((post) => <div key={post.id} className="flex flex-wrap items-center justify-between gap-3 border-b border-forest/10 p-4 last:border-0"><div><p className="font-bold text-forest">{post.title}</p><p className="mt-1 text-xs text-ink/50">{post.donorName} · {post.status} · {dateLabel(post.createdAt)}</p></div><button type="button" onClick={() => handleRemove(post)} className="rounded-full border border-clay/25 px-4 py-2 text-xs font-bold text-clay transition hover:bg-clay/5">Remove listing</button></div>) : <p className="p-5 text-sm text-ink/45">There are no listings to manage.</p>}
        </div>
      </section>
    </main>
  )
}
