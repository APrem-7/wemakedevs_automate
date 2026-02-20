'use client';

import { useState, useRef, useEffect, KeyboardEvent } from 'react';
import { ArrowRight } from 'lucide-react';
import { useStore } from '@/lib/orca-store';

const suggestions = [
    'Make flashcards from my Notion notes',
    'Schedule revision for midterms',
    'Generate quiz from lecture slides',
];

export function PromptInput() {
    const { currentPrompt, setPrompt, submitPrompt } = useStore();
    const [localPrompt, setLocalPrompt] = useState(currentPrompt);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        setTimeout(() => inputRef.current?.focus(), 150);
    }, []);

    const handleSubmit = () => {
        if (localPrompt.trim()) {
            setPrompt(localPrompt);
            submitPrompt();
        }
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleSubmit();
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center px-4 orca-fade-up">
            <div className="w-full max-w-[720px] space-y-10">
                {/* Heading */}
                <div className="text-center space-y-2">
                    <h1 className="text-4xl font-semibold text-[#F5F5F7] tracking-tight">
                        What would you like to study?
                    </h1>
                    <p className="text-sm text-[#86868B]">
                        Describe your goal — ORCA will build a step-by-step workflow.
                    </p>
                </div>

                {/* Spotlight input */}
                <div className="relative">
                    <input
                        ref={inputRef}
                        type="text"
                        value={localPrompt}
                        onChange={(e) => setLocalPrompt(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Generate flashcards for my OS course..."
                        className="w-full bg-[#1A1A1A] border border-white/10 rounded-2xl px-5 py-4 pr-28 text-lg text-[#F5F5F7] placeholder:text-[#3A3A3A] focus:outline-none focus:ring-2 focus:ring-[#2997FF]/50 focus:border-[#2997FF]/30 transition-all duration-300"
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                        {localPrompt.trim() && (
                            <button
                                onClick={handleSubmit}
                                className="w-8 h-8 rounded-lg bg-gradient-to-r from-[#2997FF] to-[#6366F1] flex items-center justify-center hover:opacity-90 transition-opacity"
                            >
                                <ArrowRight className="w-4 h-4 text-white" />
                            </button>
                        )}
                        <span className="text-xs text-[#86868B] bg-white/5 border border-white/8 rounded-md px-2 py-1 font-mono">
                            ↵
                        </span>
                    </div>
                </div>

                {/* Suggestion pills */}
                <div className="flex flex-col items-center gap-3">
                    <p className="text-[11px] text-[#48484A] uppercase tracking-widest font-medium">Try</p>
                    <div className="flex flex-wrap justify-center gap-2">
                        {suggestions.map((s, i) => (
                            <button
                                key={i}
                                onClick={() => { setLocalPrompt(s); inputRef.current?.focus(); }}
                                className="text-sm text-[#86868B] hover:text-[#F5F5F7] transition-all duration-200 px-4 py-1.5 rounded-full border border-white/8 hover:border-white/20 hover:bg-white/5 cursor-pointer"
                            >
                                {s}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
