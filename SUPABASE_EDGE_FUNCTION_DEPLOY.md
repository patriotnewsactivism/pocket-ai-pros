# 🚀 Supabase Edge Function Deployment Guide

## What Changed

The bot-chat Edge Function has been updated to use **OpenAI (gpt-4o-mini)** instead of Lovable AI. This provides:
- ✅ More reliable service
- ✅ Better performance
- ✅ Cost-effective pricing
- ✅ Using your existing OpenAI API key

## Quick Deployment Steps

### Option 1: Deploy via Supabase Dashboard (Easiest)

1. **Go to Supabase Dashboard**
   - Visit: https://supabase.com/dashboard/project/mnklzzundmfwjnfaoqju
   - Navigate to: **Edge Functions** (in left sidebar)

2. **Create/Update bot-chat Function**
   - Click **"New Function"** or find existing **"bot-chat"** function
   - Function name: `bot-chat`
   - Copy the code from: `C:\pocket-ai-pros\supabase\functions\bot-chat\index.ts`
   - Paste into the editor
   - Click **"Deploy Function"**

3. **Set Environment Variables**
   - In the Edge Functions page, click **"Settings"** or **"Secrets"**
   - Add this secret:
     ```
     Key: OPENAI_API_KEY
     Value: [YOUR_OPENAI_API_KEY_FROM_.ENV_FILE]
     ```
   - Get your key from the `.env` file: `VITE_OPENAI_API_KEY`
   - Click **"Save"**

### Option 2: Deploy via Supabase CLI (Advanced)

**Prerequisites:**
```bash
# Install Supabase CLI if not already installed
npm install -g supabase

# Login to Supabase
supabase login
```

**Link Project:**
```bash
# Link to your Supabase project
supabase link --project-ref mnklzzundmfwjnfaoqju
```

**Set Environment Secret:**
```bash
# Set OpenAI API key (get from your .env file)
supabase secrets set OPENAI_API_KEY=your-openai-api-key-here
```

**Deploy Function:**
```bash
# Deploy the bot-chat function
supabase functions deploy bot-chat --no-verify-jwt

# Or deploy all functions
supabase functions deploy
```

**Verify Deployment:**
```bash
# List all functions
supabase functions list

# Check function logs
supabase functions logs bot-chat
```

## Verification

### 1. Check Function is Deployed

Visit: https://supabase.com/dashboard/project/mnklzzundmfwjnfaoqju/functions

You should see:
- ✅ **bot-chat** function listed
- ✅ Status: Active/Deployed
- ✅ Last deployed: Recent timestamp

### 2. Check Environment Variable is Set

In Supabase Dashboard → Edge Functions → Settings/Secrets:
- ✅ **OPENAI_API_KEY** is listed

### 3. Test the Function

**Method 1: Test from Dashboard**
- Click on the **bot-chat** function
- Click **"Invoke"** or **"Test"**
- Send test payload:
  ```json
  {
    "botId": "YOUR_BOT_ID",
    "message": "Hello!"
  }
  ```
- Should receive streaming response

**Method 2: Test from Your App**
- Go to: https://buildmybot.app/dashboard
- Open one of your bots
- Try sending a message
- Should receive AI response without errors

**Method 3: Check Logs**
- In Supabase Dashboard → Edge Functions → bot-chat → Logs
- Look for:
  ```
  [BOT-CHAT] Request received
  [BOT-CHAT] Input validated
  [BOT-CHAT] Calling OpenAI API
  [BOT-CHAT] Streaming response from OpenAI
  ```

## Troubleshooting

### Error: "OPENAI_API_KEY not configured"

**Cause:** Environment variable not set in Supabase

**Solution:**
1. Go to Supabase Dashboard → Edge Functions → Settings
2. Add secret: `OPENAI_API_KEY` with your OpenAI key
3. Redeploy the function

### Error: "Invalid OpenAI API key"

**Cause:** API key is incorrect or expired

**Solution:**
1. Verify your OpenAI API key at: https://platform.openai.com/api-keys
2. Generate a new key if needed
3. Update the secret in Supabase
4. Redeploy the function

### Error: 400 "Invalid request data"

**Cause:** Frontend is sending invalid data (this is now fixed in BotChat.tsx)

**Solution:**
- Deploy the updated frontend code (already done via git push)
- Clear browser cache
- Try again

### Error: "Rate limit exceeded"

**Cause:** Too many requests to OpenAI API

**Solution:**
- Wait a minute and try again
- Check your OpenAI usage at: https://platform.openai.com/usage
- Upgrade OpenAI plan if needed

### Function Logs Show Errors

**Check logs:**
```bash
supabase functions logs bot-chat --tail
```

Or in Supabase Dashboard → Edge Functions → bot-chat → Logs

Look for error messages and follow the specific guidance.

## Configuration Reference

### Edge Function Environment Variables

Set in: Supabase Dashboard → Edge Functions → Settings/Secrets

**Required:**
- `OPENAI_API_KEY` - Your OpenAI API key

**Already Set (by Supabase):**
- `SUPABASE_URL` - Auto-set by Supabase
- `SUPABASE_SERVICE_ROLE_KEY` - Auto-set by Supabase

### Frontend Environment Variables

Already set in Vercel (no changes needed):
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_OPENAI_API_KEY` (not used by Edge Function)

## API Costs (OpenAI gpt-4o-mini)

**Pricing:** (as of 2024)
- Input: $0.150 / 1M tokens
- Output: $0.600 / 1M tokens

**Example Costs:**
- 100 chat messages (~10K tokens): ~$0.01
- 1,000 chat messages (~100K tokens): ~$0.10
- 10,000 chat messages (~1M tokens): ~$1.00

Much more affordable than many alternatives!

## Security Notes

✅ **Best Practices Followed:**
- API key stored as Supabase secret (not in code)
- CORS headers properly configured
- Input validation with Zod
- Rate limiting error handling
- No API key exposed to frontend

⚠️ **Remember:**
- Never commit API keys to git
- Rotate API keys periodically
- Monitor OpenAI usage dashboard
- Set spending limits in OpenAI dashboard

## Files Changed

**Backend (Supabase Edge Function):**
- `supabase/functions/bot-chat/index.ts` - Switched to OpenAI

**Frontend:**
- `src/pages/BotChat.tsx` - Fixed conversationId null issue, added better logging

## Next Steps After Deployment

1. ✅ Deploy bot-chat function to Supabase
2. ✅ Set OPENAI_API_KEY in Supabase secrets
3. ✅ Test bot chat from your app
4. ✅ Monitor function logs for any issues
5. ✅ Check OpenAI usage dashboard

## Support

**Supabase Edge Functions Docs:**
https://supabase.com/docs/guides/functions

**OpenAI API Docs:**
https://platform.openai.com/docs/api-reference

**Check Function Logs:**
- Dashboard: https://supabase.com/dashboard/project/mnklzzundmfwjnfaoqju/functions
- CLI: `supabase functions logs bot-chat`

---

**Status:** Ready to deploy
**Last Updated:** November 17, 2024
