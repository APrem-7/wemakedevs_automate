"use client";

import { useState, useEffect } from "react";
import { TreeNode } from "./tree-node";
import { Loader2, AlertCircle } from "lucide-react";

type NotionNode = {
    id: string;
    title: string;
    icon?: string;
    iconType?: "emoji" | "external";
    children?: NotionNode[];
};

export function NotionTree() {
    const [nodes, setNodes] = useState<NotionNode[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchTree() {
            try {
                const res = await fetch("/api/notion/tree");
                if (!res.ok) throw new Error("Failed to load");
                const data = await res.json();
                setNodes(data.tree || []);
            } catch (err) {
                setError(err instanceof Error ? err.message : "Failed to load Notion pages");
            } finally {
                setLoading(false);
            }
        }
        fetchTree();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center gap-2 px-3 py-4 text-xs text-zinc-500">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Loading Notion pages…</span>
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
                No pages found
            </div>
        );
    }

    return (
        <div className="space-y-0.5">
            {nodes.map((node) => (
                <TreeNode key={node.id} node={node} />
            ))}
        </div>
    );
}
