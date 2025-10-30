/**
 * Environment configuration
 * All environment variables should be accessed through this file
 */

export const env = {
  // API Configuration
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api',
  apiTimeout: Number(import.meta.env.VITE_API_TIMEOUT) || 30000,

  // Feature Flags
  enableAnalytics: import.meta.env.VITE_ENABLE_ANALYTICS === 'true',
  enableChatWidget: import.meta.env.VITE_ENABLE_CHAT_WIDGET === 'true',

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
    VITE_API_BASE_URL: env.apiBaseUrl,
  };

  const missing = Object.entries(required)
    .filter(([_, value]) => !value)
    .map(([key]) => key);

  if (missing.length > 0) {
    console.warn(
      `Missing optional environment variables: ${missing.join(', ')}\n` +
      'The app will use default values.'
    );
  }
}
