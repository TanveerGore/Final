"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  FolderOpen,
  Trophy,
  MessageCircleQuestion,
  Rocket,
  Plus,
  ArrowRight,
  Loader2,
  Calendar,
  Sparkles,
  BookOpen,
} from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { getStudentProjects, getStudentQuizResults } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";

const ease: [number, number, number, number] = [0.16, 1, 0.3, 1];

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08, ease },
  },
};

const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease } },
};

const statusColors: Record<string, string> = {
  planning: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  "in-progress": "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  review: "bg-orange-500/10 text-orange-400 border-orange-500/20",
  completed: "bg-green-500/10 text-green-400 border-green-500/20",
};

interface Project {
  _id: string;
  title: string;
  description?: string;
  topic?: string;
  status: string;
  components?: { name: string; quantity: number }[];
  createdAt: string;
}

interface QuizResult {
  _id: string;
  topic: string;
  score: number;
  totalQuestions: number;
  percentage: number;
  createdAt: string;
}

export default function StudentDashboard() {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [quizResults, setQuizResults] = useState<QuizResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalProjects, setTotalProjects] = useState(0);

  useEffect(() => {
    async function fetchData() {
      try {
        const [projRes, quizRes] = await Promise.all([
          getStudentProjects(1, 10),
          getStudentQuizResults(1, 10),
        ]);
        setProjects(projRes.projects || []);
        setTotalProjects(projRes.pagination?.total || 0);
        setQuizResults(quizRes.quizResults || []);
      } catch {
        // silently handle
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const avgQuiz =
    quizResults.length > 0
      ? Math.round(
          quizResults.reduce((a, q) => a + q.percentage, 0) /
            quizResults.length,
        )
      : 0;

  const activeProjects = projects.filter(
    (p) => p.status === "in-progress" || p.status === "planning",
  ).length;

  const stats = [
    {
      label: "Total Projects",
      value: totalProjects,
      icon: FolderOpen,
      gradient: "from-blue-500/20 to-cyan-500/20",
      iconColor: "text-blue-400",
    },
    {
      label: "Quiz Average",
      value: `${avgQuiz}%`,
      icon: Trophy,
      gradient: "from-amber-500/20 to-orange-500/20",
      iconColor: "text-amber-400",
    },
    {
      label: "Questions Asked",
      value: "—",
      icon: MessageCircleQuestion,
      gradient: "from-purple-500/20 to-pink-500/20",
      iconColor: "text-purple-400",
    },
    {
      label: "Active Projects",
      value: activeProjects,
      icon: Rocket,
      gradient: "from-green-500/20 to-emerald-500/20",
      iconColor: "text-green-400",
    },
  ];

  if (loading) {
    return (
      <div className="space-y-8">
        {/* Welcome skeleton */}
        <div className="space-y-2">
          <Skeleton className="h-9 w-72 rounded-lg" />
          <Skeleton className="h-5 w-56 rounded-md" />
        </div>
        {/* Hero card skeleton */}
        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6">
          <div className="flex items-center justify-between">
            <div className="space-y-3">
              <Skeleton className="h-4 w-44 rounded-md" />
              <Skeleton className="h-6 w-60 rounded-md" />
              <Skeleton className="h-4 w-32 rounded-md" />
            </div>
            <Skeleton className="h-10 w-28 rounded-lg" />
          </div>
        </div>
        {/* Stat cards skeleton */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5"
            >
              <div className="flex items-center justify-between">
                <div className="space-y-2.5">
                  <Skeleton className="h-4 w-24 rounded-md" />
                  <Skeleton className="h-7 w-14 rounded-md" />
                </div>
                <Skeleton className="h-11 w-11 rounded-xl" />
              </div>
            </div>
          ))}
        </div>
        {/* Content cards skeleton */}
        <div className="grid gap-6 lg:grid-cols-2">
          {[...Array(2)].map((_, i) => (
            <div
              key={i}
              className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-6"
            >
              <div className="mb-4 flex items-center justify-between">
                <Skeleton className="h-5 w-36 rounded-md" />
                <Skeleton className="h-8 w-20 rounded-md" />
              </div>
              <div className="space-y-3">
                {[...Array(3)].map((_, j) => (
                  <div
                    key={j}
                    className="flex items-center justify-between rounded-lg border border-white/[0.06] bg-white/[0.03] p-3.5"
                  >
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-40 rounded-md" />
                      <Skeleton className="h-3 w-28 rounded-md" />
                    </div>
                    <Skeleton className="h-6 w-20 rounded-full" />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-8"
    >
      {/* Welcome */}
      <motion.div variants={item}>
        <h1 className="text-3xl font-bold tracking-tight">
          Welcome back, {user?.username} 👋
        </h1>
        <p className="mt-1 text-muted-foreground">
          Here&apos;s an overview of your learning progress
        </p>
      </motion.div>

      {/* Continue Learning Hero */}
      <motion.div variants={item}>
        {(() => {
          const inProgressProject = projects.find(
            (p) => p.status === "in-progress",
          );
          const latestProject = inProgressProject || projects[0];
          return (
            <Card className="relative overflow-hidden border-white/[0.06] bg-gradient-to-br from-blue-600/20 via-purple-600/20 to-indigo-600/20">
              <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-purple-500/10 blur-3xl" />
              <div className="pointer-events-none absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-blue-500/10 blur-3xl" />
              <CardContent className="relative flex items-center justify-between gap-4 p-6">
                <div className="min-w-0 space-y-1.5">
                  <div className="flex items-center gap-2 text-sm font-medium text-blue-300">
                    <Sparkles className="h-4 w-4" />
                    {latestProject
                      ? "Continue where you left off"
                      : "Start your journey"}
                  </div>
                  <p className="truncate text-xl font-bold">
                    {latestProject
                      ? latestProject.title
                      : "Create your first project"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {latestProject
                      ? `Status: ${latestProject.status}`
                      : "Begin building something amazing"}
                  </p>
                </div>
                <Link
                  href={
                    latestProject
                      ? `/student/learn/${encodeURIComponent(latestProject.title)}`
                      : "/student/projects/new"
                  }
                >
                  <Button className="shrink-0 gap-2 bg-white/10 backdrop-blur-sm hover:bg-white/20">
                    {latestProject ? "Continue" : "Get Started"}
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          );
        })()}
      </motion.div>

      {/* Stat Cards */}
      <motion.div
        variants={item}
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
      >
        {stats.map((stat, i) => (
          <Card
            key={stat.label}
            className="relative overflow-hidden border-white/[0.06] bg-white/[0.02]"
          >
            <div
              className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-50`}
            />
            <CardContent className="relative p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <motion.p
                    className="mt-1 text-2xl font-bold"
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{
                      type: "spring",
                      stiffness: 200,
                      damping: 15,
                      delay: i * 0.08,
                    }}
                  >
                    {stat.value}
                  </motion.p>
                </div>
                <div className="relative flex h-11 w-11 items-center justify-center rounded-xl bg-white/[0.06]">
                  {stat.label === "Quiz Average" && avgQuiz > 0 && (
                    <svg
                      className="absolute inset-0 h-11 w-11 -rotate-90"
                      viewBox="0 0 44 44"
                    >
                      <circle
                        cx="22"
                        cy="22"
                        r="18"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        className="text-white/[0.06]"
                      />
                      <motion.circle
                        cx="22"
                        cy="22"
                        r="18"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        className="text-amber-400"
                        initial={{ strokeDasharray: "0 113.1" }}
                        animate={{
                          strokeDasharray: `${(avgQuiz / 100) * 113.1} 113.1`,
                        }}
                        transition={{ duration: 1, ease: "easeOut", delay: 0.3 }}
                      />
                    </svg>
                  )}
                  <stat.icon className={`h-5 w-5 ${stat.iconColor}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </motion.div>

      {/* Recent Content */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Projects */}
        <motion.div variants={item}>
          <Card className="border-white/[0.06] bg-white/[0.02]">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-lg font-semibold">
                Recent Projects
              </CardTitle>
              <Link href="/student/projects">
                <Button variant="ghost" size="sm" className="text-xs">
                  View all <ArrowRight className="ml-1 h-3 w-3" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent className="space-y-3">
              {projects.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10">
                  <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-blue-500/10">
                    <FolderOpen className="h-6 w-6 text-blue-400" />
                  </div>
                  <p className="text-sm font-medium">No projects yet</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Start building to see your work here
                  </p>
                  <Link href="/student/projects/new" className="mt-3">
                    <Button
                      size="sm"
                      variant="outline"
                      className="gap-1.5 text-xs"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      Create First Project
                    </Button>
                  </Link>
                </div>
              ) : (
                projects.slice(0, 3).map((project) => (
                  <Link
                    key={project._id}
                    href={`/student/learn/${encodeURIComponent(project.title)}`}
                    className="group block"
                  >
                    <div className="flex items-center justify-between rounded-lg border border-white/[0.06] bg-white/[0.02] p-3.5 transition-all duration-200 group-hover:border-white/[0.12] group-hover:bg-white/[0.05] group-hover:shadow-lg group-hover:shadow-white/[0.02]">
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium group-hover:text-blue-300 transition-colors duration-200">
                          {project.title}
                        </p>
                        <div className="mt-1 flex items-center gap-2">
                          {project.topic && (
                            <span className="text-xs text-muted-foreground">
                              {project.topic}
                            </span>
                          )}
                          <span className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Calendar className="h-3 w-3" />
                            {new Date(project.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant="outline"
                          className={
                            statusColors[project.status] ||
                            "bg-gray-500/10 text-gray-400"
                          }
                        >
                          {project.status}
                        </Badge>
                        <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
                      </div>
                    </div>
                  </Link>
                ))
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Recent Quiz Results */}
        <motion.div variants={item}>
          <Card className="border-white/[0.06] bg-white/[0.02]">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-lg font-semibold">
                Recent Quiz Results
              </CardTitle>
              <Link href="/student/quizzes">
                <Button variant="ghost" size="sm" className="text-xs">
                  View all <ArrowRight className="ml-1 h-3 w-3" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent className="space-y-3">
              {quizResults.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10">
                  <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-amber-500/10">
                    <Trophy className="h-6 w-6 text-amber-400" />
                  </div>
                  <p className="text-sm font-medium">No quiz results yet</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Test your knowledge and track your progress
                  </p>
                  <Link href="/student/quizzes" className="mt-3">
                    <Button
                      size="sm"
                      variant="outline"
                      className="gap-1.5 text-xs"
                    >
                      <BookOpen className="h-3.5 w-3.5" />
                      Take a Quiz
                    </Button>
                  </Link>
                </div>
              ) : (
                quizResults.slice(0, 3).map((quiz) => (
                  <div
                    key={quiz._id}
                    className={`rounded-lg border border-white/[0.06] bg-white/[0.02] p-3.5 border-l-2 ${
                      quiz.percentage >= 75
                        ? "border-l-green-500"
                        : quiz.percentage >= 50
                          ? "border-l-yellow-500"
                          : "border-l-red-500"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium">{quiz.topic}</p>
                      <span
                        className={`text-sm font-semibold ${
                          quiz.percentage >= 75
                            ? "text-green-400"
                            : quiz.percentage >= 50
                              ? "text-yellow-400"
                              : "text-red-400"
                        }`}
                      >
                        {quiz.score}/{quiz.totalQuestions}
                      </span>
                    </div>
                    <div className="mt-2">
                      <Progress
                        value={quiz.percentage}
                        className="h-1.5 bg-white/[0.06]"
                      />
                    </div>
                    <p className="mt-1.5 text-xs text-muted-foreground">
                      {quiz.percentage}% •{" "}
                      {new Date(quiz.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Quick Actions */}
      <motion.div variants={item} className="flex flex-wrap gap-3">
        <Link href="/student/projects/new">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Start New Project
          </Button>
        </Link>
        <Link href="/student/questions">
          <Button variant="outline" className="gap-2">
            <MessageCircleQuestion className="h-4 w-4" />
            Ask a Question
          </Button>
        </Link>
      </motion.div>
    </motion.div>
  );
}
