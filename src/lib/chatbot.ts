/**
 * AI Chatbot System with Supabase Integration
 * Provides intelligent, industry-specific customer support
 */

import { supabase } from './supabase';
import { env } from '@/config/env';
import { BUSINESS_TEMPLATES, type BusinessTemplate } from '@/templates/business-templates';

type ChatbotBusinessType = keyof typeof BUSINESS_TEMPLATES;

interface ChatbotTemplate {
  name: string;
  greeting: string;
  quickReplies: string[];
  capabilities: string[];
  knowledgeBase: Record<string, string>;
  persona: string;
  tone: string;
}

const DEFAULT_BUSINESS_TYPE: ChatbotBusinessType = 'support';

const chatbotTemplates = Object.fromEntries(
  Object.entries(BUSINESS_TEMPLATES).map(([key, template]) => [
    key,
    createChatbotTemplate(template),
  ]),
) as Record<ChatbotBusinessType, ChatbotTemplate>;

function createChatbotTemplate(template: BusinessTemplate): ChatbotTemplate {
  return {
    name: template.name,
    greeting: template.chatbot.greeting,
    quickReplies: template.chatbot.quickReplies,
    capabilities: template.chatbot.capabilities,
    knowledgeBase: template.chatbot.knowledgeBase,
    persona: template.chatbot.persona,
    tone: template.chatbot.tone,
  };
}

const getTemplateForBusiness = (businessType: ChatbotBusinessType): ChatbotTemplate => {
  return chatbotTemplates[businessType] ?? chatbotTemplates[DEFAULT_BUSINESS_TYPE];
};

// Chatbot message types
export interface ChatMessage {
  id?: number;
  session_id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp?: string;
  metadata?: Record<string, any>;
}

export interface ChatSession {
  session_id: string;
  business_type: string;
  visitor_name?: string;
  visitor_email?: string;
  started_at: string;
  last_message_at?: string;
  status: 'active' | 'closed' | 'transferred';
}

/**
 * Chatbot class for handling conversations
 */
export class Chatbot {
  private sessionId: string;
  private businessType: ChatbotBusinessType;
  private template: ChatbotTemplate;
  private conversationHistory: ChatMessage[] = [];

  constructor(businessType: ChatbotBusinessType = DEFAULT_BUSINESS_TYPE) {
    this.sessionId = this.generateSessionId();
    this.businessType = businessType;
    this.template = getTemplateForBusiness(businessType);
  }

  /**
   * Generate unique session ID
   */
  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Initialize new chat session
   */
  async startSession(): Promise<void> {
    try {
      await supabase.from('chat_sessions').insert([
        {
          session_id: this.sessionId,
          business_type: this.businessType,
          started_at: new Date().toISOString(),
          status: 'active',
        },
      ]);

      // Add greeting message
      this.conversationHistory.push({
        session_id: this.sessionId,
        role: 'assistant',
        content: this.template.greeting,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Error starting session:', error);
    }
  }

  /**
   * Get chatbot greeting message
   */
  getGreeting(): ChatMessage {
    return {
      session_id: this.sessionId,
      role: 'assistant',
      content: this.template.greeting,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Get quick reply suggestions
   */
  getQuickReplies(): string[] {
    return this.template.quickReplies;
  }

  /**
   * Process user message and generate response
   */
  async sendMessage(userMessage: string): Promise<ChatMessage> {
    const userMsg: ChatMessage = {
      session_id: this.sessionId,
      role: 'user',
      content: userMessage,
      timestamp: new Date().toISOString(),
    };

    this.conversationHistory.push(userMsg);
    await this.saveMessage(userMsg);

    const response = await this.generateResponse(userMessage);

    const assistantMsg: ChatMessage = {
      session_id: this.sessionId,
      role: 'assistant',
      content: response,
      timestamp: new Date().toISOString(),
    };

    this.conversationHistory.push(assistantMsg);
    await this.saveMessage(assistantMsg);

    return assistantMsg;
  }

  /**
   * Generate intelligent response based on user input
   */
  private async generateResponse(userMessage: string): Promise<string> {
    const messageLower = userMessage.toLowerCase();

    // Handle pricing questions first with dynamic pricing
    if (messageLower.includes('price') || messageLower.includes('cost') || messageLower.includes('pricing')) {
      // Use actual template pricing instead of hardcoded knowledge base values
      const businessTemplate = BUSINESS_TEMPLATES[this.businessType];
      if (businessTemplate) {
        const pricingInfo = `We offer ${Object.entries(businessTemplate.pricing)
          .map(([tier, info]) => `${tier.charAt(0).toUpperCase() + tier.slice(1)} ($${info.price}/mo)`)
          .join(', ')} plans.`;
        return pricingInfo;
      }
      return (
        this.template.knowledgeBase['pricing'] ||
        "I'd be happy to discuss our pricing with you. Would you like me to provide details or connect you with our sales team?"
      );
    }

    // Check knowledge base for relevant answers (excluding pricing which is handled above)
    for (const [key, answer] of Object.entries(this.template.knowledgeBase)) {
      if (key !== 'pricing' && messageLower.includes(key)) {
        return answer;
      }
    }

    if (messageLower.includes('help') || messageLower.includes('support') || messageLower.includes('assist')) {
      return `I can help you with: ${this.template.capabilities.join(', ')}. What would you like to know more about?`;
    }

    if (messageLower.includes('contact') || messageLower.includes('speak') || messageLower.includes('talk')) {
      return "I'd be happy to connect you with our team! Please provide your email address, and someone will reach out to you shortly.";
    }

    if (messageLower.includes('email') && messageLower.includes('@')) {
      const emailMatch = userMessage.match(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/);
      if (emailMatch) {
        await this.captureLeadEmail(emailMatch[0]);
        return 'Thank you! I\'ve saved your email. Our team will contact you within 24 hours. Is there anything else I can help you with?';
      }
    }

    if (env.enableAIChatbot) {
      try {
        const { data, error } = await supabase.functions.invoke('generate-chat-response', {
          body: {
            message: userMessage,
            businessType: this.businessType,
            history: this.conversationHistory.slice(-10).map(message => ({
              role: message.role,
              content: message.content,
            })),
            template: {
              name: this.template.name,
              capabilities: this.template.capabilities,
              knowledgeBase: this.template.knowledgeBase,
              greeting: this.template.greeting,
              persona: this.template.persona,
              tone: this.template.tone,
            },
          },
        });

        if (error) {
          throw new Error(error.message || 'Failed to generate AI response');
        }

        if (data?.response) {
          return data.response;
        }
      } catch (error) {
        console.error('AI response error:', error);
      }
    }

    return `${this.template.persona} here. I want to make sure I give you the best answer, so I'll have a teammate follow up about "${userMessage}" right away. Can I grab your preferred contact info?`;
  }

  /**
   * Save message to database
   */
  private async saveMessage(message: ChatMessage): Promise<void> {
    try {
      await supabase.from('chat_messages').insert([
        {
          session_id: message.session_id,
          role: message.role,
          content: message.content,
          timestamp: message.timestamp,
          metadata: message.metadata,
        },
      ]);
    } catch (error) {
      console.error('Error saving message:', error);
    }
  }

  /**
   * Capture lead email from conversation
   */
  private async captureLeadEmail(email: string): Promise<void> {
    try {
      await supabase.from('chat_leads').insert([
        {
          session_id: this.sessionId,
          email,
          business_type: this.businessType,
          captured_at: new Date().toISOString(),
        },
      ]);
    } catch (error) {
      console.error('Error capturing lead:', error);
    }
  }

  /**
   * Update visitor information
   */
  async updateVisitorInfo(name: string, email: string): Promise<void> {
    try {
      await supabase
        .from('chat_sessions')
        .update({
          visitor_name: name,
          visitor_email: email,
        })
        .eq('session_id', this.sessionId);

      await this.captureLeadEmail(email);
    } catch (error) {
      console.error('Error updating visitor info:', error);
    }
  }

  /**
   * Close chat session
   */
  async closeSession(): Promise<void> {
    try {
      await supabase
        .from('chat_sessions')
        .update({
          status: 'closed',
          last_message_at: new Date().toISOString(),
        })
        .eq('session_id', this.sessionId);
    } catch (error) {
      console.error('Error closing session:', error);
    }
  }

  /**
   * Get conversation history
   */
  getHistory(): ChatMessage[] {
    return this.conversationHistory;
  }

  /**
   * Get conversation history (alias for getHistory)
   */
  getConversationHistory(): ChatMessage[] {
    return this.conversationHistory;
  }

  /**
   * Get session ID
   */
  getSessionId(): string {
    return this.sessionId;
  }

  /**
   * Get current template
   */
  getTemplate() {
    return this.template;
  }

  /**
   * Get quick replies from template
   */
  getQuickReplies(): string[] {
    return this.template.quickReplies;
  }
}

export const getBusinessTemplate = (businessType: ChatbotBusinessType): ChatbotTemplate => {
  return getTemplateForBusiness(businessType);
};

export const getAvailableBusinessTypes = (): ChatbotBusinessType[] => {
  return Object.keys(chatbotTemplates) as ChatbotBusinessType[];
};
