import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Calendar, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ContentItem {
  _id: string;
  title: string;
  description: string;
  image: string;
  pdf?: string;
  date: string;
  category: string;
  sections?: { text: string; image: string }[];
  shortDescription?: string;
}

const PostDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [item, setItem] = useState<ContentItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchItem = async () => {
      try {
        const res = await fetch(`/api/content/item/${id}`);
        if (!res.ok) throw new Error("Item not found");
        const data = await res.json();
        setItem(data);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchItem();
    window.scrollTo(0, 0);
  }, [id]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center">
        <h1 className="text-2xl font-bold mb-4">Post not found</h1>
        <Button onClick={() => navigate(-1)}>Go Back</Button>
      </div>
    );
  }

  // Determine page header title based on category
  const pageTitle = item.category === 'press' ? 'Press Release' : item.category === 'community' ? 'Community' : 'Investors';
  const pageDesc = item.category === 'press' ? "Making an Impact: Velrona Group’s Commitment to Create a Better World Together" : "";
  const investorPdfViewerUrl = item.pdf
    ? `https://docs.google.com/gview?embedded=1&url=${encodeURIComponent(item.pdf)}`
    : "";
  const normalizedDescription = (item.description || "")
    .replace(/font-size\s*:\s*[^;"']+;?/gi, "")
    .replace(/style="\s*"/gi, "")
    .replace(/<p>\s*<br\s*\/?>\s*<\/p>/gi, "");

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main className="pt-24 lg:pt-32 pb-20">
        <div className="container mx-auto px-6 lg:px-16">
          {/* Constant Header (Matches ContentPage) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-12 lg:mb-20 text-center max-w-3xl mx-auto"
          >
            <h1 className="text-4xl lg:text-7xl font-extrabold mb-8 text-black uppercase tracking-tight text-balance">{pageTitle}</h1>
            <p className="text-lg text-slate-500 leading-relaxed text-balance lg:whitespace-nowrap mb-12">
              {pageDesc}
            </p>
          </motion.div>
        </div>

        {/* Full-width Divider Line */}
        <div className="w-full border-t border-slate-200 mb-12 mt-[-40px]"></div>

        <div className="container mx-auto px-6 lg:px-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="max-w-5xl mx-auto"
          >
            <div className="flex items-center gap-3 text-slate-400 text-xs font-bold uppercase tracking-widest mb-8">
              <span className="p-1.5 bg-slate-100 rounded-md">
                <Calendar className="w-3.5 h-3.5 text-slate-500" />
              </span>
              {item.date}
            </div>

            <h2 className="text-3xl lg:text-5xl font-black text-black mb-10 leading-[1.1] tracking-tight">
              {item.title}
            </h2>

            {/* Post image shown in full and constrained for comfortable reading */}
            <div className="w-full max-w-4xl mx-auto mb-12">
              <img
                src={item.image}
                alt={item.title}
                className="w-full h-auto object-contain rounded-xl"
                loading="eager"
              />
            </div>

            <div className="max-w-4xl mx-auto w-full px-4 md:px-0">
              {item.category === "investors" && item.pdf && (
                <div className="max-w-4xl mx-auto mb-8">
                  <a
                    href={investorPdfViewerUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
                  >
                    Open Investor PDF
                  </a>
                </div>
              )}

              {/* Main Content */}
              <div
                className="prose prose-slate lg:prose-xl max-w-4xl mx-auto 
                  prose-p:leading-relaxed prose-p:text-slate-600 prose-p:mt-0 prose-p:mb-6 prose-p:text-[1.3rem] lg:prose-p:text-[1.45rem]
                  [&_p]:!text-[1.3rem] lg:[&_p]:!text-[1.45rem] [&_p_span]:!text-inherit [&_span]:!text-inherit
                  prose-headings:text-black prose-headings:font-bold prose-headings:mt-12 prose-headings:mb-6
                  prose-img:rounded-2xl prose-img:shadow-lg prose-img:my-12
                  prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline
                  prose-strong:text-black prose-strong:font-bold
                  prose-ul:list-disc prose-ul:pl-8 prose-ul:!mt-0 prose-ol:list-decimal prose-ol:pl-8 prose-ol:!mt-0
                  prose-li:text-slate-600 prose-li:my-0 prose-li:text-[1.3rem] lg:prose-li:text-[1.45rem]
                  prose-li:marker:text-slate-600 [&_li::marker]:text-[1.1rem] lg:[&_li::marker]:text-[1.2rem]
                  [&_li]:!text-[1.3rem] lg:[&_li]:!text-[1.45rem] [&_li_span]:!text-inherit [&_li]:!pl-3
                  [&_li_p]:!my-0 [&_ul]:list-disc [&_ol]:list-decimal [&_ul]:!mt-0 [&_ol]:!mt-0
                  break-words mb-12"
                dangerouslySetInnerHTML={{ __html: normalizedDescription }}
              />

              {/* Dynamic Sections */}
              {item.sections && item.sections.length > 0 && (
                <div className="space-y-8">
                  {item.sections.map((section, idx) => (
                    <div key={idx} className="space-y-4">
                      {section.image && (
                        <div className="w-full max-w-2xl mx-auto bg-slate-100 p-2 sm:p-3 rounded-xl shadow-sm">
                          <img
                            src={section.image}
                            alt={`Section ${idx + 1}`}
                            className="w-full h-auto object-contain rounded-lg"
                          />
                        </div>
                      )}
                      {section.text && (
                        <div
                          className="prose prose-slate lg:prose-xl max-w-4xl mx-auto 
                            prose-p:leading-relaxed prose-p:text-slate-600 prose-p:mt-0 prose-p:mb-6 prose-p:text-[1.3rem] lg:prose-p:text-[1.45rem]
                            [&_p]:!text-[1.3rem] lg:[&_p]:!text-[1.45rem] [&_p_span]:!text-inherit [&_span]:!text-inherit
                            prose-headings:text-black prose-headings:font-bold prose-headings:mt-12 prose-headings:mb-6
                            prose-img:rounded-2xl prose-img:shadow-lg prose-img:my-12
                            prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline
                            prose-strong:text-black prose-strong:font-bold
                            prose-ul:list-disc prose-ul:pl-8 prose-ul:!mt-0 prose-ol:list-decimal prose-ol:pl-8 prose-ol:!mt-0
                            prose-li:text-slate-600 prose-li:my-0 prose-li:text-[1.3rem] lg:prose-li:text-[1.45rem]
                            prose-li:marker:text-slate-600 [&_li::marker]:text-[1.1rem] lg:[&_li::marker]:text-[1.2rem]
                            [&_li]:!text-[1.3rem] lg:[&_li]:!text-[1.45rem] [&_li_span]:!text-inherit [&_li]:!pl-3
                            [&_li_p]:!my-0 [&_ul]:list-disc [&_ol]:list-decimal [&_ul]:!mt-0 [&_ol]:!mt-0
                            break-words"
                          dangerouslySetInnerHTML={{ __html: section.text }}
                        />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PostDetail;
