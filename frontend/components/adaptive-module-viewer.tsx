"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  ChevronRight,
  ChevronLeft,
  BookOpen,
  CheckCircle2,
  ExternalLink,
  Layers,
  Sparkles,
} from "lucide-react";
import { fetchAdaptiveModules } from "@/lib/api";
import { MarkdownRenderer } from "@/components/markdown-renderer";

interface AdaptiveModuleViewerProps {
  projectName: string;
  onComplete: (quizData: any[]) => void;
}

interface Resource {
  name: string;
  url: string;
}

interface ModuleData {
  title: string;
  subtitle?: string;
  content: string;
  resources?: Resource[];
}

export function AdaptiveModuleViewer({
  projectName,
  onComplete,
}: AdaptiveModuleViewerProps) {
  const [modules, setModules] = useState<ModuleData[]>([]);
  const [quizData, setQuizData] = useState<any[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(true);
  const [direction, setDirection] = useState<"next" | "prev">("next");

  useEffect(() => {
    const loadModules = async () => {
      try {
        const data = await fetchAdaptiveModules(projectName);

        // Parse modules
        const rawModules = data.modules || data;
        let parsed: ModuleData[] = [];

        if (typeof rawModules === "object" && rawModules !== null) {
          if (Array.isArray(rawModules)) {
            parsed = rawModules;
          } else if (rawModules.modules && Array.isArray(rawModules.modules)) {
            parsed = rawModules.modules;
          } else if (rawModules.title && rawModules.content) {
            parsed = [rawModules as ModuleData];
          }
        } else if (typeof rawModules === "string") {
          try {
            let jsonString = rawModules.trim();
            if (jsonString.startsWith("```json")) {
              jsonString = jsonString
                .replace(/^```json/, "")
                .replace(/```$/, "")
                .trim();
            } else if (jsonString.startsWith("```")) {
              jsonString = jsonString
                .replace(/^```/, "")
                .replace(/```$/, "")
                .trim();
            }
            const jsonOutput = JSON.parse(jsonString);
            if (Array.isArray(jsonOutput)) {
              parsed = jsonOutput;
            } else if (
              jsonOutput.modules &&
              Array.isArray(jsonOutput.modules)
            ) {
              parsed = jsonOutput.modules;
            } else {
              parsed = [jsonOutput];
            }
          } catch {
            const chunks = rawModules.split(/^## /m).filter(Boolean);
            parsed = chunks.map((chunk: string) => {
              const lines = chunk.split("\n");
              const title = lines[0].trim();
              const content = lines.slice(1).join("\n").trim();
              return { title, content };
            });
          }
        }

        if (parsed.length === 0) {
          setModules([
            {
              title: "Welcome",
              content: "No adaptive modules found. Please try again.",
            },
          ]);
        } else {
          setModules(parsed);
        }

        // Parse quizzes
        let quizzes: any[] = [];
        const rawQuizzes = data.quizzes;
        if (rawQuizzes) {
          if (typeof rawQuizzes === "string") {
            try {
              let qs = rawQuizzes.trim();
              if (qs.startsWith("```json")) {
                qs = qs
                  .replace(/^```json/, "")
                  .replace(/```$/, "")
                  .trim();
              } else if (qs.startsWith("```")) {
                qs = qs.replace(/^```/, "").replace(/```$/, "").trim();
              }
              const parsed = JSON.parse(qs);
              quizzes = parsed.quizzes || parsed;
            } catch {
              console.warn("Failed to parse adaptive quiz data");
            }
          } else if (typeof rawQuizzes === "object") {
            quizzes = rawQuizzes.quizzes || rawQuizzes;
          }
        }
        setQuizData(Array.isArray(quizzes) ? quizzes : []);
      } catch (error) {
        console.error("Failed to load adaptive modules", error);
        setModules([
          {
            title: "Error",
            content: "Failed to load adaptive learning modules.",
          },
        ]);
      } finally {
        setLoading(false);
      }
    };
    loadModules();
  }, [projectName]);

  const handleNext = () => {
    if (currentStep < modules.length - 1) {
      setDirection("next");
      setCurrentStep((prev) => prev + 1);
    } else {
      onComplete(quizData);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setDirection("prev");
      setCurrentStep((prev) => prev - 1);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col h-full items-center justify-center gap-6 p-8">
        <div className="relative">
          <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-violet-500/20 to-purple-500/20 flex items-center justify-center">
            <Layers className="h-8 w-8 text-violet-400" />
          </div>
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-violet-500/20 to-purple-500/20 animate-ping opacity-30" />
        </div>
        <div className="text-center space-y-2">
          <p className="text-lg font-semibold">
            Generating adaptive curriculum...
          </p>
          <p className="text-sm text-muted-foreground">
            Creating project-specific modules tailored to your {projectName}{" "}
            project
          </p>
        </div>
        <div className="flex gap-1.5">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="h-2 w-2 rounded-full bg-violet-400 animate-bounce"
              style={{ animationDelay: `${i * 0.15}s` }}
            />
          ))}
        </div>
      </div>
    );
  }

  const currentModule = modules[currentStep];
  const progress = ((currentStep + 1) / modules.length) * 100;

  return (
    <div className="flex flex-col h-full max-w-5xl mx-auto w-full">
      {/* Header */}
      <div className="border-b border-border p-6 bg-background/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-violet-500/20 to-purple-500/20 flex items-center justify-center shadow-sm">
              <Layers className="h-6 w-6 text-violet-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold tracking-tight">
                Adaptive Modules
              </h2>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Sparkles className="h-3 w-3 text-violet-400" />
                <span className="font-medium text-foreground">
                  Module {currentStep + 1}
                </span>
                <span>of</span>
                <span>{modules.length}</span>
              </div>
            </div>
          </div>
          <div className="text-sm font-medium text-violet-400 bg-violet-500/10 px-3 py-1 rounded-full">
            {Math.round(progress)}% Complete
          </div>
        </div>

        {/* Progress Bar */}
        <div className="h-2 w-full bg-secondary/50 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-violet-500 to-purple-500 transition-all duration-500 ease-out rounded-full"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-hidden relative p-6">
        <div
          key={currentStep}
          className="h-full overflow-auto pr-2 animate-in fade-in duration-500 ease-in-out fill-mode-both"
        >
          <Card className="min-h-full p-8 shadow-md border-border/50 bg-card/50 backdrop-blur-sm">
            <div className="max-w-4xl mx-auto space-y-8">
              {/* Module Title Section */}
              <div className="border-b border-border pb-6">
                <div className="flex items-center gap-2 text-xs font-medium text-violet-400 uppercase tracking-wider mb-2">
                  <Sparkles className="h-3 w-3" />
                  Project-Specific Module
                </div>
                <h3 className="text-3xl font-bold text-foreground mb-2">
                  {currentModule?.title}
                </h3>
                {currentModule?.subtitle && (
                  <p className="text-lg text-muted-foreground font-medium">
                    {currentModule.subtitle}
                  </p>
                )}
              </div>

              {/* Main Content */}
              <div className="prose prose-zinc dark:prose-invert max-w-none">
                <MarkdownRenderer content={currentModule?.content || ""} />
              </div>

              {/* Resources Section */}
              {currentModule?.resources &&
                currentModule.resources.length > 0 && (
                  <div className="mt-8 pt-6 border-t border-border">
                    <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <ExternalLink className="h-4 w-4" />
                      Recommended Resources
                    </h4>
                    <div className="grid gap-3 md:grid-cols-2">
                      {currentModule.resources.map((res, idx) => (
                        <a
                          key={idx}
                          href={res.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-between p-4 rounded-lg bg-secondary/50 hover:bg-secondary hover:shadow-md transition-all group border border-transparent hover:border-border"
                        >
                          <span className="font-medium text-sm truncate pr-4">
                            {res.name}
                          </span>
                          <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-violet-400 transition-colors" />
                        </a>
                      ))}
                    </div>
                  </div>
                )}
            </div>
          </Card>
        </div>
      </div>

      {/* Footer Navigation */}
      <div className="p-6 border-t border-border flex justify-between items-center bg-background/80 backdrop-blur-md sticky bottom-0 z-10">
        <Button
          variant="ghost"
          size="lg"
          onClick={handlePrev}
          disabled={currentStep === 0}
          className="gap-2 hover:bg-secondary/80 pl-2"
        >
          <ChevronLeft className="h-5 w-5" />
          Previous
        </Button>

        <div className="flex gap-2">
          <Button
            size="lg"
            onClick={handleNext}
            className="gap-2 min-w-[160px] bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white border-0 shadow-lg shadow-violet-500/20 hover:shadow-violet-500/40 transition-all"
          >
            {currentStep === modules.length - 1 ? (
              <>
                Complete Modules
                <CheckCircle2 className="h-5 w-5" />
              </>
            ) : (
              <>
                Next Topic
                <ChevronRight className="h-5 w-5" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
