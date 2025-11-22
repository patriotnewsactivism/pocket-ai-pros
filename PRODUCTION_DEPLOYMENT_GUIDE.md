# Production Deployment Guide

Complete checklist for deploying BuildMyBot to production with enterprise-grade security and reliability.

## Pre-Deployment Checklist

### 1. Database Setup (REQUIRED)

Execute these SQL migrations in order via Lovable Cloud Dashboard:

```bash
# Open the Lovable Cloud Dashboard
# Navigate to: Database → SQL Editor
```

Run these files in order:
1. `supabase-setup.sql` - Core database schema
2. `supabase-migrations/001_rate_limiting.sql` - Rate limiting & security
3. `supabase-migrations/002_stripe_fields.sql` - Stripe integration fields

**Verify migrations:**
```sql
-- Check that all tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public';

-- Should include: users, bots, conversations, subscriptions, 
-- resellers, rate_limits, payments, subscription_events
```

### 2. Authentication Configuration (REQUIRED)

#### A. Configure Email Confirmation

1. Open Lovable Cloud Dashboard
2. Navigate to: Authentication → Email Templates
3. Enable "Confirm Email" for new signups
4. Customize email templates with your branding

#### B. Set Redirect URLs

The Site URL and Redirect URLs are auto-configured by Lovable Cloud. To update:

1. Open Lovable Cloud Dashboard
2. Go to: Authentication → URL Configuration
3. Set Site URL to your deployed domain (e.g., `https://buildmybot.app`)
4. Add redirect URLs:
   - Your production domain: `https://buildmybot.app/**`
   - Your preview URL (for testing)
   - Custom domains if applicable

### 3. Stripe Integration (REQUIRED FOR PAYMENTS)

#### A. Get Stripe API Keys

1. Go to https://dashboard.stripe.com/apikeys
2. Copy your **Live mode** keys:
   - Publishable key (starts with `pk_live_`)
   - Secret key (starts with `sk_live_`)

#### B. Create Products & Prices

1. Go to https://dashboard.stripe.com/products
2. Create products for each plan:
   - **Starter Plan**: $29/month
   - **Professional Plan**: $99/month
   - **Executive Plan**: $199/month
   - **Enterprise Plan**: $399/month

3. Copy each Price ID (format: `price_xxxxxxxxxxxxx`)

#### C. Configure Webhook

1. Go to https://dashboard.stripe.com/webhooks
2. Click "Add endpoint"
3. Set endpoint URL to:
   ```
   https://fjbwmpyfnhmndzkdsvfi.supabase.co/functions/v1/stripe-webhook
   ```
4. Select events to listen for:
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`

5. Copy the **Webhook Signing Secret** (starts with `whsec_`)

#### D. Add Stripe Secrets

Add these environment variables in your deployment:

```bash
VITE_STRIPE_PUBLIC_KEY=pk_live_xxxxxxxxxxxxx
STRIPE_SECRET_KEY=sk_live_xxxxxxxxxxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx

# Price IDs for each plan
STRIPE_PRICE_STARTER=price_xxxxxxxxxxxxx
STRIPE_PRICE_PROFESSIONAL=price_xxxxxxxxxxxxx
STRIPE_PRICE_EXECUTIVE=price_xxxxxxxxxxxxx
STRIPE_PRICE_ENTERPRISE=price_xxxxxxxxxxxxx
```

### 4. Email Configuration (REQUIRED FOR NOTIFICATIONS)

#### Option A: Resend (Recommended)

1. Sign up at https://resend.com
2. Verify your domain at https://resend.com/domains
3. Create API key at https://resend.com/api-keys
4. Add to environment variables:
   ```bash
   RESEND_API_KEY=re_xxxxxxxxxxxxx
   ```

#### Option B: SendGrid

1. Sign up at https://sendgrid.com
2. Create API key with full access
3. Verify sender identity
4. Add to environment variables:
   ```bash
   SENDGRID_API_KEY=SG.xxxxxxxxxxxxx
   ```

### 5. Error Tracking (HIGHLY RECOMMENDED)

#### Setup Sentry

1. Create account at https://sentry.io
2. Create new project (select React)
3. Copy your DSN
4. Add to environment variables:
   ```bash
   VITE_SENTRY_DSN=https://xxxxx@xxxxx.ingest.sentry.io/xxxxx
   ```

Sentry is already integrated and will automatically:
- Track errors in production
- Capture session replays
- Monitor performance
- Alert you to issues

### 6. Environment Variables Summary

**Frontend (.env for production):**
```bash
# Supabase (Auto-configured by Lovable Cloud)
VITE_SUPABASE_URL=https://fjbwmpyfnhmndzkdsvfi.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJI...

# Stripe
VITE_STRIPE_PUBLIC_KEY=pk_live_xxxxxxxxxxxxx

# Sentry (Optional but recommended)
VITE_SENTRY_DSN=https://xxxxx@xxxxx.ingest.sentry.io/xxxxx

# Business Type
VITE_BUSINESS_TYPE=support
```

**Backend (Supabase Secrets - via Lovable Cloud Dashboard):**
```bash
STRIPE_SECRET_KEY=sk_live_xxxxxxxxxxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx
STRIPE_PRICE_STARTER=price_xxxxxxxxxxxxx
STRIPE_PRICE_PROFESSIONAL=price_xxxxxxxxxxxxx
STRIPE_PRICE_EXECUTIVE=price_xxxxxxxxxxxxx
STRIPE_PRICE_ENTERPRISE=price_xxxxxxxxxxxxx
RESEND_API_KEY=re_xxxxxxxxxxxxx
LOVABLE_API_KEY=(Already configured)
```

## Testing Before Launch

### 1. Run Test Suite

```bash
npm test
```

Ensure all tests pass, especially:
- Authentication flows
- Password validation
- Dashboard loading

### 2. Manual Testing Checklist

**Authentication:**
- [ ] User can sign up with strong password
- [ ] Email confirmation works
- [ ] User can log in
- [ ] User can log out
- [ ] Session persists on refresh

**Bot Management:**
- [ ] User can create bot
- [ ] Bot limits enforced correctly
- [ ] User can chat with bot
- [ ] Conversation history saved
- [ ] Bot deletion works

**Payments (use Stripe test mode first):**
- [ ] Checkout flow works
- [ ] Webhook updates user subscription
- [ ] User sees updated limits
- [ ] Subscription cancellation works

**Reseller Program:**
- [ ] Application submission works
- [ ] Referral tracking works
- [ ] Commission calculation correct
- [ ] Dashboard shows referred clients

**Rate Limiting:**
- [ ] Contact form rate limited
- [ ] Newsletter signup rate limited
- [ ] Chat message rate limited

### 3. Load Testing

Use tools like Artillery or k6 to test:
- 100+ concurrent users
- Bot chat under load
- Database query performance

## Deployment

### Option 1: Deploy via Lovable (Recommended)

1. Click "Publish" button in Lovable
2. Review changes
3. Click "Update" to deploy
4. Test production URL

### Option 2: Custom Deployment

If deploying elsewhere:

1. Build the application:
   ```bash
   npm run build
   ```

2. Deploy `dist` folder to your hosting provider
3. Configure environment variables
4. Set up custom domain
5. Configure SSL certificate

## Post-Deployment

### 1. Monitor Application

- [ ] Check Sentry for errors
- [ ] Monitor Stripe webhook deliveries
- [ ] Review rate limit logs
- [ ] Check email delivery rates

### 2. Set Up Alerts

Configure alerts for:
- Error rate > 1%
- Failed webhook deliveries
- High rate limit violations
- Database connection issues

### 3. Performance Optimization

- [ ] Enable CDN for static assets
- [ ] Configure caching headers
- [ ] Optimize images
- [ ] Enable compression

### 4. Security Hardening

- [ ] Review RLS policies
- [ ] Audit API keys and secrets
- [ ] Enable 2FA for admin accounts
- [ ] Set up backup strategy
- [ ] Configure DDoS protection

## Support Infrastructure

### 1. Customer Support

- [ ] Set up help desk (Zendesk/Freshdesk)
- [ ] Configure live chat widget
- [ ] Create knowledge base articles
- [ ] Train support team

### 2. Status Page

Create public status page showing:
- API uptime
- Bot availability
- Scheduled maintenance

Recommended: https://www.statuspage.io

### 3. Documentation

Publish user guides for:
- Getting started
- Creating & training bots
- Managing subscriptions
- Reseller program
- API documentation

## Reseller Program Activation

### 1. Legal Documents

- [ ] Create Reseller Agreement
- [ ] Define commission structure
- [ ] Set payment terms
- [ ] Create terms of service

### 2. Marketing Materials

- [ ] Reseller logo kit
- [ ] Banner images
- [ ] Email templates
- [ ] Social media graphics

### 3. Commission Tracking

The system automatically:
- Tracks referred signups via referral codes
- Calculates commissions (40% default)
- Updates earnings in real-time

Manual setup required:
- [ ] Configure payout system
- [ ] Set payout schedule (monthly recommended)
- [ ] Define minimum payout threshold

## Monitoring Dashboards

Set up monitoring for:

**Technical Metrics:**
- Response time (target: <500ms)
- Error rate (target: <0.1%)
- Uptime (target: 99.9%)
- Database connections
- Edge function invocations

**Business Metrics:**
- New signups per day
- Subscription conversions
- Churn rate
- MRR (Monthly Recurring Revenue)
- Bot creation rate
- Reseller applications

## Troubleshooting

### Common Issues

**Authentication redirect errors:**
- Verify Site URL and Redirect URLs in Lovable Cloud Dashboard
- Check email confirmation is enabled
- Ensure CORS headers are configured

**Stripe webhook failures:**
- Verify webhook URL is correct
- Check signing secret matches
- Review event selection
- Check Supabase logs

**Rate limit blocks legitimate users:**
- Review rate limit thresholds in `001_rate_limiting.sql`
- Consider increasing limits for authenticated users
- Add CAPTCHA for additional protection

**Email delivery failures:**
- Verify domain is validated in Resend/SendGrid
- Check API key is correct
- Review sender reputation
- Monitor bounce rates

## Launch Marketing

Once deployed and tested:

1. [ ] Announce on Product Hunt
2. [ ] Post to Hacker News
3. [ ] Email existing waitlist
4. [ ] Social media campaign
5. [ ] Reach out to influencers
6. [ ] Submit to directories
7. [ ] Write launch blog post

## Success Criteria

Your application is production-ready when:

- ✅ All tests passing
- ✅ All migrations executed
- ✅ Stripe webhooks delivering
- ✅ Emails sending reliably
- ✅ Error tracking active
- ✅ Rate limiting functional
- ✅ 99%+ uptime for 48 hours
- ✅ Zero critical errors
- ✅ Load tested successfully

---

## Need Help?

- Lovable Docs: https://docs.lovable.dev
- Supabase Docs: https://supabase.com/docs
- Stripe Docs: https://stripe.com/docs
- Sentry Docs: https://docs.sentry.io

Good luck with your launch! 🚀
