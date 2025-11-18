# CRITICAL FIX: User Signup & Bot Creation Issue

## Problem
After signing up, users cannot create bots because their profile is not being created in the `public.users` table.

## Root Cause
The database was missing:
1. An INSERT policy on the `users` table for the signup trigger
2. Proper referral_code generation in the trigger
3. Company field support in the trigger

## Solution
A new migration has been created: `20251116000002_fix_user_signup.sql`

## How to Apply the Fix

### Step 1: Apply the Migration

```bash
# Navigate to your project directory
cd pocket-ai-pros

# Push the migration to your Supabase database
supabase db push
```

### Step 2: Verify the Fix

After applying the migration, you can verify it worked by:

1. **Check the trigger exists:**
```sql
SELECT tgname, tgenabled
FROM pg_trigger
WHERE tgname = 'on_auth_user_created';
```

2. **Check the policy exists:**
```sql
SELECT policyname, cmd
FROM pg_policies
WHERE tablename = 'users';
```

3. **Test signup:**
   - Go to `/auth` and create a new test account
   - After signup, go to `/dashboard`
   - Click "Create Bot" - it should now work!

### Step 3: Fix Existing Users (if any)

The migration automatically backfills any existing auth users who don't have a public.users record. But if you want to manually verify:

```sql
-- Check for auth users without public.users records
SELECT au.id, au.email
FROM auth.users au
LEFT JOIN public.users pu ON au.id = pu.id
WHERE pu.id IS NULL;
```

If any are found (shouldn't be after migration), you can run:

```sql
-- This is already done by the migration, but here for reference
INSERT INTO public.users (id, email, full_name, company, referral_code, plan, status, bots_limit, conversations_limit, conversations_used)
SELECT
  id,
  email,
  COALESCE(raw_user_meta_data->>'full_name', ''),
  COALESCE(raw_user_meta_data->>'company', ''),
  LOWER(SUBSTRING(MD5(RANDOM()::TEXT || id::TEXT) FROM 1 FOR 8)),
  'free',
  'active',
  1,
  60,
  0
FROM auth.users
WHERE id NOT IN (SELECT id FROM public.users);
```

## What the Migration Does

1. **Adds INSERT Policy:**
   ```sql
   CREATE POLICY "Service can create user profiles"
   ON users FOR INSERT
   WITH CHECK (true);
   ```
   This allows the trigger to insert new user records.

2. **Updates the Trigger Function:**
   - Now generates a unique `referral_code` for each user
   - Includes `company` field from signup metadata
   - Sets proper timestamps

3. **Backfills Existing Users:**
   - Automatically creates `public.users` records for any `auth.users` who don't have one
   - Ensures all existing users can now create bots

## Testing the Fix

### Test Signup Flow:
1. Sign out if logged in
2. Go to `/auth`
3. Click "Sign Up" tab
4. Fill in:
   - Full Name: "Test User"
   - Company: "Test Company"
   - Email: "test@example.com"
   - Password: Strong password (at least 8 characters)
5. Click "Sign Up"
6. You should be redirected to `/dashboard`
7. Click "Create Bot" button
8. Fill in bot details and click "Create Bot"
9. Bot should be created successfully! ✅

### Test Bot Creation:
1. Go to `/dashboard`
2. Click "Create Bot" or "Create Your First Bot"
3. Enter:
   - Bot Name: "Customer Support Bot"
   - Description: "Helps customers with questions"
4. Click "Create Bot"
5. Bot should appear in your dashboard immediately

## Troubleshooting

### "Not authenticated" error
- Make sure you're logged in
- Try signing out and back in

### "Failed to create bot" error
1. Open browser console (F12)
2. Look for specific error message
3. Check if the migration was applied:
   ```bash
   supabase db pull
   ```

### Still can't create bots
1. Verify your user record exists:
   ```sql
   SELECT * FROM users WHERE email = 'your-email@example.com';
   ```

2. Check bot limits:
   ```sql
   SELECT plan, bots_limit FROM users WHERE email = 'your-email@example.com';
   ```
   Free plan has bots_limit = 1

3. Check existing bots:
   ```sql
   SELECT count(*) FROM bots WHERE user_id = 'your-user-id';
   ```
   If count >= bots_limit, you need to upgrade or delete a bot

## Migration File Location
`supabase/migrations/20251116000002_fix_user_signup.sql`

## Related Files
- Trigger Function: `supabase/migrations/20251105233842_c192e774-d305-44a2-8fdd-fba568b6dd00.sql`
- Initial Schema: `supabase/migrations/20251102125807_45d1326e-9933-41b0-888d-e7309527ec89.sql`

## Quick Fix Command

If you're in a hurry, just run:

```bash
cd pocket-ai-pros && supabase db push
```

That's it! The issue should be fixed and you can now create bots.

---

**Issue:** Cannot create bots after signup
**Status:** ✅ FIXED
**Migration:** 20251116000002_fix_user_signup.sql
**Date:** November 16, 2025
