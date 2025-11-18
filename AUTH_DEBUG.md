# Authentication Debugging Guide

## Current Status
Your authentication code is correctly implemented. The issue is likely configuration-related.

## Step-by-Step Debug Process

### 1. Check Browser Console
Open browser DevTools (F12) → Console tab when attempting to sign up/login.
Look for errors containing:
- "email"
- "auth"
- "supabase"
- "CORS"

### 2. Check Network Tab
1. Open DevTools → Network tab
2. Attempt to sign up
3. Look for requests to `https://mnklzzundmfwjnfaoqju.supabase.co/auth/v1/signup`
4. Check:
   - Request status code (should be 200)
   - Response body for error messages
   - Request headers (Authorization should be present)

### 3. Verify Supabase Dashboard Settings

#### A. Email Provider Status
1. Go to: https://supabase.com/dashboard/project/mnklzzundmfwjnfaoqju/auth/providers
2. Verify "Email" provider is **enabled**
3. Check "Confirm email" toggle:
   - **ON**: Users must verify email before login (check inbox/spam)
   - **OFF**: Users can login immediately after signup

#### B. URL Configuration
1. Go to: https://supabase.com/dashboard/project/mnklzzundmfwjnfaoqju/auth/url-configuration
2. Add these redirect URLs:
   ```
   http://localhost:5173/*
   http://localhost:5173/dashboard
   https://yourdomain.com/*
   https://yourdomain.com/dashboard
   ```

#### C. Email Rate Limits
1. Go to: https://supabase.com/dashboard/project/mnklzzundmfwjnfaoqju/auth/rate-limits
2. Check if you've hit hourly limits
3. Temporarily increase limits for testing

#### D. SMTP Configuration (Email Delivery)
1. Go to: https://supabase.com/dashboard/project/mnklzzundmfwjnfaoqju/auth/settings
2. Scroll to "SMTP Settings"
3. Options:
   - **Use Supabase's SMTP** (default, but may go to spam)
   - **Use custom SMTP** (recommended for production)

### 4. Test with Supabase SQL Editor

Run this query in Supabase SQL Editor to check auth configuration:

```sql
-- Check if auth schema exists and is accessible
SELECT
  schemaname,
  tablename
FROM pg_tables
WHERE schemaname = 'auth';

-- Check if email confirmations are required
SELECT
  name,
  value
FROM auth.config
WHERE name = 'MAILER_AUTOCONFIRM';

-- Check recent auth attempts (if any)
SELECT
  id,
  email,
  email_confirmed_at,
  created_at,
  last_sign_in_at
FROM auth.users
ORDER BY created_at DESC
LIMIT 10;
```

### 5. Test Authentication Manually

Try creating a user directly via SQL (bypass the UI):

```sql
-- This will help determine if the issue is UI or backend
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  recovery_sent_at,
  last_sign_in_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'test@example.com',
  crypt('testpassword123', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '{"provider":"email","providers":["email"]}',
  '{"full_name":"Test User"}',
  NOW(),
  NOW(),
  '',
  '',
  '',
  ''
);
```

Then try logging in with:
- Email: test@example.com
- Password: testpassword123

### 6. Common Error Messages & Fixes

| Error Message | Cause | Solution |
|--------------|-------|----------|
| "Invalid login credentials" | Wrong email/password | Check credentials, verify user exists in `auth.users` |
| "Email not confirmed" | Email confirmation required | Check email, or disable confirmation in dashboard |
| "User already registered" | Duplicate signup attempt | User exists, should login instead |
| "Email rate limit exceeded" | Too many signup attempts | Wait or increase rate limits in dashboard |
| "Invalid API key" | Wrong Supabase keys | Verify `.env` has correct keys from dashboard |

### 7. Verify Environment Variables

Run this in your project directory:

```bash
# Check if .env file is being loaded
npm run dev

# Then in browser console, check if Supabase is configured:
```

Open browser console and run:
```javascript
console.log(window.location.origin); // Should show current URL
console.log(localStorage.getItem('supabase.auth.token')); // Check for existing sessions
```

### 8. Enable Supabase Client Logging

Temporarily add to `src/lib/supabase.ts` after line 37:

```typescript
return createClient(env.supabaseUrl, env.supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    debug: true, // ← Add this temporarily
  },
});
```

This will log detailed auth flow to browser console.

## Expected Successful Signup Flow

1. User fills form → clicks "Create Account"
2. Request to `/auth/v1/signup` with email/password
3. Supabase creates user in `auth.users`
4. **If email confirmation enabled**:
   - Email sent to user
   - User clicks link in email
   - Redirected to dashboard
5. **If email confirmation disabled**:
   - User immediately redirected to dashboard

## Contact Support

If none of these work:
1. Export all findings from steps above
2. Open Supabase support ticket with:
   - Project ID: mnklzzundmfwjnfaoqju
   - Exact error messages
   - Network request/response screenshots
   - SQL query results

## Security Reminder

After debugging:
1. Remove any test users created
2. Disable debug logging in production
3. Rotate any exposed credentials
