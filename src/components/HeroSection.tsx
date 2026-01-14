import { ChevronDown } from "lucide-react";
import { motion } from "framer-motion";
import founderImage from "@/assets/founder.jpg";
import PixelBlast from "@/components/ui/pixel-blast";

const HeroSection = () => {
  const scrollToNext = () => {
    const businessSection = document.getElementById("businesses");
    if (businessSection) {
      businessSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section id="home" className="relative flex flex-col items-center justify-center min-h-screen bg-white px-6 py-16 overflow-hidden">

      {/* PixelBlast Background */}
      <div className="absolute inset-0 w-full h-full opacity-30">
        <PixelBlast
          variant="square"
          pixelSize={4}
          color="#21201f"
          patternScale={2}
          patternDensity={0.6}
          enableRipples
          rippleSpeed={0.3}
          rippleThickness={0.1}
          rippleIntensityScale={0.5}
          speed={0.5}
          transparent
          edgeFade={0.25}
        />
      </div>

      <div className="container mx-auto flex items-center justify-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-center max-w-6xl"
        >
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-light text-foreground tracking-tight">
            <div className="mb-8">Velrona isn't just a company.</div>
            <div>It's a vision with purpose.</div>
          </h1>
        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.6 }}
        className="absolute bottom-8 sm:bottom-12 left-1/2 transform -translate-x-1/2 z-10"
      >
        <button
          onClick={scrollToNext}
          className="scroll-indicator"
          aria-label="Scroll down"
        >
          <ChevronDown size={20} />
        </button>
      </motion.div>
    </section>
  );
};

export default HeroSection;