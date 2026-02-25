import { motion } from "framer-motion";
import { Upload, Sparkles, Download, CheckCircle, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.5 } }),
};

const steps = [
  {
    num: "01",
    icon: Upload,
    title: "Upload Your Image",
    desc: "Drag and drop or browse to upload your image. We support JPG, PNG, and WEBP formats up to 10 MB.",
    details: ["Drag & drop or click to browse", "Supports JPG, PNG, WEBP", "Max file size: 10 MB", "Max resolution: 5000×5000"],
  },
  {
    num: "02",
    icon: Sparkles,
    title: "AI Removes the Background",
    desc: "Our cutting-edge AI model precisely detects the subject and removes the background in seconds.",
    details: ["Advanced edge detection", "Hair & fur precision", "Processes in under 5 seconds", "Works on any subject"],
  },
  {
    num: "03",
    icon: Download,
    title: "Download Your Result",
    desc: "Get your clean, transparent PNG instantly. Ready for e-commerce, design, social media, and more.",
    details: ["High-resolution transparent PNG", "No watermarks", "Instant download", "Auto-deleted after 24 hours"],
  },
];

const useCases = [
  { title: "E-Commerce", desc: "Create clean product photos for your online store." },
  { title: "Social Media", desc: "Make eye-catching profile pictures and posts." },
  { title: "Graphic Design", desc: "Quickly isolate subjects for design compositions." },
  { title: "Marketing", desc: "Produce professional visuals for ads and campaigns." },
];

const HowItWorks = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 pb-16">
        {/* Hero */}
        <section className="py-16 relative overflow-hidden">
          <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-primary/8 rounded-full blur-[120px] animate-pulse-glow" />
          <div className="container mx-auto px-4 text-center relative">
            <motion.div initial="hidden" animate="visible">
              <motion.h1 variants={fadeUp} custom={0} className="font-display text-4xl md:text-6xl font-bold mb-4">
                How It <span className="gradient-text">Works</span>
              </motion.h1>
              <motion.p variants={fadeUp} custom={1} className="text-lg text-muted-foreground max-w-lg mx-auto">
                Remove backgrounds in three simple steps. No design skills needed.
              </motion.p>
            </motion.div>
          </div>
        </section>

        {/* Steps */}
        <section className="py-16">
          <div className="container mx-auto px-4 max-w-5xl">
            <div className="space-y-16">
              {steps.map((step, i) => (
                <motion.div
                  key={step.num}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  variants={fadeUp}
                  custom={i}
                  className={`flex flex-col md:flex-row items-center gap-10 ${i % 2 === 1 ? "md:flex-row-reverse" : ""}`}
                >
                  {/* Icon card */}
                  <div className="flex-shrink-0">
                    <div className="glass rounded-2xl p-8 glow-primary relative">
                      <span className="absolute -top-3 -left-3 text-xs font-bold bg-primary text-primary-foreground px-3 py-1 rounded-full">
                        Step {step.num}
                      </span>
                      <step.icon className="text-primary" size={64} />
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 text-center md:text-left">
                    <h2 className="font-display text-2xl md:text-3xl font-bold mb-3">{step.title}</h2>
                    <p className="text-muted-foreground mb-4">{step.desc}</p>
                    <ul className="space-y-2">
                      {step.details.map((d) => (
                        <li key={d} className="flex items-center gap-2 text-sm text-muted-foreground md:justify-start justify-center">
                          <CheckCircle className="text-primary flex-shrink-0" size={16} />
                          {d}
                        </li>
                      ))}
                    </ul>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Use Cases */}
        <section className="py-16">
          <div className="container mx-auto px-4 max-w-5xl">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-center mb-12">
              <motion.h2 variants={fadeUp} custom={0} className="font-display text-3xl md:text-4xl font-bold mb-3">
                Perfect <span className="gradient-text">For</span>
              </motion.h2>
              <motion.p variants={fadeUp} custom={1} className="text-muted-foreground">
                Trusted by creators, businesses, and developers worldwide.
              </motion.p>
            </motion.div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {useCases.map((uc, i) => (
                <motion.div
                  key={uc.title}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  variants={fadeUp}
                  custom={i}
                  className="glass glass-hover rounded-2xl p-6 text-center"
                >
                  <h3 className="font-display font-semibold text-lg mb-2">{uc.title}</h3>
                  <p className="text-sm text-muted-foreground">{uc.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16">
          <div className="container mx-auto px-4 text-center">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }}>
              <motion.h2 variants={fadeUp} custom={0} className="font-display text-3xl md:text-4xl font-bold mb-4">
                Ready to <span className="gradient-text">Get Started</span>?
              </motion.h2>
              <motion.p variants={fadeUp} custom={1} className="text-muted-foreground mb-8">
                Start with 20 free images daily. No credit card required.
              </motion.p>
              <motion.div variants={fadeUp} custom={2}>
                <Link to="/workspace">
                  <Button size="lg" className="gradient-btn border-0 text-primary-foreground font-semibold text-base px-8 glow-primary">
                    Try It Now <ArrowRight className="ml-2" size={18} />
                  </Button>
                </Link>
              </motion.div>
            </motion.div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default HowItWorks;
