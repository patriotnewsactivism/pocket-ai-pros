# BuildMyBot - Clean Script for Windows
# This script cleans build artifacts and optionally node_modules

param(
    [switch]$Deep,
    [switch]$All
)

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  BuildMyBot - Clean Build Artifacts" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$cleaned = $false

# Clean dist folder
if (Test-Path "dist") {
    Write-Host "Removing dist folder..." -ForegroundColor Yellow
    Remove-Item -Path "dist" -Recurse -Force
    Write-Host "✓ dist folder removed" -ForegroundColor Green
    $cleaned = $true
}

# Clean .vite cache
if (Test-Path ".vite") {
    Write-Host "Removing .vite cache..." -ForegroundColor Yellow
    Remove-Item -Path ".vite" -Recurse -Force
    Write-Host "✓ .vite cache removed" -ForegroundColor Green
    $cleaned = $true
}

# Deep clean: remove node_modules
if ($Deep -or $All) {
    if (Test-Path "node_modules") {
        Write-Host "Removing node_modules..." -ForegroundColor Yellow
        Write-Host "  This may take a moment..." -ForegroundColor Gray
        Remove-Item -Path "node_modules" -Recurse -Force
        Write-Host "✓ node_modules removed" -ForegroundColor Green
        $cleaned = $true
    }
}

# All clean: remove lock files too
if ($All) {
    if (Test-Path "package-lock.json") {
        Write-Host "Removing package-lock.json..." -ForegroundColor Yellow
        Remove-Item -Path "package-lock.json" -Force
        Write-Host "✓ package-lock.json removed" -ForegroundColor Green
        $cleaned = $true
    }
    if (Test-Path "bun.lockb") {
        Write-Host "Removing bun.lockb..." -ForegroundColor Yellow
        Remove-Item -Path "bun.lockb" -Force
        Write-Host "✓ bun.lockb removed" -ForegroundColor Green
        $cleaned = $true
    }
}

Write-Host ""

if ($cleaned) {
    Write-Host "✓ Clean completed successfully!" -ForegroundColor Green
    
    if ($Deep -or $All) {
        Write-Host ""
        Write-Host "To reinstall dependencies, run:" -ForegroundColor Yellow
        Write-Host "  ./setup.ps1" -ForegroundColor White
    }
} else {
    Write-Host "! Nothing to clean" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Available clean options:" -ForegroundColor Cyan
Write-Host "  ./clean.ps1          - Clean dist and cache" -ForegroundColor Gray
Write-Host "  ./clean.ps1 -Deep    - Also remove node_modules" -ForegroundColor Gray
Write-Host "  ./clean.ps1 -All     - Remove everything including lock files" -ForegroundColor Gray
Write-Host ""
