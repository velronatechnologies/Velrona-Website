import { useState, useEffect, useRef } from "react";
import { Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import { motion, useMotionValue, animate } from "framer-motion";

interface Business {
  id: string | number;
  name: string;
  tagline: string;
  subtitle: string;
  description: string;
  grayImage: string;
  orgImage: string;
}

const BusinessCarousel = () => {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);

  useEffect(() => {
    const fetchBusinesses = async () => {
      try {
        const res = await fetch("/api/content/investor_businesses");
        const data = await res.json();
        
        if (Array.isArray(data) && data.length > 0) {
          const mapped = data.map((item: any) => ({
            id: item._id,
            name: item.title,
            tagline: item.tagline || "",
            subtitle: item.title,
            description: item.description.replace(/<[^>]*>/g, ''),
            grayImage: item.grayImage || item.image,
            orgImage: item.image
          }));
          setBusinesses(mapped);
        }
      } catch (err) {
        console.error("Failed to fetch businesses:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchBusinesses();
  }, []);

  const handleScroll = (direction: "left" | "right") => {
    if (!containerRef.current) return;
    const containerWidth = containerRef.current.offsetWidth;
    const cardWidth = 420 + 32; // card width + gap
    const shift = direction === "left" ? containerWidth : -containerWidth;
    
    // Simple programmatic scroll using motion
    const currentX = x.get();
    const targetX = currentX + shift;
    
    // Constrain targetX
    const maxScroll = -(businesses.length * cardWidth - containerWidth);
    const clampedX = Math.max(Math.min(0, targetX), maxScroll);
    
    animate(x, clampedX, {
      type: "spring",
      stiffness: 300,
      damping: 30
    });
  };

  if (isLoading) {
    return (
      <div className="py-20 flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  if (businesses.length === 0) return null;

  return (
    <section id="businesses" className="py-20 lg:py-32 bg-background overflow-hidden">
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
              onClick={() => handleScroll("left")}
              className="w-10 h-10 rounded-full border border-slate-200 flex items-center justify-center hover:bg-slate-900 hover:text-white transition-colors"
              aria-label="Previous"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={() => handleScroll("right")}
              className="w-10 h-10 rounded-full border border-slate-200 flex items-center justify-center hover:bg-slate-900 hover:text-white transition-colors"
              aria-label="Next"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>

        {/* Draggable Carousel Container */}
        <div className="relative cursor-grab active:cursor-grabbing">
          <motion.div
            ref={containerRef}
            drag="x"
            dragConstraints={{ left: -((businesses.length * 452) - (containerRef.current?.offsetWidth || 0)), right: 0 }}
            style={{ x }}
            className="flex gap-8"
          >
            {businesses.map((business, index) => (
              <motion.div
                key={business.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="flex-shrink-0 w-[300px] sm:w-[360px] lg:w-[420px] group select-none"
              >
                {/* Image Card with Hover Effect */}
                <div className="aspect-[4/3] relative overflow-hidden rounded-2xl pointer-events-none group-hover:pointer-events-auto">
                  <img
                    src={business.grayImage}
                    alt={`${business.name} - default`}
                    className="absolute inset-0 w-full h-full object-cover transition-opacity duration-700 group-hover:opacity-0"
                    style={{ transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)' }}
                  />
                  <img
                    src={business.orgImage}
                    alt={`${business.name} - colored`}
                    className="absolute inset-0 w-full h-full object-cover transition-opacity duration-700 opacity-0 group-hover:opacity-100"
                    style={{ transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)' }}
                  />
                </div>
                <div className="mt-6 pointer-events-none">
                  <h4 className="text-xl lg:text-2xl font-semibold text-foreground">
                    {business.subtitle}
                  </h4>
                  <p className="mt-2 text-base lg:text-lg text-muted-foreground leading-relaxed">
                    {business.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default BusinessCarousel;