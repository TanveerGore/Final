"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Cpu, Mail, Lock, ArrowRight, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const ease: [number, number, number, number] = [0.16, 1, 0.3, 1];

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please fill in all fields");
      return;
    }
    setIsLoading(true);
    try {
      await login(email, password);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease }}
    >
      {/* Logo */}
      <motion.div
        className="flex items-center justify-center gap-3 mb-10"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease, delay: 0.1 }}
      >
        <div className="flex items-center justify-center size-10 rounded-lg bg-primary/10 border border-primary/20">
          <Cpu className="size-5 text-primary" />
        </div>
        <span className="text-xl font-semibold tracking-tight">
          EmbedAI Learn
        </span>
      </motion.div>

      {/* Card */}
      <motion.div
        className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-8 shadow-2xl"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease, delay: 0.15 }}
      >
        <div className="mb-8">
          <h1 className="text-2xl font-semibold tracking-tight">
            Welcome back
          </h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Sign in to continue to your dashboard
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <motion.div
            className="space-y-2"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease, delay: 0.25 }}
          >
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10 h-11 bg-white/[0.03] border-white/[0.08] focus-visible:border-primary/50"
                autoComplete="email"
              />
            </div>
          </motion.div>

          <motion.div
            className="space-y-2"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease, delay: 0.3 }}
          >
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10 h-11 bg-white/[0.03] border-white/[0.08] focus-visible:border-primary/50"
                autoComplete="current-password"
              />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease, delay: 0.35 }}
          >
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-11 text-sm font-medium mt-1"
              size="lg"
            >
              {isLoading ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <>
                  Sign In
                  <ArrowRight className="size-4" />
                </>
              )}
            </Button>
          </motion.div>
        </form>
      </motion.div>

      {/* Footer link */}
      <motion.p
        className="mt-6 text-center text-sm text-muted-foreground"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, ease, delay: 0.45 }}
      >
        Don&apos;t have an account?{" "}
        <Link
          href="/register"
          className="font-medium text-primary hover:text-primary/80 transition-colors"
        >
          Create account
        </Link>
      </motion.p>
    </motion.div>
  );
}
