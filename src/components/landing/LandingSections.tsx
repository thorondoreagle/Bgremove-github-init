import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { useRef, useCallback } from "react";
import { ArrowRight, Upload, Sparkles, Download, Zap, Shield, Clock, Image } from "lucide-react";
import { Button } from "@/components/ui/button";

const features = [
  { icon: Zap, title: "Lightning Fast", desc: "Remove backgrounds in under 5 seconds with our optimized AI pipeline." },
  { icon: Shield, title: "Secure Processing", desc: "Your images are encrypted and auto-deleted after 24 hours." },
  { icon: Image, title: "HD Quality", desc: "Support for images up to 5000×5000 pixels in JPG, PNG, and WEBP." },
  { icon: Clock, title: "Batch Processing", desc: "Process multiple images at once with our Pro plan." },
];

const steps = [
  { icon: Upload, num: "01", title: "Upload", desc: "Drag & drop or browse your image file." },
  { icon: Sparkles, num: "02", title: "AI Removes BG", desc: "Our AI precisely detects and removes the background." },
  { icon: Download, num: "03", title: "Download", desc: "Get your transparent PNG instantly." },
];

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.5 } }),
};

export const HeroSection = () => {
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback((f: File | null) => {
    if (!f) return;
    const valid = ["image/jpeg", "image/png", "image/webp"];
    if (!valid.includes(f.type)) return;
    if (f.size > 10 * 1024 * 1024) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const data = e.target?.result as string;
      try {
        sessionStorage.setItem("workspace.initialImage", data);
        sessionStorage.setItem("workspace.initialImageName", f.name || "image.png");
      } catch {}
      navigate("/workspace");
    };
    reader.readAsDataURL(f);
  }, [navigate]);

  const onClick = useCallback(() => {
    inputRef.current?.click();
  }, []);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const f = e.dataTransfer.files?.[0] || null;
    handleFile(f);
  }, [handleFile]);

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  const onPaste = useCallback((e: React.ClipboardEvent) => {
    const f = e.clipboardData.files?.[0] || null;
    if (f) {
      e.preventDefault();
      handleFile(f);
    }
  }, [handleFile]);

  const onKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      inputRef.current?.click();
    }
  }, []);

  return (
    <section className="relative min-h-screen flex items-center justify-center pt-16 overflow-hidden">
      <div className="absolute inset-0 grid-bg opacity-40" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[120px] animate-pulse-glow" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-accent/10 rounded-full blur-[120px] animate-pulse-glow" />

      <div className="container relative mx-auto px-4 py-20 text-center">
        <motion.div initial="hidden" animate="visible" className="max-w-3xl mx-auto">
          <motion.div variants={fadeUp} custom={0} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass border-primary/20 text-sm text-primary mb-6">
            <Sparkles size={14} /> AI-Powered Background Removal
          </motion.div>

          <motion.h1 variants={fadeUp} custom={1} className="font-display text-5xl md:text-7xl font-bold leading-tight mb-6">
            Remove Backgrounds{" "}
            <span className="gradient-text">Instantly</span>
          </motion.h1>

          <motion.p variants={fadeUp} custom={2} className="text-lg md:text-xl text-muted-foreground max-w-xl mx-auto mb-8">
            Upload any image and get a clean, transparent background in seconds. Powered by cutting-edge AI.
          </motion.p>

          <motion.div variants={fadeUp} custom={3} className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/workspace">
              <Button size="lg" className="gradient-btn border-0 text-primary-foreground font-semibold text-base px-8 glow-primary">
                Start Removing <ArrowRight className="ml-2" size={18} />
              </Button>
            </Link>
            <Link to="/pricing">
              <Button size="lg" variant="outline" className="border-border/50 text-foreground hover:bg-muted/50">
                View Pricing
              </Button>
            </Link>
          </motion.div>

          <motion.div variants={fadeUp} custom={4} className="mt-16 relative">
            <div className="glass rounded-2xl p-1 glow-primary max-w-2xl mx-auto">
              <div
                className="bg-muted/30 rounded-xl h-64 md:h-80 flex items-center justify-center checkerboard relative overflow-hidden"
              >
                <div
                  className="absolute inset-0 flex items-center justify-center cursor-pointer"
                  role="button"
                  tabIndex={0}
                  onClick={onClick}
                  onKeyDown={onKeyDown}
                  onDrop={onDrop}
                  onDragOver={onDragOver}
                  onPaste={onPaste}
                >
                  <div className="text-center">
                    <Upload className="mx-auto text-primary/60 mb-3" size={48} />
                    <p className="text-muted-foreground">Drop your image here to try</p>
                  </div>
                  <input
                    ref={inputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    onChange={(e) => handleFile(e.target.files?.[0] || null)}
                  />
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export const FeaturesSection = () => (
  <section id="features" className="py-24 relative">
    <div className="container mx-auto px-4">
      <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-center mb-16">
        <motion.h2 variants={fadeUp} custom={0} className="font-display text-4xl md:text-5xl font-bold mb-4">
          Why <span className="gradient-text">Removix AI</span>?
        </motion.h2>
        <motion.p variants={fadeUp} custom={1} className="text-muted-foreground text-lg max-w-md mx-auto">
          Professional-grade background removal with enterprise features.
        </motion.p>
      </motion.div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {features.map((f, i) => (
          <motion.div
            key={f.title}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            custom={i}
            className="glass glass-hover rounded-2xl p-6 group"
          >
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:glow-primary transition-all">
              <f.icon className="text-primary" size={24} />
            </div>
            <h3 className="font-display font-semibold text-lg mb-2">{f.title}</h3>
            <p className="text-sm text-muted-foreground">{f.desc}</p>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export const HowItWorksSection = () => (
  <section id="how-it-works" className="py-24 relative">
    <div className="container mx-auto px-4">
      <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-center mb-16">
        <motion.h2 variants={fadeUp} custom={0} className="font-display text-4xl md:text-5xl font-bold mb-4">
          How It <span className="gradient-text">Works</span>
        </motion.h2>
      </motion.div>

      <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
        {steps.map((s, i) => (
          <motion.div
            key={s.num}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            custom={i}
            className="text-center"
          >
            <div className="w-20 h-20 rounded-2xl glass mx-auto mb-5 flex items-center justify-center relative">
              <s.icon className="text-primary" size={32} />
              <span className="absolute -top-2 -right-2 text-xs font-bold gradient-btn text-primary-foreground w-7 h-7 rounded-full flex items-center justify-center">
                {s.num}
              </span>
            </div>
            <h3 className="font-display font-semibold text-xl mb-2">{s.title}</h3>
            <p className="text-sm text-muted-foreground">{s.desc}</p>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export const CTASection = () => (
  <section className="py-24 relative">
    <div className="container mx-auto px-4">
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="glass rounded-3xl p-12 md:p-16 text-center relative overflow-hidden"
      >
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[300px] bg-primary/10 rounded-full blur-[120px]" />
        <div className="relative">
          <motion.h2 variants={fadeUp} custom={0} className="font-display text-4xl md:text-5xl font-bold mb-4">
            Ready to Remove Backgrounds?
          </motion.h2>
          <motion.p variants={fadeUp} custom={1} className="text-muted-foreground text-lg max-w-md mx-auto mb-8">
            Start with 100 free images daily. No credit card required.
          </motion.p>
          <motion.div variants={fadeUp} custom={2}>
            <Link to="/register">
              <Button size="lg" className="gradient-btn border-0 text-primary-foreground font-semibold text-base px-10 glow-primary">
                Get Started Free <ArrowRight className="ml-2" size={18} />
              </Button>
            </Link>
          </motion.div>
        </div>
      </motion.div>
    </div>
  </section>
);
