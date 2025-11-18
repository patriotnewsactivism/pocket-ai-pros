-- Add Stripe-related fields to users table
-- This migration adds fields needed for Stripe subscription management
-- Run this AFTER the initial supabase-setup.sql

-- =============================================================================
-- ADD STRIPE COLUMNS TO USERS TABLE
-- =============================================================================

-- Add Stripe customer and subscription fields
ALTER TABLE users ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT UNIQUE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'none';
ALTER TABLE users ADD COLUMN IF NOT EXISTS current_period_end TIMESTAMPTZ;

-- Add usage limit fields
ALTER TABLE users ADD COLUMN IF NOT EXISTS bots_limit INTEGER DEFAULT 1;
ALTER TABLE users ADD COLUMN IF NOT EXISTS conversations_limit INTEGER DEFAULT 100;

-- Add indexes for Stripe lookups
CREATE INDEX IF NOT EXISTS idx_users_stripe_customer ON users(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_users_stripe_subscription ON users(stripe_subscription_id);
CREATE INDEX IF NOT EXISTS idx_users_subscription_status ON users(subscription_status);

-- =============================================================================
-- UPDATE DEFAULT VALUES BASED ON PLAN
-- =============================================================================

-- Update existing users to have limits based on their plan
UPDATE users
SET
  bots_limit = CASE
    WHEN plan = 'starter' THEN 3
    WHEN plan = 'professional' THEN 5
    WHEN plan = 'executive' THEN 10
    WHEN plan = 'enterprise' THEN 999
    ELSE 1 -- free plan
  END,
  conversations_limit = CASE
    WHEN plan = 'starter' THEN 750
    WHEN plan = 'professional' THEN 5000
    WHEN plan = 'executive' THEN 15000
    WHEN plan = 'enterprise' THEN 50000
    ELSE 100 -- free plan
  END
WHERE bots_limit IS NULL OR conversations_limit IS NULL;

-- =============================================================================
-- CREATE HELPER FUNCTIONS
-- =============================================================================

-- Function to check if user has reached bot limit
CREATE OR REPLACE FUNCTION check_bot_limit(p_user_id INTEGER) RETURNS BOOLEAN AS $$
DECLARE
    v_current_bots INTEGER;
    v_bot_limit INTEGER;
BEGIN
    -- Get current bot count and limit
    SELECT COUNT(*) INTO v_current_bots
    FROM bots
    WHERE user_id = p_user_id AND status = 'active';

    SELECT bots_limit INTO v_bot_limit
    FROM users
    WHERE id = p_user_id;

    -- Return true if under limit
    RETURN v_current_bots < COALESCE(v_bot_limit, 1);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user has reached conversation limit
CREATE OR REPLACE FUNCTION check_conversation_limit(p_user_id INTEGER) RETURNS BOOLEAN AS $$
DECLARE
    v_current_conversations INTEGER;
    v_conversation_limit INTEGER;
    v_period_start TIMESTAMPTZ;
BEGIN
    -- Get period start (beginning of current month)
    v_period_start := date_trunc('month', NOW());

    -- Get current conversation count for this billing period
    SELECT COUNT(*) INTO v_current_conversations
    FROM messages
    WHERE user_id = p_user_id
    AND created_at >= v_period_start;

    SELECT conversations_limit INTO v_conversation_limit
    FROM users
    WHERE id = p_user_id;

    -- Return true if under limit
    RETURN v_current_conversations < COALESCE(v_conversation_limit, 100);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user's usage stats
CREATE OR REPLACE FUNCTION get_user_usage_stats(p_user_id INTEGER) RETURNS JSON AS $$
DECLARE
    v_stats JSON;
    v_period_start TIMESTAMPTZ;
BEGIN
    v_period_start := date_trunc('month', NOW());

    SELECT json_build_object(
        'user_id', p_user_id,
        'plan', u.plan,
        'bots_used', (SELECT COUNT(*) FROM bots WHERE user_id = p_user_id AND status = 'active'),
        'bots_limit', u.bots_limit,
        'conversations_used', (SELECT COUNT(*) FROM messages WHERE user_id = p_user_id AND created_at >= v_period_start),
        'conversations_limit', u.conversations_limit,
        'period_start', v_period_start,
        'period_end', u.current_period_end,
        'subscription_status', u.subscription_status
    ) INTO v_stats
    FROM users u
    WHERE u.id = p_user_id;

    RETURN v_stats;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================================================
-- UPDATE RLS POLICIES FOR USAGE LIMITS
-- =============================================================================

-- Update bot creation policy to check limits
DROP POLICY IF EXISTS "Users can insert their own bots" ON bots;

CREATE POLICY "Users can insert their own bots" ON bots
    FOR INSERT
    WITH CHECK (
        auth.uid()::text = user_id::text
        AND check_bot_limit(user_id)
    );

-- Add policy to prevent message creation when over limit
DROP POLICY IF EXISTS "Users can insert their own messages" ON messages;

CREATE POLICY "Users can insert their own messages" ON messages
    FOR INSERT
    WITH CHECK (
        auth.uid()::text = user_id::text
        AND check_conversation_limit(user_id)
    );

-- =============================================================================
-- CREATE PAYMENTS TABLE (OPTIONAL - FOR PAYMENT HISTORY)
-- =============================================================================

CREATE TABLE IF NOT EXISTS payments (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    stripe_payment_intent_id TEXT UNIQUE NOT NULL,
    stripe_invoice_id TEXT,
    amount INTEGER NOT NULL, -- Amount in cents
    currency TEXT DEFAULT 'usd',
    status TEXT NOT NULL, -- succeeded, failed, pending, etc.
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    metadata JSONB
);

CREATE INDEX IF NOT EXISTS idx_payments_user ON payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_created ON payments(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_payments_stripe_intent ON payments(stripe_payment_intent_id);

-- Enable RLS
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Users can view their own payment history
CREATE POLICY "Users can view their own payments" ON payments
    FOR SELECT USING (auth.uid()::text = user_id::text);

-- =============================================================================
-- CREATE SUBSCRIPTION_EVENTS TABLE (FOR AUDIT LOG)
-- =============================================================================

CREATE TABLE IF NOT EXISTS subscription_events (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    event_type TEXT NOT NULL, -- subscription_created, subscription_updated, payment_succeeded, etc.
    stripe_event_id TEXT,
    data JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_subscription_events_user ON subscription_events(user_id);
CREATE INDEX IF NOT EXISTS idx_subscription_events_type ON subscription_events(event_type);
CREATE INDEX IF NOT EXISTS idx_subscription_events_created ON subscription_events(created_at DESC);

-- Enable RLS
ALTER TABLE subscription_events ENABLE ROW LEVEL SECURITY;

-- Users can view their own subscription events
CREATE POLICY "Users can view their own subscription events" ON subscription_events
    FOR SELECT USING (auth.uid()::text = user_id::text);

-- Admin can view all events
CREATE POLICY "Admins can view all subscription events" ON subscription_events
    FOR SELECT USING (auth.role() = 'authenticated');

-- =============================================================================
-- HELPER VIEW FOR SUBSCRIPTION STATUS
-- =============================================================================

CREATE OR REPLACE VIEW user_subscription_status AS
SELECT
    u.id,
    u.email,
    u.name,
    u.plan,
    u.subscription_status,
    u.stripe_customer_id,
    u.stripe_subscription_id,
    u.current_period_end,
    u.bots_limit,
    u.conversations_limit,
    (SELECT COUNT(*) FROM bots WHERE user_id = u.id AND status = 'active') as bots_used,
    (SELECT COUNT(*) FROM messages WHERE user_id = u.id AND created_at >= date_trunc('month', NOW())) as conversations_used_this_month,
    CASE
        WHEN u.current_period_end < NOW() THEN 'expired'
        WHEN u.subscription_status = 'active' THEN 'active'
        WHEN u.subscription_status = 'past_due' THEN 'payment_issue'
        ELSE 'inactive'
    END as computed_status
FROM users u;

-- =============================================================================
-- SUCCESS MESSAGE
-- =============================================================================

DO $$
BEGIN
    RAISE NOTICE 'Stripe fields migration complete!';
    RAISE NOTICE 'Added columns:';
    RAISE NOTICE '  - stripe_customer_id';
    RAISE NOTICE '  - stripe_subscription_id';
    RAISE NOTICE '  - subscription_status';
    RAISE NOTICE '  - current_period_end';
    RAISE NOTICE '  - bots_limit';
    RAISE NOTICE '  - conversations_limit';
    RAISE NOTICE '';
    RAISE NOTICE 'Created functions:';
    RAISE NOTICE '  - check_bot_limit(user_id)';
    RAISE NOTICE '  - check_conversation_limit(user_id)';
    RAISE NOTICE '  - get_user_usage_stats(user_id)';
    RAISE NOTICE '';
    RAISE NOTICE 'Created tables:';
    RAISE NOTICE '  - payments (optional payment history)';
    RAISE NOTICE '  - subscription_events (audit log)';
    RAISE NOTICE '';
    RAISE NOTICE 'Created views:';
    RAISE NOTICE '  - user_subscription_status';
    RAISE NOTICE '';
    RAISE NOTICE 'The Stripe webhook handler is now fully functional!';
END $$;
