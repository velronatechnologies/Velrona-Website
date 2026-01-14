import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import BusinessCarousel from "@/components/BusinessCarousel";
import VisionMission from "@/components/VisionMission";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <HeroSection />
        <BusinessCarousel />
        <VisionMission />
      </main>
      <Footer />
    </div>
  );
};

export default Index;