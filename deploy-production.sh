#!/bin/bash

###############################################################################
# BuildMyBot.App - Automated Production Deployment Script
#
# This script automates the deployment of BuildMyBot.App to production
#
# Prerequisites:
# - Supabase CLI installed (npm install -g supabase)
# - Vercel CLI installed (npm install -g vercel)
# - All environment variables ready
#
# Usage: ./deploy-production.sh
###############################################################################

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Functions
print_header() {
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Check prerequisites
check_prerequisites() {
    print_header "Checking Prerequisites"

    # Check Node.js
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed"
        exit 1
    fi
    print_success "Node.js found: $(node --version)"

    # Check npm
    if ! command -v npm &> /dev/null; then
        print_error "npm is not installed"
        exit 1
    fi
    print_success "npm found: $(npm --version)"

    # Check Supabase CLI
    if ! command -v supabase &> /dev/null; then
        print_warning "Supabase CLI not found. Installing..."
        npm install -g supabase
    fi
    print_success "Supabase CLI found"

    # Check Vercel CLI
    if ! command -v vercel &> /dev/null; then
        print_warning "Vercel CLI not found. Installing..."
        npm install -g vercel
    fi
    print_success "Vercel CLI found"

    # Check .env file
    if [ ! -f .env ]; then
        print_error ".env file not found. Please create one from .env.example"
        exit 1
    fi
    print_success ".env file found"
}

# Install dependencies
install_dependencies() {
    print_header "Installing Dependencies"

    npm install

    print_success "Dependencies installed"
}

# Build frontend
build_frontend() {
    print_header "Building Frontend"

    npm run build

    if [ $? -eq 0 ]; then
        print_success "Frontend build successful"
    else
        print_error "Frontend build failed"
        exit 1
    fi
}

# Deploy Supabase migrations
deploy_supabase() {
    print_header "Deploying Supabase Database"

    print_info "Linking to Supabase project..."
    read -p "Enter your Supabase project ref: " project_ref

    supabase link --project-ref "$project_ref"

    print_info "Pushing database migrations..."
    supabase db push

    print_success "Supabase database deployed"
}

# Deploy Edge Functions
deploy_edge_functions() {
    print_header "Deploying Supabase Edge Functions"

    print_info "Deploying create-checkout-session..."
    supabase functions deploy create-checkout-session

    print_info "Deploying stripe-webhook..."
    supabase functions deploy stripe-webhook

    print_info "Deploying generate-chat-response..."
    supabase functions deploy generate-chat-response

    print_info "Deploying process-reseller-application..."
    supabase functions deploy process-reseller-application

    print_info "Deploying bot-chat..."
    supabase functions deploy bot-chat

    print_info "Deploying check-subscription..."
    supabase functions deploy check-subscription

    print_success "All Edge Functions deployed"
}

# Set Edge Function secrets
set_edge_function_secrets() {
    print_header "Setting Edge Function Secrets"

    print_warning "You need to set the following secrets in Supabase Dashboard:"
    echo "  → Edge Functions → Secrets"
    echo ""
    echo "Required secrets:"
    echo "  - SUPABASE_URL"
    echo "  - SUPABASE_SERVICE_ROLE_KEY"
    echo "  - STRIPE_SECRET_KEY"
    echo "  - STRIPE_WEBHOOK_SECRET"
    echo "  - OPENAI_API_KEY"
    echo "  - SENDGRID_API_KEY"
    echo "  - PUBLIC_SITE_URL"
    echo ""

    read -p "Press Enter after you've set all secrets in Supabase Dashboard..."

    print_success "Edge Function secrets configured"
}

# Deploy to Vercel
deploy_vercel() {
    print_header "Deploying to Vercel"

    print_info "Deploying to production..."
    vercel --prod

    print_success "Deployed to Vercel"
}

# Create admin user
create_admin_user() {
    print_header "Admin User Setup"

    print_info "You need to create an admin user in Supabase Dashboard:"
    echo "  1. Go to Authentication → Users"
    echo "  2. Click 'Add user' → 'Create new user'"
    echo "  3. Enter email and password"
    echo "  4. Copy the User ID"
    echo "  5. Go to SQL Editor and run:"
    echo ""
    echo "     INSERT INTO users (id, email, full_name, is_admin, plan, status)"
    echo "     VALUES ('[user-id]', 'admin@buildmybot.app', 'Admin User', true, 'enterprise', 'active')"
    echo "     ON CONFLICT (id) DO UPDATE SET is_admin = true;"
    echo ""

    read -p "Press Enter after creating admin user..."

    print_success "Admin user setup complete"
}

# Final verification
verify_deployment() {
    print_header "Deployment Verification"

    print_info "Testing deployment..."

    # Load .env file
    source .env

    echo ""
    echo "Please verify the following:"
    echo "  ✓ Frontend is accessible at your domain"
    echo "  ✓ Can sign up a new user"
    echo "  ✓ Can create a bot"
    echo "  ✓ Can test payment flow"
    echo "  ✓ Can apply as reseller"
    echo "  ✓ Admin can log in"
    echo ""

    read -p "Have you verified all the above? (yes/no): " verified

    if [ "$verified" = "yes" ]; then
        print_success "Deployment verified!"
    else
        print_warning "Please complete verification manually"
    fi
}

# Main deployment flow
main() {
    clear

    print_header "🚀 BuildMyBot.App Production Deployment"
    echo ""
    echo "This script will guide you through deploying BuildMyBot.App"
    echo "to production. The process takes approximately 30 minutes."
    echo ""
    read -p "Press Enter to continue..."

    check_prerequisites
    install_dependencies
    build_frontend

    echo ""
    read -p "Deploy Supabase database? (yes/no): " deploy_db
    if [ "$deploy_db" = "yes" ]; then
        deploy_supabase
        deploy_edge_functions
        set_edge_function_secrets
    fi

    echo ""
    read -p "Deploy to Vercel? (yes/no): " deploy_frontend
    if [ "$deploy_frontend" = "yes" ]; then
        deploy_vercel
    fi

    echo ""
    create_admin_user

    echo ""
    verify_deployment

    print_header "🎉 Deployment Complete!"

    echo ""
    echo "Next steps:"
    echo "  1. Configure custom domain in Vercel"
    echo "  2. Set up Stripe products and webhooks"
    echo "  3. Test complete user flow"
    echo "  4. Monitor error logs"
    echo "  5. Begin marketing and user acquisition"
    echo ""
    print_success "BuildMyBot.App is now live!"
}

# Run main function
main
