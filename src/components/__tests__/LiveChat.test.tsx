import { render, waitFor } from '@testing-library/react';
import type { EnvConfig } from '@/config/env';
import { describe, expect, beforeEach, it, vi } from 'vitest';

const baseEnv: EnvConfig = {
  supabaseUrl: '',
  supabaseAnonKey: '',
  apiBaseUrl: 'http://localhost:3000/api',
  apiTimeout: 30000,
  enableAnalytics: false,
  enableChatWidget: true,
  enableAIChatbot: false,
  businessType: 'support',
  chatProviders: {
    tawkTo: {
      propertyId: '',
      widgetId: '',
    },
    intercom: {
      appId: '',
    },
    crisp: {
      websiteId: '',
    },
  },
  stripePublicKey: '',
  googleAnalyticsId: '',
  openaiApiKey: '',
  appEnv: 'test',
  isDevelopment: true,
  isProduction: false,
};

type ChatProviderOverrides = Partial<Omit<EnvConfig, 'chatProviders'>> & {
  chatProviders?: {
    tawkTo?: Partial<EnvConfig['chatProviders']['tawkTo']>;
    intercom?: Partial<EnvConfig['chatProviders']['intercom']>;
    crisp?: Partial<EnvConfig['chatProviders']['crisp']>;
  };
};

function mockEnv(overrides: ChatProviderOverrides) {
  const envConfig: EnvConfig = {
    ...baseEnv,
    ...overrides,
    chatProviders: {
      tawkTo: {
        ...baseEnv.chatProviders.tawkTo,
        ...(overrides.chatProviders?.tawkTo ?? {}),
      },
      intercom: {
        ...baseEnv.chatProviders.intercom,
        ...(overrides.chatProviders?.intercom ?? {}),
      },
      crisp: {
        ...baseEnv.chatProviders.crisp,
        ...(overrides.chatProviders?.crisp ?? {}),
      },
    },
  };

  vi.doMock('@/config/env', () => ({ env: envConfig }));
}

describe('LiveChat', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.restoreAllMocks();
    document.body.innerHTML = '';
  });

  it('initializes the Tawk.to integration when credentials are provided', async () => {
    mockEnv({
      chatProviders: {
        tawkTo: {
          propertyId: 'prop-id',
          widgetId: 'widget-id',
        },
      },
    });

    const appendSpy = vi.spyOn(document.body, 'appendChild');
    const removeSpy = vi.spyOn(document.body, 'removeChild');
    const originalCreateElement = document.createElement.bind(document);
    const createdScripts: HTMLScriptElement[] = [];

    const createElementSpy = vi
      .spyOn(document, 'createElement')
      .mockImplementation(((tagName: string) => {
        const element = originalCreateElement(tagName);
        if (tagName === 'script') {
          createdScripts.push(element as HTMLScriptElement);
        }
        return element;
      }) as typeof document.createElement);

    const { LiveChat } = await import('../LiveChat');
    const { unmount } = render(<LiveChat />);

    await waitFor(() => {
      expect(createdScripts).toHaveLength(1);
    });

    const scriptElement = createdScripts[0]!;
    expect(scriptElement.src).toContain('https://embed.tawk.to/prop-id/widget-id');
    expect(appendSpy.mock.calls.some(([node]) => node === scriptElement)).toBe(true);

    unmount();

    await waitFor(() => {
      expect(removeSpy.mock.calls.some(([node]) => node === scriptElement)).toBe(true);
    });
  });

  it('initializes the Intercom integration when an app ID is provided', async () => {
    mockEnv({
      chatProviders: {
        intercom: {
          appId: 'intercom-app',
        },
      },
    });

    const appendSpy = vi.spyOn(document.body, 'appendChild');
    const removeSpy = vi.spyOn(document.body, 'removeChild');
    const originalCreateElement = document.createElement.bind(document);
    const createdScripts: HTMLScriptElement[] = [];

    const createElementSpy = vi
      .spyOn(document, 'createElement')
      .mockImplementation(((tagName: string) => {
        const element = originalCreateElement(tagName);
        if (tagName === 'script') {
          createdScripts.push(element as HTMLScriptElement);
        }
        return element;
      }) as typeof document.createElement);

    const { LiveChat } = await import('../LiveChat');
    const { unmount } = render(<LiveChat />);

    await waitFor(() => {
      expect(createdScripts).toHaveLength(1);
    });

    const scriptElement = createdScripts[0]!;
    expect(scriptElement.src).toContain('https://widget.intercom.io/widget/intercom-app');
    expect(appendSpy.mock.calls.some(([node]) => node === scriptElement)).toBe(true);

    unmount();

    await waitFor(() => {
      expect(removeSpy.mock.calls.some(([node]) => node === scriptElement)).toBe(true);
    });
  });

  it('initializes the Crisp integration when a website ID is provided', async () => {
    mockEnv({
      chatProviders: {
        crisp: {
          websiteId: 'crisp-id',
        },
      },
    });

    const appendSpy = vi.spyOn(document.body, 'appendChild');
    const removeSpy = vi.spyOn(document.body, 'removeChild');
    const originalCreateElement = document.createElement.bind(document);
    const createdScripts: HTMLScriptElement[] = [];

    const createElementSpy = vi
      .spyOn(document, 'createElement')
      .mockImplementation(((tagName: string) => {
        const element = originalCreateElement(tagName);
        if (tagName === 'script') {
          createdScripts.push(element as HTMLScriptElement);
        }
        return element;
      }) as typeof document.createElement);

    const { LiveChat } = await import('../LiveChat');
    const { unmount } = render(<LiveChat />);

    await waitFor(() => {
      expect(createdScripts).toHaveLength(1);
    });

    const scriptElement = createdScripts[0]!;
    expect(scriptElement.src).toContain('https://client.crisp.chat/l.js');
    expect(appendSpy.mock.calls.some(([node]) => node === scriptElement)).toBe(true);

    unmount();

    await waitFor(() => {
      expect(removeSpy.mock.calls.some(([node]) => node === scriptElement)).toBe(true);
    });
  });
});
