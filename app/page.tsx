"use client";

import { Sidebar } from "@/components/sidebar";
import { TopBar } from "@/components/top-bar";
import { HeroSection } from "@/components/hero";
import { QuickActions } from "@/components/quick-actions";
import { CommandInput } from "@/components/command-input";
import {
  WorkflowPreviewCard,
  type WorkflowPreview,
} from "@/components/workflow/WorkflowPreviewCard";
import { useStore } from "@/lib/orca-store";

const mockPreviewData: WorkflowPreview = {
  title: "Generate Flashcards",
  subtitle: "for Operating Systems",
  confidence: 95,
  sourceMaterial: { name: "OS - Chapter 4", type: "notion" },
  architecture: { stageCount: 6, label: "AI QA Pipeline" },
  estimatedDuration: "12–15 min",
  systemNotes:
    "Diagrams detected in Chapter 4. Orca will generate descriptive flashcards for visual concepts to ensure complete coverage.",
};

export default function Home() {
  const appState = useStore((s) => s.appState);
  const startWorkflow = useStore((s) => s.startWorkflow);
  const cancelWorkflow = useStore((s) => s.cancelWorkflow);

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
      {appState === "preview" && (
        <WorkflowPreviewCard
          data={mockPreviewData}
          onExecute={startWorkflow}
          onCancel={cancelWorkflow}
        />
      )}
    </div>
  );
}

