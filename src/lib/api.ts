import {
  AnalyticsSummaryResponse,
  BotResponse,
  BotsResponse,
  ConversationHistoryResponse,
  ConversationResponse,
  KnowledgeResponse
} from "@/types/api";

const API_BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:4000";

const withBaseUrl = (path: string) => `${API_BASE_URL.replace(/\/$/, "")}${path}`;

const handleResponse = async <T>(response: Response): Promise<T> => {
  if (!response.ok) {
    const contentType = response.headers.get("content-type");
    if (contentType?.includes("application/json")) {
      const error = await response.json();
      throw new Error(error.error ?? "Request failed");
    }
    throw new Error(await response.text());
  }
  return (await response.json()) as T;
};

export const api = {
  async getBots() {
    const response = await fetch(withBaseUrl("/api/bots"));
    return handleResponse<BotsResponse>(response);
  },

  async getBot(botId: string) {
    const response = await fetch(withBaseUrl(`/api/bots/${botId}`));
    return handleResponse<BotResponse>(response);
  },

  async getBotConversation(botId: string, limit = 20) {
    const response = await fetch(withBaseUrl(`/api/bots/${botId}/conversation?limit=${limit}`));
    return handleResponse<ConversationHistoryResponse>(response);
  },

  async sendMessage(botId: string, message: string) {
    const response = await fetch(withBaseUrl(`/api/bots/${botId}/conversation`), {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ message })
    });
    return handleResponse<ConversationResponse>(response);
  },

  async getKnowledge(botId: string) {
    const response = await fetch(withBaseUrl(`/api/bots/${botId}/knowledge`));
    return handleResponse<KnowledgeResponse>(response);
  },

  async getAnalyticsSummary() {
    const response = await fetch(withBaseUrl("/api/analytics/summary"));
    return handleResponse<AnalyticsSummaryResponse>(response);
  }
};

export default api;
