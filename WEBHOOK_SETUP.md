# Webhook Setup Guide

This guide will help you get all webhooks up and running for your Pocket AI Pros application.

## Overview

Your application uses **Supabase Edge Functions** as the primary backend. The webhook system handles:
- ✅ Stripe payment events (checkout, subscriptions, invoices)
- ✅ User subscription updates
- ✅ Automatic plan upgrades/downgrades
- ✅ Payment status tracking

## Quick Start

### 1. Get Your Stripe API Keys

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/)
2. Navigate to **Developers** → **API keys**
3. Copy your keys:
   - **Publishable key** (starts with `pk_`)
   - **Secret key** (starts with `sk_`)

### 2. Create Webhook Endpoint in Stripe

1. In Stripe Dashboard, go to **Developers** → **Webhooks**
2. Click **Add endpoint**
3. Enter your webhook URL:
   ```
   https://<your-project-ref>.supabase.co/functions/v1/stripe-webhook
   ```
4. Select events to listen to:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
5. Click **Add endpoint**
6. Copy the **Signing secret** (starts with `whsec_`)

### 3. Configure Environment Variables

#### Frontend (.env file)
Update your `.env` file with:

```env
# Stripe Public Key
VITE_STRIPE_PUBLIC_KEY=pk_live_YOUR_KEY_HERE

# Or for testing
VITE_STRIPE_PUBLIC_KEY=pk_test_YOUR_KEY_HERE
```

#### Supabase Edge Functions (via Supabase Dashboard)

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project: `<your-project-ref>`
3. Navigate to **Project Settings** → **Edge Functions** → **Secrets**
4. Add these secrets:

```
STRIPE_SECRET_KEY=sk_live_YOUR_SECRET_KEY
STRIPE_WEBHOOK_SECRET=whsec_YOUR_WEBHOOK_SECRET
SUPABASE_URL=https://<your-project-ref>.supabase.co
SUPABASE_SERVICE_ROLE_KEY=YOUR_SERVICE_ROLE_KEY
```

**To get your Service Role Key:**
- In Supabase Dashboard: **Project Settings** → **API** → **Project API keys** → **service_role** (secret)

### 4. Deploy the Stripe Webhook Function

Deploy the webhook handler to Supabase:

```bash
# Install Supabase CLI if you haven't already
npm install -g supabase

# Login to Supabase
supabase login

# Link your project
supabase link --project-ref <your-project-ref>

# Deploy the webhook function
supabase functions deploy stripe-webhook
```

### 5. Update Stripe Price IDs

You need to create products and prices in Stripe Dashboard, then update the webhook handler with actual price IDs:

#### Create Products in Stripe:

1. Go to Stripe Dashboard → **Products**
2. Create 3 products:
   - **Basic** - $10/month - 1,000 messages/month
   - **Pro** - $25/month - 10,000 messages/month
   - **Enterprise** - $100/month - Unlimited messages

3. For each product, copy the **Price ID** (starts with `price_`)

#### Update the Webhook Handler:

Edit `/home/user/pocket-ai-pros/supabase/functions/stripe-webhook/index.ts` and replace the placeholder price IDs:

```typescript
// Line 69-78 and similar sections
if (priceId === 'price_YOUR_BASIC_PRICE_ID') {
  plan = 'basic';
  monthlyLimit = 1000;
} else if (priceId === 'price_YOUR_PRO_PRICE_ID') {
  plan = 'pro';
  monthlyLimit = 10000;
} else if (priceId === 'price_YOUR_ENTERPRISE_PRICE_ID') {
  plan = 'enterprise';
  monthlyLimit = -1;
}
```

Then redeploy:
```bash
supabase functions deploy stripe-webhook
```

### 6. Update Checkout Session Function

Also update `/home/user/pocket-ai-pros/supabase/functions/create-checkout-session/index.ts` with your real Stripe Price IDs:

```typescript
const priceIds: Record<string, string> = {
  basic: 'price_YOUR_BASIC_PRICE_ID',
  pro: 'price_YOUR_PRO_PRICE_ID',
  enterprise: 'price_YOUR_ENTERPRISE_PRICE_ID',
};
```

Redeploy:
```bash
supabase functions deploy create-checkout-session
```

## Testing

### Test in Development Mode

1. Use Stripe's test mode with test keys (`pk_test_...` and `sk_test_...`)
2. Use Stripe CLI to forward webhooks locally:

```bash
# Install Stripe CLI
brew install stripe/stripe-cli/stripe

# Login
stripe login

# Forward webhooks to your local Supabase function
stripe listen --forward-to https://<your-project-ref>.supabase.co/functions/v1/stripe-webhook
```

3. Test with Stripe test cards:
   - **Success:** 4242 4242 4242 4242
   - **Decline:** 4000 0000 0000 0002
   - Use any future expiry date and any 3-digit CVC

### Monitor Webhook Events

1. **Stripe Dashboard:** Developers → Webhooks → [Your endpoint] → Events
2. **Supabase Logs:** Edge Functions → stripe-webhook → Logs
3. Check database updates in Supabase → Table Editor → users

## Webhook Flow

Here's how the complete flow works:

```
1. User clicks "Upgrade to Pro" on your website
   ↓
2. Frontend calls create-checkout-session Edge Function
   ↓
3. Stripe Checkout Session created
   ↓
4. User redirected to Stripe Checkout page
   ↓
5. User enters payment details
   ↓
6. Stripe processes payment
   ↓
7. Stripe sends webhook event to stripe-webhook Edge Function
   ↓
8. Webhook verifies signature and processes event
   ↓
9. Database updated with:
   - User plan (basic/pro/enterprise)
   - Monthly limit (1000/10000/unlimited)
   - Stripe customer ID
   - Subscription ID
   - Subscription status
   - Current period end date
   ↓
10. User's account immediately reflects upgraded plan
```

## Troubleshooting

### Webhooks Not Working

1. **Check Stripe webhook logs:**
   - Go to Stripe Dashboard → Webhooks → [Your endpoint]
   - Click on a failed event to see the error

2. **Check Supabase logs:**
   ```bash
   supabase functions logs stripe-webhook
   ```

3. **Verify environment variables:**
   - Make sure all secrets are set in Supabase Dashboard
   - Check that keys are correct (no extra spaces)

4. **Test webhook signature:**
   - Use Stripe CLI to send test events:
   ```bash
   stripe trigger checkout.session.completed
   ```

### Common Issues

**"Webhook signature verification failed"**
- ✅ Check that `STRIPE_WEBHOOK_SECRET` is correct
- ✅ Make sure you're using the webhook secret from the correct endpoint
- ✅ Verify you're not accidentally using the Stripe secret key

**"Database not updating"**
- ✅ Check that `SUPABASE_SERVICE_ROLE_KEY` is set
- ✅ Verify the user exists in the database
- ✅ Check Supabase logs for database errors

**"Price ID not found"**
- ✅ Update the price ID mappings in both webhook and checkout functions
- ✅ Make sure you're using the correct Stripe Price IDs from your products

## Environment Variables Checklist

### Frontend (.env)
- [ ] `VITE_STRIPE_PUBLIC_KEY` - Stripe publishable key
- [ ] `VITE_SUPABASE_URL` - Already set ✅
- [ ] `VITE_SUPABASE_ANON_KEY` - Already set ✅

### Supabase Edge Functions (Dashboard Secrets)
- [ ] `STRIPE_SECRET_KEY` - Stripe secret key
- [ ] `STRIPE_WEBHOOK_SECRET` - Webhook signing secret
- [ ] `SUPABASE_URL` - Your Supabase project URL
- [ ] `SUPABASE_SERVICE_ROLE_KEY` - Service role key from Supabase

## Next Steps

After webhooks are working:

1. **Test the full flow:**
   - Create a test account
   - Attempt to upgrade to a paid plan
   - Verify the webhook fires and updates the database
   - Check that the user sees the upgraded plan

2. **Enable production mode:**
   - Switch from test keys to live keys
   - Update the webhook endpoint URL if needed
   - Test with a small real payment

3. **Set up monitoring:**
   - Monitor Stripe webhook events daily
   - Set up alerts for failed webhooks
   - Check Supabase logs regularly

4. **Optional enhancements:**
   - Add email notifications (SendGrid integration)
   - Add Slack notifications for new subscriptions
   - Implement webhook retry logic
   - Add analytics tracking

## Support

If you encounter issues:

1. Check Stripe Dashboard → Webhooks → Events for errors
2. Check Supabase Dashboard → Edge Functions → Logs
3. Use Stripe CLI to test events locally
4. Review this guide for missing steps

## Security Notes

- ✅ Never commit `.env` files to git
- ✅ Always verify webhook signatures
- ✅ Use service role key only in backend/edge functions
- ✅ Keep webhook secrets secure
- ✅ Use HTTPS for all webhook endpoints
- ✅ Monitor webhook logs for suspicious activity
