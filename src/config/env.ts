/**
 * Environment configuration
 * All environment variables should be accessed through this file
 */

type BooleanLike = boolean | 'true' | 'false' | undefined;

type BuildMyBotMetaEnv = ImportMetaEnv & Record<string, string | boolean | undefined>;

<<<<<<< HEAD
const parseBoolean = (value: unknown): boolean =>
  value === true || (typeof value === 'string' && value.toLowerCase() === 'true');

const parseNumber = (value: unknown, fallback: number): number => {
  const numeric = typeof value === 'string' || typeof value === 'number' ? Number(value) : NaN;
  return Number.isFinite(numeric) ? numeric : fallback;
};

const normalizeBooleanFlag = (value: BooleanLike): boolean | undefined => {
  if (typeof value === 'boolean') {
    return value;
  }

  if (typeof value === 'string') {
    const normalized = value.toLowerCase();
    if (normalized === 'true') return true;
    if (normalized === 'false') return false;
  }

  return undefined;
};

const getString = (value: unknown): string => (typeof value === 'string' ? value : '');

export const createEnv = (metaEnv: BuildMyBotMetaEnv = import.meta.env) => {
  const devFlag = normalizeBooleanFlag(metaEnv?.DEV as BooleanLike);
  const prodFlag = normalizeBooleanFlag(metaEnv?.PROD as BooleanLike);
  const mode = getString(metaEnv?.MODE);

  const isDevelopment = devFlag ?? mode === 'development';
  const isProduction = prodFlag ?? mode === 'production';

  return {
    // Supabase Configuration
    supabaseUrl: getString(metaEnv?.VITE_SUPABASE_URL) || '',
    supabaseAnonKey: getString(metaEnv?.VITE_SUPABASE_ANON_KEY) || '',

    // API Configuration
    apiBaseUrl: getString(metaEnv?.VITE_API_BASE_URL) || 'http://localhost:3000/api',
    apiTimeout: parseNumber(metaEnv?.VITE_API_TIMEOUT, 30000),

    // Feature Flags
    enableAnalytics: parseBoolean(metaEnv?.VITE_ENABLE_ANALYTICS),
    enableChatWidget: parseBoolean(metaEnv?.VITE_ENABLE_CHAT_WIDGET),
    enableAIChatbot: parseBoolean(metaEnv?.VITE_ENABLE_AI_CHATBOT),
    businessType: getString(metaEnv?.VITE_BUSINESS_TYPE) || 'support',

    // External Services
    stripePublicKey: getString(metaEnv?.VITE_STRIPE_PUBLIC_KEY) || '',
    googleAnalyticsId: getString(metaEnv?.VITE_GOOGLE_ANALYTICS_ID) || '',
    // Note: OpenAI API key removed - now handled securely via edge function

    // Environment
    appEnv: getString(metaEnv?.VITE_APP_ENV) || 'development',
    isDevelopment,
    isProduction,
  } as const;
};

export type EnvConfig = ReturnType<typeof createEnv>;

export const env: EnvConfig = createEnv();

// Validate required environment variables
export function validateEnv(config: EnvConfig = env) {
  const required = {
    VITE_SUPABASE_URL: config.supabaseUrl,
    VITE_SUPABASE_ANON_KEY: config.supabaseAnonKey,
  } as const;

  const missing = Object.entries(required)
    .filter(([, value]) => !value)
    .map(([key]) => key);

  if (missing.length === 0) {
    return;
  }

  const message =
    `Missing required environment variables: ${missing.join(', ')}\n` +
    'Please check your .env file and ensure all required variables are set.';

  if (config.isDevelopment) {
    console.warn(
      `${message}\nSupabase-powered features will be disabled in development until the keys are provided.`
    );
    return;
  }

  console.error(message);
  throw new Error('Missing required environment variables');
}
