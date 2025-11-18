-- Fix security issues from linter - drop trigger first
DROP TRIGGER IF EXISTS update_reseller_stats_on_user_change ON users;
DROP FUNCTION IF EXISTS trigger_update_reseller_on_user_change() CASCADE;
DROP FUNCTION IF EXISTS update_reseller_earnings() CASCADE;

-- Recreate functions with proper search_path
CREATE OR REPLACE FUNCTION update_reseller_earnings()
RETURNS void 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE resellers r
  SET 
    clients_count = (
      SELECT COUNT(*)
      FROM users u
      WHERE u.referred_by = (SELECT id FROM users WHERE id = r.user_id)
      AND u.plan != 'free'
    ),
    total_earnings = COALESCE((
      SELECT SUM(
        CASE 
          WHEN u.plan = 'starter' THEN 29 * r.commission_rate / 100
          WHEN u.plan = 'professional' THEN 99 * r.commission_rate / 100
          WHEN u.plan = 'executive' THEN 199 * r.commission_rate / 100
          WHEN u.plan = 'enterprise' THEN 399 * r.commission_rate / 100
          ELSE 0
        END
      )
      FROM users u
      WHERE u.referred_by = (SELECT id FROM users WHERE id = r.user_id)
      AND u.plan != 'free'
    ), 0);
END;
$$;

CREATE OR REPLACE FUNCTION trigger_update_reseller_on_user_change()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF (TG_OP = 'UPDATE' AND OLD.plan != NEW.plan) OR TG_OP = 'INSERT' THEN
    IF NEW.referred_by IS NOT NULL THEN
      PERFORM update_reseller_earnings();
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

-- Recreate trigger
CREATE TRIGGER update_reseller_stats_on_user_change
AFTER INSERT OR UPDATE OF plan ON users
FOR EACH ROW
EXECUTE FUNCTION trigger_update_reseller_on_user_change();

-- Drop the view and add RLS policy
DROP VIEW IF EXISTS reseller_clients;

CREATE POLICY "Resellers can view their referred clients"
ON users
FOR SELECT
TO authenticated
USING (
  referred_by = auth.uid()
);