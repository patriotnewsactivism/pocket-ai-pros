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

const express = require('express');
const stripeModule = require('stripe');
const createStripeClient = stripeModule.default || stripeModule;

const { pool } = require('./services/database');
const { emailService } = require('./email-templates');

const stripeClient = process.env.STRIPE_SECRET_KEY
  ? createStripeClient(process.env.STRIPE_SECRET_KEY)
  : null;
const router = express.Router();

const defaultDeps = {
  pool,
  emailService,
  stripeClient,
  now: () => new Date(),
};

// Webhook endpoint - MUST use raw body
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!stripeClient) {
    console.error('Stripe client not configured. Set STRIPE_SECRET_KEY before handling webhooks.');
    return res.status(500).send('Stripe client not configured');
  }

  let event;

  try {
    // Verify webhook signature
    event = stripeClient.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object, defaultDeps);
        break;

      case 'customer.subscription.created':
        await handleSubscriptionCreated(event.data.object, defaultDeps);
        break;

      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object, defaultDeps);
        break;

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object, defaultDeps);
        break;

      case 'invoice.payment_succeeded':
        await handlePaymentSucceeded(event.data.object, defaultDeps);
        break;

      case 'invoice.payment_failed':
        await handlePaymentFailed(event.data.object, defaultDeps);
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

function extractPlanDetails(items, metadata) {
  const priceItem = items?.data?.[0];
  const planId =
    metadata?.planId ||
    priceItem?.price?.lookup_key ||
    priceItem?.price?.id ||
    priceItem?.plan?.id ||
    'starter';
  const planName =
    metadata?.planName ||
    priceItem?.price?.nickname ||
    priceItem?.plan?.nickname ||
    planId;

  return { planId, planName };
}

async function handleCheckoutCompleted(session, deps = defaultDeps) {
  const { pool: poolDep, emailService: emailDep, stripeClient: stripeDep, now } = {
    ...defaultDeps,
    ...deps,
  };

  if (!stripeDep) {
    throw new Error('Stripe client is not configured');
  }

  const {
    customer,
    subscription,
    customer_email: customerEmail,
    metadata = {},
    customer_details: customerDetails,
  } = session;

  if (!customer || !subscription) {
    throw new Error('Checkout session missing customer or subscription identifiers');
  }

  const subscriptionDetails = await stripeDep.subscriptions.retrieve(subscription);
  const periodStart = subscriptionDetails.current_period_start
    ? new Date(subscriptionDetails.current_period_start * 1000)
    : null;
  const periodEnd = subscriptionDetails.current_period_end
    ? new Date(subscriptionDetails.current_period_end * 1000)
    : null;
  const billingEmail =
    customerEmail ||
    subscriptionDetails.customer_email ||
    subscriptionDetails.customer_details?.email;

  const { planId, planName } = extractPlanDetails(subscriptionDetails.items, metadata);
  const client = await poolDep.connect();
  let userRow;
  let isNewUser = false;

  try {
    await client.query('BEGIN');

    if (customer) {
      const userByCustomer = await client.query(
        'SELECT id, email, name FROM users WHERE stripe_customer_id = $1',
        [customer],
      );
      if (userByCustomer.rowCount > 0) {
        userRow = userByCustomer.rows[0];
      }
    }

    if (!userRow && billingEmail) {
      const userByEmail = await client.query(
        'SELECT id, email, name FROM users WHERE email = $1',
        [billingEmail],
      );
      if (userByEmail.rowCount > 0) {
        userRow = userByEmail.rows[0];
      }
    }

    const subscriptionStatus = subscriptionDetails.status;

    if (!userRow) {
      const fallbackEmail = billingEmail || `${customer}@customers.stripe.com`;
      const fallbackName =
        customerDetails?.name ||
        metadata.customerName ||
        subscriptionDetails.customer_details?.name ||
        (fallbackEmail.includes('@') ? fallbackEmail.split('@')[0] : 'Stripe Customer');

      const inserted = await client.query(
        `INSERT INTO users (
           name,
           email,
           company,
           plan,
           stripe_customer_id,
           stripe_subscription_id,
           subscription_status,
           current_period_start,
           current_period_end,
           status,
           created_at
         ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'active', NOW())
         RETURNING id, email, name`,
        [
          fallbackName,
          fallbackEmail,
          metadata.company || null,
          planId,
          customer,
          subscription,
          subscriptionStatus,
          periodStart,
          periodEnd,
        ],
      );

      userRow = inserted.rows[0];
      isNewUser = true;
    } else {
      await client.query(
        `UPDATE users
           SET stripe_customer_id = COALESCE($1, stripe_customer_id),
               stripe_subscription_id = $2,
               subscription_status = $3,
               plan = COALESCE($4, plan),
               current_period_start = $5,
               current_period_end = $6,
               status = 'active'
         WHERE id = $7`,
        [
          customer,
          subscription,
          subscriptionStatus,
          planId,
          periodStart,
          periodEnd,
          userRow.id,
        ],
      );

      if (billingEmail && userRow.email !== billingEmail) {
        await client.query('UPDATE users SET email = $1 WHERE id = $2', [
          billingEmail,
          userRow.id,
        ]);
        userRow.email = billingEmail;
      }
    }

    await client.query(
      `INSERT INTO subscriptions (
         user_id,
         plan_id,
         stripe_subscription_id,
         status,
         current_period_start,
         current_period_end,
         cancel_at_period_end,
         cancelled_at,
         updated_at
       ) VALUES ($1, $2, $3, $4, $5, $6, false, NULL, NOW())
       ON CONFLICT (stripe_subscription_id) DO UPDATE
         SET plan_id = EXCLUDED.plan_id,
             status = EXCLUDED.status,
             current_period_start = EXCLUDED.current_period_start,
             current_period_end = EXCLUDED.current_period_end,
             cancel_at_period_end = EXCLUDED.cancel_at_period_end,
             cancelled_at = NULL,
             updated_at = NOW(),
             user_id = EXCLUDED.user_id`,
      [
        userRow.id,
        planId,
        subscription,
        subscriptionStatus,
        periodStart,
        periodEnd,
      ],
    );

    await client.query('COMMIT');

    if (isNewUser && billingEmail) {
      await emailDep.sendWelcome(billingEmail, userRow.name, planName);
    }
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

async function handleSubscriptionCreated(subscription, deps = defaultDeps) {
  const { pool: poolDep } = { ...defaultDeps, ...deps };
  const client = await poolDep.connect();
  const {
    id,
    customer,
    status,
    items,
    current_period_start: currentPeriodStart,
    current_period_end: currentPeriodEnd,
    cancel_at_period_end: cancelAtPeriodEnd,
  } = subscription;

  const { planId } = extractPlanDetails(items, subscription.metadata);
  const periodStart = currentPeriodStart ? new Date(currentPeriodStart * 1000) : null;
  const periodEnd = currentPeriodEnd ? new Date(currentPeriodEnd * 1000) : null;

  try {
    await client.query('BEGIN');

    const existingUser = await client.query(
      'SELECT id FROM users WHERE stripe_customer_id = $1',
      [customer],
    );

    if (existingUser.rowCount === 0) {
      throw new Error(`User with stripe customer ${customer} not found for subscription creation`);
    }

    const userId = existingUser.rows[0].id;

    await client.query(
      `UPDATE users
         SET stripe_subscription_id = $1,
             subscription_status = $2,
             plan = COALESCE($3, plan),
             current_period_start = $4,
             current_period_end = $5,
             status = CASE WHEN $2 = 'canceled' THEN 'inactive' ELSE 'active' END
       WHERE id = $6`,
      [id, status, planId, periodStart, periodEnd, userId],
    );

    await client.query(
      `INSERT INTO subscriptions (
         user_id,
         plan_id,
         stripe_subscription_id,
         status,
         current_period_start,
         current_period_end,
         cancel_at_period_end,
         cancelled_at,
         updated_at
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, NULL, NOW())
       ON CONFLICT (stripe_subscription_id) DO UPDATE
         SET status = EXCLUDED.status,
             plan_id = EXCLUDED.plan_id,
             current_period_start = EXCLUDED.current_period_start,
             current_period_end = EXCLUDED.current_period_end,
             cancel_at_period_end = EXCLUDED.cancel_at_period_end,
             cancelled_at = CASE WHEN EXCLUDED.cancel_at_period_end THEN subscriptions.cancelled_at ELSE NULL END,
             updated_at = NOW(),
             user_id = EXCLUDED.user_id`,
      [userId, planId, id, status, periodStart, periodEnd, Boolean(cancelAtPeriodEnd)],
    );

    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

async function handleSubscriptionUpdated(subscription, deps = defaultDeps) {
  const { pool: poolDep, emailService: emailDep, now } = {
    ...defaultDeps,
    ...deps,
  };
  const client = await poolDep.connect();
  const {
    id,
    customer,
    status,
    items,
    current_period_end: currentPeriodEnd,
    current_period_start: currentPeriodStart,
    cancel_at_period_end: cancelAtPeriodEnd,
  } = subscription;

  const periodEnd = currentPeriodEnd ? new Date(currentPeriodEnd * 1000) : null;
  const periodStart = currentPeriodStart ? new Date(currentPeriodStart * 1000) : null;
  const { planId, planName } = extractPlanDetails(items, subscription.metadata);

  try {
    await client.query('BEGIN');

    const userResult = await client.query(
      'SELECT id, email, name FROM users WHERE stripe_customer_id = $1',
      [customer],
    );

    if (userResult.rowCount === 0) {
      throw new Error(`User with stripe customer ${customer} not found for subscription update`);
    }

    const user = userResult.rows[0];

    await client.query(
      `UPDATE users
         SET subscription_status = $1,
             plan = COALESCE($2, plan),
             current_period_end = $3,
             current_period_start = $4,
             status = CASE WHEN $1 = 'canceled' THEN 'inactive' ELSE status END
       WHERE id = $5`,
      [status, planId, periodEnd, periodStart, user.id],
    );

    await client.query(
      `UPDATE subscriptions
          SET status = $1,
              plan_id = $2,
              current_period_end = $3,
              current_period_start = $4,
              cancel_at_period_end = $5,
              cancelled_at = CASE WHEN $5 THEN COALESCE(cancelled_at, $6) ELSE NULL END,
              updated_at = NOW()
        WHERE stripe_subscription_id = $7`,
      [
        status,
        planId,
        periodEnd,
        periodStart,
        Boolean(cancelAtPeriodEnd),
        periodEnd,
        id,
      ],
    );

    await client.query('COMMIT');

    if (Boolean(cancelAtPeriodEnd) && user.email) {
      const cancellationDate = periodEnd
        ? periodEnd.toISOString().split('T')[0]
        : 'the end of your billing period';
      await emailDep.sendSubscriptionCancelled(user.email, user.name, cancellationDate);
    }
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

async function handleSubscriptionDeleted(subscription, deps = defaultDeps) {
  const { pool: poolDep, emailService: emailDep, now } = {
    ...defaultDeps,
    ...deps,
  };
  const client = await poolDep.connect();
  const { id, customer, ended_at: endedAt } = subscription;
  const cancelledAt = endedAt ? new Date(endedAt * 1000) : now();

  try {
    await client.query('BEGIN');

    const userResult = await client.query(
      'SELECT id, email, name FROM users WHERE stripe_customer_id = $1',
      [customer],
    );

    if (userResult.rowCount === 0) {
      throw new Error(`User with stripe customer ${customer} not found for subscription deletion`);
    }

    const user = userResult.rows[0];

    await client.query(
      `UPDATE subscriptions
          SET status = 'canceled',
              cancelled_at = $1,
              cancel_at_period_end = true,
              updated_at = NOW()
        WHERE stripe_subscription_id = $2`,
      [cancelledAt, id],
    );

    await client.query(
      `UPDATE users
          SET subscription_status = 'canceled',
              status = 'inactive'
        WHERE id = $1`,
      [user.id],
    );

    await client.query('COMMIT');

    if (user.email) {
      const cancellationDate = cancelledAt.toISOString().split('T')[0];
      await emailDep.sendSubscriptionCancelled(user.email, user.name, cancellationDate);
    }
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

async function handlePaymentSucceeded(invoice, deps = defaultDeps) {
  const { pool: poolDep, emailService: emailDep } = { ...defaultDeps, ...deps };
  const client = await poolDep.connect();
  const {
    customer,
    subscription,
    amount_paid: amountPaid,
    currency,
    id: invoiceId,
    payment_intent: paymentIntent,
    hosted_invoice_url: hostedInvoiceUrl,
    invoice_pdf: invoicePdf,
    lines,
  } = invoice;

  const amount = (amountPaid || 0) / 100;
  const line = lines?.data?.[0];
  const periodEnd = line?.period?.end ? new Date(line.period.end * 1000) : null;
  const periodStart = line?.period?.start ? new Date(line.period.start * 1000) : null;
  const planName =
    line?.plan?.nickname ||
    line?.price?.nickname ||
    line?.plan?.id ||
    line?.price?.lookup_key ||
    'BuildMyBot Subscription';

  try {
    await client.query('BEGIN');

    const userResult = await client.query(
      'SELECT id, email, name FROM users WHERE stripe_customer_id = $1',
      [customer],
    );

    if (userResult.rowCount === 0) {
      throw new Error(`User with stripe customer ${customer} not found for payment success`);
    }

    const user = userResult.rows[0];

    await client.query(
      `INSERT INTO payments (
         user_id,
         stripe_invoice_id,
         stripe_payment_intent_id,
         stripe_subscription_id,
         amount,
         currency,
         status,
         invoice_url,
         receipt_url,
         paid_at
       ) VALUES ($1, $2, $3, $4, $5, $6, 'succeeded', $7, $8, NOW())
       ON CONFLICT (stripe_invoice_id) DO UPDATE
         SET status = 'succeeded',
             amount = EXCLUDED.amount,
             currency = EXCLUDED.currency,
             stripe_payment_intent_id = EXCLUDED.stripe_payment_intent_id,
             stripe_subscription_id = EXCLUDED.stripe_subscription_id,
             invoice_url = EXCLUDED.invoice_url,
             receipt_url = EXCLUDED.receipt_url,
             paid_at = NOW(),
             user_id = EXCLUDED.user_id`,
      [
        user.id,
        invoiceId,
        paymentIntent || null,
        subscription || null,
        amount,
        currency || 'usd',
        hostedInvoiceUrl || null,
        invoicePdf || null,
      ],
    );

    await client.query(
      `UPDATE subscriptions
          SET status = 'active',
              current_period_end = COALESCE($1, current_period_end),
              current_period_start = COALESCE($2, current_period_start),
              cancel_at_period_end = false,
              cancelled_at = NULL,
              updated_at = NOW()
        WHERE stripe_subscription_id = $3`,
      [periodEnd, periodStart, subscription],
    );

    await client.query(
      `UPDATE users
          SET subscription_status = 'active',
              current_period_end = COALESCE($1, current_period_end),
              current_period_start = COALESCE($2, current_period_start),
              status = 'active'
        WHERE id = $3`,
      [periodEnd, periodStart, user.id],
    );

    await client.query('COMMIT');

    if (user.email) {
      const nextBillingDate = periodEnd
        ? periodEnd.toISOString().split('T')[0]
        : 'your next billing date';
      await emailDep.sendPaymentSuccess(user.email, user.name, amount, planName, nextBillingDate);
    }
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

async function handlePaymentFailed(invoice, deps = defaultDeps) {
  const { pool: poolDep, emailService: emailDep } = { ...defaultDeps, ...deps };
  const client = await poolDep.connect();
  const {
    customer,
    subscription,
    amount_due: amountDue,
    currency,
    id: invoiceId,
    payment_intent: paymentIntent,
  } = invoice;

  const amount = (amountDue || 0) / 100;

  try {
    await client.query('BEGIN');

    const userResult = await client.query(
      'SELECT id, email, name FROM users WHERE stripe_customer_id = $1',
      [customer],
    );

    if (userResult.rowCount === 0) {
      throw new Error(`User with stripe customer ${customer} not found for payment failure`);
    }

    const user = userResult.rows[0];

    await client.query(
      `INSERT INTO payments (
         user_id,
         stripe_invoice_id,
         stripe_payment_intent_id,
         stripe_subscription_id,
         amount,
         currency,
         status,
         paid_at
       ) VALUES ($1, $2, $3, $4, $5, $6, 'failed', NULL)
       ON CONFLICT (stripe_invoice_id) DO UPDATE
         SET status = 'failed',
             amount = EXCLUDED.amount,
             currency = EXCLUDED.currency,
             stripe_payment_intent_id = EXCLUDED.stripe_payment_intent_id,
             stripe_subscription_id = EXCLUDED.stripe_subscription_id,
             paid_at = NULL,
             user_id = EXCLUDED.user_id`,
      [
        user.id,
        invoiceId,
        paymentIntent || null,
        subscription || null,
        amount,
        currency || 'usd',
      ],
    );

    await client.query(
      `UPDATE subscriptions
          SET status = 'past_due',
              updated_at = NOW()
        WHERE stripe_subscription_id = $1`,
      [subscription],
    );

    await client.query(
      `UPDATE users
          SET subscription_status = 'past_due'
        WHERE id = $1`,
      [user.id],
    );

    await client.query('COMMIT');

    if (user.email) {
      await emailDep.sendPaymentFailed(user.email, user.name, amount);
    }
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

module.exports = router;
module.exports.handlers = {
  handleCheckoutCompleted,
  handleSubscriptionCreated,
  handleSubscriptionUpdated,
  handleSubscriptionDeleted,
  handlePaymentSucceeded,
  handlePaymentFailed,
};
module.exports.defaultDeps = defaultDeps;
