import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import logo from "@/assets/logo.png";

const Register = () => (
  <div className="min-h-screen bg-background flex items-center justify-center px-4">
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
      <div className="glass rounded-2xl p-8">
        <div className="text-center mb-8">
          <img src={logo} alt="Removix AI" className="h-8 mx-auto mb-4" />
          <h1 className="font-display text-2xl font-bold">Create Account</h1>
          <p className="text-sm text-muted-foreground">Start removing backgrounds for free</p>
        </div>

        <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
          <div>
            <Label htmlFor="name">Full Name</Label>
            <Input id="name" placeholder="John Doe" className="mt-1 bg-muted/30 border-border/50" />
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" placeholder="you@example.com" className="mt-1 bg-muted/30 border-border/50" />
          </div>
          <div>
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" placeholder="••••••••" className="mt-1 bg-muted/30 border-border/50" />
          </div>
          <Button type="submit" className="w-full gradient-btn border-0 text-primary-foreground font-semibold">
            Create Account
          </Button>
        </form>

        <div className="mt-6 text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link to="/login" className="text-primary hover:underline font-medium">Sign In</Link>
        </div>
      </div>
    </motion.div>
  </div>
);

export default Register;
