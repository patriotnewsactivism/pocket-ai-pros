import path from "path";
import { fileURLToPath } from "url";
import { ensureDir, pathExists, readJSON, writeJSON } from "fs-extra";

import { defaultDatabase } from "../data/defaultData";
import {
  AnalyticsSummary,
  Bot,
  BotMetrics,
  ConversationMessage,
  Database,
  KnowledgeDocument
} from "../types";

const DEFAULT_METRICS: BotMetrics = {
  messagesHandled: 0,
  avgResponseTimeSeconds: 2,
  csat: 90,
  conversionRate: 15,
  costSavingsUsd: 0,
  automationCoverage: 0.5
};

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DEFAULT_DB_PATH = path.resolve(__dirname, "../data/db.json");

const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value));

export class DataStore {
  private data: Database | null = null;

  constructor(private readonly filePath: string = DEFAULT_DB_PATH) {}

  private async ensureLoaded() {
    if (this.data) {
      return;
    }

    const directory = path.dirname(this.filePath);
    await ensureDir(directory);

    if (!(await pathExists(this.filePath))) {
      this.data = clone(defaultDatabase);
      await this.persist();
      return;
    }

    try {
      const raw = (await readJSON(this.filePath)) as Database;
      this.data = raw;
    } catch (error) {
      console.error("Failed to read database file, reinitialising with default data", error);
      this.data = clone(defaultDatabase);
      await this.persist();
    }
  }

  private async persist() {
    if (!this.data) {
      return;
    }
    this.data.lastUpdated = new Date().toISOString();
    await writeJSON(this.filePath, this.data, { spaces: 2 });
  }

  public async listBots(): Promise<Bot[]> {
    await this.ensureLoaded();
    return clone(this.data!.bots);
  }

  public async getBot(botId: string): Promise<Bot | undefined> {
    await this.ensureLoaded();
    return this.data!.bots.find((bot) => bot.id === botId);
  }

  public async insertBot(bot: Bot, knowledgeDocuments: KnowledgeDocument[] = []) {
    await this.ensureLoaded();
    const existing = this.data!.bots.find((item) => item.id === bot.id);
    if (existing) {
      throw new Error(`Bot with id ${bot.id} already exists`);
    }

    const metrics: BotMetrics = {
      ...DEFAULT_METRICS,
      ...bot.metrics
    };

    this.data!.bots.push({ ...bot, metrics });

    if (knowledgeDocuments.length) {
      this.data!.knowledgeDocuments.push(...knowledgeDocuments);
    }

    await this.persist();
  }

  public async updateBot(botId: string, updates: Partial<Bot>): Promise<Bot | undefined> {
    await this.ensureLoaded();
    const index = this.data!.bots.findIndex((bot) => bot.id === botId);
    if (index === -1) {
      return undefined;
    }

    const current = this.data!.bots[index];
    const mergedMetrics: BotMetrics = {
      ...current.metrics,
      ...updates.metrics
    };

    const updated: Bot = {
      ...current,
      ...updates,
      metrics: mergedMetrics,
      persona: {
        ...current.persona,
        ...(updates.persona ?? {})
      },
      knowledgeDocumentIds: updates.knowledgeDocumentIds ?? current.knowledgeDocumentIds,
      updatedAt: new Date().toISOString()
    };

    this.data!.bots[index] = updated;
    await this.persist();
    return updated;
  }

  public async deleteBot(botId: string) {
    await this.ensureLoaded();
    const initialLength = this.data!.bots.length;
    this.data!.bots = this.data!.bots.filter((bot) => bot.id !== botId);
    this.data!.knowledgeDocuments = this.data!.knowledgeDocuments.filter((doc) => doc.botId !== botId);
    this.data!.conversations = this.data!.conversations.filter((message) => message.botId !== botId);
    if (this.data!.bots.length === initialLength) {
      return false;
    }
    await this.persist();
    return true;
  }

  public async listKnowledgeDocuments(botId: string): Promise<KnowledgeDocument[]> {
    await this.ensureLoaded();
    return this.data!.knowledgeDocuments.filter((doc) => doc.botId === botId);
  }

  public async getKnowledgeDocument(documentId: string): Promise<KnowledgeDocument | undefined> {
    await this.ensureLoaded();
    return this.data!.knowledgeDocuments.find((doc) => doc.id === documentId);
  }

  public async insertKnowledgeDocument(document: KnowledgeDocument) {
    await this.ensureLoaded();
    this.data!.knowledgeDocuments.push(document);
    const bot = this.data!.bots.find((item) => item.id === document.botId);
    if (bot && !bot.knowledgeDocumentIds.includes(document.id)) {
      bot.knowledgeDocumentIds = [...bot.knowledgeDocumentIds, document.id];
      bot.updatedAt = new Date().toISOString();
    }
    await this.persist();
  }

  public async removeKnowledgeDocument(botId: string, documentId: string) {
    await this.ensureLoaded();
    const initialLength = this.data!.knowledgeDocuments.length;
    this.data!.knowledgeDocuments = this.data!.knowledgeDocuments.filter(
      (doc) => !(doc.id === documentId && doc.botId === botId)
    );

    if (this.data!.knowledgeDocuments.length === initialLength) {
      return false;
    }

    const bot = this.data!.bots.find((item) => item.id === botId);
    if (bot) {
      bot.knowledgeDocumentIds = bot.knowledgeDocumentIds.filter((id) => id !== documentId);
      bot.updatedAt = new Date().toISOString();
    }

    await this.persist();
    return true;
  }

  public async appendConversationMessages(botId: string, messages: ConversationMessage[]) {
    await this.ensureLoaded();
    this.data!.conversations.push(...messages);

    const bot = this.data!.bots.find((item) => item.id === botId);
    if (bot) {
      const messageCount = messages.filter((message) => message.role !== "system").length;
      bot.metrics.messagesHandled += messageCount;
      bot.updatedAt = new Date().toISOString();
    }

    await this.persist();
  }

  public async getConversation(botId: string, limit = 20): Promise<ConversationMessage[]> {
    await this.ensureLoaded();
    const messages = this.data!.conversations
      .filter((message) => message.botId === botId)
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    if (messages.length <= limit) {
      return clone(messages);
    }
    return clone(messages.slice(messages.length - limit));
  }

  public async getAnalyticsSummary(): Promise<AnalyticsSummary> {
    await this.ensureLoaded();
    const bots = this.data!.bots;
    const conversations = this.data!.conversations;

    const totalBots = bots.length;
    const activeBots = bots.filter((bot) => bot.status === "active").length;
    const totalKnowledgeDocuments = this.data!.knowledgeDocuments.length;
    const totalConversations = conversations.length;

    const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
    const monthlyMessageVolume = conversations.filter(
      (message) => new Date(message.createdAt).getTime() >= thirtyDaysAgo
    ).length;

    const averageCsat = totalBots
      ? Number((bots.reduce((sum, bot) => sum + bot.metrics.csat, 0) / totalBots).toFixed(1))
      : 0;
    const averageConversionRate = totalBots
      ? Number((bots.reduce((sum, bot) => sum + bot.metrics.conversionRate, 0) / totalBots).toFixed(1))
      : 0;
    const automationCoverage = totalBots
      ? Number(
          ((bots.reduce((sum, bot) => sum + bot.metrics.automationCoverage, 0) / totalBots) * 100).toFixed(1)
        )
      : 0;

    return {
      totalBots,
      activeBots,
      totalKnowledgeDocuments,
      totalConversations,
      monthlyMessageVolume,
      averageCsat,
      averageConversionRate,
      automationCoverage,
      lastUpdated: new Date().toISOString()
    };
  }
}

export default DataStore;
