# Email Verification Setup Guide

## Overview

Email verification is a critical security feature that prevents:
- Fake email signups
- Spam accounts
- Unauthorized access
- Invalid contact information

This guide explains how to enable and configure email verification for your BuildMyBot application.

## Current Implementation

The application code in `src/pages/Auth.tsx` is already configured to handle email verification:

1. When a user signs up, the code checks if email confirmation is required
2. If required, it displays a message asking the user to check their email
3. The user receives a confirmation email with a link
4. Clicking the link verifies the email and redirects to the dashboard
5. Only verified users can access the application

## How to Enable Email Verification

### Step 1: Access Supabase Dashboard

1. Go to: https://supabase.com/dashboard
2. Select your project
3. Navigate to: **Authentication** → **Providers** → **Email**

### Step 2: Enable Email Confirmation

1. Scroll down to find **"Email Confirmations"** section
2. Toggle **"Enable email confirmations"** to **ON**
3. Click **Save**

### Step 3: Configure Email Template (Optional)

Customize the confirmation email template:

1. Go to: **Authentication** → **Email Templates**
2. Select: **"Confirm signup"**
3. Customize the template with your branding

**Default template variables:**
- `{{ .ConfirmationURL }}` - The verification link
- `{{ .SiteURL }}` - Your site URL
- `{{ .Token }}` - The confirmation token

**Example template:**
```html
<h2>Confirm your signup</h2>

<p>Follow this link to confirm your email address:</p>
<p><a href="{{ .ConfirmationURL }}">Confirm your mail</a></p>

<p>If you didn't request this email, you can safely ignore it.</p>
```

### Step 4: Configure Redirect URLs

1. Go to: **Authentication** → **URL Configuration**
2. Add your redirect URLs:
   - Development: `http://localhost:8080/dashboard`
   - Production: `https://yourdomain.com/dashboard`
3. Click **Save**

### Step 5: Test Email Verification

1. Sign up with a new test email address
2. You should see the message: "Check your email"
3. Check your inbox for the confirmation email
4. Click the confirmation link
5. You should be redirected to the dashboard
6. Verify that you can log in

## Email Service Configuration

### Default (Supabase Email Service)

Supabase provides a built-in email service for testing, but it has limitations:
- ⚠️ Limited to 3 emails per hour in free tier
- ⚠️ May go to spam folder
- ⚠️ Not suitable for production

### Recommended: Custom SMTP

For production, configure a custom SMTP provider:

#### Option 1: SendGrid (Recommended)

**Pros:** Free tier (100 emails/day), reliable, easy setup

1. Sign up at: https://sendgrid.com
2. Get API key from: Settings → API Keys
3. In Supabase Dashboard:
   - Go to: **Project Settings** → **Auth**
   - Scroll to: **SMTP Settings**
   - Enable **"Use custom SMTP"**
   - Fill in:
     ```
     Host: smtp.sendgrid.net
     Port: 587
     Username: apikey
     Password: [Your SendGrid API Key]
     Sender email: noreply@yourdomain.com
     Sender name: BuildMyBot
     ```
4. Click **Save**

#### Option 2: AWS SES

**Pros:** Very cheap, scalable, reliable

1. Set up AWS SES: https://aws.amazon.com/ses/
2. Verify your domain
3. Get SMTP credentials
4. Configure in Supabase (same process as SendGrid)

#### Option 3: Mailgun

**Pros:** Free tier (5,000 emails/month), simple API

1. Sign up at: https://mailgun.com
2. Get SMTP credentials
3. Configure in Supabase

## Troubleshooting

### Issue: Emails not sending

**Check:**
1. SMTP credentials are correct
2. Sender email is verified in your email provider
3. Check Supabase logs: **Logs** → **Auth**

**Solution:**
- Verify email settings in Supabase Dashboard
- Check email provider dashboard for errors
- Test with a different email provider

### Issue: Emails going to spam

**Solution:**
1. Set up SPF records for your domain
2. Set up DKIM signing
3. Set up DMARC policy
4. Use a verified domain for sender email
5. Don't use free email addresses (gmail.com, etc.) as sender

**Example DNS Records:**
```
TXT @ v=spf1 include:sendgrid.net ~all
TXT default._domainkey.yourdomain.com [DKIM key from SendGrid]
TXT _dmarc.yourdomain.com v=DMARC1; p=none; rua=mailto:admin@yourdomain.com
```

### Issue: Users not receiving emails

**Common causes:**
1. Email in spam folder - Ask users to check spam
2. Email typo - Implement email validation
3. Corporate email filters - Ask IT to whitelist your domain
4. Daily limit reached - Upgrade your email service plan

### Issue: Confirmation link expired

**Solution:**
The default confirmation link expires after 24 hours. To resend:

1. Add a "Resend confirmation" button
2. Call this function:

```typescript
const { error } = await supabase.auth.resend({
  type: 'signup',
  email: userEmail,
  options: {
    emailRedirectTo: `${window.location.origin}/dashboard`
  }
});
```

## Security Best Practices

### 1. Always Enable Email Verification in Production

```typescript
// ❌ BAD: No email verification
await supabase.auth.signUp({
  email,
  password
});

// ✅ GOOD: With email verification enabled in Supabase dashboard
await supabase.auth.signUp({
  email,
  password,
  options: {
    emailRedirectTo: `${window.location.origin}/dashboard`
  }
});
```

### 2. Implement Rate Limiting

Prevent email bombing attacks:
- Limit signup attempts per IP
- Limit email resend attempts
- Use CAPTCHA on signup form

### 3. Validate Email Format

```typescript
import { z } from 'zod';

const emailSchema = z.string()
  .email('Invalid email address')
  .min(5)
  .max(100);
```

### 4. Monitor Email Deliverability

- Track bounce rates
- Monitor spam complaints
- Set up alerts for email delivery failures

### 5. Implement Email Change Verification

When users change their email:
- Require password confirmation
- Send verification to new email
- Keep old email active until verified
- Notify old email of the change

## Advanced: Custom Email Verification Flow

If you need more control, implement a custom verification flow:

### 1. Create Custom Email Template

```typescript
// supabase/functions/send-verification-email/index.ts
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

serve(async (req) => {
  const { email, userId, token } = await req.json();

  const verificationLink = `${Deno.env.get('SITE_URL')}/verify?token=${token}&user=${userId}`;

  // Send custom email using SendGrid/AWS SES/etc.
  // ...

  return new Response(JSON.stringify({ sent: true }), {
    headers: { 'Content-Type': 'application/json' }
  });
});
```

### 2. Create Verification Page

```typescript
// src/pages/Verify.tsx
export function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const userId = searchParams.get('user');

  useEffect(() => {
    async function verifyEmail() {
      const { error } = await supabase.auth.verifyOtp({
        token_hash: token,
        type: 'email'
      });

      if (error) {
        // Show error message
      } else {
        // Redirect to dashboard
      }
    }

    if (token && userId) {
      verifyEmail();
    }
  }, [token, userId]);

  return <div>Verifying your email...</div>;
}
```

## Testing Checklist

Before deploying to production:

- [ ] Email verification is enabled in Supabase dashboard
- [ ] Custom SMTP is configured (not using Supabase default)
- [ ] Sender email is verified
- [ ] Test signup with real email address
- [ ] Confirmation email arrives (check spam folder)
- [ ] Confirmation link works
- [ ] User is redirected to dashboard after verification
- [ ] Unverified users cannot access protected routes
- [ ] Resend confirmation works
- [ ] Email template is branded correctly
- [ ] SPF/DKIM/DMARC records are configured
- [ ] Emails not going to spam

## Monitoring

Track email verification metrics:

```sql
-- Get email verification stats
SELECT
  COUNT(*) as total_signups,
  COUNT(CASE WHEN email_confirmed_at IS NOT NULL THEN 1 END) as verified,
  COUNT(CASE WHEN email_confirmed_at IS NULL THEN 1 END) as unverified,
  ROUND(COUNT(CASE WHEN email_confirmed_at IS NOT NULL THEN 1 END) * 100.0 / COUNT(*), 2) as verification_rate
FROM auth.users
WHERE created_at > NOW() - INTERVAL '30 days';
```

## Support

For issues or questions:
- Supabase Auth docs: https://supabase.com/docs/guides/auth
- Email verification guide: https://supabase.com/docs/guides/auth/auth-email
- SMTP setup: https://supabase.com/docs/guides/auth/auth-smtp

## Summary

Email verification is now implemented in the application code. To activate it:

1. **Enable in Supabase Dashboard** (Authentication → Providers → Email)
2. **Configure custom SMTP** (recommended for production)
3. **Test the flow** (signup → check email → click link → verify)
4. **Monitor metrics** (track verification rates)

✅ The application is ready for email verification - just flip the switch in Supabase!
