import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";

const TermsConditions = () => {
    return (
        <div className="min-h-screen bg-background">
            <Header />
            <main className="pt-24 pb-16 px-6 lg:px-16">
                <div className="container mx-auto max-w-4xl">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        {/* Header */}
                        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4">
                            Terms & Conditions
                        </h1>
                        <p className="text-sm text-muted-foreground mb-12">
                            Last updated on Jan 14, 2025.
                        </p>

                        {/* Introduction */}
                        <div className="prose prose-slate max-w-none mb-8">
                            <p className="text-base lg:text-lg text-foreground leading-relaxed mb-6">
                                Welcome to Velrona Technologies Private Limited ("Velrona", "we", "our", or "us").
                                By accessing or using our websites, applications, platforms, or services ("Services"),
                                you agree to be bound by these Terms and Conditions ("T&C"). Please read them carefully.
                            </p>
                            <p className="text-base lg:text-lg text-foreground leading-relaxed mb-12">
                                If you do not agree to these T&C, you may not use our Services.
                            </p>
                        </div>

                        {/* Sections */}
                        <div className="space-y-10">
                            {/* Section 1 */}
                            <section>
                                <h2 className="text-xl lg:text-2xl font-semibold text-foreground mb-4">
                                    1. Our Group Companies
                                </h2>
                                <p className="text-base lg:text-lg text-foreground leading-relaxed mb-4">
                                    Velrona is the parent company of a network of companies that provide technology-enabled
                                    products and services. This includes:
                                </p>
                                <ul className="list-disc pl-6 space-y-2 text-base lg:text-lg text-foreground">
                                    <li><strong>Onekit Inc</strong> – A creative marketing agency delivering branding, advertising, and digital marketing solutions.</li>
                                    <li><strong>Ticpin</strong> – A ticketing platform for events, dining, and turf bookings.</li>
                                    <li><strong>Ofran</strong> – Provides legal services for businesses.</li>
                                    <li><strong>Caury Farms</strong> – Produces cow products and manages coconut farms.</li>
                                </ul>
                                <p className="text-base lg:text-lg text-foreground leading-relaxed mt-4">
                                    These T&C apply to all Services offered by Velrona and its group companies.
                                </p>
                            </section>

                            {/* Section 2 */}
                            <section>
                                <h2 className="text-xl lg:text-2xl font-semibold text-foreground mb-4">
                                    2. Eligibility
                                </h2>
                                <p className="text-base lg:text-lg text-foreground leading-relaxed">
                                    You must be at least 18 years of age, or the age of majority in your jurisdiction, to use
                                    our Services. By using our Services, you represent and warrant that you meet these requirements.
                                </p>
                            </section>

                            {/* Section 3 */}
                            <section>
                                <h2 className="text-xl lg:text-2xl font-semibold text-foreground mb-4">
                                    3. Account Registration
                                </h2>
                                <ol className="list-decimal pl-6 space-y-3 text-base lg:text-lg text-foreground">
                                    <li>
                                        Certain Services may require creating an account. You agree to provide accurate, current,
                                        and complete information during registration and to update it as necessary.
                                    </li>
                                    <li>
                                        You are responsible for maintaining the confidentiality of your account credentials. Any
                                        activity conducted through your account is your responsibility.
                                    </li>
                                    <li>
                                        Velrona and its group companies reserve the right to suspend or terminate accounts that
                                        violate these T&C or are suspected of fraudulent activity.
                                    </li>
                                </ol>
                            </section>

                            {/* Section 4 */}
                            <section>
                                <h2 className="text-xl lg:text-2xl font-semibold text-foreground mb-4">
                                    4. Use of Services
                                </h2>
                                <ol className="list-decimal pl-6 space-y-3 text-base lg:text-lg text-foreground">
                                    <li>You agree to use our Services only for lawful purposes and in accordance with these T&C.</li>
                                    <li>
                                        You must not:
                                        <ul className="list-disc pl-6 mt-2 space-y-1">
                                            <li>Use the Services for illegal or unauthorized purposes;</li>
                                            <li>Violate any applicable laws, regulations, or third-party rights;</li>
                                            <li>Attempt to interfere with the proper functioning of the Services.</li>
                                        </ul>
                                    </li>
                                </ol>
                            </section>

                            {/* Section 5 */}
                            <section>
                                <h2 className="text-xl lg:text-2xl font-semibold text-foreground mb-4">
                                    5. Intellectual Property
                                </h2>
                                <ol className="list-decimal pl-6 space-y-3 text-base lg:text-lg text-foreground">
                                    <li>
                                        All content, trademarks, logos, designs, software, and other materials on the Services are
                                        the property of Velrona or its group companies, or their licensors.
                                    </li>
                                    <li>
                                        You may not reproduce, modify, distribute, or create derivative works from our content
                                        without prior written permission.
                                    </li>
                                </ol>
                            </section>

                            {/* Section 6 */}
                            <section>
                                <h2 className="text-xl lg:text-2xl font-semibold text-foreground mb-4">
                                    6. Third-Party Services
                                </h2>
                                <ol className="list-decimal pl-6 space-y-3 text-base lg:text-lg text-foreground">
                                    <li>
                                        Velrona or its group companies may provide links to third-party websites or integrate
                                        third-party services. We are not responsible for their content, privacy practices, or terms.
                                    </li>
                                    <li>
                                        Use of third-party services is at your own risk and subject to the third-party's terms.
                                    </li>
                                </ol>
                            </section>

                            {/* Section 7 */}
                            <section>
                                <h2 className="text-xl lg:text-2xl font-semibold text-foreground mb-4">
                                    7. Payment and Billing
                                </h2>
                                <ol className="list-decimal pl-6 space-y-3 text-base lg:text-lg text-foreground">
                                    <li>Any fees for Services must be paid according to the terms specified at the time of purchase.</li>
                                    <li>All payments are non-refundable unless otherwise explicitly stated.</li>
                                    <li>
                                        Velrona and its group companies reserve the right to change pricing and payment terms,
                                        provided notice is given where required by law.
                                    </li>
                                </ol>
                            </section>

                            {/* Section 8 */}
                            <section>
                                <h2 className="text-xl lg:text-2xl font-semibold text-foreground mb-4">
                                    8. Privacy
                                </h2>
                                <p className="text-base lg:text-lg text-foreground leading-relaxed">
                                    Use of the Services is also governed by Velrona's Privacy Policy, which explains how we
                                    collect, use, and protect your information.
                                </p>
                            </section>

                            {/* Section 9 */}
                            <section>
                                <h2 className="text-xl lg:text-2xl font-semibold text-foreground mb-4">
                                    9. Disclaimers
                                </h2>
                                <ol className="list-decimal pl-6 space-y-3 text-base lg:text-lg text-foreground">
                                    <li>
                                        The Services are provided "as is" and "as available." Velrona and its group companies make
                                        no warranties of any kind, express or implied, regarding the accuracy, reliability, or
                                        availability of the Services.
                                    </li>
                                    <li>
                                        Velrona and its group companies are not responsible for any loss, damage, or injury resulting
                                        from your use of the Services.
                                    </li>
                                </ol>
                            </section>

                            {/* Section 10 */}
                            <section>
                                <h2 className="text-xl lg:text-2xl font-semibold text-foreground mb-4">
                                    10. Limitation of Liability
                                </h2>
                                <p className="text-base lg:text-lg text-foreground leading-relaxed">
                                    To the fullest extent permitted by law, Velrona, its group companies, affiliates, officers,
                                    directors, employees, and agents will not be liable for any indirect, incidental, consequential,
                                    or punitive damages arising from your use of the Services.
                                </p>
                            </section>

                            {/* Section 11 */}
                            <section>
                                <h2 className="text-xl lg:text-2xl font-semibold text-foreground mb-4">
                                    11. Indemnification
                                </h2>
                                <p className="text-base lg:text-lg text-foreground leading-relaxed mb-3">
                                    You agree to indemnify and hold Velrona, its group companies, affiliates, and their respective
                                    officers and employees harmless from any claims, damages, losses, liabilities, and expenses
                                    arising from:
                                </p>
                                <ul className="list-disc pl-6 space-y-2 text-base lg:text-lg text-foreground">
                                    <li>Your use of the Services;</li>
                                    <li>Violation of these T&C; or</li>
                                    <li>Violation of applicable laws or third-party rights.</li>
                                </ul>
                            </section>

                            {/* Section 12 */}
                            <section>
                                <h2 className="text-xl lg:text-2xl font-semibold text-foreground mb-4">
                                    12. Termination
                                </h2>
                                <p className="text-base lg:text-lg text-foreground leading-relaxed">
                                    Velrona and its group companies reserve the right to suspend or terminate your access to the
                                    Services at any time, with or without cause, and without prior notice.
                                </p>
                            </section>

                            {/* Section 13 */}
                            <section>
                                <h2 className="text-xl lg:text-2xl font-semibold text-foreground mb-4">
                                    13. Governing Law and Jurisdiction
                                </h2>
                                <p className="text-base lg:text-lg text-foreground leading-relaxed">
                                    These T&C are governed by and construed in accordance with the laws of India. Any disputes
                                    arising under or in connection with these T&C shall be subject to the exclusive jurisdiction
                                    of the courts in Coimbatore, India.
                                </p>
                            </section>

                            {/* Section 14 */}
                            <section>
                                <h2 className="text-xl lg:text-2xl font-semibold text-foreground mb-4">
                                    14. Changes to Terms & Conditions
                                </h2>
                                <p className="text-base lg:text-lg text-foreground leading-relaxed">
                                    Velrona may update these T&C from time to time. The revised terms will be posted on the
                                    website/app with the effective date. Your continued use of the Services after changes
                                    constitutes acceptance of the updated T&C.
                                </p>
                            </section>

                            {/* Section 15 */}
                            <section>
                                <h2 className="text-xl lg:text-2xl font-semibold text-foreground mb-4">
                                    15. Contact Us
                                </h2>
                                <p className="text-base lg:text-lg text-foreground leading-relaxed mb-3">
                                    If you have any questions or concerns about these T&C, please contact us at:
                                </p>
                                <div className="bg-muted/30 rounded-lg p-6 border border-border">
                                    <p className="text-base lg:text-lg text-foreground font-semibold mb-2">
                                        Velrona Technologies Private Limited
                                    </p>
                                    <p className="text-base lg:text-lg text-foreground">
                                        Email: <a href="mailto:velronatechnologies@gmail.com" className="text-accent hover:underline">
                                            velronatechnologies@gmail.com
                                        </a>
                                    </p>
                                </div>
                            </section>
                        </div>
                    </motion.div>
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default TermsConditions;
