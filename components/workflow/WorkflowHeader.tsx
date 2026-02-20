"use client";

// components/workflow/WorkflowHeader.tsx
// Top section: pipeline badge, workflow ID, name, and progress percentage.

import { WorkflowProgressBar } from "./WorkflowProgressBar";

interface WorkflowHeaderProps {
    name: string;
    id: string;
    progress: number;
}

export function WorkflowHeader({ name, id, progress }: WorkflowHeaderProps) {
    return (
        <header className="mb-10 wf-fade-in">
            {/* Badges */}
            <div className="flex items-center gap-3 mb-3">
                <span className="px-2.5 py-1 text-[10px] font-semibold tracking-[0.15em] uppercase bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 rounded">
                    Active Pipeline
                </span>
                <span className="text-[11px] tracking-wider text-white/30 font-mono">
                    ID: {id}
                </span>
            </div>

            {/* Name + Progress */}
            <div className="flex items-end justify-between gap-8">
                <h1
                    className="text-3xl md:text-4xl text-white/95 italic leading-tight"
                    style={{ fontFamily: "var(--font-serif), Georgia, serif" }}
                >
                    {name}
                </h1>

                <div className="flex flex-col items-end shrink-0">
                    <span className="text-[10px] tracking-[0.15em] uppercase text-white/30 font-medium mb-1">
                        Overall Progress
                    </span>
                    <div className="flex items-baseline">
                        <span className="text-4xl md:text-5xl font-light text-white/90 tabular-nums leading-none">
                            {progress}
                        </span>
                        <span className="text-sm text-white/40 ml-0.5 font-medium">%</span>
                    </div>
                </div>
            </div>

            {/* Progress bar */}
            <WorkflowProgressBar progress={progress} />
        </header>
    );
}
