"use client";

import { useState } from "react";
import {
    ChevronDown,
    BookOpen,
    HardDrive,
    CalendarDays,
    Settings,
} from "lucide-react";
import { NotionTree } from "./notion-tree";
import { LocalFilesSection } from "./local-files-section";

function SectionHeader({
    icon: Icon,
    title,
    expanded,
    onToggle,
}: {
    icon: React.ElementType;
    title: string;
    expanded: boolean;
    onToggle: () => void;
}) {
    return (
        <button
            onClick={onToggle}
            className="w-full flex items-center justify-between px-3 py-2 text-[10px] font-semibold tracking-widest text-zinc-500 uppercase hover:text-zinc-300 transition-colors"
        >
            <div className="flex items-center gap-2">
                <Icon className="w-3.5 h-3.5" />
                <span>{title}</span>
            </div>
            <ChevronDown
                className={`w-3.5 h-3.5 transition-transform duration-200 ${expanded ? "" : "-rotate-90"
                    }`}
            />
        </button>
    );
}

export function Sidebar() {
    const [notionOpen, setNotionOpen] = useState(true);
    const [filesOpen, setFilesOpen] = useState(true);
    const [calendarOpen, setCalendarOpen] = useState(true);

    return (
        <div className="w-64 h-full bg-[#13151c] border-r border-white/5 flex flex-col justify-between text-sm">
            <div className="flex-1 overflow-y-auto overflow-x-hidden p-3 space-y-2">
                {/* Workspace Header */}
                <div className="flex items-center gap-3 px-2 mb-4 cursor-pointer hover:bg-white/5 p-2 rounded-lg transition-colors">
                    <div className="w-8 h-8 rounded-md bg-blue-600 flex items-center justify-center text-white font-semibold text-sm">
                        O
                    </div>
                    <div className="flex-1 overflow-hidden">
                        <div className="text-white font-medium flex items-center justify-between">
                            <span className="truncate">ORCA Study</span>
                            <ChevronDown className="w-4 h-4 text-zinc-400" />
                        </div>
                        <div className="text-[10px] text-zinc-500 font-semibold tracking-widest">
                            WORKSPACE
                        </div>
                    </div>
                </div>

                {/* ── Notion Section ──────────────────────── */}
                <div>
                    <SectionHeader
                        icon={BookOpen}
                        title="Notion"
                        expanded={notionOpen}
                        onToggle={() => setNotionOpen(!notionOpen)}
                    />
                    <div className={`mt-1 ${notionOpen ? "" : "hidden"}`}>
                        <NotionTree />
                    </div>
                </div>

                {/* ── Local Files Section ─────────────────── */}
                <div>
                    <SectionHeader
                        icon={HardDrive}
                        title="Local Files"
                        expanded={filesOpen}
                        onToggle={() => setFilesOpen(!filesOpen)}
                    />
                    <div className={`mt-1 ${filesOpen ? "" : "hidden"}`}>
                        <LocalFilesSection />
                    </div>
                </div>

                {/* ── Calendar Section ────────────────────── */}
                <div>
                    <SectionHeader
                        icon={CalendarDays}
                        title="Calendar"
                        expanded={calendarOpen}
                        onToggle={() => setCalendarOpen(!calendarOpen)}
                    />
                    <div className={`mt-1 ${calendarOpen ? "px-3 space-y-2" : "hidden"}`}>
                        <div className="flex items-center gap-2 py-1.5 text-sm text-zinc-400">
                            <span className="w-2 h-2 rounded-full bg-red-400/80 shrink-0" />
                            <span className="truncate">OS Midterm — Mar 5</span>
                        </div>
                        <div className="flex items-center gap-2 py-1.5 text-sm text-zinc-400">
                            <span className="w-2 h-2 rounded-full bg-amber-400/80 shrink-0" />
                            <span className="truncate">DBMS Final — Mar 18</span>
                        </div>
                        <div className="flex items-center gap-2 py-1.5 text-sm text-zinc-400">
                            <span className="w-2 h-2 rounded-full bg-blue-400/80 shrink-0" />
                            <span className="truncate">CN Lab Exam — Mar 22</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-white/5">
                <button className="w-full flex items-center gap-3 px-3 py-2 text-zinc-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors">
                    <Settings className="w-4 h-4" />
                    <span>Settings</span>
                </button>
            </div>
        </div>
    );
}
