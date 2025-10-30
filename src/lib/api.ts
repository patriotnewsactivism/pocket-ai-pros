/**
 * API client for backend communication
 * Handles all HTTP requests with proper error handling and typing
 */

import { env } from '@/config/env';

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

interface RequestConfig extends RequestInit {
  timeout?: number;
}

/**
 * Make an API request with proper error handling
 */
async function request<T>(
  endpoint: string,
  config: RequestConfig = {}
): Promise<T> {
  const { timeout = env.apiTimeout, ...fetchConfig } = config;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(`${env.apiBaseUrl}${endpoint}`, {
      ...fetchConfig,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...fetchConfig.headers,
      },
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new ApiError(
        errorData.message || 'An error occurred',
        response.status,
        errorData
      );
    }

    return response.json();
  } catch (error) {
    clearTimeout(timeoutId);

    if (error instanceof ApiError) {
      throw error;
    }

    if ((error as Error).name === 'AbortError') {
      throw new ApiError('Request timeout', 408);
    }

    throw new ApiError('Network error', 0, error);
  }
}

// API Methods
export const api = {
  // Contact form submission
  submitContact: (data: {
    name: string;
    email: string;
    company?: string;
    message: string;
  }) => request('/contact', {
    method: 'POST',
    body: JSON.stringify(data),
  }),

  // Newsletter subscription
  subscribe: (email: string) => request('/subscribe', {
    method: 'POST',
    body: JSON.stringify({ email }),
  }),

  // Reseller program application
  applyReseller: (data: {
    name: string;
    email: string;
    company: string;
    phone?: string;
    experience?: string;
    expectedClients?: number;
  }) => request('/reseller/apply', {
    method: 'POST',
    body: JSON.stringify(data),
  }),

  // Get started / Sign up
  signUp: (data: {
    name: string;
    email: string;
    company?: string;
    plan?: string;
  }) => request('/auth/signup', {
    method: 'POST',
    body: JSON.stringify(data),
  }),

  // Get pricing details
  getPricing: () => request('/pricing', {
    method: 'GET',
  }),

  // Get bot statistics (for dashboard)
  getStats: () => request<{
    totalBots: number;
    activeUsers: number;
    messagesProcessed: number;
    uptime: number;
  }>('/stats', {
    method: 'GET',
  }),
};

// Mock API for development (when backend is not available)
export const mockApi = {
  submitContact: async (data: Record<string, unknown>) => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log('Mock: Contact form submitted', data);
    return { success: true, message: 'Thank you for contacting us!' };
  },

  subscribe: async (email: string) => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log('Mock: Newsletter subscription', email);
    return { success: true, message: 'Successfully subscribed!' };
  },

  applyReseller: async (data: Record<string, unknown>) => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log('Mock: Reseller application', data);
    return { success: true, message: 'Application received!' };
  },

  signUp: async (data: Record<string, unknown>) => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log('Mock: Sign up', data);
    return { success: true, message: 'Account created!', userId: '123' };
  },

  getPricing: async () => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return {
      plans: [
        { id: 'starter', name: 'Starter', price: 29 },
        { id: 'professional', name: 'Professional', price: 99 },
        { id: 'enterprise', name: 'Enterprise', price: 299 },
      ],
    };
  },

  getStats: async () => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return {
      totalBots: 523,
      activeUsers: 1247,
      messagesProcessed: 45678,
      uptime: 99.9,
    };
  },
};

// Export the appropriate API based on environment
export default env.isDevelopment ? mockApi : api;
