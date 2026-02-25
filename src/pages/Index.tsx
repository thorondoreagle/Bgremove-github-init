import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { HeroSection, FeaturesSection, HowItWorksSection, CTASection } from "@/components/landing/LandingSections";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <HeroSection />
        <FeaturesSection />
        <HowItWorksSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
