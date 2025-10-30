import { Button } from "@/components/ui/button";
import { ArrowRight, Bot, Sparkles } from "lucide-react";
import heroBot from "@/assets/hero-bot.jpg";

const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-b from-background via-primary/5 to-background">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(139,92,246,0.1),transparent_50%)]" />
      
      <div className="container mx-auto px-4 py-20 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8 animate-fade-in">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium">
              <Sparkles className="w-4 h-4" />
              <span>Powered by GPT-4o-mini - Cost-Efficient AI</span>
            </div>
            
            <h1 className="text-5xl lg:text-7xl font-bold leading-tight">
              Build Your
              <span className="bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent"> AI Bot </span>
              In Minutes
            </h1>
            
            <p className="text-xl text-muted-foreground max-w-2xl">
              Transform your business with custom AI chatbots. No coding required. 
              Powered by GPT-4o-mini for optimal performance at minimal cost.
            </p>

            <div className="flex flex-wrap gap-4">
              <Button variant="hero" size="xl" className="group" asChild>
                <a href="#live-demo">
                  Start Building Free
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </a>
              </Button>
              <Button variant="outline-gradient" size="xl" asChild>
                <a href="#pricing">View Pricing</a>
              </Button>
            </div>

            <div className="flex items-center gap-8 pt-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">500+</div>
                <div className="text-sm text-muted-foreground">Active Bots</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-secondary">24/7</div>
                <div className="text-sm text-muted-foreground">Support</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-accent">99.9%</div>
                <div className="text-sm text-muted-foreground">Uptime</div>
              </div>
            </div>
          </div>

          <div className="relative animate-fade-in-up">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/30 to-accent/30 blur-3xl rounded-full" />
            <img 
              src={heroBot} 
              alt="AI Bot Building Platform" 
              className="relative rounded-2xl shadow-2xl w-full"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
