-- Rate Limiting Migration for BuildMyBot
-- This migration adds rate limiting capabilities to prevent abuse of public endpoints
-- Run this AFTER the initial supabase-setup.sql

-- =============================================================================
-- 1. CREATE RATE LIMITING TABLE
-- =============================================================================

CREATE TABLE IF NOT EXISTS rate_limits (
    id SERIAL PRIMARY KEY,
    identifier TEXT NOT NULL, -- Can be IP address, user ID, or session ID
    action TEXT NOT NULL, -- e.g., 'contact_form', 'subscribe', 'chat_message'
    request_count INT DEFAULT 1,
    window_start TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_rate_limit UNIQUE(identifier, action, window_start)
);

CREATE INDEX IF NOT EXISTS idx_rate_limits_identifier ON rate_limits(identifier, action);
CREATE INDEX IF NOT EXISTS idx_rate_limits_window ON rate_limits(window_start);

-- Enable RLS
ALTER TABLE rate_limits ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert/update their own rate limit records
CREATE POLICY "Anyone can manage their rate limits" ON rate_limits
    FOR ALL USING (true) WITH CHECK (true);

-- =============================================================================
-- 2. CREATE RATE LIMITING FUNCTION
-- =============================================================================

CREATE OR REPLACE FUNCTION check_rate_limit(
    p_identifier TEXT,
    p_action TEXT,
    p_max_requests INT DEFAULT 5,
    p_window_minutes INT DEFAULT 15
) RETURNS BOOLEAN AS $$
DECLARE
    v_count INT;
    v_window_start TIMESTAMPTZ;
BEGIN
    -- Calculate the current window start time
    v_window_start := NOW() - (p_window_minutes || ' minutes')::INTERVAL;

    -- Clean up old rate limit records (older than window)
    DELETE FROM rate_limits
    WHERE window_start < NOW() - (p_window_minutes * 2 || ' minutes')::INTERVAL;

    -- Count requests in current window
    SELECT COALESCE(SUM(request_count), 0) INTO v_count
    FROM rate_limits
    WHERE identifier = p_identifier
        AND action = p_action
        AND window_start >= v_window_start;

    -- If under limit, increment counter and allow
    IF v_count < p_max_requests THEN
        INSERT INTO rate_limits (identifier, action, request_count, window_start)
        VALUES (p_identifier, p_action, 1, NOW())
        ON CONFLICT (identifier, action, window_start)
        DO UPDATE SET request_count = rate_limits.request_count + 1;

        RETURN true;
    END IF;

    -- Over limit
    RETURN false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================================================
-- 3. UPDATE RLS POLICIES WITH RATE LIMITING
-- =============================================================================

-- Drop existing overly permissive policies
DROP POLICY IF EXISTS "Anyone can submit contact forms" ON contacts;
DROP POLICY IF EXISTS "Anyone can subscribe" ON subscribers;
DROP POLICY IF EXISTS "Anyone can apply for reseller program" ON reseller_applications;
DROP POLICY IF EXISTS "Anyone can create chat sessions" ON chat_sessions;
DROP POLICY IF EXISTS "Anyone can send chat messages" ON chat_messages;
DROP POLICY IF EXISTS "Anyone can submit chat leads" ON chat_leads;

-- Create new policies with rate limiting
-- Note: These policies still allow public access but should be combined with
-- application-level rate limiting and CAPTCHA for production use

-- CONTACTS: Max 3 submissions per 15 minutes per IP
CREATE POLICY "Rate limited contact form submissions" ON contacts
    FOR INSERT
    WITH CHECK (
        check_rate_limit(
            COALESCE(current_setting('request.headers', true)::json->>'x-forwarded-for', '127.0.0.1'),
            'contact_form',
            3,  -- max 3 requests
            15  -- per 15 minutes
        )
    );

-- SUBSCRIBERS: Max 2 subscriptions per 60 minutes per IP
CREATE POLICY "Rate limited newsletter subscriptions" ON subscribers
    FOR INSERT
    WITH CHECK (
        check_rate_limit(
            COALESCE(current_setting('request.headers', true)::json->>'x-forwarded-for', '127.0.0.1'),
            'subscribe',
            2,  -- max 2 requests
            60  -- per 60 minutes
        )
    );

-- RESELLER APPLICATIONS: Max 1 application per 24 hours per IP
CREATE POLICY "Rate limited reseller applications" ON reseller_applications
    FOR INSERT
    WITH CHECK (
        check_rate_limit(
            COALESCE(current_setting('request.headers', true)::json->>'x-forwarded-for', '127.0.0.1'),
            'reseller_application',
            1,     -- max 1 request
            1440   -- per 24 hours (1440 minutes)
        )
    );

-- CHAT SESSIONS: Max 5 new sessions per hour per IP
CREATE POLICY "Rate limited chat session creation" ON chat_sessions
    FOR INSERT
    WITH CHECK (
        check_rate_limit(
            COALESCE(current_setting('request.headers', true)::json->>'x-forwarded-for', '127.0.0.1'),
            'chat_session',
            5,  -- max 5 requests
            60  -- per 60 minutes
        )
    );

-- CHAT MESSAGES: Max 60 messages per 15 minutes per session
CREATE POLICY "Rate limited chat messages" ON chat_messages
    FOR INSERT
    WITH CHECK (
        check_rate_limit(
            session_id,
            'chat_message',
            60, -- max 60 messages
            15  -- per 15 minutes
        )
    );

-- CHAT LEADS: Max 2 leads per hour per IP
CREATE POLICY "Rate limited chat lead capture" ON chat_leads
    FOR INSERT
    WITH CHECK (
        check_rate_limit(
            COALESCE(current_setting('request.headers', true)::json->>'x-forwarded-for', '127.0.0.1'),
            'chat_lead',
            2,  -- max 2 requests
            60  -- per 60 minutes
        )
    );

-- Keep existing SELECT policies unchanged
CREATE POLICY "Authenticated users can view contacts" ON contacts
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can view subscribers" ON subscribers
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can view applications" ON reseller_applications
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can view chat sessions" ON chat_sessions
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can view chat messages" ON chat_messages
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can view chat leads" ON chat_leads
    FOR SELECT USING (auth.role() = 'authenticated');

-- =============================================================================
-- 4. CREATE UTILITY FUNCTIONS FOR MONITORING
-- =============================================================================

-- Function to check current rate limit status
CREATE OR REPLACE FUNCTION get_rate_limit_status(
    p_identifier TEXT,
    p_action TEXT,
    p_window_minutes INT DEFAULT 15
) RETURNS JSON AS $$
DECLARE
    v_count INT;
    v_window_start TIMESTAMPTZ;
    v_result JSON;
BEGIN
    v_window_start := NOW() - (p_window_minutes || ' minutes')::INTERVAL;

    SELECT COALESCE(SUM(request_count), 0) INTO v_count
    FROM rate_limits
    WHERE identifier = p_identifier
        AND action = p_action
        AND window_start >= v_window_start;

    v_result := json_build_object(
        'identifier', p_identifier,
        'action', p_action,
        'count', v_count,
        'window_minutes', p_window_minutes,
        'window_start', v_window_start
    );

    RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================================================
-- NOTES FOR PRODUCTION DEPLOYMENT:
-- =============================================================================

-- 1. IP-based rate limiting relies on the 'x-forwarded-for' header
--    Make sure your reverse proxy (Cloudflare, Nginx, etc.) sets this correctly
--
-- 2. For additional security, implement CAPTCHA on forms:
--    - Google reCAPTCHA v3 (invisible)
--    - hCaptcha
--    - Cloudflare Turnstile
--
-- 3. Consider implementing application-level rate limiting in Edge Functions
--    for more granular control
--
-- 4. Monitor the rate_limits table size and implement cleanup:
--    - Run periodic cleanup (kept in check_rate_limit function)
--    - Consider archiving old records
--
-- 5. Adjust rate limits based on your traffic patterns:
--    - Lower limits for production launch
--    - Gradually increase based on legitimate usage patterns
--
-- 6. Set up monitoring and alerts:
--    - Track rate limit hits in your monitoring system
--    - Alert on suspicious patterns
--
-- 7. For authenticated users, consider more generous limits
--    by checking auth.uid() in the policies

-- Success message
DO $$
BEGIN
    RAISE NOTICE 'Rate limiting migration complete!';
    RAISE NOTICE 'Rate limits configured:';
    RAISE NOTICE '  - Contact forms: 3 per 15 minutes';
    RAISE NOTICE '  - Newsletter: 2 per 60 minutes';
    RAISE NOTICE '  - Reseller apps: 1 per 24 hours';
    RAISE NOTICE '  - Chat sessions: 5 per 60 minutes';
    RAISE NOTICE '  - Chat messages: 60 per 15 minutes';
    RAISE NOTICE '  - Chat leads: 2 per 60 minutes';
    RAISE NOTICE '';
    RAISE NOTICE 'IMPORTANT: Review the notes at the end of this migration file';
    RAISE NOTICE 'for production deployment best practices.';
END $$;
