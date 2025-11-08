/**
 * Live Chat Widget Integration
 * Supports multiple providers: Tawk.to (free), Intercom, Crisp
 */

import { useEffect } from 'react';
import { env } from '@/config/env';

type TawkConfig = {
  propertyId: string;
  widgetId: string;
};

type IntercomConfig = {
  appId: string;
};

type CrispConfig = {
  websiteId: string;
};

type TawkApi = {
  showWidget?: () => void;
  hideWidget?: () => void;
  maximize?: () => void;
  setAttributes?: (attributes: { name: string; email: string }) => void;
};

type CrispCommand = [string, ...unknown[]];

type CrispQueue = Array<CrispCommand> & {
  push: (...items: CrispCommand[]) => number;
};

type LiveChatWindow = Window & {
  Tawk_API?: TawkApi;
  Intercom?: (command: string, ...args: unknown[]) => void;
  intercomSettings?: {
    app_id: string;
    alignment?: string;
    horizontal_padding?: number;
    vertical_padding?: number;
  };
  $crisp?: CrispQueue;
  CRISP_WEBSITE_ID?: string;
};

const hasTawkValues = Boolean(env.tawkPropertyId || env.tawkWidgetId);

const tawkConfig: TawkConfig | null =
  env.tawkPropertyId && env.tawkWidgetId
    ? {
        propertyId: env.tawkPropertyId,
        widgetId: env.tawkWidgetId,
      }
    : null;

const intercomConfig: IntercomConfig | null = env.intercomAppId
  ? {
      appId: env.intercomAppId,
    }
  : null;

const crispConfig: CrispConfig | null = env.crispWebsiteId
  ? {
      websiteId: env.crispWebsiteId,
    }
  : null;

const isTawkActive = Boolean(tawkConfig);
const isIntercomActive = !isTawkActive && Boolean(intercomConfig);
const isCrispActive = !isTawkActive && !isIntercomActive && Boolean(crispConfig);
const hasConfiguredProvider = isTawkActive || isIntercomActive || isCrispActive;

const getLiveChatWindow = (): LiveChatWindow => window as LiveChatWindow;

type Cleanup = () => void;

const mountTawkWidget = (config: TawkConfig): Cleanup => {
  const script = document.createElement('script');
  script.type = 'text/javascript';
  script.async = true;
  script.src = `https://embed.tawk.to/${config.propertyId}/${config.widgetId}`;
  script.charset = 'UTF-8';
  script.setAttribute('crossorigin', '*');
  script.dataset.chatProvider = 'tawk';
  document.body.appendChild(script);

  return () => {
    script.remove();
  };
};

const mountIntercomWidget = (config: IntercomConfig): Cleanup => {
  const chatWindow = getLiveChatWindow();
  chatWindow.intercomSettings = {
    app_id: config.appId,
    alignment: 'right',
    horizontal_padding: 20,
    vertical_padding: 20,
  };

  const script = document.createElement('script');
  script.type = 'text/javascript';
  script.async = true;
  script.src = `https://widget.intercom.io/widget/${config.appId}`;
  script.dataset.chatProvider = 'intercom';
  document.body.appendChild(script);

  return () => {
    script.remove();
    delete chatWindow.intercomSettings;
  };
};

const mountCrispWidget = (config: CrispConfig): Cleanup => {
  const chatWindow = getLiveChatWindow();
  const crispQueue: CrispQueue = (chatWindow.$crisp ?? []) as CrispQueue;
  chatWindow.$crisp = crispQueue;
  chatWindow.CRISP_WEBSITE_ID = config.websiteId;

  const script = document.createElement('script');
  script.type = 'text/javascript';
  script.async = true;
  script.src = 'https://client.crisp.chat/l.js';
  script.dataset.chatProvider = 'crisp';
  document.body.appendChild(script);

  return () => {
    script.remove();
    if (chatWindow.$crisp === crispQueue) {
      delete chatWindow.$crisp;
    }
    if (chatWindow.CRISP_WEBSITE_ID === config.websiteId) {
      delete chatWindow.CRISP_WEBSITE_ID;
    }
  };
};

const ensureProviderConfigured = () => {
  if (!env.enableChatWidget) {
    console.warn('LiveChat: Chat widget is disabled.');
    return false;
  }

  if (!hasConfiguredProvider) {
    console.warn('LiveChat: No chat provider is configured.');
    return false;
  }

  return true;
};

export function LiveChat() {
  useEffect(() => {
    if (!env.enableChatWidget) {
      return;
    }

    if (isTawkActive && tawkConfig) {
      return mountTawkWidget(tawkConfig);
    }

    if (isIntercomActive && intercomConfig) {
      return mountIntercomWidget(intercomConfig);
    }

    if (isCrispActive && crispConfig) {
      return mountCrispWidget(crispConfig);
    }

    if (hasTawkValues) {
      console.warn(
        'LiveChat: Both VITE_TAWK_PROPERTY_ID and VITE_TAWK_WIDGET_ID must be set to enable Tawk.to.'
      );
    } else {
      console.warn('LiveChat: Chat widget enabled but no provider configuration found.');
    }

    return undefined;
  }, []);

  return null;
}

const showTawkWidget = () => {
  const chatWindow = getLiveChatWindow();
  chatWindow.Tawk_API?.showWidget?.();
};

const hideTawkWidget = () => {
  const chatWindow = getLiveChatWindow();
  chatWindow.Tawk_API?.hideWidget?.();
};

const openTawkWidget = () => {
  const chatWindow = getLiveChatWindow();
  chatWindow.Tawk_API?.maximize?.();
};

const updateTawkUser = (name: string, email: string) => {
  const chatWindow = getLiveChatWindow();
  chatWindow.Tawk_API?.setAttributes?.({
    name,
    email,
  });
};

const showIntercomWidget = () => {
  const chatWindow = getLiveChatWindow();
  chatWindow.Intercom?.('show');
};

const hideIntercomWidget = () => {
  const chatWindow = getLiveChatWindow();
  chatWindow.Intercom?.('hide');
};

const openIntercomWidget = () => {
  const chatWindow = getLiveChatWindow();
  chatWindow.Intercom?.('show');
};

const updateIntercomUser = (name: string, email: string) => {
  const chatWindow = getLiveChatWindow();
  chatWindow.Intercom?.('update', {
    name,
    email,
  });
};

const pushCrispCommand = (command: CrispCommand) => {
  const chatWindow = getLiveChatWindow();
  chatWindow.$crisp?.push(command);
};

export const chat = {
  show: () => {
    if (!ensureProviderConfigured()) {
      return;
    }

    if (isTawkActive) {
      showTawkWidget();
      return;
    }

    if (isIntercomActive) {
      showIntercomWidget();
      return;
    }

    if (isCrispActive) {
      pushCrispCommand(['do', 'chat:show']);
    }
  },

  hide: () => {
    if (!ensureProviderConfigured()) {
      return;
    }

    if (isTawkActive) {
      hideTawkWidget();
      return;
    }

    if (isIntercomActive) {
      hideIntercomWidget();
      return;
    }

    if (isCrispActive) {
      pushCrispCommand(['do', 'chat:hide']);
    }
  },

  open: () => {
    if (!ensureProviderConfigured()) {
      return;
    }

    if (isTawkActive) {
      openTawkWidget();
      return;
    }

    if (isIntercomActive) {
      openIntercomWidget();
      return;
    }

    if (isCrispActive) {
      pushCrispCommand(['do', 'chat:open']);
    }
  },

  setUser: (name: string, email: string) => {
    if (!ensureProviderConfigured()) {
      return;
    }

    if (isTawkActive) {
      updateTawkUser(name, email);
      return;
    }

    if (isIntercomActive) {
      updateIntercomUser(name, email);
      return;
    }

    if (isCrispActive) {
      pushCrispCommand(['set', 'user:email', [email]]);
      pushCrispCommand(['set', 'user:nickname', [name]]);
    }
  },

  sendMessage: (message: string) => {
    if (!ensureProviderConfigured()) {
      return;
    }

    if (isIntercomActive) {
      const chatWindow = getLiveChatWindow();
      chatWindow.Intercom?.('showNewMessage', message);
      return;
    }

    if (isCrispActive) {
      pushCrispCommand(['do', 'message:send', ['text', message]]);
    }
  },
};
