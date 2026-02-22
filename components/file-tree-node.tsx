"use client";

import { useState, type DragEvent } from "react";
import {
    ChevronRight,
    FileText,
    FolderOpen,
    Image as ImageIcon,
    FileType,
    File,
} from "lucide-react";

export type FileNode = {
    id: string;
    title: string;
    type: "file" | "folder";
    mimeType?: string;
    children?: FileNode[];
};

function getFileIcon(node: FileNode) {
    if (node.type === "folder") {
        return <FolderOpen className="w-3.5 h-3.5 text-amber-400/70 shrink-0" />;
    }

    const mime = node.mimeType || "";
    const ext = node.title.split(".").pop()?.toLowerCase() || "";

    if (mime.startsWith("image/") || ["png", "jpg", "jpeg", "gif", "webp"].includes(ext)) {
        return <ImageIcon className="w-3.5 h-3.5 text-emerald-400/70 shrink-0" />;
    }
    if (mime === "application/pdf" || ext === "pdf") {
        return <FileType className="w-3.5 h-3.5 text-red-400/70 shrink-0" />;
    }
    if (["md", "txt"].includes(ext) || mime.startsWith("text/")) {
        return <FileText className="w-3.5 h-3.5 text-blue-400/70 shrink-0" />;
    }

    return <File className="w-3.5 h-3.5 text-zinc-500 shrink-0" />;
}

export function FileTreeNode({
    node,
    depth = 0,
}: {
    node: FileNode;
    depth?: number;
}) {
    const [expanded, setExpanded] = useState(false);
    const hasChildren = node.type === "folder" && node.children && node.children.length > 0;

    function handleDragStart(e: DragEvent) {
        e.dataTransfer.setData(
            "application/json",
            JSON.stringify({
                id: node.id,
                title: node.title,
                source: "local",
                fileType: node.type === "file" ? node.mimeType : "folder",
            }),
        );
        e.dataTransfer.effectAllowed = "copy";
    }

    return (
        <div>
            <button
                draggable
                onDragStart={handleDragStart}
                onClick={() => node.type === "folder" && setExpanded(!expanded)}
                className="w-full flex items-center gap-2 px-2 py-1.5 text-zinc-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors text-sm group cursor-grab active:cursor-grabbing"
                style={{ paddingLeft: `${depth * 16 + 8}px` }}
            >
                {node.type === "folder" ? (
                    <ChevronRight
                        className={`w-3.5 h-3.5 text-zinc-500 shrink-0 transition-transform duration-200 ${expanded ? "rotate-90" : ""
                            }`}
                    />
                ) : (
                    <span className="w-3.5 shrink-0" />
                )}
                {getFileIcon(node)}
                <span className="truncate text-left">{node.title}</span>
            </button>

            {expanded && hasChildren && (
                <div>
                    {node.children!.map((child) => (
                        <FileTreeNode key={child.id} node={child} depth={depth + 1} />
                    ))}
                </div>
            )}
        </div>
    );
}
