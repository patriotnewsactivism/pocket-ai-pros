#!/bin/bash

# Webhook Deployment Script
# This script deploys the Stripe webhook handler to Supabase Edge Functions

set -e

echo "🚀 Deploying Stripe Webhook to Supabase..."
echo ""

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI is not installed."
    echo "📦 Install it with: npm install -g supabase"
    exit 1
fi

echo "✅ Supabase CLI found"
echo ""

# Check if logged in
if ! supabase projects list &> /dev/null; then
    echo "❌ Not logged in to Supabase"
    echo "🔐 Please run: supabase login"
    exit 1
fi

echo "✅ Logged in to Supabase"
echo ""

# Check if project is linked
if [ ! -f "supabase/.temp/project-ref" ]; then
    echo "⚠️  Project not linked yet"
    echo "🔗 Linking to project: <your-project-ref>"
    supabase link --project-ref <your-project-ref>
fi

echo "✅ Project linked"
echo ""

# Deploy stripe-webhook function
echo "📤 Deploying stripe-webhook function..."
supabase functions deploy stripe-webhook --no-verify-jwt

echo ""
echo "✅ Webhook deployed successfully!"
echo ""
echo "📋 Next steps:"
echo "   1. Add environment variables in Supabase Dashboard:"
echo "      - STRIPE_SECRET_KEY"
echo "      - STRIPE_WEBHOOK_SECRET"
echo "      - SUPABASE_URL"
echo "      - SUPABASE_SERVICE_ROLE_KEY"
echo ""
echo "   2. Configure Stripe webhook endpoint:"
echo "      URL: https://<your-project-ref>.supabase.co/functions/v1/stripe-webhook"
echo ""
echo "   3. Add VITE_STRIPE_PUBLIC_KEY to your .env file"
echo ""
echo "   4. Test the webhook with Stripe CLI:"
echo "      stripe listen --forward-to https://<your-project-ref>.supabase.co/functions/v1/stripe-webhook"
echo ""
echo "✅ Deployment complete!"
