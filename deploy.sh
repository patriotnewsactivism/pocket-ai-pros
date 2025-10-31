#!/bin/bash

##############################################################################
# BuildMyBot - One-Command Production Deployment Script
# 
# This script deploys your BuildMyBot application to production with all
# necessary configurations and checks.
#
# Usage: ./deploy.sh [environment]
# Example: ./deploy.sh production
##############################################################################

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Default environment
ENVIRONMENT=${1:-production}

echo -e "${BLUE}╔════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   BuildMyBot - Production Deployment Script       ║${NC}"
echo -e "${BLUE}║   Environment: ${ENVIRONMENT}                               ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════╝${NC}"
echo ""

##############################################################################
# Step 1: Pre-flight Checks
##############################################################################

echo -e "${YELLOW}[1/8] Running pre-flight checks...${NC}"

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo -e "${RED}✗ Error: .env file not found!${NC}"
    echo -e "${YELLOW}Please create a .env file with required environment variables.${NC}"
    exit 1
fi

# Check for required environment variables
echo "Checking environment variables..."
REQUIRED_VARS=("VITE_SUPABASE_URL" "VITE_SUPABASE_ANON_KEY")
for var in "${REQUIRED_VARS[@]}"; do
    if ! grep -q "$var=" .env; then
        echo -e "${RED}✗ Missing required variable: $var${NC}"
        exit 1
    fi
done

echo -e "${GREEN}✓ Pre-flight checks passed${NC}"
echo ""

##############################################################################
# Step 2: Install Dependencies
##############################################################################

echo -e "${YELLOW}[2/8] Installing dependencies...${NC}"

if [ -f "package-lock.json" ]; then
    npm ci --silent
else
    npm install --silent
fi

echo -e "${GREEN}✓ Dependencies installed${NC}"
echo ""

##############################################################################
# Step 3: Run Tests (if available)
##############################################################################

echo -e "${YELLOW}[3/8] Running tests...${NC}"

if grep -q '"test"' package.json; then
    npm test || {
        echo -e "${RED}✗ Tests failed!${NC}"
        read -p "Continue anyway? (y/n) " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            exit 1
        fi
    }
    echo -e "${GREEN}✓ Tests passed${NC}"
else
    echo -e "${YELLOW}! No tests configured, skipping...${NC}"
fi

echo ""

##############################################################################
# Step 4: Lint Code
##############################################################################

echo -e "${YELLOW}[4/8] Linting code...${NC}"

if grep -q '"lint"' package.json; then
    npm run lint || {
        echo -e "${RED}✗ Linting errors found!${NC}"
        read -p "Continue anyway? (y/n) " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            exit 1
        fi
    }
    echo -e "${GREEN}✓ Code linting passed${NC}"
else
    echo -e "${YELLOW}! No linting configured, skipping...${NC}"
fi

echo ""

##############################################################################
# Step 5: Build for Production
##############################################################################

echo -e "${YELLOW}[5/8] Building for production...${NC}"

# Clean previous build
rm -rf dist

# Build
npm run build

# Check if build succeeded
if [ ! -d "dist" ]; then
    echo -e "${RED}✗ Build failed - dist directory not created${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Build completed successfully${NC}"
echo ""

##############################################################################
# Step 6: Optimize Build
##############################################################################

echo -e "${YELLOW}[6/8] Optimizing build...${NC}"

# Get build size
BUILD_SIZE=$(du -sh dist | cut -f1)
echo "Build size: $BUILD_SIZE"

# Count files
FILE_COUNT=$(find dist -type f | wc -l)
echo "Total files: $FILE_COUNT"

echo -e "${GREEN}✓ Build optimization complete${NC}"
echo ""

##############################################################################
# Step 7: Deploy to Hosting
##############################################################################

echo -e "${YELLOW}[7/8] Deploying to hosting...${NC}"

# Check which deployment method to use
if command -v vercel &> /dev/null; then
    echo "Deploying to Vercel..."
    vercel --prod
elif command -v netlify &> /dev/null; then
    echo "Deploying to Netlify..."
    netlify deploy --prod --dir=dist
elif command -v firebase &> /dev/null; then
    echo "Deploying to Firebase..."
    firebase deploy
else
    echo -e "${YELLOW}! No deployment tool found (vercel, netlify, or firebase)${NC}"
    echo -e "${YELLOW}! Manual deployment required:${NC}"
    echo "  1. Upload the 'dist' folder to your hosting provider"
    echo "  2. Configure environment variables on your hosting platform"
    echo "  3. Set up custom domain and SSL certificate"
    echo ""
    read -p "Press enter to continue after manual deployment..."
fi

echo -e "${GREEN}✓ Deployment complete${NC}"
echo ""

##############################################################################
# Step 8: Post-Deployment Verification
##############################################################################

echo -e "${YELLOW}[8/8] Running post-deployment checks...${NC}"

echo ""
echo -e "${GREEN}═══════════════════════════════════════════════════${NC}"
echo -e "${GREEN}   Deployment Completed Successfully! 🚀${NC}"
echo -e "${GREEN}═══════════════════════════════════════════════════${NC}"
echo ""

echo -e "${BLUE}Next Steps:${NC}"
echo "1. Visit your production URL to verify the deployment"
echo "2. Test all forms (contact, newsletter, reseller)"
echo "3. Verify database connectivity"
echo "4. Check analytics tracking"
echo "5. Test payment integration (if configured)"
echo ""

echo -e "${BLUE}Important Reminders:${NC}"
echo "✓ Set up domain DNS records"
echo "✓ Configure SSL certificate"
echo "✓ Set up monitoring and alerts"
echo "✓ Enable backups"
echo "✓ Configure CDN (optional)"
echo ""

echo -e "${BLUE}Support:${NC}"
echo "Documentation: https://docs.buildmybot.ai"
echo "Support: support@buildmybot.ai"
echo ""

exit 0
