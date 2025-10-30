# BuildMyBot - Comprehensive Project Documentation

## 🚀 Overview

BuildMyBot is a modern, production-ready landing page for an AI chatbot platform. Built with React, TypeScript, Vite, and shadcn/ui, it features a fully functional frontend with mock API integration, ready to connect to your backend.

## ✨ Key Features

### Frontend Features
- ✅ **Responsive Design** - Mobile-first, works on all devices
- ✅ **Modern UI** - Built with shadcn/ui and Tailwind CSS
- ✅ **Smooth Animations** - Engaging user experience
- ✅ **Dark Mode Ready** - Theme system included
- ✅ **SEO Optimized** - Meta tags, structured data, sitemap
- ✅ **Accessibility** - WCAG compliant with ARIA labels
- ✅ **Performance** - Optimized bundle size and load time

### Functional Features
- ✅ **Contact Forms** - With validation and error handling
- ✅ **Reseller Application** - Complete application system
- ✅ **Sign Up Flow** - User registration interface
- ✅ **API Integration** - React Query for data fetching
- ✅ **Error Boundaries** - Graceful error handling
- ✅ **Loading States** - User feedback during operations
- ✅ **Toast Notifications** - User action feedback

## 📁 Project Structure

```
BuildMyBot/
├── src/
│   ├── components/          # React components
│   │   ├── ui/             # shadcn/ui components
│   │   ├── Header.tsx      # Navigation header
│   │   ├── Hero.tsx        # Hero section with CTA
│   │   ├── Features.tsx    # Features showcase
│   │   ├── Pricing.tsx     # Pricing plans
│   │   ├── Reseller.tsx    # Reseller program
│   │   ├── Footer.tsx      # Site footer
│   │   ├── ContactDialog.tsx    # Contact form modal
│   │   ├── ResellerDialog.tsx   # Reseller form modal
│   │   ├── ErrorBoundary.tsx    # Error handling
│   │   ├── LoadingSpinner.tsx   # Loading component
│   │   └── SEO.tsx         # SEO meta tags
│   ├── pages/              # Page components
│   │   ├── Index.tsx       # Main landing page
│   │   └── NotFound.tsx    # 404 page
│   ├── hooks/              # Custom React hooks
│   │   ├── useApi.ts       # API hooks with React Query
│   │   └── use-toast.ts    # Toast notifications
│   ├── lib/                # Utilities
│   │   ├── api.ts          # API client & mock API
│   │   └── utils.ts        # Helper functions
│   ├── config/             # Configuration
│   │   └── env.ts          # Environment variables
│   ├── assets/             # Static assets
│   │   ├── hero-bot.jpg
│   │   ├── features-ai.jpg
│   │   └── reseller-partner.jpg
│   ├── App.tsx             # Main app component
│   ├── main.tsx            # Entry point
│   └── index.css           # Global styles
├── public/                 # Public assets
│   ├── favicon.ico
│   ├── placeholder.svg
│   └── robots.txt
├── .env                    # Environment variables
├── .env.example            # Environment template
├── vite.config.ts          # Vite configuration
├── tailwind.config.ts      # Tailwind configuration
├── tsconfig.json           # TypeScript config
├── package.json            # Dependencies
├── setup.ps1               # Setup script (Windows)
├── dev.ps1                 # Dev server script
├── build.ps1               # Build script
├── update.ps1              # Update script
├── clean.ps1               # Clean script
├── WINDOWS_SETUP.md        # Windows guide
└── DEPLOYMENT.md           # Deployment guide
```

## 🔧 Technology Stack

### Core
- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool & dev server
- **React Router** - Client-side routing

### UI & Styling
- **Tailwind CSS** - Utility-first CSS
- **shadcn/ui** - Component library
- **Radix UI** - Accessible components
- **Lucide React** - Icon library

### State & Data
- **React Query** - Data fetching & caching
- **React Hook Form** - Form management
- **Zod** - Schema validation

### Development
- **ESLint** - Code linting
- **TypeScript ESLint** - TS linting
- **PostCSS** - CSS processing
- **Autoprefixer** - CSS vendor prefixes

## 🚀 Getting Started

### Prerequisites
- Node.js 18.x or higher
- npm or yarn
- PowerShell (for Windows scripts)

### Installation

#### Windows (PowerShell)
```powershell
.\setup.ps1
```

#### Manual
```bash
npm install
```

### Development

#### Windows
```powershell
.\dev.ps1
```

#### Manual
```bash
npm run dev
```

Visit: `http://localhost:8080`

### Building

#### Windows
```powershell
.\build.ps1
```

#### Manual
```bash
npm run build
```

## 🔌 API Integration

### Current State
The app uses a **mock API** for development. All API calls are simulated with realistic delays and responses.

### Mock API Endpoints

Located in `src/lib/api.ts`:

```typescript
// Contact form
api.submitContact(data)

// Newsletter subscription
api.subscribe(email)

// Reseller application
api.applyReseller(data)

// User signup
api.signUp(data)

// Get pricing
api.getPricing()

// Get statistics
api.getStats()
```

### Connecting to Real Backend

1. **Set up your backend API** with these endpoints:

```
POST   /api/contact
POST   /api/subscribe
POST   /api/reseller/apply
POST   /api/auth/signup
GET    /api/pricing
GET    /api/stats
```

2. **Update environment variable** in `.env`:

```env
VITE_API_BASE_URL=https://your-api.com/api
```

3. **The app automatically switches** from mock to real API based on environment!

### API Response Format

Expected response structure:

```typescript
{
  "success": boolean,
  "message": string,
  "data": any // optional
}
```

Error responses:

```typescript
{
  "message": string,
  "status": number
}
```

## 🎨 Customization

### Branding
Update in `src/components/Header.tsx` and `src/components/Footer.tsx`:
- Logo
- Company name
- Colors

### Colors
Edit `src/index.css` CSS variables:

```css
:root {
  --primary: 262 83% 58%;      /* Purple */
  --secondary: 195 100% 50%;   /* Blue */
  --accent: 280 85% 60%;       /* Pink */
  --success: 142 76% 36%;      /* Green */
}
```

### Content
- **Hero**: `src/components/Hero.tsx`
- **Features**: `src/components/Features.tsx`
- **Pricing**: `src/components/Pricing.tsx`
- **Reseller**: `src/components/Reseller.tsx`

### Images
Replace images in `src/assets/`:
- `hero-bot.jpg` - Hero section
- `features-ai.jpg` - Features section
- `reseller-partner.jpg` - Reseller section

## 📱 Components

### Dialog Components

#### ContactDialog
```tsx
<ContactDialog 
  defaultPlan="Professional"
  trigger={<Button>Get Started</Button>}
/>
```

#### ResellerDialog
```tsx
<ResellerDialog 
  trigger={<Button>Apply Now</Button>}
/>
```

### SEO Component
```tsx
<SEO 
  title="Your Page Title"
  description="Your description"
  keywords="keywords, here"
  ogImage="/image.jpg"
/>
```

### Error Boundary
```tsx
<ErrorBoundary fallback={<CustomError />}>
  <YourComponent />
</ErrorBoundary>
```

### Loading Spinner
```tsx
<LoadingSpinner 
  size="lg" 
  fullScreen 
  message="Loading..."
/>
```

## 🧪 Testing

### Manual Testing Checklist
- [ ] All forms validate correctly
- [ ] Forms submit and show success messages
- [ ] Error states display properly
- [ ] Navigation works (smooth scroll)
- [ ] Mobile menu functions correctly
- [ ] All images load
- [ ] SEO meta tags are present
- [ ] Responsive on all screen sizes
- [ ] No console errors

### Build Testing
```powershell
# Windows
.\build.ps1 -Preview

# Manual
npm run build
npm run preview
```

## 🚀 Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions.

### Quick Deploy

**Vercel:**
```bash
vercel
```

**Netlify:**
```bash
netlify deploy --prod
```

**GitHub Pages:**
```bash
npm run deploy
```

## 🔒 Security

### Current Security Features
- ✅ Environment variables for sensitive data
- ✅ No hardcoded secrets
- ✅ Input validation on forms
- ✅ XSS protection (React default)
- ✅ HTTPS ready

### Before Production
- [ ] Set up CORS properly
- [ ] Implement rate limiting (backend)
- [ ] Add CSRF protection (backend)
- [ ] Set security headers
- [ ] Enable CSP
- [ ] Regular dependency updates

## 📊 Performance

### Current Metrics
- **Bundle Size**: ~383 KB (gzipped: 120 KB)
- **First Load**: < 2s
- **Lighthouse Score**: 90+

### Optimization Tips
1. Lazy load components
2. Optimize images (use WebP)
3. Enable CDN
4. Use compression (Gzip/Brotli)
5. Cache static assets

## 🐛 Troubleshooting

### Common Issues

**Port Already in Use**
```powershell
# Change port in vite.config.ts
server: { port: 3000 }
```

**Build Fails**
```powershell
.\clean.ps1 -Deep
.\setup.ps1
```

**Forms Not Submitting**
- Check browser console
- Verify API configuration
- Check network tab in DevTools

**Images Not Loading**
- Check file paths
- Ensure images are in `src/assets/`
- Verify imports

## 📝 Environment Variables

Required variables (in `.env`):

```env
# API Configuration (required)
VITE_API_BASE_URL=http://localhost:3000/api
VITE_API_TIMEOUT=30000

# Feature Flags (optional)
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_CHAT_WIDGET=true

# External Services (optional)
VITE_STRIPE_PUBLIC_KEY=
VITE_GOOGLE_ANALYTICS_ID=

# Environment
VITE_APP_ENV=development
```

## 🤝 Contributing

### Code Style
- Use TypeScript
- Follow ESLint rules
- Use functional components
- Prefer hooks over classes
- Write meaningful comments

### Git Workflow
```bash
git checkout -b feature/your-feature
# Make changes
git commit -m "feat: add your feature"
git push origin feature/your-feature
```

## 📄 License

Copyright © 2025 BuildMyBot. All rights reserved.

## 📞 Support

For issues or questions:
1. Check documentation
2. Review error messages
3. Check browser console
4. Verify environment setup

## 🎯 Roadmap

### Planned Features
- [ ] Dashboard for bot management
- [ ] Live chat widget
- [ ] Analytics dashboard
- [ ] User authentication
- [ ] Payment integration
- [ ] Admin panel
- [ ] Bot customization interface
- [ ] Multi-language support
- [ ] Dark mode toggle
- [ ] Progressive Web App (PWA)

## 🙏 Acknowledgments

Built with:
- [React](https://react.dev/)
- [Vite](https://vitejs.dev/)
- [shadcn/ui](https://ui.shadcn.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Radix UI](https://www.radix-ui.com/)
- [React Query](https://tanstack.com/query)

---

**Made with ❤️ for building amazing AI chatbots**
