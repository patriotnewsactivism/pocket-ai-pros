import { Database } from "../types";

const now = new Date();

const iso = (daysAgo: number) => {
  const date = new Date(now);
  date.setDate(date.getDate() - daysAgo);
  return date.toISOString();
};

export const defaultDatabase: Database = {
  bots: [
    {
      id: "bot-buildmybot-support",
      name: "BuildMyBot Support Specialist",
      summary: "Guides new users through onboarding, training data preparation, and launch best practices.",
      industry: "SaaS",
      primaryGoal: "Customer onboarding",
      tone: "Friendly and expert",
      status: "active",
      persona: {
        tagline: "Your AI onboarding co-pilot",
        voice: "Conversational, encouraging, and precise",
        strengths: [
          "Turns documentation into actionable steps",
          "Understands SMB pain points",
          "Keeps costs low with GPT-4o-mini optimizations"
        ]
      },
      knowledgeDocumentIds: [
        "doc-bot-setup",
        "doc-training-data",
        "doc-deployment-checklist"
      ],
      metrics: {
        messagesHandled: 18240,
        avgResponseTimeSeconds: 1.6,
        csat: 96,
        conversionRate: 28,
        costSavingsUsd: 4800,
        automationCoverage: 0.78
      },
      createdAt: iso(120),
      updatedAt: iso(2)
    },
    {
      id: "bot-ecommerce-sales",
      name: "Ecommerce Sales Navigator",
      summary: "Drives product discovery, personalized offers, and post-purchase support for Shopify stores.",
      industry: "Ecommerce",
      primaryGoal: "Increase conversion and AOV",
      tone: "Energetic and consultative",
      status: "active",
      persona: {
        tagline: "High-converting virtual sales rep",
        voice: "Energetic, persuasive, data-driven",
        strengths: [
          "Understands customer intent",
          "Recommends cross-sells based on catalog data",
          "Handles returns and order updates automatically"
        ]
      },
      knowledgeDocumentIds: [
        "doc-product-kb",
        "doc-marketing-automations",
        "doc-returns-policy"
      ],
      metrics: {
        messagesHandled: 9560,
        avgResponseTimeSeconds: 1.2,
        csat: 92,
        conversionRate: 34,
        costSavingsUsd: 6320,
        automationCoverage: 0.84
      },
      createdAt: iso(90),
      updatedAt: iso(1)
    }
  ],
  knowledgeDocuments: [
    {
      id: "doc-bot-setup",
      botId: "bot-buildmybot-support",
      title: "Getting started with BuildMyBot",
      tags: ["setup", "onboarding"],
      source: "internal-guide",
      content: [
        "1. Create a workspace and invite teammates from the Team Settings screen.",
        "2. Connect your primary data sources (website URLs, PDF uploads, Notion, or Google Drive).",
        "3. Define the bot's persona: industry, tone, escalation rules.",
        "4. Launch the bot by embedding the script snippet or connecting Slack/Microsoft Teams."
      ].join("\n"),
      createdAt: iso(110),
      updatedAt: iso(6)
    },
    {
      id: "doc-training-data",
      botId: "bot-buildmybot-support",
      title: "Training data best practices",
      tags: ["training", "quality"],
      content: [
        "Organize knowledge into concise articles under 1,000 words. Use headings, bullet lists, and FAQs.",
        "Tag each article so the retrieval engine can prioritize accurate answers.",
        "Refresh highly changing data (pricing, offers, policies) using an automated sync schedule."
      ].join("\n"),
      createdAt: iso(108),
      updatedAt: iso(4)
    },
    {
      id: "doc-deployment-checklist",
      botId: "bot-buildmybot-support",
      title: "Deployment checklist",
      tags: ["launch", "qa"],
      content: [
        "- Verify fallback escalation routes: live chat, email, or ticketing.",
        "- Test 15 real customer scenarios before enabling full automation.",
        "- Monitor analytics daily for the first two weeks and fine-tune as needed."
      ].join("\n"),
      createdAt: iso(105),
      updatedAt: iso(3)
    },
    {
      id: "doc-product-kb",
      botId: "bot-ecommerce-sales",
      title: "Catalog enrichment guide",
      tags: ["catalog", "recommendations"],
      content: [
        "Sync your Shopify catalog daily to capture price, inventory, and variant data.",
        "Provide at least three bullet points per hero product highlighting benefits and social proof.",
        "Add cross-sell groups for complementary items so the bot can boost average order value."
      ].join("\n"),
      createdAt: iso(80),
      updatedAt: iso(5)
    },
    {
      id: "doc-marketing-automations",
      botId: "bot-ecommerce-sales",
      title: "Marketing automation sequences",
      tags: ["marketing", "flows"],
      content: [
        "Trigger personalized follow-up flows when a visitor abandons a cart or views high-intent pages.",
        "Integrate with Klaviyo to sync segments automatically.",
        "Use AI-generated replies to respond to campaign replies within 30 seconds."
      ].join("\n"),
      createdAt: iso(75),
      updatedAt: iso(7)
    },
    {
      id: "doc-returns-policy",
      botId: "bot-ecommerce-sales",
      title: "Returns and exchanges policy",
      tags: ["policy", "support"],
      content: [
        "Customers have 30 days to initiate a return as long as the item is unused.",
        "Offer instant exchanges by checking inventory in real time.",
        "Issue store credit automatically or escalate to a human if the order value exceeds $500."
      ].join("\n"),
      createdAt: iso(72),
      updatedAt: iso(8)
    }
  ],
  conversations: [
    {
      id: "msg-001",
      botId: "bot-buildmybot-support",
      role: "user",
      content: "How do I prepare my knowledge base before launching?",
      createdAt: iso(5)
    },
    {
      id: "msg-002",
      botId: "bot-buildmybot-support",
      role: "assistant",
      content: "Start by organizing content into short articles with clear tags, then schedule automatic syncs for fast-changing data like pricing.",
      createdAt: iso(5)
    },
    {
      id: "msg-003",
      botId: "bot-ecommerce-sales",
      role: "user",
      content: "Can the bot recommend add-ons for my hero product?",
      createdAt: iso(3)
    },
    {
      id: "msg-004",
      botId: "bot-ecommerce-sales",
      role: "assistant",
      content: "Absolutely—build cross-sell groups in your catalog so the AI can surface complementary products dynamically.",
      createdAt: iso(3)
    }
  ],
  lastUpdated: iso(1)
};

export default defaultDatabase;
