import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";

const Culture = () => {
    return (
        <div className="min-h-screen bg-background">
            <Header />
            <main className="pt-32 pb-20 px-6 lg:px-16">
                <div className="container mx-auto max-w-5xl">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="text-center"
                    >
                        {/* Subtitle */}
                        <p className="text-lg sm:text-xl lg:text-4xl text-foreground mb-2 lg:mb-4">
                            Our guiding cultural principle at Velrona
                        </p>
                        {/* Main Heading */}
                        <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-foreground tracking-tight leading-tight">
                            Excellence begins with alertness
                        </h1>
                    </motion.div>

                    {/* Content Section */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
                        className="mt-16 lg:mt-24 max-w-3xl text-left"
                    >
                        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-semibold text-foreground mb-6">
                            At Velrona, every day is Day 1.
                        </h2>
                        <p className="text-lg lg:text-xl text-foreground leading-relaxed mb-6">
                            Each day brings the chance to shape industries, empower our companies, and redefine what's possible.
                        </p>
                        <p className="text-lg lg:text-xl text-foreground leading-relaxed mb-6">
                            Velrona started as a simple idea: to create a technology ecosystem that drives meaningful impact.
                            With curiosity as our compass and innovation as our engine, we began building solutions that could
                            solve real problems and inspire lasting trust.
                        </p>
                        <p className="text-lg lg:text-xl text-foreground leading-relaxed mb-6">
                            Success didn't happen overnight. It grew through small wins, bold experiments, and relentless
                            perseverance. Step by step, we expanded, learned, and evolved—turning a vision into a network of
                            companies, each advancing the same mission.
                        </p>
                        <p className="text-lg lg:text-xl text-foreground leading-relaxed">
                            This is how we move forward—always curious, always evolving, and always Day 1.
                        </p>
                    </motion.div>
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default Culture;
