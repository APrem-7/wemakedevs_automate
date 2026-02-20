'use client';

import { useStore } from '@/lib/orca-store';

export function IntentPreview() {
    const { workflowIntent, startWorkflow, cancelWorkflow } = useStore();

    if (!workflowIntent) return null;

    return (
        <div className="min-h-screen flex items-center justify-center px-4 orca-fade-up">
            <div className="w-full max-w-[720px] space-y-6">
                {/* Heading */}
                <div className="text-center">
                    <h2 className="text-2xl font-semibold text-[#F5F5F7] tracking-tight">
                        I understood your request as:
                    </h2>
                </div>

                {/* Intent card */}
                <div className="bg-[#1A1A1A] rounded-2xl border border-white/6 p-6 space-y-6">
                    {/* Title row */}
                    <div className="flex items-center gap-3">
                        <span className="text-2xl">{workflowIntent.icon}</span>
                        <h3 className="text-xl font-semibold text-[#F5F5F7]">{workflowIntent.title}</h3>
                    </div>

                    {/* Details grid */}
                    <div className="space-y-3">
                        {[
                            { label: 'Source', value: workflowIntent.source },
                            { label: 'Process', value: workflowIntent.process },
                            { label: 'Output', value: workflowIntent.output },
                        ].map(({ label, value }) => (
                            <div key={label} className="grid grid-cols-[90px_1fr] gap-3 items-start">
                                <span className="text-sm text-[#86868B]">{label}:</span>
                                <span className="text-sm text-[#F5F5F7]">{value}</span>
                            </div>
                        ))}
                    </div>

                    {/* Footer */}
                    <div className="pt-4 border-t border-white/5 flex items-center gap-3">
                        <span className="text-xs text-[#48484A] bg-white/5 rounded-full px-3 py-1">
                            {workflowIntent.steps.length} steps
                        </span>
                        <span className="text-xs text-[#48484A] bg-white/5 rounded-full px-3 py-1">
                            {workflowIntent.estimatedTime}
                        </span>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-center gap-4">
                    <button
                        onClick={startWorkflow}
                        className="bg-gradient-to-r from-[#2997FF] to-[#6366F1] text-white font-medium rounded-xl px-7 py-3 hover:opacity-90 transition-opacity text-sm"
                    >
                        Start Flow
                    </button>
                    <button
                        onClick={cancelWorkflow}
                        className="text-[#86868B] hover:text-[#F5F5F7] transition-colors text-sm px-7 py-3"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
}
