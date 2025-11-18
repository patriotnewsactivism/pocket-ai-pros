# 🚀 Deployment Checklist for buildmybot.app

## Critical: Follow These Steps in Order

### ✅ Step 1: Verify Vercel Environment Variables

1. **Go to Vercel Dashboard**
   - Navigate to: https://vercel.com/dashboard
   - Select your project: `buildmybot` or `pocket-ai-pros`

2. **Set Environment Variables**
   - Go to: Settings → Environment Variables
   - Add/Update these variables for **ALL THREE ENVIRONMENTS**:
     - ✓ Production
     - ✓ Preview
     - ✓ Development

   **Variables to Set:**
   ```
   VITE_SUPABASE_URL
   Value: https://mnklzzundmfwjnfaoqju.supabase.co

   VITE_SUPABASE_ANON_KEY
   Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1ua2x6enVuZG1md2puZmFvcWp1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMyOTMxNzAsImV4cCI6MjA3ODg2OTE3MH0._8NrrFTvjF1VmDWFubLOXc4jJ1SC_AM_Z3vkSiuUYnI
   ```

3. **Confirm Settings**
   - Ensure both variables show for all 3 environments
   - Click "Save" if you made changes

### ✅ Step 2: Redeploy Application

**Option A: Via Vercel Dashboard**
1. Go to: Deployments tab
2. Find the latest deployment
3. Click the three dots (⋮) menu
4. Select "Redeploy"
5. **IMPORTANT**: Uncheck "Use existing Build Cache"
6. Click "Redeploy"

**Option B: Via Git Push** (Automated - already done)
```bash
git push origin main
```
Vercel will auto-deploy within 1-2 minutes.

### ✅ Step 3: Verify Deployment

1. **Check Deployment Logs**
   - Go to: Vercel Dashboard → Deployments
   - Click on the latest deployment
   - Ensure it shows "Ready" status (not "Error" or "Failed")
   - Check build logs for any errors

2. **Test Diagnostic Page**
   - Visit: https://buildmybot.app/env-check
   - You should see:
     - ✅ VITE_SUPABASE_URL is set
     - ✅ VITE_SUPABASE_ANON_KEY is set
     - ✅ Supabase is configured
     - ✅ Supabase client working
     - ✅ Network connectivity OK

3. **Check Browser Console**
   - Open: https://buildmybot.app
   - Press F12 → Console tab
   - Look for these logs:
     ```
     [Supabase Client] Initializing...
     [Supabase Validation] ✓ URL is valid: mnklzzundmfwjnfaoqju.supabase.co
     [Supabase Validation] ✓ Anon key is valid JWT format
     [Supabase Client] Configuration valid: true
     [Supabase Client] ✓ Real Supabase client created successfully
     ```

   - **If you see errors**, proceed to Step 4.

### ✅ Step 4: Test Authentication

1. **Go to Auth Page**
   - Visit: https://buildmybot.app/auth

2. **Test Sign Up**
   - Enter a test email (use temp email like mailinator.com)
   - Fill in name and password
   - Click "Create Account"
   - Should NOT see "Failed to execute 'fetch' on 'Window'" error
   - Should see either:
     - "Check your email" (if email confirmation enabled), OR
     - "Account created! Redirecting..." (if confirmation disabled)

3. **Check Console for Auth Logs**
   ```
   [Auth] Sign up attempt started
   [Auth] Calling supabase.auth.signUp...
   [Auth] Sign up response received: { hasData: true, hasError: false }
   ```

### ✅ Step 5: Configure Supabase (If Not Already Done)

1. **Go to Supabase Dashboard**
   - Visit: https://supabase.com/dashboard/project/mnklzzundmfwjnfaoqju

2. **Check Project Status**
   - Ensure project is NOT paused
   - If paused, click "Resume Project"

3. **Configure Redirect URLs**
   - Go to: Authentication → URL Configuration
   - **Site URL:** `https://buildmybot.app`
   - **Redirect URLs:** Add these:
     ```
     https://buildmybot.app/*
     https://buildmybot.app/dashboard
     https://buildmybot.app/auth
     http://localhost:5173/*
     ```

4. **Enable Email Provider**
   - Go to: Authentication → Providers
   - Ensure "Email" is enabled
   - Configure email settings if needed

## 🔍 Troubleshooting

### Problem: Environment variables not showing in /env-check

**Solution:**
1. Double-check they're set in Vercel (Settings → Environment Variables)
2. Make sure you set them for **Production** environment
3. Redeploy with cache cleared
4. Wait 2-3 minutes for deployment to complete

### Problem: Still seeing "Failed to execute 'fetch' on 'Window'"

**Solution:**
1. Check browser console for detailed error
2. Look for "[Supabase Client] ⚠️ Supabase client is DISABLED"
3. If disabled, env vars are not properly set
4. Follow Step 1 again, ensuring exact variable names (case-sensitive)

### Problem: "Supabase is not configured" warning

**Causes:**
- Environment variables not set in Vercel
- Typo in variable names (must be exactly `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`)
- Variables set but deployment didn't pick them up (need to redeploy)

**Solution:**
1. Go to /env-check page
2. Read the troubleshooting section
3. Follow the specific guidance provided

### Problem: Network connectivity test fails

**Causes:**
- Supabase project is paused
- Invalid Supabase URL or key
- CORS configuration issue

**Solution:**
1. Check Supabase project is active (not paused)
2. Verify URL matches exactly: `https://mnklzzundmfwjnfaoqju.supabase.co`
3. Verify anon key is correct (starts with `eyJhbGciOiJIUzI1NiIs...`)

## 📊 What Was Fixed

### Changes in This Deployment:

1. **Enhanced Supabase Client Validation** (`src/integrations/supabase/client.ts`)
   - Proper JWT validation for anon key
   - Strict hostname validation
   - Try-catch protection around client creation
   - Comprehensive logging for debugging
   - Fallback to disabled client on errors

2. **Better Error Handling** (`src/pages/Auth.tsx`)
   - Detailed console logging
   - User-friendly error messages
   - Network error detection
   - Stack trace logging

3. **Runtime Environment Fallback** (`src/config/env.ts`)
   - Checks window.__ENV__ if import.meta.env fails
   - Helps with Vite build issues

4. **Environment Injection** (`index.html`)
   - Injects env vars into window object at runtime
   - Ensures availability even if build doesn't inject them

5. **Diagnostic Tool** (`src/pages/EnvCheck.tsx`)
   - Route: /env-check
   - Tests all configuration aspects
   - Provides specific troubleshooting guidance

## ✨ Success Indicators

You'll know everything is working when:

1. ✅ /env-check shows all green checkmarks
2. ✅ Browser console shows successful Supabase client creation
3. ✅ /auth page loads without errors
4. ✅ Sign up/Sign in works without fetch errors
5. ✅ No red errors in browser console
6. ✅ Users can create accounts and log in successfully

## 🆘 Still Having Issues?

If auth still doesn't work after following all steps:

1. **Check /env-check** - It will tell you exactly what's wrong
2. **Check browser console** - Look for detailed error logs
3. **Check Vercel deployment logs** - Ensure build succeeded
4. **Verify Supabase project** - Ensure it's active and not paused
5. **Try incognito window** - Rules out cache/cookie issues

## 📝 Quick Commands Reference

```bash
# Build locally to test
npm run build

# Check git status
git status

# Push to trigger deployment
git push origin main

# Check environment variables (local)
cat .env | grep VITE_SUPABASE
```

## 🎯 Final Notes

- Environment variables are **case-sensitive**
- You **must** redeploy after changing env vars in Vercel
- Setting env vars does NOT auto-redeploy
- The `/env-check` page is your best friend for debugging
- All logs are prefixed with `[Supabase Client]`, `[Auth]`, or `[ENV]` for easy filtering

---

**Last Updated:** November 17, 2024
**Deployment Status:** Ready for production
**Build Status:** ✅ Passing
