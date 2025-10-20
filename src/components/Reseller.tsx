import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Users, DollarSign, TrendingUp, Handshake, Award, HeadphonesIcon } from "lucide-react";
import resellerPartner from "@/assets/reseller-partner.jpg";

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

const Reseller = () => {
  return (
    <section id="reseller" className="py-24 bg-gradient-to-b from-primary/5 to-background relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(139,92,246,0.1),transparent_50%)]" />
      
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

            <Button variant="hero" size="xl" className="w-full sm:w-auto">
              Apply for Reseller Program
            </Button>
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

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
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
      </div>
    </section>
  );
};

export default Reseller;
