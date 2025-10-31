# BuildMyBot - Deployment Guide

This guide covers deploying your BuildMyBot application to various platforms.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Building for Production](#building-for-production)
- [Deployment Platforms](#deployment-platforms)
  - [Vercel](#vercel)
  - [Netlify](#netlify)
  - [GitHub Pages](#github-pages)
  - [Traditional Hosting](#traditional-hosting)
- [Environment Variables](#environment-variables)
- [Backend Integration](#backend-integration)
- [Post-Deployment](#post-deployment)

## Prerequisites

Before deploying, ensure:

1. ✅ All tests pass
2. ✅ Build completes successfully
3. ✅ Environment variables are configured
4. ✅ Backend API is set up (if using real API)

## Building for Production

### On Windows (PowerShell)

```powershell
# Standard production build
.\build.ps1

# With preview
.\build.ps1 -Preview
```

### Manual Build

```bash
npm run build
```

This creates an optimized production build in the `./dist` folder.

## Deployment Platforms

### Vercel

**Recommended for Next.js-like React apps**

1. **Install Vercel CLI:**
   ```bash
   npm install -g vercel
   ```

2. **Deploy:**
   ```bash
   vercel
   ```

3. **Set Environment Variables:**
   - Go to Project Settings → Environment Variables
   - Add your production variables:
     ```
     VITE_API_BASE_URL=https://your-api.com/api
     VITE_APP_ENV=production
     ```

4. **Custom Domain:**
   - Go to Project Settings → Domains
   - Add your custom domain

**Configuration File (`vercel.json`):**

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "routes": [
    {
      "src": "/[^.]+",
      "dest": "/",
      "status": 200
    }
  ]
}
```

### Netlify

**Great for static sites with forms**

1. **Via Netlify CLI:**
   ```bash
   npm install -g netlify-cli
   netlify deploy --prod
   ```

2. **Via Dashboard:**
   - Drag and drop the `dist` folder to Netlify dashboard
   - Or connect your GitHub repository

3. **Configuration File (`netlify.toml`):**
   ```toml
   [build]
     command = "npm run build"
     publish = "dist"

   [[redirects]]
     from = "/*"
     to = "/index.html"
     status = 200

   [build.environment]
     NODE_VERSION = "18"
   ```

4. **Environment Variables:**
   - Site Settings → Build & Deploy → Environment
   - Add your variables

### GitHub Pages

**Free hosting for static sites**

1. **Install gh-pages:**
   ```bash
   npm install -g gh-pages
   ```

2. **Update `package.json`:**
   ```json
   {
     "homepage": "https://yourusername.github.io/buildmybot",
     "scripts": {
       "predeploy": "npm run build",
       "deploy": "gh-pages -d dist"
     }
   }
   ```

3. **Deploy:**
   ```bash
   npm run deploy
   ```

4. **Configure GitHub:**
   - Repository Settings → Pages
   - Source: gh-pages branch

### Traditional Hosting

**For cPanel, FTP, or any web server**

1. **Build the project:**
   ```bash
   npm run build
   ```

2. **Upload `dist` folder contents** to your web server's public directory:
   - `public_html/`
   - `www/`
   - `htdocs/`

3. **Configure `.htaccess` (Apache):**
   ```apache
   <IfModule mod_rewrite.c>
     RewriteEngine On
     RewriteBase /
     RewriteRule ^index\.html$ - [L]
     RewriteCond %{REQUEST_FILENAME} !-f
     RewriteCond %{REQUEST_FILENAME} !-d
     RewriteRule . /index.html [L]
   </IfModule>
   ```

4. **Configure nginx:**
   ```nginx
   server {
     listen 80;
     server_name yourdomain.com;
     root /var/www/buildmybot/dist;
     index index.html;

     location / {
       try_files $uri $uri/ /index.html;
     }
   }
   ```

## Environment Variables

### Production Environment Variables

Create a `.env.production` file:

```env
# Production API
VITE_API_BASE_URL=https://api.yourdomain.com/api
VITE_API_TIMEOUT=30000

# Feature Flags
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_CHAT_WIDGET=true

# Services
VITE_STRIPE_PUBLIC_KEY=pk_live_xxxxxxxxxxxxx
VITE_GOOGLE_ANALYTICS_ID=G-XXXXXXXXXX

# Environment
VITE_APP_ENV=production
```

### Platform-Specific Configuration

**Vercel:**
- Use Vercel dashboard to set variables
- Or use `vercel env add`

**Netlify:**
- Use Netlify dashboard
- Or use `netlify env:set KEY value`

**GitHub Pages:**
- Use GitHub Secrets for build-time variables
- Add to `.github/workflows/deploy.yml`

## Backend Integration

### Setting Up Backend API

Your frontend expects these endpoints:

```typescript
POST   /api/contact          // Contact form
POST   /api/subscribe        // Newsletter
POST   /api/reseller/apply   // Reseller application  
POST   /api/auth/signup      // User registration
GET    /api/pricing          // Pricing data
GET    /api/stats            // Statistics
```

### CORS Configuration

Enable CORS on your backend:

**Express.js Example:**
```javascript
const cors = require('cors');

app.use(cors({
  origin: 'https://yourdomain.com',
  credentials: true
}));
```

**FastAPI Example:**
```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://yourdomain.com"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### API Documentation

Create API endpoints matching the interface:

```typescript
// Contact Form
POST /api/contact
{
  "name": "John Doe",
  "email": "john@example.com",
  "company": "Acme Inc",
  "message": "I'm interested in..."
}

Response: {
  "success": true,
  "message": "Thank you for contacting us!"
}
```

## Post-Deployment

### Verification Checklist

- [ ] Site loads correctly
- [ ] All images display properly
- [ ] Forms submit successfully
- [ ] Navigation works
- [ ] Mobile responsiveness
- [ ] SEO meta tags are present
- [ ] Analytics tracking works
- [ ] API calls succeed
- [ ] Error pages work (404, etc.)

### Performance Optimization

1. **Enable Compression:**
   - Gzip or Brotli compression
   - Most platforms enable this by default

2. **CDN Configuration:**
   - Vercel and Netlify include CDN
   - For others, consider Cloudflare

3. **Caching Headers:**
   ```nginx
   location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
     expires 1y;
     add_header Cache-Control "public, immutable";
   }
   ```

### Monitoring

**Google Analytics:**
- Set `VITE_GOOGLE_ANALYTICS_ID` in production
- Track user behavior and conversions

**Error Tracking:**
- Consider Sentry for error monitoring
- Add to your production build

**Uptime Monitoring:**
- Use UptimeRobot or similar
- Monitor API endpoints

### SSL/HTTPS

All platforms provide free SSL:
- **Vercel**: Automatic
- **Netlify**: Automatic  
- **GitHub Pages**: Automatic
- **Traditional**: Use Let's Encrypt

### Custom Domain

1. **Purchase domain** from registrar
2. **Update DNS records:**
   ```
   Type  Name  Value
   A     @     76.76.21.21 (your platform's IP)
   CNAME www   your-app.platform.com
   ```
3. **Configure on platform**
4. **Wait for DNS propagation** (up to 48 hours)

## Troubleshooting

### Blank Page After Deploy

**Cause:** Routing issues

**Fix:**
- Ensure proper rewrites/redirects configuration
- Check browser console for errors
- Verify `base` in `vite.config.ts`

### API Calls Failing

**Cause:** CORS or wrong API URL

**Fix:**
- Check `VITE_API_BASE_URL` is correct
- Enable CORS on backend
- Check browser console for details

### Images Not Loading

**Cause:** Wrong path or missing files

**Fix:**
- Images in `public/` are served from root
- Images in `src/assets/` are bundled
- Use absolute paths from root

### Environment Variables Not Working

**Cause:** Not prefixed with `VITE_`

**Fix:**
- All variables must start with `VITE_`
- Rebuild after changing variables
- Clear cache if needed

## Support

For deployment issues:

1. Check build logs
2. Verify environment variables
3. Test locally with production build:
   ```bash
   npm run build
   npm run preview
   ```
4. Check platform-specific documentation

## Security Checklist

Before going live:

- [ ] Remove console.logs with sensitive data
- [ ] Use HTTPS everywhere
- [ ] Set proper CORS policies
- [ ] Implement rate limiting on API
- [ ] Add security headers
- [ ] Keep dependencies updated
- [ ] Use environment variables for secrets
- [ ] Enable CSP (Content Security Policy)

## Conclusion

Your BuildMyBot application is now ready for production! Follow this guide for a smooth deployment process.

For questions or issues, refer to your hosting platform's documentation or contact support.

Good luck with your launch! 🚀
