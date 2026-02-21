"use client";

import { Sidebar } from "@/components/sidebar";
import { TopBar } from "@/components/top-bar";
import { HeroSection } from "@/components/hero";
import { QuickActions } from "@/components/quick-actions";
import { CommandInput } from "@/components/command-input";
import {
  WorkflowPreviewCard,
} from "@/components/workflow/WorkflowPreviewCard";
import { useWorkflowStore } from "@/lib/workflow-store";

export default function Home() {
  const appState = useWorkflowStore((s) => s.appState);
  const startWorkflow = useWorkflowStore((s) => s.startWorkflow);
  const cancelWorkflow = useWorkflowStore((s) => s.cancelWorkflow);
  const intent = useWorkflowStore((s) => s.intent);
  const workflow = useWorkflowStore((s) => s.workflow);

  // Hardcoded display names for each workflow type
  const WORKFLOW_DISPLAY_NAMES: Record<string, string> = {
    flashcards: "Generate Flashcards",
    quiz: "Generate Quiz",
    summary: "Create Summary",
    organize: "Organize Notes",
    audio: "Generate Audio",
    revision: "Create Revision Plan",
  };

  // Map backend store data to frontend preview format
  const previewData = intent && workflow ? {
    title: WORKFLOW_DISPLAY_NAMES[intent.workflowType] ?? workflow.title,
    subtitle: intent.topic ? `for ${intent.topic}` : undefined,
    confidence: Math.round(intent.confidence * 100),
    sourceMaterial: {
      name: intent.source,
      type: (intent.sourceType === "notion" ? "notion" : "local") as "notion" | "local",
    },
    architecture: {
      stageCount: workflow.steps.length,
      label: "AI Pipeline",
    },
    estimatedDuration: workflow.estimatedTime,
    systemNotes: workflow.description,
  } : null;

  return (
    <div className="flex h-screen bg-[#0f1117] text-white overflow-hidden font-sans selection:bg-blue-500/30">
      <Sidebar />
      <main className="flex-1 flex flex-col overflow-auto relative">
        <TopBar />
        <div className="flex-1 flex flex-col items-center justify-center px-6">
          <HeroSection />
          <CommandInput />
          <QuickActions />
        </div>
      </main>

      {/* Workflow Preview Overlay */}
      {appState === "preview" && previewData && (
        <WorkflowPreviewCard
          data={previewData}
          onExecute={startWorkflow}
          onCancel={cancelWorkflow}
        />
      )}
    </div>
  );
}

