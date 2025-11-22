import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Index, { isChatbotFeatureEnabled } from '../Index';
import { env } from '@/config/env';

const renderWithProviders = (ui: React.ReactElement) => {
  const queryClient = new QueryClient();

  return render(
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>{ui}</BrowserRouter>
    </QueryClientProvider>
  );
};

describe('isChatbotFeatureEnabled', () => {
  it('returns true only when both feature flags are enabled', () => {
    expect(isChatbotFeatureEnabled({ enableChatWidget: true, enableAIChatbot: true } as typeof env)).toBe(true);
    expect(isChatbotFeatureEnabled({ enableChatWidget: true, enableAIChatbot: false } as typeof env)).toBe(false);
    expect(isChatbotFeatureEnabled({ enableChatWidget: false, enableAIChatbot: true } as typeof env)).toBe(false);
  });
});

describe('Index page', () => {
  const originalFlags = {
    enableChatWidget: env.enableChatWidget,
    enableAIChatbot: env.enableAIChatbot,
  };

  beforeEach(() => {
    cleanup();
    (env as Record<string, boolean>).enableChatWidget = false;
    (env as Record<string, boolean>).enableAIChatbot = false;
  });

  afterEach(() => {
    (env as Record<string, boolean>).enableChatWidget = originalFlags.enableChatWidget;
    (env as Record<string, boolean>).enableAIChatbot = originalFlags.enableAIChatbot;
  });

  it('renders a placeholder when the chatbot is disabled', () => {
    renderWithProviders(<Index />);

    expect(
      screen.getByText(/chat assistant is currently unavailable/i)
    ).toBeInTheDocument();
    expect(screen.queryByTestId('ai-chatbot')).not.toBeInTheDocument();
  });
});
