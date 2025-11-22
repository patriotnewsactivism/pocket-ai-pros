import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const envMock = vi.hoisted(() => ({
  enableAIChatbot: true,
  isDevelopment: false,
}));

const invokeMock = vi.hoisted(() => vi.fn());

vi.mock('@/config/env', () => ({
  __esModule: true,
  env: envMock,
}));

vi.mock('./supabase', () => ({
  __esModule: true,
  supabase: {
    functions: {
      invoke: invokeMock,
    },
  },
}));

// Import after mocks
import { Chatbot } from './chatbot';

describe('Chatbot', () => {
  let consoleErrorMock: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    consoleErrorMock = vi.spyOn(console, 'error').mockImplementation(() => {});
    invokeMock.mockReset();
    invokeMock.mockImplementation(async (functionName: string) => {
      if (functionName === 'generate-chat-response') {
        return { data: { content: 'AI generated response.' }, error: null };
      }

      return { data: { success: true }, error: null };
    });
    envMock.enableAIChatbot = true;
  });

  afterEach(() => {
    consoleErrorMock.mockRestore();
  });

  it('uses the Supabase Edge Function to generate responses when enabled', async () => {
    const chatbot = new Chatbot('saas');
    const response = await chatbot.sendMessage('Tell me something unique.');

    const generateCall = invokeMock.mock.calls.find(([fnName]) => fnName === 'generate-chat-response');

    expect(generateCall?.[1]).toEqual(
      expect.objectContaining({ body: expect.objectContaining({ userMessage: 'Tell me something unique.' }) }),
    );
    expect(response.content).toBe('AI generated response.');
  });

  it('falls back to the default response when the Edge Function returns an error', async () => {
    invokeMock.mockImplementation(async (functionName: string) => {
      if (functionName === 'generate-chat-response') {
        return { data: null, error: { message: 'Network error' } } as const;
      }
      return { data: { success: true }, error: null } as const;
    });

    const chatbot = new Chatbot('saas');
    const response = await chatbot.sendMessage('Discuss galaxies.');

    expect(response.content).toContain('Discuss galaxies.');
  });

  it('skips invoking the Edge Function when the chatbot is disabled', async () => {
    envMock.enableAIChatbot = false;

    const chatbot = new Chatbot('saas');
    const response = await chatbot.sendMessage('What is the roadmap?');

    const generateCalls = invokeMock.mock.calls.filter(([fnName]) => fnName === 'generate-chat-response');
    expect(generateCalls).toHaveLength(0);
    expect(response.content).toContain('What is the roadmap?');
  });

  it('returns knowledge base answers when keywords match', async () => {
    const chatbot = new Chatbot('saas');
    const response = await chatbot.sendMessage('Do you offer a trial?');

    expect(response.content).toContain('14-day free trial');
    const generateCalls = invokeMock.mock.calls.filter(([fnName]) => fnName === 'generate-chat-response');
    expect(generateCalls).toHaveLength(0);
  });

  it('handles pricing questions from knowledge base', async () => {
    const chatbot = new Chatbot('saas');
    const response = await chatbot.sendMessage('What does this cost?');

    expect(response.content).toContain('Starter');
    expect(response.content).toContain('Professional');
    const generateCalls = invokeMock.mock.calls.filter(([fnName]) => fnName === 'generate-chat-response');
    expect(generateCalls).toHaveLength(0);
  });

  it('provides capability list when asked for help', async () => {
    const chatbot = new Chatbot('saas');
    const response = await chatbot.sendMessage('Can you help me?');

    expect(response.content).toContain('Account setup');
    expect(response.content).toContain('Feature explanations');
    expect(response.content).toContain('Billing questions');
    const generateCalls = invokeMock.mock.calls.filter(([fnName]) => fnName === 'generate-chat-response');
    expect(generateCalls).toHaveLength(0);
  });

  it('extracts and captures email addresses', async () => {
    const chatbot = new Chatbot('saas');
    const response = await chatbot.sendMessage('My email is user@example.com');

    expect(response.content).toContain('saved your email');
    expect(response.content).toContain('24 hours');
    const generateCalls = invokeMock.mock.calls.filter(([fnName]) => fnName === 'generate-chat-response');
    expect(generateCalls).toHaveLength(0);
  });

  it('prompts for contact information when user wants to speak with team', async () => {
    const chatbot = new Chatbot('saas');
    const response = await chatbot.sendMessage('I need to speak with someone');

    expect(response.content).toContain('connect you with our team');
    expect(response.content).toContain('email address');
    const generateCalls = invokeMock.mock.calls.filter(([fnName]) => fnName === 'generate-chat-response');
    expect(generateCalls).toHaveLength(0);
  });

  it('initializes with correct session ID format', () => {
    const chatbot = new Chatbot('ecommerce');
    const sessionId = chatbot.getSessionId();

    expect(sessionId).toMatch(/^session_\d+_[a-z0-9]+$/);
  });

  it('maintains conversation history across messages', async () => {
    invokeMock.mockImplementation(async (functionName: string) => {
      if (functionName === 'generate-chat-response') {
        return { data: { content: 'AI response' }, error: null } as const;
      }
      return { data: { success: true }, error: null } as const;
    });

    const chatbot = new Chatbot('support');
    await chatbot.sendMessage('First message');
    await chatbot.sendMessage('Second message');

    const history = chatbot.getHistory();
    expect(history.length).toBeGreaterThanOrEqual(4); // 2 user + 2 assistant
    expect(history.filter(m => m.role === 'user')).toHaveLength(2);
    expect(history.filter(m => m.role === 'assistant')).toHaveLength(2);
  });

  it('falls back to default template when unknown business type is provided', () => {
    const chatbot = new Chatbot('unknown' as any);
    const history = chatbot.getHistory();

    // Should initialize without errors and use support template
    expect(history).toEqual([]);
  });

  it('handles empty AI response gracefully', async () => {
    invokeMock.mockImplementation(async (functionName: string) => {
      if (functionName === 'generate-chat-response') {
        return { data: { content: '' }, error: null } as const;
      }
      return { data: { success: true }, error: null } as const;
    });

    const chatbot = new Chatbot('saas');
    const response = await chatbot.sendMessage('Tell me about your service');

    // Should fall back to default message
    expect(response.content).toContain('Tell me about your service');
  });
});
