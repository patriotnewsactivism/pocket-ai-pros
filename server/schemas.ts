import { z } from "zod";

export const knowledgeDocumentInputSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters."),
  content: z.string().min(10, "Content must be at least 10 characters."),
  tags: z.array(z.string().min(2)).default([]),
  source: z.string().optional()
});

export const personaSchema = z.object({
  tagline: z.string().min(3).max(160).optional(),
  voice: z.string().min(3).max(160).optional(),
  strengths: z.array(z.string().min(2)).min(1).optional()
});

export const metricsSchema = z.object({
  messagesHandled: z.number().min(0).optional(),
  avgResponseTimeSeconds: z.number().min(0).optional(),
  csat: z.number().min(0).max(100).optional(),
  conversionRate: z.number().min(0).max(100).optional(),
  costSavingsUsd: z.number().min(0).optional(),
  automationCoverage: z.number().min(0).max(1).optional()
});

export const createBotSchema = z.object({
  name: z.string().min(3),
  summary: z.string().min(10),
  industry: z.string().min(2),
  primaryGoal: z.string().min(3),
  tone: z.string().min(3),
  status: z.enum(["draft", "active", "paused"]).default("draft"),
  knowledgeDocuments: z.array(knowledgeDocumentInputSchema).optional(),
  persona: personaSchema.optional(),
  metrics: metricsSchema.optional()
});

export const updateBotSchema = createBotSchema.partial();

export const messageSchema = z.object({
  message: z.string().min(1, "Message cannot be empty."),
  context: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().min(1)
      })
    )
    .optional()
});

export type CreateBotInput = z.infer<typeof createBotSchema>;
export type UpdateBotInput = z.infer<typeof updateBotSchema>;
