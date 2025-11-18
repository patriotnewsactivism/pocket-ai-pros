-- Add referral tracking columns to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS referred_by uuid REFERENCES users(id);
ALTER TABLE users ADD COLUMN IF NOT EXISTS referral_code text UNIQUE;

-- Generate unique referral codes for existing users
UPDATE users 
SET referral_code = LOWER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 8))
WHERE referral_code IS NULL;

-- Add columns to track reseller earnings
ALTER TABLE resellers ADD COLUMN IF NOT EXISTS pending_earnings numeric DEFAULT 0;
ALTER TABLE resellers ADD COLUMN IF NOT EXISTS paid_earnings numeric DEFAULT 0;
ALTER TABLE resellers ADD COLUMN IF NOT EXISTS last_payout_date timestamp with time zone;

-- Create reseller_clients view for easy tracking
CREATE OR REPLACE VIEW reseller_clients AS
SELECT 
  r.user_id as reseller_id,
  u.id as client_id,
  u.email as client_email,
  u.full_name as client_name,
  u.plan,
  u.created_at as signup_date,
  CASE 
    WHEN u.plan = 'starter' THEN 29
    WHEN u.plan = 'professional' THEN 99
    WHEN u.plan = 'executive' THEN 199
    WHEN u.plan = 'enterprise' THEN 399
    ELSE 0
  END as monthly_value,
  r.commission_rate
FROM users u
JOIN users reseller_user ON u.referred_by = reseller_user.id
JOIN resellers r ON r.user_id = reseller_user.id
WHERE u.plan != 'free';

-- Update resellers table with calculated earnings
CREATE OR REPLACE FUNCTION update_reseller_earnings()
RETURNS void AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a trigger to update reseller stats when user plans change
CREATE OR REPLACE FUNCTION trigger_update_reseller_on_user_change()
RETURNS TRIGGER AS $$
BEGIN
  IF (TG_OP = 'UPDATE' AND OLD.plan != NEW.plan) OR TG_OP = 'INSERT' THEN
    IF NEW.referred_by IS NOT NULL THEN
      PERFORM update_reseller_earnings();
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS update_reseller_stats_on_user_change ON users;
CREATE TRIGGER update_reseller_stats_on_user_change
AFTER INSERT OR UPDATE OF plan ON users
FOR EACH ROW
EXECUTE FUNCTION trigger_update_reseller_on_user_change();