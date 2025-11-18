import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { SEO } from "@/components/SEO";
import { Bot, Users, Target, Award, TrendingUp, Globe } from "lucide-react";

const About = () => {
  return (
    <>
      <SEO
        title="About Us - BuildMyBot"
        description="Learn about BuildMyBot's mission to democratize AI chatbot technology for businesses of all sizes."
      />
      <div className="min-h-screen">
        <Header />

        <main className="container mx-auto px-4 py-16 max-w-4xl">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-lg mb-6">
              <Bot className="w-8 h-8 text-primary-foreground" />
            </div>
            <h1 className="text-4xl lg:text-5xl font-bold mb-6">About BuildMyBot</h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              We're on a mission to make powerful AI chatbots accessible to every business,
              regardless of size or technical expertise.
            </p>
          </div>

          {/* Our Story */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold mb-6">Our Story</h2>
            <div className="prose prose-lg max-w-none text-muted-foreground">
              <p className="mb-4">
                BuildMyBot was founded with a simple belief: every business deserves access to cutting-edge
                AI technology without the complexity and cost traditionally associated with it.
              </p>
              <p className="mb-4">
                We've built a platform that leverages GPT-4o-mini technology to deliver powerful,
                customizable chatbots that can be deployed in minutes, not months. Our drag-and-drop
                interface and pre-built templates make it easy for anyone to create sophisticated AI
                assistants tailored to their specific industry needs.
              </p>
              <p>
                Today, we're proud to serve over 500 businesses worldwide, helping them automate
                customer support, boost engagement, and scale their operations with AI-powered conversations.
              </p>
            </div>
          </section>

          {/* Mission & Values */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold mb-8">Our Mission & Values</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-card border border-border rounded-lg p-6">
                <Target className="w-8 h-8 text-primary mb-4" />
                <h3 className="text-xl font-semibold mb-3">Our Mission</h3>
                <p className="text-muted-foreground">
                  To democratize AI technology by providing businesses of all sizes with powerful,
                  easy-to-use chatbot solutions that enhance customer experiences and drive growth.
                </p>
              </div>

              <div className="bg-card border border-border rounded-lg p-6">
                <Users className="w-8 h-8 text-primary mb-4" />
                <h3 className="text-xl font-semibold mb-3">Customer First</h3>
                <p className="text-muted-foreground">
                  We prioritize our customers' success above all else, providing exceptional support
                  and continuously improving our platform based on their feedback.
                </p>
              </div>

              <div className="bg-card border border-border rounded-lg p-6">
                <TrendingUp className="w-8 h-8 text-primary mb-4" />
                <h3 className="text-xl font-semibold mb-3">Innovation</h3>
                <p className="text-muted-foreground">
                  We stay at the forefront of AI technology, constantly evolving our platform to
                  incorporate the latest advancements in natural language processing.
                </p>
              </div>

              <div className="bg-card border border-border rounded-lg p-6">
                <Award className="w-8 h-8 text-primary mb-4" />
                <h3 className="text-xl font-semibold mb-3">Quality</h3>
                <p className="text-muted-foreground">
                  We're committed to delivering a reliable, high-performance platform with
                  99.9% uptime and enterprise-grade security standards.
                </p>
              </div>
            </div>
          </section>

          {/* Stats */}
          <section className="mb-16">
            <div className="bg-gradient-to-br from-primary/10 to-accent/10 rounded-lg p-8">
              <h2 className="text-3xl font-bold mb-8 text-center">BuildMyBot by the Numbers</h2>
              <div className="grid md:grid-cols-3 gap-8 text-center">
                <div>
                  <div className="text-4xl font-bold text-primary mb-2">500+</div>
                  <div className="text-muted-foreground">Businesses Worldwide</div>
                </div>
                <div>
                  <div className="text-4xl font-bold text-primary mb-2">1M+</div>
                  <div className="text-muted-foreground">Conversations Handled</div>
                </div>
                <div>
                  <div className="text-4xl font-bold text-primary mb-2">99.9%</div>
                  <div className="text-muted-foreground">Platform Uptime</div>
                </div>
              </div>
            </div>
          </section>

          {/* Technology */}
          <section className="mb-16">
            <div className="flex items-center gap-3 mb-6">
              <Globe className="w-8 h-8 text-primary" />
              <h2 className="text-3xl font-bold">Our Technology</h2>
            </div>
            <div className="prose prose-lg max-w-none text-muted-foreground">
              <p className="mb-4">
                BuildMyBot is powered by OpenAI's GPT-4o-mini, one of the most advanced language
                models available. This gives your chatbots the ability to understand context,
                provide nuanced responses, and handle complex customer queries with ease.
              </p>
              <p>
                Our platform is built on modern, scalable infrastructure with enterprise-grade
                security, ensuring your data is protected and your chatbots are always available
                when your customers need them.
              </p>
            </div>
          </section>

          {/* CTA */}
          <section className="text-center bg-card border border-border rounded-lg p-12">
            <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
            <p className="text-lg text-muted-foreground mb-6">
              Join hundreds of businesses already using BuildMyBot to transform their customer experience.
            </p>
            <a
              href="/#pricing"
              className="inline-flex items-center justify-center rounded-md bg-primary px-8 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              View Pricing
            </a>
          </section>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default About;
