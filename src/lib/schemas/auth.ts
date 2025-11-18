import { z } from "zod";

// Strong password validation for production security
const strongPasswordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/[0-9]/, "Password must contain at least one number")
  .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character (!@#$%^&*)");

const signInSchema = z.object({
  email: z
    .string()
    .trim()
    .email("Please enter a valid email address."),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters."),
});

const signUpSchema = z.object({
  email: z
    .string()
    .trim()
    .email("Please enter a valid email address."),
  password: strongPasswordSchema,
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
