import { describe, it, expect, beforeEach, vi } from "vitest";
import { getAvailableBusinessTypes, getBusinessTemplate, Chatbot } from "./chatbot";
import { BUSINESS_TEMPLATES } from "@/templates/business-templates";

// Mock Supabase
vi.mock('./supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      insert: vi.fn().mockResolvedValue({ data: null, error: null }),
      update: vi.fn().mockReturnThis(),
      eq: vi.fn().mockResolvedValue({ data: null, error: null }),
    })),
    functions: {
      invoke: vi.fn().mockResolvedValue({ data: { response: 'Mocked AI response' }, error: null }),
    },
  },
}));

describe("chatbot template helpers", () => {
  it("returns template details for a supported business type", () => {
    const template = getBusinessTemplate("saas");

    expect(template.name).toBe(BUSINESS_TEMPLATES.saas.name);
    expect(template.quickReplies).toEqual(BUSINESS_TEMPLATES.saas.chatbot.quickReplies);
    expect(template.capabilities.length).toBeGreaterThan(0);
  });

  it("falls back to the support template when an unknown type is requested", () => {
    const template = getBusinessTemplate("unknown" as keyof typeof BUSINESS_TEMPLATES);

    expect(template.name).toBe(BUSINESS_TEMPLATES.support.name);
    expect(template.quickReplies).toEqual(BUSINESS_TEMPLATES.support.chatbot.quickReplies);
  });

  it("lists all available business types", () => {
    const availableTypes = getAvailableBusinessTypes().sort();
    const templateKeys = Object.keys(BUSINESS_TEMPLATES).sort();

    expect(availableTypes).toEqual(templateKeys);
  });

  it("includes persona and tone in all templates", () => {
    const types = getAvailableBusinessTypes();

    types.forEach((type) => {
      const template = getBusinessTemplate(type as keyof typeof BUSINESS_TEMPLATES);
      expect(template.persona).toBeDefined();
      expect(template.tone).toBeDefined();
      expect(typeof template.persona).toBe('string');
      expect(typeof template.tone).toBe('string');
    });
  });
});

describe("Chatbot class", () => {
  let chatbot: Chatbot;

  beforeEach(() => {
    chatbot = new Chatbot('saas');
  });

  it("initializes with correct business type and template", () => {
    expect(chatbot).toBeDefined();
    const template = chatbot.getTemplate();
    expect(template.name).toBe(BUSINESS_TEMPLATES.saas.name);
  });

  it("generates a session ID on initialization", () => {
    const sessionId = chatbot.getSessionId();
    expect(sessionId).toBeDefined();
    expect(typeof sessionId).toBe('string');
    expect(sessionId.length).toBeGreaterThan(0);
  });

  it("returns greeting message when starting session", async () => {
    await chatbot.startSession();
    const messages = chatbot.getConversationHistory();

    expect(messages.length).toBeGreaterThan(0);
    expect(messages[0].role).toBe('assistant');
    expect(messages[0].content).toBe(BUSINESS_TEMPLATES.saas.chatbot.greeting);
  });

  it("handles pricing questions with dynamic template pricing", async () => {
    await chatbot.startSession();
    const response = await chatbot.sendMessage("What's your pricing?");

    expect(response.content).toContain('Starter');
    expect(response.content).toContain('Professional');
    expect(response.content).toContain('Enterprise');
    expect(response.content).toContain('$99');
    expect(response.content).toContain('$299');
    expect(response.content).toContain('$799');
  });

  it("extracts and captures email addresses from messages", async () => {
    await chatbot.startSession();
    const response = await chatbot.sendMessage("My email is test@example.com");

    expect(response.content).toContain('saved your email');
    expect(response.content).toContain('24 hours');
  });

  it("provides capability list when asked for help", async () => {
    await chatbot.startSession();
    const response = await chatbot.sendMessage("Can you help me?");

    const template = chatbot.getTemplate();
    expect(response.content).toContain('I can help you with');
    template.capabilities.forEach(cap => {
      expect(response.content).toContain(cap);
    });
  });

  it("returns quick replies from template", () => {
    const quickReplies = chatbot.getQuickReplies();
    expect(quickReplies).toEqual(BUSINESS_TEMPLATES.saas.chatbot.quickReplies);
  });

  it("maintains conversation history", async () => {
    await chatbot.startSession();
    await chatbot.sendMessage("Hello");
    await chatbot.sendMessage("How are you?");

    const history = chatbot.getConversationHistory();
    expect(history.length).toBeGreaterThanOrEqual(5); // greeting + 2 user + 2 assistant
    expect(history.some(msg => msg.role === 'user' && msg.content === 'Hello')).toBe(true);
    expect(history.some(msg => msg.role === 'user' && msg.content === 'How are you?')).toBe(true);
  });

  it("handles unknown questions gracefully", async () => {
    await chatbot.startSession();
    const response = await chatbot.sendMessage("Tell me about quantum physics");

    // Should either get an AI response or a fallback that mentions the persona
    expect(response.content).toBeDefined();
    expect(response.content.length).toBeGreaterThan(0);
    expect(response.role).toBe('assistant');
  });
});
