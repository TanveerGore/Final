"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  Cpu,
  LayoutDashboard,
  FolderOpen,
  Rocket,
  MessageCircleQuestion,
  Trophy,
  UserCircle,
  Users,
  LogOut,
  PanelLeft,
  PanelRight,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuth } from "@/contexts/auth-context";
import { cn } from "@/lib/utils";

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

const studentNav: NavItem[] = [
  { label: "Dashboard", href: "/student/dashboard", icon: LayoutDashboard },
  { label: "My Projects", href: "/student/projects", icon: FolderOpen },
  { label: "Learn", href: "/student/projects/new", icon: Rocket },
  {
    label: "Questions",
    href: "/student/questions",
    icon: MessageCircleQuestion,
  },
  { label: "Quiz Results", href: "/student/quizzes", icon: Trophy },
  { label: "Profile", href: "/student/profile", icon: UserCircle },
];

const teacherNav: NavItem[] = [
  { label: "Dashboard", href: "/teacher/dashboard", icon: LayoutDashboard },
  { label: "Students", href: "/teacher/students", icon: Users },
  {
    label: "Questions",
    href: "/teacher/questions",
    icon: MessageCircleQuestion,
  },
  { label: "Projects", href: "/teacher/projects", icon: FolderOpen },
  { label: "Profile", href: "/teacher/profile", icon: UserCircle },
];

const SIDEBAR_KEY = "embedai-sidebar-collapsed";

interface AppSidebarProps {
  role: "student" | "teacher";
}

export default function AppSidebar({ role }: AppSidebarProps) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems = role === "student" ? studentNav : teacherNav;

  useEffect(() => {
    try {
      const stored = localStorage.getItem(SIDEBAR_KEY);
      if (stored !== null) setCollapsed(stored === "true");
    } catch {}
  }, []);

  const toggleCollapsed = () => {
    const next = !collapsed;
    setCollapsed(next);
    try {
      localStorage.setItem(SIDEBAR_KEY, String(next));
    } catch {}
  };

  const isActive = (href: string) => {
    if (href === pathname) return true;
    // For nested routes, match parent path but not for dashboard
    if (href.endsWith("/dashboard")) return pathname === href;
    return pathname.startsWith(href + "/");
  };

  const initials = user?.username
    ? user.username
        .split(" ")
        .map((w) => w[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "?";

  const sidebarContent = (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <div className="flex h-16 items-center gap-3 px-4">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Cpu className="h-5 w-5" />
        </div>
        <AnimatePresence>
          {!collapsed && (
            <motion.span
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: "auto" }}
              exit={{ opacity: 0, width: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden whitespace-nowrap text-base font-semibold tracking-tight"
            >
              EmbedAI Learn
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      <Separator className="opacity-50" />

      {/* Navigation */}
      <ScrollArea className="flex-1 px-3 py-4">
        <nav className="flex flex-col gap-1">
          <TooltipProvider delayDuration={0}>
            {navItems.map((item) => {
              const active = isActive(item.href);
              const linkEl = (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                    active
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-accent hover:text-foreground",
                  )}
                >
                  {/* Active indicator */}
                  {active && (
                    <motion.div
                      layoutId="sidebar-active"
                      className="absolute left-0 top-1/2 h-6 w-[3px] -translate-y-1/2 rounded-r-full bg-primary"
                      transition={{
                        type: "spring",
                        stiffness: 350,
                        damping: 30,
                      }}
                    />
                  )}
                  <item.icon
                    className={cn(
                      "h-[18px] w-[18px] shrink-0 transition-colors",
                      active
                        ? "text-primary"
                        : "text-muted-foreground group-hover:text-foreground",
                    )}
                  />
                  <AnimatePresence>
                    {!collapsed && (
                      <motion.span
                        initial={{ opacity: 0, width: 0 }}
                        animate={{ opacity: 1, width: "auto" }}
                        exit={{ opacity: 0, width: 0 }}
                        transition={{ duration: 0.15 }}
                        className="overflow-hidden whitespace-nowrap"
                      >
                        {item.label}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </Link>
              );

              if (collapsed) {
                return (
                  <Tooltip key={item.href}>
                    <TooltipTrigger asChild>{linkEl}</TooltipTrigger>
                    <TooltipContent side="right" sideOffset={8}>
                      {item.label}
                    </TooltipContent>
                  </Tooltip>
                );
              }
              return linkEl;
            })}
          </TooltipProvider>
        </nav>
      </ScrollArea>

      <Separator className="opacity-50" />

      {/* User section */}
      <div className="p-3">
        <div
          className={cn(
            "flex items-center gap-3 rounded-lg px-3 py-2.5",
            collapsed && "justify-center px-0",
          )}
        >
          <Avatar className="h-8 w-8 shrink-0 border border-border">
            <AvatarFallback className="bg-primary/10 text-xs font-medium text-primary">
              {initials}
            </AvatarFallback>
          </Avatar>
          <AnimatePresence>
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.15 }}
                className="flex min-w-0 flex-1 flex-col overflow-hidden"
              >
                <span className="truncate text-sm font-medium">
                  {user?.username}
                </span>
                <span className="truncate text-xs text-muted-foreground">
                  {user?.email}
                </span>
              </motion.div>
            )}
          </AnimatePresence>
          <AnimatePresence>
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.15 }}
              >
                <TooltipProvider delayDuration={0}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 shrink-0 text-muted-foreground hover:text-destructive"
                        onClick={logout}
                      >
                        <LogOut className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="right">Logout</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        {collapsed && (
          <TooltipProvider delayDuration={0}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="mt-1 h-8 w-full text-muted-foreground hover:text-destructive"
                  onClick={logout}
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">Logout</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile toggle */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed left-4 top-4 z-50 md:hidden"
        onClick={() => setMobileOpen((v) => !v)}
      >
        <PanelLeft className="h-5 w-5" />
      </Button>

      {/* Mobile overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-background/60 backdrop-blur-sm md:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed left-0 top-0 z-50 h-dvh w-64 border-r border-border/50 bg-card/80 backdrop-blur-xl md:hidden"
            >
              {sidebarContent}
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Desktop sidebar */}
      <motion.aside
        animate={{ width: collapsed ? 68 : 256 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="relative hidden h-dvh shrink-0 border-r border-border/50 bg-card/80 backdrop-blur-xl md:flex md:flex-col"
      >
        {sidebarContent}

        {/* Collapse toggle */}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleCollapsed}
          className="absolute -right-3 top-20 z-10 h-6 w-6 rounded-full border border-border bg-background text-muted-foreground shadow-sm hover:text-foreground"
        >
          {collapsed ? (
            <PanelLeft className="h-3.5 w-3.5" />
          ) : (
            <PanelRight className="h-3.5 w-3.5" />
          )}
        </Button>
      </motion.aside>
    </>
  );
}
