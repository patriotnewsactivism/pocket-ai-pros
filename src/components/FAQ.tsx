import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { HelpCircle } from "lucide-react";

const faqs = [
  {
    question: "How long does it take to set up a bot?",
    answer: "Most customers have their first bot up and running in under 15 minutes. Our intuitive interface guides you through the process step-by-step, and no coding is required. For more complex integrations, our support team is available 24/7 to help.",
  },
  {
    question: "What makes GPT-4o-mini better for my business?",
    answer: "GPT-4o-mini offers the perfect balance of performance and cost-efficiency. You get 90% of the capability of premium models at a fraction of the cost, with faster response times and lower operational expenses. Perfect for businesses that need enterprise-grade AI without enterprise-grade prices.",
  },
  {
    question: "Can I customize the bot's personality and responses?",
    answer: "Absolutely! You have full control over your bot's tone, personality, and knowledge base. Upload your own training data, FAQs, product information, and brand guidelines. The bot learns from your data to provide responses that align perfectly with your brand voice.",
  },
  {
    question: "How secure is my data?",
    answer: "Security is our top priority. We use bank-level 256-bit encryption, are SOC 2 and ISO 27001 certified, and fully compliant with GDPR and CCPA. Your data is never shared with third parties, and we offer on-premise deployment options for enterprise customers with specific security requirements.",
  },
  {
    question: "What integrations do you support?",
    answer: "We integrate with 100+ platforms including Shopify, WordPress, Salesforce, HubSpot, Zendesk, Slack, Microsoft Teams, and more. We also provide a robust REST API and webhooks for custom integrations. If you need a specific integration, our team can help implement it.",
  },
  {
    question: "Can I try before I buy?",
    answer: "Yes! All plans come with a 14-day free trial with full access to features. No credit card required to start. You can also book a live demo with our team to see the platform in action and ask any questions.",
  },
  {
    question: "What kind of support do you offer?",
    answer: "We provide 24/7 email support for all plans, priority support for Professional plans, and dedicated account managers for Enterprise customers. We also have extensive documentation, video tutorials, and an active community forum.",
  },
  {
    question: "How does the reseller program work?",
    answer: "Our reseller program offers up to 50% recurring commission on all sales. You'll get access to white-label options, co-marketing materials, and a dedicated partner dashboard to track your earnings and performance. Apply through the Reseller Program section to get started.",
  },
  {
    question: "Can the bot handle multiple languages?",
    answer: "Yes! Our bots support 95+ languages automatically. The AI detects the user's language and responds naturally in that language, making it perfect for international businesses or diverse customer bases.",
  },
  {
    question: "What happens if I exceed my message limit?",
    answer: "We'll notify you when you reach 80% of your limit. You can upgrade your plan at any time, or purchase additional message packs. We never shut off your bot mid-conversation - customer experience comes first.",
  },
  {
    question: "What qualifies as a conversation?",
    answer: "A conversation is counted when a chat session closes, not for each individual message sent back and forth. This means you and your customer can exchange multiple messages within a single conversation. The conversation ends when the chat window is closed or the session times out, giving you great value and flexibility in customer interactions.",
  },
];

const FAQ = () => {
  return (
    <section className="py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-16 space-y-4">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-2xl mb-4">
              <HelpCircle className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-4xl lg:text-5xl font-bold">
              Frequently Asked
              <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent"> Questions</span>
            </h2>
            <p className="text-xl text-muted-foreground">
              Everything you need to know about BuildMyBot
            </p>
          </div>

          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem 
                key={index} 
                value={`item-${index}`}
                className="border border-border rounded-lg px-6 bg-card/50 backdrop-blur"
              >
                <AccordionTrigger className="text-left hover:no-underline py-4">
                  <span className="font-semibold text-foreground pr-4">{faq.question}</span>
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pb-4">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>

          <div className="text-center mt-12 p-8 bg-gradient-to-br from-primary/10 to-accent/10 rounded-2xl border border-primary/20">
            <h3 className="text-xl font-bold mb-2">Still have questions?</h3>
            <p className="text-muted-foreground mb-4">
              Our team is here to help 24/7
            </p>
            <a
              href="mailto:support@buildmybot.app"
              className="inline-flex items-center justify-center rounded-lg px-6 py-3 text-base font-semibold bg-gradient-to-r from-primary to-accent text-white hover:opacity-90 transition-opacity"
            >
              Contact Support
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FAQ;
