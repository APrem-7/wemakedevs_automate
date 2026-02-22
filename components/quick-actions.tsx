"use client";

import { Layers, ClipboardList, FileText, CalendarDays } from "lucide-react";
import { useWorkflowStore } from "@/lib/workflow-store";

export function QuickActions() {
    const setPrompt = useWorkflowStore((s) => s.setPrompt);
    const submitPrompt = useWorkflowStore((s) => s.submitPrompt);
    const appState = useWorkflowStore((s) => s.appState);

    const isDisabled = appState === "loading";

    const actions = [
        { icon: Layers, label: "Generate Flashcards", prompt: "Generate flashcards", color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20 hover:bg-emerald-500/20" },
        { icon: ClipboardList, label: "Create Quiz", prompt: "Create a quiz", color: "text-violet-400", bg: "bg-violet-500/10 border-violet-500/20 hover:bg-violet-500/20" },
        { icon: FileText, label: "Summarize", prompt: "Summarize my notes", color: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/20 hover:bg-blue-500/20" },
        { icon: CalendarDays, label: "Plan Revision", prompt: "Plan a revision schedule", color: "text-amber-400", bg: "bg-amber-500/10 border-amber-500/20 hover:bg-amber-500/20" },
    ];

    function handleQuickAction(prompt: string) {
        if (isDisabled) return;
        setPrompt(prompt);
        // Small delay to ensure state update propagates before submit
        setTimeout(() => submitPrompt(), 0);
    }

    return (
        <div className="flex flex-wrap items-center justify-center gap-3 mb-10 orca-fade-up" style={{ animationDelay: "0.15s" }}>
            {actions.map((action, i) => (
                <button
                    key={i}
                    onClick={() => handleQuickAction(action.prompt)}
                    disabled={isDisabled}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border ${action.bg} transition-all duration-200 text-sm text-zinc-300 hover:text-white hover:scale-[1.03] active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed`}
                >
                    <action.icon className={`w-4 h-4 ${action.color}`} />
                    <span className="font-medium">{action.label}</span>
                </button>
            ))}
        </div>
    );
}

