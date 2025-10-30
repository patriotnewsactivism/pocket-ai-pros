# BuildMyBot - Production Build Script for Windows
# This script creates an optimized production build

param(
    [switch]$Preview,
    [switch]$Dev
)

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  BuildMyBot - Production Build" -ForegroundColor Cyan
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
    Write-Host ""
}

# Run linter first
Write-Host "Running linter..." -ForegroundColor Yellow
npm run lint

if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "✗ Linting failed!" -ForegroundColor Red
    Write-Host "  Please fix linting errors before building" -ForegroundColor Yellow
    $response = Read-Host "Continue anyway? (y/N)"
    if ($response -ne "y" -and $response -ne "Y") {
        exit 1
    }
}

Write-Host ""
Write-Host "Building application..." -ForegroundColor Yellow

# Build based on mode
if ($Dev) {
    Write-Host "  Mode: Development" -ForegroundColor Gray
    npm run build:dev
} else {
    Write-Host "  Mode: Production" -ForegroundColor Gray
    npm run build
}

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✓ Build completed successfully!" -ForegroundColor Green
    Write-Host "  Output directory: ./dist" -ForegroundColor Cyan
    
    # Calculate build size
    if (Test-Path "dist") {
        $size = (Get-ChildItem -Path "dist" -Recurse | Measure-Object -Property Length -Sum).Sum
        $sizeInMB = [math]::Round($size / 1MB, 2)
        Write-Host "  Build size: $sizeInMB MB" -ForegroundColor Cyan
    }
    
    Write-Host ""
    
    # Preview if requested
    if ($Preview) {
        Write-Host "Starting preview server..." -ForegroundColor Yellow
        Write-Host "  Available at: http://localhost:4173" -ForegroundColor Green
        Write-Host ""
        npm run preview
    } else {
        Write-Host "To preview the build, run:" -ForegroundColor Yellow
        Write-Host "  npm run preview" -ForegroundColor White
        Write-Host "  or" -ForegroundColor Gray
        Write-Host "  ./build.ps1 -Preview" -ForegroundColor White
        Write-Host ""
    }
} else {
    Write-Host ""
    Write-Host "✗ Build failed!" -ForegroundColor Red
    exit 1
}
