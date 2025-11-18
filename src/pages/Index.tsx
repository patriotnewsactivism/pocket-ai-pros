import Header from "@/components/Header";
import Hero from "@/components/Hero";
import TrustBadges from "@/components/TrustBadges";
import Features from "@/components/Features";
import UseCases from "@/components/UseCases";
import TemplateShowcase from "@/components/TemplateShowcase";
import Testimonials from "@/components/Testimonials";
import Integrations from "@/components/Integrations";
import Pricing from "@/components/Pricing";
import Reseller from "@/components/Reseller";
import FAQ from "@/components/FAQ";
import Newsletter from "@/components/Newsletter";
import Footer from "@/components/Footer";
import { SEO } from "@/components/SEO";
import { AIChatbot } from "@/components/AIChatbot";

const Index = () => {
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
          <TemplateShowcase />
          <Testimonials />
          <Integrations />
          <Pricing />
          <Reseller />
          <FAQ />
          <Newsletter />
        </main>
        <Footer />
        <AIChatbot businessType="support" />
      </div>
    </>
  );
};

export default Index;
