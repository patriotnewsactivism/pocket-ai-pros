import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Product IDs mapping
const PLAN_PRODUCTS: Record<string, string> = {
  "prod_TNwYO6OpOO87gJ": "starter",
  "prod_TNwYGAd8TXQ6JS": "professional",
  "prod_TNwYeZyWmkfzaJ": "executive",
  "prod_TNwYDv1DDDmiMf": "enterprise",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("No authorization header");
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    
    if (userError || !userData.user?.email) {
      throw new Error("User not authenticated");
    }

    const user = userData.user;
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    
    if (customers.data.length === 0) {
      return new Response(
        JSON.stringify({ subscribed: false, plan: "free" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }

    const customerId = customers.data[0].id;
    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: "active",
      limit: 1,
    });

    if (subscriptions.data.length === 0) {
      return new Response(
        JSON.stringify({ subscribed: false, plan: "free" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }

    const subscription = subscriptions.data[0];
    const productId = subscription.items.data[0].price.product as string;
    const plan = PLAN_PRODUCTS[productId] || "unknown";
    const subscriptionEnd = new Date(subscription.current_period_end * 1000).toISOString();

    // Update user's subscription in database
    const planConfig: Record<string, { bots_limit: number; conversations_limit: number }> = {
      starter: { bots_limit: 3, conversations_limit: 750 },
      professional: { bots_limit: 5, conversations_limit: 5000 },
      executive: { bots_limit: 10, conversations_limit: 15000 },
      enterprise: { bots_limit: 999, conversations_limit: 50000 },
    };

    const config = planConfig[plan] || { bots_limit: 1, conversations_limit: 60 };

    await supabaseClient
      .from("users")
      .update({
        plan,
        bots_limit: config.bots_limit,
        conversations_limit: config.conversations_limit,
      })
      .eq("id", user.id);

    await supabaseClient
      .from("subscriptions")
      .upsert({
        user_id: user.id,
        plan,
        price: subscription.items.data[0].price.unit_amount! / 100,
        bots_limit: config.bots_limit,
        conversations_limit: config.conversations_limit,
        status: "active",
        stripe_subscription_id: subscription.id,
        started_at: new Date(subscription.created * 1000).toISOString(),
        expires_at: subscriptionEnd,
      }, {
        onConflict: "user_id",
      });

    return new Response(
      JSON.stringify({
        subscribed: true,
        plan,
        subscription_end: subscriptionEnd,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Check subscription error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
