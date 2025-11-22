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

type ChatSessionAction =
  | 'start_session'
  | 'log_message'
  | 'capture_lead'
  | 'update_visitor'
  | 'close_session';

interface ChatSessionFunctionResponse {
  success: boolean;
  error?: string;
}

// Business-specific chatbot configurations
const BUSINESS_TEMPLATES = {
  ecommerce: {
    name: 'E-Commerce Assistant',
    greeting: "👋 Hi! I'm here to help you find the perfect products. How can I assist you today?",
    capabilities: [
      'Product recommendations',
      'Order tracking',
      'Shipping information',
      'Returns and refunds',
      'Payment assistance',
    ],
    quickReplies: [
      'Track my order',
      'Return policy',
      'Shipping costs',
      'Product availability',
    ],
    knowledgeBase: {
      'shipping': 'We offer free shipping on orders over $50. Standard shipping takes 3-5 business days.',
      'returns': 'We accept returns within 30 days of purchase. Items must be unused and in original packaging.',
      'payment': 'We accept all major credit cards, PayPal, and Apple Pay.',
      'tracking': 'You can track your order using the tracking number sent to your email.',
    }
  },
  saas: {
    name: 'SaaS Support Bot',
    greeting: "👋 Welcome! I'm your product assistant. How can I help you get the most out of our platform?",
    capabilities: [
      'Account setup',
      'Feature explanations',
      'Billing questions',
      'Integration help',
      'Technical support',
    ],
    quickReplies: [
      'How do I get started?',
      'Pricing plans',
      'API documentation',
      'Cancel subscription',
    ],
    knowledgeBase: {
      'pricing': 'We offer Starter ($29/mo), Professional ($99/mo), and Enterprise ($299/mo) plans.',
      'trial': 'Yes! We offer a 14-day free trial with full access to all features.',
      'cancel': 'You can cancel anytime from your account settings. No cancellation fees.',
      'support': '24/7 support via chat, email support@company.com, or phone +1-555-0123.',
    }
  },
  realestate: {
    name: 'Real Estate Assistant',
    greeting: "👋 Hi! Looking for your dream property? I'm here to help you find it!",
    capabilities: [
      'Property search',
      'Scheduling viewings',
      'Mortgage information',
      'Neighborhood details',
      'Agent contact',
    ],
    quickReplies: [
      'Available properties',
      'Schedule viewing',
      'Mortgage calculator',
      'Contact agent',
    ],
    knowledgeBase: {
      'viewing': 'I can schedule a property viewing for you. What property are you interested in?',
      'mortgage': 'We work with trusted mortgage brokers who can help you get pre-approved.',
      'commission': 'Our standard commission is 3% for sellers and we offer buyer rebates.',
      'areas': 'We cover downtown, suburbs, and surrounding areas. Which area interests you?',
    }
  },
  healthcare: {
    name: 'Healthcare Assistant',
    greeting: "👋 Hello! I'm here to help you with appointments and general inquiries. How can I assist you?",
    capabilities: [
      'Appointment scheduling',
      'Insurance questions',
      'Service information',
      'Location and hours',
      'Emergency guidance',
    ],
    quickReplies: [
      'Book appointment',
      'Insurance accepted',
      'Office hours',
      'Emergency contact',
    ],
    knowledgeBase: {
      'appointment': 'I can help you book an appointment. Which service do you need?',
      'insurance': 'We accept most major insurance plans. Please call to verify your specific plan.',
      'hours': 'We are open Monday-Friday 8am-6pm, Saturday 9am-2pm.',
      'emergency': 'For medical emergencies, please call 911 or visit the nearest ER immediately.',
    }
  },
  education: {
    name: 'Education Assistant',
    greeting: "👋 Welcome! Ready to start your learning journey? I'm here to help!",
    capabilities: [
      'Course information',
      'Enrollment assistance',
      'Pricing and scholarships',
      'Schedule information',
      'Technical support',
    ],
    quickReplies: [
      'Available courses',
      'Enrollment process',
      'Pricing',
      'Schedule',
    ],
    knowledgeBase: {
      'courses': 'We offer courses in business, technology, design, and more. What interests you?',
      'pricing': 'Course prices range from $99-$999. We also offer payment plans.',
      'enrollment': 'You can enroll online instantly. Courses start every month.',
      'certificate': 'Yes, you receive a certificate of completion for all finished courses.',
    }
  },
  hospitality: {
    name: 'Hospitality Assistant',
    greeting: "👋 Welcome! Planning your stay? I'm here to make your experience perfect!",
    capabilities: [
      'Booking assistance',
      'Room information',
      'Amenities details',
      'Local recommendations',
      'Special requests',
    ],
    quickReplies: [
      'Check availability',
      'Room types',
      'Amenities',
      'Local attractions',
    ],
    knowledgeBase: {
      'booking': 'I can help you book a room. What dates are you looking for?',
      'rooms': 'We offer Standard, Deluxe, and Suite rooms with various amenities.',
      'amenities': 'Free WiFi, pool, gym, restaurant, room service, and parking included.',
      'cancellation': 'Free cancellation up to 24 hours before check-in.',
    }
  },
  finance: {
    name: 'Financial Assistant',
    greeting: "👋 Hello! I'm here to help with your financial questions and services.",
    capabilities: [
      'Account information',
      'Service details',
      'Application process',
      'Rates and fees',
      'Appointment scheduling',
    ],
    quickReplies: [
      'Account types',
      'Interest rates',
      'Apply now',
      'Speak to advisor',
    ],
    knowledgeBase: {
      'accounts': 'We offer checking, savings, and investment accounts tailored to your needs.',
      'rates': 'Current rates: Savings 2.5% APY, CDs up to 4.5% APY. Rates subject to change.',
      'fees': 'Many accounts have no monthly fees. See our fee schedule for details.',
      'secure': 'FDIC insured up to $250,000. We use bank-level encryption.',
    }
  },
  support: {
    name: 'Support Assistant',
    greeting: "👋 Hi! I'm your support assistant. How can I help you today?",
    capabilities: [
      'General questions',
      'Technical support',
      'Account help',
      'Product information',
      'Contact routing',
    ],
    quickReplies: [
      'Get started',
      'Account help',
      'Technical issue',
      'Contact support',
    ],
    knowledgeBase: {
      'help': 'I can assist with general questions. What do you need help with?',
      'technical': 'For technical issues, please describe the problem you are experiencing.',
      'account': 'For account assistance, I can help or connect you with our team.',
      'hours': 'Our support team is available 24/7 via chat, or Monday-Friday 9am-5pm by phone.',
    }
  },
};

export interface HumanizedResponseOptions {
  baseAnswer: string;
  userMessage: string;
  businessName: string;
  capabilities: string[];
}

export const createHumanizedResponse = ({
  baseAnswer,
  userMessage,
  businessName,
  capabilities,
}: HumanizedResponseOptions): string => {
  const trimmedAnswer = baseAnswer.trim();
  const ensuredAnswer = trimmedAnswer
    ? /[.!?]$/.test(trimmedAnswer)
      ? trimmedAnswer
      : `${trimmedAnswer}.`
    : "Let me double-check that for you.";
  const hasDetails = Boolean(userMessage.trim());
  const prefix = hasDetails
    ? "Thanks for sharing those details—I've got you!"
    : `Thanks for reaching out to the ${businessName} team!`;
  const context = hasDetails ? "Here's what I can do:" : "Here's how we can help:";
  const selectedCapabilities = capabilities.filter(Boolean).slice(0, 3);
  let capabilitySnippet = "Let me know if there's anything else you need.";

  if (selectedCapabilities.length === 1) {
    capabilitySnippet = `I can also help with ${selectedCapabilities[0]}, so feel free to ask.`;
  } else if (selectedCapabilities.length === 2) {
    capabilitySnippet = `I can also help with ${selectedCapabilities[0]} and ${selectedCapabilities[1]}, so feel free to ask.`;
  } else if (selectedCapabilities.length === 3) {
    capabilitySnippet = `I can also help with ${selectedCapabilities[0]}, ${selectedCapabilities[1]}, and ${selectedCapabilities[2]}, so feel free to ask.`;
  }

  return `${prefix} ${context} ${ensuredAnswer} ${capabilitySnippet}`.replace(/\s+/g, " ").trim();
};

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

  private async dispatchSessionAction(action: ChatSessionAction, payload: Record<string, unknown>): Promise<void> {
    try {
      const { data, error } = await supabase.functions.invoke<ChatSessionFunctionResponse>('chat-session', {
        body: {
          action,
          payload,
        },
      });

      if (error) {
        throw error;
      }

      if (!data?.success) {
        throw new Error(data?.error || 'Chat session request failed');
      }
    } catch (error) {
      console.error(`[chatbot] Failed to dispatch ${action}:`, error);
      throw error;
    }
  }

  /**
   * Initialize new chat session
   */
  async startSession(): Promise<void> {
    try {
      await this.dispatchSessionAction('start_session', {
        sessionId: this.sessionId,
        businessType: this.businessType,
        startedAt: new Date().toISOString(),
      });

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
    const humanize = (answer: string) =>
      createHumanizedResponse({
        baseAnswer: answer,
        userMessage,
        businessName: this.template.name,
        capabilities: this.template.capabilities,
      });

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
      return humanize(`I can help you with: ${this.template.capabilities.join(', ')}. What would you like to know more about?`);
    }

    if (messageLower.includes('contact') || messageLower.includes('speak') || messageLower.includes('talk')) {
      return humanize(
        "I'd be happy to connect you with our team! Please provide your email address, and someone will reach out to you shortly.",
      );
    }

    if (messageLower.includes('email') && messageLower.includes('@')) {
      const emailMatch = userMessage.match(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/);
      if (emailMatch) {
        await this.captureLeadEmail(emailMatch[0]);
        return humanize(
          "Thank you! I've saved your email. Our team will contact you within 24 hours. Is there anything else I can help you with?",
        );
      }
    }

    // Use Supabase Edge Function if AI chatbot is enabled
    if (env.enableAIChatbot) {
      try {
        const aiResponse = await this.requestAIResponse(userMessage);
        return aiResponse;
      } catch (error) {
        console.error('AI response error:', error);
      }
    }

    // Default response
    return `I understand you're asking about "${userMessage}". While I'd love to help, I might need to connect you with our team for the most accurate information. Would you like me to have someone reach out to you?`;
  }

  /**
   * Request AI-generated response via Supabase Edge Function
   */
  private async requestAIResponse(userMessage: string): Promise<string> {
    const systemPrompt = `You are a helpful ${this.template.name} for a ${this.businessType} business.
Your capabilities include: ${this.template.capabilities.join(', ')}.
Be friendly, professional, and concise. If you can't answer something, offer to connect them with a human agent.`;

    const conversation = this.conversationHistory.slice(-10).map((message) => ({
      role: message.role,
      content: message.content,
    }));

    const { data, error } = await supabase.functions.invoke<{ content?: string }>(
      'generate-chat-response',
      {
        body: {
          userMessage,
          systemPrompt,
          conversation,
        },
      },
    );

    if (error) {
      const message = typeof error === 'string' ? error : error.message ?? 'Failed to generate AI response';
      throw new Error(message);
    }

    const content = typeof data?.content === 'string' ? data.content.trim() : '';
    if (!content) {
      throw new Error('AI response was empty');
    }

    return content;
  }

  /**
   * Save message to database
   */
  private async saveMessage(message: ChatMessage): Promise<void> {
    try {
      await this.dispatchSessionAction('log_message', {
        sessionId: message.session_id,
        role: message.role,
        content: message.content,
        timestamp: message.timestamp,
        metadata: message.metadata,
      });
    } catch (error) {
      console.error('Error saving message:', error);
    }
  }

  /**
   * Capture lead email from conversation
   */
  private async captureLeadEmail(email: string): Promise<void> {
    try {
      await this.dispatchSessionAction('capture_lead', {
        sessionId: this.sessionId,
        email,
        businessType: this.businessType,
        capturedAt: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Error capturing lead:', error);
    }
  }

  /**
   * Update visitor information
   */
  async updateVisitorInfo(name: string, email: string): Promise<void> {
    try {
      await this.dispatchSessionAction('update_visitor', {
        sessionId: this.sessionId,
        visitorName: name,
        visitorEmail: email,
        lastMessageAt: new Date().toISOString(),
      });

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
      await this.dispatchSessionAction('close_session', {
        sessionId: this.sessionId,
        lastMessageAt: new Date().toISOString(),
      });
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

}

export const getBusinessTemplate = (businessType: ChatbotBusinessType): ChatbotTemplate => {
  return getTemplateForBusiness(businessType);
};

export const getAvailableBusinessTypes = (): ChatbotBusinessType[] => {
  return Object.keys(chatbotTemplates) as ChatbotBusinessType[];
};
