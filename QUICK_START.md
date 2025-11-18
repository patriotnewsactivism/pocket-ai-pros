# Quick Start Guide - BuildMyBot

## 🚀 Get Started in 3 Steps

### Step 1: Install Dependencies (30 seconds)
```bash
npm install
```

### Step 2: Set Up Database (2 minutes)

1. **Open Supabase SQL Editor**
   - Go to: https://<your-project-ref>.supabase.co
   - Click "SQL Editor" in the left sidebar

2. **Create Tables**
   - Copy the entire contents of `supabase-setup.sql`
   - Paste into a new query
   - Click "Run" or press Ctrl+Enter

3. **Verify Setup**
   - Go to "Table Editor" in Supabase
   - You should see 6 tables: contacts, subscribers, reseller_applications, users, bots, messages

### Step 3: Start Development (10 seconds)
```bash
npm run dev
```

Open http://localhost:5173 in your browser.

---

## ✅ What to Test

### 1. Hero Section
- View statistics (pulled from database)
- Click "Start Building Free" → Contact form

### 2. Contact Form
- Fill out and submit
- Check the `contacts` table in Supabase to see your submission

### 3. Newsletter
- Scroll to the Newsletter section (bright gradient)
- Subscribe with your email
- Check the `subscribers` table in Supabase

### 4. Reseller Program
- Scroll to Reseller section
- Click "Apply for Reseller Program"
- Fill out and submit
- Check `reseller_applications` table in Supabase

### 5. Navigation
- Test all footer links
- Use section navigation (Features, Pricing, Reseller)
- Try mobile menu (resize browser)

---

## 🎨 Design Changes

### What's Different
- ❌ **Removed**: All purple colors and gradients
- ✅ **Added**: Professional blue/cyan color scheme
- ✅ **Added**: High-tech grid pattern background
- ✅ **Added**: 6 new major sections

### New Sections
1. **Trust Badges** - Security certifications
2. **Testimonials** - Customer reviews
3. **Use Cases** - 8 industry solutions
4. **Integrations** - 100+ platforms
5. **FAQ** - 10 common questions
6. **Newsletter** - Email subscription

---

## 🗄️ Database Tables

All tables are created automatically when you run `supabase-setup.sql`:

| Table | Purpose | Example Data |
|-------|---------|--------------|
| `contacts` | Contact form submissions | Name, email, message |
| `subscribers` | Newsletter sign-ups | Email, date subscribed |
| `reseller_applications` | Partner applications | Company, expected clients |
| `users` | User accounts | Name, email, plan |
| `bots` | AI bots (for stats) | Bot name, messages count |
| `messages` | Bot messages (for stats) | Message text, response |

---

## 🔧 Configuration

Your `.env` file is already configured with Supabase credentials:
```env
VITE_SUPABASE_URL=https://<your-project-ref>.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGci...
```

---

## 📊 Viewing Data

### Option 1: Supabase Dashboard
1. Go to https://<your-project-ref>.supabase.co
2. Click "Table Editor"
3. Select any table to view data

### Option 2: SQL Queries
1. Go to "SQL Editor"
2. Run queries like:
```sql
SELECT * FROM contacts ORDER BY created_at DESC;
SELECT * FROM subscribers WHERE status = 'active';
SELECT COUNT(*) FROM reseller_applications;
```

---

## 🚢 Deploy to Production

### Build
```bash
npm run build
```

### Deploy Options
- **Vercel**: `vercel deploy`
- **Netlify**: Drag `dist` folder
- **AWS/GCP**: Upload `dist` folder to S3/Cloud Storage

### Environment Variables
Make sure to set these in your deployment platform:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

---

## 🐛 Troubleshooting

### "Can't connect to database"
- Check `.env` file has correct Supabase URL and key
- Run `npm install @supabase/supabase-js`

### "Tables not found"
- Make sure you ran `supabase-setup.sql` in Supabase SQL Editor
- Check "Table Editor" in Supabase to verify tables exist

### "Form submission fails"
- Check browser console for errors
- Verify Row Level Security policies in Supabase
- Check API logs in Supabase Dashboard

### "Stats showing default values"
- This is normal if tables are empty
- Add sample data by running the INSERT statements at the end of `supabase-setup.sql`

---

## 📞 Support Files

- `DATABASE_SETUP.md` - Detailed database documentation
- `UPGRADE_COMPLETE.md` - Full list of all changes
- `supabase-setup.sql` - Database initialization script
- `.env` - Environment configuration (already set up)

---

## 🎉 You're All Set!

Your website now has:
- ✅ High-tech professional design (no purple!)
- ✅ Complete database integration
- ✅ All features fully functional
- ✅ Enhanced reseller program
- ✅ 6 new major sections
- ✅ Real-time statistics
- ✅ Production-ready

**Ready to launch!** 🚀
