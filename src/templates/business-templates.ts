/**
 * Business Templates Configuration
 * Pre-configured templates for different industries
 * Each template includes branding, content, and chatbot configuration
 */

export interface BusinessTemplate {
  id: string;
  name: string;
  description: string;
  industry: string;
  
  // Branding
  brandColors: {
    primary: string;
    secondary: string;
    accent: string;
  };
  
  // Hero Section
  hero: {
    headline: string;
    subheadline: string;
    cta: string;
  };
  
  // Features
  features: Array<{
    title: string;
    description: string;
    icon: string;
  }>;
  
  // Pricing
  pricing: {
    starter: { price: number; features: string[] };
    professional: { price: number; features: string[] };
    enterprise: { price: number; features: string[] };
  };
  
  // Use Cases
  useCases: Array<{
    title: string;
    description: string;
  }>;
  
  // FAQ
  faqs: Array<{
    question: string;
    answer: string;
  }>;
  
  // Chatbot Configuration
  chatbot: {
    enabled: boolean;
    greeting: string;
    quickReplies: string[];
  };
}

export const BUSINESS_TEMPLATES: Record<string, BusinessTemplate> = {
  ecommerce: {
    id: 'ecommerce',
    name: 'E-Commerce Store',
    description: 'Complete AI chatbot solution for online retail businesses',
    industry: 'Retail & E-Commerce',
    
    brandColors: {
      primary: '#8B5CF6',
      secondary: '#EC4899',
      accent: '#F59E0B',
    },
    
    hero: {
      headline: '24/7 AI Shopping Assistant for Your Store',
      subheadline: 'Boost sales by 40% with intelligent product recommendations, instant support, and automated order tracking',
      cta: 'Start Free Trial',
    },
    
    features: [
      {
        title: 'Product Recommendations',
        description: 'AI-powered suggestions based on customer preferences and browsing history',
        icon: 'ShoppingBag',
      },
      {
        title: 'Order Tracking',
        description: 'Instant order status updates and shipping information',
        icon: 'Package',
      },
      {
        title: 'Cart Recovery',
        description: 'Automated reminders for abandoned carts with personalized offers',
        icon: 'ShoppingCart',
      },
      {
        title: 'Returns & Refunds',
        description: 'Streamlined return process with instant policy information',
        icon: 'RefreshCw',
      },
    ],
    
    pricing: {
      starter: {
        price: 49,
        features: [
          '1,000 conversations/month',
          'Product recommendations',
          'Order tracking',
          'Basic analytics',
          'Email support',
        ],
      },
      professional: {
        price: 149,
        features: [
          '10,000 conversations/month',
          'Advanced recommendations',
          'Cart recovery',
          'Multi-language support',
          'Priority support',
          'Custom branding',
        ],
      },
      enterprise: {
        price: 399,
        features: [
          'Unlimited conversations',
          'Dedicated account manager',
          'Custom integrations',
          'White-label solution',
          'Advanced analytics',
          '24/7 phone support',
        ],
      },
    },
    
    useCases: [
      {
        title: 'Fashion Retailer',
        description: 'Help customers find the perfect outfit with style recommendations and size guidance',
      },
      {
        title: 'Electronics Store',
        description: 'Assist with product comparisons, technical specifications, and warranty information',
      },
      {
        title: 'Home Goods',
        description: 'Provide room design suggestions and coordinate product selections',
      },
    ],
    
    faqs: [
      {
        question: 'How does the chatbot integrate with my store?',
        answer: 'Our chatbot seamlessly integrates with Shopify, WooCommerce, Magento, and custom platforms via API.',
      },
      {
        question: 'Can it handle multiple languages?',
        answer: 'Yes! The Professional and Enterprise plans support 50+ languages with automatic detection.',
      },
      {
        question: 'What about returns and refunds?',
        answer: 'The chatbot can handle return requests, provide policy information, and initiate the return process automatically.',
      },
    ],
    
    chatbot: {
      enabled: true,
      greeting: "👋 Hi! I'm here to help you find the perfect products. How can I assist you today?",
      quickReplies: ['Track my order', 'Return policy', 'Product recommendations', 'Shipping info'],
    },
  },

  saas: {
    id: 'saas',
    name: 'SaaS Platform',
    description: 'Intelligent chatbot for software-as-a-service companies',
    industry: 'Software & Technology',
    
    brandColors: {
      primary: '#3B82F6',
      secondary: '#8B5CF6',
      accent: '#10B981',
    },
    
    hero: {
      headline: 'AI-Powered Customer Success for SaaS',
      subheadline: 'Reduce support tickets by 60% with intelligent onboarding, feature guidance, and proactive assistance',
      cta: 'Get Started Free',
    },
    
    features: [
      {
        title: 'Smart Onboarding',
        description: 'Guide new users through setup with personalized walkthroughs',
        icon: 'Rocket',
      },
      {
        title: 'Feature Discovery',
        description: 'Help users unlock your platform\'s full potential',
        icon: 'Zap',
      },
      {
        title: 'Billing Support',
        description: 'Handle subscription questions, upgrades, and billing issues',
        icon: 'CreditCard',
      },
      {
        title: 'API Documentation',
        description: 'Instant answers from your API docs and developer resources',
        icon: 'Code',
      },
    ],
    
    pricing: {
      starter: {
        price: 99,
        features: [
          '5,000 conversations/month',
          'Smart onboarding',
          'Knowledge base integration',
          'Basic analytics',
          'Email support',
        ],
      },
      professional: {
        price: 299,
        features: [
          '25,000 conversations/month',
          'Advanced analytics',
          'A/B testing',
          'Custom workflows',
          'API access',
          'Priority support',
        ],
      },
      enterprise: {
        price: 799,
        features: [
          'Unlimited conversations',
          'White-label solution',
          'Custom AI training',
          'Dedicated success manager',
          'SLA guarantee',
          '24/7 support',
        ],
      },
    },
    
    useCases: [
      {
        title: 'Project Management Tool',
        description: 'Guide users through task creation, team collaboration, and workflow optimization',
      },
      {
        title: 'Analytics Platform',
        description: 'Help users create reports, interpret data, and set up dashboards',
      },
      {
        title: 'Marketing Automation',
        description: 'Assist with campaign setup, segmentation, and performance tracking',
      },
    ],
    
    faqs: [
      {
        question: 'How does the chatbot learn about our product?',
        answer: 'We train the AI on your documentation, help articles, and common support queries to provide accurate answers.',
      },
      {
        question: 'Can it integrate with our existing tools?',
        answer: 'Yes! We integrate with Intercom, Zendesk, Slack, and most popular support platforms.',
      },
      {
        question: 'What about complex technical questions?',
        answer: 'The chatbot handles common queries instantly and routes complex issues to your team with full context.',
      },
    ],
    
    chatbot: {
      enabled: true,
      greeting: "👋 Welcome! I'm your product assistant. How can I help you get the most out of our platform?",
      quickReplies: ['Getting started', 'Pricing & billing', 'API docs', 'Feature request'],
    },
  },

  realestate: {
    id: 'realestate',
    name: 'Real Estate',
    description: 'AI assistant for real estate agencies and property listings',
    industry: 'Real Estate',
    
    brandColors: {
      primary: '#059669',
      secondary: '#0891B2',
      accent: '#F59E0B',
    },
    
    hero: {
      headline: 'Your AI Real Estate Assistant',
      subheadline: 'Generate 3x more qualified leads with 24/7 property search, instant viewings, and automated follow-ups',
      cta: 'Book Demo',
    },
    
    features: [
      {
        title: 'Property Search',
        description: 'Help clients find their dream home with intelligent search',
        icon: 'Home',
      },
      {
        title: 'Virtual Viewings',
        description: 'Schedule and manage property viewings automatically',
        icon: 'Calendar',
      },
      {
        title: 'Mortgage Calculator',
        description: 'Provide instant mortgage estimates and affordability checks',
        icon: 'Calculator',
      },
      {
        title: 'Lead Qualification',
        description: 'Qualify prospects before routing to agents',
        icon: 'UserCheck',
      },
    ],
    
    pricing: {
      starter: {
        price: 79,
        features: [
          '2,000 conversations/month',
          'Property search assistance',
          'Viewing scheduling',
          'Basic CRM integration',
          'Email support',
        ],
      },
      professional: {
        price: 199,
        features: [
          '10,000 conversations/month',
          'Advanced lead qualification',
          'Mortgage calculator',
          'Multi-agent support',
          'SMS notifications',
          'Priority support',
        ],
      },
      enterprise: {
        price: 499,
        features: [
          'Unlimited conversations',
          'Custom integrations',
          'White-label solution',
          'Multiple locations',
          'Dedicated support',
          'Performance analytics',
        ],
      },
    },
    
    useCases: [
      {
        title: 'Residential Agency',
        description: 'Help homebuyers find properties and schedule viewings instantly',
      },
      {
        title: 'Commercial Real Estate',
        description: 'Assist businesses with property searches and lease inquiries',
      },
      {
        title: 'Property Management',
        description: 'Handle tenant inquiries, maintenance requests, and lease renewals',
      },
    ],
    
    faqs: [
      {
        question: 'How does the chatbot access property listings?',
        answer: 'It integrates with your MLS, website, or property management system via API for real-time data.',
      },
      {
        question: 'Can it schedule viewings with agents?',
        answer: 'Yes! It syncs with agent calendars and sends confirmation emails automatically.',
      },
      {
        question: 'What about lead qualification?',
        answer: 'The AI qualifies leads based on budget, location preferences, and timeline before routing to agents.',
      },
    ],
    
    chatbot: {
      enabled: true,
      greeting: "👋 Hi! Looking for your dream property? I'm here to help you find it!",
      quickReplies: ['Search properties', 'Schedule viewing', 'Mortgage info', 'Contact agent'],
    },
  },

  healthcare: {
    id: 'healthcare',
    name: 'Healthcare',
    description: 'HIPAA-compliant chatbot for medical practices and clinics',
    industry: 'Healthcare & Medical',
    
    brandColors: {
      primary: '#0EA5E9',
      secondary: '#06B6D4',
      accent: '#10B981',
    },
    
    hero: {
      headline: 'HIPAA-Compliant AI Healthcare Assistant',
      subheadline: 'Reduce no-shows by 35% with automated appointment scheduling, reminders, and patient support',
      cta: 'Schedule Consultation',
    },
    
    features: [
      {
        title: 'Appointment Scheduling',
        description: '24/7 booking with automatic calendar synchronization',
        icon: 'Calendar',
      },
      {
        title: 'Symptom Checker',
        description: 'Preliminary assessment and triage guidance',
        icon: 'Activity',
      },
      {
        title: 'Insurance Verification',
        description: 'Instant insurance eligibility checks',
        icon: 'Shield',
      },
      {
        title: 'Patient Portal',
        description: 'Secure access to records and test results',
        icon: 'FileText',
      },
    ],
    
    pricing: {
      starter: {
        price: 149,
        features: [
          '3,000 conversations/month',
          'Appointment scheduling',
          'HIPAA compliance',
          'Basic patient portal',
          'Email support',
        ],
      },
      professional: {
        price: 399,
        features: [
          '15,000 conversations/month',
          'Insurance verification',
          'Symptom checker',
          'Automated reminders',
          'EHR integration',
          'Priority support',
        ],
      },
      enterprise: {
        price: 999,
        features: [
          'Unlimited conversations',
          'Multi-location support',
          'Custom integrations',
          'Dedicated compliance officer',
          'Advanced analytics',
          '24/7 support',
        ],
      },
    },
    
    useCases: [
      {
        title: 'Family Practice',
        description: 'Manage appointments, answer common health questions, and reduce admin workload',
      },
      {
        title: 'Dental Clinic',
        description: 'Schedule cleanings, send reminders, and answer billing questions',
      },
      {
        title: 'Mental Health',
        description: 'Provide crisis resources, schedule therapy sessions, and send wellness check-ins',
      },
    ],
    
    faqs: [
      {
        question: 'Is the chatbot HIPAA compliant?',
        answer: 'Yes! All conversations are encrypted and stored securely in HIPAA-compliant infrastructure.',
      },
      {
        question: 'Can it integrate with our EHR system?',
        answer: 'Yes, we integrate with major EHR systems including Epic, Cerner, and Athenahealth.',
      },
      {
        question: 'What about emergency situations?',
        answer: 'The chatbot is programmed to recognize emergencies and immediately provide 911 guidance.',
      },
    ],
    
    chatbot: {
      enabled: true,
      greeting: "👋 Hello! I'm here to help you with appointments and general inquiries. How can I assist you?",
      quickReplies: ['Book appointment', 'Insurance info', 'Office hours', 'Test results'],
    },
  },

  education: {
    id: 'education',
    name: 'Education',
    description: 'AI assistant for online courses and educational institutions',
    industry: 'Education & E-Learning',
    
    brandColors: {
      primary: '#7C3AED',
      secondary: '#EC4899',
      accent: '#F59E0B',
    },
    
    hero: {
      headline: 'AI-Powered Learning Assistant',
      subheadline: 'Increase course completion by 45% with personalized guidance, instant answers, and 24/7 support',
      cta: 'Start Learning',
    },
    
    features: [
      {
        title: 'Course Recommendations',
        description: 'Personalized course suggestions based on goals and interests',
        icon: 'BookOpen',
      },
      {
        title: 'Assignment Help',
        description: 'Guidance on coursework without giving away answers',
        icon: 'HelpCircle',
      },
      {
        title: 'Study Scheduling',
        description: 'Create personalized study plans and reminders',
        icon: 'Calendar',
      },
      {
        title: 'Progress Tracking',
        description: 'Monitor learning progress and suggest improvements',
        icon: 'TrendingUp',
      },
    ],
    
    pricing: {
      starter: {
        price: 89,
        features: [
          '5,000 conversations/month',
          'Course recommendations',
          'Basic analytics',
          'Student portal access',
          'Email support',
        ],
      },
      professional: {
        price: 249,
        features: [
          '25,000 conversations/month',
          'Assignment guidance',
          'Study scheduling',
          'Grade tracking',
          'LMS integration',
          'Priority support',
        ],
      },
      enterprise: {
        price: 699,
        features: [
          'Unlimited conversations',
          'Multi-course support',
          'Custom AI training',
          'White-label solution',
          'Advanced analytics',
          'Dedicated support',
        ],
      },
    },
    
    useCases: [
      {
        title: 'Online Course Platform',
        description: 'Help students navigate courses, answer questions, and stay motivated',
      },
      {
        title: 'University',
        description: 'Assist with enrollment, course selection, and campus resources',
      },
      {
        title: 'Corporate Training',
        description: 'Guide employees through training programs and track completion',
      },
    ],
    
    faqs: [
      {
        question: 'Can it help with specific subjects?',
        answer: 'Yes! The AI can be trained on your course content to provide subject-specific assistance.',
      },
      {
        question: 'Does it integrate with learning management systems?',
        answer: 'Yes, we integrate with Canvas, Moodle, Blackboard, and other popular LMS platforms.',
      },
      {
        question: 'Will it do students\' homework for them?',
        answer: 'No, it\'s designed to guide learning, not provide direct answers to assignments.',
      },
    ],
    
    chatbot: {
      enabled: true,
      greeting: "👋 Welcome! Ready to start your learning journey? I'm here to help!",
      quickReplies: ['Browse courses', 'Enrollment help', 'Technical support', 'Study tips'],
    },
  },

  hospitality: {
    id: 'hospitality',
    name: 'Hospitality',
    description: 'AI concierge for hotels, restaurants, and travel',
    industry: 'Hospitality & Tourism',
    
    brandColors: {
      primary: '#DC2626',
      secondary: '#F59E0B',
      accent: '#10B981',
    },
    
    hero: {
      headline: '24/7 AI Concierge for Your Guests',
      subheadline: 'Boost bookings by 50% with instant reservations, personalized recommendations, and exceptional service',
      cta: 'See Demo',
    },
    
    features: [
      {
        title: 'Instant Booking',
        description: '24/7 reservations with real-time availability',
        icon: 'Calendar',
      },
      {
        title: 'Concierge Service',
        description: 'Local recommendations and activity booking',
        icon: 'MapPin',
      },
      {
        title: 'Room Service',
        description: 'Order food, request amenities, report issues',
        icon: 'Coffee',
      },
      {
        title: 'Guest Preferences',
        description: 'Remember preferences for personalized experiences',
        icon: 'Heart',
      },
    ],
    
    pricing: {
      starter: {
        price: 129,
        features: [
          '3,000 conversations/month',
          'Booking management',
          'Basic recommendations',
          'Guest messaging',
          'Email support',
        ],
      },
      professional: {
        price: 349,
        features: [
          '15,000 conversations/month',
          'Advanced concierge',
          'Room service ordering',
          'Multi-language support',
          'PMS integration',
          'Priority support',
        ],
      },
      enterprise: {
        price: 899,
        features: [
          'Unlimited conversations',
          'Multi-property support',
          'Custom integrations',
          'White-label solution',
          'Loyalty program',
          '24/7 support',
        ],
      },
    },
    
    useCases: [
      {
        title: 'Hotel',
        description: 'Handle bookings, room service, and guest requests automatically',
      },
      {
        title: 'Restaurant',
        description: 'Manage reservations, answer menu questions, and process orders',
      },
      {
        title: 'Tour Operator',
        description: 'Book tours, provide itineraries, and answer travel questions',
      },
    ],
    
    faqs: [
      {
        question: 'Can guests use it in multiple languages?',
        answer: 'Yes! The chatbot supports 50+ languages with automatic detection.',
      },
      {
        question: 'Does it integrate with our property management system?',
        answer: 'Yes, we integrate with Opera, Mews, Cloudbeds, and other major PMS platforms.',
      },
      {
        question: 'Can it handle room service orders?',
        answer: 'Absolutely! Orders go directly to your POS system for fulfillment.',
      },
    ],
    
    chatbot: {
      enabled: true,
      greeting: "👋 Welcome! Planning your stay? I'm here to make your experience perfect!",
      quickReplies: ['Make reservation', 'Room service', 'Local recommendations', 'Amenities'],
    },
  },

  finance: {
    id: 'finance',
    name: 'Financial Services',
    description: 'Secure AI assistant for banks and financial institutions',
    industry: 'Finance & Banking',
    
    brandColors: {
      primary: '#1E40AF',
      secondary: '#059669',
      accent: '#F59E0B',
    },
    
    hero: {
      headline: 'Secure AI Financial Assistant',
      subheadline: 'Reduce support costs by 70% while providing 24/7 account assistance, financial guidance, and fraud prevention',
      cta: 'Request Demo',
    },
    
    features: [
      {
        title: 'Account Management',
        description: 'Balance inquiries, transaction history, and account updates',
        icon: 'Wallet',
      },
      {
        title: 'Financial Advice',
        description: 'Personalized recommendations and financial planning',
        icon: 'TrendingUp',
      },
      {
        title: 'Fraud Detection',
        description: 'Real-time fraud alerts and prevention',
        icon: 'Shield',
      },
      {
        title: 'Loan Applications',
        description: 'Streamlined application process with instant pre-qualification',
        icon: 'FileText',
      },
    ],
    
    pricing: {
      starter: {
        price: 299,
        features: [
          '10,000 conversations/month',
          'Account inquiries',
          'Transaction history',
          'Bank-level security',
          'Email support',
        ],
      },
      professional: {
        price: 799,
        features: [
          '50,000 conversations/month',
          'Financial advice',
          'Fraud detection',
          'Loan applications',
          'Core banking integration',
          'Priority support',
        ],
      },
      enterprise: {
        price: 1999,
        features: [
          'Unlimited conversations',
          'Multi-branch support',
          'Custom compliance',
          'Dedicated team',
          'SLA guarantee',
          '24/7 support',
        ],
      },
    },
    
    useCases: [
      {
        title: 'Retail Bank',
        description: 'Handle account inquiries, transfers, and service requests automatically',
      },
      {
        title: 'Credit Union',
        description: 'Provide personalized service and community-focused guidance',
      },
      {
        title: 'Investment Firm',
        description: 'Assist with portfolio inquiries and market information',
      },
    ],
    
    faqs: [
      {
        question: 'How secure is the chatbot?',
        answer: 'We use bank-level encryption, multi-factor authentication, and SOC 2 Type II compliance.',
      },
      {
        question: 'Can it access customer accounts?',
        answer: 'Only with proper authentication and authorization, with full audit trails.',
      },
      {
        question: 'What about regulatory compliance?',
        answer: 'We ensure compliance with all financial regulations including PCI DSS, GLBA, and regional requirements.',
      },
    ],
    
    chatbot: {
      enabled: true,
      greeting: "👋 Hello! I'm here to help with your financial questions and services.",
      quickReplies: ['Check balance', 'Transfer funds', 'Apply for loan', 'Speak to advisor'],
    },
  },

  support: {
    id: 'support',
    name: 'Customer Support',
    description: 'Universal AI support assistant for any business',
    industry: 'Customer Support',
    
    brandColors: {
      primary: '#6366F1',
      secondary: '#8B5CF6',
      accent: '#EC4899',
    },
    
    hero: {
      headline: 'AI-Powered Customer Support',
      subheadline: 'Resolve 80% of customer queries instantly with intelligent automation and seamless human handoff',
      cta: 'Try It Free',
    },
    
    features: [
      {
        title: 'Instant Answers',
        description: '24/7 responses to common questions from your knowledge base',
        icon: 'MessageSquare',
      },
      {
        title: 'Ticket Routing',
        description: 'Intelligent escalation to the right team member',
        icon: 'Users',
      },
      {
        title: 'Multi-Channel',
        description: 'Support via website, email, SMS, and social media',
        icon: 'Send',
      },
      {
        title: 'Analytics',
        description: 'Track performance, identify trends, and improve service',
        icon: 'BarChart',
      },
    ],
    
    pricing: {
      starter: {
        price: 79,
        features: [
          '5,000 conversations/month',
          'Knowledge base integration',
          'Basic analytics',
          'Email support',
          '14-day free trial',
        ],
      },
      professional: {
        price: 199,
        features: [
          '25,000 conversations/month',
          'Advanced routing',
          'Multi-channel support',
          'Custom branding',
          'API access',
          'Priority support',
        ],
      },
      enterprise: {
        price: 599,
        features: [
          'Unlimited conversations',
          'White-label solution',
          'Custom AI training',
          'Dedicated support',
          'SLA guarantee',
          '24/7 support',
        ],
      },
    },
    
    useCases: [
      {
        title: 'E-commerce',
        description: 'Handle order status, returns, and product questions',
      },
      {
        title: 'SaaS',
        description: 'Provide technical support and feature guidance',
      },
      {
        title: 'Service Business',
        description: 'Schedule appointments and answer service questions',
      },
    ],
    
    faqs: [
      {
        question: 'How does the chatbot learn about our business?',
        answer: 'We train it on your website, documentation, and common support queries.',
      },
      {
        question: 'Can it work with our existing help desk?',
        answer: 'Yes! We integrate with Zendesk, Freshdesk, Intercom, and more.',
      },
      {
        question: 'What happens if it can\'t answer a question?',
        answer: 'It seamlessly transfers to a human agent with full conversation context.',
      },
    ],
    
    chatbot: {
      enabled: true,
      greeting: "👋 Hi! I'm your support assistant. How can I help you today?",
      quickReplies: ['Get help', 'Contact support', 'View docs', 'Report issue'],
    },
  },
};

export const getTemplate = (templateId: string): BusinessTemplate => {
  return BUSINESS_TEMPLATES[templateId] || BUSINESS_TEMPLATES.support;
};

export const getAllTemplates = (): BusinessTemplate[] => {
  return Object.values(BUSINESS_TEMPLATES);
};

export const getTemplatesByIndustry = (industry: string): BusinessTemplate[] => {
  return Object.values(BUSINESS_TEMPLATES).filter(t => t.industry === industry);
};
