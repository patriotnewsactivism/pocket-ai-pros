import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import {
  createSubscriptionPayload,
  getPaidPlanBySlug,
  type PaidPlanConfig,
} from "../_shared/planConfig.ts";
import { getSupabaseAdminClient, type SupabaseAdminClient } from "../_shared/supabaseClient.ts";
import type { TablesInsert, TablesUpdate } from "../_shared/database.types.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type CheckoutRequestBody = {
  plan?: string;
};

function ensureStripeConfigured(): Stripe {
  const secretKey = Deno.env.get("STRIPE_SECRET_KEY");
  if (!secretKey) {
    throw new Error("Stripe secret key is not configured");
  }
  return new Stripe(secretKey, { apiVersion: "2025-08-27.basil" });
}

async function upsertPendingSubscription(
  supabaseClient: SupabaseAdminClient,
  userId: string,
  plan: PaidPlanConfig
) {
  const pendingPayload: TablesUpdate<"subscriptions"> = createSubscriptionPayload(plan, {
    plan: plan.slug,
    status: "pending",
    stripe_subscription_id: null,
    expires_at: null,
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
      .update(pendingPayload)
      .eq("id", existing.id);

    if (updateError) {
      throw updateError;
    }
  } else {
    const insertPayload: TablesInsert<"subscriptions"> = { ...pendingPayload, user_id: userId };
    const { error: insertError } = await supabaseClient
      .from("subscriptions")
      .insert(insertPayload);

    if (insertError) {
      throw insertError;
    }
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = (await req.json()) as CheckoutRequestBody;
    const planSlug = body.plan?.toLowerCase();

    const planConfig = getPaidPlanBySlug(planSlug ?? "");
    if (!planConfig) {
      return new Response(
        JSON.stringify({ error: "Invalid plan selected" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        },
      );
    }

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Missing authorization header" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 401,
        },
      );
    }

    const supabaseClient = getSupabaseAdminClient();
    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);

    if (userError || !userData.user?.email) {
      return new Response(
        JSON.stringify({ error: "User not authenticated" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 401,
        },
      );
    }

    const stripe = ensureStripeConfigured();
    const user = userData.user;

    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    const customerId = customers.data.length > 0 ? customers.data[0].id : undefined;

    const origin = req.headers.get("origin") ?? Deno.env.get("PUBLIC_SITE_URL");
    if (!origin) {
      return new Response(
        JSON.stringify({ error: "Missing origin header for redirect URLs" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        },
      );
    }

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : user.email,
      client_reference_id: user.id,
      line_items: [
        {
          price: planConfig.stripePriceId,
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: `${origin}/dashboard?success=true`,
      cancel_url: `${origin}/?canceled=true`,
      metadata: {
        user_id: user.id,
        plan: planConfig.slug,
        bots_limit: planConfig.botsLimit.toString(),
        conversations_limit: planConfig.conversationsLimit.toString(),
      },
    });

    await upsertPendingSubscription(supabaseClient, user.id, planConfig);

    const userUpdates: TablesUpdate<"users"> = { subscription_status: "pending" };
    if (customerId) {
      userUpdates.stripe_customer_id = customerId;
    }

    const { error: userUpdateError } = await supabaseClient
      .from("users")
      .update(userUpdates)
      .eq("id", user.id);

    if (userUpdateError) {
      throw userUpdateError;
    }

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Checkout error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      },
    );
  }
});
