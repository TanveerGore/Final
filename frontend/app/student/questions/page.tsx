"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  MessageCircleQuestion,
  Send,
  Loader2,
  CheckCircle2,
  Clock,
} from "lucide-react";
import { toast } from "sonner";
import { getStudentQuestions, askQuestion } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
  topic: string;
  questionText: string;
  status: string;
  answerText?: string;
  createdAt: string;
}

export default function QuestionsPage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [topic, setTopic] = useState("");
  const [questionText, setQuestionText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState("questions");

  const fetchQuestions = async () => {
    try {
      const res = await getStudentQuestions(1, 50);
      setQuestions(res.questions || []);
    } catch {
      // silently handle
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, []);

  const handleAsk = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim() || !questionText.trim()) {
      toast.error("Please fill in both topic and question");
      return;
    }
    setSubmitting(true);
    try {
      await askQuestion({
        topic: topic.trim(),
        questionText: questionText.trim(),
      });
      toast.success("Question submitted successfully!");
      setTopic("");
      setQuestionText("");
      setActiveTab("questions");
      fetchQuestions();
    } catch {
      toast.error("Failed to submit question");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-9 w-48" />
        <Skeleton className="h-10 w-full max-w-sm" />
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
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
        <h1 className="text-2xl font-bold tracking-tight">Questions</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Ask questions and get help from your teachers
        </p>
      </motion.div>

      <motion.div variants={item}>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-white/[0.04]">
            <TabsTrigger value="questions">My Questions</TabsTrigger>
            <TabsTrigger value="ask">Ask New</TabsTrigger>
          </TabsList>

          <TabsContent value="questions" className="mt-4 space-y-3">
            {questions.length === 0 ? (
              <Card className="border-white/[0.06] bg-white/[0.02]">
                <CardContent className="flex flex-col items-center justify-center py-16">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
                    <MessageCircleQuestion className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="mt-4 text-lg font-semibold">
                    No questions yet
                  </h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Ask your first question to get help from a teacher
                  </p>
                  <Button
                    className="mt-4 gap-2"
                    onClick={() => setActiveTab("ask")}
                  >
                    Ask a Question
                  </Button>
                </CardContent>
              </Card>
            ) : (
              questions.map((q) => (
                <motion.div
                  key={q._id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, ease }}
                >
                  <Card className="border-white/[0.06] bg-white/[0.02]">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <Badge
                              variant="outline"
                              className="bg-white/[0.04] text-xs"
                            >
                              {q.topic}
                            </Badge>
                            <div className="flex items-center gap-1.5">
                              {q.status === "answered" ? (
                                <CheckCircle2 className="h-3.5 w-3.5 text-green-400" />
                              ) : (
                                <Clock className="h-3.5 w-3.5 text-yellow-400" />
                              )}
                              <span
                                className={`text-xs font-medium ${
                                  q.status === "answered"
                                    ? "text-green-400"
                                    : "text-yellow-400"
                                }`}
                              >
                                {q.status === "answered"
                                  ? "Answered"
                                  : "Pending"}
                              </span>
                            </div>
                          </div>
                          <p className="mt-2 text-sm">{q.questionText}</p>
                          {q.answerText && (
                            <div className="mt-3 rounded-lg border border-green-500/10 bg-green-500/5 p-3">
                              <p className="text-xs font-medium text-green-400">
                                Teacher&apos;s Answer
                              </p>
                              <p className="mt-1 text-sm text-muted-foreground">
                                {q.answerText}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                      <p className="mt-2 text-xs text-muted-foreground">
                        {new Date(q.createdAt).toLocaleDateString()}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))
            )}
          </TabsContent>

          <TabsContent value="ask" className="mt-4">
            <Card className="border-white/[0.06] bg-white/[0.02]">
              <CardHeader>
                <CardTitle className="text-lg">Ask a New Question</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAsk} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="topic">Topic</Label>
                    <Input
                      id="topic"
                      placeholder="e.g., Arduino, Sensors, LED circuits..."
                      value={topic}
                      onChange={(e) => setTopic(e.target.value)}
                      className="h-11 border-white/[0.08] bg-white/[0.03] focus-visible:border-primary/50"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="question">Your Question</Label>
                    <Textarea
                      id="question"
                      placeholder="Describe what you need help with..."
                      value={questionText}
                      onChange={(e) => setQuestionText(e.target.value)}
                      className="min-h-32 resize-none border-white/[0.08] bg-white/[0.03] focus-visible:border-primary/50"
                    />
                  </div>
                  <Button
                    type="submit"
                    disabled={
                      submitting || !topic.trim() || !questionText.trim()
                    }
                    className="gap-2"
                    size="lg"
                  >
                    {submitting ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        <Send className="h-4 w-4" />
                        Submit Question
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>
    </motion.div>
  );
}
