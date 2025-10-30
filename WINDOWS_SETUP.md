# BuildMyBot - Windows Setup Guide

This guide will help you set up and run BuildMyBot on Windows using PowerShell.

## Prerequisites

Before you begin, ensure you have:

1. **Node.js** (version 18.x or higher)
   - Download from: https://nodejs.org/
   - Verify installation: `node --version`

2. **npm** (comes with Node.js)
   - Verify installation: `npm --version`

3. **PowerShell** (Windows 10/11 includes PowerShell by default)

## Quick Start

### 1. Initial Setup

Open PowerShell in the project directory and run:

```powershell
.\setup.ps1
```

This will:
- Check for Node.js and npm
- Install all dependencies
- Create `.env` file from template
- Verify the setup

### 2. Start Development Server

```powershell
.\dev.ps1
```

The application will be available at: `http://localhost:8080`

Press `Ctrl+C` to stop the server.

## PowerShell Scripts

### `setup.ps1` - Initial Setup
Sets up the project for the first time.

```powershell
.\setup.ps1
```

### `dev.ps1` - Development Server
Starts the Vite development server with hot reload.

```powershell
.\dev.ps1
```

Features:
- Hot module replacement (HMR)
- Fast refresh
- Available at http://localhost:8080

### `build.ps1` - Production Build
Creates an optimized production build.

```powershell
# Standard production build
.\build.ps1

# Build and preview
.\build.ps1 -Preview

# Development build (with source maps)
.\build.ps1 -Dev
```

Output: `./dist` folder

### `update.ps1` - Update Dependencies
Updates project dependencies.

```powershell
# Check for outdated packages
.\update.ps1 -Check

# Update within version ranges
.\update.ps1

# Force update to latest versions
.\update.ps1 -Force
```

### `clean.ps1` - Clean Build Artifacts
Removes build artifacts and caches.

```powershell
# Clean dist and cache
.\clean.ps1

# Also remove node_modules
.\clean.ps1 -Deep

# Remove everything (including lock files)
.\clean.ps1 -All
```

## Manual Commands

If you prefer using npm directly:

```powershell
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run linter
npm run lint
```

## Environment Configuration

The project uses environment variables for configuration. Edit the `.env` file:

```env
# API Configuration
VITE_API_BASE_URL=http://localhost:3000/api
VITE_API_TIMEOUT=30000

# Feature Flags
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_CHAT_WIDGET=true

# Environment
VITE_APP_ENV=development
```

## Troubleshooting

### Script Execution Policy Error

If you get an error about script execution policy:

```powershell
# Run this as Administrator
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### Port Already in Use

If port 8080 is already in use, you can:

1. Stop the process using that port
2. Or edit `vite.config.ts` to use a different port:

```typescript
server: {
  host: "::",
  port: 3000, // Change to your preferred port
}
```

### Node Modules Issues

If you encounter issues with node_modules:

```powershell
# Clean and reinstall
.\clean.ps1 -Deep
.\setup.ps1
```

### Build Errors

If the build fails:

1. Check for linting errors: `npm run lint`
2. Ensure all dependencies are installed: `npm install`
3. Try a clean build:
   ```powershell
   .\clean.ps1
   npm install
   .\build.ps1
   ```

## Project Structure

```
BuildMyBot/
├── src/
│   ├── components/     # React components
│   ├── pages/          # Page components
│   ├── lib/            # Utilities
│   ├── hooks/          # Custom hooks
│   ├── config/         # Configuration
│   └── assets/         # Images and static files
├── public/             # Public assets
├── dist/               # Production build (generated)
├── setup.ps1           # Setup script
├── dev.ps1             # Development server script
├── build.ps1           # Build script
├── update.ps1          # Update script
├── clean.ps1           # Clean script
└── .env                # Environment variables
```

## Features

### Current Features
- ✅ AI Chatbot Landing Page
- ✅ Responsive Design
- ✅ Contact Forms with Validation
- ✅ Reseller Application Form
- ✅ SEO Optimization
- ✅ Accessibility (WCAG Compliant)
- ✅ Error Handling
- ✅ Loading States
- ✅ API Integration Ready

### Backend Integration

The app is ready for backend integration. The mock API will be used until you configure a real backend:

1. Set up your backend API
2. Update `VITE_API_BASE_URL` in `.env`
3. The app will automatically switch from mock to real API

API endpoints expected:
- `POST /api/contact` - Contact form
- `POST /api/subscribe` - Newsletter
- `POST /api/reseller/apply` - Reseller application
- `POST /api/auth/signup` - User signup
- `GET /api/pricing` - Pricing data
- `GET /api/stats` - Dashboard statistics

## Deployment

### Build for Production

```powershell
.\build.ps1
```

The `dist` folder contains your production-ready app.

### Deploy to Hosting

You can deploy the `dist` folder to:

- **Vercel**: `npm install -g vercel && vercel`
- **Netlify**: Drag `dist` folder to Netlify dashboard
- **GitHub Pages**: Push `dist` to `gh-pages` branch
- **Any Static Host**: Upload `dist` folder contents

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review the error messages carefully
3. Ensure all prerequisites are installed
4. Try cleaning and reinstalling dependencies

## License

Copyright © 2025 BuildMyBot. All rights reserved.
