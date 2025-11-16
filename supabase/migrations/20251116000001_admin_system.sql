-- Admin System for Payout Management
-- Adds admin role to users and enables admin access to payout management

-- Add is_admin column to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_admin boolean DEFAULT false;

-- Create index for faster admin lookups
CREATE INDEX IF NOT EXISTS idx_users_is_admin ON users(is_admin) WHERE is_admin = true;

-- Helper function to check if current user is admin
CREATE OR REPLACE FUNCTION is_user_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT COALESCE(
    (SELECT is_admin FROM users WHERE id = auth.uid()),
    false
  );
$$;

-- Grant execute permission on the function
GRANT EXECUTE ON FUNCTION is_user_admin() TO authenticated;

-- Update RLS policies on payouts table to allow admin access

-- Drop existing policies if they exist (to recreate them)
DROP POLICY IF EXISTS "Resellers can view own payouts" ON payouts;
DROP POLICY IF EXISTS "Resellers can insert own payouts" ON payouts;

-- Recreate policies with admin access
CREATE POLICY "Users can view own payouts or admins can view all"
ON payouts FOR SELECT
USING (
  auth.uid() = reseller_id
  OR is_user_admin()
);

CREATE POLICY "Resellers can insert own payouts"
ON payouts FOR INSERT
WITH CHECK (auth.uid() = reseller_id);

-- Admins can update any payout (for approval/rejection)
CREATE POLICY "Admins can update payouts"
ON payouts FOR UPDATE
USING (is_user_admin());

-- Add admin access policies to resellers table for viewing reseller details
CREATE POLICY "Admins can view all resellers"
ON resellers FOR SELECT
USING (is_user_admin() OR auth.uid() = user_id);

-- Add admin access to view all users (for reseller management)
CREATE POLICY "Admins can view all users"
ON users FOR SELECT
USING (is_user_admin() OR auth.uid() = id);

-- Add comments for documentation
COMMENT ON COLUMN users.is_admin IS 'Indicates if user has admin privileges for payout approval and management';
COMMENT ON FUNCTION is_user_admin IS 'Returns true if the current authenticated user is an admin';

-- Create a view for admin payout dashboard
CREATE OR REPLACE VIEW admin_payout_dashboard AS
SELECT
  p.id,
  p.reseller_id,
  p.amount,
  p.status,
  p.payout_method,
  p.payout_email,
  p.requested_at,
  p.reviewed_at,
  p.paid_at,
  p.review_notes,
  p.transaction_id,
  u.email as reseller_email,
  u.full_name as reseller_name,
  r.total_earnings as reseller_total_earnings,
  r.clients_count as reseller_clients_count,
  r.commission_rate as reseller_commission_rate
FROM payouts p
INNER JOIN resellers r ON p.reseller_id = r.user_id
INNER JOIN users u ON r.user_id = u.id
ORDER BY
  CASE p.status
    WHEN 'pending' THEN 1
    WHEN 'approved' THEN 2
    WHEN 'paid' THEN 3
    WHEN 'rejected' THEN 4
    WHEN 'cancelled' THEN 5
  END,
  p.requested_at DESC;

-- Grant access to the view
GRANT SELECT ON admin_payout_dashboard TO authenticated;

-- RLS policy for the view (admins only)
ALTER VIEW admin_payout_dashboard SET (security_invoker = on);
CREATE POLICY "Admins can view payout dashboard"
ON admin_payout_dashboard FOR SELECT
USING (is_user_admin());
