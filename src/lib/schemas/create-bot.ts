import { z } from "zod";

export const createBotSchema = z.object({
  name: z
    .string({ required_error: "Bot name is required" })
    .trim()
    .min(1, "Bot name is required")
    .max(100, "Bot name must be 100 characters or fewer"),
  description: z
    .string()
    .trim()
    .max(500, "Description must be 500 characters or fewer"),
});

export type CreateBotFormValues = z.infer<typeof createBotSchema>;
