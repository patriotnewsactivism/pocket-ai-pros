# 🚀 Complete Setup: Local + Production Environments

## Problem You're Experiencing

You're seeing this error in BOTH places:
```
[supabase] Supabase credentials are missing. Database features are disabled.
```

**Why:**
- 🏠 **Localhost**: No `.env` file exists (I just created one for you)
- 🌍 **buildmybot.app**: Vercel environment variables not set

**Solution:** Set up BOTH environments (takes 10 minutes total)

---

## Part 1: Local Development Setup (5 minutes)

### Step 1: Get Your Supabase Anon Key

1. **Go to Supabase Dashboard:**
   ```
   https://supabase.com/dashboard/project/mnklzzundmfwjnfaoqju/settings/api
   ```

2. **Copy the Anon Key:**
   - Look for section: **"Project API keys"**
   - Find the key labeled: **"anon" "public"**
   - Click the copy icon
   - It looks like: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (very long)

### Step 2: Update Your .env File

I created `.env` file for you. Now update it:

```bash
# Open the file in your editor
nano .env

# Or use any text editor
```

**Replace this line:**
```
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key-here
```

**With your actual key:**
```
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Save the file** (Ctrl+O, Enter, Ctrl+X for nano)

### Step 3: Restart Dev Server

```bash
# Stop current server if running (Ctrl+C)

# Start fresh
npm run dev
```

### Step 4: Verify Local Setup Works

1. Visit: http://localhost:8080 (or whatever port is shown)
2. Open DevTools (F12) → Console tab
3. **Should NOT see**: "Supabase credentials are missing"
4. Go to: http://localhost:8080/auth
5. Try signing up - should work!

**✅ Local development is now fixed!**

---

## Part 2: Production Setup (5 minutes)

Now fix buildmybot.app by setting Vercel environment variables.

### Step 1: Set Vercel Environment Variables

1. **Go to Vercel Dashboard:**
   ```
   https://vercel.com/dashboard
   ```

2. **Select your project** (buildmybot or pocket-ai-pros)

3. **Navigate to:** Settings → Environment Variables

4. **Add Variable #1:**
   ```
   Name: VITE_SUPABASE_URL
   Value: https://mnklzzundmfwjnfaoqju.supabase.co
   Environments: ✅ Production ✅ Preview ✅ Development
   ```
   Click **Save**

5. **Add Variable #2:**
   ```
   Name: VITE_SUPABASE_ANON_KEY
   Value: [Paste the same key from Step 1 above]
   Environments: ✅ Production ✅ Preview ✅ Development
   ```
   Click **Save**

**Screenshot of what it should look like:**
```
┌─────────────────────────────┬───────────────────────────────────────┬─────────────────────────┐
│ Name                        │ Value                                 │ Environments            │
├─────────────────────────────┼───────────────────────────────────────┼─────────────────────────┤
│ VITE_SUPABASE_URL          │ https://mnklzzundmfwjnfaoqju.sup...  │ Production Preview Dev  │
│ VITE_SUPABASE_ANON_KEY     │ eyJhbGciOiJIUzI1NiIsInR5cCI6Ikp...   │ Production Preview Dev  │
└─────────────────────────────┴───────────────────────────────────────┴─────────────────────────┘
```

### Step 2: Configure Supabase Redirect URLs

1. **Go to Supabase URL Configuration:**
   ```
   https://supabase.com/dashboard/project/mnklzzundmfwjnfaoqju/auth/url-configuration
   ```

2. **Set Site URL:**
   ```
   https://buildmybot.app
   ```

3. **Add Redirect URLs** (paste all of these, one per line):
   ```
   https://buildmybot.app/*
   https://buildmybot.app/dashboard
   https://buildmybot.app/auth
   http://localhost:8080/*
   http://localhost:8080/dashboard
   http://localhost:5173/*
   http://localhost:5173/dashboard
   ```

4. **Click Save**

### Step 3: Redeploy on Vercel

**Option A - Automatic (via git push):**
```bash
# Make any small change to trigger redeploy
git commit --allow-empty -m "Redeploy with environment variables"
git push
```

**Option B - Manual (via Vercel Dashboard):**
1. Go to: **Deployments** tab
2. Find latest deployment
3. Click three dots (⋮) → **Redeploy**
4. Wait for deployment to complete (~2 minutes)

### Step 4: Verify Production Works

1. **Visit:** https://buildmybot.app
2. **Open DevTools (F12)** → Console tab
3. **Should NOT see:** "Supabase credentials are missing"
4. **Go to:** https://buildmybot.app/auth
5. **Try signing up** - should work without errors!

**✅ Production is now fixed!**

---

## Verification Checklist

### Local Development (localhost:8080)
- [ ] `.env` file exists in project root
- [ ] `VITE_SUPABASE_ANON_KEY` is set (not placeholder)
- [ ] Dev server running without Supabase errors
- [ ] Can visit /auth page
- [ ] Can sign up successfully

### Production (buildmybot.app)
- [ ] `VITE_SUPABASE_URL` set in Vercel dashboard
- [ ] `VITE_SUPABASE_ANON_KEY` set in Vercel dashboard
- [ ] Both variables applied to all 3 environments
- [ ] Supabase redirect URLs include buildmybot.app
- [ ] Redeployed after setting env vars
- [ ] No Supabase errors in production console
- [ ] Can sign up on buildmybot.app

---

## Troubleshooting

### Still Seeing "Supabase credentials are missing"?

**On Localhost:**
```bash
# Check if .env file is loaded
cat .env | grep VITE_SUPABASE

# Should show:
# VITE_SUPABASE_URL=https://mnklzzundmfwjnfaoqju.supabase.co
# VITE_SUPABASE_ANON_KEY=eyJhbGci...

# Restart dev server
npm run dev
```

**On Production:**
1. Verify env vars in Vercel dashboard
2. Make sure you selected all 3 environments (Production, Preview, Development)
3. Redeploy after setting variables
4. Wait for deployment to finish before testing

### Other Console Errors (Can Ignore)

These are NOT your app's errors:
- ❌ `runtime.lastError: The message port closed` - Browser extension
- ❌ `YOUR_TAWK_WIDGET_ID: 400` - Chat widget placeholder (harmless)
- ❌ `extensionState.js: ERR_FILE_NOT_FOUND` - Browser extension

**Only worry about:**
- ✅ Supabase configuration errors
- ✅ Authentication errors
- ✅ API request failures

---

## Quick Command Reference

```bash
# Check if .env file exists
ls -la .env

# View .env contents
cat .env

# Start dev server
npm run dev

# Test build (what Vercel runs)
npm run build

# Preview production build locally
npm run preview
```

---

## Summary

**What I Fixed:**
- ✅ Created `.env` file for local development
- ✅ Configured with correct Supabase URL
- ✅ Added security headers to vercel.json

**What You Need to Do:**
1. ⏱️ **2 minutes**: Get Supabase anon key, update `.env` file
2. ⏱️ **3 minutes**: Set Vercel environment variables
3. ⏱️ **3 minutes**: Configure Supabase redirect URLs
4. ⏱️ **2 minutes**: Redeploy and test

**Total Time:** ~10 minutes to fix both environments

---

## Need Help?

If you're stuck:

1. **Share the exact error** you're seeing (screenshot or copy-paste)
2. **Tell me where** (localhost or buildmybot.app)
3. **Show me** what step you completed

I'll help you debug!

---

**Next File to Read:** `VERCEL_ENV_QUICK_SETUP.md` (copy-paste reference)
