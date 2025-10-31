# BuildMyBot Backend - Real Implementation

## ⚠️ CRITICAL: NO MOCKS OR SIMULATIONS

This is a **REAL backend implementation**. Every endpoint connects to:
- ✅ Real PostgreSQL database
- ✅ Real email service (SendGrid)
- ✅ Real data validation
- ✅ Real error handling

**NO mock data. NO simulations. NO fake processes.**

---

## 🚀 Quick Start

### 1. Install Dependencies
```bash
cd backend-example
npm install
```

### 2. Set Up Database
```bash
# Create PostgreSQL database
createdb buildmybot

# Run schema
psql buildmybot < database-schema.sql
```

### 3. Configure Environment
```bash
# Copy environment template
cp .env.example .env

# Edit .env with your real credentials
nano .env
```

Required environment variables:
- `DATABASE_URL` - Your PostgreSQL connection string
- `SENDGRID_API_KEY` - Your SendGrid API key
- `FROM_EMAIL` - Your verified sender email
- `ADMIN_EMAIL` - Email to receive notifications

### 4. Start Server
```bash
# Development with auto-reload
npm run dev

# Production
npm start
```

Server runs on `http://localhost:3000`

---

## 📡 API Endpoints

All endpoints are **REAL** and require database/service connections:

### POST /api/contact
Submit contact form (saves to database, sends email)

### POST /api/subscribe
Subscribe to newsletter (saves to database)

### POST /api/reseller/apply
Apply for reseller program (saves to database, sends emails)

### POST /api/auth/signup
Create user account (saves to database, sends welcome email)

### GET /api/pricing
Get pricing plans (from database)

### GET /api/stats
Get platform statistics (from database)

### GET /health
Health check endpoint

---

## 🗄️ Database Requirements

### PostgreSQL 12+
```bash
# Install on Ubuntu
sudo apt-get install postgresql postgresql-contrib

# Install on macOS
brew install postgresql
```

### Tables Created
- `contacts` - Contact form submissions
- `subscribers` - Newsletter subscribers
- `reseller_applications` - Reseller applications
- `users` - User accounts
- `pricing_plans` - Pricing tiers
- `bots` - AI bots
- `messages` - Chat messages
- `activity_log` - Activity tracking
- `api_keys` - API keys
- `subscriptions` - Payment subscriptions

---

## 📧 Email Service

### SendGrid Setup
1. Sign up at https://sendgrid.com
2. Create API key
3. Verify sender email
4. Add to `.env`:
   ```
   SENDGRID_API_KEY=your_key_here
   FROM_EMAIL=noreply@yourdomain.com
   ```

### Alternative: Use Your Own SMTP
Replace SendGrid with Nodemailer:
```javascript
const nodemailer = require('nodemailer');
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});
```

---

## 🧪 Testing

### Test with curl
```bash
# Test contact form
curl -X POST http://localhost:3000/api/contact \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "message": "Test message"
  }'

# Test stats
curl http://localhost:3000/api/stats

# Test health
curl http://localhost:3000/health
```

### Test with Postman
Import the endpoints and test each one with real data.

---

## 🔒 Security Features

- ✅ CORS protection
- ✅ Input validation
- ✅ SQL injection prevention (parameterized queries)
- ✅ Email validation
- ✅ Error handling
- ✅ Environment variable security

### Add Rate Limiting (Recommended)
```bash
npm install express-rate-limit
```

```javascript
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5 // limit each IP to 5 requests per windowMs
});

app.use('/api/', limiter);
```

---

## 📊 Monitoring

Check logs for:
- Database connection errors
- Email sending failures
- API request errors
- Validation failures

```bash
# View logs
tail -f logs/app.log
```

---

## 🚀 Deployment

### Deploy to Heroku
```bash
heroku create buildmybot-api
heroku addons:create heroku-postgresql:hobby-dev
heroku config:set SENDGRID_API_KEY=your_key
git push heroku main
```

### Deploy to DigitalOcean
1. Create Droplet with Node.js
2. Install PostgreSQL
3. Clone repo
4. Set environment variables
5. Run with PM2:
   ```bash
   npm install -g pm2
   pm2 start server.js
   pm2 save
   ```

### Deploy to AWS
1. Use Elastic Beanstalk or EC2
2. Set up RDS for PostgreSQL
3. Configure environment variables
4. Deploy application

---

## 🔗 Connect Frontend

Update frontend `.env`:
```env
VITE_API_BASE_URL=http://localhost:3000/api
```

For production:
```env
VITE_API_BASE_URL=https://your-api.yourdomain.com/api
```

---

## 📝 Environment Variables Reference

```bash
# Server
PORT=3000
NODE_ENV=production

# Database (REQUIRED)
DATABASE_URL=postgresql://user:pass@host:5432/dbname

# Email Service (REQUIRED)
SENDGRID_API_KEY=your_key
FROM_EMAIL=noreply@yourdomain.com
ADMIN_EMAIL=admin@yourdomain.com
SALES_EMAIL=sales@yourdomain.com

# Frontend
FRONTEND_URL=https://yourdomain.com

# Security
JWT_SECRET=your_secret_here
```

---

## ⚠️ Important Notes

1. **Database is REQUIRED** - App will not work without PostgreSQL
2. **Email service is REQUIRED** - Forms won't send notifications without it
3. **All data is REAL** - Saved to database permanently
4. **NO fallbacks** - If services are down, endpoints will error

---

## 🆘 Troubleshooting

### Database Connection Failed
```bash
# Check PostgreSQL is running
sudo systemctl status postgresql

# Check connection string
echo $DATABASE_URL
```

### Email Not Sending
```bash
# Verify SendGrid API key
curl -H "Authorization: Bearer YOUR_KEY" \
  https://api.sendgrid.com/v3/user/profile
```

### CORS Errors
Ensure `FRONTEND_URL` in `.env` matches your frontend URL exactly.

---

## 📞 Support

This backend has:
- ✅ Real database integration
- ✅ Real email sending
- ✅ Real data validation
- ✅ Real error handling
- ❌ NO mocks
- ❌ NO simulations
- ❌ NO fake data

**Everything is real. Everything must be configured properly to work.**
