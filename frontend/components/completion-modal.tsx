"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Trophy, Download, Share2, Home, Sparkles, Star } from "lucide-react";

interface CompletionModalProps {
  projectName: string;
  onClose: () => void;
}

export function CompletionModal({
  projectName,
  onClose,
}: CompletionModalProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 bg-background/80 backdrop-blur-md z-50 flex items-center justify-center p-4"
    >
      {/* Floating particles */}
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute pointer-events-none"
          initial={{
            opacity: 0,
            x: Math.random() * 400 - 200,
            y: Math.random() * 400 - 200,
          }}
          animate={{
            opacity: [0, 1, 0],
            y: [0, -100 - Math.random() * 200],
            x: [0, (Math.random() - 0.5) * 100],
          }}
          transition={{
            duration: 2 + Math.random() * 2,
            delay: Math.random() * 1,
            repeat: Infinity,
            repeatDelay: Math.random() * 2,
          }}
        >
          {i % 2 === 0 ? (
            <Star className="h-4 w-4 text-amber-400/60" />
          ) : (
            <Sparkles className="h-4 w-4 text-primary/60" />
          )}
        </motion.div>
      ))}

      <motion.div
        initial={{ scale: 0.8, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 200, damping: 20, delay: 0.1 }}
      >
        <Card className="max-w-lg w-full p-8 bg-card/90 backdrop-blur-xl border-primary/30 shadow-2xl shadow-primary/10 overflow-hidden relative">
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.05] via-transparent to-violet-500/[0.05] pointer-events-none" />

          <div className="relative text-center space-y-6">
            {/* Trophy Icon */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 300, delay: 0.3 }}
              className="flex justify-center"
            >
              <div className="h-24 w-24 rounded-full bg-gradient-to-br from-amber-500/20 to-orange-500/20 flex items-center justify-center ring-4 ring-amber-500/10">
                <motion.div
                  animate={{ rotate: [0, -10, 10, -5, 5, 0] }}
                  transition={{ delay: 0.6, duration: 0.5 }}
                >
                  <Trophy className="h-12 w-12 text-amber-400" />
                </motion.div>
              </div>
            </motion.div>

            {/* Success Message */}
            <div className="space-y-2">
              <motion.h2
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-3xl font-bold bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent"
              >
                Congratulations!
              </motion.h2>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-muted-foreground"
              >
                You&apos;ve successfully completed
              </motion.p>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="text-xl font-semibold text-primary"
              >
                {projectName}
              </motion.p>
            </div>

            {/* Achievement Stats */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="grid grid-cols-3 gap-3 py-4"
            >
              <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-4">
                <div className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                  9
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  Steps Done
                </div>
              </div>
              <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-4">
                <div className="text-2xl font-bold bg-gradient-to-r from-violet-400 to-purple-400 bg-clip-text text-transparent">
                  2
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  Quizzes Passed
                </div>
              </div>
              <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-4">
                <div className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-green-400 bg-clip-text text-transparent">
                  100%
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  Progress
                </div>
              </div>
            </motion.div>

            {/* Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="space-y-3 pt-2"
            >
              <Button
                asChild
                className="w-full h-12 bg-gradient-to-r from-primary to-violet-600 hover:from-primary/90 hover:to-violet-500 text-primary-foreground border-0 shadow-lg shadow-primary/20 text-base font-semibold"
              >
                <a href="/student/projects/new">
                  <Sparkles className="h-4 w-4 mr-2" />
                  Start New Project
                </a>
              </Button>
              <div className="grid grid-cols-2 gap-3">
                <Button variant="outline" className="w-full">
                  <Download className="h-4 w-4 mr-2" />
                  Download Code
                </Button>
                <Button variant="outline" className="w-full">
                  <Share2 className="h-4 w-4 mr-2" />
                  Share Project
                </Button>
              </div>
              <Button
                variant="ghost"
                onClick={onClose}
                className="w-full text-muted-foreground"
              >
                Close
              </Button>
            </motion.div>
          </div>
        </Card>
      </motion.div>
    </motion.div>
  );
}
