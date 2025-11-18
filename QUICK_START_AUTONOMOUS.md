# ⚡ Quick Start - Autonomous Setup

Get your AI chatbot business running in **under 10 minutes**!

---

## 🚀 Step 1: Choose Your Business Type (30 seconds)

```bash
./autonomous-setup.sh [business-type]
```

| Business Type | Best For |
|--------------|----------|
| `ecommerce` | Online stores, retail shops |
| `saas` | Software companies, web apps |
| `realestate` | Real estate agencies, brokers |
| `healthcare` | Clinics, medical practices |
| `education` | Schools, online courses |
| `hospitality` | Hotels, restaurants, travel |
| `finance` | Banks, financial services |
| `support` | General customer support |

**Example:**
```bash
# For an online store
./autonomous-setup.sh ecommerce
```

---

## 🔑 Step 2: Get API Keys (5 minutes)

### Required (for full functionality):

**OpenAI** - AI chatbot responses
```
1. Visit: https://platform.openai.com
2. Click "API Keys" → "Create new secret key"
3. Copy key starting with "sk-"
4. Cost: ~$5 for ~2,500 conversations
```

**Stripe** - Accept payments
```
1. Visit: https://dashboard.stripe.com
2. Get your keys from "Developers" → "API keys"
3. Free to setup, 2.9% per transaction
```

**SendGrid** - Email automation
```
1. Visit: https://app.sendgrid.com
2. Settings → API Keys → Create API Key
3. Free tier: 100 emails/day
```

### Optional (but recommended):

**Google Analytics** - Track visitors
```
1. Visit: https://analytics.google.com
2. Create property → Get Measurement ID
3. Completely free
```

### Add to `.env` file:
```env
OPENAI_API_KEY=sk-...
VITE_STRIPE_PUBLIC_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...
SENDGRID_API_KEY=SG.xxx...
VITE_GOOGLE_ANALYTICS_ID=G-...
```

---

## 🗄️ Step 3: Setup Database (2 minutes)

```bash
# 1. Open Supabase
https://<your-project-ref>.supabase.co

# 2. Go to SQL Editor

# 3. Copy & paste this file:
supabase-setup.sql

# 4. Click "Run"
```

**That's it!** All tables are created automatically.

---

## 🧪 Step 4: Test Locally (2 minutes)

```bash
# Start dev server
npm run dev

# Visit: http://localhost:8080
```

### Test Checklist:
- [ ] Chat widget appears in bottom-right
- [ ] Chatbot responds to messages
- [ ] Contact form submits
- [ ] Newsletter signup works
- [ ] Page looks good on mobile

---

## 🌐 Step 5: Deploy (1 minute)

### Option A: Automatic (Recommended)
```bash
./deploy-autonomous.sh ecommerce production
```

### Option B: Manual
```bash
# Build
npm run build

# Upload 'dist' folder to:
# - Vercel (recommended)
# - Netlify
# - AWS S3
# - Your hosting
```

---

## ✅ You're Done!

Your AI chatbot business is now **LIVE** and ready to:

✅ Capture leads 24/7  
✅ Answer customer questions  
✅ Process contact forms  
✅ Accept newsletter signups  
✅ Generate revenue  

---

## 🎯 What You Get

### AI Chatbot
- Responds instantly to visitors
- Industry-specific knowledge
- Captures email addresses
- Routes to human agents when needed

### Lead Capture
- All conversations stored in database
- Email collection automated
- Contact forms integrated
- Newsletter system ready

### Business Features
- Professional landing page
- Pricing page with Stripe
- Legal pages (Terms, Privacy, Refund)
- Mobile-responsive design
- SEO optimized

### Analytics
- Track all visitor interactions
- Monitor chatbot performance
- Conversion tracking
- Real-time statistics

---

## 💡 Pro Tips

### Tip 1: Start Without OpenAI
The chatbot works without an API key! It uses a built-in knowledge base. Add OpenAI later for smarter responses.

### Tip 2: Free Tier Everything
- Vercel: Free hosting
- Supabase: Free database
- SendGrid: 100 emails/day free
- Start with $0 monthly costs!

### Tip 3: Test Thoroughly
Before launching:
1. Test on mobile
2. Try the chatbot
3. Submit a contact form
4. Check email notifications
5. Test payment flow

### Tip 4: Customize Later
Launch fast with defaults, then customize:
- Colors and branding
- Chatbot responses
- Pricing tiers
- Feature descriptions

---

## 🆘 Need Help?

### Common Issues

**Chatbot not showing?**
```env
# Check .env file has:
VITE_ENABLE_AI_CHATBOT=true
```

**Database errors?**
```
Run supabase-setup.sql in Supabase SQL Editor
```

**Build fails?**
```bash
rm -rf node_modules
npm install
npm run build
```

### Get Support
- Email: support@buildmybot.ai
- Full Guide: `AUTONOMOUS_SETUP_GUIDE.md`
- Business Guide: `BUSINESS_READY.md`

---

## 📊 Expected Timeline

| Task | Time |
|------|------|
| Run setup script | 2 min |
| Get API keys | 5 min |
| Setup database | 2 min |
| Test locally | 2 min |
| Deploy | 1 min |
| **TOTAL** | **12 min** |

---

## 🎉 Success Checklist

After deployment, you should have:

- [ ] Live website with your business template
- [ ] Working AI chatbot in bottom-right corner
- [ ] Contact form that saves to database
- [ ] Newsletter signup that captures emails
- [ ] All data flowing to Supabase
- [ ] Analytics tracking visitors
- [ ] Ready to accept payments (if Stripe configured)
- [ ] Email notifications (if SendGrid configured)

---

## 💰 Start Making Money

### Day 1: Launch
- Share on social media
- Email your network
- Post in relevant communities

### Week 1: Traffic
- Run Google Ads ($10/day)
- Post on ProductHunt
- Reach out to potential customers

### Month 1: Revenue
- Target: 10-20 customers
- Expected: $500-2,000/mo
- Focus: Customer feedback

### Month 3: Scale
- Target: 50-100 customers
- Expected: $3,000-10,000/mo
- Focus: Automation and growth

---

## 🚀 Ready to Launch?

```bash
# One command to rule them all:
./autonomous-setup.sh ecommerce

# Then deploy:
./deploy-autonomous.sh ecommerce production

# That's it! 🎉
```

---

**Your business is ready in 10 minutes. Start now!** ⚡

*For detailed documentation, see: `AUTONOMOUS_SETUP_GUIDE.md`*
