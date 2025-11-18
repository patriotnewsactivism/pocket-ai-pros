import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Bot, Zap, Shield, BarChart3, Globe, Code, MessageSquare, Sparkles } from "lucide-react";
import featuresAi from "@/assets/features-ai.jpg";

const features = [
  {
    icon: Bot,
    title: "AI-Powered Conversations",
    description: "Leverage GPT-4o-mini for natural, context-aware conversations that understand your customers.",
  },
  {
    icon: Zap,
    title: "Lightning Fast Setup",
    description: "Build and deploy your custom AI bot in minutes, not months. No coding required.",
  },
  {
    icon: Shield,
    title: "Enterprise Security",
    description: "Bank-level encryption and compliance with GDPR, CCPA, and industry standards.",
  },
  {
    icon: BarChart3,
    title: "Advanced Analytics",
    description: "Track performance, user engagement, and conversation insights in real-time.",
  },
  {
    icon: Globe,
    title: "Multi-Language Support",
    description: "Communicate with customers in 95+ languages automatically.",
  },
  {
    icon: Code,
    title: "Powerful Integrations",
    description: "Connect with your favorite tools via API, webhooks, and native integrations.",
  },
];

const Features = () => {
  return (
    <section id="features" className="py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-4xl lg:text-5xl font-bold">
            Powerful Features for
            <span className="bg-gradient-to-r from-secondary to-primary bg-clip-text text-transparent"> Modern Businesses</span>
          </h2>
          <p className="text-xl text-foreground/80 max-w-2xl mx-auto font-medium">
            Everything you need to create intelligent, engaging AI bots that delight your customers.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-center mb-16">
          <div className="relative order-2 lg:order-1">
            <div className="absolute inset-0 bg-gradient-to-r from-secondary/20 to-primary/20 blur-3xl rounded-full" />
            <img 
              src={featuresAi} 
              alt="AI Features" 
              className="relative rounded-2xl shadow-2xl w-full"
            />
          </div>

          <div className="space-y-6 order-1 lg:order-2">
            <div className="inline-flex items-center gap-2 bg-secondary/10 text-secondary px-4 py-2 rounded-full text-sm font-medium">
              <Sparkles className="w-4 h-4" />
              <span>Optimized with GPT-4o-mini</span>
            </div>
            <h3 className="text-3xl font-bold">Cost-Effective AI That Performs</h3>
            <p className="text-lg text-foreground/80 font-medium">
              We use GPT-4o-mini to deliver exceptional AI performance at a fraction of the cost.
              Get enterprise-grade intelligence without enterprise-grade prices.
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-card p-4 rounded-lg border">
                <div className="text-2xl font-bold text-success">90%</div>
                <div className="text-sm text-foreground/75 font-semibold">Cost Savings</div>
              </div>
              <div className="bg-card p-4 rounded-lg border">
                <div className="text-2xl font-bold text-primary">10x</div>
                <div className="text-sm text-foreground/75 font-semibold">Faster Response</div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card key={index} className="transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border-muted">
                <CardHeader>
                  <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-accent/20 rounded-xl flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">{feature.description}</CardDescription>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Features;
