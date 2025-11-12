/**
 * Environment configuration
 * All environment variables should be accessed through this file
 */

type BuildMyBotMetaEnv = ImportMetaEnv & Record<string, string | boolean | undefined>;

const SUPABASE_URL_KEYS = [
  'VITE_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_URL',
  'PUBLIC_SUPABASE_URL',
  'SUPABASE_URL',
] as const;

const SUPABASE_ANON_KEY_KEYS = [
  'VITE_SUPABASE_PUBLISHABLE_KEY',
  'VITE_SUPABASE_ANON_KEY',
  'NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'NEXT_PUBLIC_SUPABASE_KEY',
  'PUBLIC_SUPABASE_ANON_KEY',
  'PUBLIC_SUPABASE_KEY',
  'SUPABASE_ANON_KEY',
  'SUPABASE_PUBLIC_ANON_KEY',
] as const;

type EnvLookupResult = {
  value: string;
  source: string | null;
};

const readProcessEnv = (key: string): string => {
  if (typeof process !== 'undefined' && typeof process.env === 'object') {
    const raw = process.env[key];
    if (typeof raw === 'string') {
      return raw.trim();
    }
  }
  return '';
};

const getEnvValue = (metaEnv: BuildMyBotMetaEnv, keys: readonly string[]): EnvLookupResult => {
  for (const key of keys) {
    const metaValue = metaEnv?.[key];
    if (typeof metaValue === 'string' && metaValue.trim()) {
      return { value: metaValue.trim(), source: key };
    }

    const processValue = readProcessEnv(key);
    if (processValue) {
      return { value: processValue, source: key };
    }
  }

  return { value: '', source: null };
};

export const createEnv = (metaEnv: BuildMyBotMetaEnv = import.meta.env) => {
  const { value: supabaseUrl } = getEnvValue(metaEnv, SUPABASE_URL_KEYS);
  const { value: supabaseAnonKey, source: supabaseKeySource } = getEnvValue(metaEnv, SUPABASE_ANON_KEY_KEYS);

  return {
    // Supabase Configuration
    supabaseUrl,
    supabaseAnonKey,
    supabaseKeySource: supabaseKeySource ?? 'unknown',

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