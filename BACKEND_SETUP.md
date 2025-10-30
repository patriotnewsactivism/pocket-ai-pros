# Backend API Requirements - REAL IMPLEMENTATION ONLY

## ⚠️ CRITICAL: NO MOCK OR SIMULATED DATA

This application **REQUIRES** a real backend API. There are **NO MOCKS** or **SIMULATIONS**. All functionality depends on your backend being properly implemented.

---

## 🔴 Required API Endpoints

Your backend **MUST** implement these 6 endpoints for the application to function:

### 1. Contact Form Submission
**Endpoint:** `POST /api/contact`

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "company": "Acme Inc",
  "message": "I'm interested in your services"
}
```

**Required Response:**
```json
{
  "success": true,
  "message": "Thank you for contacting us! We'll get back to you soon."
}
```

**Error Response:**
```json
{
  "message": "Failed to submit contact form",
  "status": 400
}
```

---

### 2. Newsletter Subscription
**Endpoint:** `POST /api/subscribe`

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Required Response:**
```json
{
  "success": true,
  "message": "Successfully subscribed to newsletter"
}
```

---

### 3. Reseller Program Application
**Endpoint:** `POST /api/reseller/apply`

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "company": "Acme Inc",
  "phone": "+1-555-0123",
  "experience": "5 years in sales",
  "expectedClients": 25
}
```

**Required Response:**
```json
{
  "success": true,
  "message": "Application received! We'll review within 2 business days."
}
```

---

### 4. User Registration/Signup
**Endpoint:** `POST /api/auth/signup`

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "company": "Acme Inc",
  "plan": "Professional"
}
```

**Required Response:**
```json
{
  "success": true,
  "message": "Account created successfully",
  "userId": "user_abc123"
}
```

---

### 5. Get Pricing Plans
**Endpoint:** `GET /api/pricing`

**Required Response:**
```json
{
  "plans": [
    {
      "id": "starter",
      "name": "Starter",
      "price": 29,
      "features": ["1 Bot", "1000 messages/month"]
    },
    {
      "id": "professional",
      "name": "Professional",
      "price": 99,
      "features": ["5 Bots", "10000 messages/month"]
    },
    {
      "id": "enterprise",
      "name": "Enterprise",
      "price": 299,
      "features": ["Unlimited", "Unlimited"]
    }
  ]
}
```

---

### 6. Get Platform Statistics
**Endpoint:** `GET /api/stats`

**Required Response:**
```json
{
  "totalBots": 523,
  "activeUsers": 1247,
  "messagesProcessed": 45678,
  "uptime": 99.9
}
```

---

## 🚀 Backend Implementation Examples

### Node.js + Express Example

```javascript
const express = require('express');
const cors = require('cors');
const app = express();

// CORS Configuration - REQUIRED
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:8080',
  credentials: true
}));

app.use(express.json());

// 1. Contact Form
app.post('/api/contact', async (req, res) => {
  try {
    const { name, email, company, message } = req.body;
    
    // YOUR REAL IMPLEMENTATION HERE
    // - Validate input
    // - Save to database
    // - Send email notification
    // - Queue for CRM integration
    
    // Example: Save to database
    await db.contacts.create({
      name,
      email,
      company,
      message,
      createdAt: new Date()
    });
    
    // Example: Send email
    await emailService.sendContactNotification({
      to: process.env.ADMIN_EMAIL,
      subject: `New Contact Form: ${name}`,
      data: { name, email, company, message }
    });
    
    res.json({
      success: true,
      message: 'Thank you for contacting us! We\'ll get back to you soon.'
    });
  } catch (error) {
    res.status(500).json({
      message: 'Failed to submit contact form',
      status: 500
    });
  }
});

// 2. Newsletter Subscription
app.post('/api/subscribe', async (req, res) => {
  try {
    const { email } = req.body;
    
    // YOUR REAL IMPLEMENTATION HERE
    // - Validate email
    // - Check if already subscribed
    // - Add to mailing list service (Mailchimp, SendGrid, etc.)
    // - Save to database
    
    await mailingService.subscribe(email);
    
    res.json({
      success: true,
      message: 'Successfully subscribed to newsletter'
    });
  } catch (error) {
    res.status(500).json({
      message: 'Failed to subscribe',
      status: 500
    });
  }
});

// 3. Reseller Application
app.post('/api/reseller/apply', async (req, res) => {
  try {
    const { name, email, company, phone, experience, expectedClients } = req.body;
    
    // YOUR REAL IMPLEMENTATION HERE
    // - Validate all fields
    // - Save to database
    // - Send confirmation email
    // - Notify sales team
    // - Create CRM entry
    
    const application = await db.resellerApplications.create({
      name,
      email,
      company,
      phone,
      experience,
      expectedClients,
      status: 'pending',
      submittedAt: new Date()
    });
    
    await emailService.sendResellerConfirmation(email, name);
    await notifyService.alertSalesTeam(application);
    
    res.json({
      success: true,
      message: 'Application received! We\'ll review within 2 business days.'
    });
  } catch (error) {
    res.status(500).json({
      message: 'Failed to submit application',
      status: 500
    });
  }
});

// 4. User Signup
app.post('/api/auth/signup', async (req, res) => {
  try {
    const { name, email, company, plan } = req.body;
    
    // YOUR REAL IMPLEMENTATION HERE
    // - Validate input
    // - Check if user exists
    // - Create user account
    // - Send welcome email
    // - Set up initial resources
    
    const user = await db.users.create({
      name,
      email,
      company,
      plan,
      createdAt: new Date()
    });
    
    await emailService.sendWelcomeEmail(user);
    
    res.json({
      success: true,
      message: 'Account created successfully',
      userId: user.id
    });
  } catch (error) {
    res.status(500).json({
      message: 'Failed to create account',
      status: 500
    });
  }
});

// 5. Get Pricing
app.get('/api/pricing', async (req, res) => {
  try {
    // YOUR REAL IMPLEMENTATION HERE
    // - Fetch from database
    // - Apply any user-specific discounts
    // - Return current pricing
    
    const pricing = await db.pricing.findAll();
    
    res.json({
      plans: pricing
    });
  } catch (error) {
    res.status(500).json({
      message: 'Failed to fetch pricing',
      status: 500
    });
  }
});

// 6. Get Stats
app.get('/api/stats', async (req, res) => {
  try {
    // YOUR REAL IMPLEMENTATION HERE
    // - Query database for real metrics
    // - Calculate current statistics
    // - Cache if needed for performance
    
    const stats = await db.getStats(); // Your implementation
    
    res.json({
      totalBots: stats.totalBots,
      activeUsers: stats.activeUsers,
      messagesProcessed: stats.messagesProcessed,
      uptime: stats.uptime
    });
  } catch (error) {
    res.status(500).json({
      message: 'Failed to fetch stats',
      status: 500
    });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Backend API running on port ${PORT}`);
});
```

---

### Python + FastAPI Example

```python
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr
from typing import Optional
import os

app = FastAPI()

# CORS Configuration - REQUIRED
app.add_middleware(
    CORSMiddleware,
    allow_origins=[os.getenv("FRONTEND_URL", "http://localhost:8080")],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Request Models
class ContactForm(BaseModel):
    name: str
    email: EmailStr
    company: Optional[str]
    message: str

class Newsletter(BaseModel):
    email: EmailStr

class ResellerApplication(BaseModel):
    name: str
    email: EmailStr
    company: str
    phone: Optional[str]
    experience: Optional[str]
    expectedClients: Optional[int]

class Signup(BaseModel):
    name: str
    email: EmailStr
    company: Optional[str]
    plan: Optional[str]

# 1. Contact Form
@app.post("/api/contact")
async def submit_contact(form: ContactForm):
    try:
        # YOUR REAL IMPLEMENTATION HERE
        # - Validate input
        # - Save to database
        # - Send email notification
        
        # Example: Save to database
        contact_id = await db.contacts.create(
            name=form.name,
            email=form.email,
            company=form.company,
            message=form.message
        )
        
        # Example: Send email
        await email_service.send_notification(form)
        
        return {
            "success": True,
            "message": "Thank you for contacting us! We'll get back to you soon."
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to submit contact form")

# 2. Newsletter Subscription
@app.post("/api/subscribe")
async def subscribe(data: Newsletter):
    try:
        # YOUR REAL IMPLEMENTATION HERE
        await mailing_service.subscribe(data.email)
        
        return {
            "success": True,
            "message": "Successfully subscribed to newsletter"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to subscribe")

# 3. Reseller Application
@app.post("/api/reseller/apply")
async def apply_reseller(application: ResellerApplication):
    try:
        # YOUR REAL IMPLEMENTATION HERE
        app_id = await db.reseller_applications.create(application.dict())
        await email_service.send_reseller_confirmation(application.email)
        await notify_service.alert_sales_team(app_id)
        
        return {
            "success": True,
            "message": "Application received! We'll review within 2 business days."
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to submit application")

# 4. User Signup
@app.post("/api/auth/signup")
async def signup(user: Signup):
    try:
        # YOUR REAL IMPLEMENTATION HERE
        user_id = await db.users.create(user.dict())
        await email_service.send_welcome_email(user.email, user.name)
        
        return {
            "success": True,
            "message": "Account created successfully",
            "userId": user_id
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to create account")

# 5. Get Pricing
@app.get("/api/pricing")
async def get_pricing():
    try:
        # YOUR REAL IMPLEMENTATION HERE
        pricing = await db.pricing.find_all()
        return {"plans": pricing}
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to fetch pricing")

# 6. Get Stats
@app.get("/api/stats")
async def get_stats():
    try:
        # YOUR REAL IMPLEMENTATION HERE
        stats = await db.get_statistics()
        return stats
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to fetch stats")
```

---

## 🗄️ Database Setup

You'll need to create database tables for:

### Contacts Table
```sql
CREATE TABLE contacts (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    company VARCHAR(255),
    message TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(50) DEFAULT 'new'
);
```

### Newsletter Subscribers
```sql
CREATE TABLE subscribers (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    subscribed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(50) DEFAULT 'active'
);
```

### Reseller Applications
```sql
CREATE TABLE reseller_applications (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    company VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    experience TEXT,
    expected_clients INTEGER,
    status VARCHAR(50) DEFAULT 'pending',
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    reviewed_at TIMESTAMP,
    notes TEXT
);
```

### Users Table
```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    company VARCHAR(255),
    plan VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(50) DEFAULT 'active'
);
```

### Pricing Plans
```sql
CREATE TABLE pricing_plans (
    id SERIAL PRIMARY KEY,
    plan_id VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    features JSONB,
    active BOOLEAN DEFAULT true
);

-- Insert default plans
INSERT INTO pricing_plans (plan_id, name, price, features) VALUES
('starter', 'Starter', 29.00, '["1 Bot", "1000 messages/month"]'),
('professional', 'Professional', 99.00, '["5 Bots", "10000 messages/month"]'),
('enterprise', 'Enterprise', 299.00, '["Unlimited", "Unlimited"]');
```

---

## 📧 Email Service Integration

You MUST integrate with a real email service:

### Option 1: SendGrid
```javascript
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

async function sendContactNotification(data) {
  await sgMail.send({
    to: process.env.ADMIN_EMAIL,
    from: process.env.FROM_EMAIL,
    subject: `New Contact Form: ${data.name}`,
    html: `<p><strong>Name:</strong> ${data.name}</p>
           <p><strong>Email:</strong> ${data.email}</p>
           <p><strong>Company:</strong> ${data.company}</p>
           <p><strong>Message:</strong> ${data.message}</p>`
  });
}
```

### Option 2: Nodemailer
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

async function sendEmail(options) {
  await transporter.sendMail(options);
}
```

---

## 🔒 Security Requirements

### 1. Input Validation
```javascript
const { body, validationResult } = require('express-validator');

app.post('/api/contact', [
  body('email').isEmail(),
  body('name').trim().isLength({ min: 2, max: 100 }),
  body('message').trim().isLength({ min: 10, max: 5000 })
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  // ... rest of implementation
});
```

### 2. Rate Limiting
```javascript
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5 // limit each IP to 5 requests per windowMs
});

app.use('/api/', limiter);
```

### 3. HTTPS Only
```javascript
app.use((req, res, next) => {
  if (req.header('x-forwarded-proto') !== 'https' && process.env.NODE_ENV === 'production') {
    res.redirect(`https://${req.header('host')}${req.url}`);
  } else {
    next();
  }
});
```

---

## 🚀 Deployment Checklist

Before deploying:

- [ ] All 6 endpoints implemented
- [ ] Database tables created
- [ ] Email service configured
- [ ] Environment variables set
- [ ] CORS properly configured
- [ ] Rate limiting enabled
- [ ] Input validation added
- [ ] Error logging configured
- [ ] SSL/HTTPS enabled
- [ ] Tested all endpoints

---

## 🧪 Testing Your Backend

Use curl or Postman to test:

```bash
# Test Contact Form
curl -X POST http://localhost:3000/api/contact \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "company": "Test Co",
    "message": "This is a test"
  }'

# Test Stats
curl http://localhost:3000/api/stats

# Test Pricing
curl http://localhost:3000/api/pricing
```

Expected: Real responses from your database/services, NOT mock data.

---

## ⚠️ What Happens Without Backend

If your backend is not running or not properly configured:

- ❌ All forms will show error messages
- ❌ Statistics will fail to load
- ❌ User will see "Failed to connect to API" errors
- ❌ No data will be saved or processed

**This is intentional.** There are NO fallbacks or mock data.

---

## 📞 Support

Your backend MUST be running and accessible at the URL specified in `VITE_API_BASE_URL`.

**No exceptions. No mocks. No simulations. Real implementations only.**
