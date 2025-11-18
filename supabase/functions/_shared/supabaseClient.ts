import { createClient, type SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2.57.2';
import type { Database } from './database.types.ts';

export type SupabaseAdminClient = SupabaseClient<Database>;

export function getSupabaseAdminClient(): SupabaseAdminClient {
  const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Supabase environment variables are not configured');
  }

  return createClient<Database>(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false },
  });
}
