"use client";

// components/workflow/WorkflowStageCard.tsx
// Expanded detail card for the current/focused stage.
// Includes terminal-style code block, execute button, and skip action.

import { ArrowRight } from "lucide-react";
import type { WorkflowStage } from "@/lib/types";

interface WorkflowStageCardProps {
    stage: WorkflowStage;
    onExecute: () => void;
    onSkip: () => void;
}

export function WorkflowStageCard({
    stage,
    onExecute,
    onSkip,
}: WorkflowStageCardProps) {
    return (
        <div
            className="wf-fade-in ml-4 mt-3 mb-4 rounded-xl border border-white/[0.06] relative overflow-hidden"
            style={{
                background:
                    "linear-gradient(135deg, rgba(15, 23, 42, 0.8) 0%, rgba(15, 23, 42, 0.5) 100%)",
                backdropFilter: "blur(24px)",
                boxShadow:
                    "0 0 40px rgba(59, 130, 246, 0.06), 0 8px 32px rgba(0, 0, 0, 0.4)",
            }}
        >
            {/* Top accent line */}
            <div className="absolute top-0 left-6 right-6 h-px bg-gradient-to-r from-transparent via-blue-500/30 to-transparent" />

            <div className="p-6 md:p-8">
                {/* Badge */}
                <div className="flex items-center gap-2 mb-4">
                    <span className="px-2 py-0.5 text-[10px] font-semibold tracking-[0.15em] uppercase text-blue-400 bg-blue-500/10 border border-blue-500/20 rounded">
                        Current Stage
                    </span>
                    <div className="flex-1 h-px bg-gradient-to-r from-blue-500/20 to-transparent" />
                </div>

                {/* Title */}
                <h2
                    className="text-xl md:text-2xl text-white/90 italic mb-3"
                    style={{ fontFamily: "var(--font-serif), Georgia, serif" }}
                >
                    {stage.title}
                </h2>

                {/* Description */}
                {stage.description && (
                    <p className="text-sm text-white/40 leading-relaxed mb-6 max-w-xl">
                        {stage.description}
                    </p>
                )}

                {/* Terminal code block */}
                {stage.command && (
                    <div className="rounded-lg overflow-hidden mb-6 border border-white/[0.04]">
                        {/* Terminal header */}
                        <div className="flex items-center justify-between px-4 py-2.5 bg-[#0a0f1a]">
                            <div className="flex items-center gap-1.5">
                                <span className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]" />
                                <span className="w-2.5 h-2.5 rounded-full bg-[#febc2e]" />
                                <span className="w-2.5 h-2.5 rounded-full bg-[#28c840]" />
                            </div>
                            <span className="text-[10px] tracking-[0.12em] uppercase text-white/20 font-medium">
                                Bash
                            </span>
                        </div>
                        {/* Terminal body */}
                        <div className="px-5 py-4 bg-[#0b1120]">
                            <pre className="text-sm leading-relaxed text-white/70 whitespace-pre-wrap">
                                <code style={{ fontFamily: "ui-monospace, SFMono-Regular, 'SF Mono', Menlo, monospace" }}>
                                    {stage.command.split("\n").map((line, i) => {
                                        // Highlight quoted strings
                                        const parts = line.split(/(\"[^\"]*\")/g);
                                        return (
                                            <span key={i}>
                                                {parts.map((part, j) =>
                                                    part.startsWith('"') ? (
                                                        <span key={j} className="text-emerald-400/80">
                                                            {part}
                                                        </span>
                                                    ) : (
                                                        <span key={j}>{part}</span>
                                                    )
                                                )}
                                                {i < stage.command!.split("\n").length - 1 && "\n"}
                                            </span>
                                        );
                                    })}
                                </code>
                            </pre>
                        </div>
                    </div>
                )}

                {/* Actions */}
                <div className="flex items-center justify-between pt-2">
                    <button
                        onClick={onSkip}
                        className="group flex items-center gap-1.5 text-[11px] tracking-[0.12em] uppercase text-white/25 hover:text-white/50 transition-colors duration-200 cursor-pointer"
                    >
                        Skip Stage
                        <ArrowRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
                    </button>
                    <button
                        onClick={onExecute}
                        className="px-6 py-2.5 text-[11px] tracking-[0.12em] uppercase font-semibold rounded-lg cursor-pointer transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                        style={{
                            background: "linear-gradient(135deg, #3b82f6, #2563eb)",
                            boxShadow: "0 0 20px rgba(59, 130, 246, 0.3), 0 4px 12px rgba(0, 0, 0, 0.3)",
                            color: "white",
                        }}
                    >
                        Execute Command
                    </button>
                </div>
            </div>
        </div>
    );
}
