import { useState, useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";

// Import gray images (default state)
import onekitGray from "@/assets/onekit_gray.jpg";
import ticpinGray from "@/assets/ticpin_gray.jpg";
import cauryGray from "@/assets/caury_gray.jpg";
import ofranGray from "@/assets/ofran_gray.jpg";

// Import org images (hover state)
import onekitOrg from "@/assets/onekit_org.jpg";
import ticpinOrg from "@/assets/ticpin_org.jpg";
import cauryOrg from "@/assets/caury_org.jpg";
import ofranOrg from "@/assets/ofran_org.jpg";

interface Business {
  id: number;
  name: string;
  tagline: string;
  subtitle: string;
  description: string;
  bgColor: "yellow" | "dark";
  grayImage: string;
  orgImage: string;
}

const businesses: Business[] = [
  {
    id: 1,
    name: "Onekit",
    tagline: "",
    subtitle: "Onekit Inc",
    description: "Bringing ideas to life, one brand at a time. Onekit Inc partners with businesses to create impactful marketing through strategy, design, and storytelling.",
    bgColor: "dark",
    grayImage: onekitGray,
    orgImage: onekitOrg,
  },
  {
    id: 2,
    name: "Ticpin",
    tagline: "A VELRONA COMPANY",
    subtitle: "Ticpin",
    description: "Turning everyday plans into experiences. Ticpin helps you discover, book, and enjoy the best of dining, sports, and events - all in one place.",
    bgColor: "yellow",
    grayImage: ticpinGray,
    orgImage: ticpinOrg,
  },
  {
    id: 3,
    name: "Caury",
    tagline: "",
    subtitle: "Caury Farms",
    description: "From cared cows to conscious living. Caury Farms offers authentic cow-based products produced ethically and supplied directly from the source.",
    bgColor: "dark",
    grayImage: cauryGray,
    orgImage: cauryOrg,
  },
  {
    id: 4,
    name: "Ofran",
    tagline: "",
    subtitle: "Ofran",
    description: "Simplifying compliance, one business at a time. Ofran helps entrepreneurs register, protect, and manage their businesses with reliable legal and compliance services.",
    bgColor: "dark",
    grayImage: ofranGray,
    orgImage: ofranOrg,
  },
];

const BusinessCarousel = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const carouselRef = useRef<HTMLDivElement>(null);

  const scrollTo = (direction: "prev" | "next") => {
    const newIndex = direction === "next"
      ? Math.min(currentIndex + 1, businesses.length - 1)
      : Math.max(currentIndex - 1, 0);

    setCurrentIndex(newIndex);

    if (carouselRef.current) {
      const cardWidth = carouselRef.current.querySelector(".business-card-container")?.clientWidth || 400;
      carouselRef.current.scrollTo({
        left: newIndex * (cardWidth + 24),
        behavior: "smooth",
      });
    }
  };

  return (
    <section id="businesses" className="py-20 lg:py-32 bg-background">
      <div className="container mx-auto px-6 lg:px-16">
        {/* Section Header */}
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between mb-12 lg:mb-16 gap-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="section-heading text-3xl lg:text-4xl font-semibold text-foreground">
              Our businesses
            </h2>
            <p className="mt-6 max-w-3xl text-left text-muted-foreground text-lg lg:text-xl leading-relaxed">
              <span className="inline-block">
                As a parent organization, Velrona empowers its group companies with a common foundation of innovation,
              </span>
              <br />
              <span className="inline-block">adaptability, and excellence.</span>
            </p>
          </motion.div>

          {/* Navigation Arrows */}
          <div className="flex gap-3">
            <button
              onClick={() => scrollTo("prev")}
              disabled={currentIndex === 0}
              className="carousel-nav"
              aria-label="Previous"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={() => scrollTo("next")}
              disabled={currentIndex >= businesses.length - 1}
              className="carousel-nav"
              aria-label="Next"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>

        {/* Carousel */}
        <div
          ref={carouselRef}
          className="flex gap-6 overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-4 px-6 lg:px-0"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {businesses.map((business, index) => (
            <motion.div
              key={business.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="business-card-container flex-shrink-0 w-[320px] sm:w-[360px] lg:w-[420px] snap-start group"
            >
              {/* Image Card with Hover Effect */}
              <div className="business-card aspect-[4/3] relative overflow-hidden rounded-2xl cursor-pointer shadow-md transition-opacity duration-700">
                {/* Gray Image (default) */}
                <img
                  src={business.grayImage}
                  alt={`${business.name} - default`}
                  className="absolute inset-0 w-full h-full object-cover transition-opacity duration-700 group-hover:opacity-0"
                  style={{ transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)' }}
                />
                {/* Colored Image (on hover) */}
                <img
                  src={business.orgImage}
                  alt={`${business.name} - colored`}
                  className="absolute inset-0 w-full h-full object-cover transition-opacity duration-700 opacity-0 group-hover:opacity-100"
                  style={{ transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)' }}
                />
              </div>
              <div className="mt-6 px-2">
                <h4 className="text-xl lg:text-2xl font-semibold text-foreground">
                  {business.subtitle}
                </h4>
                <p className="mt-2 text-base lg:text-lg text-muted-foreground leading-relaxed">
                  {business.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BusinessCarousel;