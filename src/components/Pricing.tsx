import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, Zap, Crown, Rocket } from "lucide-react";

const pricingPlans = [
  {
    name: "Starter",
    price: "$29",
    description: "Perfect for small businesses getting started",
    icon: Zap,
    features: [
      "1 Custom AI Bot",
      "1,000 messages/month",
      "GPT-4o-mini powered",
      "Basic analytics",
      "Email support",
      "Standard training data",
    ],
    popular: false,
  },
  {
    name: "Professional",
    price: "$99",
    description: "For growing businesses with higher demands",
    icon: Crown,
    features: [
      "5 Custom AI Bots",
      "10,000 messages/month",
      "GPT-4o-mini powered",
      "Advanced analytics",
      "Priority support",
      "Custom training data",
      "API access",
      "Multi-language support",
    ],
    popular: true,
  },
  {
    name: "Enterprise",
    price: "$299",
    description: "Unlimited power for large organizations",
    icon: Rocket,
    features: [
      "Unlimited AI Bots",
      "Unlimited messages",
      "GPT-4o-mini + premium models",
      "Enterprise analytics",
      "24/7 dedicated support",
      "Custom integrations",
      "White-label options",
      "SLA guarantee",
      "Team collaboration",
    ],
    popular: false,
  },
];

const Pricing = () => {
  return (
    <section id="pricing" className="py-24 bg-gradient-to-b from-background to-primary/5">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-4xl lg:text-5xl font-bold">
            Simple, Transparent
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent"> Pricing</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Choose the perfect plan for your needs. All plans include GPT-4o-mini for cost-effective AI power.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {pricingPlans.map((plan, index) => {
            const Icon = plan.icon;
            return (
              <Card 
                key={index}
                className={`relative flex flex-col transition-all duration-300 hover:shadow-2xl ${
                  plan.popular 
                    ? "border-2 border-primary shadow-xl scale-105" 
                    : "hover:scale-105"
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-primary to-accent text-primary-foreground px-4 py-1 rounded-full text-sm font-semibold">
                    Most Popular
                  </div>
                )}
                
                <CardHeader className="text-center pb-8 pt-8">
                  <div className="w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Icon className="w-8 h-8 text-primary-foreground" />
                  </div>
                  <CardTitle className="text-2xl mb-2">{plan.name}</CardTitle>
                  <CardDescription className="text-base">{plan.description}</CardDescription>
                  <div className="mt-6">
                    <span className="text-5xl font-bold text-foreground">{plan.price}</span>
                    <span className="text-muted-foreground">/month</span>
                  </div>
                </CardHeader>

                <CardContent className="flex-1">
                  <ul className="space-y-3">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-3">
                        <Check className="w-5 h-5 text-success shrink-0 mt-0.5" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>

                <CardFooter>
                  <Button 
                    variant={plan.popular ? "hero" : "outline-gradient"} 
                    size="lg" 
                    className="w-full"
                  >
                    Get Started
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>

        <div className="text-center mt-12">
          <p className="text-muted-foreground">
            All plans include a 14-day free trial. No credit card required.
          </p>
        </div>
      </div>
    </section>
  );
};

export default Pricing;
