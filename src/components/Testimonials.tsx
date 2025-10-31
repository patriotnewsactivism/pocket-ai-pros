import { Card, CardContent } from "@/components/ui/card";
import { Star, Quote } from "lucide-react";

const testimonials = [
  {
    name: "Sarah Johnson",
    role: "CEO, TechStart Inc",
    company: "TechStart",
    content: "BuildMyBot transformed our customer service. We reduced response time by 80% and customer satisfaction is at an all-time high. The GPT-4o-mini integration is incredibly cost-effective.",
    rating: 5,
    avatar: "SJ",
  },
  {
    name: "Michael Chen",
    role: "CTO, Digital Solutions",
    company: "Digital Solutions",
    content: "The easiest AI integration we've ever done. Set up in 15 minutes, and our support team can now focus on complex issues while the bot handles routine queries flawlessly.",
    rating: 5,
    avatar: "MC",
  },
  {
    name: "Emily Rodriguez",
    role: "Marketing Director, GrowthCo",
    company: "GrowthCo",
    content: "ROI was positive within the first month. The analytics dashboard gives us incredible insights into customer needs, and the 24/7 availability has opened up new markets for us.",
    rating: 5,
    avatar: "ER",
  },
  {
    name: "David Kim",
    role: "Founder, E-commerce Plus",
    company: "E-commerce Plus",
    content: "As a non-technical founder, I was skeptical about implementing AI. BuildMyBot made it so simple that I had our chatbot running in under 20 minutes. Game changer for small businesses!",
    rating: 5,
    avatar: "DK",
  },
  {
    name: "Lisa Thompson",
    role: "Operations Manager, HealthTech",
    company: "HealthTech",
    content: "The multi-language support is phenomenal. We're now serving customers in 12 different languages without hiring additional staff. The accuracy and context awareness are impressive.",
    rating: 5,
    avatar: "LT",
  },
  {
    name: "James Wilson",
    role: "Product Lead, FinanceApp",
    company: "FinanceApp",
    content: "Security was our top concern, and BuildMyBot exceeded expectations. Bank-level encryption, GDPR compliance, and their support team is incredibly responsive. Highly recommended!",
    rating: 5,
    avatar: "JW",
  },
];

const Testimonials = () => {
  return (
    <section className="py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-4xl lg:text-5xl font-bold">
            Trusted by
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent"> Innovators</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            See what our customers are saying about transforming their business with AI
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="transition-all duration-300 hover:shadow-xl hover:-translate-y-1 bg-card/50 backdrop-blur border-muted">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <Quote className="w-8 h-8 text-primary/30" aria-hidden="true" />
                  <div className="flex gap-0.5">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-primary text-primary" aria-hidden="true" />
                    ))}
                  </div>
                </div>
                
                <p className="text-sm text-foreground mb-6 leading-relaxed">
                  "{testimonial.content}"
                </p>
                
                <div className="flex items-center gap-3 pt-4 border-t border-border">
                  <div className="w-12 h-12 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center text-white font-semibold">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <div className="font-semibold text-foreground">{testimonial.name}</div>
                    <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <div className="flex flex-wrap justify-center items-center gap-8 text-muted-foreground">
            <div className="flex items-center gap-2">
              <Star className="w-5 h-5 fill-primary text-primary" />
              <span className="font-semibold text-foreground">4.9/5</span>
              <span>Average Rating</span>
            </div>
            <div className="text-lg">
              <span className="font-semibold text-foreground">500+</span> Happy Customers
            </div>
            <div className="text-lg">
              <span className="font-semibold text-foreground">1M+</span> Messages Processed
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
