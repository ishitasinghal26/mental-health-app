import "../styles/LandingPage.css";
import LandingNavbar from "../components/landing/LandingNavbar";
import HeroSection from "../components/landing/HeroSection";
import WhySection from "../components/landing/WhySection";
import FeaturesSection from "../components/landing/FeaturesSection";
import HowItWorksSection from "../components/landing/HowItWorksSection";
import BenefitsSection from "../components/landing/BenefitsSection";
import PricingSection from "../components/landing/PricingSection";
import AudienceSection from "../components/landing/AudienceSection";
import PrivacySection from "../components/landing/PrivacySection";
import FAQSection from "../components/landing/FAQSection";
import Footer from "../components/landing/Footer";

function LandingPage() {
  return (
    <div className="landing-root">
      <LandingNavbar />
      <HeroSection />
      <WhySection />
      <FeaturesSection />
      <HowItWorksSection />
      <BenefitsSection />
      <PricingSection />
      <AudienceSection />
      <PrivacySection />
      <FAQSection />
      <Footer />
    </div>
  );
}

export default LandingPage;

