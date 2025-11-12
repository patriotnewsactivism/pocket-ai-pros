# Supabase Database Migrations

This directory contains SQL migration files for the BuildMyBot application. Migrations should be run in order after the initial database setup.

## Migration Order

### 1. Initial Setup (Required)
**File:** `../supabase-setup.sql`

Run this file first to create all base tables and initial RLS policies.

**How to run:**
1. Open your Supabase Dashboard: https://supabase.com/dashboard
2. Navigate to: SQL Editor
3. Copy the contents of `supabase-setup.sql`
4. Paste and click "Run"

### 2. Rate Limiting (Required for Production)
**File:** `001_rate_limiting.sql`

Adds rate limiting to prevent abuse of public endpoints.

**What it does:**
- Creates `rate_limits` table for tracking requests
- Implements `check_rate_limit()` function
- Updates RLS policies with rate limiting
- Configures sensible default limits

**Rate Limits Applied:**
- Contact forms: 3 submissions per 15 minutes per IP
- Newsletter subscriptions: 2 per hour per IP
- Reseller applications: 1 per 24 hours per IP
- Chat sessions: 5 per hour per IP
- Chat messages: 60 per 15 minutes per session
- Chat leads: 2 per hour per IP

**How to run:**
1. Open Supabase Dashboard → SQL Editor
2. Copy contents of `001_rate_limiting.sql`
3. Paste and click "Run"

## Important Security Notes

### IP-Based Rate Limiting Requirements

The rate limiting system relies on the `x-forwarded-for` HTTP header to identify clients by IP address. This header must be properly set by your hosting provider or reverse proxy.

**Supported Hosting Providers (Automatic):**
- ✅ **Vercel** - Automatically sets `x-forwarded-for`
- ✅ **Netlify** - Automatically sets `x-forwarded-for`
- ✅ **Cloudflare Pages** - Automatically sets `cf-connecting-ip` and `x-forwarded-for`
- ✅ **AWS Amplify** - Automatically sets `x-forwarded-for`
- ✅ **Railway** - Automatically sets `x-forwarded-for`

**If self-hosting:**
- Configure Nginx/Apache to set `X-Forwarded-For` header
- See [Nginx config example](#nginx-configuration)

### Additional Security Layers

While database-level rate limiting provides a good baseline, you should also implement:

1. **CAPTCHA (Recommended for Production)**
   - Add Google reCAPTCHA v3 or hCaptcha to forms
   - Prevents automated bot submissions
   - See: https://www.google.com/recaptcha

2. **Edge Function Rate Limiting**
   - Implement additional rate limiting in Supabase Edge Functions
   - Provides more granular control per endpoint
   - Example: Use `@upstash/ratelimit` library

3. **WAF/DDoS Protection**
   - Use Cloudflare (free plan available)
   - Provides DDoS protection and additional rate limiting
   - See: https://cloudflare.com

4. **Email Verification**
   - Require email verification for subscriptions
   - Prevents fake email submissions
   - Configured in Supabase Auth settings

## Nginx Configuration

If you're self-hosting behind Nginx, add this to your config:

```nginx
location / {
    proxy_pass http://your-app;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header Host $host;
}
```

## Monitoring Rate Limits

### Check Current Rate Limit Status

Run this query in SQL Editor to check rate limit status:

```sql
SELECT get_rate_limit_status('IP_ADDRESS', 'contact_form', 15);
```

### View Recent Rate Limit Activity

```sql
SELECT
    identifier,
    action,
    request_count,
    window_start,
    created_at
FROM rate_limits
WHERE window_start > NOW() - INTERVAL '1 hour'
ORDER BY created_at DESC
LIMIT 100;
```

### Clean Up Old Records

The `check_rate_limit()` function automatically cleans up old records, but you can manually clean up if needed:

```sql
DELETE FROM rate_limits
WHERE window_start < NOW() - INTERVAL '2 hours';
```

## Adjusting Rate Limits

To modify rate limits after deployment, update the policy parameters in Supabase Dashboard:

1. Go to: Database → Policies
2. Find the policy (e.g., "Rate limited contact form submissions")
3. Edit the policy and modify the `check_rate_limit()` parameters

**Parameter format:**
```sql
check_rate_limit(
    identifier,           -- IP or session ID
    'action_name',       -- Action type
    max_requests,        -- Maximum allowed requests
    window_minutes       -- Time window in minutes
)
```

**Example: Allow 5 contact form submissions per hour:**
```sql
CREATE POLICY "Rate limited contact form submissions" ON contacts
    FOR INSERT
    WITH CHECK (
        check_rate_limit(
            COALESCE(current_setting('request.headers', true)::json->>'x-forwarded-for', '127.0.0.1'),
            'contact_form',
            5,   -- Changed from 3 to 5
            60   -- Changed from 15 to 60 minutes
        )
    );
```

## Testing Rate Limits

### Local Testing

When testing locally, rate limiting will use the fallback IP `127.0.0.1`. To test properly:

1. Deploy to a staging environment with proper reverse proxy
2. Or, temporarily increase limits during development
3. Or, mock the `x-forwarded-for` header in your tests

### Production Testing

1. Test with a single IP address
2. Submit forms multiple times
3. Verify rate limit error appears after limit is reached
4. Wait for the window to expire and test again

## Troubleshooting

### Issue: Rate limits not working

**Possible causes:**
1. Migration not run - Check if `rate_limits` table exists
2. `x-forwarded-for` header not set - Check your hosting provider config
3. Function not created - Verify `check_rate_limit()` function exists

**Solution:**
```sql
-- Check if table exists
SELECT * FROM rate_limits LIMIT 1;

-- Check if function exists
SELECT * FROM pg_proc WHERE proname = 'check_rate_limit';

-- Test header
SELECT current_setting('request.headers', true)::json->>'x-forwarded-for';
```

### Issue: Legitimate users getting blocked

**Solution:**
- Increase rate limits for the affected action
- Consider implementing authentication-based exemptions
- Add IP whitelist for known good IPs

### Issue: Rate limits table growing too large

**Solution:**
The function includes automatic cleanup, but you can add a scheduled job:

1. Go to: Database → Extensions
2. Enable `pg_cron` extension
3. Add cleanup job:

```sql
SELECT cron.schedule(
    'cleanup-rate-limits',
    '0 * * * *', -- Every hour
    $$ DELETE FROM rate_limits WHERE window_start < NOW() - INTERVAL '2 hours' $$
);
```

## Support

For issues or questions:
- Check the main documentation in `../SETUP_INSTRUCTIONS.md`
- Review Supabase RLS docs: https://supabase.com/docs/guides/auth/row-level-security
- Open an issue in the project repository

## Future Enhancements

Planned improvements for rate limiting:

- [ ] Per-user rate limits (authenticated users)
- [ ] Admin dashboard for monitoring
- [ ] Automatic IP blocking after threshold
- [ ] Integration with Supabase Realtime for live monitoring
- [ ] Rate limit analytics and reporting
