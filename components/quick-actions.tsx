import { Layers, ClipboardList, FileText, CalendarDays } from "lucide-react";

export function QuickActions() {
    const actions = [
        { icon: Layers, label: "Generate Flashcards", color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20 hover:bg-emerald-500/20" },
        { icon: ClipboardList, label: "Create Quiz", color: "text-violet-400", bg: "bg-violet-500/10 border-violet-500/20 hover:bg-violet-500/20" },
        { icon: FileText, label: "Summarize", color: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/20 hover:bg-blue-500/20" },
        { icon: CalendarDays, label: "Plan Revision", color: "text-amber-400", bg: "bg-amber-500/10 border-amber-500/20 hover:bg-amber-500/20" },
    ];

    return (
        <div className="flex flex-wrap items-center justify-center gap-3 mb-10 orca-fade-up" style={{ animationDelay: "0.15s" }}>
            {actions.map((action, i) => (
                <button
                    key={i}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border ${action.bg} transition-all duration-200 text-sm text-zinc-300 hover:text-white hover:scale-[1.03] active:scale-[0.98]`}
                >
                    <action.icon className={`w-4 h-4 ${action.color}`} />
                    <span className="font-medium">{action.label}</span>
                </button>
            ))}
        </div>
    );
}
