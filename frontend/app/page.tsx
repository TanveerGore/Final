"use client";

<<<<<<< HEAD
import { useRouter } from "next/navigation";
import { useRef } from "react";
import { motion, useScroll, useTransform, useSpring, useInView } from "framer-motion";
import {
  Zap, MessageSquare, Code2, Cpu, CircuitBoard, ArrowRight, Brain,
  Layers, BookOpen, Sparkles, Terminal, Wifi, ChevronDown
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Spotlight } from "@/components/ui/spotlight";
import { Arduino3DViewer } from "@/components/ui/arduino-3d-viewer";
import { ParticleBackground } from "@/components/ui/particle-background";
import { TextScramble } from "@/components/ui/text-scramble";

/* ─── Feature data ─── */
const features = [
  {
    icon: Brain,
    title: "AI Tutor Agent",
    description: "Context-aware AI that understands your project & guides you through circuits, debugging, and electronics theory.",
    color: "primary",
  },
  {
    icon: Code2,
    title: "Code Generator",
    description: "Generate production-ready Arduino code from natural language descriptions. Compile & flash from the browser.",
    color: "accent",
  },
  {
    icon: CircuitBoard,
    title: "Wiring Planner",
    description: "AI-generated wiring diagrams with pin-by-pin connection guides. Never wire wrong again.",
    color: "primary",
  },
  {
    icon: Layers,
    title: "Adaptive Learning",
    description: "Two learning paths — structured Basic modules for beginners, and AI-Adaptive agent that personalizes to your pace.",
    color: "accent",
  },
];

const agents = [
  { name: "Name Agent", desc: "Identifies project from vague descriptions", icon: Sparkles },
  { name: "Code Agent", desc: "Generates C++/Arduino code", icon: Terminal },
  { name: "QA Agent", desc: "Troubleshoots hardware & software issues", icon: MessageSquare },
  { name: "Wiring Agent", desc: "Plans component connections", icon: Wifi },
];

/* ─── Animated section wrapper ─── */
function AnimatedSection({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 60 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
=======
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
>>>>>>> 03ef4f7e5e1a0fc91a38965b199ee23522ef5efb
      className={className}
    >
      {children}
    </motion.div>
  );
}

<<<<<<< HEAD
/* ─── Landing Page ─── */
export default function Landing() {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: containerRef });
  
  // Smooth scroll progress
  const smoothProgress = useSpring(scrollYProgress, { stiffness: 50, damping: 20 });
  
  // Parallax layers
  const parallax1 = useTransform(smoothProgress, [0, 1], [0, -300]);
  const parallax2 = useTransform(smoothProgress, [0, 1], [0, -150]);
  const parallax3 = useTransform(smoothProgress, [0, 1], [0, -500]);

  // Hero text parallax
  const heroY = useTransform(smoothProgress, [0, 0.3], [0, -80]);
  const heroOpacity = useTransform(smoothProgress, [0, 0.25], [1, 0]);

  return (
    <div ref={containerRef} className="relative" style={{ fontFamily: "'Outfit', sans-serif" }}>
      {/* PARTICLE BACKGROUND (fixed, always behind everything) */}
      <ParticleBackground />

      {/* ═══════ HERO ═══════ */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
        {/* Spotlight effect */}
        <Spotlight className="absolute top-0 left-0 md:left-1/4 -top-20 z-10" fill="white" />

        {/* Subtle colour orbs layered on top of particles */}
        <motion.div
          className="absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full opacity-10 blur-3xl pointer-events-none"
          style={{ background: 'radial-gradient(circle, hsl(210 100% 50%), transparent)', y: parallax1 }}
        />
        <motion.div
          className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full opacity-[0.08] blur-3xl pointer-events-none"
          style={{ background: 'radial-gradient(circle, hsl(173 80% 36%), transparent)', y: parallax2 }}
        />

        {/* Split layout — text left, Arduino right */}
        <div className="container mx-auto px-4 w-full max-w-7xl h-full min-h-[calc(100vh-4rem)] flex flex-col md:flex-row items-center relative z-10">

          {/* Left — text */}
          <motion.div
            style={{ y: heroY, opacity: heroOpacity }}
            className="flex-1 flex flex-col justify-center gap-6 py-20 md:py-0 md:pr-8"
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-4 py-1.5 text-sm font-medium text-blue-400 w-fit backdrop-blur-sm"
            >
              <Zap className="h-4 w-4" /> AI-Powered Embedded Systems Platform
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.35 }}
              className="text-5xl md:text-6xl lg:text-7xl font-black tracking-tighter leading-[0.9]"
            >
              <TextScramble
                as="span"
                duration={0.9}
                speed={0.03}
                characterSet="ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*"
                className="bg-clip-text text-transparent bg-gradient-to-b from-white to-white/50"
              >
                Electronics
              </TextScramble>
              <br />
              <TextScramble
                as="span"
                duration={1.2}
                speed={0.04}
                characterSet=".LMN01!#@$%"
                className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-teal-400"
              >
                .LLM
              </TextScramble>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.5 }}
              className="text-white/60 text-base md:text-lg max-w-md leading-relaxed"
            >
              From concept to circuit — AI agents that understand electronics.
              Generate projects, write code, troubleshoot, and learn through guided modules.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.65 }}
            >
              <Button
                size="lg"
                className="h-12 px-8 font-bold gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-teal-500 hover:opacity-90 transition-opacity shadow-lg shadow-blue-500/30"
                onClick={() => router.push('/login')}
              >
                Get Started <ArrowRight className="h-4 w-4" />
              </Button>
            </motion.div>

            {/* Feature pills */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.9 }}
              className="flex flex-wrap gap-2 pt-2"
            >
              {[
                { icon: Brain, label: 'AI Agents' },
                { icon: Cpu, label: 'Arduino' },
                { icon: Terminal, label: 'Live IDE' },
                { icon: Wifi, label: 'Wireless Comms' },
              ].map((s) => (
                <span
                  key={s.label}
                  className="flex items-center gap-1.5 text-xs font-medium text-white/40 bg-white/5 border border-white/10 rounded-full px-3 py-1.5"
                >
                  <s.icon className="h-3 w-3" /> {s.label}
                </span>
              ))}
            </motion.div>
          </motion.div>

          {/* Right — Arduino 3D */}
          <div className="flex-1 w-full min-h-[400px] md:h-[calc(100vh-4rem)] relative">
            <Arduino3DViewer className="w-full h-full absolute inset-0" />
          </div>
        </div>

        {/* Scroll hint */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 z-10"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <span className="text-xs text-white/30 font-medium">Scroll to explore</span>
          <ChevronDown className="h-5 w-5 text-white/30" />
        </motion.div>
      </section>

      {/* ═══════ FEATURES ═══════ */}
      <section className="relative py-32 overflow-hidden">
        <div className="absolute inset-0 grid-pattern opacity-20" />
        <div className="container mx-auto px-4 relative z-10">
          <AnimatedSection className="text-center mb-20">
            <h2 className="text-4xl sm:text-5xl font-black tracking-tight text-white mb-4">
              Everything you need to
              <br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-teal-400">learn electronics</span>
            </h2>
            <p className="text-lg text-white/50 max-w-xl mx-auto">
              A complete AI-powered platform — from idea to working hardware.
            </p>
          </AnimatedSection>

          <div className="grid sm:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {features.map((f) => (
              <AnimatedSection key={f.title}>
                <motion.div
                  whileHover={{ y: -4, scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  className="group h-full rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-8 transition-colors hover:border-blue-500/30"
                >
                  <div className={`mb-5 inline-flex h-12 w-12 items-center justify-center rounded-xl ${
                    f.color === "primary" ? "bg-blue-500/10" : "bg-teal-500/10"
                  }`}>
                    <f.icon className={`h-6 w-6 ${f.color === "primary" ? "text-blue-400" : "text-teal-400"}`} />
                  </div>
                  <h3 className="mb-3 text-xl font-bold text-white">{f.title}</h3>
                  <p className="text-white/50 leading-relaxed">{f.description}</p>
                </motion.div>
=======
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
>>>>>>> 03ef4f7e5e1a0fc91a38965b199ee23522ef5efb
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

<<<<<<< HEAD
      {/* ═══════ AI AGENTS SHOWCASE ═══════ */}
      <section className="relative py-32 overflow-hidden">
        <motion.div
          className="absolute top-0 right-0 w-[800px] h-[800px] rounded-full opacity-10 blur-3xl"
          style={{ background: "radial-gradient(circle, hsl(173 80% 36%), transparent)", y: parallax3 }}
        />
        <div className="container mx-auto px-4 relative z-10">
          <AnimatedSection className="text-center mb-16">
            <div className="inline-flex items-center gap-2 rounded-full border border-teal-500/20 bg-teal-500/5 px-4 py-1.5 text-xs font-medium text-teal-400 mb-6">
              <Cpu className="h-3 w-3" />
              Powered by Multiple AI Agents
            </div>
            <h2 className="text-4xl sm:text-5xl font-black tracking-tight text-white mb-4">
              Specialized <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-teal-400">AI Agents</span>
            </h2>
            <p className="text-lg text-white/50 max-w-xl mx-auto">
              Each agent is an expert in its domain — working together to build your project.
            </p>
          </AnimatedSection>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-5xl mx-auto">
            {agents.map((agent) => (
              <AnimatedSection key={agent.name}>
                <motion.div
                  whileHover={{ y: -6 }}
                  className="group text-center p-6 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm hover:border-blue-500/30 transition-all duration-300"
                >
                  <div className="mx-auto mb-4 h-14 w-14 rounded-2xl bg-gradient-to-br from-blue-500/10 to-teal-500/10 flex items-center justify-center group-hover:from-blue-500/20 group-hover:to-teal-500/20 transition-colors">
                    <agent.icon className="h-6 w-6 text-blue-400" />
                  </div>
                  <h3 className="font-bold text-white mb-1">{agent.name}</h3>
                  <p className="text-sm text-white/50">{agent.desc}</p>
                </motion.div>
=======
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
>>>>>>> 03ef4f7e5e1a0fc91a38965b199ee23522ef5efb
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

<<<<<<< HEAD
      {/* ═══════ LEARNING PATHS ═══════ */}
      <section className="relative py-32 overflow-hidden">
        <div className="absolute inset-0 grid-pattern opacity-20" />
        <div className="container mx-auto px-4 relative z-10">
          <AnimatedSection className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-black tracking-tight text-white mb-4">
              Two ways to <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-teal-400">learn</span>
            </h2>
          </AnimatedSection>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <AnimatedSection>
              <motion.div
                whileHover={{ y: -4 }}
                className="h-full rounded-2xl border border-blue-500/20 bg-gradient-to-b from-blue-500/5 to-transparent p-8"
              >
                <div className="h-14 w-14 rounded-2xl bg-blue-500/10 flex items-center justify-center mb-6">
                  <BookOpen className="h-7 w-7 text-blue-400" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">Basic Modules</h3>
                <p className="text-white/50 mb-6 leading-relaxed">
                  Structured, step-by-step learning path. Pre-designed modules covering
                  fundamentals — LEDs, sensors, motors, communication protocols, and more.
                </p>
                <ul className="space-y-2 text-sm text-white/50">
                  {["Predefined curriculum", "Hands-on projects", "Progressive difficulty", "Self-paced"].map((item) => (
                    <li key={item} className="flex items-center gap-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-blue-400" />
                      {item}
                    </li>
                  ))}
                </ul>
              </motion.div>
            </AnimatedSection>

            <AnimatedSection>
              <motion.div
                whileHover={{ y: -4 }}
                className="h-full rounded-2xl border border-teal-500/20 bg-gradient-to-b from-teal-500/5 to-transparent p-8"
              >
                <div className="h-14 w-14 rounded-2xl bg-teal-500/10 flex items-center justify-center mb-6">
                  <Brain className="h-7 w-7 text-teal-400" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">Adaptive Agent</h3>
                <p className="text-white/50 mb-6 leading-relaxed">
                  AI analyzes your skill level and generates personalized projects.
                  The difficulty and topics adapt in real-time as you learn.
                </p>
                <ul className="space-y-2 text-sm text-white/50">
                  {["AI-personalized path", "Dynamic difficulty", "Project generation", "Context-aware tutoring"].map((item) => (
                    <li key={item} className="flex items-center gap-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-teal-400" />
                      {item}
                    </li>
                  ))}
                </ul>
              </motion.div>
            </AnimatedSection>
=======
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
>>>>>>> 03ef4f7e5e1a0fc91a38965b199ee23522ef5efb
          </div>
        </div>
      </section>

<<<<<<< HEAD
      {/* ═══════ IDE PREVIEW ═══════ */}
      <section className="relative py-32 overflow-hidden">
        <div className="container mx-auto px-4 relative z-10">
          <AnimatedSection>
            <div className="max-w-5xl mx-auto rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm overflow-hidden shadow-2xl">
              <div className="flex items-center gap-2 border-b border-white/10 px-5 py-3">
                <div className="h-3 w-3 rounded-full bg-red-500/60" />
                <div className="h-3 w-3 rounded-full bg-teal-500/60" />
                <div className="h-3 w-3 rounded-full bg-blue-500/60" />
                <span className="ml-3 text-xs text-white/30 font-mono">Electronics.LLM — Online IDE</span>
              </div>
              <div className="grid md:grid-cols-2">
                <div className="p-6 border-r border-white/10">
                  <pre className="text-xs sm:text-sm font-mono text-white/40 leading-relaxed">
                    <code>
{`// Generated by Electronics.LLM
// Board: Arduino Uno

#include <Servo.h>

Servo myServo;
int sensorPin = A0;

void setup() {
  Serial.begin(9600);
  myServo.attach(9);
  pinMode(LED_BUILTIN, OUTPUT);
}

void loop() {
  int val = analogRead(sensorPin);
  int angle = map(val, 0, 1023, 0, 180);
  myServo.write(angle);
  delay(15);
}`}
                    </code>
                  </pre>
                </div>
                <div className="p-6 flex flex-col justify-center items-center text-center">
                  <Terminal className="h-12 w-12 text-blue-400/30 mb-4" />
                  <p className="text-sm text-white/40 mb-2">Compile & flash directly</p>
                  <p className="text-xs text-white/20">WebSerial API • Arduino CLI • Arduino Support</p>
                </div>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* ═══════ CTA ═══════ */}
      <section className="relative py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-blue-500/5 via-transparent to-transparent" />
        <div className="container mx-auto px-4 relative z-10">
          <AnimatedSection className="text-center">
            <h2 className="text-4xl sm:text-6xl font-black tracking-tight text-white mb-6">
              Ready to <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-teal-400">build</span>?
            </h2>
            <p className="text-lg text-white/50 max-w-lg mx-auto mb-10">
              Join the platform where AI meets hardware. Start your first embedded systems project in minutes.
            </p>
            <Button
              size="lg"
              className="h-14 px-12 text-base font-bold gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-teal-500 hover:opacity-90 transition-opacity shadow-lg"
              onClick={() => router.push("/login")}
            >
              Start Learning
              <ArrowRight className="h-5 w-5" />
            </Button>
          </AnimatedSection>
        </div>
      </section>

      {/* ═══════ FOOTER ═══════ */}
      <footer className="border-t border-white/10 py-8">
        <div className="container mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-blue-400" />
            <span className="text-sm font-bold text-white">
              Electronics<span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-teal-400">.LLM</span>
            </span>
          </div>
          <p className="text-xs text-white/30">
            AI-Powered Embedded Systems Learning Platform — Open Source
=======
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
>>>>>>> 03ef4f7e5e1a0fc91a38965b199ee23522ef5efb
          </p>
        </div>
      </footer>
    </div>
  );
}
<<<<<<< HEAD

=======
>>>>>>> 03ef4f7e5e1a0fc91a38965b199ee23522ef5efb
