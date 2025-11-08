/**
 * Live Chat Widget Integration
 * Supports multiple providers: Tawk.to (free), Intercom, Crisp
 */

import { useEffect } from 'react';
import { env } from '@/config/env';
import type {
  ChatActions,
  CrispConfig,
  IntercomConfig,
  TawkToConfig,
} from './live-chat/types';

type ProviderConfig =
  | { name: 'tawkTo'; config: TawkToConfig }
  | { name: 'intercom'; config: IntercomConfig }
  | { name: 'crisp'; config: CrispConfig };

interface ProviderResolution {
  activeProvider: ProviderConfig | null;
  warnings: string[];
}

let cachedActions: ChatActions | null = null;

function resolveProvider(): ProviderResolution {
  const warnings: string[] = [];
  const providers: ProviderConfig[] = [];
  const { chatProviders } = env;

  const hasTawkProperty = Boolean(chatProviders.tawkTo.propertyId);
  const hasTawkWidget = Boolean(chatProviders.tawkTo.widgetId);

  if (hasTawkProperty || hasTawkWidget) {
    if (hasTawkProperty && hasTawkWidget) {
      providers.push({
        name: 'tawkTo',
        config: {
          propertyId: chatProviders.tawkTo.propertyId,
          widgetId: chatProviders.tawkTo.widgetId,
        },
      });
    } else {
      warnings.push(
        'LiveChat: Tawk.to requires both VITE_TAWK_PROPERTY_ID and VITE_TAWK_WIDGET_ID. Skipping initialization.'
      );
    }
  }

  if (chatProviders.intercom.appId) {
    providers.push({
      name: 'intercom',
      config: {
        appId: chatProviders.intercom.appId,
      },
    });
  }

  if (chatProviders.crisp.websiteId) {
    providers.push({
      name: 'crisp',
      config: {
        websiteId: chatProviders.crisp.websiteId,
      },
    });
  }

  if (providers.length > 1) {
    warnings.push(
      `LiveChat: Multiple providers configured. Using ${providers[0]!.name} and skipping the others.`
    );
  }

  return {
    activeProvider: providers[0] ?? null,
    warnings,
  };
}

export function LiveChat() {
  useEffect(() => {
    if (!env.enableChatWidget) {
      return;
    }

    const { activeProvider, warnings } = resolveProvider();
    warnings.forEach((message) => console.warn(message));

    if (!activeProvider) {
      console.info('LiveChat: Chat widget enabled but no provider configuration was found.');
      return;
    }

    let disposed = false;
    let cleanup: (() => void) | undefined;

    (async () => {
      try {
        let actions: ChatActions | null = null;

        switch (activeProvider.name) {
          case 'tawkTo': {
            const { loadTawkTo, tawkActions } = await import('./live-chat/providers/tawkTo');
            cleanup = loadTawkTo(activeProvider.config);
            actions = tawkActions;
            break;
          }
          case 'intercom': {
            const { loadIntercom, intercomActions } = await import('./live-chat/providers/intercom');
            cleanup = loadIntercom(activeProvider.config);
            actions = intercomActions;
            break;
          }
          case 'crisp': {
            const { loadCrisp, crispActions } = await import('./live-chat/providers/crisp');
            cleanup = loadCrisp(activeProvider.config);
            actions = crispActions;
            break;
          }
          default:
            actions = null;
        }

        if (disposed) {
          cleanup?.();
          return;
        }

        if (actions) {
          cachedActions = actions;
        }
      } catch (error) {
        console.error('LiveChat: Failed to initialize chat provider.', error);
      }
    })();

    return () => {
      disposed = true;
      cachedActions = null;
      cleanup?.();
    };
  }, []);

  return null;
}

// Helper functions to control chat widget
export const chat = {
  // Show/hide chat widget
  show: () => {
    cachedActions?.show();
  },

  hide: () => {
    cachedActions?.hide();
  },

  // Open chat window
  open: () => {
    cachedActions?.open();
  },

  // Set user information
  setUser: (name: string, email: string) => {
    cachedActions?.setUser(name, email);
  },

  // Send a message programmatically
  sendMessage: (message: string) => {
    cachedActions?.sendMessage?.(message);
  },
};
