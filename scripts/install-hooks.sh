#!/usr/bin/env bash
# Install Git hooks for BuildMyBot
# Copies custom Git hooks from .git-hooks/ to .git/hooks/

set -euo pipefail

printf "Installing Git hooks...

"

if [ ! -d ".git" ]; then
  printf "Warning: .git directory not found.
"
  printf "This script must be run from the root of a Git repository.
"
  exit 1
fi

mkdir -p .git/hooks

if [ -f ".git-hooks/pre-commit" ]; then
  printf "Installing pre-commit hook...
"
  cp .git-hooks/pre-commit .git/hooks/pre-commit
  chmod +x .git/hooks/pre-commit
  printf "Pre-commit hook installed.
"
else
  printf "Warning: .git-hooks/pre-commit not found.
"
fi

printf "
Git hooks installation complete.
"
printf "Active hooks:
"
printf "  - pre-commit (prevents committing secrets and build artifacts)
"
