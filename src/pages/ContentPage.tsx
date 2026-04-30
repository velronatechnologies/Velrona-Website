import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowRight, FileText } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import InvestorBusinessGrid from "@/components/InvestorBusinessGrid";

interface ContentItem {
  _id: string;
  title: string;
  description: string;
  image: string;
  pdf?: string;
  date: string;
  category: "community" | "press" | "investors" | "investor_overview";
  group?: string;
  sections?: { text: string; image: string }[];
}

interface ContentPageProps {
  title: string;
  category: ContentItem["category"];
  description?: string;
}

const ContentPage = ({ title, category, description }: ContentPageProps) => {
  const [items, setItems] = useState<ContentItem[]>([]);
  const navigate = useNavigate();
  const isInvestorsPage = category === "investors";
  const investorsOverviewEntries = [
    "Presentation",
    "Q3FY26 results",
    "Shareholders' Letter",
    "Earnings Call Replay",
    "Earnings Call Transcript",
  ];

  const getNativeViewerUrl = (pdfUrl: string) => {
    if (!pdfUrl) return "#";
    // Using Google Docs viewer as it's the most compatible with Cloudinary raw links
    return `https://docs.google.com/gview?url=${encodeURIComponent(pdfUrl)}`;
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const timestamp = new Date().getTime();
        // Use the all_types endpoint which we know returns everything including PDFs
        const res = await fetch(`/api/content/all_types?t=${timestamp}`);
        const data = await res.json();
        console.log("Investor Items Fetched:", data);
        setItems(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Failed to fetch content:", err);
      }
    };
    fetchData();
  }, [category, isInvestorsPage]);

  // Robust matching function
  const findItemByTitle = (title: string) => {
    if (!title || !items || !Array.isArray(items)) return null;
    const searchTitle = title.trim().toLowerCase();

    // Search across ALL fetched items to be safe
    return items.find(item => {
      const itemTitle = item.title?.trim().toLowerCase();
      if (!itemTitle) return false;
      return itemTitle === searchTitle ||
        itemTitle.includes(searchTitle) ||
        searchTitle.includes(itemTitle);
    });
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main className={isInvestorsPage ? "pt-16 lg:pt-20 pb-20" : "pt-24 lg:pt-32 pb-20"}>
        {isInvestorsPage ? (
          <section
            className="relative w-full overflow-hidden"
            style={{
              backgroundImage: "linear-gradient(rgba(8, 15, 35, 0.5), rgba(8, 15, 35, 0.5)), url('/investor%20bg.jpg')",
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          >
            <div className="container mx-auto px-5 sm:px-6 lg:px-16 py-8 sm:py-10 lg:py-14 grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(320px,420px)] items-center gap-8 lg:gap-12">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-0 sm:mt-2 lg:mt-0 max-w-2xl"
              >
                <h1 className="text-4xl sm:text-5xl lg:text-[55px] font-semibold text-white tracking-tight leading-[0.95]">Investor Relations</h1>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.08 }}
                className="w-full max-w-md lg:max-w-[420px] mx-auto lg:mx-0 lg:justify-self-end bg-white/90 backdrop-blur-sm border border-white/40 shadow-sm p-4 sm:p-5 lg:p-6"
              >
                <h2 className="text-xl sm:text-2xl leading-none tracking-tight font-semibold text-slate-900 mb-4 sm:mb-5">Company overview</h2>
                <div className="space-y-1">
                  {investorsOverviewEntries.map((entry, idx) => {
                    const isHeading = entry === "Q3FY26 results";
                    // Find the matching item from the database
                    const dbItem = findItemByTitle(entry);
                    const pdfUrl = dbItem?.pdf;

                    return (
                      <div
                        key={`${entry}-${idx}`}
                        className={`border-t border-slate-200 ${isHeading ? "pt-5 pb-4" : "py-3.5"}`}
                      >
                        {isHeading ? (
                          <h3 className="text-lg sm:text-xl leading-none tracking-tight font-semibold text-slate-900">
                            {entry}
                          </h3>
                        ) : (
                          <a
                            href={getNativeViewerUrl(pdfUrl || "")}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`flex items-center justify-between gap-3 group ${!pdfUrl ? "opacity-60 grayscale cursor-not-allowed" : ""}`}
                            onClick={(e) => !pdfUrl && e.preventDefault()}
                          >
                            <span className="min-w-0 flex items-center gap-3">
                              <FileText className="w-3.5 h-3.5 text-blue-700 flex-shrink-0" />
                              <span className="text-base sm:text-lg leading-tight text-slate-900 truncate">{entry}</span>
                            </span>
                            <span className="w-7 h-7 rounded-full border border-slate-400 flex items-center justify-center transition-colors group-hover:bg-slate-900 group-hover:border-slate-900 group-hover:text-white">
                              <ArrowRight className="w-3.5 h-3.5" />
                            </span>
                          </a>
                        )}
                      </div>
                    );
                  })}
                </div>


                <button
                  type="button"
                  onClick={() => {
                    const section = document.getElementById("investors-content-list");
                    section?.scrollIntoView({ behavior: "smooth", block: "start" });
                  }}
                  className="mt-5 text-lg sm:text-xl leading-none font-medium text-slate-900 border-b border-slate-300 hover:border-slate-900"
                >
                  View all
                </button>
              </motion.div>
            </div>
          </section>
        ) : (
          <>
            <div className="container mx-auto px-6 lg:px-16">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-12 lg:mb-20 text-center max-w-3xl mx-auto"
              >
                <h1 className="text-4xl lg:text-7xl font-extrabold mb-8 text-black uppercase tracking-tight text-balance">{title}</h1>
                <p className="text-lg text-slate-500 leading-relaxed text-balance lg:whitespace-nowrap mb-12">
                  {description || `Discover the latest updates, stories, and opportunities within the Velrona ecosystem.`}
                </p>
              </motion.div>
            </div>

            <div className="w-full border-t border-slate-200 mb-12 mt-[-40px]"></div>
          </>
        )}

        <div id="investors-content-list" className="container mx-auto px-6 lg:px-16 mt-12">
          {items.filter(item => item.category === category).length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {items.filter(item => item.category === category).map((item, index) => (
                <motion.article
                  key={item._id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="flex flex-col bg-[#EFEFEF] px-3 py-6 rounded-none"
                >
                  <div
                    className="aspect-[16/9] relative overflow-hidden mb-5 bg-white rounded-none mt-[-6px] cursor-pointer"
                    onClick={() => navigate(`/post/${item._id}`)}
                  >
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex flex-col flex-1">
                    <h3
                      className="text-xl lg:text-2xl font-bold mb-8 text-black leading-tight cursor-pointer"
                      onClick={() => navigate(`/post/${item._id}`)}
                    >
                      {item.title}
                    </h3>

                    <div className="mt-auto flex items-center justify-between text-[10px] font-bold text-slate-600 uppercase tracking-widest">
                      <span>{item.date}</span>
                      {item.category === "investors" && item.pdf ? (
                        <a
                          href={getNativeViewerUrl(item.pdf)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="border-b border-slate-600 pb-0.5"
                        >
                          Open PDF
                        </a>
                      ) : (
                        <span
                          onClick={() => navigate(`/post/${item._id}`)}
                          className="border-b border-slate-600 pb-0.5 cursor-pointer"
                        >
                          Read more
                        </span>
                      )}
                    </div>
                  </div>
                </motion.article>
              ))}
            </div>
          ) : null}
        </div>

        {isInvestorsPage && <InvestorBusinessGrid />}
      </main>
      <Footer />
    </div>
  );
};

export default ContentPage;
