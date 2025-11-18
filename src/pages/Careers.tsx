import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { SEO } from "@/components/SEO";
import { Briefcase, MapPin, Clock, ArrowRight, Heart, Zap, Users, Globe } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

// Sample job openings - in a real app, these would come from a jobs API
const jobOpenings = [
  {
    id: 1,
    title: "Senior Full Stack Engineer",
    department: "Engineering",
    location: "Remote (US)",
    type: "Full-time",
    description: "Build and scale our AI chatbot platform using React, Node.js, and modern cloud infrastructure.",
    skills: ["React", "Node.js", "TypeScript", "AWS", "PostgreSQL"],
  },
  {
    id: 2,
    title: "AI/ML Engineer",
    department: "Engineering",
    location: "Remote (Worldwide)",
    type: "Full-time",
    description: "Develop and optimize AI models to improve chatbot performance and natural language understanding.",
    skills: ["Python", "TensorFlow", "NLP", "OpenAI API", "Machine Learning"],
  },
  {
    id: 3,
    title: "Product Designer",
    department: "Design",
    location: "Remote (US/EU)",
    type: "Full-time",
    description: "Create intuitive and beautiful user experiences for our chatbot builder and customer dashboard.",
    skills: ["Figma", "UI/UX", "Design Systems", "Prototyping", "User Research"],
  },
  {
    id: 4,
    title: "Customer Success Manager",
    department: "Customer Success",
    location: "Remote (US)",
    type: "Full-time",
    description: "Help our customers succeed by providing exceptional support and guidance on chatbot implementation.",
    skills: ["Customer Support", "SaaS", "Communication", "Problem Solving"],
  },
  {
    id: 5,
    title: "Content Marketing Manager",
    department: "Marketing",
    location: "Remote (US)",
    type: "Full-time",
    description: "Drive our content strategy, create compelling content, and grow our brand presence in the AI space.",
    skills: ["Content Strategy", "SEO", "Writing", "Marketing", "Analytics"],
  },
  {
    id: 6,
    title: "DevOps Engineer",
    department: "Engineering",
    location: "Remote (Worldwide)",
    type: "Full-time",
    description: "Build and maintain our infrastructure to ensure high availability and performance at scale.",
    skills: ["Kubernetes", "Docker", "AWS", "CI/CD", "Monitoring"],
  },
];

const benefits = [
  {
    icon: Globe,
    title: "Remote-First",
    description: "Work from anywhere in the world with flexible hours",
  },
  {
    icon: Heart,
    title: "Health & Wellness",
    description: "Comprehensive health, dental, and vision insurance",
  },
  {
    icon: Zap,
    title: "Growth & Learning",
    description: "Annual learning budget and conference attendance",
  },
  {
    icon: Users,
    title: "Collaborative Culture",
    description: "Work with talented, passionate people who love what they do",
  },
];

const Careers = () => {
  return (
    <>
      <SEO
        title="Careers - BuildMyBot"
        description="Join the BuildMyBot team and help us democratize AI chatbot technology for businesses worldwide."
      />
      <div className="min-h-screen">
        <Header />

        <main className="container mx-auto px-4 py-16">
          {/* Hero Section */}
          <div className="text-center mb-16 max-w-3xl mx-auto">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-lg mb-6">
              <Briefcase className="w-8 h-8 text-primary-foreground" />
            </div>
            <h1 className="text-4xl lg:text-5xl font-bold mb-6">Join Our Team</h1>
            <p className="text-xl text-muted-foreground">
              Help us build the future of AI-powered customer conversations and make cutting-edge
              technology accessible to businesses everywhere.
            </p>
          </div>

          {/* Why Join Us */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold mb-8 text-center">Why BuildMyBot?</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {benefits.map((benefit) => {
                const Icon = benefit.icon;
                return (
                  <Card key={benefit.title} className="text-center">
                    <CardHeader>
                      <div className="mx-auto w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                        <Icon className="w-6 h-6 text-primary" />
                      </div>
                      <CardTitle className="text-lg">{benefit.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">{benefit.description}</p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </section>

          {/* Our Values */}
          <section className="mb-16 bg-gradient-to-br from-primary/10 to-accent/10 rounded-lg p-8">
            <h2 className="text-3xl font-bold mb-6 text-center">Our Values</h2>
            <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              <div className="text-center">
                <h3 className="text-xl font-semibold mb-3">Customer Obsessed</h3>
                <p className="text-muted-foreground">
                  We put our customers first in everything we do, from product development to support.
                </p>
              </div>
              <div className="text-center">
                <h3 className="text-xl font-semibold mb-3">Move Fast</h3>
                <p className="text-muted-foreground">
                  We iterate quickly, learn from feedback, and aren't afraid to experiment.
                </p>
              </div>
              <div className="text-center">
                <h3 className="text-xl font-semibold mb-3">Think Big</h3>
                <p className="text-muted-foreground">
                  We're building the future of AI communication and aren't limited by today's constraints.
                </p>
              </div>
            </div>
          </section>

          {/* Open Positions */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold mb-8 text-center">Open Positions</h2>
            <p className="text-center text-muted-foreground mb-8 max-w-2xl mx-auto">
              We're growing fast and looking for talented people to join our team. Don't see a role that
              fits? Send us your resume anyway - we're always looking for exceptional people.
            </p>

            <div className="grid gap-6 max-w-4xl mx-auto">
              {jobOpenings.map((job) => (
                <Card key={job.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                      <div className="flex-1">
                        <CardTitle className="text-2xl mb-2">{job.title}</CardTitle>
                        <CardDescription className="text-base">{job.description}</CardDescription>
                      </div>
                      <Badge variant="secondary" className="w-fit">
                        {job.department}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-4">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        <span>{job.location}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>{job.type}</span>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {job.skills.map((skill) => (
                        <Badge key={skill} variant="outline" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button className="w-full md:w-auto">
                      Apply Now <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </section>

          {/* CTA Section */}
          <section className="text-center bg-card border border-border rounded-lg p-12 max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold mb-4">Don't See Your Role?</h2>
            <p className="text-lg text-muted-foreground mb-6">
              We're always looking for talented people who are passionate about AI and customer experience.
              Send us your resume and tell us why you'd be a great fit for BuildMyBot.
            </p>
            <Button size="lg">
              Send General Application <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </section>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default Careers;
