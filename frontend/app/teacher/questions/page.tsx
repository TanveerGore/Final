"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageCircleQuestion,
  Send,
  Loader2,
  Clock,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/auth-context";
import { getTeacherQuestions, answerQuestion } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

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

interface Question {
  _id: string;
  student: { username: string };
  topic: string;
  questionText: string;
  status: string;
  answerText?: string;
  createdAt: string;
  answeredAt?: string;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export default function QuestionsPage() {
  useAuth();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState<string>("pending");
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [answerText, setAnswerText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchQuestions = async (status?: string, p = 1) => {
    setLoading(true);
    try {
      const statusParam = status === "all" ? undefined : status;
      const res = await getTeacherQuestions(statusParam, p, 20);
      setQuestions(res.questions || []);
      setPagination(res.pagination || null);
    } catch {
      // silently handle
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions(filter, page);
  }, [filter, page]);

  const handleAnswer = async (questionId: string) => {
    if (!answerText.trim()) {
      toast.error("Please enter an answer");
      return;
    }
    setSubmitting(true);
    try {
      await answerQuestion(questionId, { answerText });
      toast.success("Question answered successfully!");
      setAnswerText("");
      setExpandedId(null);
      fetchQuestions(filter, page);
    } catch {
      toast.error("Failed to submit answer");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-56" />
        <Skeleton className="h-10 w-64" />
        <div className="space-y-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-xl" />
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
      {/* Header */}
      <motion.div variants={item}>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/10">
            <MessageCircleQuestion className="h-5 w-5 text-purple-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Questions</h1>
            <p className="text-sm text-muted-foreground">
              Answer student questions
            </p>
          </div>
        </div>
      </motion.div>

      {/* Filter Tabs */}
      <motion.div variants={item}>
        <Tabs
          value={filter}
          onValueChange={(v) => {
            setFilter(v);
            setPage(1);
          }}
        >
          <TabsList>
            <TabsTrigger value="pending" className="gap-1">
              <Clock className="h-3.5 w-3.5" /> Pending
            </TabsTrigger>
            <TabsTrigger value="all" className="gap-1">
              All
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </motion.div>

      {/* Questions List */}
      {questions.length === 0 ? (
        <motion.div variants={item}>
          <p className="py-12 text-center text-sm text-muted-foreground">
            {filter === "pending"
              ? "No pending questions — all caught up! 🎉"
              : "No questions found"}
          </p>
        </motion.div>
      ) : (
        <motion.div variants={item} className="space-y-4">
          {questions.map((q) => {
            const isPending = q.status === "pending";
            const isExpanded = expandedId === q._id;
            return (
              <Card
                key={q._id}
                className={`border-white/[0.06] bg-white/[0.02] transition-colors ${
                  isPending ? "border-l-2 border-l-amber-500/50" : ""
                }`}
              >
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-semibold">
                          {q.student?.username ?? "Student"}
                        </span>
                        <Badge
                          variant="outline"
                          className="text-xs bg-primary/10 text-primary border-primary/20"
                        >
                          {q.topic}
                        </Badge>
                        <Badge
                          variant="outline"
                          className={`text-xs ${
                            isPending
                              ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                              : "bg-green-500/10 text-green-400 border-green-500/20"
                          }`}
                        >
                          {isPending ? (
                            <Clock className="mr-1 h-3 w-3" />
                          ) : (
                            <CheckCircle2 className="mr-1 h-3 w-3" />
                          )}
                          {q.status}
                        </Badge>
                      </div>
                      <p className="mt-2 text-sm text-foreground/90">
                        {q.questionText}
                      </p>
                      <p className="mt-1.5 text-xs text-muted-foreground">
                        Asked {new Date(q.createdAt).toLocaleDateString()}
                        {q.answeredAt &&
                          ` • Answered ${new Date(q.answeredAt).toLocaleDateString()}`}
                      </p>
                    </div>

                    {isPending && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setExpandedId(isExpanded ? null : q._id);
                          setAnswerText("");
                        }}
                        className="shrink-0"
                      >
                        <ChevronDown
                          className={`h-4 w-4 transition-transform ${
                            isExpanded ? "rotate-180" : ""
                          }`}
                        />
                      </Button>
                    )}
                  </div>

                  {/* Show answer for answered questions */}
                  {!isPending && q.answerText && (
                    <div className="mt-3 rounded-lg border border-green-500/10 bg-green-500/5 p-3">
                      <p className="text-xs font-medium text-green-400 mb-1">
                        Answer:
                      </p>
                      <p className="text-sm text-foreground/80">
                        {q.answerText}
                      </p>
                    </div>
                  )}

                  {/* Answer form for pending */}
                  <AnimatePresence>
                    {isPending && isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="mt-4 space-y-3 border-t border-white/[0.06] pt-4">
                          <Textarea
                            placeholder="Type your answer..."
                            value={answerText}
                            onChange={(e) => setAnswerText(e.target.value)}
                            className="min-h-24 border-white/[0.08] bg-white/[0.03]"
                          />
                          <div className="flex justify-end">
                            <Button
                              size="sm"
                              disabled={submitting}
                              onClick={() => handleAnswer(q._id)}
                              className="gap-1"
                            >
                              {submitting ? (
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              ) : (
                                <Send className="h-3.5 w-3.5" />
                              )}
                              Submit Answer
                            </Button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </CardContent>
              </Card>
            );
          })}
        </motion.div>
      )}

      {/* Pagination */}
      {pagination && pagination.pages > 1 && (
        <motion.div
          variants={item}
          className="flex items-center justify-center gap-2"
        >
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
            className="gap-1"
          >
            <ChevronLeft className="h-4 w-4" /> Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {page} of {pagination.pages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= pagination.pages}
            onClick={() => setPage((p) => p + 1)}
            className="gap-1"
          >
            Next <ChevronRight className="h-4 w-4" />
          </Button>
        </motion.div>
      )}
    </motion.div>
  );
}
