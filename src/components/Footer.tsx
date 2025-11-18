import { Bot, Mail } from "lucide-react";
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
                <button onClick={() => scrollToSection("templates")} className="hover:text-primary transition-colors">
                  Templates
                </button>
              </li>
              <li>
                <button onClick={() => scrollToSection("integrations")} className="hover:text-primary transition-colors">
                  Integrations
                </button>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Company</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link to="/about" className="hover:text-primary transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/blog" className="hover:text-primary transition-colors">
                  Blog
                </Link>
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
                <Link to="/careers" className="hover:text-primary transition-colors">
                  Careers
                </Link>
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
            </ul>
          </div>
        </div>

        <div className="border-t border-border pt-8">
          <p className="text-sm text-muted-foreground text-center">
            © 2025 BuildMyBot. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
