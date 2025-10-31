/**
 * Stripe Checkout Session Creation
 * Creates Stripe Checkout sessions for subscription payments
 * 
 * Setup Instructions:
 * 1. Install: npm install stripe
 * 2. Get API keys from Stripe Dashboard
 * 3. Add to your Express server
 */

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const express = require('express');

const router = express.Router();

// Create Stripe Checkout Session
router.post('/create-checkout-session', async (req, res) => {
  try {
    const { planId, planName, price, successUrl, cancelUrl, customerEmail } = req.body;

    // Validate input
    if (!planId || !price) {
      return res.status(400).json({
        error: 'Missing required fields: planId, price',
      });
    }

    // Create or retrieve Stripe Price ID
    // You should create these in Stripe Dashboard or programmatically
    const priceId = await getOrCreatePrice(planId, price);

    // Create Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: successUrl || `${process.env.FRONTEND_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancelUrl || `${process.env.FRONTEND_URL}/?canceled=true`,
      customer_email: customerEmail,
      metadata: {
        planId,
        planName,
      },
      subscription_data: {
        metadata: {
          planId,
          planName,
        },
      },
      allow_promotion_codes: true, // Allow discount codes
      billing_address_collection: 'required',
    });

    res.json({
      sessionId: session.id,
      url: session.url,
    });
  } catch (error) {
    console.error('Create checkout session error:', error);
    res.status(500).json({
      error: 'Failed to create checkout session',
      message: error.message,
    });
  }
});

// Get or create Stripe Price
async function getOrCreatePrice(planId, price) {
  // Check if price already exists
  const prices = await stripe.prices.list({
    lookup_keys: [planId],
    limit: 1,
  });

  if (prices.data.length > 0) {
    return prices.data[0].id;
  }

  // Create product first
  let product;
  const products = await stripe.products.list({
    limit: 1,
  });

  if (products.data.length > 0) {
    product = products.data[0];
  } else {
    product = await stripe.products.create({
      name: 'BuildMyBot Subscription',
      description: 'AI Chatbot Platform',
    });
  }

  // Create price
  const newPrice = await stripe.prices.create({
    unit_amount: price * 100, // Convert dollars to cents
    currency: 'usd',
    recurring: {
      interval: 'month',
    },
    product: product.id,
    lookup_key: planId,
    nickname: planId,
  });

  return newPrice.id;
}

// Retrieve checkout session (for success page)
router.get('/checkout-session/:sessionId', async (req, res) => {
  try {
    const session = await stripe.checkout.sessions.retrieve(req.params.sessionId);

    res.json({
      session: {
        id: session.id,
        customerEmail: session.customer_email,
        status: session.payment_status,
        subscriptionId: session.subscription,
      },
    });
  } catch (error) {
    console.error('Retrieve checkout session error:', error);
    res.status(500).json({
      error: 'Failed to retrieve checkout session',
    });
  }
});

// Create Customer Portal Session (for managing subscriptions)
router.post('/create-portal-session', async (req, res) => {
  try {
    const { customerId, returnUrl } = req.body;

    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl || `${process.env.FRONTEND_URL}/account`,
    });

    res.json({
      url: session.url,
    });
  } catch (error) {
    console.error('Create portal session error:', error);
    res.status(500).json({
      error: 'Failed to create portal session',
    });
  }
});

// Cancel Subscription
router.post('/cancel-subscription', async (req, res) => {
  try {
    const { subscriptionId } = req.body;

    const subscription = await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: true,
    });

    res.json({
      success: true,
      subscription: {
        id: subscription.id,
        cancelAt: subscription.cancel_at,
        currentPeriodEnd: subscription.current_period_end,
      },
    });
  } catch (error) {
    console.error('Cancel subscription error:', error);
    res.status(500).json({
      error: 'Failed to cancel subscription',
    });
  }
});

// Reactivate Subscription
router.post('/reactivate-subscription', async (req, res) => {
  try {
    const { subscriptionId } = req.body;

    const subscription = await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: false,
    });

    res.json({
      success: true,
      subscription: {
        id: subscription.id,
        status: subscription.status,
      },
    });
  } catch (error) {
    console.error('Reactivate subscription error:', error);
    res.status(500).json({
      error: 'Failed to reactivate subscription',
    });
  }
});

module.exports = router;
