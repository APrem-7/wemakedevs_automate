"use client";

import { WorkflowPreviewHeader } from "./WorkflowPreviewHeader";
import { WorkflowMetaGrid } from "./WorkflowMetaGrid";
import { WorkflowSystemNote } from "./WorkflowSystemNote";

export interface WorkflowPreview {
    title: string;
    subtitle?: string;
    confidence: number;
    sourceMaterial: {
        name: string;
        type: "notion" | "local";
    };
    architecture: {
        stageCount: number;
        label: string;
    };
    estimatedDuration: string;
    systemNotes?: string;
}

interface WorkflowPreviewCardProps {
    data: WorkflowPreview;
    onExecute: () => void;
    onCancel: () => void;
}

export function WorkflowPreviewCard({
    data,
    onExecute,
    onCancel,
}: WorkflowPreviewCardProps) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#080b14]">
            {/* Radial gradient background */}
            <div
                className="absolute inset-0 opacity-60"
                style={{
                    background:
                        "radial-gradient(ellipse at 50% 30%, rgba(30, 58, 138, 0.25) 0%, rgba(8, 11, 20, 0) 70%)",
                }}
            />

            {/* Card */}
            <div className="relative w-full max-w-[580px] mx-4 orca-scale-in">
                <div className="rounded-2xl border border-white/[0.06] bg-[#0d1017]/90 backdrop-blur-xl shadow-2xl shadow-black/40">
                    <div className="px-10 pt-10 pb-8 space-y-8">
                        {/* Header: icon + title + status */}
                        <WorkflowPreviewHeader
                            title={data.title}
                            subtitle={data.subtitle}
                            confidence={data.confidence}
                        />

                        {/* Divider */}
                        <div className="h-px bg-white/[0.06]" />

                        {/* Meta grid */}
                        <WorkflowMetaGrid
                            sourceMaterial={data.sourceMaterial}
                            architecture={data.architecture}
                            estimatedDuration={data.estimatedDuration}
                        />

                        {/* System note (conditional) */}
                        {data.systemNotes && (
                            <WorkflowSystemNote note={data.systemNotes} />
                        )}
                    </div>

                    {/* Bottom buttons */}
                    <div className="px-10 pb-8 flex items-center gap-3">
                        <button
                            onClick={onCancel}
                            className="flex-1 py-3 rounded-xl text-sm font-medium text-zinc-400 border border-white/[0.06] bg-transparent hover:bg-white/[0.03] hover:text-zinc-300 transition-all duration-200 cursor-pointer"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={onExecute}
                            className="flex-1 py-3 rounded-xl text-sm font-semibold text-white bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-600/20 transition-all duration-200 cursor-pointer"
                        >
                            Execute Workflow
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
