"use client";

import React from "react";

import { cn } from "@/lib/utils";
import { CheckCircle2, Circle, Lock, GraduationCap } from "lucide-react";

interface RoadmapNodeProps {
  title: string;
  description: string;
  status: "completed" | "active" | "locked";
  icon: React.ReactNode;
  isActive?: boolean;
  isQuiz?: boolean;
  onClick?: () => void;
}

export function RoadmapNode({
  title,
  description,
  status,
  icon,
  isActive = false,
  isQuiz = false,
  onClick,
}: RoadmapNodeProps) {
  const isClickable = status !== "locked";

  return (
    <button
      onClick={isClickable ? onClick : undefined}
      disabled={!isClickable}
      className={cn(
        "relative w-full p-3 rounded-xl border transition-all duration-300 text-left",
        "hover:scale-[1.01] active:scale-[0.99]",
        status === "completed" &&
          "bg-emerald-500/5 border-emerald-500/20 hover:border-emerald-500/40",
        status === "active" &&
          !isActive &&
          "bg-primary/5 border-primary/20 hover:border-primary/40",
        status === "active" &&
          isActive &&
          "bg-primary/10 border-primary/50 shadow-lg shadow-primary/10 ring-1 ring-primary/20",
        status === "locked" &&
          "bg-card/30 border-border/50 opacity-50 cursor-not-allowed hover:scale-100",
        isQuiz &&
          status === "active" &&
          isActive &&
          "bg-violet-500/10 border-violet-500/50 shadow-violet-500/10 ring-violet-500/20",
        isQuiz &&
          status === "active" &&
          !isActive &&
          "bg-violet-500/5 border-violet-500/20",
        isQuiz &&
          status === "completed" &&
          "bg-emerald-500/5 border-emerald-500/20",
        isClickable && "cursor-pointer",
      )}
    >
      <div className="flex items-center gap-3">
        {/* Icon */}
        <div
          className={cn(
            "flex-shrink-0 h-10 w-10 rounded-lg flex items-center justify-center transition-all duration-300",
            status === "completed" && "bg-emerald-500/15 text-emerald-400",
            status === "active" && isQuiz && "bg-violet-500/20 text-violet-400",
            status === "active" && !isQuiz && "bg-primary/20 text-primary",
            status === "locked" && "bg-muted/50 text-muted-foreground",
          )}
        >
          {isQuiz ? <GraduationCap className="h-5 w-5" /> : icon}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <h3
              className={cn(
                "text-sm font-medium truncate",
                status === "locked" && "text-muted-foreground",
                status === "completed" && "text-emerald-400",
                status === "active" && "text-foreground",
              )}
            >
              {title}
            </h3>
            <div className="flex-shrink-0">
              {status === "completed" && (
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              )}
              {status === "active" && isActive && (
                <div className="h-2.5 w-2.5 rounded-full bg-primary animate-pulse shadow-lg shadow-primary/50" />
              )}
              {status === "active" && !isActive && (
                <Circle className="h-4 w-4 text-primary/50" />
              )}
              {status === "locked" && (
                <Lock className="h-3.5 w-3.5 text-muted-foreground/50" />
              )}
            </div>
          </div>
          <p
            className={cn(
              "text-xs leading-relaxed mt-0.5 truncate",
              status === "locked"
                ? "text-muted-foreground/50"
                : "text-muted-foreground",
            )}
          >
            {description}
          </p>
        </div>
      </div>
    </button>
  );
}
