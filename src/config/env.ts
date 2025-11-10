/**
 * Environment configuration
 * All environment variables should be accessed through this file
 */

type BuildMyBotMetaEnv = ImportMetaEnv & Record<string, string | boolean | undefined>;

export const createEnv = (metaEnv: BuildMyBotMetaEnv = import.meta.env) => {
  const supabaseUrl = (typeof metaEnv?.VITE_SUPABASE_URL === 'string' ? metaEnv.VITE_SUPABASE_URL.trim() : '') || '';
  const supabaseAnonKey = (typeof metaEnv?.VITE_SUPABASE_PUBLISHABLE_KEY === 'string' 
    ? metaEnv.VITE_SUPABASE_PUBLISHABLE_KEY.trim() 
    : typeof metaEnv?.VITE_SUPABASE_ANON_KEY === 'string'
    ? metaEnv.VITE_SUPABASE_ANON_KEY.trim()
    : '') || '';

  return {
    // Supabase Configuration
    supabaseUrl,
    supabaseAnonKey,
    supabaseKeySource: 'publishable' as const,

    // API Configuration
    apiBaseUrl: (typeof metaEnv?.VITE_API_BASE_URL === 'string' ? metaEnv.VITE_API_BASE_URL : '') || 'http://localhost:3000/api',
    apiTimeout: 30000,

    // Feature Flags
    enableAnalytics: metaEnv?.VITE_ENABLE_ANALYTICS === 'true',
    enableChatWidget: metaEnv?.VITE_ENABLE_CHAT_WIDGET === 'true',
    enableAIChatbot: metaEnv?.VITE_ENABLE_AI_CHATBOT === 'true',
    businessType: (typeof metaEnv?.VITE_BUSINESS_TYPE === 'string' ? metaEnv.VITE_BUSINESS_TYPE : '') || 'support',

    // External Services
    stripePublicKey: (typeof metaEnv?.VITE_STRIPE_PUBLIC_KEY === 'string' ? metaEnv.VITE_STRIPE_PUBLIC_KEY : '') || '',
    googleAnalyticsId: (typeof metaEnv?.VITE_GOOGLE_ANALYTICS_ID === 'string' ? metaEnv.VITE_GOOGLE_ANALYTICS_ID : '') || '',

    // Environment
    appEnv: (typeof metaEnv?.VITE_APP_ENV === 'string' ? metaEnv.VITE_APP_ENV : '') || 'development',
    isDevelopment: metaEnv?.DEV === true,
    isProduction: metaEnv?.PROD === true,
  } as const;
};

export type EnvConfig = ReturnType<typeof createEnv>;

export const env: EnvConfig = createEnv();

export function validateEnv(config: EnvConfig = env) {
  // Just log warnings, don't throw to prevent blank screens
  if (!config.supabaseUrl || !config.supabaseAnonKey) {
    console.warn('Supabase configuration missing - some features may not work');
  }
}