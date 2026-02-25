import { Link } from "react-router-dom";
import logo from "@/assets/logo.png";

const footerLinks = {
  Product: [
    { label: "Features", href: "/#features" },
    { label: "Pricing", href: "/pricing" },
    { label: "API", href: "/api-docs" },
  ],
  Company: [
    { label: "About", href: "/about" },
    { label: "Blog", href: "/blog" },
    { label: "Contact", href: "/contact" },
  ],
  Legal: [
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Terms of Service", href: "/terms" },
  ],
};

export const Footer = () => (
  <footer className="border-t border-border/30 bg-card/30">
    <div className="container mx-auto px-4 py-12">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
        <div className="col-span-2 md:col-span-1">
          <img src={logo} alt="Removix AI" className="h-8 mb-4" />
          <p className="text-sm text-muted-foreground max-w-xs">
            AI-powered background removal in seconds. Clean, fast, professional.
          </p>
        </div>
        {Object.entries(footerLinks).map(([title, links]) => (
          <div key={title}>
            <h4 className="font-display font-semibold text-foreground mb-3">{title}</h4>
            <ul className="space-y-2">
              {links.map((l) => (
                <li key={l.href}>
                  <Link to={l.href} className="text-sm text-muted-foreground hover:text-primary transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="mt-10 pt-6 border-t border-border/30 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} Removix AI. All rights reserved.
      </div>
    </div>
  </footer>
);
