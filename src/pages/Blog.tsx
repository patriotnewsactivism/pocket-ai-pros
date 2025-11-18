import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { SEO } from "@/components/SEO";
import { Calendar, ArrowRight, Tag } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

// Sample blog posts - in a real app, these would come from a CMS or API
const blogPosts = [
  {
    id: 1,
    title: "How AI Chatbots Are Transforming Customer Service in 2025",
    excerpt: "Discover the latest trends in AI-powered customer support and how businesses are leveraging chatbots to provide 24/7 assistance.",
    date: "2025-01-15",
    category: "AI Trends",
    author: "BuildMyBot Team",
    readTime: "5 min read",
    image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&auto=format&fit=crop",
  },
  {
    id: 2,
    title: "5 Ways to Optimize Your Chatbot for Better Conversions",
    excerpt: "Learn proven strategies to improve your chatbot's performance and turn more visitors into customers.",
    date: "2025-01-10",
    category: "Best Practices",
    author: "BuildMyBot Team",
    readTime: "7 min read",
    image: "https://images.unsplash.com/photo-1531746790731-6c087fecd65a?w=800&auto=format&fit=crop",
  },
  {
    id: 3,
    title: "GPT-4o-mini vs. GPT-4: Which Model Is Right for Your Business?",
    excerpt: "A comprehensive comparison of OpenAI's language models and how to choose the best one for your chatbot needs.",
    date: "2025-01-05",
    category: "Technology",
    author: "BuildMyBot Team",
    readTime: "6 min read",
    image: "https://images.unsplash.com/photo-1677756119517-756a188d2d94?w=800&auto=format&fit=crop",
  },
  {
    id: 4,
    title: "Case Study: How E-Commerce Store Increased Sales by 35% with AI Chatbots",
    excerpt: "Real-world success story of how one online retailer transformed their customer experience with BuildMyBot.",
    date: "2024-12-28",
    category: "Case Studies",
    author: "BuildMyBot Team",
    readTime: "8 min read",
    image: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&auto=format&fit=crop",
  },
  {
    id: 5,
    title: "Understanding Natural Language Processing in Chatbots",
    excerpt: "A beginner-friendly guide to how NLP powers modern AI chatbots and enables human-like conversations.",
    date: "2024-12-20",
    category: "Technology",
    author: "BuildMyBot Team",
    readTime: "10 min read",
    image: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=800&auto=format&fit=crop",
  },
  {
    id: 6,
    title: "Building Your First Chatbot: A Step-by-Step Guide",
    excerpt: "Everything you need to know to create and deploy your first AI chatbot, even with no coding experience.",
    date: "2024-12-15",
    category: "Getting Started",
    author: "BuildMyBot Team",
    readTime: "12 min read",
    image: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&auto=format&fit=crop",
  },
];

const categories = ["All", "AI Trends", "Best Practices", "Technology", "Case Studies", "Getting Started"];

const Blog = () => {
  return (
    <>
      <SEO
        title="Blog - BuildMyBot"
        description="Stay updated with the latest AI chatbot trends, best practices, and industry insights from BuildMyBot."
      />
      <div className="min-h-screen">
        <Header />

        <main className="container mx-auto px-4 py-16">
          {/* Hero Section */}
          <div className="text-center mb-16 max-w-3xl mx-auto">
            <h1 className="text-4xl lg:text-5xl font-bold mb-6">BuildMyBot Blog</h1>
            <p className="text-xl text-muted-foreground">
              Insights, tutorials, and best practices for building better AI chatbots
            </p>
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap justify-center gap-2 mb-12">
            {categories.map((category) => (
              <Button
                key={category}
                variant={category === "All" ? "default" : "outline"}
                size="sm"
                className="rounded-full"
              >
                {category}
              </Button>
            ))}
          </div>

          {/* Featured Post */}
          <div className="mb-16">
            <Card className="overflow-hidden border-primary/20 hover:border-primary/40 transition-colors">
              <div className="grid md:grid-cols-2 gap-0">
                <div className="relative h-64 md:h-auto overflow-hidden">
                  <img
                    src={blogPosts[0].image}
                    alt={blogPosts[0].title}
                    className="w-full h-full object-cover"
                  />
                  <Badge className="absolute top-4 left-4">Featured</Badge>
                </div>
                <div className="p-8 flex flex-col justify-center">
                  <Badge variant="secondary" className="w-fit mb-4">
                    {blogPosts[0].category}
                  </Badge>
                  <h2 className="text-3xl font-bold mb-4">{blogPosts[0].title}</h2>
                  <p className="text-muted-foreground mb-6">{blogPosts[0].excerpt}</p>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mb-6">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>{new Date(blogPosts[0].date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                    </div>
                    <span>•</span>
                    <span>{blogPosts[0].readTime}</span>
                  </div>
                  <Button className="w-fit">
                    Read More <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </div>
            </Card>
          </div>

          {/* Blog Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {blogPosts.slice(1).map((post) => (
              <Card
                key={post.id}
                className="flex flex-col overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={post.image}
                    alt={post.title}
                    className="w-full h-full object-cover transition-transform hover:scale-105"
                  />
                </div>
                <CardHeader>
                  <Badge variant="secondary" className="w-fit mb-2">
                    {post.category}
                  </Badge>
                  <CardTitle className="line-clamp-2">{post.title}</CardTitle>
                  <CardDescription className="line-clamp-3">{post.excerpt}</CardDescription>
                </CardHeader>
                <CardContent className="flex-1">
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>{new Date(post.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                    </div>
                    <span>•</span>
                    <span>{post.readTime}</span>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button variant="ghost" className="w-full">
                    Read More <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>

          {/* Newsletter CTA */}
          <div className="mt-16 bg-gradient-to-br from-primary/10 to-accent/10 rounded-lg p-12 text-center">
            <Tag className="w-12 h-12 text-primary mx-auto mb-4" />
            <h2 className="text-3xl font-bold mb-4">Stay Updated</h2>
            <p className="text-lg text-muted-foreground mb-6 max-w-2xl mx-auto">
              Subscribe to our newsletter to get the latest articles, product updates, and AI insights
              delivered straight to your inbox.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-2 rounded-md border border-input bg-background"
              />
              <Button>Subscribe</Button>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default Blog;
