# Webhook Setup Checklist

Use this checklist to ensure all webhook components are properly configured.

## Prerequisites

- [ ] Stripe account created
- [ ] Supabase project set up (ID: `fjbwmpyfnhmndzkdsvfi`)
- [ ] Supabase CLI installed (`npm install -g supabase`)
- [ ] Logged in to Supabase (`supabase login`)

## Step 1: Stripe Setup

### Get API Keys
- [ ] Login to [Stripe Dashboard](https://dashboard.stripe.com/)
- [ ] Navigate to **Developers** → **API keys**
- [ ] Copy **Publishable key** (starts with `pk_test_` or `pk_live_`)
- [ ] Copy **Secret key** (starts with `sk_test_` or `sk_live_`)

### Verify Products & Prices
- [ ] Navigate to **Products** in Stripe Dashboard
- [ ] Verify these prices exist:
  - [ ] `price_1SRAf8EgFdyBUl5uXyxhzFuc` (Starter - $10/month)
  - [ ] `price_1SRAfFEgFdyBUl5ubXElJPkQ` (Professional - $25/month)
  - [ ] `price_1SRAfGEgFdyBUl5uT9uiuSSH` (Executive - $50/month)
  - [ ] `price_1SRAfHEgFdyBUl5u2wjqK7td` (Enterprise - $100/month)

### Create Webhook Endpoint
- [ ] Navigate to **Developers** → **Webhooks**
- [ ] Click **Add endpoint**
- [ ] Enter webhook URL:
  ```
  https://iobjmdcxhinnumxzbmnc.supabase.co/functions/v1/stripe-webhook
  ```
- [ ] Select events:
  - [ ] `checkout.session.completed`
  - [ ] `customer.subscription.created`
  - [ ] `customer.subscription.updated`
  - [ ] `customer.subscription.deleted`
  - [ ] `invoice.payment_succeeded`
  - [ ] `invoice.payment_failed`
- [ ] Click **Add endpoint**
- [ ] Copy **Signing secret** (starts with `whsec_`)

## Step 2: Environment Variables

### Frontend (.env)
- [ ] Open `/home/user/pocket-ai-pros/.env`
- [ ] Update `VITE_STRIPE_PUBLIC_KEY`:
  ```env
  VITE_STRIPE_PUBLIC_KEY=pk_test_YOUR_KEY_HERE
  ```
- [ ] Save file

### Supabase Secrets (Dashboard)
- [ ] Go to [Supabase Dashboard](https://supabase.com/dashboard)
- [ ] Select project: `fjbwmpyfnhmndzkdsvfi`
- [ ] Navigate to **Project Settings** → **Edge Functions** → **Secrets**
- [ ] Add these secrets:

#### STRIPE_SECRET_KEY
- [ ] Click **Add secret**
- [ ] Name: `STRIPE_SECRET_KEY`
- [ ] Value: `sk_test_YOUR_SECRET_KEY` (or `sk_live_...`)
- [ ] Save

#### STRIPE_WEBHOOK_SECRET
- [ ] Click **Add secret**
- [ ] Name: `STRIPE_WEBHOOK_SECRET`
- [ ] Value: `whsec_YOUR_WEBHOOK_SECRET`
- [ ] Save

#### SUPABASE_URL
- [ ] Click **Add secret**
- [ ] Name: `SUPABASE_URL`
- [ ] Value: `https://fjbwmpyfnhmndzkdsvfi.supabase.co`
- [ ] Save

#### SUPABASE_SERVICE_ROLE_KEY
- [ ] Navigate to **Project Settings** → **API**
- [ ] Copy **service_role** key (under "Project API keys")
- [ ] Go back to **Edge Functions** → **Secrets**
- [ ] Click **Add secret**
- [ ] Name: `SUPABASE_SERVICE_ROLE_KEY`
- [ ] Value: `[paste service role key]`
- [ ] Save

## Step 3: Deploy Webhook Function

- [ ] Open terminal in project directory
- [ ] Make deployment script executable:
  ```bash
  chmod +x deploy-webhooks.sh
  ```
- [ ] Run deployment script:
  ```bash
  ./deploy-webhooks.sh
  ```
- [ ] Verify deployment succeeded (should see "✅ Deployment complete!")

**Alternative: Manual deployment**
```bash
supabase link --project-ref fjbwmpyfnhmndzkdsvfi
supabase functions deploy stripe-webhook --no-verify-jwt
```

## Step 4: Verify Database Schema

- [ ] Open Supabase Dashboard → **Table Editor** → **users** table
- [ ] Verify these columns exist:
  - [ ] `id` (uuid, primary key)
  - [ ] `email` (text)
  - [ ] `plan` (text)
  - [ ] `bots_limit` (integer)
  - [ ] `conversations_limit` (integer)
  - [ ] `stripe_customer_id` (text)
  - [ ] `stripe_subscription_id` (text)
  - [ ] `subscription_status` (text)
  - [ ] `current_period_end` (timestamp)

**If columns are missing**, run this SQL in **SQL Editor**:
```sql
ALTER TABLE users ADD COLUMN IF NOT EXISTS plan text DEFAULT 'free';
ALTER TABLE users ADD COLUMN IF NOT EXISTS bots_limit integer DEFAULT 1;
ALTER TABLE users ADD COLUMN IF NOT EXISTS conversations_limit integer DEFAULT 100;
ALTER TABLE users ADD COLUMN IF NOT EXISTS stripe_customer_id text;
ALTER TABLE users ADD COLUMN IF NOT EXISTS stripe_subscription_id text;
ALTER TABLE users ADD COLUMN IF NOT EXISTS subscription_status text;
ALTER TABLE users ADD COLUMN IF NOT EXISTS current_period_end timestamp with time zone;
```

## Step 5: Testing

### Test with Stripe CLI (Recommended)

- [ ] Install Stripe CLI:
  ```bash
  brew install stripe/stripe-cli/stripe
  # or
  npm install -g stripe
  ```

- [ ] Login to Stripe:
  ```bash
  stripe login
  ```

- [ ] Forward webhooks to your endpoint:
  ```bash
  stripe listen --forward-to https://iobjmdcxhinnumxzbmnc.supabase.co/functions/v1/stripe-webhook
  ```

- [ ] In another terminal, trigger a test event:
  ```bash
  stripe trigger checkout.session.completed
  ```

- [ ] Check Supabase logs:
  - [ ] Go to Supabase Dashboard → **Edge Functions** → **stripe-webhook** → **Logs**
  - [ ] Verify event was received and processed

### Test with Real Payment (Careful!)

- [ ] Create a test user account on your website
- [ ] Navigate to pricing page
- [ ] Click "Upgrade" on a plan
- [ ] Use Stripe test card: `4242 4242 4242 4242`
- [ ] Complete checkout
- [ ] Verify:
  - [ ] Checkout succeeded
  - [ ] Webhook received event
  - [ ] User plan updated in database
  - [ ] User sees upgraded plan in dashboard

## Step 6: Monitor & Verify

### Stripe Dashboard
- [ ] Navigate to **Developers** → **Webhooks**
- [ ] Click on your webhook endpoint
- [ ] Check **Recent events** - should show successful deliveries (200 status)
- [ ] If any failures (4xx/5xx), click to view error details

### Supabase Logs
- [ ] Go to **Edge Functions** → **stripe-webhook** → **Logs**
- [ ] Look for log entries like:
  ```
  Processing webhook event: checkout.session.completed
  Successfully updated user subscription for: [user-id]
  ```
- [ ] Check for any errors in red

### Database
- [ ] Go to **Table Editor** → **users**
- [ ] Find a test user
- [ ] Verify fields are populated:
  - [ ] `plan` shows correct plan (starter/professional/etc.)
  - [ ] `bots_limit` shows correct limit
  - [ ] `conversations_limit` shows correct limit
  - [ ] `stripe_customer_id` is populated
  - [ ] `stripe_subscription_id` is populated
  - [ ] `subscription_status` is "active"
  - [ ] `current_period_end` has a future date

## Step 7: Go Live

When ready to switch from test mode to production:

- [ ] Get Stripe **live** API keys from Stripe Dashboard
- [ ] Update `.env` with live publishable key:
  ```env
  VITE_STRIPE_PUBLIC_KEY=pk_live_YOUR_LIVE_KEY
  ```
- [ ] Update Supabase secrets with live keys:
  - [ ] `STRIPE_SECRET_KEY` = `sk_live_...`
  - [ ] Create new webhook endpoint in Stripe for live mode
  - [ ] Update `STRIPE_WEBHOOK_SECRET` with new live webhook secret
- [ ] Test with a small real payment
- [ ] Verify money appears in Stripe balance
- [ ] Verify webhook fires and updates database

## Troubleshooting

### Webhook signature verification failed
- [ ] Check `STRIPE_WEBHOOK_SECRET` is correct
- [ ] Verify you're using the secret from the correct webhook endpoint
- [ ] Ensure not using the Stripe secret key by mistake

### Database not updating
- [ ] Verify `SUPABASE_SERVICE_ROLE_KEY` is set correctly
- [ ] Check user exists in database
- [ ] Review Supabase function logs for errors
- [ ] Verify column names match (run SQL schema check)

### Webhook not receiving events
- [ ] Check webhook URL is correct in Stripe Dashboard
- [ ] Verify webhook function is deployed
- [ ] Test with Stripe CLI forwarding
- [ ] Check Stripe webhook endpoint shows recent attempts

### Payment succeeds but plan doesn't update
- [ ] Verify webhook events are enabled for the endpoint
- [ ] Check webhook function logs for processing errors
- [ ] Ensure price IDs in code match Stripe product price IDs
- [ ] Verify `client_reference_id` is being set in checkout session

## Success Criteria

Your webhooks are fully working when:

- [ ] ✅ User can complete checkout successfully
- [ ] ✅ Webhook fires automatically after payment
- [ ] ✅ User's plan is updated in database immediately
- [ ] ✅ User sees upgraded plan in their dashboard
- [ ] ✅ No errors in Stripe webhook logs
- [ ] ✅ No errors in Supabase function logs
- [ ] ✅ Subscription renewals work automatically
- [ ] ✅ Subscription cancellations downgrade users correctly

## Support Resources

- **Stripe Webhook Docs:** https://stripe.com/docs/webhooks
- **Stripe Test Cards:** https://stripe.com/docs/testing
- **Supabase Edge Functions:** https://supabase.com/docs/guides/functions
- **Stripe CLI:** https://stripe.com/docs/stripe-cli

---

**Last Updated:** 2025-11-08
**Project Branch:** `claude/webhook-setup-011CUw3nGeEx9Hq9y5b3HELM`
