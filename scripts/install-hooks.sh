#!/bin/bash
# Install Git hooks for BuildMyBot
# This script copies custom Git hooks from .git-hooks/ to .git/hooks/

set -e

RESET='\033[0m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'

echo -e "${BLUE}🔧 Installing Git hooks...${RESET}"
echo ""

# Check if .git directory exists
if [ ! -d ".git" ]; then
  echo -e "${YELLOW}⚠️  Warning: .git directory not found${RESET}"
  echo "This script must be run from the root of a Git repository."
  exit 1
fi

# Create hooks directory if it doesn't exist
mkdir -p .git/hooks

# Install pre-commit hook
if [ -f ".git-hooks/pre-commit" ]; then
  echo "📋 Installing pre-commit hook..."
  cp .git-hooks/pre-commit .git/hooks/pre-commit
  chmod +x .git/hooks/pre-commit
  echo -e "${GREEN}✅ Pre-commit hook installed${RESET}"
else
  echo -e "${YELLOW}⚠️  Warning: .git-hooks/pre-commit not found${RESET}"
fi

echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}"
echo -e "${GREEN}✅ Git hooks installation complete${RESET}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}"
echo ""
echo "The following hooks are now active:"
echo "  • pre-commit - Prevents committing sensitive credentials"
echo ""
echo "These hooks will run automatically on 'git commit'."
echo "To bypass (not recommended): git commit --no-verify"
echo ""
