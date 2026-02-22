"use client";

import { useState, useEffect, useCallback } from "react";
import { Loader2, AlertCircle } from "lucide-react";
import { FileTreeNode, type FileNode } from "./file-tree-node";

export function LocalFilesSection() {
    const [nodes, setNodes] = useState<FileNode[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchTree = useCallback(async () => {
        try {
            const res = await fetch("/api/files/tree");
            if (!res.ok) throw new Error("Failed to load");
            const data = await res.json();
            setNodes(data.tree || []);
            setError(null);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to load files");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchTree();
    }, [fetchTree]);

    if (loading) {
        return (
            <div className="flex items-center gap-2 px-3 py-4 text-xs text-zinc-500">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Scanning files…</span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center gap-2 px-3 py-3 text-xs text-amber-400/70">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">{error}</span>
            </div>
        );
    }

    if (nodes.length === 0) {
        return (
            <div className="px-3 py-3 text-xs text-zinc-500">
                No files found
            </div>
        );
    }

    return (
        <div className="space-y-0.5">
            {nodes.map((node) => (
                <FileTreeNode key={node.id} node={node} />
            ))}
        </div>
    );
}
