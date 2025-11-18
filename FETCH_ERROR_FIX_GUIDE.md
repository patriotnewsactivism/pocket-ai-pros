# Fix Guide: "Failed to execute 'fetch' on 'Window'" Error

## Problem
Your site at buildmybot.app is experiencing authentication errors with the message "Failed to execute 'fetch' on 'Window'" when users try to login or sign up.

## Root Cause
This error occurs when the Supabase client tries to make API calls but:
1. Environment variables are missing or not set in Vercel
2. Environment variables contain invalid/placeholder values
3. The Supabase URL or anon key is malformed

## What Was Fixed

### 1. Enhanced Validation (`src/integrations/supabase/client.ts`)
- **JWT validation**: Now validates the anon key is a proper JWT token
- **Hostname validation**: Checks URL ends with `.supabase.co` or `.supabase.com`
- **Try-catch protection**: Wraps `createClient()` to catch initialization errors
- **Comprehensive logging**: Adds detailed console logs for debugging
- **Fallback mechanism**: Creates disabled client if validation fails

### 2. Better Error Handling (`src/pages/Auth.tsx`)
- **Detailed error messages**: Shows specific error types to users
- **Console logging**: Logs all authentication attempts and errors
- **Network error detection**: Specifically catches fetch-related errors
- **User-friendly messages**: Translates technical errors into helpful guidance

## How to Fix in Production

### Step 1: Verify Your Supabase Credentials

Your Supabase project details:
- **Project ID**: `mnklzzundmfwjnfaoqju`
- **URL**: `https://mnklzzundmfwjnfaoqju.supabase.co`
- **Dashboard**: https://supabase.com/dashboard/project/mnklzzundmfwjnfaoqju

1. Go to your Supabase dashboard
2. Navigate to Settings → API
3. Copy the following:
   - **Project URL**: Should be `https://mnklzzundmfwjnfaoqju.supabase.co`
   - **Anon/Public Key**: Should start with `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

### Step 2: Set Environment Variables in Vercel

1. Go to https://vercel.com/dashboard
2. Select your project (buildmybot)
3. Go to **Settings** → **Environment Variables**
4. Add/Update these variables for **ALL environments** (Production, Preview, Development):

```
VITE_SUPABASE_URL=https://mnklzzundmfwjnfaoqju.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1ua2x6enVuZG1md2puZmFvcWp1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMyOTMxNzAsImV4cCI6MjA3ODg2OTE3MH0._8NrrFTvjF1VmDWFubLOXc4jJ1SC_AM_Z3vkSiuUYnI
```

**IMPORTANT**:
- Make sure to set these for **Production**, **Preview**, AND **Development** environments
- Do NOT use placeholder values like "your-project-ref" or "REPLACE_ME"
- The anon key should be exactly as shown above (from your .env file)

### Step 3: Configure Supabase Redirect URLs

1. Go to Supabase Dashboard → Authentication → URL Configuration
2. Add these Site URL and Redirect URLs:

**Site URL**:
```
https://buildmybot.app
```

**Redirect URLs** (add all of these):
```
https://buildmybot.app/*
https://buildmybot.app/dashboard
https://buildmybot.app/auth
http://localhost:5173/*
http://localhost:5173/dashboard
```

### Step 4: Redeploy

After setting environment variables:

**Option A: Through Vercel Dashboard**
1. Go to Deployments tab
2. Click the three dots on the latest deployment
3. Click "Redeploy"
4. Make sure "Use existing Build Cache" is UNCHECKED

**Option B: Through Git Push**
```bash
git add .
git commit -m "Fix: Enhanced authentication validation and error handling"
git push
```

Vercel will automatically redeploy.

### Step 5: Verify the Fix

1. Open https://buildmybot.app in a new incognito window
2. Open browser DevTools (F12) → Console tab
3. Navigate to the auth page
4. Look for these logs:

**Expected Success Logs**:
```
[Supabase Client] Initializing...
[Supabase Client] URL present: true
[Supabase Client] Key present: true
[Supabase Validation] ✓ URL is valid: mnklzzundmfwjnfaoqju.supabase.co
[Supabase Validation] ✓ Anon key is valid JWT format
[Supabase Client] Configuration valid: true
[Supabase Client] ✓ Real Supabase client created successfully
```

**If You See Errors**:
```
[Supabase Validation] URL is empty or undefined
// OR
[Supabase Validation] Anon key is empty or undefined
```
This means environment variables are NOT set in Vercel. Go back to Step 2.

5. Try to sign up with a test email
6. Check console for `[Auth] Sign up attempt started` and subsequent logs
7. Authentication should now work without fetch errors

## Additional Debugging

### Check Environment Variables Are Loaded

Add this temporarily to your code to debug:
```javascript
console.log('ENV CHECK:', {
  hasUrl: !!import.meta.env.VITE_SUPABASE_URL,
  hasKey: !!import.meta.env.VITE_SUPABASE_ANON_KEY,
  urlValue: import.meta.env.VITE_SUPABASE_URL?.substring(0, 30),
});
```

### Verify Supabase Project is Active

1. Go to Supabase Dashboard
2. Check if project is paused (free tier projects pause after inactivity)
3. If paused, click "Resume Project"

### Check Supabase Auth Settings

1. Supabase Dashboard → Authentication → Providers
2. Ensure **Email** provider is **enabled**
3. Check if email confirmation is required (Settings → Auth → Email Auth)

## Common Issues

### Issue 1: Environment Variables Not Applied
**Solution**: After setting env vars, you MUST redeploy. Simply setting them doesn't update the running deployment.

### Issue 2: Wrong Environment Selected
**Solution**: Set env vars for ALL environments (Production, Preview, Development), not just Production.

### Issue 3: Typo in Variable Names
**Solution**: Must be exactly `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` (case-sensitive).

### Issue 4: Supabase Project Paused
**Solution**: Resume project in Supabase Dashboard.

### Issue 5: Redirect URL Mismatch
**Solution**: Add `https://buildmybot.app/*` to Supabase redirect URLs.

## Testing the Fix Locally

To test locally before deploying:

```bash
# Make sure .env file has correct values
cat .env | grep VITE_SUPABASE

# Install dependencies if needed
npm install

# Run dev server
npm run dev

# Open http://localhost:5173
# Check console for validation logs
# Test login/signup
```

## Files Changed

1. **src/integrations/supabase/client.ts** - Enhanced validation and error handling
2. **src/pages/Auth.tsx** - Better error messages and logging

## Next Steps After Fix

1. Monitor browser console logs on production
2. Test both signup and signin flows
3. Verify email confirmation flow works
4. Check that users can access dashboard after login
5. Test referral link functionality

## Support

If issues persist after following this guide:
1. Check browser console logs
2. Check Vercel deployment logs
3. Verify all environment variables are set correctly
4. Ensure Supabase project is active and not paused

## Summary

The core issue was weak validation allowing malformed credentials to reach the Supabase client, causing fetch errors. The fix adds:
- ✅ JWT validation for anon key
- ✅ Strict URL hostname validation
- ✅ Try-catch protection around client creation
- ✅ Comprehensive error logging
- ✅ User-friendly error messages
- ✅ Fallback to disabled client on failure

After setting environment variables in Vercel and redeploying, the authentication should work without fetch errors.
