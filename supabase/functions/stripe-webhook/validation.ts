import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

export const stripeSubscriptionSchema = z.object({
  id: z.string(),
  customer: z.string(),
  status: z.enum(['active', 'canceled', 'incomplete', 'incomplete_expired', 'past_due', 'trialing', 'unpaid']),
  items: z.object({
    data: z.array(z.object({
      price: z.object({
        id: z.string(),
        product: z.string(),
      }),
    })),
  }),
  current_period_end: z.number(),
});

export const stripeEventSchema = z.object({
  type: z.string(),
  data: z.object({
    object: z.any(),
  }),
});

export type StripeSubscription = z.infer<typeof stripeSubscriptionSchema>;
export type StripeEvent = z.infer<typeof stripeEventSchema>;
