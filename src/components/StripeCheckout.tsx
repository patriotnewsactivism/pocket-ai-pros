/**
 * Stripe Checkout Component
 * Handles subscription payments for all plans
 */

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { env } from '@/config/env';

interface StripeCheckoutProps {
  planId: string;
  planName: string;
  price: number;
  onSuccess?: () => void;
}

export function StripeCheckout({ planId, planName, price, onSuccess }: StripeCheckoutProps) {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleCheckout = async () => {
    if (!env.stripePublicKey) {
      toast({
        title: 'Payment Not Configured',
        description: 'Please contact support to complete your purchase.',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    try {
      // Create checkout session
      const response = await fetch(`${env.apiBaseUrl || '/api'}/create-checkout-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          planId,
          planName,
          price,
          successUrl: `${window.location.origin}/success?session_id={CHECKOUT_SESSION_ID}`,
          cancelUrl: `${window.location.origin}/?canceled=true`,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create checkout session');
      }

      const { sessionId, url } = await response.json();

      // Redirect to Stripe Checkout
      if (url) {
        window.location.href = url;
      } else if (sessionId) {
        // Fallback: use Stripe.js to redirect
        const stripe = window.Stripe?.(env.stripePublicKey);
        if (stripe) {
          const { error } = await stripe.redirectToCheckout({ sessionId });
          if (error) {
            throw error;
          }
        }
      }

      onSuccess?.();
    } catch (error) {
      console.error('Checkout error:', error);
      toast({
        title: 'Payment Error',
        description: 'Failed to start checkout. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      onClick={handleCheckout}
      disabled={loading}
      size="lg"
      className="w-full"
    >
      {loading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Processing...
        </>
      ) : (
        `Subscribe - $${price}/mo`
      )}
    </Button>
  );
}
