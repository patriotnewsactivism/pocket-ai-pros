import { Suspense, lazy, useEffect, useMemo } from "react";
import { useLocation } from "react-router-dom";

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
import { env } from "@/config/env";
import { resolveChatbotBusinessType } from "@/lib/chatbot-config";

export const isChatbotFeatureEnabled = (flags: typeof env = env) =>
  Boolean(flags.enableChatWidget && flags.enableAIChatbot);

const Index = () => {
  const location = useLocation();
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

  const businessType = resolveChatbotBusinessType();

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
          {!isChatbotEnabled && (
            <div className="py-6 text-center text-sm text-muted-foreground">
              Chat assistant is currently unavailable.
            </div>
          )}
        </main>
        <Footer />
      </div>
      {isChatbotEnabled && LazyAIChatbot && (
        <Suspense fallback={null}>
          <div data-testid="ai-chatbot">
            <LazyAIChatbot businessType={businessType} />
          </div>
        </Suspense>
      )}
    </>
  );
};

export default Index;
