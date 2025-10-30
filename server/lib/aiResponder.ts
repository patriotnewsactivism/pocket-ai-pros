import { OpenAI } from "openai";

import { AiResponse, Bot, ConversationMessage, KnowledgeDocument } from "../types";

const openAiApiKey = process.env.OPENAI_API_KEY;
const openAiModel = process.env.OPENAI_MODEL ?? "gpt-4o-mini";

const openAiClient = openAiApiKey
  ? new OpenAI({
      apiKey: openAiApiKey
    })
  : null;

const normalize = (value: string) => value.toLowerCase();

const scoreDocument = (query: string, document: KnowledgeDocument): number => {
  const terms = normalize(query)
    .split(/[^a-z0-9]+/)
    .filter((term) => term.length > 2);

  if (!terms.length) {
    return 0;
  }

  const haystack = normalize([document.title, document.content, document.tags.join(" ")].join(" "));

  return terms.reduce((score, term) => {
    const matches = haystack.match(new RegExp(term, "g"))?.length ?? 0;
    return score + matches * 2 + (document.title.toLowerCase().includes(term) ? 3 : 0);
  }, 0);
};

const buildFallbackResponse = (bot: Bot, documents: KnowledgeDocument[]): AiResponse => {
  if (!documents.length) {
    return {
      provider: "knowledge-base",
      text: `I'm ${bot.name}, and I don't have a direct answer yet. Could you share a bit more context so I can help you faster?`,
      usedKnowledge: []
    };
  }

  const primary = documents[0];
  const supporting = documents.slice(1, 3);

  const summary = primary.content.split("\n").slice(0, 3).join(" ");
  const details = supporting
    .map((doc) => `• ${doc.title}: ${doc.content.split("\n").slice(0, 2).join(" ")}`)
    .join("\n");

  const text = [
    `Here's what I recommend based on ${primary.title}: ${summary}`,
    supporting.length ? `Additional context:\n${details}` : null,
    "Let me know if you'd like a walkthrough or if you have a follow-up question."
  ]
    .filter(Boolean)
    .join("\n\n");

  return {
    provider: "knowledge-base",
    text,
    usedKnowledge: documents.map((doc) => ({ id: doc.id, title: doc.title }))
  };
};

export const generateAiResponse = async (options: {
  bot: Bot;
  userMessage: string;
  knowledgeDocuments: KnowledgeDocument[];
  conversationHistory?: ConversationMessage[];
}): Promise<AiResponse> => {
  const { bot, userMessage, knowledgeDocuments, conversationHistory = [] } = options;

  const rankedDocs = knowledgeDocuments
    .map((doc) => ({ doc, score: scoreDocument(userMessage, doc) }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .map(({ doc }) => doc);

  if (openAiClient) {
    try {
      const docContext = (rankedDocs.length ? rankedDocs : knowledgeDocuments)
        .slice(0, 5)
        .map((doc) => `Title: ${doc.title}\nTags: ${doc.tags.join(", ")}\nContent:\n${doc.content}`)
        .join("\n\n");

      const historyBlock = conversationHistory
        .slice(-6)
        .map((message) => `${message.role === "assistant" ? "Assistant" : "User"}: ${message.content}`)
        .join("\n");

      const prompt = [
        `System: You are ${bot.name}, an AI assistant whose goal is ${bot.primaryGoal}. Always respond in a ${bot.tone.toLowerCase()} voice.`,
        historyBlock ? `Recent conversation:\n${historyBlock}` : null,
        `User: ${userMessage}`,
        `Knowledge base:\n${docContext}`,
        "Instructions: Provide a concise answer referencing the knowledge when relevant."
      ]
        .filter(Boolean)
        .join("\n\n");

      const response = await openAiClient.responses.create({
        model: openAiModel,
        input: prompt,
        max_output_tokens: 350,
        temperature: 0.2
      });

      const text = response.output_text?.trim();
      if (text) {
        return {
          provider: "openai",
          text,
          usedKnowledge: (rankedDocs.length ? rankedDocs : knowledgeDocuments).slice(0, 3).map((doc) => ({
            id: doc.id,
            title: doc.title
          }))
        };
      }
    } catch (error) {
      console.warn("Falling back to local knowledge base response", error);
    }
  }

  const fallbackDocs = rankedDocs.length ? rankedDocs : knowledgeDocuments.slice(0, 3);
  return buildFallbackResponse(bot, fallbackDocs);
};

export default generateAiResponse;
