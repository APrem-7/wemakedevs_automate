import { NextRequest, NextResponse } from 'next/server';
import { searchPages } from '../../../../lib/notion/client';

export async function GET(req: NextRequest) {
  

  const { searchParams } = new URL(req.url);
  const query = searchParams.get("q");

  if (!query || typeof query !== 'string') {
    return NextResponse.json({ error: "Query parameter 'q' is required." }, { status: 400 });
  }

  try {
    const pages = await searchPages(query);
    return NextResponse.json({ pages });
  } catch (error) {
    console.error('Notion API error:', error);
    return NextResponse.json({ error: "Failed to search pages." }, { status: 500 });
  }
}