import { describe, expect, it } from 'vitest';

const loadModule = async () => import('./chatbot-config');

describe('chatbot-config', () => {
  it('returns supported business types when provided', async () => {
    const { SUPPORTED_BUSINESS_TYPES, resolveChatbotBusinessType } = await loadModule();

    SUPPORTED_BUSINESS_TYPES.forEach((type) => {
      expect(resolveChatbotBusinessType(type)).toBe(type);
    });
  });

  it('falls back to the default type for unsupported values', async () => {
    const { DEFAULT_BUSINESS_TYPE, resolveChatbotBusinessType } = await loadModule();

    expect(resolveChatbotBusinessType('unknown')).toBe(DEFAULT_BUSINESS_TYPE);
  });

  it('uses the environment configuration when no value is provided', async () => {
    const { resolveChatbotBusinessType } = await loadModule();

    expect(resolveChatbotBusinessType(undefined, 'saas')).toBe('saas');
  });
});
