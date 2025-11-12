import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import type { EnvConfig } from '@/config/env';

const createClientMock = vi.fn();

const createMockEnv = (overrides: Partial<EnvConfig> = {}): EnvConfig => ({
  supabaseUrl: 'https://example.supabase.co',
  supabaseAnonKey: 'anon-key',
  supabaseKeySource: 'publishable',
  apiBaseUrl: 'http://localhost:3000/api',
  apiTimeout: 30000,
  enableAnalytics: false,
  enableChatWidget: false,
  enableAIChatbot: false,
  businessType: 'support',
  stripePublicKey: '',
  googleAnalyticsId: '',
  appEnv: 'development',
  isDevelopment: true,
  isProduction: false,
  ...overrides,
});

const importClientModule = async (envOverrides: Partial<EnvConfig> = {}) => {
  vi.doMock('@supabase/supabase-js', () => ({
    createClient: createClientMock,
  }));

  vi.doMock('@/config/env', () => ({
    env: createMockEnv(envOverrides),
  }));

  return import('./client');
};

describe('supabase client configuration', () => {
  beforeEach(() => {
    vi.resetModules();
    createClientMock.mockReset();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('creates a configured supabase client when credentials are provided', async () => {
    const mockClient = { from: vi.fn() } as unknown;
    createClientMock.mockReturnValue(mockClient);

    const module = await importClientModule();

    expect(module.isSupabaseConfigured).toBe(true);
    expect(createClientMock).toHaveBeenCalledWith(
      'https://example.supabase.co',
      'anon-key',
      expect.objectContaining({
        auth: expect.objectContaining({
          storage: expect.any(Object),
          persistSession: true,
          autoRefreshToken: true,
        }),
      }),
    );
    expect(module.supabase).toBe(mockClient);
  });

  it('returns a disabled client and logs a warning when credentials are missing', async () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    const module = await importClientModule({ supabaseUrl: '', supabaseAnonKey: '' });

    expect(module.isSupabaseConfigured).toBe(false);
    expect(createClientMock).not.toHaveBeenCalled();
    expect(() => (module.supabase as any).from('test')).toThrowError(
      /Supabase is not configured/,
    );
    expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('Supabase is not configured'));

    warnSpy.mockRestore();
  });
});
