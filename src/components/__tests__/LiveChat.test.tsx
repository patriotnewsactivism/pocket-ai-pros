import { cleanup, render, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

type MockEnv = {
  supabaseUrl: string;
  supabaseAnonKey: string;
  apiBaseUrl: string;
  apiTimeout: number;
  enableAnalytics: boolean;
  enableChatWidget: boolean;
  enableAIChatbot: boolean;
  businessType: string;
  stripePublicKey: string;
  googleAnalyticsId: string;
  openaiApiKey: string;
  tawkPropertyId: string;
  tawkWidgetId: string;
  intercomAppId: string;
  crispWebsiteId: string;
  appEnv: string;
  isDevelopment: boolean;
  isProduction: boolean;
};

const baseEnv: MockEnv = {
  supabaseUrl: '',
  supabaseAnonKey: '',
  apiBaseUrl: 'http://localhost:3000/api',
  apiTimeout: 30000,
  enableAnalytics: false,
  enableChatWidget: true,
  enableAIChatbot: false,
  businessType: 'support',
  stripePublicKey: '',
  googleAnalyticsId: '',
  openaiApiKey: '',
  tawkPropertyId: '',
  tawkWidgetId: '',
  intercomAppId: '',
  crispWebsiteId: '',
  appEnv: 'test',
  isDevelopment: false,
  isProduction: false,
};

type LiveChatModule = typeof import('../LiveChat');

type ScriptSpy = {
  scripts: HTMLScriptElement[];
  restore: () => void;
};

const mockLiveChatModule = async (overrides: Partial<MockEnv> = {}) => {
  vi.resetModules();
  const envMock = { ...baseEnv, ...overrides };

  vi.doMock('@/config/env', () => ({
    env: envMock,
  }));

  const module: LiveChatModule = await import('../LiveChat');
  return module;
};

const mockCreateElement = (): ScriptSpy => {
  const scripts: HTMLScriptElement[] = [];
  const original = document.createElement.bind(document);

  const spy = vi
    .spyOn(document, 'createElement')
    .mockImplementation((tagName: string) => {
      const element = original(tagName);
      if (tagName === 'script') {
        scripts.push(element as HTMLScriptElement);
      }
      return element;
    });

  return {
    scripts,
    restore: () => spy.mockRestore(),
  };
};

describe('LiveChat', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
    vi.doUnmock('@/config/env');
    document.body.innerHTML = '';
  });

  it('mounts the Tawk.to widget when property and widget IDs are provided', async () => {
    const { scripts, restore } = mockCreateElement();
    const { LiveChat } = await mockLiveChatModule({
      tawkPropertyId: 'property-id',
      tawkWidgetId: 'widget-id',
      intercomAppId: '',
      crispWebsiteId: '',
    });

    const { unmount } = render(<LiveChat />);

    await waitFor(() => {
      expect(scripts[0]).toBeDefined();
      expect(scripts[0]?.src).toContain('https://embed.tawk.to/property-id/widget-id');
    });

    expect(document.body.contains(scripts[0]!)).toBe(true);

    unmount();

    await waitFor(() => {
      expect(document.body.contains(scripts[0]!)).toBe(false);
    });

    restore();
  });

  it('mounts the Intercom widget when the app ID is provided', async () => {
    const { scripts, restore } = mockCreateElement();
    const { LiveChat } = await mockLiveChatModule({
      intercomAppId: 'intercom-app-id',
      tawkPropertyId: '',
      tawkWidgetId: '',
      crispWebsiteId: '',
    });

    const { unmount } = render(<LiveChat />);

    await waitFor(() => {
      expect(scripts[0]).toBeDefined();
      expect(scripts[0]?.src).toContain('https://widget.intercom.io/widget/intercom-app-id');
    });

    const intercomWindow = window as Window & {
      intercomSettings?: { app_id: string };
    };

    expect(intercomWindow.intercomSettings?.app_id).toBe('intercom-app-id');

    unmount();

    await waitFor(() => {
      expect(document.body.contains(scripts[0]!)).toBe(false);
    });

    restore();
  });

  it('mounts the Crisp widget when the website ID is provided', async () => {
    const { scripts, restore } = mockCreateElement();
    const { LiveChat } = await mockLiveChatModule({
      crispWebsiteId: 'crisp-website-id',
      tawkPropertyId: '',
      tawkWidgetId: '',
      intercomAppId: '',
    });

    const { unmount } = render(<LiveChat />);

    await waitFor(() => {
      expect(scripts[0]).toBeDefined();
      expect(scripts[0]?.src).toBe('https://client.crisp.chat/l.js');
    });

    const crispWindow = window as Window & {
      CRISP_WEBSITE_ID?: string;
    };

    expect(crispWindow.CRISP_WEBSITE_ID).toBe('crisp-website-id');

    unmount();

    await waitFor(() => {
      expect(document.body.contains(scripts[0]!)).toBe(false);
    });

    restore();
  });
});
