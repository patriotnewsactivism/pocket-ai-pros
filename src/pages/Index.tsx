import { Suspense, lazy, useMemo } from "react";
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

export const isChatbotFeatureEnabled = (config = env) =>
  config.enableChatWidget && config.enableAIChatbot;

const chatbotPlaceholder = (
  <div className="sr-only" aria-live="polite">
    Chat assistant is currently unavailable.
  </div>
);

const Index = () => {
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
        {isChatbotEnabled && LazyAIChatbot ? (
          <Suspense fallback={<div className="sr-only">Loading chat assistant...</div>}>
            <LazyAIChatbot businessType="support" />
          </Suspense>
        ) : (
          chatbotPlaceholder
        )}
      </div>
    </>
  );
};

export default Index;
