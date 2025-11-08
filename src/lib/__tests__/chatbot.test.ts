import { beforeEach, describe, expect, it, vi } from 'vitest';

const insertCalls: Array<{ table: string; payload: unknown }> = [];
const updateCalls: Array<{ table: string; values: unknown }> = [];
const eqCalls: Array<{ table: string; column: string; value: unknown }> = [];

vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: (table: string) => ({
      insert: async (payload: unknown) => {
        insertCalls.push({ table, payload });
        return { data: null, error: null };
      },
      update: (values: unknown) => {
        updateCalls.push({ table, values });
        return {
          eq: async (column: string, value: unknown) => {
            eqCalls.push({ table, column, value });
            return { data: null, error: null };
          },
        };
      },
      select: () => ({
        single: async () => ({ data: null, error: null }),
      }),
      eq: async (column: string, value: unknown) => {
        eqCalls.push({ table, column, value });
        return { data: null, error: null };
      },
    }),
  },
  db: {},
}));

vi.mock('@/config/env', () => ({
  env: {
    supabaseUrl: 'http://localhost',
    supabaseAnonKey: 'anon',
    apiBaseUrl: 'http://localhost',
    apiTimeout: 30000,
    enableAnalytics: false,
    enableChatWidget: true,
    enableAIChatbot: true,
    businessType: 'support',
    stripePublicKey: '',
    googleAnalyticsId: '',
    openaiApiKey: 'test-key',
    appEnv: 'test',
    isDevelopment: false,
    isProduction: true,
  },
}));

import { Chatbot } from '@/lib/chatbot';

const fetchMock = vi.fn();

describe('Chatbot edge invocation', () => {
  beforeEach(() => {
    insertCalls.length = 0;
    updateCalls.length = 0;
    eqCalls.length = 0;
    fetchMock.mockReset();
    // @ts-expect-error override global fetch for tests
    global.fetch = fetchMock;
    process.env.VITE_OPENAI_API_KEY = 'test-key';
  });

  it('sends messages through the OpenAI edge endpoint when configured', async () => {
    fetchMock.mockResolvedValueOnce({
      json: async () => ({
        choices: [
          {
            message: { content: 'AI says hi' },
          },
        ],
      }),
    });

    const chatbot = new Chatbot('saas');
    await chatbot.startSession();

    const assistantMessage = await chatbot.sendMessage('Tell me something unexpected.');

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock.mock.calls[0][0]).toBe('https://api.openai.com/v1/chat/completions');

    const requestInit = fetchMock.mock.calls[0][1];
    expect(requestInit?.method).toBe('POST');
    expect(requestInit?.headers).toMatchObject({ Authorization: 'Bearer test-key' });

    expect(assistantMessage.content).toBe('AI says hi');

    const chatMessageInserts = insertCalls.filter(call => call.table === 'chat_messages');
    expect(chatMessageInserts).toHaveLength(2);
    const userPayload = chatMessageInserts[0].payload as Array<{ role: string }>;
    const assistantPayload = chatMessageInserts[1].payload as Array<{ role: string; content: string }>;
    expect(userPayload[0].role).toBe('user');
    expect(assistantPayload[0].content).toBe('AI says hi');

    const history = chatbot.getHistory();
    expect(history).toHaveLength(3);
    expect(history[2].content).toBe('AI says hi');
  });
});
