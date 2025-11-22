/**
 * Email Templates and Automation
 * Handles all transactional emails for BuildMyBot
 * 
 * Supports multiple email services:
 * - SendGrid (recommended)
 * - Mailgun
 * - AWS SES
 * - Postmark
 * 
 * Setup Instructions:
 * 1. Choose email service and install: npm install @sendgrid/mail
 * 2. Get API key from provider
 * 3. Add API key to .env file
 * 4. Configure sender email and domain
 */

const sgMail = require('@sendgrid/mail');

// Initialize SendGrid
if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

const FROM_EMAIL = process.env.FROM_EMAIL || 'noreply@buildmybot.app';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@buildmybot.app';
const SALES_EMAIL = process.env.SALES_EMAIL || 'sales@buildmybot.app';
const SUPPORT_EMAIL = process.env.SUPPORT_EMAIL || 'support@buildmybot.app';

// Email Templates
const templates = {
  // Welcome email for new users
  welcome: (name, plan) => ({
    subject: '🎉 Welcome to BuildMyBot!',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #0080FF 0%, #00CCFF 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; padding: 12px 30px; background: #0080FF; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🤖 Welcome to BuildMyBot!</h1>
          </div>
          <div class="content">
            <h2>Hi ${name}! 👋</h2>
            <p>Thank you for choosing BuildMyBot! We're excited to help you create amazing AI chatbots for your business.</p>
            
            <h3>You're on the <strong>${plan}</strong> plan</h3>
            
            <h3>🚀 Quick Start Guide:</h3>
            <ol>
              <li><strong>Create Your First Bot:</strong> Log in to your dashboard and click "Create New Bot"</li>
              <li><strong>Train Your Bot:</strong> Upload your training data or connect to your knowledge base</li>
              <li><strong>Deploy:</strong> Get your embed code and add the bot to your website</li>
            </ol>
            
            <a href="https://buildmybot.app/dashboard" class="button">Go to Dashboard</a>
            
            <h3>📚 Helpful Resources:</h3>
            <ul>
              <li><a href="https://docs.buildmybot.app">Documentation</a></li>
              <li><a href="https://buildmybot.app/tutorials">Video Tutorials</a></li>
              <li><a href="https://buildmybot.app/support">Support Center</a></li>
            </ul>
            
            <p>Need help? Reply to this email or contact us at <a href="mailto:${SUPPORT_EMAIL}">${SUPPORT_EMAIL}</a></p>
            
            <p>Best regards,<br>The BuildMyBot Team</p>
          </div>
          <div class="footer">
            <p>BuildMyBot - AI Chatbot Platform<br>
            © 2025 BuildMyBot. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  }),

  // Contact form submission notification
  contactFormAdmin: (name, email, company, message) => ({
    subject: `🔔 New Contact Form: ${name}`,
    html: `
      <h2>New Contact Form Submission</h2>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
      <p><strong>Company:</strong> ${company || 'N/A'}</p>
      <p><strong>Message:</strong></p>
      <p style="padding: 15px; background: #f5f5f5; border-left: 3px solid #0080FF;">${message}</p>
      <p><a href="mailto:${email}?subject=Re: Your BuildMyBot Inquiry">Reply to ${name}</a></p>
    `,
  }),

  // Contact form confirmation for user
  contactFormUser: (name) => ({
    subject: 'We received your message!',
    html: `
      <h2>Hi ${name}!</h2>
      <p>Thank you for contacting BuildMyBot. We've received your message and will get back to you within 24 hours.</p>
      <p>In the meantime, feel free to explore:</p>
      <ul>
        <li><a href="https://buildmybot.app/features">Features</a></li>
        <li><a href="https://buildmybot.app/pricing">Pricing</a></li>
        <li><a href="https://docs.buildmybot.app">Documentation</a></li>
      </ul>
      <p>Best regards,<br>The BuildMyBot Team</p>
    `,
  }),

  // Newsletter subscription confirmation
  newsletterWelcome: (email) => ({
    subject: '✉️ You\'re subscribed to BuildMyBot updates!',
    html: `
      <h2>Welcome to our newsletter! 🎉</h2>
      <p>You'll now receive:</p>
      <ul>
        <li>🚀 Product updates and new features</li>
        <li>📚 AI chatbot tips and best practices</li>
        <li>💡 Industry insights and trends</li>
        <li>🎁 Exclusive offers and early access</li>
      </ul>
      <p>Expect our first newsletter soon!</p>
      <p style="font-size: 12px; color: #666;">
        Don't want to receive these emails? 
        <a href="https://buildmybot.app/unsubscribe?email=${email}">Unsubscribe</a>
      </p>
    `,
  }),

  // Reseller application confirmation
  resellerConfirmation: (name, company) => ({
    subject: '🤝 Reseller Application Received',
    html: `
      <h2>Hi ${name}!</h2>
      <p>Thank you for applying to join BuildMyBot's Reseller Program!</p>
      <p><strong>Company:</strong> ${company}</p>
      <p><strong>Status:</strong> Under Review</p>
      <p>Our partnership team will review your application and get back to you within <strong>2 business days</strong>.</p>
      
      <h3>What happens next?</h3>
      <ol>
        <li>We'll review your application and company profile</li>
        <li>If approved, you'll receive partner credentials and resources</li>
        <li>You'll get access to our partner dashboard and commission tracking</li>
        <li>Start earning 20-30% commission on every sale!</li>
      </ol>
      
      <p>Questions? Contact our partnership team at <a href="mailto:${SALES_EMAIL}">${SALES_EMAIL}</a></p>
      
      <p>Best regards,<br>BuildMyBot Partnership Team</p>
    `,
  }),

  // Reseller application approval
  resellerApproved: (name, referralCode) => ({
    subject: '🎉 Welcome to BuildMyBot Reseller Program!',
    html: `
      <h2>Congratulations ${name}! 🎊</h2>
      <p>Your reseller application has been <strong>approved</strong>!</p>
      
      <div style="background: #e8f5e9; padding: 20px; border-radius: 5px; margin: 20px 0;">
        <h3>Your Referral Code: <code style="font-size: 20px; color: #0080FF;">${referralCode}</code></h3>
        <p>Share this code to track your referrals and commissions!</p>
      </div>
      
      <h3>Getting Started:</h3>
      <ol>
        <li><a href="https://buildmybot.app/partner/dashboard">Access Partner Dashboard</a></li>
        <li><a href="https://buildmybot.app/partner/resources">Download Marketing Materials</a></li>
        <li><a href="https://buildmybot.app/partner/guide">Read Partner Guide</a></li>
      </ol>
      
      <h3>Commission Structure:</h3>
      <ul>
        <li>🥉 Bronze (1-10 clients): 20% commission</li>
        <li>🥈 Silver (11-50 clients): 25% commission</li>
        <li>🥇 Gold (51+ clients): 30% commission</li>
      </ul>
      
      <p>Your dedicated account manager will contact you shortly!</p>
      
      <p>Best regards,<br>BuildMyBot Partnership Team</p>
    `,
  }),

  // Payment successful
  paymentSuccess: (name, amount, plan, nextBillingDate) => ({
    subject: '💳 Payment Received - Thank You!',
    html: `
      <h2>Hi ${name}!</h2>
      <p>Your payment has been successfully processed.</p>
      
      <div style="background: #f5f5f5; padding: 20px; border-radius: 5px; margin: 20px 0;">
        <p><strong>Amount Paid:</strong> $${amount}</p>
        <p><strong>Plan:</strong> ${plan}</p>
        <p><strong>Next Billing Date:</strong> ${nextBillingDate}</p>
      </div>
      
      <p><a href="https://buildmybot.app/account/billing">View Invoice</a></p>
      
      <p>Thank you for being a valued customer!</p>
      
      <p>Best regards,<br>The BuildMyBot Team</p>
    `,
  }),

  // Payment failed
  paymentFailed: (name, amount) => ({
    subject: '⚠️ Payment Failed - Action Required',
    html: `
      <h2>Hi ${name},</h2>
      <p>We were unable to process your payment of <strong>$${amount}</strong>.</p>
      
      <p><strong>What you need to do:</strong></p>
      <ol>
        <li>Check that your payment method is valid</li>
        <li>Ensure you have sufficient funds</li>
        <li>Update your payment information if needed</li>
      </ol>
      
      <p><a href="https://buildmybot.app/account/billing" style="display: inline-block; padding: 12px 30px; background: #f44336; color: white; text-decoration: none; border-radius: 5px;">Update Payment Method</a></p>
      
      <p>Your service will remain active for <strong>3 days</strong>. Please update your payment information to avoid service interruption.</p>
      
      <p>Need help? Contact us at <a href="mailto:${SUPPORT_EMAIL}">${SUPPORT_EMAIL}</a></p>
      
      <p>Best regards,<br>The BuildMyBot Team</p>
    `,
  }),

  // Subscription cancelled
  subscriptionCancelled: (name, endDate) => ({
    subject: 'Subscription Cancelled - We\'re sorry to see you go',
    html: `
      <h2>Hi ${name},</h2>
      <p>Your BuildMyBot subscription has been cancelled.</p>
      
      <p><strong>Your service will remain active until:</strong> ${endDate}</p>
      
      <p>We'd love to know why you're leaving. Your feedback helps us improve:</p>
      <p><a href="https://buildmybot.app/feedback?reason=cancellation">Share Feedback (2 min survey)</a></p>
      
      <h3>Changed your mind?</h3>
      <p>You can reactivate your subscription anytime before ${endDate}:</p>
      <p><a href="https://buildmybot.app/account/reactivate">Reactivate Subscription</a></p>
      
      <p>Thank you for using BuildMyBot!</p>
      
      <p>Best regards,<br>The BuildMyBot Team</p>
    `,
  }),
};

// Email sending functions
const emailService = {
  // Send email using SendGrid
  async send(to, template) {
    if (!process.env.SENDGRID_API_KEY) {
      console.warn('SendGrid not configured, email not sent:', template.subject);
      return;
    }

    const msg = {
      to,
      from: FROM_EMAIL,
      subject: template.subject,
      html: template.html,
    };

    try {
      await sgMail.send(msg);
      console.log(`Email sent to ${to}: ${template.subject}`);
    } catch (error) {
      console.error('Email send error:', error);
      throw error;
    }
  },

  // Welcome email
  async sendWelcome(email, name, plan) {
    await this.send(email, templates.welcome(name, plan));
  },

  // Contact form emails
  async sendContactFormNotification(data) {
    // Send to admin
    await this.send(ADMIN_EMAIL, templates.contactFormAdmin(
      data.name,
      data.email,
      data.company,
      data.message
    ));

    // Send confirmation to user
    await this.send(data.email, templates.contactFormUser(data.name));
  },

  // Newsletter subscription
  async sendNewsletterWelcome(email) {
    await this.send(email, templates.newsletterWelcome(email));
  },

  // Reseller application emails
  async sendResellerConfirmation(email, name, company) {
    await this.send(email, templates.resellerConfirmation(name, company));
  },

  async sendResellerApproval(email, name, referralCode) {
    await this.send(email, templates.resellerApproved(name, referralCode));
  },

  // Payment emails
  async sendPaymentSuccess(email, name, amount, plan, nextBillingDate) {
    await this.send(email, templates.paymentSuccess(name, amount, plan, nextBillingDate));
  },

  async sendPaymentFailed(email, name, amount) {
    await this.send(email, templates.paymentFailed(name, amount));
  },

  // Subscription emails
  async sendSubscriptionCancelled(email, name, endDate) {
    await this.send(email, templates.subscriptionCancelled(name, endDate));
  },
};

module.exports = {
  emailService,
  templates,
};
