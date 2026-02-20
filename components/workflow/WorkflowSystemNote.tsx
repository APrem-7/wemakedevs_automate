"use client";

import { Info } from "lucide-react";

interface WorkflowSystemNoteProps {
    note: string;
}

export function WorkflowSystemNote({ note }: WorkflowSystemNoteProps) {
    return (
        <div className="flex items-start gap-3 px-4 py-3.5 rounded-xl border border-white/[0.06] bg-white/[0.02]">
            <Info className="w-4 h-4 text-blue-400/70 mt-0.5 shrink-0" />
            <p className="text-[13px] text-zinc-400 leading-relaxed">
                <span className="font-semibold text-zinc-300">System Note:</span>{" "}
                {note}
            </p>
        </div>
    );
}
