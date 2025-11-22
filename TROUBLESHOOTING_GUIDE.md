# BuildMyBot.App - Troubleshooting Guide

Complete troubleshooting guide for deployment, development, and production issues.

---

## Table of Contents

1. [Build & Deployment Issues](#build--deployment-issues)
2. [Database & Supabase Issues](#database--supabase-issues)
3. [Payment & Stripe Issues](#payment--stripe-issues)
4. [Edge Function Issues](#edge-function-issues)
5. [Frontend Issues](#frontend-issues)
6. [Authentication Issues](#authentication-issues)
7. [Email & Notifications](#email--notifications)
8. [Performance Issues](#performance-issues)

---

## Build & Deployment Issues

### Issue: `npm install` fails

**Symptoms:**
```
npm ERR! code ERESOLVE
npm ERR! ERESOLVE could not resolve
```

**Solution:**
```bash
# Clear npm cache
npm cache clean --force

# Remove node_modules and package-lock.json
rm -rf node_modules package-lock.json

# Reinstall with legacy peer deps
npm install --legacy-peer-deps
```

**Prevention:**
- Use Node.js 18.x or 20.x (LTS versions)
- Keep package.json dependencies updated

---

### Issue: `npm run build` fails with TypeScript errors

**Symptoms:**
```
src/some-file.tsx:123:45 - error TS2345: Argument of type 'X' is not assignable to parameter of type 'Y'.
```

**Solution:**
```bash
# Check TypeScript version
npm ls typescript

# Clean build cache
rm -rf dist .vite node_modules/.vite

# Rebuild
npm run build
```

**Common TypeScript errors:**

1. **Missing type definitions:**
   ```bash
   npm install --save-dev @types/node @types/react @types/react-dom
   ```

2. **Incorrect import paths:**
   ```typescript
   // Bad
   import { Component } from '../../../components/Component'

   // Good (using @/ alias)
   import { Component } from '@/components/Component'
   ```

---

### Issue: Vercel deployment fails

**Symptoms:**
```
Error: Command "npm run build" exited with 1
```

**Solution:**

1. **Check build logs in Vercel dashboard**
2. **Verify environment variables:**
   - All `VITE_*` variables are set
   - No typos in variable names
   - Values don't have quotes (Vercel adds them)

3. **Test build locally:**
   ```bash
   npm run build
   npm run preview
   ```

4. **Check Node.js version:**
   - Set in Vercel: Settings → General → Node.js Version → 18.x

---

### Issue: Build succeeds but site is blank

**Symptoms:**
- Deployment successful
- Site loads but shows blank white page
- Console shows errors

**Solution:**

1. **Check browser console for errors**

2. **Verify base path in vite.config.ts:**
   ```typescript
   export default defineConfig({
     base: '/', // Should be '/' for root domain
   })
   ```

3. **Check environment variables:**
   ```bash
   # Vercel Dashboard → Settings → Environment Variables
   # Ensure all VITE_* variables are set for Production
   ```

4. **Verify index.html is loading:**
   - View page source
   - Check if script tags are present

---

## Database & Supabase Issues

### Issue: "Missing required environment variables"

**Symptoms:**
```
Error: Missing required environment variables: VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY
```

**Solution:**

1. **Create .env file:**
   ```bash
   cp .env.example .env
   ```

2. **Add Supabase credentials:**
   ```env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key-here
   ```

3. **Get credentials from Supabase:**
   - Dashboard → Settings → API
   - Copy Project URL and anon/public key

4. **Restart dev server:**
   ```bash
   npm run dev
   ```

---

### Issue: Database migrations fail

**Symptoms:**
```
Error: relation "users" does not exist
```

**Solution:**

1. **Check Supabase connection:**
   ```bash
   supabase status
   ```

2. **Link to project:**
   ```bash
   supabase link --project-ref your-project-ref
   ```

3. **Push migrations:**
   ```bash
   supabase db push
   ```

4. **Verify tables exist:**
   - Go to Supabase Dashboard → Database → Tables
   - Should see: users, bots, conversations, subscriptions, etc.

5. **If tables missing, manually run migrations:**
   ```bash
   # In Supabase Dashboard → SQL Editor
   # Copy contents of each migration file and run
   ```

---

### Issue: "Row Level Security policy violation"

**Symptoms:**
```
Error: new row violates row-level security policy for table "tablename"
```

**Solution:**

1. **Check if you're authenticated:**
   ```typescript
   const { data: { user } } = await supabase.auth.getUser()
   console.log('User:', user) // Should not be null
   ```

2. **Verify RLS policies exist:**
   ```sql
   -- In Supabase SQL Editor
   SELECT * FROM pg_policies WHERE tablename = 'your_table';
   ```

3. **For public tables (like reseller_applications):**
   ```sql
   -- Check policy allows INSERT for anonymous users
   CREATE POLICY "Anyone can submit reseller application"
   ON reseller_applications FOR INSERT
   WITH CHECK (true);
   ```

4. **For user-specific tables:**
   ```sql
   -- Ensure auth.uid() matches
   CREATE POLICY "Users can view own data"
   ON tablename FOR SELECT
   USING (auth.uid() = user_id);
   ```

---

### Issue: Supabase Edge Functions not deploying

**Symptoms:**
```
Error deploying function: Function not found
```

**Solution:**

1. **Check function structure:**
   ```
   supabase/functions/
     └── function-name/
         └── index.ts  # Must be named index.ts
   ```

2. **Deploy single function:**
   ```bash
   supabase functions deploy function-name
   ```

3. **Check logs:**
   ```bash
   supabase functions serve function-name
   ```

4. **Verify Deno import syntax:**
   ```typescript
   // Good
   import { serve } from "https://deno.land/std@0.190.0/http/server.ts"

   // Bad
   import { serve } from "deno/http/server.ts"
   ```

---

### Issue: `supabase start` fails with Docker error

**Symptoms:**
```
failed to inspect service: request returned 500 Internal Server Error for API route
check if the server supports the requested API version
```

**Root Cause:**
This error typically occurs when:
1. Docker Desktop is not running
2. Docker Desktop needs to be restarted
3. Docker API version mismatch
4. Docker Desktop is experiencing internal issues

**Solution:**

1. **Ensure Docker Desktop is running:**
   - Windows: Check system tray for Docker icon
   - Mac: Check menu bar for Docker icon
   - Should show "Docker Desktop is running"

2. **Restart Docker Desktop:**
   - Quit Docker Desktop completely
   - Wait 10-15 seconds
   - Start Docker Desktop again
   - Wait for it to fully start (icon shows green/running)

3. **If restart doesn't help, reset Docker:**
   ```powershell
   # Windows PowerShell
   # Quit Docker Desktop first, then:
   wsl --shutdown
   # Start Docker Desktop again
   ```

4. **Verify Docker is working:**
   ```bash
   docker ps
   # Should show running containers or empty list (not an error)
   ```

5. **Update Supabase CLI:**
   ```bash
   npm install supabase@latest
   # Or update package.json to "supabase": "^2.58.5"
   ```

6. **Try starting Supabase again:**
   ```bash
   npx supabase start
   ```

**Alternative: Use Remote Supabase Instead**

If local development with Docker continues to fail, you can work directly with your remote Supabase project:

1. **Link to remote project:**
   ```bash
   npx supabase link --project-ref your-project-ref
   ```

2. **Use remote database:**
   - Update `.env` with production Supabase credentials
   - All database operations will use remote instance
   - No need for `supabase start`

**Prevention:**
- Keep Docker Desktop updated
- Ensure Docker Desktop starts automatically with system
- Use Docker Desktop settings → General → "Start Docker Desktop when you log in"

---

## Payment & Stripe Issues

### Issue: Checkout session creation fails

**Symptoms:**
```
Error: Stripe secret key is not configured
```

**Solution:**

1. **Set Stripe secret in Edge Function environment:**
   ```bash
   # Supabase Dashboard → Edge Functions → Secrets
   STRIPE_SECRET_KEY=sk_test_... # Or sk_live_...
   ```

2. **Verify key format:**
   - Test: starts with `sk_test_`
   - Live: starts with `sk_live_`

3. **Check Edge Function code:**
   ```typescript
   const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "")
   ```

---

### Issue: Webhook not receiving events

**Symptoms:**
- Stripe dashboard shows webhook events as "Failed"
- Payments process but database not updated

**Solution:**

1. **Verify webhook endpoint URL:**
   ```
   https://[your-project].supabase.co/functions/v1/stripe-webhook
   ```

2. **Check webhook secret:**
   ```bash
   # Supabase Dashboard → Edge Functions → Secrets
   STRIPE_WEBHOOK_SECRET=whsec_...
   ```

3. **Test webhook locally:**
   ```bash
   # Install Stripe CLI
   stripe listen --forward-to http://localhost:54321/functions/v1/stripe-webhook

   # Trigger test event
   stripe trigger payment_intent.succeeded
   ```

4. **Check webhook events in Stripe:**
   - Dashboard → Developers → Webhooks
   - Click webhook → Recent deliveries
   - Check response status and errors

---

### Issue: Payment succeeds but subscription not created

**Symptoms:**
- Stripe shows successful payment
- User's subscription status still "free" in database

**Solution:**

1. **Check webhook handler logs:**
   ```bash
   # Supabase Dashboard → Edge Functions → Logs
   # Filter for stripe-webhook
   ```

2. **Verify event types are configured:**
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`

3. **Check database for subscription record:**
   ```sql
   SELECT * FROM subscriptions WHERE user_id = 'user-id';
   ```

4. **Manually create subscription if needed:**
   ```sql
   INSERT INTO subscriptions (user_id, plan, status, conversations_limit, bots_limit, price)
   VALUES ('user-id', 'professional', 'active', 300, 3, 99.00);
   ```

---

## Edge Function Issues

### Issue: Edge Function returns 500 error

**Symptoms:**
```
Error: Internal Server Error
```

**Solution:**

1. **Check function logs:**
   ```bash
   # Supabase Dashboard → Edge Functions → function-name → Logs
   ```

2. **Common causes:**

   **Missing environment variables:**
   ```typescript
   // Add validation
   const apiKey = Deno.env.get("OPENAI_API_KEY")
   if (!apiKey) {
     throw new Error("OPENAI_API_KEY not configured")
   }
   ```

   **CORS issues:**
   ```typescript
   // Add CORS headers to all responses
   const corsHeaders = {
     "Access-Control-Allow-Origin": "*",
     "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
   }

   return new Response(JSON.stringify(data), {
     headers: { ...corsHeaders, "Content-Type": "application/json" }
   })
   ```

   **Async/await issues:**
   ```typescript
   // Ensure all async functions are awaited
   const result = await someAsyncFunction()
   ```

3. **Test locally:**
   ```bash
   supabase functions serve function-name --env-file .env

   # In another terminal
   curl -X POST http://localhost:54321/functions/v1/function-name \
     -H "Content-Type: application/json" \
     -d '{"test": "data"}'
   ```

---

### Issue: OpenAI API errors in chatbot

**Symptoms:**
```
Error: OpenAI API request failed
```

**Solution:**

1. **Check API key:**
   ```bash
   # Should start with sk-proj_
   echo $OPENAI_API_KEY
   ```

2. **Verify quota:**
   - Go to https://platform.openai.com/usage
   - Check if you have available credits

3. **Check rate limits:**
   - Free tier: 3 requests per minute
   - Paid: 3,500 requests per minute

4. **Update Edge Function error handling:**
   ```typescript
   try {
     const response = await openai.chat.completions.create({...})
   } catch (error) {
     console.error('OpenAI Error:', error)
     return new Response(JSON.stringify({
       error: 'AI service temporarily unavailable'
     }), { status: 503 })
   }
   ```

---

## Frontend Issues

### Issue: "Failed to fetch" errors

**Symptoms:**
```
TypeError: Failed to fetch
```

**Solution:**

1. **Check API base URL:**
   ```env
   VITE_API_BASE_URL=https://your-project.supabase.co/functions/v1
   ```

2. **Verify CORS headers in Edge Functions**

3. **Check network tab in browser DevTools:**
   - Look for failed requests
   - Check request URL
   - Check response headers

4. **Test API endpoint directly:**
   ```bash
   curl https://your-project.supabase.co/functions/v1/function-name
   ```

---

### Issue: React Query errors

**Symptoms:**
```
Error: Query function must return a Promise
```

**Solution:**

1. **Ensure query function is async:**
   ```typescript
   // Bad
   const { data } = useQuery({
     queryKey: ['data'],
     queryFn: () => getData() // Not awaited
   })

   // Good
   const { data } = useQuery({
     queryKey: ['data'],
     queryFn: async () => await getData()
   })
   ```

2. **Check error handling:**
   ```typescript
   const { data, error, isLoading } = useQuery({
     queryKey: ['data'],
     queryFn: fetchData,
     retry: 1,
     onError: (error) => console.error('Query error:', error)
   })
   ```

---

### Issue: Routing not working after deployment

**Symptoms:**
- Homepage loads fine
- Direct navigation to /about shows 404

**Solution:**

1. **Vercel: Add `vercel.json`:**
   ```json
   {
     "rewrites": [
       { "source": "/(.*)", "destination": "/" }
     ]
   }
   ```

2. **Netlify: Add `_redirects` file:**
   ```
   /*    /index.html   200
   ```

3. **Apache: Add `.htaccess`:**
   ```apache
   <IfModule mod_rewrite.c>
     RewriteEngine On
     RewriteBase /
     RewriteRule ^index\.html$ - [L]
     RewriteCond %{REQUEST_FILENAME} !-f
     RewriteCond %{REQUEST_FILENAME} !-d
     RewriteRule . /index.html [L]
   </IfModule>
   ```

---

## Authentication Issues

### Issue: User can't sign up

**Symptoms:**
```
Error: User already exists
```

**Solution:**

1. **Check if user exists:**
   ```sql
   SELECT * FROM auth.users WHERE email = 'user@example.com';
   ```

2. **Delete test users:**
   ```sql
   -- Be careful with this!
   DELETE FROM auth.users WHERE email = 'test@example.com';
   ```

3. **Check Supabase Auth settings:**
   - Dashboard → Authentication → Settings
   - Ensure "Enable Email Confirmations" is configured correctly

---

### Issue: Email verification not sending

**Symptoms:**
- User signs up successfully
- No verification email received

**Solution:**

1. **Check Supabase Auth email settings:**
   - Dashboard → Authentication → Email Templates
   - Verify SMTP settings or use Supabase's email service

2. **Check spam folder**

3. **Test with different email provider:**
   - Gmail sometimes blocks emails
   - Try with Outlook or custom domain

4. **Disable email verification for testing:**
   - Dashboard → Authentication → Settings
   - Turn off "Enable Email Confirmations"

---

## Email & Notifications

### Issue: SendGrid emails not sending

**Symptoms:**
- No errors shown
- Emails not arriving

**Solution:**

1. **Verify API key:**
   ```bash
   # In Edge Function Secrets
   SENDGRID_API_KEY=SG.xxxxx
   ```

2. **Check sender verification:**
   - SendGrid Dashboard → Settings → Sender Authentication
   - Ensure FROM_EMAIL is verified

3. **Check SendGrid activity:**
   - Dashboard → Activity
   - Look for failed sends and reasons

4. **Test API key:**
   ```bash
   curl --request POST \
     --url https://api.sendgrid.com/v3/mail/send \
     --header "Authorization: Bearer $SENDGRID_API_KEY" \
     --header 'Content-Type: application/json' \
     --data '{"personalizations":[{"to":[{"email":"test@example.com"}]}],"from":{"email":"noreply@buildmybot.app"},"subject":"Test","content":[{"type":"text/plain","value":"Test"}]}'
   ```

---

## Performance Issues

### Issue: Slow page load times

**Symptoms:**
- Initial load takes > 3 seconds
- Lighthouse score < 70

**Solution:**

1. **Enable code splitting:**
   ```typescript
   // Use lazy loading
   const Dashboard = lazy(() => import('@/pages/Dashboard'))
   ```

2. **Optimize images:**
   ```bash
   # Use modern formats
   # Compress images
   # Add width/height attributes
   ```

3. **Check bundle size:**
   ```bash
   npm run build
   # Look at dist/ folder size
   # Target: < 500KB gzipped
   ```

4. **Enable Vercel Analytics:**
   - Dashboard → Analytics
   - Monitor real user metrics

---

### Issue: Database queries are slow

**Symptoms:**
- API responses take > 1 second
- Supabase dashboard shows slow queries

**Solution:**

1. **Add database indexes:**
   ```sql
   CREATE INDEX idx_users_email ON users(email);
   CREATE INDEX idx_bots_user_id ON bots(user_id);
   ```

2. **Optimize queries:**
   ```typescript
   // Bad: Select all columns
   const { data } = await supabase.from('users').select('*')

   // Good: Select only needed columns
   const { data } = await supabase.from('users').select('id, email, plan')
   ```

3. **Use query profiling:**
   ```sql
   EXPLAIN ANALYZE
   SELECT * FROM users WHERE email = 'test@example.com';
   ```

---

## Getting Help

### Before Asking for Help

1. **Check error logs:**
   - Browser console
   - Supabase logs
   - Vercel logs

2. **Search existing issues:**
   - GitHub Issues
   - Supabase forums
   - Stack Overflow

3. **Prepare debugging info:**
   - Error message (full stack trace)
   - Steps to reproduce
   - Environment (local, production, etc.)
   - Browser/Node version

### Where to Get Help

**Supabase Issues:**
- Supabase Discord: https://discord.supabase.com
- Supabase Docs: https://supabase.com/docs
- GitHub: https://github.com/supabase/supabase

**Stripe Issues:**
- Stripe Docs: https://stripe.com/docs
- Stripe Support: https://support.stripe.com

**BuildMyBot Issues:**
- Email: support@buildmybot.app
- Documentation: See all guides in repo

---

## Quick Reference

### Common Commands

```bash
# Development
npm run dev                 # Start dev server
npm run build              # Build for production
npm run preview            # Preview production build

# Supabase
supabase login             # Login to Supabase
supabase link              # Link to project
supabase db push           # Push migrations
supabase functions deploy  # Deploy Edge Functions
supabase functions serve   # Test locally

# Vercel
vercel                     # Deploy preview
vercel --prod              # Deploy production
vercel logs                # View logs

# Git
git status                 # Check changes
git add .                  # Stage all changes
git commit -m "message"    # Commit
git push                   # Push to remote
```

### Important URLs

```
Supabase Dashboard: https://supabase.com/dashboard
Stripe Dashboard: https://dashboard.stripe.com
Vercel Dashboard: https://vercel.com/dashboard
OpenAI Platform: https://platform.openai.com
SendGrid Dashboard: https://app.sendgrid.com
```

---

## Still Stuck?

If you've tried everything and still having issues:

1. **Create a minimal reproduction:**
   - Isolate the problem
   - Create smallest possible example
   - Share code or repo

2. **Contact support:**
   - Email: support@buildmybot.app
   - Include:
     - Full error message
     - Steps to reproduce
     - What you've already tried
     - Screenshots/logs

3. **Community help:**
   - Search Stack Overflow
   - Ask in Supabase Discord
   - Check GitHub issues

**Response time:** Usually within 24 hours (weekdays)

---

BuildMyBot.App
support@buildmybot.app
https://buildmybot.app
