import type { ChatActions, TawkToConfig } from '../types';

type TawkWindow = Window & {
  Tawk_API?: {
    showWidget?: () => void;
    hideWidget?: () => void;
    maximize?: () => void;
    setAttributes?: (attributes: { name: string; email: string }) => void;
  };
};

export function loadTawkTo(config: TawkToConfig): () => void {
  const script = document.createElement('script');
  script.type = 'text/javascript';
  script.async = true;
  script.src = `https://embed.tawk.to/${config.propertyId}/${config.widgetId}`;
  script.charset = 'UTF-8';
  script.setAttribute('crossorigin', '*');
  document.body.appendChild(script);

  return () => {
    if (script.parentNode) {
      script.parentNode.removeChild(script);
    }
  };
}

export const tawkActions: ChatActions = {
  show: () => {
    (window as TawkWindow).Tawk_API?.showWidget?.();
  },
  hide: () => {
    (window as TawkWindow).Tawk_API?.hideWidget?.();
  },
  open: () => {
    (window as TawkWindow).Tawk_API?.maximize?.();
  },
  setUser: (name, email) => {
    (window as TawkWindow).Tawk_API?.setAttributes?.({
      name,
      email,
    });
  },
};
