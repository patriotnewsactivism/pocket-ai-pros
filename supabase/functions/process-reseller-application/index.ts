import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { z } from "npm:zod";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const applicationSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Please enter your full name.")
    .max(120, "Full name must be 120 characters or less."),
  email: z
    .string()
    .trim()
    .email("Please enter a valid email address."),
  company: z
    .string()
    .trim()
    .min(2, "Please enter your company name.")
    .max(120, "Company name must be 120 characters or less."),
  phone: z
    .string()
    .trim()
    .max(30, "Phone number must be 30 characters or less.")
    .regex(/^[+\d().\s-]*$/, "Please enter a valid phone number.")
    .transform((value) => (value === "" ? undefined : value))
    .optional(),
  experience: z
    .string()
    .trim()
    .max(2000, "Experience description must be 2000 characters or less.")
    .transform((value) => (value === "" ? undefined : value))
    .optional(),
  expectedClients: z
    .preprocess((value) => {
      if (value === undefined || value === null || value === "") {
        return undefined;
      }
      if (typeof value === "number") {
        return value;
      }
      const parsed = Number(value);
      return Number.isNaN(parsed) ? Number.NaN : parsed;
    },
    z
      .number({ invalid_type_error: "Expected clients must be a number." })
      .int("Expected clients must be a whole number.")
      .min(1, "Please estimate at least one client."))
    .optional(),
});

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const payload = applicationSchema.parse(await req.json());

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    );

    // Create reseller application
    const { data: application, error: appError } = await supabaseClient
      .from("reseller_applications")
      .insert({
        name: payload.name,
        email: payload.email,
        company: payload.company,
        phone: payload.phone,
        experience: payload.experience,
        expected_clients: payload.expectedClients,
        status: "pending",
      })
      .select()
      .single();

    if (appError) throw appError;

    // Check if user exists with this email
    const { data: users } = await supabaseClient
      .from("users")
      .select("id")
      .eq("email", payload.email)
      .limit(1);

    const userId = users && users.length > 0 ? users[0].id : null;

    // If user exists, create reseller record immediately
    if (userId) {
      const { error: resellerError } = await supabaseClient
        .from("resellers")
        .insert({
          user_id: userId,
          status: "active",
          commission_rate: 40.00,
          clients_count: 0,
          total_earnings: 0,
        });

      if (resellerError && resellerError.code !== '23505') {
        console.error('Error creating reseller:', resellerError);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Application submitted successfully! You will receive confirmation within 2 business days.',
        application_id: application.id,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new Response(
        JSON.stringify({ error: error.issues[0]?.message ?? 'Invalid request payload' }),
        {
          status: 422,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    console.error('Error processing reseller application:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
