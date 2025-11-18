# ⚡ Vercel Environment Variables - Quick Setup

## Copy-Paste Ready Values

### 1. Go to Vercel Dashboard
https://vercel.com/dashboard → Select your project → Settings → Environment Variables

### 2. Add These Exact Variables

#### Variable #1: Supabase URL
```
Name: VITE_SUPABASE_URL
Value: https://mnklzzundmfwjnfaoqju.supabase.co
Environments: ✅ Production ✅ Preview ✅ Development
```

#### Variable #2: Supabase Anon Key
```
Name: VITE_SUPABASE_ANON_KEY
Value: [GET FROM SUPABASE DASHBOARD - See below]
Environments: ✅ Production ✅ Preview ✅ Development
```

**To get your Anon Key:**
1. Go to: https://supabase.com/dashboard/project/mnklzzundmfwjnfaoqju/settings/api
2. Find section: **"Project API keys"**
3. Copy the key labeled: **"anon" "public"**
4. It starts with: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

---

## 3. Supabase Redirect URLs

### Go to Supabase Dashboard
https://supabase.com/dashboard/project/mnklzzundmfwjnfaoqju/auth/url-configuration

### Site URL
```
https://buildmybot.app
```

### Redirect URLs (Add all of these, one per line)
```
https://buildmybot.app/*
https://buildmybot.app/dashboard
https://buildmybot.app/auth
http://localhost:5173/*
http://localhost:5173/dashboard
http://localhost:8080/*
http://localhost:8080/dashboard
```

Click **Save**

---

## 4. After Setting Variables

**Trigger Redeploy:**

Option A - Via Git:
```bash
git commit --allow-empty -m "Configure Vercel environment variables"
git push
```

Option B - Via Vercel Dashboard:
1. Go to Deployments tab
2. Click "Redeploy" on latest deployment
3. Wait for deployment to complete

---

## 5. Verify It Works

1. Visit: **https://buildmybot.app**
2. Open browser DevTools (F12) → Console tab
3. Look for any Supabase errors
4. Go to: **https://buildmybot.app/auth**
5. Try signing up - should work without errors!

---

## Common Mistakes

❌ **WRONG**: Using `SUPABASE_URL` without `VITE_` prefix
✅ **CORRECT**: `VITE_SUPABASE_URL`

❌ **WRONG**: Only selecting "Production" environment
✅ **CORRECT**: Select all three: Production, Preview, Development

❌ **WRONG**: Not redeploying after adding variables
✅ **CORRECT**: Always redeploy after changing environment variables

❌ **WRONG**: Using `SUPABASE_SERVICE_ROLE_KEY` in Vercel
✅ **CORRECT**: Only use anon key in Vercel (service role key goes in Supabase Edge Functions)

---

## Still Not Working?

**Check if variables are loaded:**

1. Add this to `src/main.tsx` temporarily:
```typescript
console.log('ENV CHECK:', {
  url: import.meta.env.VITE_SUPABASE_URL,
  hasKey: !!import.meta.env.VITE_SUPABASE_ANON_KEY
});
```

2. Commit, push, wait for deployment
3. Visit https://buildmybot.app
4. Check console - should show:
```
ENV CHECK: {
  url: "https://mnklzzundmfwjnfaoqju.supabase.co",
  hasKey: true
}
```

If you see `url: undefined` or `hasKey: false`, the environment variables aren't set correctly in Vercel.

---

**That's it!** Once these are set and you redeploy, authentication should work perfectly on buildmybot.app.
