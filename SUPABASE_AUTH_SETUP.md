# Supabase Authentication Setup Guide

## Overview

This guide will help you configure Supabase Authentication to resolve login and signup issues. Your application code is correctly implemented - the issue is likely in the Supabase dashboard configuration.

**Project ID**: `mnklzzundmfwjnfaoqju`
**Dashboard URL**: https://supabase.com/dashboard/project/mnklzzundmfwjnfaoqju

---

## Quick Fix Checklist

Follow these steps in order:

- [ ] Step 1: Enable Email Authentication
- [ ] Step 2: Configure Email Confirmation Settings
- [ ] Step 3: Set Up Redirect URLs
- [ ] Step 4: Verify SMTP Configuration
- [ ] Step 5: Test Authentication Flow
- [ ] Step 6: Check Row Level Security (RLS) Policies

---

## Step 1: Enable Email Authentication

### Navigate to Email Provider Settings

1. **Go to**: https://supabase.com/dashboard/project/mnklzzundmfwjnfaoqju/auth/providers
2. **Find**: "Email" provider in the list
3. **Verify**: Toggle is **ON** (enabled)

### What to Check

| Setting | Recommended Value | Purpose |
|---------|------------------|---------|
| **Email provider enabled** | ✅ ON | Allows users to sign up with email/password |
| **Confirm email** | ⚠️ See Step 2 | Determines if email verification is required |
| **Secure email change** | ✅ ON | Requires confirmation for email changes |
| **Email OTP** | Optional | One-time password login (alternative to password) |

### Screenshot Location
The toggle should look like:
```
Email                                    [Toggle: ON]
  Confirm email                          [Toggle: ?]
  Secure email change                    [Toggle: ON]
```

---

## Step 2: Configure Email Confirmation Settings

### Understanding Email Confirmation

The "Confirm email" setting determines whether users must verify their email before accessing the app.

| Mode | Behavior | Best For |
|------|----------|----------|
| **ON** (Confirmation required) | User receives email → clicks link → gains access | Production (prevents spam signups) |
| **OFF** (No confirmation) | User signs up → immediately gains access | Development (faster testing) |

### Current Behavior in Your Code

Your `Auth.tsx` handles both modes:

```typescript
// src/pages/Auth.tsx:86-96
if (emailConfirmationRequired) {
  // Shows "Check your email" message
  // User must click confirmation link
} else {
  // Immediately redirects to dashboard
}
```

### Recommended Configuration

**For Development**:
1. Go to: https://supabase.com/dashboard/project/mnklzzundmfwjnfaoqju/auth/providers
2. Find "Email" provider
3. **Disable** "Confirm email" toggle
4. Click "Save"

**For Production**:
1. **Enable** "Confirm email" toggle
2. Configure custom SMTP (see Step 4)
3. Test email delivery thoroughly

### What Happens If Email Confirmation Is Enabled But Emails Don't Send

**Symptoms**:
- User signs up successfully
- Sees "Check your email" message
- Never receives email
- Cannot log in

**Cause**: Supabase's default SMTP may deliver to spam or not at all

**Solution**: Configure custom SMTP (Step 4)

---

## Step 3: Set Up Redirect URLs

### Why This Matters

Supabase validates redirect URLs for security. If your app's URL isn't whitelisted, authentication redirects will fail.

### Configure Site URL

1. **Go to**: https://supabase.com/dashboard/project/mnklzzundmfwjnfaoqju/auth/url-configuration
2. **Find**: "Site URL" field
3. **Set to**: `http://localhost:5173` (for development)
4. **For production**: Update to your production domain (e.g., `https://yourdomain.com`)

### Configure Redirect URLs

Add these URLs to the "Redirect URLs" section:

**For Local Development**:
```
http://localhost:5173/*
http://localhost:5173/dashboard
http://localhost:5173/auth
```

**For Production** (replace `yourdomain.com` with your actual domain):
```
https://yourdomain.com/*
https://yourdomain.com/dashboard
https://yourdomain.com/auth
```

### Example Configuration

```
Site URL:
  http://localhost:5173

Redirect URLs (one per line):
  http://localhost:5173/*
  http://localhost:5173/dashboard
  https://yourdomain.com/*
  https://yourdomain.com/dashboard
```

### Click "Save"

---

## Step 4: Verify SMTP Configuration

### Check Current Email Provider

1. **Go to**: https://supabase.com/dashboard/project/mnklzzundmfwjnfaoqju/settings/auth
2. **Scroll to**: "SMTP Settings" section
3. **Current status**: Using Supabase's SMTP or Custom SMTP?

### Supabase Default SMTP

**Pros**:
- No configuration required
- Works out of the box

**Cons**:
- May go to spam folders
- Rate limited
- Less reliable for production

### Custom SMTP (Recommended for Production)

Configure a custom email provider for better deliverability:

#### Option 1: SendGrid (Recommended - Free Tier)

1. **Get API Key**: https://app.sendgrid.com/settings/api_keys
2. **In Supabase**:
   - Enable "Use custom SMTP"
   - **Host**: `smtp.sendgrid.net`
   - **Port**: `587`
   - **Username**: `apikey` (literally the word "apikey")
   - **Password**: Your SendGrid API key
   - **Sender email**: `noreply@yourdomain.com`
   - **Sender name**: `BuildMyBot`

#### Option 2: Mailgun

1. **Get credentials**: https://app.mailgun.com/
2. **In Supabase**:
   - Enable "Use custom SMTP"
   - **Host**: `smtp.mailgun.org`
   - **Port**: `587`
   - **Username**: Your Mailgun SMTP username
   - **Password**: Your Mailgun SMTP password
   - **Sender email**: `noreply@yourdomain.com`

#### Option 3: Gmail (Development Only)

**⚠️ Not recommended for production**

1. Create an App Password: https://myaccount.google.com/apppasswords
2. **In Supabase**:
   - Enable "Use custom SMTP"
   - **Host**: `smtp.gmail.com`
   - **Port**: `587`
   - **Username**: Your Gmail address
   - **Password**: App Password (not your regular password)
   - **Sender email**: Your Gmail address

### Test Email Delivery

After configuring SMTP:

1. Go to: Authentication → Users
2. Click "Invite user"
3. Enter a test email address
4. Check if email arrives
5. Check spam folder if not in inbox

---

## Step 5: Test Authentication Flow

### Test Signup (Email Confirmation Disabled)

1. **Open**: http://localhost:5173/auth
2. **Click**: "Sign Up" tab
3. **Fill in**:
   - Full Name: Test User
   - Email: test@example.com
   - Password: testpassword123
4. **Click**: "Create Account"

**Expected Result**:
- ✅ Shows "Account created!" toast
- ✅ Redirects to `/dashboard` after 1 second
- ✅ User appears in Supabase Dashboard → Authentication → Users

**If it fails**:
- Open browser console (F12)
- Check for error messages
- See "Troubleshooting" section below

### Test Signup (Email Confirmation Enabled)

1. **Open**: http://localhost:5173/auth
2. **Click**: "Sign Up" tab
3. **Fill in** form
4. **Click**: "Create Account"

**Expected Result**:
- ✅ Shows "Check your email" message
- ✅ Email sent to inbox (check spam if not found)
- ✅ Click link in email → Redirects to `/dashboard`
- ✅ Can now log in with email/password

### Test Login

1. **Open**: http://localhost:5173/auth
2. **Click**: "Sign In" tab (default)
3. **Enter**: Email and password of existing user
4. **Click**: "Sign In"

**Expected Result**:
- ✅ Shows "Welcome back!" toast
- ✅ Redirects to `/dashboard` after 1 second

---

## Step 6: Check Row Level Security (RLS) Policies

### Why This Matters

Supabase uses Row Level Security (RLS) to control data access. Misconfigured RLS can prevent user creation or data access.

### Check `auth.users` Table (Managed by Supabase)

The `auth.users` table is managed by Supabase and should work automatically. **Do not modify this table**.

### Check `public.users` Table (If You Have One)

If your app has a custom `users` table:

1. **Go to**: https://supabase.com/dashboard/project/mnklzzundmfwjnfaoqju/editor
2. **Select**: `users` table
3. **Click**: "Policies" tab (or RLS button)

### Required Policies for User Registration

You need policies that allow:

1. **INSERT policy**: Allow new users to create their own record
2. **SELECT policy**: Allow users to read their own data
3. **UPDATE policy**: Allow users to update their own data

### Example RLS Policies

#### Policy 1: Allow User Creation
```sql
-- Policy name: "Users can insert their own record"
-- Policy definition:
CREATE POLICY "Users can insert their own record"
ON public.users
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);
```

#### Policy 2: Allow User to Read Own Data
```sql
-- Policy name: "Users can read their own data"
-- Policy definition:
CREATE POLICY "Users can read their own data"
ON public.users
FOR SELECT
TO authenticated
USING (auth.uid() = id);
```

#### Policy 3: Allow User to Update Own Data
```sql
-- Policy name: "Users can update their own data"
-- Policy definition:
CREATE POLICY "Users can update their own data"
ON public.users
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);
```

### How to Add RLS Policies

1. **Go to**: https://supabase.com/dashboard/project/mnklzzundmfwjnfaoqju/editor
2. **Select**: `users` table
3. **Click**: "Policies" tab
4. **Click**: "New Policy"
5. **Choose**: "For full customization" or use templates
6. **Paste**: SQL from examples above
7. **Click**: "Save policy"

### Enable RLS on Table

If RLS is not enabled:

1. Go to table settings
2. Click "Enable RLS"
3. Add policies (see above)

**⚠️ Warning**: Enabling RLS without policies will block all access. Add policies first!

---

## Troubleshooting

### Issue 1: "Authentication not configured" Error

**Symptoms**:
- Error message: "Authentication service is not configured"
- Red warning banner on login page

**Cause**: Environment variables not set in `.env` file

**Fix**:
1. Create `.env` file in project root:
   ```bash
   cp .env.example .env
   ```
2. Add Supabase credentials:
   ```env
   VITE_SUPABASE_URL=https://mnklzzundmfwjnfaoqju.supabase.co
   VITE_SUPABASE_ANON_KEY=<your-anon-key-from-dashboard>
   ```
3. Get anon key from: https://supabase.com/dashboard/project/mnklzzundmfwjnfaoqju/settings/api
4. Restart dev server: `npm run dev`

---

### Issue 2: "Invalid login credentials" Error

**Symptoms**:
- User enters correct email/password
- Error: "Invalid login credentials"

**Possible Causes**:

#### Cause A: User doesn't exist
**Fix**: Sign up first, then try logging in

#### Cause B: Email not confirmed
**Fix**:
- Check email for confirmation link
- Or disable email confirmation in Supabase dashboard

#### Cause C: Wrong password
**Fix**: Use password reset flow or try correct password

#### Cause D: User in `auth.users` but soft-deleted
**Fix** (SQL):
```sql
-- Check if user is soft-deleted
SELECT id, email, deleted_at FROM auth.users WHERE email = 'user@example.com';

-- If deleted_at is not null, user is soft-deleted
-- Contact Supabase support to restore or create new account
```

---

### Issue 3: "Email not confirmed" Error

**Symptoms**:
- User signs up successfully
- Tries to log in
- Error: "Email not confirmed"

**Cause**: Email confirmation is enabled but user hasn't clicked link

**Fix**:

#### Option A: Click confirmation link in email
1. Check inbox for email from Supabase
2. Check spam folder
3. Click confirmation link

#### Option B: Disable email confirmation (development only)
1. Go to: https://supabase.com/dashboard/project/mnklzzundmfwjnfaoqju/auth/providers
2. Find "Email" provider
3. Disable "Confirm email" toggle
4. Click "Save"
5. Delete existing unconfirmed users
6. Try signing up again

#### Option C: Manually confirm user (SQL)
```sql
-- Confirm user manually (emergency fix)
UPDATE auth.users
SET email_confirmed_at = NOW()
WHERE email = 'user@example.com';
```

---

### Issue 4: Signup Works But No Redirect

**Symptoms**:
- Signup appears successful
- No redirect to dashboard
- User stuck on auth page

**Possible Causes**:

#### Cause A: JavaScript error in console
**Fix**:
1. Open browser console (F12)
2. Look for errors
3. Share error with development team

#### Cause B: Redirect URL not whitelisted
**Fix**:
1. Add `http://localhost:5173/dashboard` to redirect URLs (Step 3)
2. Try signing up again

#### Cause C: Email confirmation required
**Fix**:
- This is expected behavior if confirmation is enabled
- Check email for confirmation link

---

### Issue 5: "User already registered" Error

**Symptoms**:
- Trying to sign up
- Error: "User already registered" or "Email already exists"

**Cause**: Email is already in database

**Fix**:

#### Option A: Log in instead
- Use the "Sign In" tab
- Enter email and password

#### Option B: Reset password
1. Add password reset functionality to app
2. Or manually reset in Supabase Dashboard:
   - Go to Authentication → Users
   - Find user
   - Click "..." menu → "Send password recovery"

#### Option C: Delete existing user (development only)
1. Go to: https://supabase.com/dashboard/project/mnklzzundmfwjnfaoqju/auth/users
2. Find user by email
3. Click "..." menu → "Delete user"
4. Try signing up again

---

### Issue 6: "Too many requests" Error

**Symptoms**:
- Error: "Email rate limit exceeded"
- Can't sign up or log in

**Cause**: Hit Supabase rate limits (too many signup attempts)

**Fix**:

1. **Wait**: Rate limits reset after 1 hour
2. **Check rate limits**:
   - Go to: https://supabase.com/dashboard/project/mnklzzundmfwjnfaoqju/auth/rate-limits
   - View current limits and usage
3. **Increase limits** (for development):
   - Temporarily increase rate limits
   - Or use different email addresses for testing

---

### Issue 7: Network Errors / CORS Issues

**Symptoms**:
- Error: "Failed to fetch"
- Error: "CORS policy blocked"
- Network request fails

**Possible Causes**:

#### Cause A: Supabase project paused (free tier)
**Fix**:
1. Go to: https://supabase.com/dashboard/project/mnklzzundmfwjnfaoqju
2. Check if project is paused
3. Click "Resume project" if paused

#### Cause B: Incorrect Supabase URL
**Fix**:
1. Verify URL in `.env`:
   ```env
   VITE_SUPABASE_URL=https://mnklzzundmfwjnfaoqju.supabase.co
   ```
2. Get correct URL from: https://supabase.com/dashboard/project/mnklzzundmfwjnfaoqju/settings/api

#### Cause C: Network connectivity
**Fix**:
- Check internet connection
- Try accessing Supabase dashboard to verify service is up
- Check Supabase status: https://status.supabase.com/

---

## Advanced Debugging

### Enable Debug Logging

Temporarily add to `src/lib/supabase.ts`:

```typescript
// Line 37 - Add debug option
return createClient(env.supabaseUrl, env.supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    debug: true, // ← Add this
  },
});
```

This will log detailed authentication flow to browser console.

**Remember to remove `debug: true` before production!**

### Check Browser Console

When testing signup/login:

1. Open browser DevTools (F12)
2. Go to "Console" tab
3. Look for:
   - ✅ `[supabase]` logs (if debug enabled)
   - ❌ Error messages (red text)
   - ⚠️ Warnings (yellow text)

### Check Network Tab

1. Open browser DevTools (F12)
2. Go to "Network" tab
3. Attempt signup/login
4. Look for requests to:
   - `/auth/v1/signup` (for signup)
   - `/auth/v1/token?grant_type=password` (for login)

#### Successful Request:
```
Status: 200 OK
Response: {"access_token": "...", "user": {...}}
```

#### Failed Request:
```
Status: 400 Bad Request
Response: {"error": "Invalid login credentials"}
```

### Check Supabase Auth Logs

1. **Go to**: https://supabase.com/dashboard/project/mnklzzundmfwjnfaoqju/logs/auth-logs
2. **Filter**: By time range
3. **Look for**:
   - Recent signup attempts
   - Error messages
   - IP addresses (verify it's you)

### SQL Debug Queries

Run these in Supabase SQL Editor (https://supabase.com/dashboard/project/mnklzzundmfwjnfaoqju/sql/new):

#### Check if user exists:
```sql
SELECT id, email, email_confirmed_at, created_at, last_sign_in_at
FROM auth.users
WHERE email = 'test@example.com';
```

#### Check recent signups:
```sql
SELECT id, email, email_confirmed_at, created_at
FROM auth.users
ORDER BY created_at DESC
LIMIT 10;
```

#### Check for soft-deleted users:
```sql
SELECT id, email, deleted_at
FROM auth.users
WHERE deleted_at IS NOT NULL
ORDER BY deleted_at DESC
LIMIT 10;
```

#### Count total users:
```sql
SELECT COUNT(*) as total_users FROM auth.users;
```

---

## Testing Checklist

After configuration, test these scenarios:

### Signup Flow
- [ ] User can access `/auth` page
- [ ] Signup form accepts valid email and password
- [ ] Form validation works (invalid email, short password)
- [ ] Successful signup shows success message
- [ ] User is created in Supabase (check dashboard → Users)
- [ ] If email confirmation disabled: User redirects to dashboard
- [ ] If email confirmation enabled: User receives confirmation email
- [ ] Clicking confirmation link redirects to dashboard

### Login Flow
- [ ] Login form accepts credentials
- [ ] Valid credentials log user in successfully
- [ ] Invalid credentials show error message
- [ ] User redirects to dashboard after login
- [ ] Session persists after page refresh

### Session Management
- [ ] User stays logged in after page refresh
- [ ] User can access protected routes (e.g., `/dashboard`)
- [ ] Unauthenticated users redirect to `/auth`
- [ ] Logout works (if implemented)

### Error Handling
- [ ] Network errors show user-friendly messages
- [ ] Rate limiting errors are handled gracefully
- [ ] Invalid credentials show appropriate error
- [ ] Duplicate email shows appropriate error

---

## Production Deployment Checklist

Before going live:

- [ ] Email confirmation is **enabled**
- [ ] Custom SMTP configured (SendGrid/Mailgun)
- [ ] Test email delivery thoroughly
- [ ] Production domain added to redirect URLs
- [ ] Site URL set to production domain
- [ ] Rate limits reviewed and adjusted if needed
- [ ] RLS policies tested and verified
- [ ] Password reset flow implemented and tested
- [ ] Email templates customized (optional)
- [ ] Social auth configured if using (Google, GitHub, etc.)

---

## Email Template Customization (Optional)

### Customize Confirmation Email

1. **Go to**: https://supabase.com/dashboard/project/mnklzzundmfwjnfaoqju/auth/templates
2. **Select**: "Confirm signup" template
3. **Customize**:
   - Subject line
   - Email body
   - Sender name
   - Button text
4. **Use variables**:
   - `{{ .ConfirmationURL }}` - Confirmation link
   - `{{ .Email }}` - User's email
   - `{{ .SiteURL }}` - Your site URL

### Example Custom Template

```html
<h2>Welcome to BuildMyBot!</h2>
<p>Hi there,</p>
<p>Thanks for signing up! Click the button below to confirm your email address:</p>
<p><a href="{{ .ConfirmationURL }}" style="background: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">Confirm Email</a></p>
<p>Or copy and paste this link into your browser:</p>
<p>{{ .ConfirmationURL }}</p>
<p>If you didn't sign up for BuildMyBot, you can safely ignore this email.</p>
<p>Thanks,<br>The BuildMyBot Team</p>
```

---

## Support & Resources

### Supabase Documentation
- **Auth Guide**: https://supabase.com/docs/guides/auth
- **Email Auth**: https://supabase.com/docs/guides/auth/auth-email
- **SMTP Setup**: https://supabase.com/docs/guides/auth/auth-smtp
- **RLS Policies**: https://supabase.com/docs/guides/auth/row-level-security

### Project-Specific Docs
- `AUTH_DEBUG.md` - Detailed debugging steps
- `SECURITY_REMEDIATION_PLAN.md` - Security configuration
- `EDGE_FUNCTIONS_CONFIG.md` - Edge Functions setup

### Getting Help
1. Check Supabase Community: https://github.com/supabase/supabase/discussions
2. Supabase Discord: https://discord.supabase.com
3. Review this guide's Troubleshooting section

---

## Summary

**Most Common Issues**:
1. ❌ Email confirmation enabled but emails not arriving → Disable confirmation or configure custom SMTP
2. ❌ Redirect URLs not whitelisted → Add localhost:5173 to redirect URLs
3. ❌ Environment variables not set → Create `.env` file with Supabase credentials
4. ❌ User trying to sign up with existing email → Use login instead

**Quick Win**:
- Disable email confirmation in development
- Add `http://localhost:5173/*` to redirect URLs
- Verify environment variables in `.env`
- Test signup flow

**After following this guide, authentication should work correctly.** If issues persist, check browser console for specific error messages and review the Troubleshooting section.
