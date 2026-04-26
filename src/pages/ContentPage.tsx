import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

interface ContentItem {
  _id: string;
  title: string;
  description: string;
  image: string;
  date: string;
  category: "community" | "press" | "investors";
}

interface ContentPageProps {
  title: string;
  category: ContentItem["category"];
  description?: string;
}

const ContentPage = ({ title, category, description }: ContentPageProps) => {
  const [items, setItems] = useState<ContentItem[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`/api/content/${category}`);
        const data = await res.json();
        setItems(data);
      } catch (err) {
        console.error("Failed to fetch content:", err);
      }
    };
    fetchData();
  }, [category]);

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main className="pt-24 lg:pt-32 pb-20">
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

        {/* Full-width Divider Line (Edge-to-Edge) */}
        <div className="w-full border-t border-slate-200 mb-12 mt-[-40px]"></div>

        <div className="container mx-auto px-6 lg:px-16">
          {items.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {items.map((item, index) => (
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
                      <span 
                        onClick={() => navigate(`/post/${item._id}`)}
                        className="border-b border-slate-600 pb-0.5 cursor-pointer"
                      >
                        Read more
                      </span>
                    </div>
                  </div>
                </motion.article>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-6">
                <span className="text-3xl text-slate-300">📄</span>
              </div>
              <h2 className="text-xl font-semibold text-slate-900 mb-2">No content yet</h2>
              <p className="text-slate-500 max-w-md px-6">
                Check back soon! Our team is working hard to bring you latest updates from the {title.toLowerCase()} section.
              </p>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ContentPage;
