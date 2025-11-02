import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react"; // 'Bot' icon removed
import { useState } from "react";
import { ContactDialog } from "./ContactDialog";
import { LogoIcon } from "./LogoIcon"; // Import the new LogoIcon

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
      setMobileMenuOpen(false);
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border" role="banner">
      <nav className="container mx-auto px-4 py-4" role="navigation" aria-label="Main navigation">
        <div className="flex items-center justify-between">
          {/* --- NEW LOGO AND LOGOTYPE --- */}
          <div className="flex items-center gap-3">
            <LogoIcon className="w-9 h-9" />
            <span className="text-xl font-bold tracking-tight">
              BUILD<span className="font-light opacity-80">MY</span>BOT
              <span className="text-lg font-light text-primary opacity-90 ml-1">.APP</span>
            </span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <button 
              onClick={() => scrollToSection("features")}
              className="text-foreground hover:text-primary transition-colors"
              aria-label="Navigate to features section"
            >
              Features
            </button>
            <button 
              onClick={() => scrollToSection("pricing")}
              className="text-foreground hover:text-primary transition-colors"
              aria-label="Navigate to pricing section"
            >
              Pricing
            </button>
            <button 
              onClick={() => scrollToSection("reseller")}
              className="text-foreground hover:text-primary transition-colors"
              aria-label="Navigate to reseller program section"
            >
              Reseller Program
            </button>
            <a href="/auth"><Button variant="hero" size="sm">Get Started Free</Button></a>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-4 pb-4 space-y-4">
            <button 
              onClick={() => scrollToSection("features")}
              className="block w-full text-left py-2 text-foreground hover:text-primary transition-colors"
              aria-label="Navigate to features section"
            >
              Features
            </button>
            <button 
              onClick={() => scrollToSection("pricing")}
              className="block w-full text-left py-2 text-foreground hover:text-primary transition-colors"
              aria-label="Navigate to pricing section"
            >
              Pricing
            </button>
            <button 
              onClick={() => scrollToSection("reseller")}
              className="block w-full text-left py-2 text-foreground hover:text-primary transition-colors"
              aria-label="Navigate to reseller program section"
            >
              Reseller Program
            </button>
            <a href="/auth" className="w-full"><Button variant="hero" size="sm" className="w-full">Get Started Free</Button></a>
          </div>
        )}
      </nav>
    </header>
  );
};

export default Header;
