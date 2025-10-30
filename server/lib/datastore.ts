import Database from "better-sqlite3";

import db from "../db/connection";
import { runMigrations } from "../db/migrations";
import { AnalyticsSummary, Bot, ConversationMessage, KnowledgeDocument } from "../types";

type BotRow = {
  id: string;
  name: string;
  summary: string;
  industry: string;
  primary_goal: string;
  tone: string;
  status: string;
  persona_tagline: string | null;
  persona_voice: string | null;
  persona_strengths: string | null;
  metrics_messages_handled: number;
  metrics_avg_response_time: number;
  metrics_csat: number;
  metrics_conversion_rate: number;
  metrics_cost_savings: number;
  metrics_automation_coverage: number;
  created_at: string;
  updated_at: string;
};

type KnowledgeRow = {
  id: string;
  bot_id: string;
  title: string;
  content: string;
  tags: string | null;
  source: string | null;
  created_at: string;
  updated_at: string;
};

type ConversationRow = {
  id: string;
  bot_id: string;
  role: string;
  content: string;
  metadata: string | null;
  created_at: string;
};

const mapBotRow = (row: BotRow, knowledgeIds: string[]): Bot => ({
  id: row.id,
  name: row.name,
  summary: row.summary,
  industry: row.industry,
  primaryGoal: row.primary_goal,
  tone: row.tone,
  status: row.status as Bot["status"],
  persona: {
    tagline: row.persona_tagline ?? "",
    voice: row.persona_voice ?? "",
    strengths: row.persona_strengths ? JSON.parse(row.persona_strengths) : []
  },
  knowledgeDocumentIds: knowledgeIds,
  metrics: {
    messagesHandled: row.metrics_messages_handled ?? 0,
    avgResponseTimeSeconds: row.metrics_avg_response_time ?? 0,
    csat: row.metrics_csat ?? 0,
    conversionRate: row.metrics_conversion_rate ?? 0,
    costSavingsUsd: row.metrics_cost_savings ?? 0,
    automationCoverage: row.metrics_automation_coverage ?? 0
  },
  createdAt: row.created_at,
  updatedAt: row.updated_at
});

const mapKnowledgeRow = (row: KnowledgeRow): KnowledgeDocument => ({
  id: row.id,
  botId: row.bot_id,
  title: row.title,
  content: row.content,
  tags: row.tags ? JSON.parse(row.tags) : [],
  source: row.source ?? undefined,
  createdAt: row.created_at,
  updatedAt: row.updated_at
});

const mapConversationRow = (row: ConversationRow): ConversationMessage => ({
  id: row.id,
  botId: row.bot_id,
  role: row.role as ConversationMessage["role"],
  content: row.content,
  createdAt: row.created_at,
  metadata: row.metadata ? JSON.parse(row.metadata) : undefined
});

const ensureMigrations = (() => {
  let ran = false;
  return () => {
    if (!ran) {
      runMigrations();
      ran = true;
    }
  };
})();

export class DataStore {
  constructor(private readonly database: Database.Database = db) {
    ensureMigrations();
  }

  public async listBots(): Promise<Bot[]> {
    const botRows = this.database.prepare<[], BotRow>("SELECT * FROM bots ORDER BY created_at DESC").all();
    if (!botRows.length) {
      return [];
    }

    const knowledgeRows = this.database
      .prepare<[], { bot_id: string; id: string }>("SELECT bot_id, id FROM knowledge_documents")
      .all();

    const knowledgeMap = new Map<string, string[]>();
    knowledgeRows.forEach((row) => {
      const current = knowledgeMap.get(row.bot_id) ?? [];
      current.push(row.id);
      knowledgeMap.set(row.bot_id, current);
    });

    return botRows.map((row) => mapBotRow(row, knowledgeMap.get(row.id) ?? []));
  }

  public async getBot(botId: string): Promise<Bot | undefined> {
    const row = this.database.prepare<[string], BotRow>("SELECT * FROM bots WHERE id = ?").get(botId);
    if (!row) {
      return undefined;
    }

    const knowledgeIds = this.database
      .prepare<[string], { id: string }>("SELECT id FROM knowledge_documents WHERE bot_id = ? ORDER BY created_at ASC")
      .all(botId)
      .map((doc) => doc.id);

    return mapBotRow(row, knowledgeIds);
  }

  public async insertBot(bot: Bot, knowledgeDocuments: KnowledgeDocument[] = []): Promise<Bot> {
    const insertBotStmt = this.database.prepare(`
      INSERT INTO bots (
        id, name, summary, industry, primary_goal, tone, status,
        persona_tagline, persona_voice, persona_strengths,
        metrics_messages_handled, metrics_avg_response_time,
        metrics_csat, metrics_conversion_rate, metrics_cost_savings,
        metrics_automation_coverage, created_at, updated_at
      ) VALUES (
        @id, @name, @summary, @industry, @primary_goal, @tone, @status,
        @persona_tagline, @persona_voice, @persona_strengths,
        @metrics_messages_handled, @metrics_avg_response_time,
        @metrics_csat, @metrics_conversion_rate, @metrics_cost_savings,
        @metrics_automation_coverage, @created_at, @updated_at
      )
    `);

    const insertKnowledgeStmt = this.database.prepare(`
      INSERT INTO knowledge_documents (
        id, bot_id, title, content, tags, source, created_at, updated_at
      ) VALUES (
        @id, @bot_id, @title, @content, @tags, @source, @created_at, @updated_at
      )
    `);

    const transaction = this.database.transaction((botRecord: Bot, docs: KnowledgeDocument[]) => {
      insertBotStmt.run({
        id: botRecord.id,
        name: botRecord.name,
        summary: botRecord.summary,
        industry: botRecord.industry,
        primary_goal: botRecord.primaryGoal,
        tone: botRecord.tone,
        status: botRecord.status,
        persona_tagline: botRecord.persona.tagline ?? null,
        persona_voice: botRecord.persona.voice ?? null,
        persona_strengths: JSON.stringify(botRecord.persona.strengths ?? []),
        metrics_messages_handled: botRecord.metrics.messagesHandled ?? 0,
        metrics_avg_response_time: botRecord.metrics.avgResponseTimeSeconds ?? 0,
        metrics_csat: botRecord.metrics.csat ?? 0,
        metrics_conversion_rate: botRecord.metrics.conversionRate ?? 0,
        metrics_cost_savings: botRecord.metrics.costSavingsUsd ?? 0,
        metrics_automation_coverage: botRecord.metrics.automationCoverage ?? 0,
        created_at: botRecord.createdAt,
        updated_at: botRecord.updatedAt
      });

      docs.forEach((doc) => {
        insertKnowledgeStmt.run({
          id: doc.id,
          bot_id: botRecord.id,
          title: doc.title,
          content: doc.content,
          tags: JSON.stringify(doc.tags ?? []),
          source: doc.source ?? null,
          created_at: doc.createdAt,
          updated_at: doc.updatedAt
        });
      });
    });

    transaction(bot, knowledgeDocuments);

    const inserted = await this.getBot(bot.id);
    if (!inserted) {
      throw new Error("Failed to retrieve inserted bot");
    }
    return inserted;
  }

  public async updateBot(botId: string, updates: Partial<Bot>): Promise<Bot | undefined> {
    const existing = await this.getBot(botId);
    if (!existing) {
      return undefined;
    }

    const merged: Bot = {
      ...existing,
      ...updates,
      persona: {
        ...existing.persona,
        ...(updates.persona ?? {})
      },
      metrics: {
        ...existing.metrics,
        ...(updates.metrics ?? {})
      },
      updatedAt: new Date().toISOString()
    };

    this.database.prepare(`
      UPDATE bots SET
        name = @name,
        summary = @summary,
        industry = @industry,
        primary_goal = @primary_goal,
        tone = @tone,
        status = @status,
        persona_tagline = @persona_tagline,
        persona_voice = @persona_voice,
        persona_strengths = @persona_strengths,
        metrics_messages_handled = @metrics_messages_handled,
        metrics_avg_response_time = @metrics_avg_response_time,
        metrics_csat = @metrics_csat,
        metrics_conversion_rate = @metrics_conversion_rate,
        metrics_cost_savings = @metrics_cost_savings,
        metrics_automation_coverage = @metrics_automation_coverage,
        updated_at = @updated_at
      WHERE id = @id
    `).run({
      id: merged.id,
      name: merged.name,
      summary: merged.summary,
      industry: merged.industry,
      primary_goal: merged.primaryGoal,
      tone: merged.tone,
      status: merged.status,
      persona_tagline: merged.persona.tagline ?? null,
      persona_voice: merged.persona.voice ?? null,
      persona_strengths: JSON.stringify(merged.persona.strengths ?? []),
      metrics_messages_handled: merged.metrics.messagesHandled ?? 0,
      metrics_avg_response_time: merged.metrics.avgResponseTimeSeconds ?? 0,
      metrics_csat: merged.metrics.csat ?? 0,
      metrics_conversion_rate: merged.metrics.conversionRate ?? 0,
      metrics_cost_savings: merged.metrics.costSavingsUsd ?? 0,
      metrics_automation_coverage: merged.metrics.automationCoverage ?? 0,
      updated_at: merged.updatedAt
    });

    return merged;
  }

  public async deleteBot(botId: string): Promise<boolean> {
    const result = this.database.prepare("DELETE FROM bots WHERE id = ?").run(botId);
    return result.changes > 0;
  }

  public async listKnowledgeDocuments(botId: string): Promise<KnowledgeDocument[]> {
    const rows = this.database
      .prepare<[string], KnowledgeRow>(
        "SELECT * FROM knowledge_documents WHERE bot_id = ? ORDER BY created_at ASC"
      )
      .all(botId);
    return rows.map(mapKnowledgeRow);
  }

  public async getKnowledgeDocument(documentId: string): Promise<KnowledgeDocument | undefined> {
    const row = this.database
      .prepare<[string], KnowledgeRow>("SELECT * FROM knowledge_documents WHERE id = ?")
      .get(documentId);
    return row ? mapKnowledgeRow(row) : undefined;
  }

  public async insertKnowledgeDocument(document: KnowledgeDocument): Promise<KnowledgeDocument> {
    this.database.prepare(`
      INSERT INTO knowledge_documents (
        id, bot_id, title, content, tags, source, created_at, updated_at
      ) VALUES (
        @id, @bot_id, @title, @content, @tags, @source, @created_at, @updated_at
      )
    `).run({
      id: document.id,
      bot_id: document.botId,
      title: document.title,
      content: document.content,
      tags: JSON.stringify(document.tags ?? []),
      source: document.source ?? null,
      created_at: document.createdAt,
      updated_at: document.updatedAt
    });

    const botUpdatedAt = new Date().toISOString();
    this.database.prepare(`UPDATE bots SET updated_at = @updated_at WHERE id = @id`).run({
      id: document.botId,
      updated_at: botUpdatedAt
    });

    return document;
  }

  public async removeKnowledgeDocument(botId: string, documentId: string): Promise<boolean> {
    const result = this.database
      .prepare("DELETE FROM knowledge_documents WHERE id = ? AND bot_id = ?")
      .run(documentId, botId);

    if (result.changes > 0) {
      this.database.prepare(`UPDATE bots SET updated_at = @updated_at WHERE id = @id`).run({
        id: botId,
        updated_at: new Date().toISOString()
      });
      return true;
    }
    return false;
  }

  public async appendConversationMessages(botId: string, messages: ConversationMessage[]): Promise<void> {
    if (!messages.length) {
      return;
    }

    const insertMessage = this.database.prepare(`
      INSERT INTO conversation_messages (id, bot_id, role, content, metadata, created_at)
      VALUES (@id, @bot_id, @role, @content, @metadata, @created_at)
    `);

    const transaction = this.database.transaction((msgs: ConversationMessage[]) => {
      msgs.forEach((message) => {
        insertMessage.run({
          id: message.id,
          bot_id: message.botId,
          role: message.role,
          content: message.content,
          metadata: message.metadata ? JSON.stringify(message.metadata) : null,
          created_at: message.createdAt
        });
      });

      const delta = msgs.filter((message) => message.role !== "system").length;
      this.database.prepare(`
        UPDATE bots SET
          metrics_messages_handled = metrics_messages_handled + @delta,
          updated_at = @updated_at
        WHERE id = @id
      `).run({
        delta,
        updated_at: new Date().toISOString(),
        id: botId
      });
    });

    transaction(messages);
  }

  public async getConversation(botId: string, limit = 20): Promise<ConversationMessage[]> {
    const rows = this.database
      .prepare<[string, number], ConversationRow>(
        `SELECT * FROM conversation_messages WHERE bot_id = ? ORDER BY created_at DESC LIMIT ?`
      )
      .all(botId, limit);

    return rows
      .map(mapConversationRow)
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  }

  public async getAnalyticsSummary(): Promise<AnalyticsSummary> {
    const aggregateBots = this.database.prepare<[], {
      total: number;
      active: number;
      csat: number | null;
      conversion: number | null;
      automation: number | null;
      lastUpdated: string | null;
    }>(
      `SELECT
        COUNT(*) AS total,
        SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) AS active,
        AVG(metrics_csat) AS csat,
        AVG(metrics_conversion_rate) AS conversion,
        AVG(metrics_automation_coverage) AS automation,
        MAX(updated_at) AS lastUpdated
      FROM bots`
    ).get();

    const knowledgeCount = this.database
      .prepare<[], { count: number }>("SELECT COUNT(*) AS count FROM knowledge_documents")
      .get();

    const totalConversationsRow = this.database
      .prepare<[], { count: number }>("SELECT COUNT(*) AS count FROM conversation_messages")
      .get();

    const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const monthlyRow = this.database
      .prepare<[string], { count: number }>(
        "SELECT COUNT(*) AS count FROM conversation_messages WHERE created_at >= ?"
      )
      .get(since);

    return {
      totalBots: aggregateBots?.total ?? 0,
      activeBots: aggregateBots?.active ?? 0,
      totalKnowledgeDocuments: knowledgeCount?.count ?? 0,
      totalConversations: totalConversationsRow?.count ?? 0,
      monthlyMessageVolume: monthlyRow?.count ?? 0,
      averageCsat: Number(((aggregateBots?.csat ?? 0) || 0).toFixed(1)),
      averageConversionRate: Number(((aggregateBots?.conversion ?? 0) || 0).toFixed(1)),
      automationCoverage: Number((((aggregateBots?.automation ?? 0) || 0) * 100).toFixed(1)),
      lastUpdated: aggregateBots?.lastUpdated ?? new Date().toISOString()
    };
  }
}

export default DataStore;
