"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Users,
  Search,
  ArrowRight,
  Mail,
  Calendar,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { getStudentsList } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

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

interface Student {
  _id: string;
  username: string;
  email: string;
  createdAt: string;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export default function StudentsPage() {
  useAuth();
  const [students, setStudents] = useState<Student[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const res = await getStudentsList(page, 20);
        setStudents(res.students || []);
        setPagination(res.pagination || null);
      } catch {
        // silently handle
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [page]);

  const filtered = useMemo(() => {
    if (!search.trim()) return students;
    const q = search.toLowerCase();
    return students.filter(
      (s) =>
        s.username.toLowerCase().includes(q) ||
        s.email.toLowerCase().includes(q),
    );
  }, [students, search]);

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-11 w-full max-w-sm" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
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
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10">
            <Users className="h-5 w-5 text-blue-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Students</h1>
            <p className="text-sm text-muted-foreground">
              {pagination?.total ?? students.length} student
              {(pagination?.total ?? students.length) !== 1 ? "s" : ""} enrolled
            </p>
          </div>
        </div>
      </motion.div>

      {/* Search */}
      <motion.div variants={item} className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search by username or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-11 pl-10 border-white/[0.08] bg-white/[0.03] focus-visible:border-primary/50"
        />
      </motion.div>

      {/* Student Cards */}
      {filtered.length === 0 ? (
        <motion.div variants={item}>
          <p className="py-12 text-center text-sm text-muted-foreground">
            {search ? "No students match your search" : "No students found"}
          </p>
        </motion.div>
      ) : (
        <motion.div
          variants={item}
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
        >
          {filtered.map((student) => {
            const initials = student.username
              .split(" ")
              .map((w) => w[0])
              .join("")
              .toUpperCase()
              .slice(0, 2);
            return (
              <Link key={student._id} href={`/teacher/students/${student._id}`}>
                <Card className="group cursor-pointer border-white/[0.06] bg-white/[0.02] transition-all duration-200 hover:border-primary/30 hover:bg-white/[0.04]">
                  <CardContent className="p-5">
                    <div className="flex items-start gap-4">
                      <Avatar className="h-11 w-11 border border-white/[0.08]">
                        <AvatarFallback className="bg-primary/10 text-sm font-semibold text-primary">
                          {initials}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold group-hover:text-primary transition-colors">
                          {student.username}
                        </p>
                        <div className="mt-1.5 flex items-center gap-1.5 text-xs text-muted-foreground">
                          <Mail className="h-3 w-3 shrink-0" />
                          <span className="truncate">{student.email}</span>
                        </div>
                        <div className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                          <Calendar className="h-3 w-3 shrink-0" />
                          <span>
                            Joined{" "}
                            {new Date(student.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
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
