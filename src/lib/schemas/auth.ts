import { z } from "zod";

const signInSchema = z.object({
  email: z
    .string()
    .trim()
    .email("Please enter a valid email address."),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters."),
});

const signUpSchema = signInSchema.extend({
  fullName: z
    .string()
    .trim()
    .min(2, "Please enter your full name.")
    .max(120, "Full name must be 120 characters or less."),
  company: z
    .string()
    .trim()
    .max(120, "Company name must be 120 characters or less.")
    .transform((value) => (value === "" ? undefined : value))
    .optional(),
});

export type SignInValues = z.infer<typeof signInSchema>;
export type SignUpValues = z.infer<typeof signUpSchema>;

export { signInSchema, signUpSchema };
