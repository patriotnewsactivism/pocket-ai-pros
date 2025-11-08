import { z } from "zod";

export const newsletterSubscriptionSchema = z.object({
  email: z
    .string({ required_error: "Email address is required" })
    .trim()
    .min(1, "Email address is required")
    .email("Please enter a valid email address"),
});

export type NewsletterSubscriptionFormValues = z.infer<
  typeof newsletterSubscriptionSchema
>;
