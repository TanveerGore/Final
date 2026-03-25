"use client";

import React from "react";
import { useAuth } from "@/contexts/auth-context";
import AppSidebar from "@/components/app-sidebar";
import { Loader2 } from "lucide-react";

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex h-dvh items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user || user.role !== "student") {
    return null;
  }

  return (
    <div className="flex h-dvh overflow-hidden bg-background">
      <AppSidebar role="student" />
      <main className="flex-1 overflow-y-auto p-6 pt-16 md:pt-6">
        {children}
      </main>
    </div>
  );
}
