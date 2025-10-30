# BuildMyBot - Development Server Script for Windows
# This script starts the Vite development server

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  BuildMyBot - Development Server" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if node_modules exists
if (-not (Test-Path "node_modules")) {
    Write-Host "✗ Dependencies not installed!" -ForegroundColor Red
    Write-Host "  Please run './setup.ps1' first" -ForegroundColor Yellow
    exit 1
}

# Check if .env file exists
if (-not (Test-Path ".env")) {
    Write-Host "! .env file not found" -ForegroundColor Yellow
    Write-Host "  Creating from template..." -ForegroundColor Gray
    Copy-Item ".env.example" ".env"
    Write-Host "✓ .env file created" -ForegroundColor Green
}

Write-Host "Starting development server..." -ForegroundColor Yellow
Write-Host "The app will be available at:" -ForegroundColor Cyan
Write-Host "  http://localhost:8080" -ForegroundColor Green
Write-Host ""
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Gray
Write-Host ""

# Start the development server
npm run dev
