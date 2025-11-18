import { z } from "zod";

export const payoutRequestSchema = z.object({
  amount: z
    .number()
    .min(50, "Minimum payout amount is $50")
    .max(100000, "Maximum payout amount is $100,000"),
  payout_method: z.enum(["paypal", "stripe", "wire", "check"], {
    required_error: "Please select a payout method",
  }),
  payout_email: z
    .string()
    .email("Please enter a valid email address")
    .optional()
    .or(z.literal("")),
  payout_details: z.record(z.string(), z.any()).optional(),
});

export type PayoutRequestFormValues = z.infer<typeof payoutRequestSchema>;

export const PAYOUT_METHODS = [
  { value: "paypal", label: "PayPal", description: "Receive payment via PayPal" },
  { value: "stripe", label: "Stripe", description: "Direct deposit via Stripe" },
  { value: "wire", label: "Wire Transfer", description: "Bank wire transfer" },
  { value: "check", label: "Check", description: "Physical check by mail" },
] as const;

export const MINIMUM_PAYOUT = 50;
