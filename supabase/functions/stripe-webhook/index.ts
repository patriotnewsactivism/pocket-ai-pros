import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0?target=deno";
import {
  FREE_PLAN,
  createSubscriptionPayload,
  getPaidPlanByPriceId,
  getPaidPlanByProductId,
  roundToTwoDecimals,
  type PlanConfigBase,
} from "../_shared/planConfig.ts";
import { getSupabaseAdminClient, type SupabaseAdminClient } from "../_shared/supabaseClient.ts";
import type { TablesInsert, TablesUpdate } from "../_shared/database.types.ts";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
  apiVersion: "2023-10-16",
  httpClient: Stripe.createFetchHttpClient(),
});

const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, stripe-signature",
};

type SubscriptionStatus = string;

async function getUserIdByStripeCustomerId(
  supabaseClient: SupabaseAdminClient,
  customerId: string,
): Promise<string | null> {
  const { data, error } = await supabaseClient
    .from("users")
    .select("id")
    .eq("stripe_customer_id", customerId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data?.id ?? null;
}

async function upsertSubscriptionRecord(
  supabaseClient: SupabaseAdminClient,
  userId: string,
  plan: PlanConfigBase,
  status: SubscriptionStatus,
  stripeSubscriptionId: string | null,
  periodStart: string,
  periodEnd: string | null
) {
  const payload: TablesUpdate<"subscriptions"> = createSubscriptionPayload(plan, {
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
    const insertPayload: TablesInsert<"subscriptions"> = { ...payload, user_id: userId };
    const { error: insertError } = await supabaseClient
      .from("subscriptions")
      .insert(insertPayload);

    if (insertError) {
      throw insertError;
    }
  }
}

function resolvePlanFromSubscription(subscription: Stripe.Subscription): PlanConfigBase {
  const priceId = subscription.items.data[0]?.price?.id ?? undefined;
  return getPaidPlanByPriceId(priceId) ?? FREE_PLAN;
}

function resolvePlanFromInvoice(invoice: Stripe.Invoice): PlanConfigBase {
  const priceId = invoice.lines.data[0]?.price?.id;
  const productId = invoice.lines.data[0]?.price?.product as string | undefined;
  return (
    getPaidPlanByPriceId(priceId ?? undefined) ||
    getPaidPlanByProductId(productId) ||
    FREE_PLAN
  );
}

async function updateUserById(
  supabaseClient: SupabaseAdminClient,
  userId: string,
  updates: TablesUpdate<"users">,
) {
  const { error } = await supabaseClient.from("users").update(updates).eq("id", userId);
  if (error) {
    throw error;
  }
}

async function updateUserByStripeCustomerId(
  supabaseClient: SupabaseAdminClient,
  customerId: string,
  updates: TablesUpdate<"users">,
) {
  const { error } = await supabaseClient.from("users").update(updates).eq("stripe_customer_id", customerId);
  if (error) {
    throw error;
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const supabaseClient = getSupabaseAdminClient();

  try {
    const signature = req.headers.get("stripe-signature");

    if (!signature) {
      return new Response(
        JSON.stringify({ error: "Missing stripe-signature header" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    if (!webhookSecret) {
      console.error("STRIPE_WEBHOOK_SECRET is not set");
      return new Response(
        JSON.stringify({ error: "Webhook secret not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const body = await req.text();

    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      console.error(`Webhook signature verification failed: ${errorMessage}`);
      return new Response(
        JSON.stringify({ error: `Webhook Error: ${errorMessage}` }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    console.log(`Processing webhook event: ${event.type}`);

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.client_reference_id;
        const subscriptionId = session.subscription as string | null;
        const customerId = session.customer as string | null;

        if (userId && subscriptionId) {
          const subscription = await stripe.subscriptions.retrieve(subscriptionId);
          const planDetails = resolvePlanFromSubscription(subscription);
          const periodStart = new Date(subscription.current_period_start * 1000).toISOString();
          const periodEnd = new Date(subscription.current_period_end * 1000).toISOString();

          await updateUserById(supabaseClient, userId, {
            plan: planDetails.slug,
            bots_limit: planDetails.botsLimit,
            conversations_limit: planDetails.conversationsLimit,
            stripe_customer_id: customerId,
            stripe_subscription_id: subscription.id,
            subscription_status: subscription.status,
            current_period_end: periodEnd,
          });

          await upsertSubscriptionRecord(
            supabaseClient,
            userId,
            planDetails,
            subscription.status,
            subscription.id,
            periodStart,
            periodEnd,
          );
        }
        break;
      }

      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;
        const userId = await getUserIdByStripeCustomerId(supabaseClient, customerId);

        if (userId) {
          const planDetails = resolvePlanFromSubscription(subscription);
          const periodStart = new Date(subscription.current_period_start * 1000).toISOString();
          const periodEnd = new Date(subscription.current_period_end * 1000).toISOString();

          await updateUserById(supabaseClient, userId, {
            plan: planDetails.slug,
            bots_limit: planDetails.botsLimit,
            conversations_limit: planDetails.conversationsLimit,
            stripe_subscription_id: subscription.id,
            subscription_status: subscription.status,
            current_period_end: periodEnd,
          });

          await upsertSubscriptionRecord(
            supabaseClient,
            userId,
            planDetails,
            subscription.status,
            subscription.id,
            periodStart,
            periodEnd,
          );
        }
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;
        const userId = await getUserIdByStripeCustomerId(supabaseClient, customerId);

        if (userId) {
          await updateUserById(supabaseClient, userId, {
            plan: FREE_PLAN.slug,
            bots_limit: FREE_PLAN.botsLimit,
            conversations_limit: FREE_PLAN.conversationsLimit,
            stripe_subscription_id: null,
            subscription_status: "cancelled",
            current_period_end: null,
          });

          await upsertSubscriptionRecord(
            supabaseClient,
            userId,
            FREE_PLAN,
            "cancelled",
            subscription.id,
            new Date(subscription.current_period_start * 1000).toISOString(),
            null,
          );
        }
        break;
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = invoice.customer as string;
        const planDetails = resolvePlanFromInvoice(invoice);
        const periodStart = invoice.lines.data[0]?.period?.start
          ? new Date(invoice.lines.data[0].period.start * 1000).toISOString()
          : new Date().toISOString();
        const periodEnd = invoice.lines.data[0]?.period?.end
          ? new Date(invoice.lines.data[0].period.end * 1000).toISOString()
          : null;

        await updateUserByStripeCustomerId(supabaseClient, customerId, {
          subscription_status: "active",
          current_period_end: periodEnd,
        });

        const userId = await getUserIdByStripeCustomerId(supabaseClient, customerId);
        if (userId) {
          await upsertSubscriptionRecord(
            supabaseClient,
            userId,
            planDetails,
            "active",
            invoice.subscription as string | null,
            periodStart,
            periodEnd,
          );
        }
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = invoice.customer as string;
        const planDetails = resolvePlanFromInvoice(invoice);
        const periodStart = invoice.lines.data[0]?.period?.start
          ? new Date(invoice.lines.data[0].period.start * 1000).toISOString()
          : new Date().toISOString();
        const periodEnd = invoice.lines.data[0]?.period?.end
          ? new Date(invoice.lines.data[0].period.end * 1000).toISOString()
          : null;

        await updateUserByStripeCustomerId(supabaseClient, customerId, {
          subscription_status: "past_due",
        });

        const userId = await getUserIdByStripeCustomerId(supabaseClient, customerId);
        if (userId) {
          await upsertSubscriptionRecord(
            supabaseClient,
            userId,
            planDetails,
            "past_due",
            invoice.subscription as string | null,
            periodStart,
            periodEnd,
          );
        }
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return new Response(
      JSON.stringify({ received: true, event_type: event.type }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Webhook error:", errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});
