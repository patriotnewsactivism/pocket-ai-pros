/**
 * Supabase client configuration
 * Direct database connection for BuildMyBot
 */

import { createClient } from '@supabase/supabase-js';
import { env } from '@/config/env';

// Initialize Supabase client
export const supabase = createClient(env.supabaseUrl, env.supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

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
    const { data } = await supabase
      .from('subscribers')
      .select('id')
      .eq('email', email)
      .single();
    
    return !!data;
  },

  // Reseller Applications
  async createResellerApplication(application: ResellerApplication) {
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
    const { data } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single();
    
    return !!data;
  },

  // Statistics
  async getStats(): Promise<Stats> {
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
  },
};
