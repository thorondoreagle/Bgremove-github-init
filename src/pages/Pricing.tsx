import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Check, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

const plans = [
  {
    name: "Free",
    price: "PKR 0",
    period: "forever",
    desc: "Perfect for trying out",
    features: ["100 images/day", "Standard quality", "JPG & PNG support", "Web downloads"],
    cta: "Get Started",
    popular: false,
  },
  {
    name: "Pro",
    price: "PKR 499",
    period: "/month",
    desc: "For professionals & teams",
    features: ["Unlimited images", "HD quality output", "All formats (WEBP)", "Batch processing", "Priority support", "API access"],
    cta: "Upgrade to Pro",
    popular: true,
  },
  {
    name: "Credits",
    price: "PKR 99",
    period: "/ 50 credits",
    desc: "Pay as you go",
    features: ["200 images/day", "HD quality output", "All formats", "No expiry", "API access"],
    cta: "Buy Credits",
    popular: false,
  },
];

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.5 } }),
};

const Pricing = () => (
  <div className="min-h-screen bg-background">
    <Navbar />
    <main className="pt-24 pb-16">
      <div className="container mx-auto px-4">
        <motion.div initial="hidden" animate="visible" className="text-center mb-16">
          <motion.h1 variants={fadeUp} custom={0} className="font-display text-4xl md:text-5xl font-bold mb-4">
            Simple, Transparent <span className="gradient-text">Pricing</span>
          </motion.h1>
          <motion.p variants={fadeUp} custom={1} className="text-muted-foreground text-lg max-w-md mx-auto">
            Start free. Scale as you grow.
          </motion.p>
          <motion.p variants={fadeUp} custom={2} className="text-sm text-muted-foreground max-w-md mx-auto mt-2">
            All paid packages are valid for one month.
          </motion.p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial="hidden"
              animate="visible"
              variants={fadeUp}
              custom={i + 2}
              className={`glass rounded-2xl p-8 relative ${plan.popular ? "border-primary/50 glow-primary" : ""}`}
            >
              {plan.popular && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 gradient-btn text-primary-foreground text-xs font-semibold px-4 py-1 rounded-full">
                  Most Popular
                </span>
              )}
              <h3 className="font-display font-bold text-xl mb-1">{plan.name}</h3>
              <p className="text-sm text-muted-foreground mb-4">{plan.desc}</p>
              <div className="mb-6">
                <span className="font-display text-4xl font-bold">{plan.price}</span>
                <span className="text-muted-foreground text-sm ml-1">{plan.period}</span>
              </div>
              <ul className="space-y-3 mb-8">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Check size={16} className="text-primary flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link to={plan.name === "Credits" ? "/workspace?plan=credits" : "/register"}>
                <Button
                  className={`w-full ${plan.popular ? "gradient-btn border-0 text-primary-foreground font-semibold" : ""}`}
                  variant={plan.popular ? "default" : "outline"}
                >
                  {plan.cta} {plan.popular && <ArrowRight className="ml-2" size={16} />}
                </Button>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </main>
    <Footer />
  </div>
);

export default Pricing;
