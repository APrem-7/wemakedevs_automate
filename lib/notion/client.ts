import { Client } from "@notionhq/client";

// Initialize Notion client
const notion = new Client({ auth: process.env.NOTION_TOKEN });

/**
 * Search for pages in a Notion workspace matching a query.
 * @param query The search query (e.g., topic name).
 * @returns Array of matching pages with id, title, lastEdited.
 */
export async function searchPages(
  query: string,
): Promise<{ id: string; title: string; lastEdited: string }[]> {
  const response = await notion.search({
    query,
  });

  return response.results.map((page: any) => {
    // Handle different page structures - pages might have title in different properties
    let title = "Untitled";
    if (page.properties && page.properties.title) {
      title = page.properties.title.title[0]?.plain_text || "Untitled";
    } else if (page.title) {
      title = page.title[0]?.plain_text || "Untitled";
    }

    return {
      id: page.id,
      title,
      lastEdited: page.last_edited_time,
    };
  });
}

/**
 * Fetch all blocks for a given Notion page ID, recursively fetching children if needed.
 * @param pageId The Notion page ID.
 * @returns Array representing the full block tree.
 */
export async function getPageBlocks(pageId: string): Promise<any[]> {
  async function fetchBlocksRecursively(blockId: string): Promise<any[]> {
    const blocks = await notion.blocks.children.list({ block_id: blockId });

    const results = await Promise.all(
      blocks.results.map(async (block: any) => {
        if (block.has_children) {
          block.children = await fetchBlocksRecursively(block.id);
        }
        return block;
      }),
    );

    return results;
  }

  return fetchBlocksRecursively(pageId);
}
