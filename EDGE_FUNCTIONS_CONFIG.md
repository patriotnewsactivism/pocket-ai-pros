# Edge Functions Configuration Guide

## Overview

This project uses Supabase Edge Functions (Deno runtime) for server-side operations. Edge Functions require environment variables to be configured **separately** from your frontend `.env` file.

**CRITICAL**: Variables without the `VITE_` prefix are **server-side only** and must be configured in the Supabase Dashboard, not just in your local `.env` file.

---

## Quick Configuration Checklist

- [ ] Configure server-side environment variables in Supabase Dashboard
- [ ] Set up local `.env` file for local Edge Function testing
- [ ] Test each Edge Function locally before deployment
- [ ] Verify secrets are deployed in production

---

## Environment Variables by Edge Function

### All Edge Functions Requiring Database Access

The following Edge Functions need database connectivity:

| Function Name | Required Variables | Purpose |
|---------------|-------------------|---------|
| `process-reseller-application` | `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` | Process reseller signups |
| `bot-chat` | `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `OPENAI_API_KEY` | AI chatbot backend |
| `_shared/supabaseClient` | `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` | Shared database client |

### Payment-Related Edge Functions

| Function Name | Required Variables | Purpose |
|---------------|-------------------|---------|
| `create-checkout-session` | `STRIPE_SECRET_KEY`, `PUBLIC_SITE_URL` | Create Stripe checkout |
| `check-subscription` | `STRIPE_SECRET_KEY` | Verify subscription status |
| `stripe-webhook` | `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` | Handle Stripe events |

### AI-Related Edge Functions

| Function Name | Required Variables | Purpose |
|---------------|-------------------|---------|
| `generate-chat-response` | `OPENAI_API_KEY` | Generate AI chat responses |
| `bot-chat` | `OPENAI_API_KEY` | AI conversation streaming |

---

## Complete Environment Variables Reference

### 🔐 Server-Side Only (Configure in Supabase Dashboard)

#### Database Access
```env
# Supabase URL (same as VITE_SUPABASE_URL but without VITE_ prefix)
SUPABASE_URL=https://your-project-ref.supabase.co

# Service Role Key - FULL ADMIN ACCESS - Never expose to client
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### Payment Processing
```env
# Stripe Secret Key - Server-side only
STRIPE_SECRET_KEY=sk_live_...

# Stripe Webhook Secret - For verifying webhook signatures
STRIPE_WEBHOOK_SECRET=whsec_...
```

#### AI Services
```env
# OpenAI API Key
OPENAI_API_KEY=sk-proj-...

```

#### Site Configuration
```env
# Public site URL for redirects
PUBLIC_SITE_URL=https://yourdomain.com
```

---

## Configuration Steps

### Step 1: Configure Supabase Dashboard Secrets

1. **Navigate to Edge Functions Settings**:
   ```
   https://supabase.com/dashboard/project/YOUR_PROJECT_ID/functions
   ```

2. **Access Secrets Management**:
   - Click on **"Edge Functions"** in the left sidebar
   - Click **"Settings"** tab
   - Scroll to **"Secrets"** section

3. **Add Each Secret**:
   Click **"Add new secret"** and add the following:

   | Secret Name | Example Value | Where to Get It |
   |-------------|---------------|-----------------|
   | `SUPABASE_URL` | `https://mnklzzundmfwjnfaoqju.supabase.co` | Same as `VITE_SUPABASE_URL` from Settings → API |
   | `SUPABASE_SERVICE_ROLE_KEY` | `eyJhbGciOiJIUzI1...` | Settings → API → service_role key |
   | `STRIPE_SECRET_KEY` | `sk_live_...` | https://dashboard.stripe.com/apikeys |
   | `STRIPE_WEBHOOK_SECRET` | `whsec_...` | https://dashboard.stripe.com/webhooks |
  | `OPENAI_API_KEY` | `sk-proj-...` | https://platform.openai.com/api-keys |
   | `PUBLIC_SITE_URL` | `https://yourdomain.com` | Your production domain |

4. **Click "Save"** after adding each secret

### Step 2: Configure Local Environment

For local testing with `supabase functions serve`:

1. **Create/Update `.env` file** in project root:
   ```bash
   cp .env.example .env
   ```

2. **Add all required server-side variables** (without `VITE_` prefix):
   ```env
   # Server-side variables
   SUPABASE_URL=https://mnklzzundmfwjnfaoqju.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
   STRIPE_SECRET_KEY=sk_test_...  # Use test key for local dev
   STRIPE_WEBHOOK_SECRET=whsec_...
   OPENAI_API_KEY=sk-proj-...
   PUBLIC_SITE_URL=http://localhost:5173
   ```

3. **NEVER commit `.env`** - it's in `.gitignore` for security

### Step 3: Test Locally

```bash
# Install Supabase CLI if not already installed
npm install -g supabase

# Test a specific function
supabase functions serve process-reseller-application --env-file .env

# In another terminal, invoke the function
curl -X POST http://localhost:54321/functions/v1/process-reseller-application \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "company": "Test Inc"
  }'
```

### Step 4: Deploy to Production

```bash
# Deploy all Edge Functions
supabase functions deploy

# Or deploy a specific function
supabase functions deploy process-reseller-application

# Verify deployment
supabase functions list
```

### Step 5: Verify Production Configuration

1. **Test Production Endpoint**:
   ```bash
   curl -X POST https://mnklzzundmfwjnfaoqju.supabase.co/functions/v1/process-reseller-application \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer YOUR_ANON_KEY" \
     -d '{"name":"Test","email":"test@example.com","company":"Test Inc"}'
   ```

2. **Check Function Logs**:
   ```
   Supabase Dashboard → Edge Functions → Select Function → Logs
   ```

3. **Look for common errors**:
   - `Invalid URL` → `SUPABASE_URL` not set
   - `JWTExpired` → `SUPABASE_SERVICE_ROLE_KEY` incorrect
   - `Stripe error` → `STRIPE_SECRET_KEY` not set
   - `401 Unauthorized` → Check CORS and authorization headers

---

## Common Issues & Troubleshooting

### Issue 1: "Invalid URL" Error

**Symptoms**:
```javascript
Error: Invalid URL
  at createClient (index.ts:18)
```

**Cause**: `SUPABASE_URL` is not set or empty

**Fix**:
1. Verify secret exists in Supabase Dashboard → Edge Functions → Secrets
2. Ensure variable name is exactly `SUPABASE_URL` (case-sensitive)
3. Redeploy the function: `supabase functions deploy <function-name>`

---

### Issue 2: Database Operations Fail Silently

**Symptoms**:
- No error messages
- Operations don't complete
- Empty responses

**Cause**: `SUPABASE_SERVICE_ROLE_KEY` is not set or incorrect

**Debug**:
```typescript
// Add to your Edge Function temporarily:
const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

console.log('SUPABASE_URL:', SUPABASE_URL ? '✅ Set' : '❌ Missing');
console.log('SUPABASE_SERVICE_ROLE_KEY:', SUPABASE_SERVICE_ROLE_KEY ? '✅ Set' : '❌ Missing');
```

**Fix**:
1. Get service role key: Supabase Dashboard → Settings → API → `service_role` (secret)
2. Add to secrets: Edge Functions → Settings → Secrets
3. Redeploy function

---

### Issue 3: Stripe Errors

**Symptoms**:
```
Error: No API key provided
Error: Invalid API Key
```

**Cause**: `STRIPE_SECRET_KEY` not configured

**Fix**:
1. Get key from: https://dashboard.stripe.com/apikeys
2. Use **test key** (`sk_test_...`) for development
3. Use **live key** (`sk_live_...`) for production
4. Add to Supabase Edge Function secrets
5. For webhooks, also configure `STRIPE_WEBHOOK_SECRET`

---

### Issue 4: CORS Errors

**Symptoms**:
```
Access to fetch blocked by CORS policy
```

**Cause**: Missing CORS headers or incorrect origin configuration

**Fix**: Ensure Edge Function includes CORS headers:
```typescript
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// In OPTIONS handler:
if (req.method === 'OPTIONS') {
  return new Response(null, { headers: corsHeaders });
}

// In all responses:
return new Response(
  JSON.stringify(data),
  { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
);
```

---

### Issue 5: Local Testing Works, Production Fails

**Cause**: Environment variables not synced to production

**Fix**:
1. Double-check all secrets in Supabase Dashboard
2. Redeploy after adding secrets:
   ```bash
   supabase functions deploy --no-verify-jwt
   ```
3. Check function logs in dashboard for specific error messages

---

## Security Best Practices

### ✅ DO:
- Store `SUPABASE_SERVICE_ROLE_KEY` only in Supabase Dashboard secrets
- Use test Stripe keys (`sk_test_`) for local development
- Rotate service role key quarterly
- Use environment-specific configurations (dev, staging, prod)
- Review Edge Function logs regularly for unauthorized access attempts

### ❌ DON'T:
- **NEVER** add `VITE_` prefix to `SUPABASE_SERVICE_ROLE_KEY`
- **NEVER** commit `.env` file to git
- **NEVER** hardcode secrets in Edge Function code
- **NEVER** expose service role key in client-side code
- **NEVER** use production Stripe keys in local development

---

## Environment Variable Validation Script

Create `scripts/validate-edge-function-env.ts`:

```typescript
// Run with: deno run --allow-env scripts/validate-edge-function-env.ts

const REQUIRED_VARS = [
  'SUPABASE_URL',
  'SUPABASE_SERVICE_ROLE_KEY',
  'STRIPE_SECRET_KEY',
  'STRIPE_WEBHOOK_SECRET',
  'OPENAI_API_KEY',
  'PUBLIC_SITE_URL',
];

const OPTIONAL_VARS: string[] = [];

console.log('🔍 Validating Edge Function Environment Variables\n');

let missingRequired = 0;
let missingOptional = 0;

console.log('Required Variables:');
REQUIRED_VARS.forEach(varName => {
  const value = Deno.env.get(varName);
  if (value) {
    console.log(`✅ ${varName}: Set (${value.substring(0, 20)}...)`);
  } else {
    console.log(`❌ ${varName}: MISSING`);
    missingRequired++;
  }
});

if (OPTIONAL_VARS.length > 0) {
  console.log('\nOptional Variables:');
  OPTIONAL_VARS.forEach(varName => {
    const value = Deno.env.get(varName);
    if (value) {
      console.log(`✅ ${varName}: Set`);
    } else {
      console.log(`⚠️  ${varName}: Not set (optional)`);
      missingOptional++;
    }
  });
}

console.log('\n' + '='.repeat(50));
if (missingRequired > 0) {
  console.log(`❌ ${missingRequired} required variable(s) missing!`);
  Deno.exit(1);
} else {
  console.log('✅ All required variables configured');
  if (missingOptional > 0) {
    console.log(`⚠️  ${missingOptional} optional variable(s) not set`);
  }
  Deno.exit(0);
}
```

---

## Function-Specific Configuration

### process-reseller-application

**Purpose**: Handles reseller application submissions

**Required Variables**:
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

**Configuration**:
```typescript
// supabase/functions/process-reseller-application/index.ts:18-19
const supabaseClient = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);
```

**Test**:
```bash
curl -X POST http://localhost:54321/functions/v1/process-reseller-application \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "company": "Tech Corp",
    "phone": "555-0100",
    "experience": "5 years",
    "expectedClients": 20
  }'
```

---

### bot-chat

**Purpose**: AI chatbot backend

**Required Variables**:
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `OPENAI_API_KEY`

**Test**:
```bash
curl -X POST http://localhost:54321/functions/v1/bot-chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello, how can you help me?"}'
```

---

### create-checkout-session

**Purpose**: Creates Stripe checkout sessions for payments

**Required Variables**:
- `STRIPE_SECRET_KEY`
- `PUBLIC_SITE_URL`

**Test**:
```bash
curl -X POST http://localhost:54321/functions/v1/create-checkout-session \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -d '{
    "priceId": "price_test_123",
    "successUrl": "/success",
    "cancelUrl": "/cancel"
  }'
```

---

### stripe-webhook

**Purpose**: Handles Stripe webhook events

**Required Variables**:
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`

**Setup**:
1. Configure webhook in Stripe Dashboard
2. Add webhook endpoint: `https://your-project.supabase.co/functions/v1/stripe-webhook`
3. Copy webhook secret to `STRIPE_WEBHOOK_SECRET`

---

## Deployment Checklist

Before deploying to production:

- [ ] All required environment variables configured in Supabase Dashboard
- [ ] Service role key is the **production** key, not test key
- [ ] Stripe keys are **live** keys (`sk_live_`), not test keys
- [ ] `PUBLIC_SITE_URL` points to production domain
- [ ] Webhook secrets configured in both Stripe and Supabase
- [ ] Functions tested locally with production-like data
- [ ] CORS headers configured correctly
- [ ] RLS policies reviewed and tested
- [ ] Function logs monitoring set up
- [ ] Error alerting configured (e.g., Sentry)

---

## Monitoring & Logging

### View Edge Function Logs

1. **Supabase Dashboard**:
   ```
   Dashboard → Edge Functions → Select Function → Logs tab
   ```

2. **Filter by Error Level**:
   - Click "Error" to see only errors
   - Click "Info" to see all logs

3. **Real-time Logs** (CLI):
   ```bash
   supabase functions logs process-reseller-application --tail
   ```

### Common Log Messages

| Log Message | Meaning | Action Required |
|-------------|---------|-----------------|
| `Missing required environment variables` | Env vars not set | Configure in dashboard |
| `Invalid API key` | Wrong Stripe/OpenAI key | Check and update secrets |
| `CORS error` | Missing CORS headers | Update function code |
| `Database connection failed` | RLS policy or network issue | Check Supabase status |

---

## Support

- **Supabase Edge Functions Docs**: https://supabase.com/docs/guides/functions
- **Environment Variables**: https://supabase.com/docs/guides/functions/secrets
- **Local Development**: https://supabase.com/docs/guides/functions/local-development

For project-specific issues, see:
- `SECURITY_REMEDIATION_PLAN.md` - Security configuration
- `AUTH_DEBUG.md` - Authentication troubleshooting
- `.env.example` - All environment variable templates
