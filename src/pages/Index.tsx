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
