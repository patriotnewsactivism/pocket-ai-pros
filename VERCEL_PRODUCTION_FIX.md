# 🔧 Vercel Production Deployment Fix - Supabase Authentication

## Problem Summary

**Issue**: buildmybot.app shows Supabase errors when trying to login
**Root Cause**: Missing production configuration for Supabase authentication

Your app builds correctly (Vercel runs `npm run build` → `vite build`), but the **production environment isn't configured** to connect to Supabase.

---

## Solution: 3-Step Fix

### Step 1: Configure Vercel Environment Variables (CRITICAL)

Your Vite app needs these environment variables to connect to Supabase in production.

**Action Required:**

1. Go to: https://vercel.com/dashboard
2. Select your project (buildmybot)
3. Navigate to: **Settings → Environment Variables**
4. Add the following variables:

| Variable Name | Value | Environment |
|--------------|-------|-------------|
| `VITE_SUPABASE_URL` | `https://mnklzzundmfwjnfaoqju.supabase.co` | Production, Preview, Development |
| `VITE_SUPABASE_ANON_KEY` | (Your anon key from Supabase) | Production, Preview, Development |

**To get your Supabase Anon Key:**
1. Go to: https://supabase.com/dashboard/project/mnklzzundmfwjnfaoqju/settings/api
2. Copy the value under **"Project API keys" → "anon" → "public"**

**Important Notes:**
- ✅ Use `VITE_` prefix (required for Vite to expose them to the browser)
- ✅ Select all three environments (Production, Preview, Development)
- ❌ Do NOT use `NEXT_PUBLIC_` prefix (this is a Vite app, not Next.js)
- ❌ Do NOT use `SUPABASE_SERVICE_ROLE_KEY` in Vercel (that's for Edge Functions only)

After adding these, **redeploy your application** for changes to take effect.

---

### Step 2: Configure Supabase Redirect URLs (CRITICAL)

Supabase validates all redirect URLs for security. Your production domain must be whitelisted.

**Action Required:**

1. Go to: https://supabase.com/dashboard/project/mnklzzundmfwjnfaoqju/auth/url-configuration
2. **Set Site URL** to: `https://buildmybot.app`
3. **Add Redirect URLs** (one per line):
   ```
   https://buildmybot.app/*
   https://buildmybot.app/dashboard
   https://buildmybot.app/auth
   http://localhost:5173/*
   http://localhost:5173/dashboard
   ```

4. Click **Save**

**Why this matters:**
- Your Auth.tsx file uses: `emailRedirectTo: ${window.location.origin}/dashboard`
- In production, this becomes: `https://buildmybot.app/dashboard`
- If not whitelisted, Supabase will reject the redirect with an error

---

### Step 3: Verify Supabase Email Provider Settings

Ensure email authentication is properly configured.

**Action Required:**

1. Go to: https://supabase.com/dashboard/project/mnklzzundmfwjnfaoqju/auth/providers
2. Find **"Email"** provider
3. Verify settings:
   - ✅ **Email provider**: Toggle should be **ON**
   - ⚙️ **Confirm email**:
     - For testing: Turn **OFF** (allows instant login without email confirmation)
     - For production: Turn **ON** (requires email verification, more secure)
   - ✅ **Secure email change**: Turn **ON**

**Recommendation for Testing:**
- Temporarily disable "Confirm email" to test if authentication works
- Once confirmed working, re-enable it and set up proper SMTP (see Step 4 below)

---

### Step 4: (Optional) Configure Production Email Delivery

If you enable "Confirm email", users need to receive verification emails.

**Problem**: Supabase's default email service often goes to spam or doesn't deliver

**Solution**: Configure custom SMTP

**Option A: Resend (Recommended - Easiest)**
1. Sign up at https://resend.com (free tier: 3,000 emails/month)
2. Verify your domain
3. Get API key
4. Go to: https://supabase.com/dashboard/project/mnklzzundmfwjnfaoqju/auth/templates
5. Click "Enable Custom SMTP"
6. Use Resend's SMTP settings

**Option B: SendGrid**
1. Sign up at https://sendgrid.com
2. Create API key with Mail Send permissions
3. Configure in Supabase SMTP settings

---

## Testing the Fix

After completing Steps 1-3:

### 1. Redeploy on Vercel

```bash
# Trigger a new deployment
git commit --allow-empty -m "Trigger Vercel redeploy with env vars"
git push origin claude/fix-vercel-dev-server-01KjVQk3c5oX7Mzp6cMTR64D
```

Or manually redeploy from Vercel dashboard:
1. Go to: https://vercel.com/dashboard
2. Select your project
3. Click **"Deployments"** tab
4. Click **"Redeploy"** on the latest deployment

### 2. Test Authentication Flow

1. Visit: https://buildmybot.app/auth
2. Try to sign up with a new account
3. Expected behavior:
   - **If "Confirm email" is OFF**: Immediately redirects to dashboard
   - **If "Confirm email" is ON**: Shows "Check your email" message

### 3. Debug If Still Failing

**Check Browser Console:**
1. Open DevTools (F12)
2. Go to Console tab
3. Look for errors mentioning:
   - "Supabase is not configured"
   - "VITE_SUPABASE_URL"
   - "redirect"

**Check Environment Variables in Production:**
1. Add temporary debug logging to verify env vars are loaded
2. Check: https://buildmybot.app
3. Open DevTools Console
4. You should see the Supabase client initialized (not the "disabled" proxy)

---

## Why This Happened

### Understanding Vite Environment Variables

Vite **only exposes environment variables with the `VITE_` prefix** to the browser:

```typescript
// src/config/env.ts - This code looks for VITE_ prefixed vars
const getEnvValue = (metaEnv: BuildMyBotMetaEnv, keys: readonly string[]) => {
  for (const key of keys) {
    const metaValue = metaEnv?.[key];  // import.meta.env.VITE_SUPABASE_URL
    if (typeof metaValue === 'string' && metaValue.trim()) {
      return { value: metaValue.trim(), source: key };
    }
  }
  return { value: '', source: null };
};
```

**In Development:**
- You have a `.env` file with `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
- Vite reads this file and injects the values into `import.meta.env`
- Authentication works perfectly

**In Production (Vercel):**
- The `.env` file is NOT committed to git (and shouldn't be)
- Vercel doesn't have access to your local `.env` file
- Without setting environment variables in Vercel dashboard, `import.meta.env.VITE_SUPABASE_URL` is `undefined`
- The Supabase client enters "disabled" mode and throws errors

### How Vercel Deploys Your App

```bash
# Vercel deployment process:
1. git clone your repository
2. npm install
3. npm run build  # This runs: vite build
4. Serve the built files from /dist folder
```

**This is correct behavior!** Vercel should NOT run a dev server (`npm run dev`) in production. The `vite build` command:
- Bundles your React app
- Optimizes for production
- Injects environment variables at build time
- Outputs static files to `/dist` folder

---

## Verification Checklist

Before marking this as complete:

- [ ] **Vercel Environment Variables Set**
  - [ ] `VITE_SUPABASE_URL` = `https://mnklzzundmfwjnfaoqju.supabase.co`
  - [ ] `VITE_SUPABASE_ANON_KEY` = (your anon key)
  - [ ] Applied to: Production, Preview, Development

- [ ] **Supabase Redirect URLs Configured**
  - [ ] Site URL = `https://buildmybot.app`
  - [ ] Redirect URLs include: `https://buildmybot.app/*`
  - [ ] Redirect URLs include: `https://buildmybot.app/dashboard`

- [ ] **Supabase Email Provider**
  - [ ] Email provider toggle: **ON**
  - [ ] Confirm email: **OFF** (for testing) or **ON** with SMTP configured

- [ ] **Deployment**
  - [ ] Redeployed on Vercel after setting env vars
  - [ ] New deployment shows as successful

- [ ] **Testing**
  - [ ] Can visit https://buildmybot.app/auth
  - [ ] Can create new account
  - [ ] No Supabase errors in browser console
  - [ ] Successfully redirects to dashboard after login

---

## Additional Resources

- **Vite Environment Variables**: https://vitejs.dev/guide/env-and-mode.html
- **Vercel Environment Variables**: https://vercel.com/docs/environment-variables
- **Supabase Auth Configuration**: Your detailed guide is in `SUPABASE_AUTH_SETUP.md`
- **Deployment Guide**: See `PRODUCTION_DEPLOYMENT_GUIDE.md`

---

## Quick Reference: Environment Variables by Platform

| Platform | Where to Set | Format | Purpose |
|----------|-------------|--------|---------|
| **Local Development** | `.env` file | `VITE_SUPABASE_URL=https://...` | Development testing |
| **Vercel (Production)** | Dashboard → Settings → Environment Variables | Key: `VITE_SUPABASE_URL`<br>Value: `https://...` | Production deployment |
| **Supabase Edge Functions** | Supabase Dashboard → Edge Functions → Secrets | Key: `SUPABASE_SERVICE_ROLE_KEY`<br>Value: `eyJ...` | Server-side functions |

**Important**: Never use `VITE_` prefix for the service role key - it would expose admin access to browsers!

---

## Need Help?

If you're still seeing errors after completing these steps:

1. **Check Vercel Deployment Logs**:
   - Vercel Dashboard → Deployments → Click latest deployment → View Function Logs

2. **Check Browser Console**:
   - Visit https://buildmybot.app
   - Open DevTools (F12) → Console tab
   - Look for red error messages

3. **Verify Environment Variables Loaded**:
   - Add this temporarily to `src/main.tsx`:
     ```typescript
     console.log('Supabase URL:', import.meta.env.VITE_SUPABASE_URL);
     console.log('Has Anon Key:', !!import.meta.env.VITE_SUPABASE_ANON_KEY);
     ```
   - Commit, push, redeploy
   - Check console - should show your Supabase URL and `true` for has key

---

**Status**: Ready to implement
**Priority**: Critical - Production authentication is broken
**Estimated Time**: 15 minutes
