import { z } from "zod";

const createBotSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Please provide a name for your bot.")
    .max(100, "Bot name must be 100 characters or less."),
  description: z
    .string()
    .trim()
    .max(500, "Description must be 500 characters or less.")
    .transform((value) => (value === "" ? undefined : value))
    .optional(),
  templateId: z
    .string()
    .trim()
    .min(1, "Please choose a starting template for your bot."),
});

export type CreateBotFormValues = z.infer<typeof createBotSchema>;

export { createBotSchema };
