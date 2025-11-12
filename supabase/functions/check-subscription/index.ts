import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient, type SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import {
  FREE_PLAN,
  createSubscriptionPayload,
  getPaidPlanByProductId,
  roundToTwoDecimals,
  type PlanConfigBase,
} from "../_shared/planConfig.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type AdminClient = SupabaseClient<unknown>;

type SubscriptionStatus = "active" | "canceled" | "past_due" | "trialing" | "unpaid" | "incomplete" | string;

function getSupabaseClient(): AdminClient {
  const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("Supabase environment variables are not configured");
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false },
  });
}

function getStripeClient(): Stripe {
  const secretKey = Deno.env.get("STRIPE_SECRET_KEY");
  if (!secretKey) {
    throw new Error("Stripe secret key is not configured");
  }
  return new Stripe(secretKey, { apiVersion: "2025-08-27.basil" });
}

async function saveSubscription(
  supabaseClient: AdminClient,
  userId: string,
  plan: PlanConfigBase,
  status: SubscriptionStatus,
  stripeSubscriptionId: string | null,
  periodStart: string,
  periodEnd: string | null
) {
  const payload = createSubscriptionPayload(plan, {
    plan: plan.slug,
    status,
    stripe_subscription_id: stripeSubscriptionId,
    started_at: periodStart,
    expires_at: periodEnd,
    price: roundToTwoDecimals(plan.priceCents / 100),
  });

  const { data: existing, error: fetchError } = await supabaseClient
    .from("subscriptions")
    .select("id")
    .eq("user_id", userId)
    .maybeSingle();

  if (fetchError) {
    throw fetchError;
  }

  if (existing?.id) {
    const { error: updateError } = await supabaseClient
      .from("subscriptions")
      .update(payload)
      .eq("id", existing.id);

    if (updateError) {
      throw updateError;
    }
  } else {
    const { error: insertError } = await supabaseClient
      .from("subscriptions")
      .insert({ ...payload, user_id: userId });

    if (insertError) {
      throw insertError;
    }
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = getSupabaseClient();

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
    const stripe = getStripeClient();

    const customers = await stripe.customers.list({ email: user.email, limit: 1 });

    if (customers.data.length === 0) {
      return new Response(
        JSON.stringify({ subscribed: false, plan: FREE_PLAN.slug }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        },
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
        JSON.stringify({ subscribed: false, plan: FREE_PLAN.slug }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        },
      );
    }

    const subscription = subscriptions.data[0];
    const productId = subscription.items.data[0].price.product as string | null;
    const planDetails = getPaidPlanByProductId(productId ?? undefined) ?? FREE_PLAN;
    const plan = planDetails.slug;
    const subscriptionEnd = new Date(subscription.current_period_end * 1000).toISOString();
    const periodStart = new Date(subscription.current_period_start * 1000).toISOString();

    await supabaseClient
      .from("users")
      .update({
        plan,
        bots_limit: planDetails.botsLimit,
        conversations_limit: planDetails.conversationsLimit,
        stripe_subscription_id: subscription.id,
        stripe_customer_id: customerId,
        subscription_status: subscription.status,
        current_period_end: subscriptionEnd,
      })
      .eq("id", user.id);

    await saveSubscription(
      supabaseClient,
      user.id,
      planDetails,
      subscription.status,
      subscription.id,
      periodStart,
      subscriptionEnd,
    );

    return new Response(
      JSON.stringify({
        subscribed: true,
        plan,
        subscription_end: subscriptionEnd,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      },
    );
  } catch (error) {
    console.error("Check subscription error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      },
    );
  }
});
