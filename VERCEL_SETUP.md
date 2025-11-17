# Vercel Deployment - Environment Variables Setup

## The Problem

Your production site at **buildmybot.app** is showing Supabase auth errors because the environment variables are not configured in Vercel.

The `.env` file is gitignored (for security), so it doesn't get deployed to Vercel. You need to manually add the environment variables in Vercel's dashboard.

---

## Quick Fix - Add Environment Variables to Vercel

### Step 1: Access Vercel Dashboard

1. Go to: https://vercel.com/dashboard
2. Find your project: **pocket-ai-pros** or **buildmybot**
3. Click on the project

### Step 2: Navigate to Environment Variables

1. Click on **Settings** tab
2. Click on **Environment Variables** in the left sidebar

### Step 3: Add These Environment Variables

Add the following variables **ONE BY ONE**:

#### Required Variables (Supabase):

| Name | Value |
|------|-------|
| `VITE_SUPABASE_URL` | `https://mnklzzundmfwjnfaoqju.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1ua2x6enVuZG1md2puZmFvcWp1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzE4NzgwMDcsImV4cCI6MjA0NzQ1NDAwN30.rQDltz2JmP9CG2OB4g0uf9zb_oQcPdLW0eKRoKLYO-k` |
| `VITE_API_BASE_URL` | `https://mnklzzundmfwjnfaoqju.supabase.co/functions/v1` |

#### Production Configuration:

| Name | Value |
|------|-------|
| `VITE_APP_ENV` | `production` |
| `NODE_ENV` | `production` |
| `PUBLIC_SITE_URL` | `https://buildmybot.app` |
| `FRONTEND_URL` | `https://buildmybot.app` |

#### Optional (Feature Flags):

| Name | Value |
|------|-------|
| `VITE_ENABLE_ANALYTICS` | `true` |
| `VITE_ENABLE_CHAT_WIDGET` | `true` |

### Step 4: Select Environments

For each variable:
1. Click "Add New"
2. Enter the **Name** (e.g., `VITE_SUPABASE_URL`)
3. Enter the **Value**
4. Select which environments to apply to:
   - ✅ **Production** (required for buildmybot.app)
   - ✅ **Preview** (optional but recommended)
   - ⬜ **Development** (not needed, use local .env)
5. Click "Save"

### Step 5: Redeploy Your Site

After adding all variables:

1. Go to **Deployments** tab
2. Click on the latest deployment
3. Click the **"..."** menu button
4. Click **Redeploy**
5. Wait for deployment to complete (~2-3 minutes)

---

## Alternative: Using Vercel CLI

If you prefer using the command line:

```bash
# Install Vercel CLI (if not already installed)
npm i -g vercel

# Login to Vercel
vercel login

# Link project (if not linked)
vercel link

# Add environment variables (run each command):
vercel env add VITE_SUPABASE_URL production
# Paste: https://mnklzzundmfwjnfaoqju.supabase.co

vercel env add VITE_SUPABASE_ANON_KEY production
# Paste: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1ua2x6enVuZG1md2puZmFvcWp1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzE4NzgwMDcsImV4cCI6MjA0NzQ1NDAwN30.rQDltz2JmP9CG2OB4g0uf9zb_oQcPdLW0eKRoKLYO-k

vercel env add VITE_API_BASE_URL production
# Paste: https://mnklzzundmfwjnfaoqju.supabase.co/functions/v1

vercel env add PUBLIC_SITE_URL production
# Paste: https://buildmybot.app

# Redeploy
vercel --prod
```

---

## Verify the Fix

After redeployment:

1. **Clear browser cache**: Ctrl+Shift+Delete (Chrome/Edge) or Cmd+Shift+Delete (Mac)
2. **Visit**: https://buildmybot.app/auth
3. **Try signing up** with a test email
4. **Expected result**:
   - ✅ No more "Authentication not configured" error
   - ✅ Signup/login works correctly

### Still Not Working?

If you still see errors after redeployment:

1. **Check browser console** (F12):
   - Look for any error messages
   - Check Network tab for failed requests

2. **Verify variables were saved**:
   - Go back to Vercel Settings → Environment Variables
   - Confirm all variables are listed

3. **Check Supabase configuration**:
   - See `SUPABASE_AUTH_SETUP.md` for Supabase dashboard configuration
   - Verify email provider is enabled
   - Add redirect URL: `https://buildmybot.app/*` in Supabase dashboard

---

## Security Notes

- ✅ **VITE_SUPABASE_ANON_KEY** is safe to expose publicly (it's meant for client-side use)
- ✅ **VITE_** prefix means the variable is exposed to the browser (this is expected)
- ⚠️ **NEVER** add `SUPABASE_SERVICE_ROLE_KEY` with the `VITE_` prefix
- ⚠️ **NEVER** commit `.env` files to git (already in `.gitignore`)

---

## For Local Development

A `.env` file has been created in your project root for local development. To test locally:

```bash
# Install dependencies (if not done)
npm install

# Run dev server
npm run dev

# Visit: http://localhost:5173/auth
```

The local development should now work with the `.env` file!

---

## Troubleshooting

### Error: "Authentication not configured"

**Cause**: Environment variables not set in Vercel

**Fix**: Follow Step 3 above to add all required variables

### Error: "Failed to fetch" or CORS issues

**Cause**: Redirect URLs not configured in Supabase

**Fix**:
1. Go to: https://supabase.com/dashboard/project/mnklzzundmfwjnfaoqju/auth/url-configuration
2. Add to "Redirect URLs":
   - `https://buildmybot.app/*`
   - `https://buildmybot.app/dashboard`
   - `https://buildmybot.app/auth`
3. Save changes

### Error: "Email not confirmed"

**Cause**: Email confirmation is enabled in Supabase

**Fix** (for development):
1. Go to: https://supabase.com/dashboard/project/mnklzzundmfwjnfaoqju/auth/providers
2. Find "Email" provider
3. Disable "Confirm email" toggle
4. Save

### Variables Added But Still Not Working

**Cause**: Old deployment cached

**Fix**:
1. Hard redeploy (not just redeploy)
2. Or add a dummy env var to force rebuild
3. Clear browser cache completely

---

## Summary

**What You Need to Do:**

1. ✅ Add environment variables to Vercel dashboard (see Step 3)
2. ✅ Redeploy your Vercel project
3. ✅ Add redirect URLs in Supabase dashboard
4. ✅ Test at buildmybot.app/auth

**Total time:** ~5 minutes

After this, your production site will work exactly like local development!
