import { NextResponse } from "next/server";
import { scanDirectory } from "@/lib/files/manifest";

export async function GET() {
    const localDir = process.env.LOCAL_FILES_DIR;

    if (!localDir) {
        return NextResponse.json(
            { error: "LOCAL_FILES_DIR not configured in environment." },
            { status: 500 },
        );
    }

    try {
        const tree = await scanDirectory(localDir, localDir);
        return NextResponse.json({ tree });
    } catch (error) {
        console.error("File tree scan error:", error);
        return NextResponse.json(
            { error: "Failed to scan files directory" },
            { status: 500 },
        );
    }
}
