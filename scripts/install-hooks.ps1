# Install Git hooks for BuildMyBot (Windows PowerShell)
# This script copies custom Git hooks from .git-hooks/ to .git/hooks/

$ErrorActionPreference = "Stop"

Write-Host "`n🔧 Installing Git hooks...`n" -ForegroundColor Blue

# Check if .git directory exists
if (-not (Test-Path ".git")) {
    Write-Host "⚠️  Warning: .git directory not found" -ForegroundColor Yellow
    Write-Host "This script must be run from the root of a Git repository."
    exit 1
}

# Create hooks directory if it doesn't exist
if (-not (Test-Path ".git\hooks")) {
    New-Item -ItemType Directory -Path ".git\hooks" | Out-Null
}

# Install pre-commit hook
if (Test-Path ".git-hooks\pre-commit") {
    Write-Host "📋 Installing pre-commit hook..." -ForegroundColor Cyan

    # Read the file and convert CRLF to LF (Unix line endings)
    # This is critical for Git Bash compatibility on Windows
    $content = Get-Content ".git-hooks\pre-commit" -Raw
    $content = $content -replace "`r`n", "`n"

    # Write with UTF8 encoding without BOM and Unix line endings
    $utf8NoBom = New-Object System.Text.UTF8Encoding $false
    [System.IO.File]::WriteAllText("$PWD\.git\hooks\pre-commit", $content, $utf8NoBom)

    Write-Host "✅ Pre-commit hook installed (with LF line endings)" -ForegroundColor Green
} else {
    Write-Host "⚠️  Warning: .git-hooks\pre-commit not found" -ForegroundColor Yellow
}

Write-Host "`n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Green
Write-Host "✅ Git hooks installation complete" -ForegroundColor Green
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`n" -ForegroundColor Green

Write-Host "The following hooks are now active:"
Write-Host "  • pre-commit - Prevents committing sensitive credentials"
Write-Host ""
Write-Host "These hooks will run automatically on 'git commit'."
Write-Host "To bypass (not recommended): git commit --no-verify"
Write-Host ""
