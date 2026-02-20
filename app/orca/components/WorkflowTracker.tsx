'use client';

import { useState } from 'react';
import { Check, Copy, CheckCircle2 } from 'lucide-react';
import { useStore, WorkflowStep } from '@/lib/orca-store';

function StepCard({ step, isLast }: { step: WorkflowStep; isLast: boolean }) {
    const { markStepComplete, submitLink, addToast } = useStore();
    const [linkInput, setLinkInput] = useState('');
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        if (step.instruction) {
            navigator.clipboard.writeText(step.instruction);
            setCopied(true);
            addToast('Instruction copied', 'success');
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const handleMarkDone = () => {
        markStepComplete();
        addToast('Step completed ✓', 'success');
    };

    const handleSubmitLink = () => {
        if (linkInput.trim()) {
            submitLink(linkInput);
            addToast('Link submitted', 'success');
        }
    };

    /* ── COMPLETED ── */
    if (step.status === 'completed') {
        return (
            <div className="bg-[#111111] border border-white/5 rounded-xl p-4 opacity-60 transition-all duration-300">
                <div className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-[#30D158]/15 flex items-center justify-center flex-shrink-0">
                        <Check className="w-3 h-3 text-[#30D158]" />
                    </div>
                    <span className="text-sm text-[#86868B] line-through flex-1">{step.title}</span>
                    <span className="text-[11px] text-[#48484A]">Done</span>
                </div>
            </div>
        );
    }

    /* ── ACTIVE ── */
    if (step.status === 'active') {
        return (
            <div className="bg-[#1A1A1A] border border-[#2997FF]/25 rounded-xl p-5 shadow-lg transition-all duration-300" style={{ boxShadow: '0 0 24px rgba(41,151,255,0.06)' }}>
                {/* Step header */}
                <div className="flex items-start gap-3 mb-5">
                    <div className="w-5 h-5 rounded-full border-2 border-[#2997FF] flex items-center justify-center flex-shrink-0 mt-0.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#2997FF] animate-pulse" />
                    </div>
                    <div className="flex-1">
                        <div className="flex items-center justify-between gap-2">
                            <h4 className="text-sm font-semibold text-[#F5F5F7]">{step.title}</h4>
                            <span className="text-[10px] tracking-widest text-[#2997FF] bg-[#2997FF]/10 rounded-full px-2.5 py-0.5 font-medium flex-shrink-0">
                                ACTIVE
                            </span>
                        </div>
                    </div>
                </div>

                {/* Content */}
                {step.requiresLink || isLast ? (
                    <div className="ml-8 space-y-4">
                        <div>
                            <label className="text-[11px] text-[#86868B] uppercase tracking-widest block mb-2">
                                Paste your share link
                            </label>
                            <input
                                type="text"
                                value={linkInput}
                                onChange={(e) => setLinkInput(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSubmitLink()}
                                placeholder={step.linkPlaceholder ?? 'https://...'}
                                className="w-full bg-[#0D0D0D] border border-white/10 rounded-lg px-4 py-3 text-sm text-[#F5F5F7] placeholder:text-[#3A3A3A] focus:outline-none focus:ring-2 focus:ring-[#2997FF]/50 focus:border-[#2997FF]/30 transition-all"
                            />
                        </div>
                        <button
                            onClick={handleSubmitLink}
                            disabled={!linkInput.trim()}
                            className="text-sm font-medium bg-gradient-to-r from-[#2997FF] to-[#6366F1] text-white rounded-lg px-5 py-2.5 hover:opacity-90 transition-opacity disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                            Submit Link
                        </button>
                    </div>
                ) : (
                    <div className="ml-8 space-y-4">
                        {/* Instruction block */}
                        <div className="bg-[#0D0D0D] rounded-xl p-4 border border-white/6">
                            <p className="text-[11px] text-[#48484A] uppercase tracking-widest mb-2 font-medium">
                                Instruction
                            </p>
                            <p className="text-sm text-[#C7C7CC] font-mono leading-relaxed">
                                {step.instruction}
                            </p>
                        </div>

                        {/* Buttons */}
                        <div className="flex flex-wrap items-center gap-3">
                            <button
                                onClick={handleCopy}
                                className="flex items-center gap-2 text-sm text-[#86868B] hover:text-[#F5F5F7] bg-white/5 hover:bg-white/10 border border-white/8 rounded-lg px-4 py-2 transition-all"
                            >
                                {copied ? (
                                    <><CheckCircle2 className="w-4 h-4 text-[#30D158]" /><span className="text-[#30D158]">Copied!</span></>
                                ) : (
                                    <><Copy className="w-4 h-4" />Copy Instruction</>
                                )}
                            </button>

                            <button
                                onClick={handleMarkDone}
                                className="flex items-center gap-2 text-sm font-medium bg-gradient-to-r from-[#2997FF] to-[#6366F1] text-white rounded-lg px-5 py-2 hover:opacity-90 transition-opacity"
                            >
                                <Check className="w-4 h-4" /> Mark as Done
                            </button>
                        </div>
                    </div>
                )}
            </div>
        );
    }

    /* ── PENDING ── */
    return (
        <div className="bg-[#111111] border border-white/4 rounded-xl p-4 opacity-40 transition-all duration-300">
            <div className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full border border-[#48484A] flex-shrink-0" />
                <span className="text-sm text-[#86868B]">{step.title}</span>
            </div>
        </div>
    );
}

export function WorkflowTracker() {
    const { workflowIntent, currentStepIndex, workflowStartTime, cancelWorkflow } = useStore();
    const [showCancelConfirm, setShowCancelConfirm] = useState(false);

    if (!workflowIntent) return null;

    const totalSteps = workflowIntent.steps.length;
    const completedCount = workflowIntent.steps.filter((s) => s.status === 'completed').length;
    const progress = (completedCount / totalSteps) * 100;
    const elapsedMinutes = workflowStartTime
        ? Math.floor((Date.now() - workflowStartTime) / 60000)
        : 0;

    return (
        <div className="min-h-screen pt-20 pb-20 px-4 orca-fade-up">
            <div className="w-full max-w-[720px] mx-auto space-y-6">

                {/* Header + progress bar */}
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-semibold text-[#F5F5F7]">{workflowIntent.title}</h2>
                        <span className="text-sm text-[#86868B]">{completedCount}/{totalSteps} steps</span>
                    </div>

                    <div className="relative h-1 bg-[#1A1A1A] rounded-full overflow-hidden">
                        <div
                            className="absolute inset-y-0 left-0 bg-gradient-to-r from-[#2997FF] to-[#6366F1] rounded-full transition-all duration-700 ease-out"
                            style={{ width: `${progress}%` }}
                        />
                    </div>

                    <div className="flex items-center justify-between text-xs text-[#48484A]">
                        <span>{Math.round(progress)}% complete</span>
                        {elapsedMinutes > 0 && <span>{elapsedMinutes} min elapsed</span>}
                    </div>
                </div>

                {/* Step cards */}
                <div className="space-y-3">
                    {workflowIntent.steps.map((step, i) => (
                        <StepCard key={step.id} step={step} isLast={i === totalSteps - 1} />
                    ))}
                </div>

                {/* Cancel */}
                <div className="pt-2">
                    {!showCancelConfirm ? (
                        <button
                            onClick={() => setShowCancelConfirm(true)}
                            className="text-sm text-[#48484A] hover:text-[#FF453A] transition-colors"
                        >
                            Cancel Workflow
                        </button>
                    ) : (
                        <div className="flex items-center gap-4 orca-fade-up">
                            <span className="text-sm text-[#86868B]">Are you sure? This resets all progress.</span>
                            <button
                                onClick={() => { cancelWorkflow(); setShowCancelConfirm(false); }}
                                className="text-sm font-medium text-[#FF453A] hover:text-[#FF453A]/70 transition-colors"
                            >
                                Yes, cancel
                            </button>
                            <button
                                onClick={() => setShowCancelConfirm(false)}
                                className="text-sm text-[#86868B] hover:text-[#F5F5F7] transition-colors"
                            >
                                Keep going
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
