import type { ChatActions, CrispConfig } from '../types';

type CrispQueueEntry = [string, string, ...unknown[]];

type CrispWindow = Window & {
  $crisp?: CrispQueueEntry[];
  CRISP_WEBSITE_ID?: string;
};

export function loadCrisp(config: CrispConfig): () => void {
  const w = window as CrispWindow;
  w.$crisp = w.$crisp || [];
  w.CRISP_WEBSITE_ID = config.websiteId;

  const script = document.createElement('script');
  script.type = 'text/javascript';
  script.async = true;
  script.src = 'https://client.crisp.chat/l.js';
  document.body.appendChild(script);

  return () => {
    if (script.parentNode) {
      script.parentNode.removeChild(script);
    }
  };
}

export const crispActions: ChatActions = {
  show: () => {
    (window as CrispWindow).$crisp?.push(['do', 'chat:show']);
  },
  hide: () => {
    (window as CrispWindow).$crisp?.push(['do', 'chat:hide']);
  },
  open: () => {
    (window as CrispWindow).$crisp?.push(['do', 'chat:open']);
  },
  setUser: (name, email) => {
    const w = window as CrispWindow;
    w.$crisp?.push(['set', 'user:email', [email]]);
    w.$crisp?.push(['set', 'user:nickname', [name]]);
  },
  sendMessage: (message: string) => {
    (window as CrispWindow).$crisp?.push(['do', 'message:send', ['text', message]]);
  },
};
