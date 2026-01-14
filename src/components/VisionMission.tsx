import { motion } from "framer-motion";
import futuristicCity from "@/assets/futuristic-city.jpg";

const VisionMission = () => {
  return (
    <section className="py-20 lg:py-32 bg-background">
      <div className="container mx-auto px-6 lg:px-16">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Text Content */}
          <div className="order-2 lg:order-1">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="mb-12 lg:mb-16"
            >
              <h2 className="section-heading text-3xl lg:text-4xl font-semibold text-foreground">
                Our vision
              </h2>
              <p className="mt-6 text-muted-foreground text-base lg:text-lg leading-relaxed">
                Velrona envisions a connected future where innovation and adaptability fuel sustainable success, enabling our companies to lead industries and deliver lasting impact.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <h2 className="section-heading text-3xl lg:text-4xl font-semibold text-foreground">
                Our mission
              </h2>
              <p className="mt-6 text-muted-foreground text-base lg:text-lg leading-relaxed">
                To endure with purpose, evolve with intent, and empower through innovation - building institutions designed for lasting impact.
              </p>
            </motion.div>
          </div>

          {/* Image */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="order-1 lg:order-2"
          >
            <div className="relative rounded-lg overflow-hidden">
              <img
                src={futuristicCity}
                alt="Futuristic city representing our vision"
                className="w-full h-[300px] sm:h-[400px] lg:h-[500px] object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-velrona-dark/20 to-transparent" />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default VisionMission;