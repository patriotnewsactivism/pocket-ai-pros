import { Shield, Lock, Award, CheckCircle2, Globe, Zap } from "lucide-react";

const badges = [
  {
    icon: Shield,
    title: "SOC 2 Certified",
    description: "Enterprise-grade security",
  },
  {
    icon: Lock,
    title: "GDPR Compliant",
    description: "Data privacy guaranteed",
  },
  {
    icon: Award,
    title: "ISO 27001",
    description: "Information security certified",
  },
  {
    icon: CheckCircle2,
    title: "99.9% Uptime",
    description: "Always available",
  },
  {
    icon: Globe,
    title: "Global CDN",
    description: "Lightning fast worldwide",
  },
  {
    icon: Zap,
    title: "Real-time Processing",
    description: "Instant responses",
  },
];

const TrustBadges = () => {
  return (
    <section className="py-16 bg-card border-y border-border">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h3 className="text-2xl font-bold mb-2">Enterprise-Grade Security & Performance</h3>
          <p className="text-muted-foreground">Trusted by businesses worldwide with industry-leading standards</p>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {badges.map((badge, index) => {
            const Icon = badge.icon;
            return (
              <div 
                key={index} 
                className="flex flex-col items-center text-center space-y-3 group"
              >
                <div className="w-16 h-16 bg-gradient-to-br from-primary/10 to-accent/10 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Icon className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <div className="font-semibold text-sm">{badge.title}</div>
                  <div className="text-xs text-muted-foreground">{badge.description}</div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-12 text-center">
          <p className="text-sm text-muted-foreground">
            Used by <span className="font-semibold text-foreground">Fortune 500 companies</span> and 
            <span className="font-semibold text-foreground"> startups</span> alike
          </p>
        </div>
      </div>
    </section>
  );
};

export default TrustBadges;
