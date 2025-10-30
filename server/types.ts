export type BotStatus = "draft" | "active" | "paused";

export interface BotMetrics {
  messagesHandled: number;
  avgResponseTimeSeconds: number;
  csat: number;
  conversionRate: number;
  costSavingsUsd: number;
  automationCoverage: number;
}

export interface BotPersona {
  tagline: string;
  voice: string;
  strengths: string[];
}

export interface Bot {
  id: string;
  name: string;
  summary: string;
  industry: string;
  primaryGoal: string;
  tone: string;
  status: BotStatus;
  persona: BotPersona;
  knowledgeDocumentIds: string[];
  metrics: BotMetrics;
  createdAt: string;
  updatedAt: string;
}

export interface KnowledgeDocument {
  id: string;
  botId: string;
  title: string;
  content: string;
  tags: string[];
  source?: string;
  createdAt: string;
  updatedAt: string;
}

export type ConversationRole = "user" | "assistant" | "system";

export interface ConversationMessage {
  id: string;
  botId: string;
  role: ConversationRole;
  content: string;
  createdAt: string;
  metadata?: Record<string, unknown>;
}

export interface Database {
  bots: Bot[];
  knowledgeDocuments: KnowledgeDocument[];
  conversations: ConversationMessage[];
  lastUpdated: string;
}

export interface AnalyticsSummary {
  totalBots: number;
  activeBots: number;
  totalKnowledgeDocuments: number;
  totalConversations: number;
  monthlyMessageVolume: number;
  averageCsat: number;
  averageConversionRate: number;
  automationCoverage: number;
  lastUpdated: string;
}

export interface AiResponse {
  text: string;
  provider: "openai" | "knowledge-base";
  usedKnowledge: Array<{ id: string; title: string }>;
}
