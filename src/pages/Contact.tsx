import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";
import { Mail, Phone, MapPin, Send } from "lucide-react";
import { useState } from "react";

const Contact = () => {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        subject: "",
        message: "",
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Form submission logic will go here
        console.log("Form submitted:", formData);
        // Reset form
        setFormData({ name: "", email: "", subject: "", message: "" });
    };

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    return (
        <div className="min-h-screen bg-background">
            <Header />
            <main className="pt-32 pb-20 px-6 lg:px-16">
                <div className="container mx-auto max-w-7xl">
                    {/* Page Title */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="text-center mb-16 lg:mb-24"
                    >
                        <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold text-foreground tracking-tight mb-4">
                            Get in Touch
                        </h1>
                        <p className="text-lg sm:text-xl lg:text-2xl text-muted-foreground max-w-2xl mx-auto">
                            Have a question or want to work together? We'd love to hear from you.
                        </p>
                    </motion.div>

                    {/* Content Grid */}
                    <div className="grid lg:grid-cols-2 gap-12 lg:gap-16">
                        {/* Contact Form */}
                        <motion.div
                            initial={{ opacity: 0, x: -30 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
                        >
                            <h2 className="text-2xl sm:text-3xl font-semibold text-foreground mb-6">
                                Send us a Message
                            </h2>
                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* Name Field */}
                                <div>
                                    <label
                                        htmlFor="name"
                                        className="block text-sm font-medium text-foreground mb-2"
                                    >
                                        Name
                                    </label>
                                    <input
                                        type="text"
                                        id="name"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-4 py-3 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all"
                                        placeholder="Your name"
                                    />
                                </div>

                                {/* Email Field */}
                                <div>
                                    <label
                                        htmlFor="email"
                                        className="block text-sm font-medium text-foreground mb-2"
                                    >
                                        Email
                                    </label>
                                    <input
                                        type="email"
                                        id="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-4 py-3 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all"
                                        placeholder="support@velrona.com"
                                    />
                                </div>

                                {/* Subject Field */}
                                <div>
                                    <label
                                        htmlFor="subject"
                                        className="block text-sm font-medium text-foreground mb-2"
                                    >
                                        Subject
                                    </label>
                                    <input
                                        type="text"
                                        id="subject"
                                        name="subject"
                                        value={formData.subject}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-4 py-3 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all"
                                        placeholder="How can we help?"
                                    />
                                </div>

                                {/* Message Field */}
                                <div>
                                    <label
                                        htmlFor="message"
                                        className="block text-sm font-medium text-foreground mb-2"
                                    >
                                        Message
                                    </label>
                                    <textarea
                                        id="message"
                                        name="message"
                                        value={formData.message}
                                        onChange={handleChange}
                                        required
                                        rows={6}
                                        className="w-full px-4 py-3 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all resize-none"
                                        placeholder="Tell us more about your inquiry..."
                                    />
                                </div>

                                {/* Submit Button */}
                                <button
                                    type="submit"
                                    className="w-full sm:w-auto px-8 py-3 bg-foreground text-background rounded-lg font-medium flex items-center justify-center gap-2 hover:bg-accent hover:text-accent-foreground transition-all duration-300 group"
                                >
                                    <span>Send Message</span>
                                    <Send
                                        size={18}
                                        className="group-hover:translate-x-1 transition-transform duration-300"
                                    />
                                </button>
                            </form>
                        </motion.div>

                        {/* Contact Information */}
                        <motion.div
                            initial={{ opacity: 0, x: 30 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
                            className="lg:pl-8"
                        >
                            <h2 className="text-2xl sm:text-3xl font-semibold text-foreground mb-6">
                                Contact Information
                            </h2>
                            <p className="text-lg text-muted-foreground mb-8">
                                Reach out to us through any of the following channels. We're here to help!
                            </p>

                            <div className="space-y-6">
                                {/* Email */}
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
                                        <Mail size={24} className="text-accent" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold text-foreground mb-1">
                                            Email
                                        </h3>
                                        <a
                                            href="mailto:support@velrona.com"
                                            className="text-muted-foreground hover:text-accent transition-colors"
                                        >
                                            support@velrona.com
                                        </a>
                                    </div>
                                </div>

                                {/* Phone */}
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
                                        <Phone size={24} className="text-accent" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold text-foreground mb-1">
                                            Phone
                                        </h3>
                                        <a
                                            href="tel:+917708850564"
                                            className="text-muted-foreground hover:text-accent transition-colors"
                                        >
                                            +91 77088 50564
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default Contact;
