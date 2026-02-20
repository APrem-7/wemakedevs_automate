'use client';

import { useState } from 'react';
import { CheckCircle2, Copy, ExternalLink, CheckCircle, Clock, Layers } from 'lucide-react';
import { useStore } from '@/lib/orca-store';

export function CompletionPanel() {
    const { workflowIntent, workflowStartTime, resultLink, resetToPrompt, addToast } = useStore();
    const [copied, setCopied] = useState(false);

    if (!workflowIntent) return null;

    const elapsedMinutes = workflowStartTime
        ? Math.max(1, Math.floor((Date.now() - workflowStartTime) / 60000))
        : 0;

    const displayLink = resultLink || 'https://notebooklm.google.com/notebook/abc123xyz';

    const handleCopy = () => {
        navigator.clipboard.writeText(displayLink);
        setCopied(true);
        addToast('Link copied!', 'success');
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="min-h-screen flex items-center justify-center px-4 orca-scale-in">
            <div className="w-full max-w-[720px] space-y-8">

                {/* Checkmark */}
                <div className="flex flex-col items-center gap-5">
                    <div className="relative">
                        <div className="w-20 h-20 rounded-full bg-[#30D158]/8 flex items-center justify-center">
                            <div className="w-14 h-14 rounded-full bg-[#30D158]/12 flex items-center justify-center">
                                <CheckCircle2 className="w-8 h-8 text-[#30D158]" />
                            </div>
                        </div>
                        <div className="absolute inset-0 rounded-full bg-[#30D158]/8 blur-2xl -z-10 scale-150" />
                    </div>
                    <div className="text-center space-y-1.5">
                        <h2 className="text-3xl font-semibold text-[#F5F5F7] tracking-tight">Workflow Complete!</h2>
                        <p className="text-sm text-[#86868B]">{workflowIntent.title} finished successfully</p>
                    </div>
                </div>

                {/* Result card */}
                <div className="bg-[#1A1A1A] rounded-2xl border border-white/6 p-6 space-y-5">
                    <div>
                        <p className="text-[11px] text-[#86868B] uppercase tracking-widest mb-3">Output Link</p>
                        <div className="flex items-center gap-2 bg-[#0D0D0D] rounded-xl px-4 py-3 border border-white/6">
                            <a
                                href={displayLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex-1 text-sm text-[#2997FF] hover:text-[#6366F1] transition-colors truncate font-mono"
                            >
                                {displayLink}
                            </a>
                            <div className="flex items-center gap-1 flex-shrink-0">
                                <button
                                    onClick={handleCopy}
                                    className="p-1.5 rounded-lg hover:bg-white/8 transition-colors"
                                    title="Copy link"
                                >
                                    {copied
                                        ? <CheckCircle className="w-4 h-4 text-[#30D158]" />
                                        : <Copy className="w-4 h-4 text-[#86868B]" />
                                    }
                                </button>
                                <a
                                    href={displayLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-1.5 rounded-lg hover:bg-white/8 transition-colors"
                                >
                                    <ExternalLink className="w-4 h-4 text-[#86868B]" />
                                </a>
                            </div>
                        </div>
                    </div>

                    <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm text-[#86868B]">
                            <Layers className="w-4 h-4" />
                            <span>{workflowIntent.steps.length} steps completed</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-[#86868B]">
                            <Clock className="w-4 h-4" />
                            <span>{elapsedMinutes} min{elapsedMinutes !== 1 ? 's' : ''}</span>
                        </div>
                    </div>
                </div>

                {/* Reset */}
                <div className="flex justify-center">
                    <button
                        onClick={resetToPrompt}
                        className="bg-gradient-to-r from-[#2997FF] to-[#6366F1] text-white font-medium rounded-xl px-8 py-3 hover:opacity-90 transition-opacity text-sm"
                    >
                        Start Another Flow
                    </button>
                </div>
            </div>
        </div>
    );
}
