/**
 * Google Analytics Integration Component
 * Tracks page views and custom events
 */

import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { env } from '@/config/env';

// Declare gtag for TypeScript
declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
    dataLayer?: any[];
  }
}

export function Analytics() {
  const location = useLocation();

  useEffect(() => {
    if (!env.enableAnalytics || !env.googleAnalyticsId) {
      return;
    }

    // Load Google Analytics script
    const script1 = document.createElement('script');
    script1.async = true;
    script1.src = `https://www.googletagmanager.com/gtag/js?id=${env.googleAnalyticsId}`;
    document.head.appendChild(script1);

    // Initialize gtag
    window.dataLayer = window.dataLayer || [];
    function gtag(...args: any[]) {
      window.dataLayer?.push(args);
    }
    window.gtag = gtag;

    gtag('js', new Date());
    gtag('config', env.googleAnalyticsId, {
      page_path: location.pathname + location.search,
    });

    return () => {
      document.head.removeChild(script1);
    };
  }, []);

  // Track page views on route change
  useEffect(() => {
    if (!env.enableAnalytics || !env.googleAnalyticsId || !window.gtag) {
      return;
    }

    window.gtag('config', env.googleAnalyticsId, {
      page_path: location.pathname + location.search,
    });
  }, [location]);

  return null;
}

// Custom event tracking functions
export const trackEvent = (eventName: string, eventParams?: Record<string, any>) => {
  if (!env.enableAnalytics || !window.gtag) {
    return;
  }

  window.gtag('event', eventName, eventParams);
};

// Pre-defined event trackers for common actions
export const analytics = {
  // Conversion events
  signUp: (plan?: string) => {
    trackEvent('sign_up', { method: plan || 'unknown' });
  },

  startCheckout: (planId: string, price: number) => {
    trackEvent('begin_checkout', {
      currency: 'USD',
      value: price,
      items: [{ item_id: planId, item_name: planId }],
    });
  },

  purchase: (planId: string, price: number, transactionId: string) => {
    trackEvent('purchase', {
      transaction_id: transactionId,
      currency: 'USD',
      value: price,
      items: [{ item_id: planId, item_name: planId }],
    });
  },

  // Lead generation events
  contactForm: () => {
    trackEvent('generate_lead', { source: 'contact_form' });
  },

  newsletterSignup: () => {
    trackEvent('generate_lead', { source: 'newsletter' });
  },

  resellerApplication: () => {
    trackEvent('generate_lead', { source: 'reseller_program' });
  },

  // Engagement events
  viewPricing: () => {
    trackEvent('view_pricing', {});
  },

  clickCTA: (ctaLocation: string, ctaText: string) => {
    trackEvent('click_cta', {
      location: ctaLocation,
      text: ctaText,
    });
  },

  watchVideo: (videoTitle: string) => {
    trackEvent('video_start', { video_title: videoTitle });
  },

  viewTestimonials: () => {
    trackEvent('view_testimonials', {});
  },

  viewIntegrations: () => {
    trackEvent('view_integrations', {});
  },

  // Error tracking
  error: (errorMessage: string, errorLocation: string) => {
    trackEvent('exception', {
      description: errorMessage,
      location: errorLocation,
      fatal: false,
    });
  },
};
