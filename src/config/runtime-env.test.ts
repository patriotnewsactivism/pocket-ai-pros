import { describe, expect, it, vi, beforeEach } from 'vitest';
import type { RuntimeEnv } from './runtime-env';
import { injectRuntimeEnv } from './runtime-env';

declare global {
  // eslint-disable-next-line no-var
  var window: Window;
}

describe('injectRuntimeEnv', () => {
  const baseConfig: RuntimeEnv = {
    VITE_SUPABASE_URL: 'https://example.supabase.co',
    VITE_SUPABASE_ANON_KEY: 'anon-key',
  };

  beforeEach(() => {
    vi.resetModules();
    vi.unstubAllEnvs();
    // Ensure a clean window for each test
    window.__ENV__ = undefined;
  });

  it('sets window.__ENV__ with the provided configuration', () => {
    const runtimeEnv = injectRuntimeEnv({
      supabaseUrl: baseConfig.VITE_SUPABASE_URL,
      supabaseAnonKey: baseConfig.VITE_SUPABASE_ANON_KEY,
      apiBaseUrl: '',
      apiTimeout: 30000,
      enableAnalytics: false,
      enableChatWidget: false,
      enableAIChatbot: false,
      businessType: 'support',
      stripePublicKey: '',
      googleAnalyticsId: '',
      appEnv: 'test',
      isDevelopment: true,
      isProduction: false,
    });

    expect(runtimeEnv).toEqual(baseConfig);
    expect(window.__ENV__).toEqual(baseConfig);
  });

  it('returns runtime env even when window is unavailable', () => {
    const originalWindow = globalThis.window;
    // @ts-expect-error intentionally removing window for the test
    delete (globalThis as { window?: Window }).window;

    const runtimeEnv = injectRuntimeEnv({
      supabaseUrl: baseConfig.VITE_SUPABASE_URL,
      supabaseAnonKey: baseConfig.VITE_SUPABASE_ANON_KEY,
      apiBaseUrl: '',
      apiTimeout: 30000,
      enableAnalytics: false,
      enableChatWidget: false,
      enableAIChatbot: false,
      businessType: 'support',
      stripePublicKey: '',
      googleAnalyticsId: '',
      appEnv: 'test',
      isDevelopment: false,
      isProduction: true,
    });

    expect(runtimeEnv).toEqual(baseConfig);
    // window is absent so it should not throw
    expect(() => runtimeEnv).not.toThrow();

    // Restore window for other tests
    globalThis.window = originalWindow;
  });
});
