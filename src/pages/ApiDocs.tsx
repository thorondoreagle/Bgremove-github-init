import { motion } from "framer-motion";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Code, Copy, Check } from "lucide-react";
import { useState } from "react";

const codeExample = `curl -X POST https://api.removix.ai/v1/remove \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"image_url": "https://example.com/photo.jpg"}'`;

const ApiDocs = () => {
  const [copied, setCopied] = useState(false);

  const copyCode = () => {
    navigator.clipboard.writeText(codeExample);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-3xl">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Code className="text-primary" size={20} />
              </div>
              <h1 className="font-display text-3xl font-bold">API Documentation</h1>
            </div>

            <div className="glass rounded-2xl p-8 mb-8">
              <h2 className="font-display text-xl font-semibold mb-3">Getting Started</h2>
              <p className="text-muted-foreground mb-4">
                Integrate background removal into your app with our REST API. Get your API key from the dashboard.
              </p>

              <h3 className="font-semibold text-foreground mb-2">Base URL</h3>
              <code className="block bg-muted/50 rounded-lg px-4 py-2 text-sm text-primary mb-6 font-mono">
                https://api.removix.ai/v1
              </code>

              <h3 className="font-semibold text-foreground mb-2">Remove Background</h3>
              <div className="relative">
                <pre className="bg-muted/50 rounded-lg p-4 text-sm text-foreground overflow-x-auto font-mono">
                  {codeExample}
                </pre>
                <button
                  onClick={copyCode}
                  className="absolute top-3 right-3 p-1.5 rounded-md bg-muted hover:bg-border transition-colors"
                >
                  {copied ? <Check size={14} className="text-primary" /> : <Copy size={14} className="text-muted-foreground" />}
                </button>
              </div>
            </div>

            <div className="glass rounded-2xl p-8">
              <h2 className="font-display text-xl font-semibold mb-3">Rate Limits</h2>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { plan: "Free", limit: "20 req/day" },
                  { plan: "Pro", limit: "1000 req/min" },
                  { plan: "Credits", limit: "Based on balance" },
                  { plan: "Enterprise", limit: "Custom" },
                ].map((r) => (
                  <div key={r.plan} className="bg-muted/30 rounded-lg p-4">
                    <p className="text-sm text-muted-foreground">{r.plan}</p>
                    <p className="font-semibold text-foreground">{r.limit}</p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ApiDocs;
