import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { name, email, company, phone, experience, expectedClients } = await req.json();

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Create reseller application
    const { data: application, error: appError } = await supabaseClient
      .from('reseller_applications')
      .insert({
        name,
        email,
        company,
        phone,
        experience,
        expected_clients: expectedClients,
        status: 'approved', // Auto-approve for now
      })
      .select()
      .single();

    if (appError) throw appError;

    // Check if user exists with this email
    const { data: users } = await supabaseClient
      .from('users')
      .select('id')
      .eq('email', email)
      .limit(1);

    const userId = users && users.length > 0 ? users[0].id : null;

    // If user exists, create reseller record immediately
    if (userId) {
      const { error: resellerError } = await supabaseClient
        .from('resellers')
        .insert({
          user_id: userId,
          status: 'active',
          commission_rate: 40.00,
          clients_count: 0,
          total_earnings: 0,
        });

      if (resellerError && resellerError.code !== '23505') { // Ignore duplicate errors
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
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
