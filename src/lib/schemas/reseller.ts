import { z } from "zod";

export const resellerApplicationSchema = z.object({
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
    .string({ required_error: "Company name is required" })
    .trim()
    .min(1, "Company name is required")
    .max(150, "Company name must be 150 characters or fewer"),
  phone: z
    .string()
    .trim()
    .max(30, "Phone number must be 30 characters or fewer")
    .optional()
    .transform((value) => value ?? ""),
  experience: z
    .string()
    .trim()
    .max(1500, "Experience must be 1500 characters or fewer")
    .optional()
    .transform((value) => value ?? ""),
  expectedClients: z
    .string()
    .trim()
    .max(10, "Expected clients must be 10 characters or fewer")
    .superRefine((value, ctx) => {
      if (value === "") {
        return;
      }

      if (!/^[0-9]+$/.test(value) || Number.parseInt(value, 10) <= 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Expected clients must be a positive number",
        });
      }
    }),
});

export type ResellerApplicationFormValues = z.infer<
  typeof resellerApplicationSchema
>;
