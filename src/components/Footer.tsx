import { Bot, Mail, Github, Linkedin, Twitter } from "lucide-react";
import { ContactDialog } from "./ContactDialog";
import { Link } from "react-router-dom";

const Footer = () => {
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <footer className="bg-card border-t border-border py-12">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
                <Bot className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-lg font-bold">BuildMyBot</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Build powerful AI chatbots in minutes with GPT-4o-mini technology. Trusted by 500+ businesses worldwide.
            </p>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Mail className="w-4 h-4" />
              <a href="mailto:support@buildmybot.ai" className="hover:text-primary transition-colors">
                support@buildmybot.ai
              </a>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Product</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <button onClick={() => scrollToSection("features")} className="hover:text-primary transition-colors">
                  Features
                </button>
              </li>
              <li>
                <button onClick={() => scrollToSection("pricing")} className="hover:text-primary transition-colors">
                  Pricing
                </button>
              </li>
              <li>
                <a href="https://docs.buildmybot.ai" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">
                  Documentation
                </a>
              </li>
              <li>
                <a href="https://api.buildmybot.ai" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">
                  API Reference
                </a>
              </li>
              <li>
                <a href="https://status.buildmybot.ai" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">
                  Status Page
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Company</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <a href="/about" className="hover:text-primary transition-colors">
                  About Us
                </a>
              </li>
              <li>
                <a href="/blog" className="hover:text-primary transition-colors">
                  Blog
                </a>
              </li>
              <li>
                <button onClick={() => scrollToSection("reseller")} className="hover:text-primary transition-colors">
                  Reseller Program
                </button>
              </li>
              <li>
                <ContactDialog trigger={
                  <button className="hover:text-primary transition-colors">Contact Us</button>
                } />
              </li>
              <li>
                <a href="/careers" className="hover:text-primary transition-colors">
                  Careers
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Legal</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link to="/privacy" className="hover:text-primary transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="hover:text-primary transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link to="/refund" className="hover:text-primary transition-colors">
                  Refund Policy
                </Link>
              </li>
              <li>
                <a href="https://buildmybot.ai/security" className="hover:text-primary transition-colors">
                  Security
                </a>
              </li>
              <li>
                <a href="https://buildmybot.ai/compliance" className="hover:text-primary transition-colors">
                  GDPR Compliance
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">
            © 2025 BuildMyBot. All rights reserved.
          </p>
          <div className="flex gap-4">
            <a 
              href="https://twitter.com/buildmybot" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-primary transition-colors"
              aria-label="Follow us on Twitter"
            >
              <Twitter className="w-5 h-5" />
            </a>
            <a 
              href="https://linkedin.com/company/buildmybot" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-primary transition-colors"
              aria-label="Connect on LinkedIn"
            >
              <Linkedin className="w-5 h-5" />
            </a>
            <a 
              href="https://github.com/buildmybot" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-primary transition-colors"
              aria-label="View on GitHub"
            >
              <Github className="w-5 h-5" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
