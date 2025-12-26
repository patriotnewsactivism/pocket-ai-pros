<<<<<<< Updated upstream
<<<<<<< Updated upstream
import { Suspense, lazy, useMemo } from "react";
=======
import { useEffect } from "react";
import { useLocation } from "react-router-dom";
>>>>>>> Stashed changes
=======
import { useEffect } from "react";
import { useLocation } from "react-router-dom";
>>>>>>> Stashed changes
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import TrustBadges from "@/components/TrustBadges";
import Features from "@/components/Features";
import UseCases from "@/components/UseCases";
import BusinessTemplates from "@/components/BusinessTemplates";
import Testimonials from "@/components/Testimonials";
import Integrations from "@/components/Integrations";
import Pricing from "@/components/Pricing";
import Reseller from "@/components/Reseller";
import FAQ from "@/components/FAQ";
import Newsletter from "@/components/Newsletter";
import Footer from "@/components/Footer";
import { SEO } from "@/components/SEO";

const Index = () => {
<<<<<<< Updated upstream
<<<<<<< Updated upstream
  const isChatbotEnabled = isChatbotFeatureEnabled();

  const LazyAIChatbot = useMemo(
    () =>
      isChatbotEnabled
        ? lazy(() =>
            import("@/components/AIChatbot").then((module) => ({
              default: module.AIChatbot,
            })),
          )
        : null,
    [isChatbotEnabled],
  );
=======
=======
>>>>>>> Stashed changes
  const location = useLocation();

  useEffect(() => {
    if (location.hash) {
      const elementId = location.hash.replace("#", "");
      requestAnimationFrame(() => {
        const element = document.getElementById(elementId);
        if (element) {
          element.scrollIntoView({ behavior: "smooth" });
        }
      });
    }
  }, [location]);
<<<<<<< Updated upstream
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes

  return (
    <>
      <SEO />
      <div className="min-h-screen">
        <Header />
        <main>
          <Hero />
          <TrustBadges />
          <Features />
          <UseCases />
          <BusinessTemplates />
          <Testimonials />
          <Integrations />
          <Pricing />
          <Reseller />
          <FAQ />
          <Newsletter />
        </main>
        <Footer />
      </div>
    </>
  );
};

export default Index;
