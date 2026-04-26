import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { ChevronRight } from "lucide-react";

interface InitiativesPageProps {
  type: "csr" | "non-csr";
}

interface CommunityItem {
  _id: string;
  title: string;
  description: string;
  image: string;
  date: string;
  category: "community";
  communityType?: "csr" | "non-csr";
  pinned?: boolean;
}

const extractYear = (dateValue: string) => {
  const yearMatch = dateValue?.match(/\b(19|20)\d{2}\b/);
  return yearMatch?.[0] ?? "";
};

const stripHtml = (html: string) =>
  (html || "")
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();

const InitiativesPage = ({ type }: InitiativesPageProps) => {
  const currentYear = String(new Date().getFullYear());
  const [activeYear, setActiveYear] = useState("");
  const [hasManuallySelectedYear, setHasManuallySelectedYear] = useState(false);
  const [prioritizePinned, setPrioritizePinned] = useState(false);
  const [items, setItems] = useState<CommunityItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  const title = type === "csr" ? "CSR Initiatives" : "Non-CSR Initiatives";
  const descriptionByType = {
    csr: "At Velrona, we believe that true success is measured by the positive impact we create in society. Our Corporate Social Responsibility (CSR) initiatives are focused on sustainable development, education, and community empowerment.",
    "non-csr": "Beyond our formal CSR commitments, Velrona engages in various community-driven activities and ecosystem-building efforts. These initiatives foster innovation, collaboration, and growth across our diverse business verticals.",
  };

  useEffect(() => {
    setHasManuallySelectedYear(false);
    setActiveYear("");

    const fetchHighlights = async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/content/community?communityType=${encodeURIComponent(type)}`);
        if (!res.ok) {
          throw new Error("Failed to fetch community highlights");
        }
        const data: CommunityItem[] = await res.json();
        setItems(data);
      } catch (err) {
        console.error(err);
        setItems([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchHighlights();
  }, [type]);

  const years = useMemo(() => {
    const fixedYears = ["2025"];
    const uniqueYears = new Set([
      ...items.map((item) => extractYear(item.date)).filter(Boolean),
      ...fixedYears,
    ]);
    return [...uniqueYears].sort((a, b) => Number(b) - Number(a));
  }, [items]);

  useEffect(() => {
    if (!years.length) {
      setActiveYear("");
      return;
    }

    if (!hasManuallySelectedYear && years.includes(currentYear)) {
      setActiveYear(currentYear);
      return;
    }

    if (!activeYear || !years.includes(activeYear)) {
      setActiveYear(years.includes(currentYear) ? currentYear : years[0]);
    }
  }, [years, activeYear, currentYear, hasManuallySelectedYear]);

  const highlightedItems = useMemo(() => {
    if (!items.length) return [];

    const yearItems = items.filter((item) => !activeYear || extractYear(item.date) === activeYear);

    if (!prioritizePinned) {
      return yearItems;
    }

    return yearItems.filter((item) => Boolean(item.pinned));
  }, [items, activeYear, prioritizePinned]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      <main className="flex-grow pt-24 lg:pt-32 pb-16 lg:pb-20">
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
              {descriptionByType[type]}
            </p>
          </motion.div>

          {/* Highlights Section */}
          <div className="mt-20">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between border-b border-border pb-6 md:pb-8 mb-8 md:mb-12 gap-5 md:gap-0">
              <button
                type="button"
                onClick={() => setPrioritizePinned((prev) => !prev)}
                className={`inline-flex items-center gap-3 text-2xl font-bold text-foreground ${prioritizePinned ? "underline underline-offset-8" : ""}`}
              >
                Highlights
                <span className="w-2 h-2 rounded-full bg-accent"></span>
              </button>

              <div className="flex items-center gap-3 sm:gap-6 flex-wrap">
                {years.map((year) => (
                  <button
                    key={year}
                    onClick={() => {
                      setHasManuallySelectedYear(true);
                      setActiveYear(year);
                    }}
                    className={`text-base sm:text-lg font-medium transition-all ${activeYear === year
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
            {isLoading ? (
              <div className="bg-slate-50 p-8 lg:p-16 rounded-[2rem] border border-border/60 text-center text-muted-foreground">
                Loading highlights...
              </div>
            ) : highlightedItems.length ? (
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeYear || "all-years"}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  {highlightedItems.map((item) => (
                    <div
                      key={item._id}
                      className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center bg-slate-50 p-5 sm:p-8 lg:p-14 rounded-[2rem]"
                    >
                      <div>
                        <span className="text-4xl sm:text-5xl font-black text-slate-200 block mb-5">
                          {extractYear(item.date) || activeYear}
                        </span>
                        <h4 className="text-2xl sm:text-3xl font-bold text-foreground mb-4 sm:mb-6 text-balance">
                          {item.title}
                        </h4>
                        <p className="text-base sm:text-lg text-muted-foreground leading-relaxed mb-6 sm:mb-8 text-balance">
                          {stripHtml(item.description)}
                        </p>
                        <button
                          onClick={() => navigate(`/post/${item._id}`)}
                          className="flex items-center gap-2 text-accent font-semibold group"
                        >
                          Learn more <ChevronRight size={18} className="transition-transform group-hover:translate-x-1" />
                        </button>
                      </div>
                      <div
                        className="aspect-video bg-white rounded-3xl shadow-sm overflow-hidden border border-border cursor-pointer"
                        onClick={() => navigate(`/post/${item._id}`)}
                      >
                        <img
                          src={item.image}
                          alt={item.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>
                  ))}
                </motion.div>
              </AnimatePresence>
            ) : (
              <div className="bg-slate-50 p-8 lg:p-16 rounded-[2rem] border-2 border-dashed border-slate-200 text-center text-muted-foreground">
                {items.length
                  ? prioritizePinned
                    ? `No pinned highlights found for ${activeYear}. Pin a ${title.toLowerCase()} post from Admin to show it here.`
                    : `No highlights published for ${activeYear}. Any new ${title.toLowerCase()} post in this year will appear here automatically.`
                  : `No highlights published yet. Any new ${title.toLowerCase()} post will appear here automatically.`}
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default InitiativesPage;
