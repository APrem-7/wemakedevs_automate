import { Sparkles } from "lucide-react";

export function HeroSection() {
    return (
        <div className="text-center pt-24 pb-6 orca-fade-up">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 mb-6">
                <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                <span className="text-xs text-blue-300 font-medium tracking-wide">
                    ORCA • Intelligent Study System
                </span>
            </div>
            <h1 className="text-3xl md:text-5xl font-semibold mb-3 tracking-tight bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">
                Train smarter. Retain longer.
            </h1>
            <p className="text-zinc-500 text-sm max-w-lg mx-auto leading-relaxed">
                Drop in notes from Notion or your local files and turn them into
                flashcards, quizzes, and structured revision — instantly.
            </p>
        </div>
    );
}
