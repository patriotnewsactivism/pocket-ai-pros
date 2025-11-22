import { env } from './env';

export type RuntimeEnv = {
  VITE_SUPABASE_URL: string;
  VITE_SUPABASE_ANON_KEY: string;
};

declare global {
  interface Window {
    __ENV__?: RuntimeEnv;
  }
}

/**
 * Injects build-time environment variables onto window.__ENV__
 * so that runtime scripts can access the Supabase configuration
 * without relying on inline scripts that bypass Vite's bundling.
 */
export const injectRuntimeEnv = (config = env): RuntimeEnv => {
  const runtimeEnv: RuntimeEnv = {
    VITE_SUPABASE_URL: config.supabaseUrl,
    VITE_SUPABASE_ANON_KEY: config.supabaseAnonKey,
  };

  if (typeof window !== 'undefined') {
    window.__ENV__ = runtimeEnv;
  }

  return runtimeEnv;
};
