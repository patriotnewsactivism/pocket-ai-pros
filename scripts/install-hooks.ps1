# Install Git hooks for BuildMyBot (Windows PowerShell)
# Copies custom Git hooks from .git-hooks/ to .git/hooks/

$ErrorActionPreference = "Stop"

Write-Host "`nInstalling Git hooks...`n" -ForegroundColor Blue

if (-not (Test-Path ".git")) {
    Write-Host "Warning: .git directory not found" -ForegroundColor Yellow
    Write-Host "This script must be run from the root of a Git repository."
    exit 1
}

if (-not (Test-Path ".git\\hooks")) {
    New-Item -ItemType Directory -Path ".git\\hooks" | Out-Null
}

if (Test-Path ".git-hooks\\pre-commit") {
    Write-Host "Installing pre-commit hook..." -ForegroundColor Cyan

    # Read the file and convert CRLF to LF for Git Bash compatibility
    $content = Get-Content ".git-hooks\\pre-commit" -Raw
    $content = $content -replace "`r`n", "`n"
    $content = $content -replace "`r", ""

    $utf8NoBom = New-Object System.Text.UTF8Encoding $false
    [System.IO.File]::WriteAllText("$PWD\\.git\\hooks\\pre-commit", $content, $utf8NoBom)

    Write-Host "Pre-commit hook installed (LF line endings)." -ForegroundColor Green
}
else {
    Write-Host "Warning: .git-hooks\\pre-commit not found" -ForegroundColor Yellow
}

Write-Host "`nGit hooks installation complete" -ForegroundColor Green
Write-Host "Active hooks:"
Write-Host "  - pre-commit (prevents committing secrets and build artifacts)"
Write-Host ""
Write-Host "These hooks will run automatically on 'git commit'."
Write-Host "To bypass (not recommended): git commit --no-verify"
Write-Host ""
