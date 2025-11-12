import { describe, expect, it, afterEach, beforeEach } from 'vitest';
import { createEnv, type EnvConfig } from './env';

type TestMetaEnv = Record<string, string | boolean | undefined>;

const baseMetaEnv: TestMetaEnv = {
  MODE: 'test',
  BASE_URL: '/',
  DEV: false,
  PROD: false,
};

const mergeMetaEnv = (overrides: TestMetaEnv): TestMetaEnv => ({
  ...baseMetaEnv,
  ...overrides,
});

const sanitizeConfig = (config: EnvConfig) => ({
  supabaseUrl: config.supabaseUrl,
  supabaseAnonKey: config.supabaseAnonKey,
  supabaseKeySource: config.supabaseKeySource,
});

describe('createEnv', () => {
  const originalProcessEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalProcessEnv };
  });

  afterEach(() => {
    process.env = originalProcessEnv;
  });

  it('prefers VITE_ variables when available', () => {
    const config = createEnv(
      mergeMetaEnv({
        VITE_SUPABASE_URL: ' https://example.supabase.co ',
        VITE_SUPABASE_ANON_KEY: ' anon-key ',
      }) as any,
    );

    expect(sanitizeConfig(config)).toEqual({
      supabaseUrl: 'https://example.supabase.co',
      supabaseAnonKey: 'anon-key',
      supabaseKeySource: 'VITE_SUPABASE_ANON_KEY',
    });
  });

  it('falls back to NEXT_PUBLIC variables when VITE variables are missing', () => {
    const config = createEnv(
      mergeMetaEnv({
        NEXT_PUBLIC_SUPABASE_URL: 'https://fallback.supabase.co',
        NEXT_PUBLIC_SUPABASE_ANON_KEY: 'fallback-anon',
      }) as any,
    );

    expect(sanitizeConfig(config)).toEqual({
      supabaseUrl: 'https://fallback.supabase.co',
      supabaseAnonKey: 'fallback-anon',
      supabaseKeySource: 'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    });
  });

  it('uses process.env values when runtime meta env is empty', () => {
    process.env.SUPABASE_URL = 'https://process.supabase.co';
    process.env.SUPABASE_ANON_KEY = 'process-anon';

    const config = createEnv(mergeMetaEnv({}) as any);

    expect(sanitizeConfig(config)).toEqual({
      supabaseUrl: 'https://process.supabase.co',
      supabaseAnonKey: 'process-anon',
      supabaseKeySource: 'SUPABASE_ANON_KEY',
    });
  });

  it('returns empty values when no configuration is present', () => {
    const config = createEnv(mergeMetaEnv({}) as any);

    expect(sanitizeConfig(config)).toEqual({
      supabaseUrl: '',
      supabaseAnonKey: '',
      supabaseKeySource: 'unknown',
    });
  });
});
