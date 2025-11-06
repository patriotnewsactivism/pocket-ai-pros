/**
 * API client using Supabase
 * Direct database operations - NO HTTP middleware needed
 */

import { db } from './supabase';

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public data?: unknown
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// API Methods using Supabase directly
export const api = {
  // Contact form submission
  async submitContact(data: {
    name: string;
    email: string;
    company?: string;
    message: string;
  }) {
    try {
      await db.createContact(data);
      return {
        success: true,
        message: "Thank you for contacting us! We'll get back to you within 24 hours.",
      };
    } catch (error) {
      throw new ApiError(
        error instanceof Error ? error.message : 'Failed to submit contact form',
        500,
        error
      );
    }
  },

  // Newsletter subscription
  async subscribe(email: string) {
    try {
      const exists = await db.checkSubscriber(email);
      if (exists) {
        throw new ApiError('This email is already subscribed', 400);
      }
      
      await db.createSubscriber(email);
      return {
        success: true,
        message: "You've been successfully subscribed to our newsletter!",
      };
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(
        error instanceof Error ? error.message : 'Failed to subscribe',
        500,
        error
      );
    }
  },

  // Reseller program application
  async applyReseller(data: {
    name: string;
    email: string;
    company: string;
    phone?: string;
    experience?: string;
    expectedClients?: number;
  }) {
    try {
      await db.createResellerApplication(data);
      return {
        success: true,
        message: "Application received! We'll review within 2 business days.",
      };
    } catch (error) {
      throw new ApiError(
        error instanceof Error ? error.message : 'Failed to submit application',
        500,
        error
      );
    }
  },

  // Get started / Sign up
  async signUp(data: {
    name: string;
    email: string;
    company?: string;
    plan?: string;
  }) {
    try {
      const exists = await db.checkUserExists(data.email);
      if (exists) {
        throw new ApiError('An account with this email already exists', 400);
      }
      
      const user = await db.createUser(data);
      return {
        success: true,
        message: 'Account created successfully! Check your email for next steps.',
        userId: user.id,
      };
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(
        error instanceof Error ? error.message : 'Failed to create account',
        500,
        error
      );
    }
  },

  // Get pricing details (static for now, could be from DB)
  async getPricing() {
    return {
      plans: [
        {
          id: 'starter',
          name: 'Starter',
          price: 29,
          features: [
            '1 Custom AI Bot',
            '1,000 messages/month',
            'GPT-4o-mini powered',
            'Basic analytics',
            'Email support',
            'Standard training data',
          ],
        },
        {
          id: 'professional',
          name: 'Professional',
          price: 99,
          features: [
            '5 Custom AI Bots',
            '10,000 messages/month',
            'GPT-4o-mini powered',
            'Advanced analytics',
            'Priority support',
            'Custom training data',
            'API access',
            'Multi-language support',
          ],
        },
        {
          id: 'enterprise',
          name: 'Enterprise',
          price: 299,
          features: [
            'Unlimited AI Bots',
            'Unlimited messages',
            'GPT-4o-mini + premium models',
            'Enterprise analytics',
            '24/7 dedicated support',
            'Custom integrations',
            'White-label options',
            'SLA guarantee',
            'Team collaboration',
          ],
        },
      ],
    };
  },

  // Get bot statistics
  async getStats() {
    try {
      return await db.getStats();
    } catch (error) {
      // In production, log to monitoring service
      // Return minimal stats instead of fake data to indicate error state
      throw new ApiError(
        'Failed to fetch statistics',
        500,
        error
      );
    }
  },
};

// Export the real API - Direct Supabase integration
export default api;
