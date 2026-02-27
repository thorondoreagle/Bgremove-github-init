import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import logo from "@/assets/logo.png";
import { Button } from "@/components/ui/button";
import { getCurrentUser, logoutUser } from "@/lib/auth";

const navLinks = [
  { label: "Features", href: "/#features" },
  { label: "How It Works", href: "/how-it-works" },
  { label: "Pricing", href: "/pricing" },
  { label: "API Docs", href: "/api-docs" },
  { label: "History", href: "/workspace?tab=history" },
];

export const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const user = getCurrentUser();
  const onLogout = () => {
    logoutUser();
    navigate("/");
  };

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="fixed top-0 left-0 right-0 z-50 glass border-b border-border/30"
    >
      <div className="container mx-auto flex items-center justify-between h-16 px-4">
        <Link to="/" className="flex items-center gap-2">
          <img src={logo} alt="Removix AI" className="h-8" />
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((l) => (
            <Link
              key={l.href}
              to={l.href}
              className="text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-3">
          {!user ? (
            <>
              <Link to="/login">
                <Button variant="ghost" size="sm">Log In</Button>
              </Link>
              <Link to="/register">
                <Button size="sm" className="gradient-btn border-0 text-primary-foreground font-semibold">
                  Get Started Free
                </Button>
              </Link>
            </>
          ) : (
            <>
              <span className="text-sm text-muted-foreground">Hello, {user.name.split(" ")[0]}</span>
              <Link to="/workspace">
                <Button variant="outline" size="sm" className="border-border/50">My Workspace</Button>
              </Link>
              <Button size="sm" variant="ghost" onClick={onLogout}>Log Out</Button>
            </>
          )}
        </div>

        {/* Mobile toggle */}
        <button
          className="md:hidden text-foreground"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="md:hidden glass border-t border-border/30"
        >
          <div className="container mx-auto px-4 py-4 flex flex-col gap-4">
            {navLinks.map((l) => (
              <Link
                key={l.href}
                to={l.href}
                className="text-muted-foreground hover:text-primary transition-colors"
                onClick={() => setMobileOpen(false)}
              >
                {l.label}
              </Link>
            ))}
            <div className="flex flex-col gap-2 pt-2 border-t border-border/30">
              {!user ? (
                <>
                  <Link to="/login" onClick={() => setMobileOpen(false)}>
                    <Button variant="ghost" className="w-full">Log In</Button>
                  </Link>
                  <Link to="/register" onClick={() => setMobileOpen(false)}>
                    <Button className="w-full gradient-btn border-0 text-primary-foreground font-semibold">
                      Get Started Free
                    </Button>
                  </Link>
                </>
              ) : (
                <>
                  <Link to="/workspace" onClick={() => setMobileOpen(false)}>
                    <Button variant="outline" className="w-full border-border/50">My Workspace</Button>
                  </Link>
                  <Button onClick={() => { setMobileOpen(false); onLogout(); }} className="w-full" variant="ghost">Log Out</Button>
                </>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </motion.header>
  );
};
