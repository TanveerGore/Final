"use client";

import { useRef } from "react";
import Link from "next/link";
import { motion, useInView } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { BackgroundPattern } from "@/components/ui/background-pattern";
import {
  Rocket,
  Code2,
  Cable,
  MessageSquare,
  Trophy,
  Users,
  Cpu,
  ArrowRight,
  ChevronRight,
  Sparkles,
  UserPlus,
  FolderOpen,
  Wrench,
  Zap,
} from "lucide-react";

function AnimatedSection({
  children,
  className = "",
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, delay, ease: [0.25, 0.4, 0.25, 1] as [number, number, number, number] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

const features = [
  {
    icon: Rocket,
    title: "Interactive Roadmaps",
    description:
      "Follow structured 6-step learning paths from beginner basics to working prototype.",
    color: "from-violet-500 to-purple-600",
  },
  {
    icon: Code2,
    title: "AI Code Generation",
    description:
      "Get production-ready Arduino & ESP code generated and explained by AI.",
    color: "from-cyan-500 to-blue-600",
  },
  {
    icon: Cable,
    title: "Visual Wiring Guides",
    description:
      "Crystal-clear pin mappings and connection diagrams for every component.",
    color: "from-emerald-500 to-green-600",
  },
  {
    icon: MessageSquare,
    title: "Smart Troubleshooting",
    description:
      "Context-aware AI debugging for compile errors and hardware issues.",
    color: "from-amber-500 to-orange-600",
  },
  {
    icon: Trophy,
    title: "Student Progress Tracking",
    description:
      "Track your learning journey with milestones, streaks, and achievements.",
    color: "from-pink-500 to-rose-600",
  },
  {
    icon: Users,
    title: "Teacher Dashboard",
    description:
      "Monitor student progress, assign projects, and manage classrooms.",
    color: "from-indigo-500 to-blue-600",
  },
];

const steps = [
  {
    icon: UserPlus,
    title: "Sign Up",
    description: "Create your account as a student or teacher in seconds.",
  },
  {
    icon: FolderOpen,
    title: "Choose Project",
    description:
      "Pick from curated Arduino & ESP projects matched to your skill level.",
  },
  {
    icon: Wrench,
    title: "Learn & Build",
    description:
      "Follow the AI-guided roadmap from concept to a working circuit.",
  },
];

const stats = [
  { value: "AI-Powered", label: "Intelligent Guidance" },
  { value: "6-Step", label: "Learning Process" },
  { value: "Real-time", label: "Feedback & Help" },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      <BackgroundPattern />

      {/* ── Header ── */}
      <header className="fixed top-0 inset-x-0 z-50 border-b border-white/[0.06] bg-background/60 backdrop-blur-xl">
        <div className="container mx-auto flex items-center justify-between px-4 h-16">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-lg shadow-primary/20">
              <Cpu className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-lg font-bold tracking-tight">
              EmbedAI Learn
            </span>
          </Link>
          <nav className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
            <a
              href="#features"
              className="hover:text-foreground transition-colors"
            >
              Features
            </a>
            <a
              href="#how-it-works"
              className="hover:text-foreground transition-colors"
            >
              How It Works
            </a>
            <a
              href="#stats"
              className="hover:text-foreground transition-colors"
            >
              Why Us
            </a>
          </nav>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/login">Sign In</Link>
            </Button>
            <Button size="sm" className="hidden sm:inline-flex" asChild>
              <Link href="/register">Get Started</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* ── Hero ── */}
      <section className="relative pt-32 pb-24 md:pt-44 md:pb-36 px-4">
        <div className="container mx-auto max-w-5xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/20 bg-primary/5 text-primary text-sm font-medium mb-8"
          >
            <Sparkles className="h-4 w-4" />
            AI-Powered Electronics Learning
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="text-4xl sm:text-5xl md:text-7xl font-extrabold leading-[1.1] tracking-tight mb-6"
          >
            Master Electronics with{" "}
            <span className="bg-gradient-to-r from-primary via-blue-400 to-violet-400 bg-clip-text text-transparent">
              AI-Powered Learning
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed mb-10"
          >
            From concept to circuit — build real Arduino & ESP projects with
            personalized roadmaps, AI-generated code, visual wiring guides, and
            instant troubleshooting.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.35 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Button
              size="lg"
              className="h-13 px-8 text-base font-semibold shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-shadow"
              asChild
            >
              <Link href="/register">
                Get Started
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="h-13 px-8 text-base font-semibold border-border hover:bg-white/5"
              asChild
            >
              <Link href="/login">
                Sign In
                <ChevronRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </motion.div>
        </div>

        {/* Decorative glow */}
        <div className="pointer-events-none absolute inset-x-0 top-1/2 -translate-y-1/2 h-[600px] bg-gradient-to-b from-primary/[0.07] via-transparent to-transparent blur-3xl" />
      </section>

      {/* ── Features ── */}
      <section id="features" className="relative py-24 md:py-32 px-4">
        <div className="container mx-auto max-w-6xl">
          <AnimatedSection className="text-center mb-16">
            <p className="text-sm font-semibold uppercase tracking-widest text-primary mb-3">
              Features
            </p>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight">
              Everything you need to{" "}
              <span className="bg-gradient-to-r from-primary to-violet-400 bg-clip-text text-transparent">
                learn electronics
              </span>
            </h2>
          </AnimatedSection>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((f, i) => (
              <AnimatedSection key={f.title} delay={i * 0.08}>
                <Card className="group relative p-6 bg-white/[0.03] border-white/[0.06] hover:border-primary/30 transition-all duration-300 hover:shadow-xl hover:shadow-primary/5 overflow-hidden h-full">
                  <div
                    className={`h-12 w-12 rounded-xl bg-gradient-to-br ${f.color} flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300`}
                  >
                    <f.icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{f.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {f.description}
                  </p>
                  {/* Subtle shine on hover */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none bg-gradient-to-br from-white/[0.02] to-transparent" />
                </Card>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section id="how-it-works" className="relative py-24 md:py-32 px-4">
        <div className="container mx-auto max-w-4xl">
          <AnimatedSection className="text-center mb-16">
            <p className="text-sm font-semibold uppercase tracking-widest text-primary mb-3">
              How It Works
            </p>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight">
              Three steps to your{" "}
              <span className="bg-gradient-to-r from-primary to-cyan-400 bg-clip-text text-transparent">
                first project
              </span>
            </h2>
          </AnimatedSection>

          <div className="relative grid md:grid-cols-3 gap-8 md:gap-12">
            {/* Connecting line (desktop) */}
            <div className="hidden md:block absolute top-16 left-[16.6%] right-[16.6%] h-px bg-gradient-to-r from-primary/40 via-primary/20 to-primary/40" />

            {steps.map((s, i) => (
              <AnimatedSection
                key={s.title}
                delay={i * 0.15}
                className="text-center relative"
              >
                <div className="relative inline-flex items-center justify-center h-32 w-32 mx-auto mb-6">
                  <div
                    className="absolute inset-0 rounded-full bg-gradient-to-br from-primary/10 to-primary/5 animate-pulse"
                    style={{ animationDelay: `${i * 0.5}s` }}
                  />
                  <div className="relative h-16 w-16 rounded-2xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-lg shadow-primary/20">
                    <s.icon className="h-7 w-7 text-primary-foreground" />
                  </div>
                  <span className="absolute -top-1 -right-1 h-8 w-8 rounded-full bg-background border-2 border-primary flex items-center justify-center text-xs font-bold text-primary">
                    {i + 1}
                  </span>
                </div>
                <h3 className="text-xl font-semibold mb-2">{s.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed max-w-xs mx-auto">
                  {s.description}
                </p>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* ── Stats ── */}
      <section id="stats" className="relative py-24 md:py-32 px-4">
        <div className="container mx-auto max-w-4xl">
          <AnimatedSection className="text-center mb-16">
            <p className="text-sm font-semibold uppercase tracking-widest text-primary mb-3">
              Why EmbedAI Learn
            </p>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight">
              Trusted by{" "}
              <span className="bg-gradient-to-r from-primary to-emerald-400 bg-clip-text text-transparent">
                learners
              </span>
            </h2>
          </AnimatedSection>

          <div className="grid sm:grid-cols-3 gap-6">
            {stats.map((s, i) => (
              <AnimatedSection key={s.label} delay={i * 0.1}>
                <Card className="relative p-8 text-center bg-white/[0.03] border-white/[0.06] hover:border-primary/20 transition-colors overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-b from-primary/[0.04] to-transparent pointer-events-none" />
                  <p className="relative text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-primary to-violet-400 bg-clip-text text-transparent mb-2">
                    {s.value}
                  </p>
                  <p className="relative text-sm text-muted-foreground font-medium">
                    {s.label}
                  </p>
                </Card>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="relative py-24 md:py-32 px-4">
        <AnimatedSection className="container mx-auto max-w-3xl text-center">
          <div className="relative rounded-3xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-sm px-8 py-16 md:py-20 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.08] via-transparent to-violet-500/[0.06] pointer-events-none" />
            <Zap className="relative h-10 w-10 text-primary mx-auto mb-6" />
            <h2 className="relative text-3xl md:text-4xl font-bold tracking-tight mb-4">
              Ready to start building?
            </h2>
            <p className="relative text-muted-foreground max-w-lg mx-auto mb-8 leading-relaxed">
              Join the platform that turns beginners into confident electronics
              makers with the power of AI.
            </p>
            <Button
              size="lg"
              className="relative h-13 px-10 text-base font-semibold shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-shadow"
              asChild
            >
              <Link href="/register">
                Create Free Account
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </AnimatedSection>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-white/[0.06] py-8 px-4">
        <div className="container mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Cpu className="h-4 w-4 text-primary" />
            <span className="font-medium text-foreground">EmbedAI Learn</span>
          </div>
          <p>
            &copy; {new Date().getFullYear()} EmbedAI Learn. All rights
            reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
