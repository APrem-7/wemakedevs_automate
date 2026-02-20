"use client";

// components/workflow/WorkflowTimeline.tsx
// Vertical pipeline with connected stage nodes and inline stage card expansion.

import { Check, X } from "lucide-react";
import type { WorkflowStage, ExecutionStageStatus } from "@/lib/types";
import { WorkflowStageCard } from "./WorkflowStageCard";

interface WorkflowTimelineProps {
    stages: WorkflowStage[];
    focusedStageId: string | null;
    onStageFocus: (id: string) => void;
    onExecute: () => void;
    onSkip: () => void;
}

function StageNode({ status }: { status: ExecutionStageStatus }) {
    const base =
        "w-5 h-5 rounded-full flex items-center justify-center shrink-0 transition-all duration-300 relative z-10";

    switch (status) {
        case "completed":
            return (
                <div className={`${base} bg-blue-500`}>
                    <Check className="w-3 h-3 text-white" strokeWidth={3} />
                </div>
            );
        case "current":
            return (
                <div className={`${base} wf-pulse-ring`}>
                    <div className="w-5 h-5 rounded-full border-2 border-blue-400 flex items-center justify-center">
                        <div className="w-2 h-2 rounded-full bg-blue-400" />
                    </div>
                </div>
            );
        case "failed":
            return (
                <div className={`${base} bg-red-500`}>
                    <X className="w-3 h-3 text-white" strokeWidth={3} />
                </div>
            );
        case "pending":
        default:
            return (
                <div className={`${base} border border-white/10 bg-white/[0.03]`}>
                    <div className="w-1.5 h-1.5 rounded-full bg-white/15" />
                </div>
            );
    }
}

function StageStatusLabel({ status }: { status: ExecutionStageStatus }) {
    if (status === "pending") {
        return (
            <span className="text-[10px] tracking-[0.1em] uppercase text-white/15 font-medium">
                Pending
            </span>
        );
    }
    return null;
}

export function WorkflowTimeline({
    stages,
    focusedStageId,
    onStageFocus,
    onExecute,
    onSkip,
}: WorkflowTimelineProps) {
    return (
        <div className="relative">
            {stages.map((stage, index) => {
                const isLast = index === stages.length - 1;
                const isFocused = stage.id === focusedStageId;
                const isCurrent = stage.status === "current";
                const showCard = isFocused || (isCurrent && !focusedStageId);

                return (
                    <div key={stage.id} className="relative">
                        {/* Connector line */}
                        {!isLast && (
                            <div
                                className="absolute left-[9px] top-5 w-[2px]"
                                style={{
                                    bottom: "-1px",
                                    background:
                                        stage.status === "completed"
                                            ? "linear-gradient(180deg, #3b82f6 0%, #3b82f680 100%)"
                                            : "linear-gradient(180deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.03) 100%)",
                                }}
                            />
                        )}

                        {/* Stage row */}
                        <button
                            onClick={() => onStageFocus(stage.id)}
                            className={`
                w-full flex items-center gap-4 py-4 px-1 rounded-lg transition-all duration-200 cursor-pointer
                hover:bg-white/[0.02] group text-left
                ${showCard ? "" : ""}
              `}
                        >
                            <StageNode status={stage.status} />

                            <span
                                className={`flex-1 text-sm transition-colors duration-200 ${stage.status === "completed"
                                        ? "text-white/60"
                                        : stage.status === "current"
                                            ? "text-white/90 font-medium"
                                            : "text-white/25"
                                    } group-hover:text-white/70`}
                            >
                                {stage.title}
                            </span>

                            {stage.duration && (
                                <span className="text-[11px] text-white/20 font-mono tabular-nums">
                                    {stage.duration}
                                </span>
                            )}

                            <StageStatusLabel status={stage.status} />
                        </button>

                        {/* Expanded stage card */}
                        {showCard && (
                            <div className="relative">
                                <WorkflowStageCard
                                    stage={stage}
                                    onExecute={onExecute}
                                    onSkip={onSkip}
                                />
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
}
