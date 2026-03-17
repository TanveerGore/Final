"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Cpu,
  User,
  Mail,
  Lock,
  ArrowRight,
  Loader2,
  GraduationCap,
  BookOpen,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const ease: [number, number, number, number] = [0.16, 1, 0.3, 1];

type Role = "student" | "teacher";

export default function RegisterPage() {
  const { register } = useAuth();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState<Role>("student");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !email || !password || !confirmPassword) {
      toast.error("Please fill in all fields");
      return;
    }
    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    setIsLoading(true);
    try {
      await register(username, email, password, role);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setIsLoading(false);
    }
  };

  const roles: {
    value: Role;
    label: string;
    desc: string;
    icon: typeof GraduationCap;
  }[] = [
    {
      value: "student",
      label: "Student",
      desc: "Learn & build projects",
      icon: GraduationCap,
    },
    {
      value: "teacher",
      label: "Teacher",
      desc: "Create & manage courses",
      icon: BookOpen,
    },
  ];

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
            Create your account
          </h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Get started with EmbedAI Learn
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Role selector */}
          <motion.div
            className="space-y-2"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease, delay: 0.2 }}
          >
            <Label>I am a</Label>
            <div className="grid grid-cols-2 gap-3">
              {roles.map((r) => {
                const isSelected = role === r.value;
                return (
                  <button
                    key={r.value}
                    type="button"
                    onClick={() => setRole(r.value)}
                    className={`
                      relative flex flex-col items-center gap-2 rounded-xl border p-4
                      transition-all duration-200 cursor-pointer text-center
                      ${
                        isSelected
                          ? "border-primary/60 bg-primary/[0.08] shadow-[0_0_24px_-4px] shadow-primary/25"
                          : "border-white/[0.08] bg-white/[0.02] hover:border-white/[0.14] hover:bg-white/[0.04]"
                      }
                    `}
                  >
                    <r.icon
                      className={`size-5 ${isSelected ? "text-primary" : "text-muted-foreground"}`}
                    />
                    <div>
                      <div
                        className={`text-sm font-medium ${isSelected ? "text-foreground" : "text-muted-foreground"}`}
                      >
                        {r.label}
                      </div>
                      <div className="text-xs text-muted-foreground mt-0.5">
                        {r.desc}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </motion.div>

          {/* Username */}
          <motion.div
            className="space-y-2"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease, delay: 0.25 }}
          >
            <Label htmlFor="username">Username</Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
              <Input
                id="username"
                type="text"
                placeholder="johndoe"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="pl-10 h-11 bg-white/[0.03] border-white/[0.08] focus-visible:border-primary/50"
                autoComplete="username"
              />
            </div>
          </motion.div>

          {/* Email */}
          <motion.div
            className="space-y-2"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease, delay: 0.3 }}
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

          {/* Password */}
          <motion.div
            className="space-y-2"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease, delay: 0.35 }}
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
                autoComplete="new-password"
              />
            </div>
          </motion.div>

          {/* Confirm password */}
          <motion.div
            className="space-y-2"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease, delay: 0.4 }}
          >
            <Label htmlFor="confirm-password">Confirm password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
              <Input
                id="confirm-password"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="pl-10 h-11 bg-white/[0.03] border-white/[0.08] focus-visible:border-primary/50"
                autoComplete="new-password"
              />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease, delay: 0.45 }}
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
                  Create Account
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
        transition={{ duration: 0.4, ease, delay: 0.55 }}
      >
        Already have an account?{" "}
        <Link
          href="/login"
          className="font-medium text-primary hover:text-primary/80 transition-colors"
        >
          Sign in
        </Link>
      </motion.p>
    </motion.div>
  );
}
