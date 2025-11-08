import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const envMock = vi.hoisted(() => ({
  enableAIChatbot: true,
  isDevelopment: false,
}));

const insertMock = vi.hoisted(() => vi.fn().mockResolvedValue({ data: null, error: null }));
const fromMock = vi.hoisted(() => vi.fn(() => ({ insert: insertMock }))); 
const invokeMock = vi.hoisted(() => vi.fn());

vi.mock('@/config/env', () => ({
  env: envMock,
}));

vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: fromMock,
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
    insertMock.mockClear();
    fromMock.mockClear();
    invokeMock.mockReset();
    envMock.enableAIChatbot = true;
  });

  afterEach(() => {
    consoleErrorMock.mockRestore();
  });

  it('uses the Supabase Edge Function to generate responses when enabled', async () => {
    invokeMock.mockResolvedValueOnce({ data: { content: 'AI generated response.' }, error: null });

    const chatbot = new Chatbot('saas');
    const response = await chatbot.sendMessage('Tell me something unique.');

    expect(invokeMock).toHaveBeenCalledWith(
      'generate-chat-response',
      expect.objectContaining({
        body: expect.objectContaining({ userMessage: 'Tell me something unique.' }),
      }),
    );
    expect(response.content).toBe('AI generated response.');
  });

  it('falls back to the default response when the Edge Function returns an error', async () => {
    invokeMock.mockResolvedValueOnce({ data: null, error: { message: 'Network error' } });

    const chatbot = new Chatbot('saas');
    const response = await chatbot.sendMessage('Discuss galaxies.');

    expect(response.content).toContain('Discuss galaxies.');
  });

  it('skips invoking the Edge Function when the chatbot is disabled', async () => {
    envMock.enableAIChatbot = false;

    const chatbot = new Chatbot('saas');
    const response = await chatbot.sendMessage('What is the roadmap?');

    expect(invokeMock).not.toHaveBeenCalled();
    expect(response.content).toContain('What is the roadmap?');
  });
});
