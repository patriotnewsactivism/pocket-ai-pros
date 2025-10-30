import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Features from "@/components/Features";
import Pricing from "@/components/Pricing";
import Reseller from "@/components/Reseller";
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
          <Features />
          <Pricing />
          <Reseller />
        </main>
        <Footer />
      </div>
    </>
  );
};

export default Index;
