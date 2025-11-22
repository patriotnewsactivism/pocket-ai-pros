/**
 * Environment configuration
 * All environment variables should be accessed through this file
 */

export type EnvConfig = {
  // Supabase Configuration
  supabaseUrl: string;
  supabaseAnonKey: string;
  supabaseKeySource: string;

  // API Configuration
  apiBaseUrl: string;
  apiTimeout: number;

  // Feature Flags
  enableAnalytics: boolean;
  enableChatWidget: boolean;
  enableAIChatbot: boolean;
  businessType: string;

  // External Services
  stripePublicKey: string;
  googleAnalyticsId: string;

  // Environment
  appEnv: string;
  isDevelopment: boolean;
  isProduction: boolean;
};

const getFirstValue = (
  entries: Array<{ key: string; value: unknown }>,
): { value: string; source: string } => {
  for (const { key, value } of entries) {
    if (typeof value === "string" && value.trim() !== "") {
      return { value: value.trim(), source: key };
    }
  }
  return { value: "", source: "unknown" };
};

export const createEnv = (metaEnv: ImportMetaEnv): EnvConfig => {
  const processEnv = typeof process !== "undefined" ? process.env : {};

  const { value: supabaseUrl } = getFirstValue([
    { key: "VITE_SUPABASE_URL", value: metaEnv.VITE_SUPABASE_URL },
    { key: "NEXT_PUBLIC_SUPABASE_URL", value: (metaEnv as any).NEXT_PUBLIC_SUPABASE_URL },
    { key: "PUBLIC_SUPABASE_URL", value: (metaEnv as any).PUBLIC_SUPABASE_URL },
    { key: "SUPABASE_URL", value: processEnv?.SUPABASE_URL },
  ]);

  const { value: supabaseAnonKey, source: supabaseKeySource } = getFirstValue([
    { key: "VITE_SUPABASE_ANON_KEY", value: metaEnv.VITE_SUPABASE_ANON_KEY },
    { key: "VITE_SUPABASE_PUBLISHABLE_KEY", value: (metaEnv as any).VITE_SUPABASE_PUBLISHABLE_KEY },
    { key: "NEXT_PUBLIC_SUPABASE_ANON_KEY", value: (metaEnv as any).NEXT_PUBLIC_SUPABASE_ANON_KEY },
    { key: "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", value: (metaEnv as any).NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY },
    { key: "NEXT_PUBLIC_SUPABASE_KEY", value: (metaEnv as any).NEXT_PUBLIC_SUPABASE_KEY },
    { key: "PUBLIC_SUPABASE_ANON_KEY", value: (metaEnv as any).PUBLIC_SUPABASE_ANON_KEY },
    { key: "PUBLIC_SUPABASE_KEY", value: (metaEnv as any).PUBLIC_SUPABASE_KEY },
    { key: "SUPABASE_ANON_KEY", value: processEnv?.SUPABASE_ANON_KEY },
    { key: "SUPABASE_PUBLIC_ANON_KEY", value: processEnv?.SUPABASE_PUBLIC_ANON_KEY },
  ]);

  const normalizeBool = (value: unknown) => String(value).trim() === "true";
  const normalizeNumber = (value: unknown, fallback: number) => {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
  };

  return {
    supabaseUrl,
    supabaseAnonKey,
    supabaseKeySource,
    apiBaseUrl: (metaEnv as any).VITE_API_BASE_URL || processEnv?.VITE_API_BASE_URL || "http://localhost:3000/api",
    apiTimeout: normalizeNumber((metaEnv as any).VITE_API_TIMEOUT || processEnv?.VITE_API_TIMEOUT, 30000),
    enableAnalytics: normalizeBool((metaEnv as any).VITE_ENABLE_ANALYTICS || processEnv?.VITE_ENABLE_ANALYTICS),
    enableChatWidget: normalizeBool((metaEnv as any).VITE_ENABLE_CHAT_WIDGET || processEnv?.VITE_ENABLE_CHAT_WIDGET),
    enableAIChatbot: normalizeBool((metaEnv as any).VITE_ENABLE_AI_CHATBOT || processEnv?.VITE_ENABLE_AI_CHATBOT),
    businessType: (metaEnv as any).VITE_BUSINESS_TYPE || processEnv?.VITE_BUSINESS_TYPE || "support",
    stripePublicKey: (metaEnv as any).VITE_STRIPE_PUBLIC_KEY || processEnv?.VITE_STRIPE_PUBLIC_KEY || "",
    googleAnalyticsId: (metaEnv as any).VITE_GOOGLE_ANALYTICS_ID || processEnv?.VITE_GOOGLE_ANALYTICS_ID || "",
    appEnv: (metaEnv as any).VITE_APP_ENV || processEnv?.VITE_APP_ENV || "development",
    isDevelopment: Boolean(metaEnv.DEV),
    isProduction: Boolean(metaEnv.PROD),
  };
};

export const env = createEnv(import.meta.env);

// Validate required environment variables
export function validateEnv(config: EnvConfig = env) {
  const required = {
    VITE_SUPABASE_URL: config.supabaseUrl,
    VITE_SUPABASE_ANON_KEY: config.supabaseAnonKey,
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
