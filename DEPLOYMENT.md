# Publish NourishBridge on Netlify with shared accounts and listings

Netlify serves the React site. Supabase supplies shared login, the database, approval actions, revocation, and realtime listing updates. Do not deploy until the Supabase setup is complete: without its environment values the app deliberately stays in local browser mode.

## 1. Create the shared Supabase project

1. Create a Supabase account and a new project on the Free plan.
2. Open **SQL Editor** in the project dashboard.
3. Run the complete contents of [`supabase/schema.sql`](supabase/schema.sql). This creates the profiles, listings, and admin activity tables; row-level security; and the guarded review functions.
4. In **Authentication → Sign In / Providers → Email**, enable email/password sign-in. For a judge event where you need instant registration, you can temporarily turn off **Confirm email**. Turn it back on for a public launch and configure SMTP so confirmation emails reliably reach users.

## 2. Create the administrator account

1. In **Authentication → Users**, create the administrator user with `superadmin@admin.in` and the password you chose.
2. The database trigger creates a normal profile. In SQL Editor, promote that exact account:

   ```sql
   update public.profiles
   set role = 'admin', sub_role = null
   where email = 'superadmin@admin.in';
   ```

3. Confirm that exactly one row was changed. The admin role is set in the database only; public sign-up cannot assign it. Sign in through the usual account page, then open **Admin Console**.

## 3. Add Supabase values to Netlify

1. Push this project to a GitHub repository you control.
2. In Netlify, choose **Add new site → Import an existing project** and connect that repository.
3. Set the build command to `npm run build` and publish directory to `dist` (also configured in [`netlify.toml`](netlify.toml)).
4. In the Netlify site’s **Environment variables**, add:
   - `VITE_SUPABASE_URL`: the Project URL from Supabase **Project Settings → API**.
   - `VITE_SUPABASE_ANON_KEY`: the Supabase **publishable** key (or legacy `anon` key) from that page.
5. Trigger a new production deploy after adding the variables. Vite embeds these public values into the browser bundle, so the key must be the publishable/anon key protected by the SQL policies.

Never put a Supabase `service_role` key, database password, or admin password in a `VITE_` variable, source file, or GitHub repository.

## 4. Set the Supabase site URL

After Netlify gives you the site address, open Supabase **Authentication → URL Configuration**:

- Set **Site URL** to the production Netlify URL, for example `https://your-site.netlify.app`.
- Add that exact URL to **Redirect URLs**. If you use Netlify deploy previews, add the matching preview pattern as well; Supabase documents patterns such as `https://**--your-site-name.netlify.app/**`.
- If you use email confirmation, test a complete confirmation link from the deployed site.

## 5. Test the judges’ flow

Use separate browser profiles or devices so you can test separate sessions:

1. Create a donor account with a WhatsApp number and post a donation. It should appear in the donor’s pending-review notice, not the available feed.
2. Sign in as admin in your browser and approve the donation.
3. Create a receiver or distributor account in the second browser. The approved donation should appear there. Submit a claim.
4. Approve the receiver request from the admin console. It moves to the approved/closed state; the donor and receiver should each see a WhatsApp button addressed to the other person with the food and pickup details prefilled.
5. Test rejecting a donation and a claim, removing a listing, revoking a user, and restoring access.

The WhatsApp button opens a draft; the person must press **Send**. It does not automatically send a WhatsApp message. For the judge flow, confirm both accounts include international-format phone numbers.

## Free-plan notes

Netlify currently includes 300 usage credits per month on Free, and production deploys consume credits; if the monthly hard limit is reached, the site can pause until the next cycle. Supabase Free includes shared Postgres/Auth and is enough for a small judging event, but low-activity projects may pause after a week. Check both dashboards before presenting and open the Supabase project / make a test request if it has been idle.

References: [Netlify Vite deployment](https://docs.netlify.com/build/frameworks/framework-setup-guides/vite/), [Netlify Free plan usage](https://docs.netlify.com/manage/accounts-and-billing/billing/billing-for-credit-based-plans/credit-based-pricing-plans/), [Supabase React Auth quickstart](https://supabase.com/docs/guides/auth/quickstarts/react), [Supabase redirect URLs](https://supabase.com/docs/guides/auth/redirect-urls), [Supabase free-project pausing](https://supabase.com/docs/guides/platform/free-project-pausing).
