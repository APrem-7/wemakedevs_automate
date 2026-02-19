import { NextRequest, NextResponse } from "next/server";
import { searchPages, getPageBlocks } from "@/lib/notion/client";
import { convertToMarkdown } from "@/lib/notion/toMarkdown";
import { writeFile } from "fs/promises";
import path from "path";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { pageId, query } = body;

  if (!pageId && !query) {
    return NextResponse.json(
      { error: "Either 'pageId' or 'query' is required." },
      { status: 400 },
    );
  }

  try {
    let finalPageId = pageId;

    if (query) {
      const pages = await searchPages(query);
      if (pages.length === 0) {
        return NextResponse.json(
          { error: "No pages found for the query" },
          { status: 404 },
        );
      }
      finalPageId = pages[0].id; // Pick the first match
    }

    const blocks = await getPageBlocks(finalPageId);
    const markdown = await convertToMarkdown(blocks);
    const userHome =
      process.env.HOME ||
      process.env.USERPROFILE ||
      require("os").homedir() ||
      "/tmp";
    const downloadPath = path.join(
      userHome,
      "Downloads",
      `${finalPageId}-notes.md`,
    );

    await writeFile(downloadPath, markdown);

    return NextResponse.json({
      success: true,
      filePath: downloadPath,
      pageId: finalPageId,
    });
  } catch (error) {
    console.error("Notion Export Error:", error);
    return NextResponse.json(
      { error: "Failed to export Notion page" },
      { status: 500 },
    );
  }
}
