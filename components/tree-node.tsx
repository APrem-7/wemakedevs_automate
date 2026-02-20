"use client";

import { useState, type DragEvent } from "react";
import { ChevronRight, FileText } from "lucide-react";

type NotionNode = {
    id: string;
    title: string;
    icon?: string;
    iconType?: "emoji" | "external";
    children?: NotionNode[];
};

export function TreeNode({ node, depth = 0 }: { node: NotionNode; depth?: number }) {
    const [expanded, setExpanded] = useState(false);
    const hasChildren = node.children && node.children.length > 0;

    function handleDragStart(e: DragEvent) {
        e.dataTransfer.setData(
            "application/json",
            JSON.stringify({ id: node.id, title: node.title, source: "notion", icon: node.icon, iconType: node.iconType })
        );
        e.dataTransfer.effectAllowed = "copy";
    }

    function renderIcon() {
        if (node.icon && node.iconType === "emoji") {
            return <span className="text-sm leading-none shrink-0">{node.icon}</span>;
        }
        if (node.icon && node.iconType === "external") {
            return (
                <img
                    src={node.icon}
                    alt=""
                    className="w-4 h-4 rounded-sm shrink-0"
                />
            );
        }
        return <FileText className="w-3.5 h-3.5 text-zinc-500 shrink-0" />;
    }

    return (
        <div>
            <button
                draggable
                onDragStart={handleDragStart}
                onClick={() => hasChildren && setExpanded(!expanded)}
                className="w-full flex items-center gap-2 px-2 py-1.5 text-zinc-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors text-sm group cursor-grab active:cursor-grabbing"
                style={{ paddingLeft: `${depth * 16 + 8}px` }}
            >
                {hasChildren ? (
                    <ChevronRight
                        className={`w-3.5 h-3.5 text-zinc-500 shrink-0 transition-transform duration-200 ${expanded ? "rotate-90" : ""
                            }`}
                    />
                ) : (
                    <span className="w-3.5 shrink-0" />
                )}
                {renderIcon()}
                <span className="truncate text-left">{node.title || "Untitled"}</span>
            </button>

            {expanded && hasChildren && (
                <div>
                    {node.children!.map((child) => (
                        <TreeNode key={child.id} node={child} depth={depth + 1} />
                    ))}
                </div>
            )}
        </div>
    );
}
