import { beforeEach, describe, expect, it, vi } from 'vitest';

const insertSpy = vi.fn(async () => ({ data: null, error: null }));
const eqSpy = vi.fn(async () => ({ data: null, error: null }));
const fromSpy = vi.fn((table: string) => ({
  insert: (payload: unknown) => insertSpy({ table, payload }),
  update: (payload: unknown) => ({
    eq: (column: string, value: unknown) => eqSpy({ table, payload, column, value }),
  }),
}));
const invokeSpy = vi.fn();

vi.mock('@/config/env', () => ({
  env: {
    enableAIChatbot: true,
  },
}));

vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: (table: string) => fromSpy(table),
    functions: {
      invoke: (name: string, options?: unknown) => invokeSpy(name, options),
    },
  },
}));

import { Chatbot } from '../chatbot';

const getInvokeBody = (): Record<string, unknown> | undefined => {
  const call = invokeSpy.mock.calls[0] as
    | [string, { body?: Record<string, unknown> }]
    | undefined;

  return call?.[1]?.body;
};

describe('Chatbot', () => {
  beforeEach(() => {
    insertSpy.mockClear();
    eqSpy.mockClear();
    fromSpy.mockClear();
    invokeSpy.mockReset();
  });

  it('returns AI response when the edge function succeeds', async () => {
    invokeSpy.mockResolvedValue({ data: { response: 'Here is the AI response.' }, error: null });

    const chatbot = new Chatbot('support');
    await chatbot.startSession();
    const assistantMessage = await chatbot.sendMessage('Tell me about your platform');

    expect(invokeSpy).toHaveBeenCalledTimes(1);
    expect(invokeSpy).toHaveBeenCalledWith(
      'generate-chat-response',
      expect.objectContaining({
        body: expect.objectContaining({
          message: 'Tell me about your platform',
          businessType: 'support',
        }),
      }),
    );

    const body = getInvokeBody();
    const history = (body?.history as Array<{ role: string; content: string }>) ?? [];
    expect(Array.isArray(history)).toBe(true);
    expect(history.at(-1)).toEqual({ role: 'user', content: 'Tell me about your platform' });

    expect(assistantMessage.content).toBe('Here is the AI response.');
    expect(assistantMessage.role).toBe('assistant');
    expect(chatbot.getHistory().at(-1)?.content).toBe('Here is the AI response.');
  });

  it('falls back to the default message when the edge function returns an error', async () => {
    invokeSpy.mockResolvedValue({ data: null, error: { message: 'Missing OpenAI key' } });

    const chatbot = new Chatbot('support');
    await chatbot.startSession();
    const assistantMessage = await chatbot.sendMessage('Do you integrate with CRMs?');

    expect(invokeSpy).toHaveBeenCalledTimes(1);
    expect(assistantMessage.content).toContain('I understand you\'re asking about "Do you integrate with CRMs?"');
    expect(assistantMessage.role).toBe('assistant');
  });
});
