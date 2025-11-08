import { z } from "zod";

const newsletterSubscriptionSchema = z.object({
  email: z
    .string()
    .trim()
    .email("Please enter a valid email address."),
});

export type NewsletterSubscriptionValues = z.infer<
  typeof newsletterSubscriptionSchema
>;

export { newsletterSubscriptionSchema };
