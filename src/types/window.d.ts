/**
 * TypeScript declarations for third-party scripts loaded via CDN
 * This extends the Window interface to include external libraries
 */

interface Window {
  // Stripe
  Stripe?: (publicKey: string) => StripeInstance;

  // Tawk.to Live Chat
  Tawk_API?: {
    showWidget: () => void;
    hideWidget: () => void;
    maximize: () => void;
    setAttributes: (attributes: Record<string, any>) => void;
  };
  Tawk_LoadStart?: Date;

  // Intercom
  Intercom?: (command: string, data?: any) => void;
  intercomSettings?: {
    app_id: string;
    [key: string]: any;
  };

  // Crisp
  $crisp?: Array<any> & {
    push: (command: any[]) => void;
  };
  CRISP_WEBSITE_ID?: string;
}

interface StripeInstance {
  redirectToCheckout: (options: { sessionId: string }) => Promise<{ error?: any }>;
  // Add other Stripe methods as needed
}

export {};
