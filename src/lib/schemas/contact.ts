import { z } from "zod";

export const contactFormSchema = z.object({
  name: z
    .string({ required_error: "Full name is required" })
    .trim()
    .min(1, "Full name is required")
    .max(100, "Full name must be 100 characters or fewer"),
  email: z
    .string({ required_error: "Email address is required" })
    .trim()
    .min(1, "Email address is required")
    .email("Please enter a valid email address"),
  company: z
    .string()
    .trim()
    .max(100, "Company name must be 100 characters or fewer")
    .optional()
    .transform((value) => value ?? ""),
  message: z
    .string()
    .trim()
    .max(1000, "Message must be 1000 characters or fewer"),
});

export type ContactFormValues = z.infer<typeof contactFormSchema>;
