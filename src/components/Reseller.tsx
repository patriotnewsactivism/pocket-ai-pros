import { Card, CardContent } from "@/components/ui/card";
import { Users, DollarSign, TrendingUp, Handshake, Award, HeadphonesIcon, Target, Rocket, Shield } from "lucide-react";
import resellerPartner from "@/assets/reseller-partner.jpg";
import { ResellerDialog } from "./ResellerDialog";

const benefits = [
  {
    icon: DollarSign,
    title: "Generous Commission",
    description: "Earn up to 30% recurring commission on every sale",
  },
  {
    icon: TrendingUp,
    title: "Passive Income",
    description: "Build a sustainable revenue stream with monthly recurring payments",
  },
  {
    icon: Users,
    title: "Dedicated Support",
    description: "Get priority support and resources to help you succeed",
  },
  {
    icon: Handshake,
    title: "Co-Marketing",
    description: "Access marketing materials and joint promotional opportunities",
  },
  {
    icon: Award,
    title: "White Label Options",
    description: "Offer the service under your own brand with custom branding",
  },
  {
    icon: HeadphonesIcon,
    title: "Partner Dashboard",
    description: "Track sales, commissions, and performance in real-time",
  },
];

const commissionTiers = [
  {
    tier: "Bronze Partner",
    icon: Target,
    clients: "1-10 clients",
    commission: "20%",
    perks: ["Partner dashboard", "Email support", "Marketing materials"],
    color: "from-orange-500 to-orange-600",
  },
  {
    tier: "Silver Partner",
    icon: Award,
    clients: "11-50 clients",
    commission: "25%",
    perks: ["All Bronze perks", "Priority support", "Co-marketing opportunities", "Custom training"],
    color: "from-slate-400 to-slate-500",
  },
  {
    tier: "Gold Partner",
    icon: Rocket,
    clients: "51+ clients",
    commission: "30%",
    perks: ["All Silver perks", "Dedicated account manager", "White-label options", "Revenue share bonuses", "Exclusive features"],
    color: "from-yellow-400 to-yellow-600",
  },
];

const howItWorks = [
  {
    step: "1",
    title: "Apply & Get Approved",
    description: "Submit your application and we'll review it within 2 business days",
  },
  {
    step: "2",
    title: "Get Your Unique Link",
    description: "Receive your partner dashboard and custom referral links",
  },
  {
    step: "3",
    title: "Share & Earn",
    description: "Share with your network and earn commissions on every sale",
  },
  {
    step: "4",
    title: "Scale & Grow",
    description: "Advance through tiers and unlock higher commissions and exclusive perks",
  },
];

const Reseller = () => {
  return (
    <section id="reseller" className="py-24 bg-gradient-to-b from-background to-muted/30 relative overflow-hidden">
      <div className="absolute inset-0 bg-grid-pattern opacity-5" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-4xl lg:text-5xl font-bold">
            Join Our
            <span className="bg-gradient-to-r from-accent to-secondary bg-clip-text text-transparent"> Reseller Program</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Partner with BuildMyBot and earn recurring revenue while helping businesses transform with AI.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-center mb-16">
          <div className="space-y-8">
            <div className="space-y-4">
              <h3 className="text-3xl font-bold">Why Become a Reseller?</h3>
              <p className="text-lg text-muted-foreground">
                Our reseller program is designed to help you build a profitable business by offering 
                cutting-edge AI bot solutions to your clients. We handle the technology, you focus on growth.
              </p>
            </div>

            <div className="bg-gradient-to-br from-primary/10 to-accent/10 p-8 rounded-2xl border border-primary/20">
              <div className="space-y-4">
                <h4 className="text-2xl font-bold">Earning Potential</h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">10 Clients × $99/month</span>
                    <span className="text-xl font-bold text-primary">$297/month</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">50 Clients × $99/month</span>
                    <span className="text-xl font-bold text-secondary">$1,485/month</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">100 Clients × $99/month</span>
                    <span className="text-2xl font-bold text-accent">$2,970/month</span>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground pt-4">
                  * Based on 30% commission on Professional plan
                </p>
              </div>
            </div>

            <ResellerDialog />
          </div>

          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-accent/30 to-secondary/30 blur-3xl rounded-full" />
            <img 
              src={resellerPartner} 
              alt="Reseller Partnership" 
              className="relative rounded-2xl shadow-2xl w-full"
            />
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {benefits.map((benefit, index) => {
            const Icon = benefit.icon;
            return (
              <Card key={index} className="transition-all duration-300 hover:shadow-xl hover:-translate-y-1 bg-card/50 backdrop-blur">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-accent/20 to-secondary/20 rounded-xl flex items-center justify-center shrink-0">
                      <Icon className="w-6 h-6 text-accent" />
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">{benefit.title}</h4>
                      <p className="text-sm text-muted-foreground">{benefit.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Commission Tiers */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold mb-4">Commission Tiers</h3>
            <p className="text-lg text-muted-foreground">
              The more you sell, the more you earn. Advance through tiers automatically.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {commissionTiers.map((tier, index) => {
              const Icon = tier.icon;
              return (
                <Card 
                  key={index} 
                  className={`transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 bg-card/80 backdrop-blur border-2 ${
                    index === 2 ? "border-primary/50" : "border-muted"
                  }`}
                >
                  <CardContent className="p-6">
                    <div className={`w-16 h-16 bg-gradient-to-br ${tier.color} rounded-2xl flex items-center justify-center mb-4`}>
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                    <h4 className="text-2xl font-bold mb-2">{tier.tier}</h4>
                    <div className="text-sm text-muted-foreground mb-4">{tier.clients}</div>
                    <div className="text-4xl font-bold text-primary mb-6">{tier.commission}</div>
                    <div className="space-y-2">
                      {tier.perks.map((perk, idx) => (
                        <div key={idx} className="flex items-start gap-2 text-sm">
                          <Shield className="w-4 h-4 text-success shrink-0 mt-0.5" />
                          <span>{perk}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* How It Works */}
        <div className="mb-12">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold mb-4">How It Works</h3>
            <p className="text-lg text-muted-foreground">
              Start earning in 4 simple steps
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-6">
            {howItWorks.map((item, index) => (
              <div key={index} className="relative">
                <div className="bg-card/80 backdrop-blur rounded-xl p-6 border border-border hover:shadow-xl transition-all">
                  <div className="w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center text-white font-bold text-xl mb-4">
                    {item.step}
                  </div>
                  <h4 className="font-bold mb-2">{item.title}</h4>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                </div>
                {index < howItWorks.length - 1 && (
                  <div className="hidden md:block absolute top-1/2 -right-3 w-6 h-0.5 bg-gradient-to-r from-primary to-accent" />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="text-center">
          <div className="bg-gradient-to-br from-primary/10 to-accent/10 rounded-2xl p-8 border border-primary/20">
            <h3 className="text-2xl font-bold mb-4">Ready to Start Earning?</h3>
            <p className="text-lg text-muted-foreground mb-6 max-w-2xl mx-auto">
              Join hundreds of partners already earning recurring revenue with BuildMyBot
            </p>
            <ResellerDialog />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Reseller;
