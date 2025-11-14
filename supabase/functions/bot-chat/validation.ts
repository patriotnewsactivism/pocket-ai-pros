import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

export const botChatRequestSchema = z.object({
  botId: z.string().uuid("Invalid bot ID format"),
  message: z.string()
    .min(1, "Message cannot be empty")
    .max(2000, "Message is too long (max 2000 characters)")
    .trim(),
  conversationId: z.string().uuid("Invalid conversation ID format").optional(),
});

export type BotChatRequest = z.infer<typeof botChatRequestSchema>;
