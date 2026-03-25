"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FolderOpen,
  Users,
  Star,
  Send,
  Loader2,
  MessageSquare,
  Search,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/auth-context";
import {
  getStudentsList,
  getStudentProjectsTeacher,
  addProjectFeedback,
  getTeacherProjectFeedback,
} from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";

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

const statusColors: Record<string, string> = {
  planning: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  "in-progress": "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  review: "bg-orange-500/10 text-orange-400 border-orange-500/20",
  completed: "bg-green-500/10 text-green-400 border-green-500/20",
};

interface Student {
  _id: string;
  username: string;
  email: string;
}

interface Project {
  _id: string;
  title: string;
  description?: string;
  topic?: string;
  status: string;
  createdAt: string;
}

interface Feedback {
  _id: string;
  comment: string;
  rating?: number;
  teacher?: { username: string };
  createdAt: string;
}

export default function ProjectsPage() {
  useAuth();
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loadingStudents, setLoadingStudents] = useState(true);
  const [loadingProjects, setLoadingProjects] = useState(false);
  const [search, setSearch] = useState("");

  // Feedback
  const [feedbackProject, setFeedbackProject] = useState<string | null>(null);
  const [feedbackComment, setFeedbackComment] = useState("");
  const [feedbackRating, setFeedbackRating] = useState(0);
  const [feedbackHover, setFeedbackHover] = useState(0);
  const [submittingFeedback, setSubmittingFeedback] = useState(false);
  const [projectFeedbacks, setProjectFeedbacks] = useState<
    Record<string, Feedback[]>
  >({});

  useEffect(() => {
    async function fetchStudents() {
      try {
        const res = await getStudentsList(1, 100);
        setStudents(res.students || []);
      } catch {
        // silently handle
      } finally {
        setLoadingStudents(false);
      }
    }
    fetchStudents();
  }, []);

  const selectStudent = async (student: Student) => {
    setSelectedStudent(student);
    setProjects([]);
    setFeedbackProject(null);
    setLoadingProjects(true);
    try {
      const res = await getStudentProjectsTeacher(student._id, 1, 50);
      setProjects(res.projects || []);
    } catch {
      toast.error("Failed to load projects");
    } finally {
      setLoadingProjects(false);
    }
  };

  const loadFeedback = async (projectId: string) => {
    try {
      const res = await getTeacherProjectFeedback(projectId);
      setProjectFeedbacks((prev) => ({
        ...prev,
        [projectId]: res.feedback || [],
      }));
    } catch {
      // silently handle
    }
  };

  const handleSubmitFeedback = async (projectId: string) => {
    if (!feedbackComment.trim()) {
      toast.error("Please enter a comment");
      return;
    }
    setSubmittingFeedback(true);
    try {
      await addProjectFeedback(projectId, {
        comment: feedbackComment,
        ...(feedbackRating > 0 ? { rating: feedbackRating } : {}),
      });
      toast.success("Feedback submitted!");
      setFeedbackComment("");
      setFeedbackRating(0);
      setFeedbackProject(null);
      await loadFeedback(projectId);
    } catch {
      toast.error("Failed to submit feedback");
    } finally {
      setSubmittingFeedback(false);
    }
  };

  const filteredStudents = search.trim()
    ? students.filter((s) =>
        s.username.toLowerCase().includes(search.toLowerCase()),
      )
    : students;

  if (loadingStudents) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-48" />
        <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
          <Skeleton className="h-96 rounded-xl" />
          <Skeleton className="h-96 rounded-xl" />
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
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10">
            <FolderOpen className="h-5 w-5 text-amber-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Review Projects
            </h1>
            <p className="text-sm text-muted-foreground">
              Browse student projects and give feedback
            </p>
          </div>
        </div>
      </motion.div>

      {/* Two Column Layout */}
      <motion.div
        variants={item}
        className="grid gap-6 lg:grid-cols-[320px_1fr]"
      >
        {/* Left: Student List */}
        <Card className="border-white/[0.06] bg-white/[0.02]">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base font-semibold">
              <Users className="h-4 w-4" /> Students
            </CardTitle>
            <div className="relative mt-2">
              <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search students..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-9 pl-9 text-sm border-white/[0.08] bg-white/[0.03]"
              />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[500px]">
              <div className="space-y-0.5 px-3 pb-3">
                {filteredStudents.length === 0 ? (
                  <p className="py-8 text-center text-xs text-muted-foreground">
                    No students found
                  </p>
                ) : (
                  filteredStudents.map((student) => {
                    const isSelected = selectedStudent?._id === student._id;
                    const initials = student.username
                      .split(" ")
                      .map((w) => w[0])
                      .join("")
                      .toUpperCase()
                      .slice(0, 2);
                    return (
                      <button
                        key={student._id}
                        onClick={() => selectStudent(student)}
                        className={`flex w-full items-center gap-3 rounded-lg p-2.5 text-left transition-colors ${
                          isSelected
                            ? "bg-primary/10 border border-primary/20"
                            : "hover:bg-white/[0.04] border border-transparent"
                        }`}
                      >
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">
                            {initials}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium">
                            {student.username}
                          </p>
                          <p className="truncate text-xs text-muted-foreground">
                            {student.email}
                          </p>
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Right: Projects */}
        <div className="space-y-4">
          {!selectedStudent ? (
            <Card className="border-white/[0.06] bg-white/[0.02]">
              <CardContent className="flex flex-col items-center justify-center py-20">
                <FolderOpen className="h-10 w-10 text-muted-foreground/30 mb-3" />
                <p className="text-sm text-muted-foreground">
                  Select a student to view their projects
                </p>
              </CardContent>
            </Card>
          ) : loadingProjects ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-28 rounded-xl" />
              ))}
            </div>
          ) : (
            <>
              <div className="flex items-center gap-2 mb-2">
                <h2 className="text-lg font-semibold">
                  {selectedStudent.username}&apos;s Projects
                </h2>
                <Badge variant="outline" className="text-xs">
                  {projects.length}
                </Badge>
              </div>

              {projects.length === 0 ? (
                <Card className="border-white/[0.06] bg-white/[0.02]">
                  <CardContent className="py-12 text-center">
                    <p className="text-sm text-muted-foreground">
                      No projects yet
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <AnimatePresence>
                  {projects.map((project) => (
                    <motion.div
                      key={project._id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Card className="border-white/[0.06] bg-white/[0.02]">
                        <CardContent className="p-5">
                          <div className="flex items-start justify-between">
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-semibold">
                                {project.title}
                              </p>
                              {project.description && (
                                <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
                                  {project.description}
                                </p>
                              )}
                              <div className="mt-2 flex items-center gap-2">
                                <Badge
                                  variant="outline"
                                  className={
                                    statusColors[project.status] ||
                                    "bg-gray-500/10 text-gray-400"
                                  }
                                >
                                  {project.status}
                                </Badge>
                                {project.topic && (
                                  <span className="text-xs text-muted-foreground">
                                    {project.topic}
                                  </span>
                                )}
                                <span className="text-xs text-muted-foreground">
                                  {new Date(
                                    project.createdAt,
                                  ).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              className="ml-3 shrink-0 gap-1"
                              onClick={() => {
                                if (feedbackProject === project._id) {
                                  setFeedbackProject(null);
                                } else {
                                  setFeedbackProject(project._id);
                                  loadFeedback(project._id);
                                }
                              }}
                            >
                              <MessageSquare className="h-3.5 w-3.5" />
                              Feedback
                            </Button>
                          </div>

                          {/* Feedback Section */}
                          <AnimatePresence>
                            {feedbackProject === project._id && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.2 }}
                                className="overflow-hidden"
                              >
                                <div className="mt-4 space-y-3 border-t border-white/[0.06] pt-4">
                                  {/* Existing Feedback */}
                                  {projectFeedbacks[project._id]?.map((fb) => (
                                    <div
                                      key={fb._id}
                                      className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-3"
                                    >
                                      <div className="flex items-center justify-between">
                                        <span className="text-xs font-medium">
                                          {fb.teacher?.username ?? "Teacher"}
                                        </span>
                                        {fb.rating && (
                                          <div className="flex gap-0.5">
                                            {[1, 2, 3, 4, 5].map((s) => (
                                              <Star
                                                key={s}
                                                className={`h-3 w-3 ${
                                                  s <= fb.rating!
                                                    ? "fill-amber-400 text-amber-400"
                                                    : "text-muted-foreground/30"
                                                }`}
                                              />
                                            ))}
                                          </div>
                                        )}
                                      </div>
                                      <p className="mt-1 text-sm text-muted-foreground">
                                        {fb.comment}
                                      </p>
                                      <p className="mt-1 text-xs text-muted-foreground/60">
                                        {new Date(
                                          fb.createdAt,
                                        ).toLocaleDateString()}
                                      </p>
                                    </div>
                                  ))}

                                  {/* New Feedback Form */}
                                  <div className="space-y-3">
                                    <Textarea
                                      placeholder="Write your feedback..."
                                      value={feedbackComment}
                                      onChange={(e) =>
                                        setFeedbackComment(e.target.value)
                                      }
                                      className="min-h-20 border-white/[0.08] bg-white/[0.03]"
                                    />
                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center gap-2">
                                        <span className="text-xs text-muted-foreground">
                                          Rating:
                                        </span>
                                        <div className="flex gap-0.5">
                                          {[1, 2, 3, 4, 5].map((s) => (
                                            <button
                                              key={s}
                                              type="button"
                                              onClick={() =>
                                                setFeedbackRating(
                                                  feedbackRating === s ? 0 : s,
                                                )
                                              }
                                              onMouseEnter={() =>
                                                setFeedbackHover(s)
                                              }
                                              onMouseLeave={() =>
                                                setFeedbackHover(0)
                                              }
                                              className="p-0.5 transition-transform hover:scale-110"
                                            >
                                              <Star
                                                className={`h-4 w-4 ${
                                                  s <=
                                                  (feedbackHover ||
                                                    feedbackRating)
                                                    ? "fill-amber-400 text-amber-400"
                                                    : "text-muted-foreground/30"
                                                }`}
                                              />
                                            </button>
                                          ))}
                                        </div>
                                      </div>
                                      <Button
                                        size="sm"
                                        disabled={submittingFeedback}
                                        onClick={() =>
                                          handleSubmitFeedback(project._id)
                                        }
                                        className="gap-1"
                                      >
                                        {submittingFeedback ? (
                                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                        ) : (
                                          <Send className="h-3.5 w-3.5" />
                                        )}
                                        Submit
                                      </Button>
                                    </div>
                                  </div>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </AnimatePresence>
              )}
            </>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
