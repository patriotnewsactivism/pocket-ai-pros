-- Fix User Signup Issue
-- This migration fixes the bot creation issue by:
-- 1. Adding missing INSERT policy for users table
-- 2. Updating handle_new_user function to generate referral_code
-- 3. Adding company column support

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'users'
      AND policyname = 'Service can create user profiles'
  ) THEN
    CREATE POLICY "Service can create user profiles"
    ON users FOR INSERT
    WITH CHECK (true);
  END IF;
END;
$$;

-- Update the handle_new_user function to include referral_code and company
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.users (
    id,
    email,
    full_name,
    company,
    referral_code,
    plan,
    status,
    bots_limit,
    conversations_limit,
    conversations_used,
    created_at,
    updated_at
  ) VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'company', ''),
    LOWER(SUBSTRING(MD5(RANDOM()::TEXT || NEW.id::TEXT) FROM 1 FOR 8)),
    'free',
    'active',
    1,
    60,
    0,
    NOW(),
    NOW()
  );
  RETURN NEW;
END;
$$;

-- Ensure the trigger exists (recreate to be safe)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Add helpful comment
COMMENT ON FUNCTION public.handle_new_user IS 'Automatically creates a user profile in public.users when a new auth user signs up. Includes referral code generation.';

-- Backfill any existing auth users that don't have a public.users record
-- This fixes users who signed up before this migration
DO $$
DECLARE
  auth_user RECORD;
BEGIN
  FOR auth_user IN
    SELECT id, email, raw_user_meta_data
    FROM auth.users
    WHERE id NOT IN (SELECT id FROM public.users)
  LOOP
    INSERT INTO public.users (
      id,
      email,
      full_name,
      company,
      referral_code,
      plan,
      status,
      bots_limit,
      conversations_limit,
      conversations_used,
      created_at,
      updated_at
    ) VALUES (
      auth_user.id,
      auth_user.email,
      COALESCE(auth_user.raw_user_meta_data->>'full_name', ''),
      COALESCE(auth_user.raw_user_meta_data->>'company', ''),
      LOWER(SUBSTRING(MD5(RANDOM()::TEXT || auth_user.id::TEXT) FROM 1 FOR 8)),
      'free',
      'active',
      1,
      60,
      0,
      NOW(),
      NOW()
    );
  END LOOP;
END $$;
