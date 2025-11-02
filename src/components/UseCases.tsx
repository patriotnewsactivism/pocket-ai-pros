import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  ShoppingCart, 
  Stethoscope, 
  GraduationCap, 
  Building2, 
  Plane, 
  Coins,
  Briefcase,
  Home,
  Wrench,
  Landmark
} from "lucide-react";

const useCases = [
  {
    icon: ShoppingCart,
    title: "E-Commerce",
    description: "24/7 product recommendations, order tracking, and instant customer support",
    benefits: ["40% increase in sales", "80% faster response time", "24/7 availability"],
    color: "from-primary to-secondary",
  },
  {
    icon: Stethoscope,
    title: "Healthcare",
    description: "Appointment scheduling, patient FAQs, and prescription refill assistance",
    benefits: ["HIPAA compliant", "50% reduction in calls", "Better patient experience"],
    color: "from-secondary to-accent",
  },
  {
    icon: GraduationCap,
    title: "Education",
    description: "Student support, course information, and enrollment assistance",
    benefits: ["95% student satisfaction", "Instant answers", "Multi-language support"],
    color: "from-accent to-primary",
  },
  {
    icon: Coins,
    title: "Finance & Banking",
    description: "Account queries, transaction support, and financial guidance",
    benefits: ["Bank-level security", "Real-time updates", "Fraud detection"],
    color: "from-primary to-accent",
  },
  {
    icon: Building2,
    title: "Real Estate",
    description: "Property inquiries, showing schedules, and document assistance",
    benefits: ["Lead generation", "24/7 property info", "Automated scheduling"],
    color: "from-secondary to-primary",
  },
  {
    icon: Plane,
    title: "Travel & Hospitality",
    description: "Booking assistance, travel recommendations, and guest services",
    benefits: ["30% more bookings", "Instant confirmations", "Multi-currency support"],
    color: "from-accent to-secondary",
  },
  {
    icon: Briefcase,
    title: "Professional Services",
    description: "Client intake, appointment booking, and service information",
    benefits: ["Save 20hrs/week", "Better client experience", "Automated follow-ups"],
    color: "from-primary to-secondary",
  },
  {
    icon: Home,
    title: "Property Management",
    description: "Tenant support, maintenance requests, and lease information",
    benefits: ["Faster resolution", "Tenant satisfaction", "Reduced workload"],
    color: "from-secondary to-accent",
  },
  {
    icon: Wrench,
    title: "Repair Shops",
    description: "Service scheduling, quote requests, and repair status updates",
    benefits: ["50% more bookings", "Faster quotes", "Customer satisfaction"],
    color: "from-primary to-accent",
  },
  {
    icon: Landmark,
    title: "Politicians & Government",
    description: "Constituent inquiries, event information, and policy questions",
    benefits: ["Better engagement", "24/7 availability", "Efficient outreach"],
    color: "from-accent to-primary",
  },
];

const UseCases = () => {
  return (
    <section className="py-24 bg-gradient-to-b from-muted/30 to-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-4xl lg:text-5xl font-bold">
            Built for
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent"> Every Industry</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Discover how businesses across industries are leveraging AI to transform customer experiences
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {useCases.map((useCase, index) => {
            const Icon = useCase.icon;
            return (
              <Card 
                key={index} 
                className="group transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 border-muted bg-card/80 backdrop-blur"
              >
                <CardHeader>
                  <div className={`w-16 h-16 bg-gradient-to-br ${useCase.color} rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <CardTitle className="text-xl">{useCase.title}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    {useCase.description}
                  </p>
                  <div className="space-y-2">
                    {useCase.benefits.map((benefit, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-xs">
                        <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                        <span className="text-foreground">{benefit}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="text-center mt-12">
          <p className="text-lg text-muted-foreground">
            <span className="font-semibold text-foreground">Can't find your industry?</span> Our flexible platform adapts to any use case.
          </p>
        </div>
      </div>
    </section>
  );
};

export default UseCases;
