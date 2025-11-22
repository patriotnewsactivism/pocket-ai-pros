/**
 * Environment configuration
 * All environment variables should be accessed through this file
 */

export const env = {
  // Supabase Configuration
  supabaseUrl: import.meta.env.VITE_SUPABASE_URL || '',
  supabaseAnonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || '',

  // API Configuration
  // Default to Supabase Edge Functions if VITE_API_BASE_URL is not set
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL ||
    (import.meta.env.VITE_SUPABASE_URL ? `${import.meta.env.VITE_SUPABASE_URL}/functions/v1` : ''),
  apiTimeout: Number(import.meta.env.VITE_API_TIMEOUT) || 30000,

  // Feature Flags
  enableAnalytics: import.meta.env.VITE_ENABLE_ANALYTICS === 'true',
  enableChatWidget: import.meta.env.VITE_ENABLE_CHAT_WIDGET === 'true',
  enableAIChatbot: import.meta.env.VITE_ENABLE_AI_CHATBOT === 'true',
  businessType: import.meta.env.VITE_BUSINESS_TYPE || 'support',

  // External Services
  stripePublicKey: import.meta.env.VITE_STRIPE_PUBLIC_KEY || '',
  googleAnalyticsId: import.meta.env.VITE_GOOGLE_ANALYTICS_ID || '',
  // Environment
  appEnv: import.meta.env.VITE_APP_ENV || 'development',
  isDevelopment: import.meta.env.DEV,
  isProduction: import.meta.env.PROD,
} as const;

// Validate required environment variables
export function validateEnv() {
  const required = {
    VITE_SUPABASE_URL: env.supabaseUrl,
    VITE_SUPABASE_ANON_KEY: env.supabaseAnonKey,
  };

  const missing = Object.entries(required)
    .filter(([_, value]) => !value)
    .map(([key]) => key);

  if (missing.length > 0) {
    console.error(
      `Missing required environment variables: ${missing.join(', ')}\n` +
      'Please check your .env file and ensure all required variables are set.'
    );
    throw new Error('Missing required environment variables');
  }
}