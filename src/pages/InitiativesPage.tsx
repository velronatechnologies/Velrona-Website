import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { ChevronRight } from "lucide-react";

interface InitiativesPageProps {
  type: "csr" | "non-csr";
}

const InitiativesPage = ({ type }: InitiativesPageProps) => {
  const [activeYear, setActiveYear] = useState("2026");

  const title = type === "csr" ? "CSR Initiatives" : "Non-CSR Initiatives";
  const years = ["2026", "2025"];

  const content = {
    csr: {
      description: "At Velrona, we believe that true success is measured by the positive impact we create in society. Our Corporate Social Responsibility (CSR) initiatives are focused on sustainable development, education, and community empowerment.",
      highlights: [
        { year: "2026", title: "Green Energy Project", desc: "Successfully transitioned 40% of our production facilities to solar energy, reducing our carbon footprint significantly." },
        { year: "2025", title: "Education for All", desc: "Launched a scholarship program that supported over 500 students in rural areas to pursue higher education." },
      ]
    },
    "non-csr": {
      description: "Beyond our formal CSR commitments, Velrona engages in various community-driven activities and ecosystem-building efforts. These initiatives foster innovation, collaboration, and growth across our diverse business verticals.",
      highlights: [
        { year: "2026", title: "Startup Accelerator", desc: "Launched a mentorship program for emerging tech startups in the fintech and agritech sectors." },
        { year: "2025", title: "Community Tech Hub", desc: "Opened three free-to-use co-working spaces equipped with high-speed internet for local developers." },
      ]
    }
  };

  const activeContent = content[type];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      <main className="flex-grow pt-32 pb-20">
        {/* Heading Section */}
        <div className="container mx-auto px-6 lg:px-16 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-4xl lg:text-7xl font-extrabold text-foreground mb-8 text-balance uppercase tracking-tight">
              Making an impact
            </h1>
          </motion.div>
        </div>

        {/* Full-width Divider Line (Edge-to-Edge) */}
        <div className="w-full border-t border-border mb-12"></div>

        <div className="container mx-auto px-6 lg:px-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <h2 className="text-2xl lg:text-4xl font-bold text-foreground mb-10 uppercase tracking-widest">
              {title}
            </h2>
            <p className="max-w-3xl mx-auto text-lg lg:text-xl text-muted-foreground leading-relaxed text-balance mb-20">
              {activeContent.description}
            </p>
          </motion.div>

          {/* Highlights Section */}
          <div className="mt-20">
            <div className="flex flex-col md:flex-row items-center justify-between border-b border-border pb-8 mb-12">
              <h3 className="text-2xl font-bold text-foreground flex items-center gap-3 mb-6 md:mb-0">
                Highlights
                <span className="w-2 h-2 bg-accent rounded-full"></span>
              </h3>

              <div className="flex items-center gap-8">
                {years.map((year) => (
                  <button
                    key={year}
                    onClick={() => setActiveYear(year)}
                    className={`text-lg font-medium transition-all ${activeYear === year
                        ? "text-accent scale-110"
                        : "text-muted-foreground hover:text-foreground"
                      }`}
                  >
                    {year}
                  </button>
                ))}
              </div>
            </div>

            {/* Content Display based on Year */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeYear}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center bg-slate-50 p-8 lg:p-16 rounded-[2rem]"
              >
                <div>
                  <span className="text-5xl font-black text-slate-200 block mb-6">{activeYear}</span>
                  <h4 className="text-3xl font-bold text-foreground mb-6 text-balance">
                    {activeContent.highlights.find(h => h.year === activeYear)?.title}
                  </h4>
                  <p className="text-lg text-muted-foreground leading-relaxed mb-8 text-balance">
                    {activeContent.highlights.find(h => h.year === activeYear)?.desc}
                  </p>
                  <button className="flex items-center gap-2 text-accent font-semibold group">
                    Learn more <ChevronRight size={18} className="transition-transform group-hover:translate-x-1" />
                  </button>
                </div>
                <div className="aspect-video bg-white rounded-3xl shadow-sm overflow-hidden border border-border flex items-center justify-center">
                  {/* Placeholder for images/graphs */}
                  <div className="text-slate-300 text-sm italic font-medium">Impact visualization for {activeYear}</div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default InitiativesPage;
