import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";

interface Stat {
  label: string;
  value: string;
}

interface BusinessInfo {
  _id?: string;
  title: string;
  description: string;
  image: string;
  pdf?: string;
  grayImage?: string;
  stats?: Stat[];
  tagline?: string;
}

const InvestorBusinessGrid = () => {
  const [businesses, setBusinesses] = useState<BusinessInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchBusinesses = async () => {
      try {
        const res = await fetch("/api/content/investor_businesses");
        const data = await res.json();
        setBusinesses(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Failed to fetch investor businesses:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchBusinesses();
  }, []);

  const stripHtml = (html: string) => {
    const tmp = document.createElement("DIV");
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || "";
  };

  if (isLoading) {
    return (
      <div className="py-20 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  if (businesses.length === 0) return null;

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-6 lg:px-32">
        <div className="mb-16">
          <h2 className="section-heading text-3xl font-bold text-slate-900 mb-2 inline-block relative">
            Our businesses
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-12">
          {businesses.map((business, idx) => (
            <motion.div
              key={business._id || idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="bg-white border border-slate-200 rounded-none p-6 lg:p-8 flex flex-col h-full"
            >
              {/* Top Section: Logo + Description */}
              <div className="flex gap-6 mb-8">
                <div className="w-24 h-24 lg:w-32 lg:h-32 flex-shrink-0 bg-transparent rounded-none overflow-hidden flex items-center justify-center relative group">
                  {/* Grayscale/Default Logo */}
                  <img
                    src={business.grayImage || business.image}
                    alt={`${business.title} logo gray`}
                    className={`max-w-full max-h-full object-contain transition-opacity duration-500 group-hover:opacity-0 ${!business.grayImage ? 'grayscale opacity-70' : ''}`}
                  />
                  {/* Colored/Featured Logo */}
                  <img
                    src={business.image}
                    alt={`${business.title} logo color`}
                    className="absolute inset-0 m-auto max-w-full max-h-full object-contain transition-opacity duration-500 opacity-0 group-hover:opacity-100"
                  />
                </div>
                <div className="flex flex-col pt-1">
                  <h3 className="text-2xl lg:text-3xl font-bold text-slate-900 mb-2 leading-tight">
                    {business.title}
                  </h3>
                  <div className="text-slate-600 text-base lg:text-lg leading-relaxed mb-6 line-clamp-3 overflow-hidden">
                    {stripHtml(business.description)}
                  </div>
                  {business.pdf ? (
                    <a 
                      href={business.pdf.includes('cloudinary.com') 
                        ? business.pdf.replace('/upload/', '/upload/fl_inline/').replace('/raw/upload/', '/image/upload/') + (business.pdf.toLowerCase().endsWith('.pdf') ? '' : '.pdf')
                        : business.pdf
                      } 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-slate-900 font-bold text-base border-b-2 border-slate-200 flex items-center gap-1 mt-auto w-fit pb-1 hover:border-slate-900 transition-colors"
                    >
                      Learn more
                    </a>
                  ) : (
                    <button className="text-slate-900 font-bold text-base border-b-2 border-slate-200 flex items-center gap-1 mt-auto w-fit pb-1">
                      Learn more
                    </button>
                  )}
                </div>
              </div>

              {/* Bottom Section: Stats */}
              <div className="text-base font-semibold text-slate-400 mb-4">
                  {business.tagline || "Q4FY26"}
                </div>
              <div className="mt-auto border-t-2 border-slate-200 pt-6">
                <div className="grid grid-cols-2 gap-2">
                  {business.stats && business.stats.map((stat, sIdx) => (
                    <div key={sIdx} className="flex flex-col">
                      <span className="text-2xl lg:text-3xl font-bold text-slate-900 mb-1">
                        {stat.value}
                      </span>
                      <span className="text-sm lg:text-base text-slate-500 leading-tight">
                        {stat.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default InvestorBusinessGrid;
