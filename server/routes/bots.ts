import { Router } from "express";
import { nanoid } from "nanoid";

import DataStore from "../lib/datastore";
import generateAiResponse from "../lib/aiResponder";
import { createBotSchema, knowledgeDocumentInputSchema, messageSchema, updateBotSchema } from "../schemas";
import { Bot, BotMetrics, KnowledgeDocument } from "../types";

const buildDefaultMetrics = (metrics?: Partial<BotMetrics>): BotMetrics => ({
  messagesHandled: metrics?.messagesHandled ?? 0,
  avgResponseTimeSeconds: metrics?.avgResponseTimeSeconds ?? 2,
  csat: metrics?.csat ?? 94,
  conversionRate: metrics?.conversionRate ?? 22,
  costSavingsUsd: metrics?.costSavingsUsd ?? 0,
  automationCoverage: metrics?.automationCoverage ?? 0.6
});

const ensureArray = <T>(input?: T[]): T[] => (Array.isArray(input) ? input : []);

export const createBotsRouter = (store: DataStore) => {
  const router = Router();

  router.get("/", async (_req, res, next) => {
    try {
      const bots = await store.listBots();
      res.json({ bots });
    } catch (error) {
      next(error);
    }
  });

  router.get("/:botId", async (req, res, next) => {
    try {
      const bot = await store.getBot(req.params.botId);
      if (!bot) {
        res.status(404).json({ error: "Bot not found" });
        return;
      }
      const knowledgeDocuments = await store.listKnowledgeDocuments(bot.id);
      res.json({ bot, knowledgeDocuments });
    } catch (error) {
      next(error);
    }
  });

  router.post("/", async (req, res, next) => {
    try {
      const payload = createBotSchema.parse(req.body);
      const botId = `bot-${nanoid(10)}`;
      const timestamp = new Date().toISOString();

      const knowledgeDocuments: KnowledgeDocument[] = ensureArray(payload.knowledgeDocuments).map((doc) => ({
        id: `doc-${nanoid(12)}`,
        botId,
        title: doc.title,
        content: doc.content,
        tags: doc.tags ?? [],
        source: doc.source,
        createdAt: timestamp,
        updatedAt: timestamp
      }));

      const persona = {
        tagline: payload.persona?.tagline ?? "AI assistant ready to help",
        voice: payload.persona?.voice ?? "Friendly and professional",
        strengths: ensureArray(payload.persona?.strengths).length
          ? ensureArray(payload.persona?.strengths)
          : ["Understands your documentation", "Responds with actionable guidance"]
      };

      const bot: Bot = {
        id: botId,
        name: payload.name,
        summary: payload.summary,
        industry: payload.industry,
        primaryGoal: payload.primaryGoal,
        tone: payload.tone,
        status: payload.status ?? "draft",
        persona,
        knowledgeDocumentIds: knowledgeDocuments.map((doc) => doc.id),
        metrics: buildDefaultMetrics(payload.metrics ?? {}),
        createdAt: timestamp,
        updatedAt: timestamp
      };

      await store.insertBot(bot, knowledgeDocuments);

      res.status(201).json({ bot, knowledgeDocuments });
    } catch (error) {
      next(error);
    }
  });

  router.put("/:botId", async (req, res, next) => {
    try {
      const payload = updateBotSchema.parse(req.body);
      const updates: Partial<Bot> = {
        ...payload,
        persona: payload.persona,
        metrics: payload.metrics
      } as Partial<Bot>;

      const updated = await store.updateBot(req.params.botId, updates);

      if (!updated) {
        res.status(404).json({ error: "Bot not found" });
        return;
      }

      res.json({ bot: updated });
    } catch (error) {
      next(error);
    }
  });

  router.delete("/:botId", async (req, res, next) => {
    try {
      const deleted = await store.deleteBot(req.params.botId);
      if (!deleted) {
        res.status(404).json({ error: "Bot not found" });
        return;
      }
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  });

  router.get("/:botId/knowledge", async (req, res, next) => {
    try {
      const bot = await store.getBot(req.params.botId);
      if (!bot) {
        res.status(404).json({ error: "Bot not found" });
        return;
      }
      const knowledgeDocuments = await store.listKnowledgeDocuments(bot.id);
      res.json({ knowledgeDocuments });
    } catch (error) {
      next(error);
    }
  });

  router.post("/:botId/knowledge", async (req, res, next) => {
    try {
      const bot = await store.getBot(req.params.botId);
      if (!bot) {
        res.status(404).json({ error: "Bot not found" });
        return;
      }

      const payload = knowledgeDocumentInputSchema.parse(req.body);
      const timestamp = new Date().toISOString();
      const document: KnowledgeDocument = {
        id: `doc-${nanoid(12)}`,
        botId: bot.id,
        title: payload.title,
        content: payload.content,
        tags: payload.tags ?? [],
        source: payload.source,
        createdAt: timestamp,
        updatedAt: timestamp
      };

      await store.insertKnowledgeDocument(document);
      res.status(201).json({ document });
    } catch (error) {
      next(error);
    }
  });

  router.delete("/:botId/knowledge/:documentId", async (req, res, next) => {
    try {
      const bot = await store.getBot(req.params.botId);
      if (!bot) {
        res.status(404).json({ error: "Bot not found" });
        return;
      }

      const removed = await store.removeKnowledgeDocument(bot.id, req.params.documentId);
      if (!removed) {
        res.status(404).json({ error: "Knowledge document not found" });
        return;
      }

      res.status(204).send();
    } catch (error) {
      next(error);
    }
  });

  router.get("/:botId/conversation", async (req, res, next) => {
    try {
      const bot = await store.getBot(req.params.botId);
      if (!bot) {
        res.status(404).json({ error: "Bot not found" });
        return;
      }
      const limit = req.query.limit ? Number(req.query.limit) : 20;
      const messages = await store.getConversation(bot.id, Number.isFinite(limit) ? limit : 20);
      res.json({ messages });
    } catch (error) {
      next(error);
    }
  });

  router.post("/:botId/conversation", async (req, res, next) => {
    try {
      const bot = await store.getBot(req.params.botId);
      if (!bot) {
        res.status(404).json({ error: "Bot not found" });
        return;
      }

      const payload = messageSchema.parse(req.body);
      const knowledgeDocuments = await store.listKnowledgeDocuments(bot.id);
      const history = await store.getConversation(bot.id, 10);

      const aiResponse = await generateAiResponse({
        bot,
        userMessage: payload.message,
        knowledgeDocuments,
        conversationHistory: history
      });

      const timestamp = new Date().toISOString();
      const userMessage = {
        id: `msg-${nanoid(12)}`,
        botId: bot.id,
        role: "user" as const,
        content: payload.message,
        createdAt: timestamp
      };

      const assistantMessage = {
        id: `msg-${nanoid(12)}`,
        botId: bot.id,
        role: "assistant" as const,
        content: aiResponse.text,
        createdAt: new Date().toISOString(),
        metadata: {
          provider: aiResponse.provider,
          usedKnowledge: aiResponse.usedKnowledge
        }
      };

      await store.appendConversationMessages(bot.id, [userMessage, assistantMessage]);

      res.status(201).json({ response: aiResponse, messages: [userMessage, assistantMessage] });
    } catch (error) {
      next(error);
    }
  });

  return router;
};

export default createBotsRouter;
