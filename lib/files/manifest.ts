import { promises as fs } from "fs";
import path from "path";
import crypto from "crypto";

// ── Types ──────────────────────────────────────────────────────────

export type FileNode = {
    id: string;
    title: string;
    type: "file" | "folder";
    /** Relative path from LOCAL_FILES_DIR root */
    relativePath: string;
    children?: FileNode[];
};

// ── Supported extensions ───────────────────────────────────────────

const SUPPORTED_EXTENSIONS = new Set([
    ".pdf",
    ".md",
    ".txt",
    ".docx",
    ".png",
    ".jpg",
    ".jpeg",
    ".gif",
    ".webp",
]);

const IGNORED_NAMES = new Set([".DS_Store", "Thumbs.db", ".git", "node_modules"]);

// ── Deterministic ID from path ─────────────────────────────────────

function pathToId(relativePath: string): string {
    const hash = crypto.createHash("md5").update(relativePath).digest("hex").slice(0, 8);
    return `local-${hash}`;
}

// ── Recursive scanner ──────────────────────────────────────────────

export async function scanDirectory(
    dirPath: string,
    rootPath: string,
): Promise<FileNode[]> {
    const entries = await fs.readdir(dirPath, { withFileTypes: true });
    const nodes: FileNode[] = [];

    // Sort: folders first, then files, both alphabetically
    const sorted = entries
        .filter((e) => !IGNORED_NAMES.has(e.name) && !e.name.startsWith("."))
        .sort((a, b) => {
            if (a.isDirectory() && !b.isDirectory()) return -1;
            if (!a.isDirectory() && b.isDirectory()) return 1;
            return a.name.localeCompare(b.name);
        });

    for (const entry of sorted) {
        const fullPath = path.join(dirPath, entry.name);
        const relativePath = path.relative(rootPath, fullPath);

        if (entry.isDirectory()) {
            const children = await scanDirectory(fullPath, rootPath);
            nodes.push({
                id: pathToId(relativePath),
                title: entry.name,
                type: "folder",
                relativePath,
                children,
            });
        } else {
            const ext = path.extname(entry.name).toLowerCase();
            if (SUPPORTED_EXTENSIONS.has(ext)) {
                nodes.push({
                    id: pathToId(relativePath),
                    title: entry.name,
                    type: "file",
                    relativePath,
                });
            }
        }
    }

    return nodes;
}
