"use client";

import { useState, type DragEvent } from "react";
import { FolderPlus, File, FolderOpen } from "lucide-react";

type LocalFile = {
    id: string;
    name: string;
    type: "file" | "folder";
};

export function LocalFilesSection() {
    const [files, setFiles] = useState<LocalFile[]>([
        { id: "local-1", name: "OS_notes.pdf", type: "file" },
        { id: "local-2", name: "DBMS_revision.md", type: "file" },
    ]);

    function handleDragStart(e: DragEvent, file: LocalFile) {
        e.dataTransfer.setData(
            "application/json",
            JSON.stringify({ id: file.id, title: file.name, source: "local" })
        );
        e.dataTransfer.effectAllowed = "copy";
    }

    return (
        <div className="space-y-1">
            {files.length === 0 ? (
                <p className="px-3 py-2 text-xs text-zinc-500">No files added yet</p>
            ) : (
                files.map((file) => (
                    <button
                        key={file.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, file)}
                        className="w-full flex items-center gap-2 px-3 py-1.5 text-zinc-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors text-sm cursor-grab active:cursor-grabbing"
                    >
                        {file.type === "folder" ? (
                            <FolderOpen className="w-3.5 h-3.5 text-amber-400/70 shrink-0" />
                        ) : (
                            <File className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                        )}
                        <span className="truncate text-left">{file.name}</span>
                    </button>
                ))
            )}
            <button className="w-full flex items-center gap-2 px-3 py-2 text-zinc-500 hover:text-zinc-300 hover:bg-white/5 rounded-lg transition-colors text-xs mt-1">
                <FolderPlus className="w-3.5 h-3.5" />
                <span>Add Folder</span>
            </button>
        </div>
    );
}
