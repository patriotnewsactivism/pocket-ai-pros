-- Tracks payout requests, approvals, and payment history

-- Ensure each reseller has a single row so FK references work
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'resellers_user_id_key'
      AND conrelid = 'public.resellers'::regclass
  ) THEN
    ALTER TABLE public.resellers
      ADD CONSTRAINT resellers_user_id_key UNIQUE (user_id);
  END IF;
END;
$$;

-- Create payouts table
CREATE TABLE IF NOT EXISTS payouts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reseller_id uuid NOT NULL REFERENCES resellers(user_id) ON DELETE CASCADE,
  amount numeric NOT NULL CHECK (amount > 0),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'paid', 'rejected', 'cancelled')),
  payout_method text CHECK (payout_method IN ('paypal', 'stripe', 'wire', 'check')),
  payout_email text,
  payout_details jsonb DEFAULT '{}'::jsonb,

  -- Request details
  requested_at timestamp with time zone NOT NULL DEFAULT now(),
  requested_by uuid REFERENCES auth.users(id),

  -- Approval details
  reviewed_at timestamp with time zone,
  reviewed_by uuid REFERENCES auth.users(id),
  review_notes text,

  -- Payment details
  paid_at timestamp with time zone,
  paid_by uuid REFERENCES auth.users(id),
  transaction_id text,
  payment_notes text,

  -- Metadata
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),

  -- Constraints
  CONSTRAINT valid_payout_dates CHECK (
    reviewed_at IS NULL OR reviewed_at >= requested_at
  ),
  CONSTRAINT valid_payment_dates CHECK (
    paid_at IS NULL OR paid_at >= requested_at
  )
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_payouts_reseller_id ON payouts(reseller_id);
CREATE INDEX IF NOT EXISTS idx_payouts_status ON payouts(status);
CREATE INDEX IF NOT EXISTS idx_payouts_requested_at ON payouts(requested_at DESC);

-- Enable RLS
ALTER TABLE payouts ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Resellers can view their own payouts
CREATE POLICY "Resellers can view their own payouts"
ON payouts
FOR SELECT
TO authenticated
USING (reseller_id = auth.uid());

-- Resellers can create payout requests
CREATE POLICY "Resellers can create payout requests"
ON payouts
FOR INSERT
TO authenticated
WITH CHECK (
  reseller_id = auth.uid()
  AND status = 'pending'
  AND requested_by = auth.uid()
);

-- Resellers can cancel their pending payouts
CREATE POLICY "Resellers can cancel pending payouts"
ON payouts
FOR UPDATE
TO authenticated
USING (
  reseller_id = auth.uid()
  AND status = 'pending'
)
WITH CHECK (
  reseller_id = auth.uid()
  AND status = 'cancelled'
);

-- Admin users can view all payouts (for future admin interface)
-- Note: You'll need to create an admin role/table for this
-- CREATE POLICY "Admins can view all payouts"
-- ON payouts
-- FOR SELECT
-- TO authenticated
-- USING (
--   EXISTS (
--     SELECT 1 FROM admin_users
--     WHERE admin_users.user_id = auth.uid()
--   )
-- );

-- Function to request payout
CREATE OR REPLACE FUNCTION request_payout(
  p_amount numeric,
  p_payout_method text,
  p_payout_email text DEFAULT NULL,
  p_payout_details jsonb DEFAULT '{}'::jsonb
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_reseller_id uuid;
  v_available_earnings numeric;
  v_payout_id uuid;
  v_minimum_payout numeric := 50.00; -- Minimum payout amount
BEGIN
  -- Get reseller ID
  SELECT user_id INTO v_reseller_id
  FROM resellers
  WHERE user_id = auth.uid();

  IF v_reseller_id IS NULL THEN
    RAISE EXCEPTION 'User is not a reseller';
  END IF;

  -- Calculate available earnings (total - paid)
  SELECT (total_earnings - paid_earnings) INTO v_available_earnings
  FROM resellers
  WHERE user_id = v_reseller_id;

  -- Validate amount
  IF p_amount > v_available_earnings THEN
    RAISE EXCEPTION 'Payout amount (%) exceeds available earnings (%)', p_amount, v_available_earnings;
  END IF;

  IF p_amount < v_minimum_payout THEN
    RAISE EXCEPTION 'Minimum payout amount is $%', v_minimum_payout;
  END IF;

  -- Check for pending payouts
  IF EXISTS (
    SELECT 1 FROM payouts
    WHERE reseller_id = v_reseller_id
    AND status = 'pending'
  ) THEN
    RAISE EXCEPTION 'You already have a pending payout request';
  END IF;

  -- Create payout request
  INSERT INTO payouts (
    reseller_id,
    amount,
    status,
    payout_method,
    payout_email,
    payout_details,
    requested_by
  ) VALUES (
    v_reseller_id,
    p_amount,
    'pending',
    p_payout_method,
    COALESCE(p_payout_email, (SELECT email FROM auth.users WHERE id = v_reseller_id)),
    p_payout_details,
    auth.uid()
  )
  RETURNING id INTO v_payout_id;

  -- Update reseller pending earnings
  UPDATE resellers
  SET pending_earnings = pending_earnings + p_amount
  WHERE user_id = v_reseller_id;

  RETURN v_payout_id;
END;
$$;

-- Function to approve payout (for admin use)
CREATE OR REPLACE FUNCTION approve_payout(
  p_payout_id uuid,
  p_review_notes text DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Update payout status
  UPDATE payouts
  SET
    status = 'approved',
    reviewed_at = now(),
    reviewed_by = auth.uid(),
    review_notes = p_review_notes,
    updated_at = now()
  WHERE id = p_payout_id
  AND status = 'pending';

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Payout not found or not in pending status';
  END IF;
END;
$$;

-- Function to mark payout as paid (for admin use)
CREATE OR REPLACE FUNCTION mark_payout_paid(
  p_payout_id uuid,
  p_transaction_id text,
  p_payment_notes text DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_reseller_id uuid;
  v_amount numeric;
BEGIN
  -- Get payout details
  SELECT reseller_id, amount INTO v_reseller_id, v_amount
  FROM payouts
  WHERE id = p_payout_id
  AND status = 'approved';

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Payout not found or not in approved status';
  END IF;

  -- Update payout status
  UPDATE payouts
  SET
    status = 'paid',
    paid_at = now(),
    paid_by = auth.uid(),
    transaction_id = p_transaction_id,
    payment_notes = p_payment_notes,
    updated_at = now()
  WHERE id = p_payout_id;

  -- Update reseller earnings
  UPDATE resellers
  SET
    pending_earnings = pending_earnings - v_amount,
    paid_earnings = paid_earnings + v_amount,
    last_payout_date = now()
  WHERE user_id = v_reseller_id;
END;
$$;

-- Function to reject payout
CREATE OR REPLACE FUNCTION reject_payout(
  p_payout_id uuid,
  p_review_notes text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_reseller_id uuid;
  v_amount numeric;
BEGIN
  -- Get payout details
  SELECT reseller_id, amount INTO v_reseller_id, v_amount
  FROM payouts
  WHERE id = p_payout_id
  AND status = 'pending';

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Payout not found or not in pending status';
  END IF;

  -- Update payout status
  UPDATE payouts
  SET
    status = 'rejected',
    reviewed_at = now(),
    reviewed_by = auth.uid(),
    review_notes = p_review_notes,
    updated_at = now()
  WHERE id = p_payout_id;

  -- Update reseller pending earnings (remove the hold)
  UPDATE resellers
  SET pending_earnings = pending_earnings - v_amount
  WHERE user_id = v_reseller_id;
END;
$$;

-- Function to cancel payout request (by reseller)
CREATE OR REPLACE FUNCTION cancel_payout_request(
  p_payout_id uuid
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_reseller_id uuid;
  v_amount numeric;
BEGIN
  -- Get payout details and verify ownership
  SELECT reseller_id, amount INTO v_reseller_id, v_amount
  FROM payouts
  WHERE id = p_payout_id
  AND status = 'pending'
  AND reseller_id = auth.uid();

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Payout not found, not pending, or you do not have permission';
  END IF;

  -- Update payout status
  UPDATE payouts
  SET
    status = 'cancelled',
    updated_at = now()
  WHERE id = p_payout_id;

  -- Update reseller pending earnings (remove the hold)
  UPDATE resellers
  SET pending_earnings = pending_earnings - v_amount
  WHERE user_id = v_reseller_id;
END;
$$;

-- Add updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_payouts_updated_at
BEFORE UPDATE ON payouts
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Create view for reseller payout summary
CREATE OR REPLACE VIEW reseller_payout_summary AS
SELECT
  r.user_id as reseller_id,
  r.total_earnings,
  r.paid_earnings,
  r.pending_earnings,
  (r.total_earnings - r.paid_earnings - r.pending_earnings) as available_earnings,
  r.last_payout_date,
  COUNT(CASE WHEN p.status = 'pending' THEN 1 END) as pending_payout_count,
  COUNT(CASE WHEN p.status = 'paid' THEN 1 END) as completed_payout_count,
  COALESCE(SUM(CASE WHEN p.status = 'paid' THEN p.amount END), 0) as total_paid_out,
  MAX(p.paid_at) as last_payout_completed_at
FROM resellers r
LEFT JOIN payouts p ON p.reseller_id = r.user_id
GROUP BY r.user_id, r.total_earnings, r.paid_earnings, r.pending_earnings, r.last_payout_date;

-- Grant necessary permissions
GRANT SELECT ON reseller_payout_summary TO authenticated;

-- Add comment
COMMENT ON TABLE payouts IS 'Tracks reseller payout requests and payment history';
COMMENT ON FUNCTION request_payout IS 'Creates a new payout request for a reseller';
COMMENT ON FUNCTION approve_payout IS 'Approves a pending payout request (admin only)';
COMMENT ON FUNCTION mark_payout_paid IS 'Marks an approved payout as paid (admin only)';
COMMENT ON FUNCTION reject_payout IS 'Rejects a pending payout request (admin only)';
COMMENT ON FUNCTION cancel_payout_request IS 'Allows reseller to cancel their own pending payout';
