import { Card, CardContent } from "@/components/ui/card";
import { 
  ShoppingBag, 
  MessageSquare, 
  Mail, 
  Database,
  Webhook,
  Code2,
  Slack,
  Zap
} from "lucide-react";

const integrations = [
  {
    icon: ShoppingBag,
    name: "E-Commerce",
    platforms: ["Shopify", "WooCommerce", "Magento", "BigCommerce"],
    color: "from-primary to-secondary",
  },
  {
    icon: MessageSquare,
    name: "Communication",
    platforms: ["Slack", "Discord", "WhatsApp", "Telegram"],
    color: "from-secondary to-accent",
  },
  {
    icon: Mail,
    name: "Email & CRM",
    platforms: ["Salesforce", "HubSpot", "Mailchimp", "ActiveCampaign"],
    color: "from-accent to-primary",
  },
  {
    icon: Database,
    name: "Databases",
    platforms: ["MySQL", "PostgreSQL", "MongoDB", "Firebase"],
    color: "from-primary to-accent",
  },
  {
    icon: Webhook,
    name: "Webhooks",
    platforms: ["Custom Webhooks", "Zapier", "Make", "n8n"],
    color: "from-secondary to-primary",
  },
  {
    icon: Code2,
    name: "Developer Tools",
    platforms: ["REST API", "GraphQL", "SDK", "CLI"],
    color: "from-accent to-secondary",
  },
];

const Integrations = () => {
  return (
    <section className="py-24 bg-gradient-to-b from-background to-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-4xl lg:text-5xl font-bold">
            Seamless
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent"> Integrations</span>
          </h2>
          <p className="text-xl text-foreground/80 max-w-2xl mx-auto">
            Connect with your favorite tools and platforms in minutes
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {integrations.map((integration, index) => {
            const Icon = integration.icon;
            return (
              <Card 
                key={index} 
                className="transition-all duration-300 hover:shadow-xl hover:-translate-y-1 bg-card/80 backdrop-blur border-muted"
              >
                <CardContent className="p-6">
                  <div className={`w-14 h-14 bg-gradient-to-br ${integration.color} rounded-xl flex items-center justify-center mb-4`}>
                    <Icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">{integration.name}</h3>
                  <div className="flex flex-wrap gap-2">
                    {integration.platforms.map((platform, idx) => (
                      <span 
                        key={idx}
                        className="text-xs px-3 py-1 bg-primary/10 text-primary rounded-full font-medium"
                      >
                        {platform}
                      </span>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="bg-gradient-to-br from-primary/10 to-accent/10 rounded-2xl p-8 lg:p-12 border border-primary/20">
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            <div>
              <h3 className="text-3xl font-bold mb-4">
                Can't find what you need?
              </h3>
              <p className="text-lg text-foreground/80 mb-6">
                We offer custom integrations and a powerful API to connect with any platform.
                Our developer-friendly documentation makes it easy to build exactly what you need.
              </p>
              <div className="flex flex-wrap gap-4">
                <a 
                  href="#" 
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary to-accent text-white rounded-lg font-semibold hover:opacity-90 transition-opacity"
                >
                  <Code2 className="w-5 h-5" />
                  API Documentation
                </a>
                <a 
                  href="#" 
                  className="inline-flex items-center gap-2 px-6 py-3 border-2 border-primary rounded-lg font-semibold hover:bg-primary/5 transition-colors"
                >
                  <Zap className="w-5 h-5" />
                  Request Integration
                </a>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-card/80 backdrop-blur p-6 rounded-xl border border-border">
                <div className="text-3xl sm:text-4xl font-bold text-primary mb-2">100+</div>
                <div className="text-sm font-semibold text-foreground/80 uppercase tracking-wide">Native Integrations</div>
              </div>
              <div className="bg-card/80 backdrop-blur p-6 rounded-xl border border-border">
                <div className="text-3xl sm:text-4xl font-bold text-secondary mb-2">5 min</div>
                <div className="text-sm font-semibold text-foreground/80 uppercase tracking-wide">Average Setup Time</div>
              </div>
              <div className="bg-card/80 backdrop-blur p-6 rounded-xl border border-border">
                <div className="text-3xl sm:text-4xl font-bold text-accent mb-2">∞</div>
                <div className="text-sm font-semibold text-foreground/80 uppercase tracking-wide">Custom Integrations</div>
              </div>
              <div className="bg-card/80 backdrop-blur p-6 rounded-xl border border-border">
                <div className="text-3xl sm:text-4xl font-bold text-success mb-2">24/7</div>
                <div className="text-sm font-semibold text-foreground/80 uppercase tracking-wide">API Support</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Integrations;
