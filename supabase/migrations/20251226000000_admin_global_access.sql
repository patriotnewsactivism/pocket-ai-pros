-- Expand admin access and seed initial admin users

-- Ensure admin flag exists
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS is_admin boolean DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_users_is_admin ON public.users(is_admin) WHERE is_admin = true;

-- Mark existing admin users by email
UPDATE public.users
SET is_admin = true
WHERE lower(email) IN ('mreardon@wtpnews.org', 'jadj19@gmail.com');

-- Update signup handler to set admin flag for approved emails
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
    is_admin,
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
    CASE
      WHEN LOWER(NEW.email) IN ('mreardon@wtpnews.org', 'jadj19@gmail.com') THEN true
      ELSE false
    END,
    NOW(),
    NOW()
  );
  RETURN NEW;
END;
$$;

-- Allow admins to manage all core business data
DROP POLICY IF EXISTS "Admins can manage all users" ON public.users;
CREATE POLICY "Admins can manage all users"
ON public.users
FOR ALL
TO authenticated
USING (is_user_admin())
WITH CHECK (is_user_admin());

DROP POLICY IF EXISTS "Admins can manage all subscriptions" ON public.subscriptions;
CREATE POLICY "Admins can manage all subscriptions"
ON public.subscriptions
FOR ALL
TO authenticated
USING (is_user_admin())
WITH CHECK (is_user_admin());

DROP POLICY IF EXISTS "Admins can manage all bots" ON public.bots;
CREATE POLICY "Admins can manage all bots"
ON public.bots
FOR ALL
TO authenticated
USING (is_user_admin())
WITH CHECK (is_user_admin());

DROP POLICY IF EXISTS "Admins can manage all conversations" ON public.conversations;
CREATE POLICY "Admins can manage all conversations"
ON public.conversations
FOR ALL
TO authenticated
USING (is_user_admin())
WITH CHECK (is_user_admin());

DROP POLICY IF EXISTS "Admins can manage all reseller applications" ON public.reseller_applications;
CREATE POLICY "Admins can manage all reseller applications"
ON public.reseller_applications
FOR ALL
TO authenticated
USING (is_user_admin())
WITH CHECK (is_user_admin());

DROP POLICY IF EXISTS "Admins can manage all resellers" ON public.resellers;
CREATE POLICY "Admins can manage all resellers"
ON public.resellers
FOR ALL
TO authenticated
USING (is_user_admin())
WITH CHECK (is_user_admin());

DROP POLICY IF EXISTS "Admins can manage all subscribers" ON public.newsletter_subscribers;
CREATE POLICY "Admins can manage all subscribers"
ON public.newsletter_subscribers
FOR ALL
TO authenticated
USING (is_user_admin())
WITH CHECK (is_user_admin());

DROP POLICY IF EXISTS "Admins can manage all contact submissions" ON public.contact_submissions;
CREATE POLICY "Admins can manage all contact submissions"
ON public.contact_submissions
FOR ALL
TO authenticated
USING (is_user_admin())
WITH CHECK (is_user_admin());

DROP POLICY IF EXISTS "Admins can manage all payouts" ON public.payouts;
CREATE POLICY "Admins can manage all payouts"
ON public.payouts
FOR ALL
TO authenticated
USING (is_user_admin())
WITH CHECK (is_user_admin());
