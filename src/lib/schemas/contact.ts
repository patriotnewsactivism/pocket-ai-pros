import { z } from "zod";

const contactFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Please enter your full name.")
    .max(120, "Full name must be 120 characters or less."),
  email: z
    .string()
    .trim()
    .email("Please enter a valid email address."),
  company: z
    .string()
    .trim()
    .max(120, "Company name must be 120 characters or less.")
    .transform((value) => (value === "" ? undefined : value))
    .optional(),
  message: z
    .string()
    .trim()
    .min(10, "Please provide more details about your needs (at least 10 characters).")
    .max(1000, "Message must be 1000 characters or less."),
});

export type ContactFormValues = z.infer<typeof contactFormSchema>;

export { contactFormSchema };
