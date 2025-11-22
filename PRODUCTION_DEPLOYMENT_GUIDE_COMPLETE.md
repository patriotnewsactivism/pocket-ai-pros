# BuildMyBot.App - Complete Production Deployment Guide

**Last Updated:** November 21, 2025
**Status:** Production Ready ✅
**Version:** 1.0.0

---

## 🎯 Quick Start Summary

BuildMyBot.App is **fully ready for production deployment** for businesses and resellers. This guide will take you from zero to deployed in under 30 minutes.

### What's Included
✅ Complete frontend with React/TypeScript
✅ Supabase backend with Edge Functions
✅ Stripe payment integration
✅ Reseller management system with payouts
✅ Admin dashboard for oversight
✅ AI chatbot functionality with GPT-4o-mini
✅ Legal pages (Privacy, Terms, Refund)
✅ Comprehensive database schema with RLS

---

## 📋 Pre-Deployment Checklist

### Required Services Setup
- [ ] **Supabase Account** - https://supabase.com (Free tier available)
- [ ] **Stripe Account** - https://stripe.com (For payments)
- [ ] **SendGrid Account** - https://sendgrid.com (For emails, free tier)
- [ ] **OpenAI API Key** - https://platform.openai.com (For AI chatbot)
- [ ] **Domain Name** - buildmybot.app (or your custom domain)
- [ ] **Vercel Account** - https://vercel.com (Free deployment)

---

## 🚀 Part 1: Supabase Backend Setup (15 minutes)

### Step 1: Create Supabase Project

1. Go to https://supabase.com/dashboard
2. Click **"New Project"**
3. Fill in:
   - **Name:** BuildMyBot Production
   - **Database Password:** (Save this securely!)
   - **Region:** Choose closest to your users
4. Click **"Create new project"**
5. Wait 2-3 minutes for provisioning

### Step 2: Get Supabase Credentials

1. In your project dashboard, go to **Settings → API**
2. Copy these values:
   ```
   Project URL: https://[your-project-ref].supabase.co
   anon/public key: eyJh... (starts with eyJh)
   service_role key: eyJh... (keep this SECRET!)
   ```

### Step 3: Run Database Migrations

1. Install Supabase CLI:
   ```bash
   npm install -g supabase
   ```

2. Link your project:
   ```bash
   supabase login
   supabase link --project-ref [your-project-ref]
   ```

3. Push all migrations:
   ```bash
   supabase db push
   ```

4. Verify migrations:
   - Go to Supabase Dashboard → Database → Tables
   - You should see: users, bots, conversations, subscriptions, resellers, payouts, etc.

### Step 4: Deploy Edge Functions

1. Set required secrets:
   ```bash
   # Navigate to Supabase Dashboard → Edge Functions → Secrets
   # Add these environment variables:

   SUPABASE_URL=https://[your-project-ref].supabase.co
   SUPABASE_SERVICE_ROLE_KEY=[your-service-role-key]
   STRIPE_SECRET_KEY=[your-stripe-secret-key]
   STRIPE_WEBHOOK_SECRET=[your-stripe-webhook-secret]
   OPENAI_API_KEY=[your-openai-api-key]
   PUBLIC_SITE_URL=https://buildmybot.app
   ```

2. Deploy functions:
   ```bash
   supabase functions deploy create-checkout-session
   supabase functions deploy stripe-webhook
   supabase functions deploy generate-chat-response
   supabase functions deploy process-reseller-application
   supabase functions deploy bot-chat
   supabase functions deploy check-subscription
   ```

### Step 5: Create First Admin User

1. Go to Supabase Dashboard → Authentication → Users
2. Click **"Add user"** → **"Create new user"**
3. Enter your email and password
4. Copy the User ID (UUID)
5. Go to **SQL Editor** and run:
   ```sql
   -- Insert user record
   INSERT INTO users (id, email, full_name, is_admin, plan, status)
   VALUES
   ('[your-user-id]', 'admin@buildmybot.app', 'Admin User', true, 'enterprise', 'active')
   ON CONFLICT (id) DO UPDATE
   SET is_admin = true;
   ```

---

## 💳 Part 2: Stripe Payment Setup (10 minutes)

### Step 1: Create Stripe Products

1. Go to https://dashboard.stripe.com/products
2. Create three products:

**Starter Plan**
- Name: BuildMyBot Starter
- Price: $29/month (monthly billing)
- Description: Perfect for small businesses
- Metadata: `plan_slug=starter`

**Professional Plan**
- Name: BuildMyBot Professional
- Price: $99/month
- Description: For growing businesses
- Metadata: `plan_slug=professional`

**Enterprise Plan**
- Name: BuildMyBot Enterprise
- Price: $299/month
- Description: For large organizations
- Metadata: `plan_slug=enterprise`

3. Copy each **Price ID** (starts with `price_`)

### Step 2: Configure Webhooks

1. Go to https://dashboard.stripe.com/webhooks
2. Click **"Add endpoint"**
3. Enter endpoint URL:
   ```
   https://[your-project-ref].supabase.co/functions/v1/stripe-webhook
   ```
4. Select events:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
5. Click **"Add endpoint"**
6. Copy the **Signing secret** (starts with `whsec_`)

### Step 3: Update Environment Variables

Add to your `.env` file:
```env
VITE_STRIPE_PUBLIC_KEY=pk_live_[your-key]
STRIPE_SECRET_KEY=sk_live_[your-key]
STRIPE_WEBHOOK_SECRET=whsec_[your-secret]
```

Also update in Supabase Edge Function secrets (Dashboard → Edge Functions → Secrets)

---

## 📧 Part 3: Email Configuration (5 minutes)

### Using SendGrid (Recommended)

1. Go to https://app.sendgrid.com
2. Navigate to **Settings → API Keys**
3. Click **"Create API Key"**
4. Choose **"Full Access"**
5. Copy the API key

6. Verify sender email:
   - Go to **Settings → Sender Authentication**
   - Click **"Verify a Single Sender"**
   - Enter `noreply@buildmybot.app` (or your domain)
   - Complete verification

7. Add to `.env`:
   ```env
   SENDGRID_API_KEY=SG.[your-key]
   FROM_EMAIL=noreply@buildmybot.app
   SUPPORT_EMAIL=support@buildmybot.app
   ADMIN_EMAIL=admin@buildmybot.app
   ```

---

## 🌐 Part 4: Frontend Deployment to Vercel (10 minutes)

### Step 1: Prepare Environment Variables

Create a `.env.production` file:
```env
# Supabase
VITE_SUPABASE_URL=https://[your-project-ref].supabase.co
VITE_SUPABASE_ANON_KEY=[your-anon-key]

# Stripe
VITE_STRIPE_PUBLIC_KEY=pk_live_[your-key]

# API
VITE_API_BASE_URL=https://[your-project-ref].supabase.co/functions/v1

# Features
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_AI_CHATBOT=true
VITE_BUSINESS_TYPE=support

# Google Analytics (optional)
VITE_GOOGLE_ANALYTICS_ID=G-XXXXXXXXXX

# Environment
VITE_APP_ENV=production
```

### Step 2: Deploy to Vercel

1. Install Vercel CLI:
   ```bash
   npm install -g vercel
   ```

2. Build locally to test:
   ```bash
   npm run build
   npm run preview
   ```

3. Deploy to Vercel:
   ```bash
   vercel --prod
   ```

4. Follow prompts:
   - Link to existing project? **No**
   - Project name: **buildmybot**
   - Directory: **.**
   - Framework: **Vite**

### Step 3: Configure Vercel Environment Variables

1. Go to https://vercel.com/dashboard
2. Select your project
3. Go to **Settings → Environment Variables**
4. Add all variables from `.env.production`
5. Click **"Save"**

### Step 4: Set Up Custom Domain

1. In Vercel Dashboard → **Settings → Domains**
2. Add your domain: `buildmybot.app`
3. Follow DNS configuration instructions
4. Wait for SSL certificate (automatic)

---

## 🔐 Part 5: Security & Final Configuration

### Enable Security Features

1. **CORS Configuration**
   - Update Supabase Edge Functions CORS to only allow your domain
   - Update in each function's `index.ts`:
     ```typescript
     const corsHeaders = {
       "Access-Control-Allow-Origin": "https://buildmybot.app",
       "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
     };
     ```

2. **Stripe Webhook Security**
   - Verify webhook signatures in `stripe-webhook` function
   - Already implemented ✅

3. **Rate Limiting**
   - Supabase has built-in rate limiting
   - Configure in Dashboard → Settings → API

### Update Legal Pages

All legal pages already use correct BuildMyBot branding ✅
- Privacy Policy: `/privacy`
- Terms of Service: `/terms`
- Refund Policy: `/refund`

### Configure Email Templates

Email templates are in `backend-example/email-templates.js`. These are used by Edge Functions for:
- Welcome emails
- Password reset
- Payment confirmations
- Reseller approvals

---

## 👥 Part 6: Reseller Program Setup

### Configure Reseller Commission Rates

Default is 20%. To adjust:

```sql
-- Update default commission rate for new resellers
UPDATE resellers SET commission_rate = 30.00 WHERE commission_rate = 20.00;

-- Or set for specific reseller
UPDATE resellers
SET commission_rate = 50.00
WHERE user_id = '[reseller-user-id]';
```

### Approve Reseller Applications

1. Log in as admin at `https://buildmybot.app/admin`
2. Go to **Reseller Applications**
3. Review and approve/reject applications
4. Approved resellers get automatic access to reseller dashboard

### Process Payout Requests

1. Resellers request payouts at `/reseller-dashboard`
2. Admin reviews at `/admin`
3. Approve → Mark as Paid → Enter transaction ID

---

## 📊 Part 7: Testing & Verification

### Test User Flow
1. ✅ Sign up at `/auth`
2. ✅ Create a bot at `/dashboard`
3. ✅ Test chatbot widget
4. ✅ Subscribe to a plan
5. ✅ Verify Stripe payment

### Test Reseller Flow
1. ✅ Apply at reseller section
2. ✅ Approve as admin
3. ✅ Sign in to reseller dashboard
4. ✅ Request payout
5. ✅ Admin approves payout

### Test Edge Functions
```bash
# Test chatbot response
curl -X POST https://[your-ref].supabase.co/functions/v1/bot-chat \
  -H "Content-Type: application/json" \
  -d '{"botId":"test","message":"Hello"}'

# Test subscription check
curl https://[your-ref].supabase.co/functions/v1/check-subscription \
  -H "Authorization: Bearer [user-token]"
```

---

## 🎯 Part 8: Go Live Checklist

### Pre-Launch
- [ ] All environment variables set correctly
- [ ] Database migrations applied
- [ ] Edge functions deployed
- [ ] Stripe products created and configured
- [ ] Webhook endpoints tested
- [ ] Email sending verified
- [ ] Domain DNS configured
- [ ] SSL certificate active
- [ ] Admin account created
- [ ] Test transactions completed

### Launch Day
- [ ] Set Stripe to live mode (remove test keys)
- [ ] Update all Stripe keys in env variables
- [ ] Verify all legal pages are accessible
- [ ] Test signup → payment flow end-to-end
- [ ] Monitor error logs in Supabase
- [ ] Set up monitoring alerts

### Post-Launch
- [ ] Monitor Stripe dashboard for payments
- [ ] Check Supabase database growth
- [ ] Review error logs daily (first week)
- [ ] Process reseller applications
- [ ] Respond to support emails
- [ ] Track analytics in Google Analytics

---

## 🛠️ Maintenance & Monitoring

### Daily Tasks
- Check Stripe dashboard for failed payments
- Review reseller payout requests
- Monitor error logs in Supabase

### Weekly Tasks
- Review user growth metrics
- Process pending reseller applications
- Update business templates if needed
- Check email deliverability rates

### Monthly Tasks
- Review and optimize database performance
- Update dependencies (`npm update`)
- Review and update pricing if needed
- Analyze user feedback

---

## 🚨 Troubleshooting

### Common Issues

**Issue: Payment not processing**
- Verify Stripe webhook is receiving events
- Check webhook secret matches
- Review Edge Function logs

**Issue: Emails not sending**
- Verify SendGrid API key is correct
- Check sender email is verified
- Review SendGrid activity log

**Issue: Database connection errors**
- Verify Supabase URL and keys
- Check RLS policies aren't blocking
- Review Edge Function environment variables

**Issue: Chatbot not responding**
- Verify OpenAI API key is set
- Check Edge Function `generate-chat-response` logs
- Ensure user has active subscription

---

## 📞 Support Resources

### Documentation
- Supabase Docs: https://supabase.com/docs
- Stripe Docs: https://stripe.com/docs
- Vercel Docs: https://vercel.com/docs
- React Query: https://tanstack.com/query

### Community
- GitHub Issues: [Your repo]
- Discord: [Your server]
- Email: support@buildmybot.app

---

## 🎉 Success Metrics

Your platform is production-ready when:
✅ Users can sign up and create bots
✅ Payments process successfully
✅ Chatbots respond to messages
✅ Resellers can apply and get approved
✅ Payouts can be requested and processed
✅ Admin can manage all operations
✅ All legal pages are accessible
✅ Email notifications work
✅ Zero critical errors in logs

---

## 📈 Scaling Considerations

### When to Upgrade

**Supabase:** Free tier → Pro ($25/mo)
- Database size > 500MB
- API requests > 500k/month
- Need point-in-time recovery

**Vercel:** Hobby → Pro ($20/mo)
- Custom domain analytics
- Team collaboration
- Advanced deployment features

**Stripe:** Standard rates
- No monthly fee
- 2.9% + $0.30 per transaction
- Enterprise pricing available for volume

---

## 🔒 Security Best Practices

1. **Never commit secrets** - Always use environment variables
2. **Enable 2FA** - On Stripe, Supabase, Vercel accounts
3. **Regular backups** - Supabase auto-backups daily (Pro plan)
4. **Monitor logs** - Check for suspicious activity
5. **Update dependencies** - Run `npm audit` monthly
6. **SSL only** - HTTPS everywhere (Vercel handles this)
7. **RLS enabled** - All tables have Row Level Security ✅

---

## 📝 License & Legal

- Copyright © 2025 BuildMyBot.App
- All rights reserved
- Legal pages included and up-to-date ✅

---

**You're ready to launch! 🚀**

Questions? Email: admin@buildmybot.app
