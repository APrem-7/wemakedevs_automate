"use client";

// components/workflow/WorkflowExecutionView.tsx
// Orchestrator for the full Workflow Execution page.
// Holds state, handles stage focusing, execute/skip transitions.

import { useState, useCallback } from "react";
import type { WorkflowExecution, ExecutionStageStatus } from "@/lib/types";
import { WorkflowHeader } from "./WorkflowHeader";
import { WorkflowTimeline } from "./WorkflowTimeline";

interface WorkflowExecutionViewProps {
    initialExecution: WorkflowExecution;
}

export function WorkflowExecutionView({
    initialExecution,
}: WorkflowExecutionViewProps) {
    const [execution, setExecution] = useState<WorkflowExecution>(initialExecution);
    const [focusedStageId, setFocusedStageId] = useState<string | null>(null);

    // Find the current stage index
    const currentIndex = execution.stages.findIndex((s) => s.status === "current");

    const advanceStage = useCallback(() => {
        setExecution((prev) => {
            const stages = [...prev.stages];
            const curIdx = stages.findIndex((s) => s.status === "current");
            if (curIdx === -1) return prev;

            // Mark current as completed
            stages[curIdx] = { ...stages[curIdx], status: "completed" as ExecutionStageStatus, duration: "Just now" };

            // Mark next as current (if exists)
            if (curIdx + 1 < stages.length) {
                stages[curIdx + 1] = { ...stages[curIdx + 1], status: "current" as ExecutionStageStatus };
            }

            // Recalculate progress
            const completedCount = stages.filter((s) => s.status === "completed").length;
            const progress = Math.round((completedCount / stages.length) * 100);

            return { ...prev, stages, progress };
        });
        setFocusedStageId(null);
    }, []);

    const handleExecute = useCallback(() => {
        // Simulate execution — in production this would trigger a real command
        advanceStage();
    }, [advanceStage]);

    const handleSkip = useCallback(() => {
        advanceStage();
    }, [advanceStage]);

    const handleStageFocus = useCallback(
        (id: string) => {
            // Toggle focus — if already focused, unfocus to return to natural current stage
            setFocusedStageId((prev) => (prev === id ? null : id));
        },
        []
    );

    return (
        <div
            className="min-h-screen w-full text-white relative"
            style={{
                background:
                    "radial-gradient(ellipse 80% 60% at 50% 0%, #0c1929 0%, #080d19 40%, #060a14 100%)",
            }}
        >
            {/* Subtle top glow */}
            <div
                className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] pointer-events-none"
                style={{
                    background: "radial-gradient(ellipse, rgba(59,130,246,0.05) 0%, transparent 70%)",
                }}
            />

            <div className="relative z-10 max-w-2xl mx-auto px-6 py-12 md:py-16">
                {/* Top bar */}
                <div className="flex items-center justify-between mb-12">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="3" y="3" width="18" height="18" rx="2" />
                                <path d="M7 7h.01M7 12h.01M7 17h.01M11 7h6M11 12h6M11 17h6" />
                            </svg>
                        </div>
                        <span className="text-sm font-semibold text-white/80 tracking-wide">Orca</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-white/[0.06] bg-white/[0.02] text-[11px] tracking-wider uppercase text-white/30 hover:text-white/50 transition-colors">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                            Live Tracker
                        </button>
                        <button className="w-8 h-8 rounded-lg border border-white/[0.06] bg-white/[0.02] flex items-center justify-center text-white/25 hover:text-white/50 transition-colors">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="12" cy="12" r="3" />
                                <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Header */}
                <WorkflowHeader
                    name={execution.name}
                    id={execution.id}
                    progress={execution.progress}
                />

                {/* Timeline */}
                <WorkflowTimeline
                    stages={execution.stages}
                    focusedStageId={focusedStageId}
                    onStageFocus={handleStageFocus}
                    onExecute={handleExecute}
                    onSkip={handleSkip}
                />

                {/* Footer */}
                <div className="mt-12 pt-8 border-t border-white/[0.04] flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-400/60" />
                        <span className="text-[11px] font-mono text-white/20 tracking-wider">
                            {execution.id.toUpperCase()}
                        </span>
                    </div>
                    <button
                        className="px-5 py-2 text-[11px] tracking-[0.1em] uppercase font-medium rounded-lg border border-white/[0.06] bg-white/[0.02] text-white/30 hover:text-white/50 hover:bg-white/[0.04] transition-all duration-200 cursor-pointer"
                    >
                        Cancel Pipeline
                    </button>
                </div>
            </div>
        </div>
    );
}
