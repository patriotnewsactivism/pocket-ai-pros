import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { env } from '@/config/env';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Bot, Send, ArrowLeft, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface BotData {
  id: string;
  name: string;
  description: string;
  status: string;
}

export default function BotChat() {
  const { botId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const [bot, setBot] = useState<BotData | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const embedParam = (searchParams.get('embed') ?? '').toLowerCase();
  const isEmbedded = embedParam === '1' || embedParam === 'true' || embedParam === 'yes';

  useEffect(() => {
    loadBot();
  }, [botId, isEmbedded]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadBot = async () => {
    if (!botId) return;

    const { data, error } = await supabase
      .from('bots')
      .select('*')
      .eq('id', botId)
      .single();

    if (error || !data) {
      toast({
        title: 'Error',
        description: 'Bot not found',
        variant: 'destructive',
      });
      if (!isEmbedded) {
        navigate('/dashboard');
      }
      return;
    }

    setBot(data);
  };

  const sendMessage = async () => {
    if (!input.trim() || !bot || isLoading) return;

    const userMessage: Message = { role: 'user', content: input };
    const messageContent = input; // Save the message before clearing input
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    let assistantContent = '';
    const updateAssistantMessage = (chunk: string) => {
      assistantContent += chunk;
      setMessages(prev => {
        const last = prev[prev.length - 1];
        if (last?.role === 'assistant') {
          return prev.map((m, i) =>
            i === prev.length - 1 ? { ...m, content: assistantContent } : m
          );
        }
        return [...prev, { role: 'assistant', content: assistantContent }];
      });
    };

    try {
      console.log('[BotChat] Sending message to bot-chat function...');
      const CHAT_URL = `${env.supabaseUrl}/functions/v1/bot-chat`;

      // Build request body - only include conversationId if it exists
      const requestBody: {
        botId: string;
        message: string;
        conversationId?: string;
      } = {
        botId: bot.id,
        message: messageContent,
      };

      if (conversationId) {
        requestBody.conversationId = conversationId;
      }

      console.log('[BotChat] Request:', {
        url: CHAT_URL,
        botId: bot.id,
        messageLength: messageContent.length,
        hasConversationId: !!conversationId,
      });

      const response = await fetch(CHAT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${env.supabaseAnonKey}`,
        },
        body: JSON.stringify(requestBody),
      });

      console.log('[BotChat] Response status:', response.status);

      if (!response.ok || !response.body) {
        if (response.status === 400) {
          // Try to get error details for 400 errors
          const errorData = await response.json().catch(() => ({ error: 'Invalid request' }));
          console.error('[BotChat] 400 Error details:', errorData);
          toast({
            title: 'Invalid Request',
            description: errorData.details?.[0]?.message || errorData.error || 'Please try again',
            variant: 'destructive',
          });
        } else if (response.status === 429) {
          toast({
            title: 'Rate Limit',
            description: 'Too many requests. Please wait a moment.',
            variant: 'destructive',
          });
        } else if (response.status === 402) {
          toast({
            title: 'Service Unavailable',
            description: 'AI quota exceeded. Please contact support.',
            variant: 'destructive',
          });
        } else {
          const errorText = await response.text().catch(() => '');
          console.error('[BotChat] Error response:', errorText);
          throw new Error('Failed to get response');
        }
        setIsLoading(false);
        return;
      }

      console.log('[BotChat] Streaming response...');

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        
        let newlineIndex: number;
        while ((newlineIndex = buffer.indexOf('\n')) !== -1) {
          let line = buffer.slice(0, newlineIndex);
          buffer = buffer.slice(newlineIndex + 1);

          if (line.endsWith('\r')) line = line.slice(0, -1);
          if (line.startsWith(':') || line.trim() === '') continue;
          if (!line.startsWith('data: ')) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === '[DONE]') break;

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (content) updateAssistantMessage(content);
          } catch {
            buffer = line + '\n' + buffer;
            break;
          }
        }
      }

      setIsLoading(false);

      // Save conversation
      if (!conversationId) {
        const { data: newConv } = await supabase
          .from('conversations')
          .insert({
            bot_id: bot.id,
            user_id: (await supabase.auth.getUser()).data.user?.id,
            messages: [...messages, userMessage, { role: 'assistant', content: assistantContent }],
          })
          .select()
          .single();
        
        if (newConv) setConversationId(newConv.id);
      } else {
        await supabase
          .from('conversations')
          .update({
            messages: [...messages, userMessage, { role: 'assistant', content: assistantContent }],
          })
          .eq('id', conversationId);
      }
    } catch (error) {
      console.error('[BotChat] Chat error:', error);
      if (error instanceof Error) {
        console.error('[BotChat] Error details:', {
          name: error.name,
          message: error.message,
          stack: error.stack,
        });
      }
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to send message',
        variant: 'destructive',
      });
      setIsLoading(false);
    }
  };

  if (!bot) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Bot className="w-16 h-16 animate-pulse text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      {!isEmbedded && (
        <header className="border-b bg-card">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')}>
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary/80 rounded-lg flex items-center justify-center">
                <Bot className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-lg font-bold">{bot.name}</h1>
                <p className="text-sm text-foreground/80 font-medium">{bot.description}</p>
              </div>
            </div>
          </div>
        </header>
      )}

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto">
        <div className="container mx-auto px-4 py-6 max-w-4xl">
          {messages.length === 0 ? (
            <Card className="text-center py-12">
              <CardHeader>
                <CardTitle>Start a Conversation</CardTitle>
                <CardDescription>
                  Ask me anything! I'm here to help.
                </CardDescription>
              </CardHeader>
            </Card>
          ) : (
            <div className="space-y-4">
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <Card
                    className={`max-w-[80%] ${
                      msg.role === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-card border-2'
                    }`}
                  >
                    <CardContent className="p-3">
                      <p className="whitespace-pre-wrap break-words text-foreground">{msg.content}</p>
                    </CardContent>
                  </Card>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <Card className="bg-muted">
                    <CardContent className="p-3">
                      <Loader2 className="w-4 h-4 animate-spin" />
                    </CardContent>
                  </Card>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
      </div>

      {/* Input Area */}
      <div className="border-t bg-card">
        <div className="container mx-auto px-4 py-4 max-w-4xl">
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
              placeholder="Type your message..."
              disabled={isLoading}
              className="flex-1"
            />
            <Button onClick={sendMessage} disabled={isLoading || !input.trim()}>
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </div>
          <p className="text-xs text-foreground/70 mt-2 text-center font-medium">
            Powered by AI • Press Enter to send
          </p>
        </div>
      </div>
    </div>
  );
}
