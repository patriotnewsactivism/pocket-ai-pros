import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

describe('supabase configuration', () => {
  const setupEnvMock = (overrides: Partial<Record<string, unknown>>) => {
    vi.doMock('@/config/env', () => ({
      env: {
        supabaseUrl: '',
        supabaseAnonKey: '',
        isDevelopment: true,
        ...overrides,
      },
    }));
  };

  beforeEach(() => {
    vi.resetModules();
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.restoreAllMocks();
  });

  it('creates a Supabase client when credentials are provided', async () => {
    const mockClient = { from: vi.fn(), auth: {}, functions: {} } as const;
    const mockCreateClient = vi.fn(() => mockClient);

    vi.doMock('@supabase/supabase-js', () => ({
      createClient: mockCreateClient,
    }));

    setupEnvMock({
      supabaseUrl: 'https://example.supabase.co',
      supabaseAnonKey: 'anon-key',
    });

    const module = await import('./supabase');

    expect(module.isSupabaseConfigured).toBe(true);
    expect(mockCreateClient).toHaveBeenCalledWith('https://example.supabase.co', 'anon-key', {
      auth: { persistSession: true, autoRefreshToken: true },
    });
    expect(() => module.supabase.from('test')).not.toThrow();
  });

  it('returns a disabled client when credentials are missing', async () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const mockCreateClient = vi.fn();

    vi.doMock('@supabase/supabase-js', () => ({
      createClient: mockCreateClient,
    }));

    setupEnvMock({ supabaseUrl: '', supabaseAnonKey: '' });

    const module = await import('./supabase');

    expect(module.isSupabaseConfigured).toBe(false);
    expect(mockCreateClient).not.toHaveBeenCalled();
    expect(() => module.supabase.from('test')).toThrowError(/Supabase client is not configured/);
    expect(warnSpy).toHaveBeenCalledWith('[supabase] Supabase credentials are missing. Database features are disabled.');
  });
});
