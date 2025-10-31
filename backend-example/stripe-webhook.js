/**
 * Stripe Webhook Handler
 * Handle Stripe events for subscription management
 * 
 * Setup Instructions:
 * 1. Install: npm install stripe
 * 2. Get your webhook secret from Stripe Dashboard
 * 3. Add this endpoint to your Express server
 * 4. Configure webhook URL in Stripe Dashboard
 */

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const express = require('express');

const router = express.Router();

// Webhook endpoint - MUST use raw body
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;

  try {
    // Verify webhook signature
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object);
        break;

      case 'customer.subscription.created':
        await handleSubscriptionCreated(event.data.object);
        break;

      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object);
        break;

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object);
        break;

      case 'invoice.payment_succeeded':
        await handlePaymentSucceeded(event.data.object);
        break;

      case 'invoice.payment_failed':
        await handlePaymentFailed(event.data.object);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    res.json({ received: true });
  } catch (err) {
    console.error('Webhook handler error:', err);
    res.status(500).send('Webhook handler failed');
  }
});

// Handle successful checkout
async function handleCheckoutCompleted(session) {
  const { customer, subscription, customer_email, metadata } = session;

  console.log('Checkout completed:', {
    customer,
    subscription,
    email: customer_email,
  });

  // TODO: Update your database
  // 1. Create or update user record
  // 2. Activate subscription
  // 3. Send welcome email

  // Example database update:
  // await db.users.update({
  //   where: { email: customer_email },
  //   data: {
  //     stripe_customer_id: customer,
  //     stripe_subscription_id: subscription,
  //     plan: metadata.planId,
  //     status: 'active',
  //   },
  // });

  // Example email:
  // await sendEmail({
  //   to: customer_email,
  //   subject: 'Welcome to BuildMyBot!',
  //   template: 'welcome',
  //   data: { plan: metadata.planName },
  // });
}

// Handle subscription creation
async function handleSubscriptionCreated(subscription) {
  const { id, customer, status, items } = subscription;

  console.log('Subscription created:', {
    subscriptionId: id,
    customerId: customer,
    status,
  });

  // TODO: Update your database
  // await db.subscriptions.create({
  //   stripe_subscription_id: id,
  //   stripe_customer_id: customer,
  //   status,
  //   plan_id: items.data[0].price.id,
  // });
}

// Handle subscription updates (plan changes, etc.)
async function handleSubscriptionUpdated(subscription) {
  const { id, customer, status, items, cancel_at_period_end } = subscription;

  console.log('Subscription updated:', {
    subscriptionId: id,
    customerId: customer,
    status,
    cancelAtPeriodEnd: cancel_at_period_end,
  });

  // TODO: Update your database
  // await db.subscriptions.update({
  //   where: { stripe_subscription_id: id },
  //   data: {
  //     status,
  //     cancel_at_period_end,
  //     plan_id: items.data[0].price.id,
  //   },
  // });

  // Send email notification if subscription is cancelled
  // if (cancel_at_period_end) {
  //   await sendCancellationEmail(customer);
  // }
}

// Handle subscription cancellation
async function handleSubscriptionDeleted(subscription) {
  const { id, customer } = subscription;

  console.log('Subscription deleted:', {
    subscriptionId: id,
    customerId: customer,
  });

  // TODO: Update your database
  // await db.subscriptions.update({
  //   where: { stripe_subscription_id: id },
  //   data: { status: 'cancelled' },
  // });

  // await db.users.update({
  //   where: { stripe_customer_id: customer },
  //   data: { status: 'inactive' },
  // });
}

// Handle successful payment
async function handlePaymentSucceeded(invoice) {
  const { customer, subscription, amount_paid, invoice_pdf } = invoice;

  console.log('Payment succeeded:', {
    customerId: customer,
    subscriptionId: subscription,
    amount: amount_paid / 100, // Convert from cents
  });

  // TODO: 
  // 1. Record payment in database
  // 2. Send receipt email
  // 3. Extend subscription period

  // await sendEmail({
  //   to: customerEmail,
  //   subject: 'Payment Receipt',
  //   template: 'receipt',
  //   data: {
  //     amount: amount_paid / 100,
  //     invoice_url: invoice_pdf,
  //   },
  // });
}

// Handle failed payment
async function handlePaymentFailed(invoice) {
  const { customer, subscription, amount_due } = invoice;

  console.log('Payment failed:', {
    customerId: customer,
    subscriptionId: subscription,
    amount: amount_due / 100,
  });

  // TODO:
  // 1. Send payment failure notification
  // 2. Update subscription status
  // 3. Implement retry logic or suspension

  // await sendEmail({
  //   to: customerEmail,
  //   subject: 'Payment Failed',
  //   template: 'payment_failed',
  //   data: {
  //     amount: amount_due / 100,
  //     update_payment_url: 'https://yourapp.com/billing',
  //   },
  // });
}

module.exports = router;
