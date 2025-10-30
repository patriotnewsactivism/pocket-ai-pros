# BuildMyBot - Update Script for Windows
# This script updates all dependencies to their latest versions

param(
    [switch]$Check,
    [switch]$Force
)

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  BuildMyBot - Update Dependencies" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if node_modules exists
if (-not (Test-Path "node_modules")) {
    Write-Host "✗ Dependencies not installed!" -ForegroundColor Red
    Write-Host "  Please run './setup.ps1' first" -ForegroundColor Yellow
    exit 1
}

if ($Check) {
    Write-Host "Checking for outdated packages..." -ForegroundColor Yellow
    Write-Host ""
    npm outdated
    Write-Host ""
    Write-Host "To update all packages, run:" -ForegroundColor Yellow
    Write-Host "  ./update.ps1" -ForegroundColor White
    Write-Host ""
    exit 0
}

Write-Host "Updating dependencies..." -ForegroundColor Yellow
Write-Host ""

if ($Force) {
    Write-Host "! Force mode: This will update to latest versions" -ForegroundColor Yellow
    Write-Host ""
    
    # Update all packages to latest
    npm update
    
    Write-Host ""
    Write-Host "Installing any missing dependencies..." -ForegroundColor Yellow
    npm install
} else {
    Write-Host "Updating within allowed version ranges..." -ForegroundColor Gray
    npm update
}

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✓ Dependencies updated successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "To check for outdated packages, run:" -ForegroundColor Yellow
    Write-Host "  ./update.ps1 -Check" -ForegroundColor White
    Write-Host ""
} else {
    Write-Host ""
    Write-Host "✗ Update failed!" -ForegroundColor Red
    exit 1
}
