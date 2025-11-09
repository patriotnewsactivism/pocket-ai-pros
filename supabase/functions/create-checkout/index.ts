import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CheckoutRequest {
  plan: string;
  email: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { plan, email }: CheckoutRequest = await req.json();

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get the authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user } } = await supabaseClient.auth.getUser(token);

    if (!user) {
      throw new Error('Not authenticated');
    }

    // Plan configurations
    const planConfig: Record<string, { price: number; bots_limit: number; conversations_limit: number }> = {
      starter: { price: 29, bots_limit: 3, conversations_limit: 750 },
      professional: { price: 99, bots_limit: 5, conversations_limit: 5000 },
      executive: { price: 199, bots_limit: 10, conversations_limit: 15000 },
      enterprise: { price: 399, bots_limit: 999, conversations_limit: 50000 },
    };

    const config = planConfig[plan.toLowerCase()];
    if (!config) {
      throw new Error('Invalid plan');
    }

    // Create or update subscription
    const { error: subscriptionError } = await supabaseClient
      .from('subscriptions')
      .upsert({
        user_id: user.id,
        plan: plan.toLowerCase(),
        price: config.price,
        bots_limit: config.bots_limit,
        conversations_limit: config.conversations_limit,
        status: 'active',
        started_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      }, {
        onConflict: 'user_id'
      });

    if (subscriptionError) throw subscriptionError;

    // Update user plan and limits
    const { error: userError } = await supabaseClient
      .from('users')
      .update({
        plan: plan.toLowerCase(),
        bots_limit: config.bots_limit,
        conversations_limit: config.conversations_limit,
      })
      .eq('id', user.id);

    if (userError) throw userError;

    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Subscription activated successfully',
        plan: plan.toLowerCase(),
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
