/**
 * AI Chatbot Component
 * Real-time chat widget with industry-specific intelligence
 * Integrated with Supabase for conversation storage and lead capture
 */

import { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send, Minimize2 } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card } from './ui/card';
import { Chatbot, ChatMessage, getBusinessTemplate } from '@/lib/chatbot';
import { env } from '@/config/env';

interface AIChatbotProps {
  businessType?: 'ecommerce' | 'saas' | 'realestate' | 'healthcare' | 'education' | 'hospitality' | 'finance' | 'support';
}

export function AIChatbot({ businessType = 'support' }: AIChatbotProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [chatbot] = useState(() => new Chatbot(businessType));
  const [hasStarted, setHasStarted] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const template = getBusinessTemplate(businessType);

  // Check if chatbot is enabled
  const isChatbotEnabled = env.isDevelopment || process.env.VITE_ENABLE_AI_CHATBOT === 'true';

  useEffect(() => {
    if (isOpen && !hasStarted) {
      initializeChat();
    }
  }, [isOpen, hasStarted]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const initializeChat = async () => {
    await chatbot.startSession();
    const greeting = chatbot.getGreeting();
    setMessages([greeting]);
    setHasStarted(true);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage = inputMessage.trim();
    setInputMessage('');
    setIsTyping(true);

    try {
      const response = await chatbot.sendMessage(userMessage);
      setMessages([...chatbot.getHistory()]);
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages(prev => [...prev, {
        session_id: chatbot.getSessionId(),
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date().toISOString(),
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleQuickReply = (reply: string) => {
    setInputMessage(reply);
    setTimeout(() => handleSendMessage(), 100);
  };

  const handleClose = async () => {
    await chatbot.closeSession();
    setIsOpen(false);
    setMessages([]);
    setHasStarted(false);
  };

  if (!isChatbotEnabled) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Chat Button */}
      {!isOpen && (
        <Button
          onClick={() => setIsOpen(true)}
          className="h-14 w-14 rounded-full shadow-lg bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 transition-all duration-300 hover:scale-110"
          aria-label="Open chat"
        >
          <MessageCircle className="h-6 w-6" />
        </Button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <Card className={`w-96 shadow-2xl transition-all duration-300 ${isMinimized ? 'h-14' : 'h-[600px]'} flex flex-col overflow-hidden`}>
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-4 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center">
                <MessageCircle className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold">{template.name}</h3>
                <p className="text-xs text-white/80">Online • Instant replies</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMinimized(!isMinimized)}
                className="text-white hover:bg-white/20 h-8 w-8 p-0"
              >
                <Minimize2 className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClose}
                className="text-white hover:bg-white/20 h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {!isMinimized && (
            <>
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-lg p-3 ${
                        message.role === 'user'
                          ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white'
                          : 'bg-white shadow-sm'
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                      <p className={`text-xs mt-1 ${message.role === 'user' ? 'text-white/70' : 'text-gray-500'}`}>
                        {new Date(message.timestamp || '').toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                ))}

                {isTyping && (
                  <div className="flex justify-start">
                    <div className="bg-white shadow-sm rounded-lg p-3">
                      <div className="flex space-x-2">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Quick Replies */}
              {messages.length <= 2 && (
                <div className="px-4 py-2 bg-white border-t flex flex-wrap gap-2">
                  {template.quickReplies.map((reply, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      onClick={() => handleQuickReply(reply)}
                      className="text-xs"
                    >
                      {reply}
                    </Button>
                  ))}
                </div>
              )}

              {/* Input */}
              <div className="p-4 bg-white border-t">
                <div className="flex space-x-2">
                  <Input
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="Type your message..."
                    className="flex-1"
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={!inputMessage.trim() || isTyping}
                    className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-xs text-gray-500 mt-2 text-center">
                  Powered by AI • Instant responses 24/7
                </p>
              </div>
            </>
          )}
        </Card>
      )}
    </div>
  );
}
