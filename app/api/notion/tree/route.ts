import { NextResponse } from "next/server";
import { getPageTree } from "@/lib/notion/client";

export async function GET() {
  const rootId = process.env.NOTION_ROOT_ID;

  if (!rootId) {
    return NextResponse.json(
      { error: "NOTION_ROOT_ID not configured in environment." },
      { status: 500 },
    );
  }

  try {
    const tree = await getPageTree(rootId);
    return NextResponse.json({ tree });
  } catch (error) {
    console.error("Tree fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch tree" },
      { status: 500 },
    );
  }
}
