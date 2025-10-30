import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import api from "@/lib/api";
import { Bot, BotsResponse, ConversationHistoryResponse, ConversationResponse } from "@/types/api";

export const useBots = () =>
  useQuery<BotsResponse, Error>({
    queryKey: ["bots"],
    queryFn: () => api.getBots()
  });

export const useBot = (botId?: string) =>
  useQuery<{ bot: Bot }, Error>({
    queryKey: ["bot", botId],
    queryFn: async () => {
      if (!botId) {
        throw new Error("No bot id provided");
      }
      const response = await api.getBot(botId);
      return { bot: response.bot };
    },
    enabled: Boolean(botId)
  });

export const useConversation = (botId?: string, limit = 20) =>
  useQuery<ConversationHistoryResponse, Error>({
    queryKey: ["bot-conversation", botId, limit],
    queryFn: () => {
      if (!botId) {
        throw new Error("No bot id provided");
      }
      return api.getBotConversation(botId, limit);
    },
    enabled: Boolean(botId)
  });

export const useSendMessage = (botId?: string, limit = 20) => {
  const queryClient = useQueryClient();
  return useMutation<ConversationResponse, Error, string>({
    mutationFn: async (message: string) => {
      if (!botId) {
        throw new Error("No bot id provided");
      }
      return api.sendMessage(botId, message);
    },
    onSuccess: (data) => {
      if (!botId) {
        return;
      }
      queryClient.setQueryData<ConversationHistoryResponse | undefined>(
        ["bot-conversation", botId, limit],
        (existing) => {
          const messages = existing?.messages ?? [];
          return {
            messages: [...messages, ...data.messages]
          };
        }
      );
    }
  });
};

export default useBots;
