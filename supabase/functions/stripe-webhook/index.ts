import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from 'https://esm.sh/stripe@14.21.0?target=deno';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2023-10-16',
  httpClient: Stripe.createFetchHttpClient(),
});

const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, stripe-signature',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const signature = req.headers.get('stripe-signature');

    if (!signature) {
      return new Response(
        JSON.stringify({ error: 'Missing stripe-signature header' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!webhookSecret) {
      console.error('STRIPE_WEBHOOK_SECRET is not set');
      return new Response(
        JSON.stringify({ error: 'Webhook secret not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get the raw body for signature verification
    const body = await req.text();

    // Verify the webhook signature
    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      console.error(`Webhook signature verification failed: ${errorMessage}`);
      return new Response(
        JSON.stringify({ error: `Webhook Error: ${errorMessage}` }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Processing webhook event: ${event.type}`);

    // Create Supabase client for database operations
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

    // Handle different event types
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        console.log('Checkout session completed:', session.id);

        // Update user subscription in database
        const userId = session.client_reference_id;
        const subscriptionId = session.subscription as string;

        if (userId && subscriptionId) {
          // Fetch subscription details from Stripe
          const subscription = await stripe.subscriptions.retrieve(subscriptionId);
          const priceId = subscription.items.data[0]?.price.id;

          // Map price ID to plan
          const planMapping: Record<string, { plan: string; bots_limit: number; conversations_limit: number }> = {
            'price_1SRAf8EgFdyBUl5uXyxhzFuc': { plan: 'starter', bots_limit: 3, conversations_limit: 750 },
            'price_1SRAfFEgFdyBUl5ubXElJPkQ': { plan: 'professional', bots_limit: 5, conversations_limit: 5000 },
            'price_1SRAfGEgFdyBUl5uT9uiuSSH': { plan: 'executive', bots_limit: 10, conversations_limit: 15000 },
            'price_1SRAfHEgFdyBUl5u2wjqK7td': { plan: 'enterprise', bots_limit: 999, conversations_limit: 50000 },
          };

          const planConfig = planMapping[priceId] || { plan: 'free', bots_limit: 1, conversations_limit: 100 };

          // Update database via Supabase REST API
          const response = await fetch(`${supabaseUrl}/rest/v1/users?id=eq.${userId}`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${supabaseKey}`,
              'apikey': supabaseKey,
              'Prefer': 'return=representation',
            },
            body: JSON.stringify({
              plan: planConfig.plan,
              bots_limit: planConfig.bots_limit,
              conversations_limit: planConfig.conversations_limit,
              stripe_customer_id: session.customer,
              stripe_subscription_id: subscriptionId,
              subscription_status: subscription.status,
              current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
            }),
          });

          if (!response.ok) {
            console.error('Failed to update user subscription:', await response.text());
          } else {
            console.log('Successfully updated user subscription for:', userId);
          }
        }
        break;
      }

      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        console.log('Subscription updated:', subscription.id);

        // Find user by Stripe customer ID
        const customerId = subscription.customer as string;
        const priceId = subscription.items.data[0]?.price.id;

        // Map price ID to plan
        const planMapping: Record<string, { plan: string; bots_limit: number; conversations_limit: number }> = {
          'price_1SRAf8EgFdyBUl5uXyxhzFuc': { plan: 'starter', bots_limit: 3, conversations_limit: 750 },
          'price_1SRAfFEgFdyBUl5ubXElJPkQ': { plan: 'professional', bots_limit: 5, conversations_limit: 5000 },
          'price_1SRAfGEgFdyBUl5uT9uiuSSH': { plan: 'executive', bots_limit: 10, conversations_limit: 15000 },
          'price_1SRAfHEgFdyBUl5u2wjqK7td': { plan: 'enterprise', bots_limit: 999, conversations_limit: 50000 },
        };

        const planConfig = planMapping[priceId] || { plan: 'free', bots_limit: 1, conversations_limit: 100 };

        // Update database
        const response = await fetch(`${supabaseUrl}/rest/v1/users?stripe_customer_id=eq.${customerId}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${supabaseKey}`,
            'apikey': supabaseKey,
            'Prefer': 'return=representation',
          },
          body: JSON.stringify({
            plan: planConfig.plan,
            bots_limit: planConfig.bots_limit,
            conversations_limit: planConfig.conversations_limit,
            stripe_subscription_id: subscription.id,
            subscription_status: subscription.status,
            current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
          }),
        });

        if (!response.ok) {
          console.error('Failed to update subscription:', await response.text());
        } else {
          console.log('Successfully updated subscription for customer:', customerId);
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        console.log('Subscription cancelled:', subscription.id);

        const customerId = subscription.customer as string;

        // Downgrade user to free plan
        const response = await fetch(`${supabaseUrl}/rest/v1/users?stripe_customer_id=eq.${customerId}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${supabaseKey}`,
            'apikey': supabaseKey,
            'Prefer': 'return=representation',
          },
          body: JSON.stringify({
            plan: 'free',
            bots_limit: 1,
            conversations_limit: 100,
            stripe_subscription_id: null,
            subscription_status: 'cancelled',
            current_period_end: null,
          }),
        });

        if (!response.ok) {
          console.error('Failed to downgrade subscription:', await response.text());
        } else {
          console.log('Successfully downgraded user to free plan');
        }
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice;
        console.log('Payment succeeded for invoice:', invoice.id);

        // Update payment status
        const customerId = invoice.customer as string;
        const response = await fetch(`${supabaseUrl}/rest/v1/users?stripe_customer_id=eq.${customerId}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${supabaseKey}`,
            'apikey': supabaseKey,
            'Prefer': 'return=representation',
          },
          body: JSON.stringify({
            subscription_status: 'active',
          }),
        });

        if (!response.ok) {
          console.error('Failed to update payment status:', await response.text());
        }
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        console.log('Payment failed for invoice:', invoice.id);

        // Update payment status to past_due
        const customerId = invoice.customer as string;
        const response = await fetch(`${supabaseUrl}/rest/v1/users?stripe_customer_id=eq.${customerId}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${supabaseKey}`,
            'apikey': supabaseKey,
            'Prefer': 'return=representation',
          },
          body: JSON.stringify({
            subscription_status: 'past_due',
          }),
        });

        if (!response.ok) {
          console.error('Failed to update payment failed status:', await response.text());
        }
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    // Return success response
    return new Response(
      JSON.stringify({ received: true, event_type: event.type }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Webhook error:', error);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
