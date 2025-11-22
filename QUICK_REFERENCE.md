# BuildMyBot.App - Quick Reference Guide

**One-page reference for common tasks and commands**

---

## 🚀 Quick Start (New Deploy)

```bash
# 1. Install dependencies
npm install

# 2. Create environment file
cp .env.example .env
# Edit .env with your credentials

# 3. Build & test locally
npm run build
npm run preview

# 4. Deploy Supabase
supabase link --project-ref YOUR_REF
supabase db push
supabase functions deploy create-checkout-session
supabase functions deploy stripe-webhook
supabase functions deploy generate-chat-response

# 5. Deploy frontend
vercel --prod
```

**Time: ~30 minutes**

---

## 📋 Environment Variables

### Frontend (.env)
```env
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJh...
VITE_STRIPE_PUBLIC_KEY=pk_live_...
VITE_API_BASE_URL=https://xxx.supabase.co/functions/v1
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_AI_CHATBOT=true
VITE_APP_ENV=production
```

### Edge Functions (Supabase Dashboard → Secrets)
```env
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJh...
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
OPENAI_API_KEY=sk-proj_...
SENDGRID_API_KEY=SG...
PUBLIC_SITE_URL=https://buildmybot.app
```

---

## 🛠️ Common Commands

### Development
```bash
npm run dev              # Start dev server (localhost:8080)
npm run build            # Production build
npm run preview          # Preview production build
npm run lint             # Run ESLint
npm test                 # Run tests
```

### Supabase
```bash
supabase login                    # Login once
supabase link --project-ref XXX   # Link to project
supabase db push                  # Push all migrations
supabase functions list           # List Edge Functions
supabase functions deploy NAME    # Deploy specific function
supabase functions serve NAME     # Test function locally
supabase functions logs NAME      # View function logs
```

### Vercel
```bash
vercel                   # Deploy preview
vercel --prod            # Deploy production
vercel logs              # View logs
vercel env pull          # Pull environment variables
```

### Git
```bash
git status               # Check changes
git add .                # Stage all
git commit -m "msg"      # Commit
git push                 # Push to remote
```

---

## 🗄️ Database Tables

| Table | Purpose | Key Fields |
|-------|---------|------------|
| **users** | User accounts | id, email, is_admin, plan |
| **bots** | User chatbots | id, user_id, name, configuration |
| **conversations** | Chat history | id, bot_id, messages |
| **subscriptions** | Paid plans | user_id, plan, status, stripe_subscription_id |
| **resellers** | Approved partners | user_id, commission_rate, total_earnings |
| **payouts** | Reseller payouts | reseller_id, amount, status |
| **reseller_applications** | Pending applications | email, status |
| **newsletter_subscribers** | Email list | email, status |
| **contact_submissions** | Contact form | name, email, message |

---

## 🔐 Row Level Security (RLS)

**All tables have RLS enabled!**

### Key Policies

```sql
-- Users can see own data
auth.uid() = user_id

-- Admins can see everything
is_user_admin() = true

-- Public submissions (no auth required)
true  -- For: reseller_applications, newsletter_subscribers, contact_submissions
```

### Check if user is admin
```sql
SELECT is_user_admin();  -- Returns true if current user is admin
```

### Make user an admin
```sql
UPDATE users SET is_admin = true WHERE email = 'admin@buildmybot.app';
```

---

## 💳 Stripe Configuration

### Create Products
1. Go to: https://dashboard.stripe.com/products
2. Create 3 products:
   - **Starter:** $29/month
   - **Professional:** $99/month
   - **Enterprise:** $299/month
3. Copy Price IDs (start with `price_`)

### Configure Webhook
1. Go to: https://dashboard.stripe.com/webhooks
2. Add endpoint: `https://YOUR-REF.supabase.co/functions/v1/stripe-webhook`
3. Events:
   - checkout.session.completed
   - customer.subscription.updated
   - customer.subscription.deleted
   - invoice.payment_succeeded
   - invoice.payment_failed
4. Copy webhook secret (`whsec_...`)

---

## 📧 Email Setup (SendGrid)

### 1. Verify Sender
```
https://app.sendgrid.com/settings/sender_auth
→ Verify Single Sender
→ Use: noreply@buildmybot.app
```

### 2. Get API Key
```
https://app.sendgrid.com/settings/api_keys
→ Create API Key
→ Full Access
→ Copy key (starts with SG.)
```

### 3. Test Email
```bash
curl --request POST \
  --url https://api.sendgrid.com/v3/mail/send \
  --header "Authorization: Bearer $SENDGRID_API_KEY" \
  --header 'Content-Type: application/json' \
  --data '{"personalizations":[{"to":[{"email":"test@example.com"}]}],"from":{"email":"noreply@buildmybot.app"},"subject":"Test","content":[{"type":"text/plain","value":"Test email from BuildMyBot"}]}'
```

---

## 🤖 AI Chatbot Setup

### Business Templates Available
1. **E-commerce** - Product recommendations, order tracking
2. **SaaS** - Feature demos, onboarding
3. **Real Estate** - Property search, appointments
4. **Healthcare** - Appointment booking, FAQs
5. **Education** - Course info, enrollment
6. **Hospitality** - Reservations, amenities
7. **Finance** - Account queries, products
8. **Support** - General customer service

### OpenAI API Key
```
https://platform.openai.com/api-keys
→ Create new secret key
→ Starts with: sk-proj_
→ Add to Edge Function secrets
```

### Usage Costs
- **GPT-4o-mini:** ~$0.002 per 1,000 tokens
- **Average conversation:** ~500 tokens = $0.001
- **1,000 conversations:** ~$1 in API costs

---

## 👥 Reseller Management

### Approve Reseller Application
```sql
-- 1. View pending applications
SELECT * FROM reseller_applications WHERE status = 'pending';

-- 2. Approve application
UPDATE reseller_applications
SET status = 'approved', reviewed_at = NOW()
WHERE id = 'application-id';

-- 3. Create reseller record
INSERT INTO resellers (user_id, commission_rate, status)
VALUES ('user-id', 20.00, 'active');
```

### Process Payout
```sql
-- 1. View pending payouts (as admin)
SELECT * FROM payouts WHERE status = 'pending';

-- 2. Approve payout
UPDATE payouts
SET status = 'approved',
    reviewed_at = NOW(),
    reviewed_by = auth.uid()
WHERE id = 'payout-id';

-- 3. Mark as paid
UPDATE payouts
SET status = 'paid',
    paid_at = NOW(),
    paid_by = auth.uid(),
    transaction_id = 'stripe-txn-id'
WHERE id = 'payout-id';
```

---

## 🔍 Debugging

### Check Logs

**Supabase Edge Functions:**
```
Dashboard → Edge Functions → function-name → Logs
```

**Vercel:**
```bash
vercel logs
# Or: Dashboard → Deployments → Click deployment → Logs
```

**Browser Console:**
```
F12 → Console tab
```

### Common Issues

| Issue | Quick Fix |
|-------|-----------|
| Build fails | `rm -rf node_modules && npm install` |
| Blank page | Check browser console for errors |
| API errors | Verify environment variables |
| RLS errors | Check if user is authenticated |
| 404 on routes | Add `vercel.json` with rewrites |

---

## 📊 Monitoring

### Key Metrics

**Daily:**
- [ ] Check Stripe dashboard for failed payments
- [ ] Review Supabase error logs
- [ ] Monitor user signups

**Weekly:**
- [ ] Review reseller payout requests
- [ ] Check email deliverability (SendGrid)
- [ ] Analyze user feedback

**Monthly:**
- [ ] Review pricing and plans
- [ ] Update business templates
- [ ] Check for dependency updates

### URLs to Bookmark

```
Supabase:    https://supabase.com/dashboard
Stripe:      https://dashboard.stripe.com
Vercel:      https://vercel.com/dashboard
OpenAI:      https://platform.openai.com
SendGrid:    https://app.sendgrid.com
Analytics:   https://analytics.google.com (if configured)
```

---

## 📈 Pricing & Plans

| Plan | Price | Conversations | Bots | Target |
|------|-------|--------------|------|--------|
| **Starter** | $29/mo | 60/mo | 1 | Small business |
| **Professional** | $99/mo | 300/mo | 3 | Growing teams |
| **Enterprise** | $299/mo | Unlimited | Unlimited | Large orgs |

**Reseller Commissions:**
- 0-10 clients: 20%
- 11-25 clients: 30%
- 26-50 clients: 40%
- 51+ clients: 50%

---

## 🚨 Emergency Procedures

### Site Down
1. Check Vercel status
2. Check Supabase status
3. Review recent deployments
4. Rollback if needed: `vercel rollback`

### Payment Issues
1. Check Stripe webhook logs
2. Verify webhook secret matches
3. Review Edge Function logs
4. Test webhook manually

### Database Issues
1. Check Supabase dashboard for alerts
2. Review slow queries
3. Check if indexes exist
4. Contact Supabase support if needed

---

## 📞 Support Contacts

**Technical Issues:**
- Email: support@buildmybot.app
- Response: <24 hours

**Reseller Support:**
- Email: partners@buildmybot.app
- Response: <4 hours

**External Services:**
- Supabase: https://supabase.com/support
- Stripe: https://support.stripe.com
- Vercel: https://vercel.com/support

---

## 📚 Documentation Index

| Document | Purpose |
|----------|---------|
| **README.md** | Project overview |
| **PRODUCTION_DEPLOYMENT_GUIDE_COMPLETE.md** | Full deployment guide |
| **PRODUCTION_READY_SUMMARY.md** | Readiness checklist |
| **RESELLER_ONBOARDING_GUIDE.md** | Partner program |
| **BUSINESS_PROPOSAL_TEMPLATE.md** | Sales template |
| **EMAIL_TEMPLATES.md** | Customer communications |
| **TROUBLESHOOTING_GUIDE.md** | Fix common issues |
| **QUICK_REFERENCE.md** | This file |

---

## ✅ Pre-Launch Checklist

```
Infrastructure:
[ ] Supabase project created
[ ] Database migrations pushed
[ ] Edge Functions deployed
[ ] Stripe products created
[ ] Webhook configured
[ ] SendGrid verified
[ ] OpenAI API key set

Deployment:
[ ] Frontend built successfully
[ ] Deployed to Vercel
[ ] Custom domain configured
[ ] SSL certificate active
[ ] Environment variables set

Testing:
[ ] User can sign up
[ ] Can create chatbot
[ ] Payment flow works
[ ] Reseller application works
[ ] Admin can log in
[ ] All pages accessible

Go Live:
[ ] Switch Stripe to live mode
[ ] Update all live API keys
[ ] Monitor first 24 hours
[ ] Announce launch
```

---

## 🎯 First Day Operations

**Hour 1:**
- Monitor error logs
- Test signup flow
- Verify emails sending

**Hours 2-8:**
- Respond to support emails
- Monitor Stripe dashboard
- Check for payment issues

**Hours 9-24:**
- Review analytics
- Process any reseller applications
- Address any bug reports

---

**Keep this guide handy!** 📌

Bookmark: https://buildmybot.app/docs

---

BuildMyBot.App | support@buildmybot.app
