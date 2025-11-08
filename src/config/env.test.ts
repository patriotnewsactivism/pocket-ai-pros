import { afterEach, describe, expect, it, vi } from 'vitest';
import { createEnv, validateEnv } from './env';

type MetaEnv = Parameters<typeof createEnv>[0];

const buildMetaEnv = (overrides: Record<string, string | boolean> = {}): MetaEnv =>
  ({
    MODE: 'test',
    DEV: false,
    PROD: false,
    ...overrides,
  } as MetaEnv);

afterEach(() => {
  vi.restoreAllMocks();
});

describe('validateEnv', () => {
  it('does not throw when Supabase configuration is complete', () => {
    const envConfig = createEnv(
      buildMetaEnv({
        VITE_SUPABASE_URL: 'https://example.supabase.co',
        VITE_SUPABASE_ANON_KEY: 'anon-key',
      })
    );

    expect(() => validateEnv(envConfig)).not.toThrow();
  });

  it('warns instead of throwing when Supabase keys are missing in development', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const envConfig = createEnv(
      buildMetaEnv({
        DEV: true,
        MODE: 'development',
      })
    );

    expect(() => validateEnv(envConfig)).not.toThrow();
    expect(warnSpy).toHaveBeenCalled();
    expect(warnSpy.mock.calls[0][0]).toContain('Missing required environment variables');
  });

  it('throws when Supabase keys are missing outside of development', () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const envConfig = createEnv(
      buildMetaEnv({
        PROD: true,
        MODE: 'production',
      })
    );

    expect(() => validateEnv(envConfig)).toThrowError('Missing required environment variables');
    expect(errorSpy).toHaveBeenCalled();
    expect(errorSpy.mock.calls[0][0]).toContain('Missing required environment variables');
  });
});
