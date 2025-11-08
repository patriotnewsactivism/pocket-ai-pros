import type { ChatActions, IntercomConfig } from '../types';

type IntercomWindow = Window & {
  Intercom?: (...args: unknown[]) => void;
  intercomSettings?: Record<string, unknown>;
};

export function loadIntercom(config: IntercomConfig): () => void {
  const w = window as IntercomWindow;
  w.intercomSettings = {
    app_id: config.appId,
    alignment: 'right',
    horizontal_padding: 20,
    vertical_padding: 20,
  } satisfies Record<string, unknown>;

  const script = document.createElement('script');
  script.type = 'text/javascript';
  script.async = true;
  script.src = `https://widget.intercom.io/widget/${config.appId}`;
  document.body.appendChild(script);

  return () => {
    if (script.parentNode) {
      script.parentNode.removeChild(script);
    }
  };
}

export const intercomActions: ChatActions = {
  show: () => {
    (window as IntercomWindow).Intercom?.('show');
  },
  hide: () => {
    (window as IntercomWindow).Intercom?.('hide');
  },
  open: () => {
    (window as IntercomWindow).Intercom?.('show');
  },
  setUser: (name, email) => {
    (window as IntercomWindow).Intercom?.('update', {
      name,
      email,
    });
  },
  sendMessage: (message: string) => {
    (window as IntercomWindow).Intercom?.('showNewMessage', message);
  },
};
