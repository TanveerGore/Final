"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Cable, ChevronRight, AlertCircle, Loader2 } from "lucide-react";
import { fetchProjectDetails } from "@/lib/api";
import { MarkdownRenderer } from "@/components/markdown-renderer";

interface WiringAgentProps {
  projectName: string;
  onComplete?: () => void;
}

export function WiringAgent({ projectName, onComplete }: WiringAgentProps) {
  const [wiringInfo, setWiringInfo] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const loadWiringInfo = async () => {
      try {
        setLoading(true);
        const data = await fetchProjectDetails(projectName);
        setWiringInfo(
          data.wiring_agent_output || "Wiring information not available",
        );
      } catch (err) {
        console.error("Failed to load wiring info:", err);
        setError("Failed to load wiring information");
        setWiringInfo("Wiring information not available at this time");
      } finally {
        setLoading(false);
      }
    };
    loadWiringInfo();
  }, [projectName]);

  if (loading) {
    return (
      <div className="h-full flex flex-col items-center justify-center gap-6 p-8">
        <div className="relative">
          <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center">
            <Cable className="h-8 w-8 text-cyan-400" />
          </div>
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-cyan-500/10 to-blue-500/10 animate-ping opacity-30" />
        </div>
        <div className="text-center space-y-2">
          <p className="text-lg font-semibold">Generating wiring guide...</p>
          <p className="text-sm text-muted-foreground">
            Creating connection diagrams for your components
          </p>
        </div>
        <div className="flex gap-1.5">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="h-2 w-2 rounded-full bg-cyan-400 animate-bounce"
              style={{ animationDelay: `${i * 0.15}s` }}
            />
          ))}
        </div>
      </div>
    );
  }
  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="border-b border-border p-6">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 h-12 w-12 rounded-lg bg-accent/20 flex items-center justify-center">
            <Cable className="h-6 w-6 text-accent" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-1">
              Wiring Guide
            </h2>
            <p className="text-muted-foreground">
              Learn how to connect all the components
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {error && (
          <div className="p-4 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        <Card className="p-6 bg-card border-border">
          <h3 className="font-semibold text-foreground mb-3">
            Wiring Instructions
          </h3>
          {wiringInfo && <MarkdownRenderer content={wiringInfo} />}
        </Card>
      </div>

      {/* Footer */}
      <div className="border-t border-border p-6 flex justify-between">
        <div className="text-sm text-muted-foreground">
          Step 2 of 5: Wiring Guide
        </div>
        {onComplete && (
          <Button
            variant="outline"
            size="lg"
            onClick={onComplete}
            className="gap-2"
          >
            Next: Code
            <ChevronRight className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
