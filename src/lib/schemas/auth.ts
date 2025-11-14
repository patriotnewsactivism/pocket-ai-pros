import { z } from "zod";
import { evaluatePasswordStrength, PASSWORD_REQUIREMENTS } from "@/lib/security/password";

const strongPasswordSchema = z
  .string()
  .min(
    PASSWORD_REQUIREMENTS.minLength,
    `Password must be at least ${PASSWORD_REQUIREMENTS.minLength} characters.`,
  )
  .regex(/[A-Z]/, "Password must include at least one uppercase letter.")
  .regex(/[a-z]/, "Password must include at least one lowercase letter.")
  .regex(/\d/, "Password must include at least one number.")
  .regex(/[^A-Za-z0-9]/, "Password must include at least one special character.")
  .superRefine((value, ctx) => {
    const { isStrong, suggestions } = evaluatePasswordStrength(value);
    if (!isStrong) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: suggestions[0] ?? "Please choose a stronger password.",
      });
    }
  });

const signInSchema = z.object({
  email: z
    .string()
    .trim()
    .email("Please enter a valid email address."),
  password: z.string().min(6, "Password must be at least 6 characters."),
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
  password: strongPasswordSchema,
});

export type SignInValues = z.infer<typeof signInSchema>;
export type SignUpValues = z.infer<typeof signUpSchema>;

export { signInSchema, signUpSchema };
