import { z } from "zod";

const resellerApplicationSchema = z.object({
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
    .min(2, "Please enter your company name.")
    .max(120, "Company name must be 120 characters or less."),
  phone: z
    .string()
    .trim()
    .max(30, "Phone number must be 30 characters or less.")
    .regex(/^[+\d().\s-]*$/, "Please enter a valid phone number.")
    .transform((value) => (value === "" ? undefined : value))
    .optional(),
  experience: z
    .string()
    .trim()
    .max(2000, "Experience description must be 2000 characters or less.")
    .transform((value) => (value === "" ? undefined : value))
    .optional(),
  expectedClients: z
    .number({ invalid_type_error: "Expected clients must be a number." })
    .int("Expected clients must be a whole number.")
    .min(1, "Please estimate at least one client.")
    .optional(),
});

export type ResellerApplicationValues = z.infer<typeof resellerApplicationSchema>;

export { resellerApplicationSchema };
