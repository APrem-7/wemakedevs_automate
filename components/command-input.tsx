"use client";

import { useState, type DragEvent } from "react";
import { Sparkles, Paperclip, ArrowUp, X, FileText } from "lucide-react";

export type ContextItem = {
    id: string;
    title: string;
    source: "notion" | "local";
    icon?: string;
    iconType?: "emoji" | "external";
};

export function CommandInput() {
    const [contextItems, setContextItems] = useState<ContextItem[]>([]);
    const [isDragOver, setIsDragOver] = useState(false);

    function handleDragOver(e: DragEvent) {
        e.preventDefault();
        e.dataTransfer.dropEffect = "copy";
        setIsDragOver(true);

    }

    function handleDragLeave(e: DragEvent) {
        // Only trigger if leaving the actual container (not moving between children)
        if (!e.currentTarget.contains(e.relatedTarget as Node)) {
            setIsDragOver(false);
        }
    }

    function handleDrop(e: DragEvent) {
        e.preventDefault();
        setIsDragOver(false);

        try {
            const data = JSON.parse(e.dataTransfer.getData("application/json"));
            if (data?.id && data?.title && data?.source) {
                setContextItems((prev) => {
                    // Prevent duplicates
                    if (prev.some((item) => item.id === data.id)) return prev;
                    return [...prev, { id: data.id, title: data.title, source: data.source, icon: data.icon, iconType: data.iconType }];
                });
            }
            console.log(data);
        } catch {
            // Ignore invalid drop data
        }
    }

    function removeItem(id: string) {
        setContextItems((prev) => prev.filter((item) => item.id !== id));
    }

    return (
        <div className="w-full max-w-2xl mx-auto mb-8 orca-fade-up" style={{ animationDelay: "0.1s" }}>
            <div
                className={`bg-[#1a1d27] rounded-2xl p-4 transition-all duration-300 ${isDragOver
                    ? "border-2 border-blue-500/60 shadow-[0_0_30px_rgba(59,130,246,0.2)]"
                    : "border border-white/10 shadow-[0_0_40px_rgba(59,130,246,0.06)]"
                    }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
            >
                {/* Context pills */}
                {contextItems.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-3 px-1">
                        {contextItems.map((item) => (
                            <span
                                key={item.id}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-500/10 border border-blue-500/20 text-xs text-blue-300 font-medium transition-colors hover:bg-blue-500/15"
                            >
                                <span className="shrink-0">
                                    {item.source === "local"
                                        ? "📁"
                                        : item.icon && item.iconType === "emoji"
                                            ? item.icon
                                            : item.icon && item.iconType === "external"
                                                ? <img src={item.icon} alt="" className="w-3.5 h-3.5 rounded-sm inline" />
                                                : <FileText className="w-3.5 h-3.5 text-zinc-400 inline" />}
                                </span>
                                <span className="max-w-[160px] truncate">{item.title}</span>
                                <button
                                    onClick={() => removeItem(item.id)}
                                    className="ml-0.5 p-0.5 rounded hover:bg-white/10 transition-colors text-blue-400 hover:text-white"
                                >
                                    <X className="w-3 h-3" />
                                </button>
                            </span>
                        ))}
                    </div>
                )}

                {/* Input row */}
                <div className="flex items-center gap-3 px-2">
                    <div className="w-6 h-6 rounded-full bg-blue-600/20 flex items-center justify-center shrink-0">
                        <Sparkles className="w-3.5 h-3.5 text-blue-400 animate-pulse" />
                    </div>
                    <input
                        type="text"
                        placeholder={isDragOver ? "Drop here to add context…" : "What would you like to study today?"}
                        className="w-full bg-transparent text-white placeholder:text-zinc-500 border-none outline-none text-sm"
                    />
                </div>

                {/* Toolbar */}
                <div className="flex items-center justify-between pt-3 border-t border-white/5 mt-3 px-1">
                    <div className="flex items-center gap-1">
                        <button className="p-1.5 text-zinc-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors">
                            <Paperclip className="w-4 h-4" />
                        </button>
                    </div>

                    <div className="flex items-center gap-3">
                        <span className="text-xs text-zinc-500 font-medium hidden sm:inline-block">
                            Press Enter to send
                        </span>
                        <button className="w-7 h-7 bg-blue-500 hover:bg-blue-600 rounded-lg flex items-center justify-center text-white transition-colors">
                            <ArrowUp className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Drop hint */}
            {isDragOver && (
                <div className="text-center mt-2 text-xs text-blue-400/70 animate-pulse">
                    Release to add as context
                </div>
            )}
        </div>
    );
}
