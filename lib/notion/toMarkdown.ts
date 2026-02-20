import { NotionToMarkdown } from "notion-to-md";
import { Client } from "@notionhq/client";

// Initialize Notion client and notion-to-md converter
const notion = new Client({ auth: process.env.NOTION_TOKEN });
const n2m = new NotionToMarkdown({ notionClient: notion });

/**
 * Convert a Notion page (or blocks) to a markdown string.
 * @param blocks The block tree fetched from Notion.
 * @returns Markdown string representation of the Notion page.
 */
export async function convertToMarkdown(blocks: any[]): Promise<string> {
  const mdBlocks = await n2m.blocksToMarkdown(blocks);
  const mdObject = n2m.toMarkdownString(mdBlocks);
  return mdObject.parent; // Extract the parent markdown string from the object
}
