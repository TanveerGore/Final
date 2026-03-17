"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Trophy, Target, TrendingUp } from "lucide-react";
import { getStudentQuizResults } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";

const ease: [number, number, number, number] = [0.16, 1, 0.3, 1];

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.06, ease },
  },
};

const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease } },
};

function scoreColor(pct: number) {
  if (pct >= 75) return "text-green-400";
  if (pct >= 50) return "text-yellow-400";
  return "text-red-400";
}

function progressColor(pct: number) {
  if (pct >= 75) return "[&>div]:bg-green-500";
  if (pct >= 50) return "[&>div]:bg-yellow-500";
  return "[&>div]:bg-red-500";
}

interface QuizResult {
  _id: string;
  topic: string;
  score: number;
  totalQuestions: number;
  percentage: number;
  createdAt: string;
}

export default function QuizzesPage() {
  const [quizResults, setQuizResults] = useState<QuizResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchQuizzes() {
      try {
        const res = await getStudentQuizResults(1, 100);
        setQuizResults(res.quizResults || []);
      } catch {
        // silently handle
      } finally {
        setLoading(false);
      }
    }
    fetchQuizzes();
  }, []);

  const avgScore =
    quizResults.length > 0
      ? Math.round(
          quizResults.reduce((a, q) => a + q.percentage, 0) /
            quizResults.length,
        )
      : 0;

  const bestScore =
    quizResults.length > 0
      ? Math.max(...quizResults.map((q) => q.percentage))
      : 0;

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-9 w-48" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-xl" />
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
      className="space-y-6"
    >
      <motion.div variants={item}>
        <h1 className="text-2xl font-bold tracking-tight">Quiz Results</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Track your quiz performance and progress
        </p>
      </motion.div>

      {/* Stats Summary */}
      <motion.div
        variants={item}
        className="grid grid-cols-1 gap-4 sm:grid-cols-3"
      >
        <Card className="relative overflow-hidden border-white/[0.06] bg-white/[0.02]">
          <div className="absolute inset-0 bg-gradient-to-br from-amber-500/20 to-orange-500/20 opacity-50" />
          <CardContent className="relative p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Average Score</p>
                <p className="mt-1 text-2xl font-bold">{avgScore}%</p>
              </div>
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/[0.06]">
                <TrendingUp className="h-5 w-5 text-amber-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border-white/[0.06] bg-white/[0.02]">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 opacity-50" />
          <CardContent className="relative p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Quizzes</p>
                <p className="mt-1 text-2xl font-bold">{quizResults.length}</p>
              </div>
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/[0.06]">
                <Target className="h-5 w-5 text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border-white/[0.06] bg-white/[0.02]">
          <div className="absolute inset-0 bg-gradient-to-br from-green-500/20 to-emerald-500/20 opacity-50" />
          <CardContent className="relative p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Best Score</p>
                <p className="mt-1 text-2xl font-bold">{bestScore}%</p>
              </div>
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/[0.06]">
                <Trophy className="h-5 w-5 text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Quiz Results List */}
      {quizResults.length === 0 ? (
        <motion.div variants={item}>
          <Card className="border-white/[0.06] bg-white/[0.02]">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
                <Trophy className="h-8 w-8 text-primary" />
              </div>
              <h3 className="mt-4 text-lg font-semibold">No quiz results</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Complete quizzes during your learning journey to see results
                here
              </p>
            </CardContent>
          </Card>
        </motion.div>
      ) : (
        <motion.div variants={item}>
          <Card className="border-white/[0.06] bg-white/[0.02]">
            <CardHeader>
              <CardTitle className="text-lg">All Results</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {quizResults.map((quiz) => (
                <div
                  key={quiz._id}
                  className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-4"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className="bg-white/[0.04]">
                        {quiz.topic}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {new Date(quiz.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-sm font-semibold ${scoreColor(quiz.percentage)}`}
                      >
                        {quiz.score}/{quiz.totalQuestions}
                      </span>
                      <Badge
                        variant="outline"
                        className={`${
                          quiz.percentage >= 75
                            ? "border-green-500/20 bg-green-500/10 text-green-400"
                            : quiz.percentage >= 50
                              ? "border-yellow-500/20 bg-yellow-500/10 text-yellow-400"
                              : "border-red-500/20 bg-red-500/10 text-red-400"
                        }`}
                      >
                        {quiz.percentage}%
                      </Badge>
                    </div>
                  </div>
                  <div className="mt-3">
                    <Progress
                      value={quiz.percentage}
                      className={`h-2 bg-white/[0.06] ${progressColor(quiz.percentage)}`}
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>
      )}
    </motion.div>
  );
}
