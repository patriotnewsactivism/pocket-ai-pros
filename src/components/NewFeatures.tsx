import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  BarChart3,
  CreditCard,
  Mails,
  MessagesSquare,
  ScrollText,
  Terminal,
  type LucideIcon,
} from "lucide-react";

interface FeatureCard {
  title: string;
  description: string;
  highlights: string[];
  icon: LucideIcon;
  tag: string;
}

const featureCards: FeatureCard[] = [
  {
    title: "Complete Payment System",
    description: "Launch Stripe-powered subscriptions with recurring billing, refunds, and customer portal support.",
    highlights: ["Checkout-ready Stripe flows", "Automatic renewals & receipts", "Refund handling built in"],
    icon: CreditCard,
    tag: "Revenue",
  },
  {
    title: "Legal & Compliance Stack",
    description: "Pre-built Terms, Privacy, and Refund policies keep BuildMyBot.App compliant across regions.",
    highlights: ["GDPR & CCPA coverage", "Clear cancellation terms", "Linked across the site"],
    icon: ScrollText,
    tag: "Trust",
  },
  {
    title: "Email Automation",
    description: "Send welcome emails, receipts, and lifecycle updates with production-ready templates.",
    highlights: ["Event-driven sends", "Reseller + newsletter flows", "Provider-agnostic templates"],
    icon: Mails,
    tag: "Engagement",
  },
  {
    title: "Analytics & Tracking",
    description: "Track conversions, CTA clicks, and errors with the built-in analytics layer.",
    highlights: ["Route-aware page views", "Checkout funnel events", "Error + form tracking"],
    icon: BarChart3,
    tag: "Insights",
  },
  {
    title: "Live Chat Widget",
    description: "Offer instant support with provider-flexible chat that can surface user context automatically.",
    highlights: ["Tawk.to, Intercom, Crisp", "Programmatic open/hide", "User identity hydration"],
    icon: MessagesSquare,
    tag: "Support",
  },
  {
    title: "One-Command Deployment",
    description: "Deploy BuildMyBot.App with automated checks, builds, and hosting hand-offs in a single script.",
    highlights: ["Pre-flight validation", "Optimized production build", "Post-deploy verification"],
    icon: Terminal,
    tag: "DevOps",
  },
];

export const NewFeatures = () => {
  return (
    <section id="buildmybot-app" className="py-20 bg-background">
      <div className="container mx-auto px-4 space-y-10">
        <div className="space-y-4 text-center">
          <Badge variant="secondary" className="mx-auto w-fit px-4 py-1 text-sm">New in BuildMyBot.App</Badge>
          <h2 className="text-4xl lg:text-5xl font-bold">Everything you need to launch fast</h2>
          <p className="text-lg text-foreground/80 max-w-3xl mx-auto font-medium">
            Production-ready revenue, trust, analytics, and support systems are bundled so your team can focus on
            building great bots instead of stitching infrastructure together.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {featureCards.map(feature => {
            const Icon = feature.icon;
            return (
              <Card
                key={feature.title}
                className="h-full border-muted bg-card/60 backdrop-blur transition-transform duration-200 hover:-translate-y-1 hover:shadow-xl"
              >
                <CardHeader className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 text-foreground/80">
                      <span className="inline-flex items-center justify-center rounded-xl bg-primary/10 p-2">
                        <Icon className="h-5 w-5 text-primary" aria-hidden="true" />
                      </span>
                      <span className="text-sm font-semibold text-foreground/80">{feature.tag}</span>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      Shipping now
                    </Badge>
                  </div>
                  <CardTitle className="text-xl leading-7">{feature.title}</CardTitle>
                  <CardDescription className="text-base leading-relaxed text-foreground/80">
                    {feature.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-foreground/80">
                    {feature.highlights.map(item => (
                      <li key={item} className="flex items-start gap-2">
                        <span className="mt-1 h-1.5 w-1.5 rounded-full bg-primary" aria-hidden="true" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default NewFeatures;
