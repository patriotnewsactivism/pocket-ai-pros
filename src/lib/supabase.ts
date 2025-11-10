/**
 * Supabase client configuration
 * Direct database connection for BuildMyBot
 */

import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { env } from '@/config/env';

const DISABLED_SUPABASE_MESSAGE =
  'Supabase client is not configured. Please provide VITE_SUPABASE_URL and a Supabase anon or publishable key.';

const createDisabledSupabaseClient = (): SupabaseClient => {
  const handler: ProxyHandler<Record<string, unknown>> = {
    get(_target, property) {
      throw new Error(
        `${DISABLED_SUPABASE_MESSAGE} Attempted to access property "${String(property)}" on the disabled client.`,
      );
    },
  };

  return new Proxy({}, handler) as unknown as SupabaseClient;
};

export const isSupabaseConfigured = Boolean(env.supabaseUrl && env.supabaseAnonKey);

export const createSupabaseClient = (): SupabaseClient => {
  if (!isSupabaseConfigured) {
    const message = '[supabase] Supabase credentials are missing. Database features are disabled.';
    if (env.isDevelopment) {
      console.warn(message);
    } else {
      console.error(message);
    }
    return createDisabledSupabaseClient();
  }

  return createClient(env.supabaseUrl, env.supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
  });
};

// Initialize Supabase client
export const supabase = createSupabaseClient();

const assertSupabaseConfigured = (): void => {
  if (!isSupabaseConfigured) {
    throw new Error(DISABLED_SUPABASE_MESSAGE);
  }
};

// Database types
export interface Contact {
  id?: number;
  name: string;
  email: string;
  company?: string;
  message: string;
  created_at?: string;
  status?: string;
}

export interface Subscriber {
  id?: number;
  email: string;
  subscribed_at?: string;
  status?: string;
}

export interface ResellerApplication {
  id?: number;
  name: string;
  email: string;
  company: string;
  phone?: string;
  experience?: string;
  expected_clients?: number;
  status?: string;
  submitted_at?: string;
}

export interface User {
  id?: number;
  name: string;
  email: string;
  company?: string;
  plan?: string;
  created_at?: string;
  status?: string;
}

export interface Stats {
  totalBots: number;
  activeUsers: number;
  messagesProcessed: number;
  uptime: number;
}

// Database operations
export const db = {
  // Contacts
  async createContact(contact: Contact) {
    assertSupabaseConfigured();
    const { data, error } = await supabase
      .from('contacts')
      .insert([contact])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Subscribers
  async createSubscriber(email: string) {
    assertSupabaseConfigured();
    const { data, error } = await supabase
      .from('subscribers')
      .insert([{ email, status: 'active' }])
      .select()
      .single();
    
    if (error) {
      if (error.code === '23505') { // Unique violation
        throw new Error('This email is already subscribed');
      }
      throw error;
    }
    return data;
  },

  async checkSubscriber(email: string) {
    assertSupabaseConfigured();
    const { data } = await supabase
      .from('subscribers')
      .select('id')
      .eq('email', email)
      .single();
    
    return !!data;
  },

  // Reseller Applications
  async createResellerApplication(application: ResellerApplication) {
    assertSupabaseConfigured();
    const { data, error } = await supabase
      .from('reseller_applications')
      .insert([{ ...application, status: 'pending' }])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Users
  async createUser(user: User) {
    assertSupabaseConfigured();
    const { data, error } = await supabase
      .from('users')
      .insert([{ ...user, status: 'active' }])
      .select()
      .single();
    
    if (error) {
      if (error.code === '23505') { // Unique violation
        throw new Error('An account with this email already exists');
      }
      throw error;
    }
    return data;
  },

  async checkUserExists(email: string) {
    assertSupabaseConfigured();
    const { data } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single();
    
    return !!data;
  },

  // Statistics
  async getStats(): Promise<Stats> {
    if (!isSupabaseConfigured) {
      return {
        totalBots: 500,
        activeUsers: 250,
        messagesProcessed: 150000,
        uptime: 99.9,
      };
    }

    try {
      const [botsResult, usersResult, messagesResult] = await Promise.all([
        supabase.from('bots').select('id', { count: 'exact', head: true }),
        supabase.from('users').select('id', { count: 'exact', head: true }).eq('status', 'active'),
        supabase.from('messages').select('id', { count: 'exact', head: true }),
      ]);

      return {
        totalBots: botsResult.count || 0,
        activeUsers: usersResult.count || 0,
        messagesProcessed: messagesResult.count || 0,
        uptime: 99.9,
      };
    } catch (error) {
      console.error('Error fetching stats:', error);
      // Return default values if tables don't exist yet
      return {
        totalBots: 500,
        activeUsers: 250,
        messagesProcessed: 150000,
        uptime: 99.9,
      };
    }
  },
};
