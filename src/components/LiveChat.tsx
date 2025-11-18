/**
 * Live Chat Widget Integration
 * Supports multiple providers: Tawk.to (free), Intercom, Crisp
 */

import { useEffect } from 'react';
import { env } from '@/config/env';

// Configuration for different chat providers
const CHAT_CONFIG = {
  // Tawk.to (Free, recommended for small businesses)
  tawkTo: {
    enabled: true, // Set to true to enable
    propertyId: 'YOUR_TAWK_PROPERTY_ID', // Get from tawk.to
    widgetId: 'YOUR_TAWK_WIDGET_ID',
  },
  // Intercom (Premium, advanced features)
  intercom: {
    enabled: false,
    appId: 'YOUR_INTERCOM_APP_ID', // Get from intercom.com
  },
  // Crisp (Good middle ground)
  crisp: {
    enabled: false,
    websiteId: 'YOUR_CRISP_WEBSITE_ID', // Get from crisp.chat
  },
};

export function LiveChat() {
  useEffect(() => {
    if (!env.enableChatWidget) {
      return;
    }

    // Tawk.to Integration (Free)
    if (CHAT_CONFIG.tawkTo.enabled) {
      // Validate that real IDs are configured (not placeholders)
      const isPlaceholder =
        CHAT_CONFIG.tawkTo.propertyId.includes('YOUR_TAWK') ||
        CHAT_CONFIG.tawkTo.widgetId.includes('YOUR_TAWK') ||
        CHAT_CONFIG.tawkTo.propertyId === '' ||
        CHAT_CONFIG.tawkTo.widgetId === '';

      if (isPlaceholder) {
        console.warn('Tawk.to is enabled but credentials are not configured. Please set valid propertyId and widgetId in LiveChat.tsx');
        return;
      }

      const script = document.createElement('script');
      script.type = 'text/javascript';
      script.async = true;
      script.src = `https://embed.tawk.to/${CHAT_CONFIG.tawkTo.propertyId}/${CHAT_CONFIG.tawkTo.widgetId}`;
      script.charset = 'UTF-8';
      script.setAttribute('crossorigin', '*');
      document.body.appendChild(script);

      return () => {
        document.body.removeChild(script);
      };
    }

    // Intercom Integration (Premium)
    if (CHAT_CONFIG.intercom.enabled) {
      // Validate that real ID is configured (not placeholder)
      const isPlaceholder =
        CHAT_CONFIG.intercom.appId.includes('YOUR_INTERCOM') ||
        CHAT_CONFIG.intercom.appId === '';

      if (isPlaceholder) {
        console.warn('Intercom is enabled but appId is not configured. Please set valid appId in LiveChat.tsx');
        return;
      }

      const w = window as any;
      w.intercomSettings = {
        app_id: CHAT_CONFIG.intercom.appId,
        alignment: 'right',
        horizontal_padding: 20,
        vertical_padding: 20,
      };

      const script = document.createElement('script');
      script.type = 'text/javascript';
      script.async = true;
      script.src = `https://widget.intercom.io/widget/${CHAT_CONFIG.intercom.appId}`;
      document.body.appendChild(script);

      return () => {
        document.body.removeChild(script);
      };
    }

    // Crisp Integration (Mid-tier)
    if (CHAT_CONFIG.crisp.enabled) {
      // Validate that real ID is configured (not placeholder)
      const isPlaceholder =
        CHAT_CONFIG.crisp.websiteId.includes('YOUR_CRISP') ||
        CHAT_CONFIG.crisp.websiteId === '';

      if (isPlaceholder) {
        console.warn('Crisp is enabled but websiteId is not configured. Please set valid websiteId in LiveChat.tsx');
        return;
      }

      const w = window as any;
      w.$crisp = [];
      w.CRISP_WEBSITE_ID = CHAT_CONFIG.crisp.websiteId;

      const script = document.createElement('script');
      script.type = 'text/javascript';
      script.async = true;
      script.src = 'https://client.crisp.chat/l.js';
      document.body.appendChild(script);

      return () => {
        document.body.removeChild(script);
      };
    }
  }, []);

  return null;
}

// Helper functions to control chat widget
export const chat = {
  // Show/hide chat widget
  show: () => {
    if (CHAT_CONFIG.tawkTo.enabled) {
      (window as any).Tawk_API?.showWidget();
    }
    if (CHAT_CONFIG.intercom.enabled) {
      (window as any).Intercom?.('show');
    }
    if (CHAT_CONFIG.crisp.enabled) {
      (window as any).$crisp?.push(['do', 'chat:show']);
    }
  },

  hide: () => {
    if (CHAT_CONFIG.tawkTo.enabled) {
      (window as any).Tawk_API?.hideWidget();
    }
    if (CHAT_CONFIG.intercom.enabled) {
      (window as any).Intercom?.('hide');
    }
    if (CHAT_CONFIG.crisp.enabled) {
      (window as any).$crisp?.push(['do', 'chat:hide']);
    }
  },

  // Open chat window
  open: () => {
    if (CHAT_CONFIG.tawkTo.enabled) {
      (window as any).Tawk_API?.maximize();
    }
    if (CHAT_CONFIG.intercom.enabled) {
      (window as any).Intercom?.('show');
    }
    if (CHAT_CONFIG.crisp.enabled) {
      (window as any).$crisp?.push(['do', 'chat:open']);
    }
  },

  // Set user information
  setUser: (name: string, email: string) => {
    if (CHAT_CONFIG.tawkTo.enabled) {
      (window as any).Tawk_API?.setAttributes({
        name,
        email,
      });
    }
    if (CHAT_CONFIG.intercom.enabled) {
      (window as any).Intercom?.('update', {
        name,
        email,
      });
    }
    if (CHAT_CONFIG.crisp.enabled) {
      (window as any).$crisp?.push(['set', 'user:email', [email]]);
      (window as any).$crisp?.push(['set', 'user:nickname', [name]]);
    }
  },

  // Send a message programmatically
  sendMessage: (message: string) => {
    if (CHAT_CONFIG.intercom.enabled) {
      (window as any).Intercom?.('showNewMessage', message);
    }
    if (CHAT_CONFIG.crisp.enabled) {
      (window as any).$crisp?.push(['do', 'message:send', ['text', message]]);
    }
  },
};
