import { Client } from "@notionhq/client";

// Initialize Notion client
const notion = new Client({ auth: process.env.NOTION_TOKEN });

type NotionNode = {
  id: string;
  title: string;
  icon?: string;
  iconType?: "emoji" | "external";
  children?: NotionNode[];
};

/**
 * Search for pages in a Notion workspace matching a query.
 * @param query The search query (e.g., topic name).
 * @returns Array of matching pages with id, title, lastEdited.
 */
export async function getPageTree(query: string): Promise<NotionNode[]> {
  try {
    async function fetchChildren(blockId: string): Promise<NotionNode[]> {
      const response = await notion.blocks.children.list({
        block_id: blockId,
        page_size: 100,
      });

      const childPages = response.results.filter(
        (block: any) => block.type === "child_page",
      );

      // Explicit base case: no child pages
      if (childPages.length === 0) {
        return [];
      }

      return Promise.all(
        childPages.map(async (block: any) => {
          // Fetch full page object to get icon
          const page = (await notion.pages.retrieve({
            page_id: block.id,
          })) as any;

          let icon: string | undefined;
          let iconType: "emoji" | "external" | undefined;

          if (page.icon) {
            if (page.icon.type === "emoji") {
              icon = page.icon.emoji;
              iconType = "emoji";
            } else if (page.icon.type === "external") {
              icon = page.icon.external.url;
              iconType = "external";
            }
          }

          return {
            id: page.id,
            title: page.properties?.title?.title?.[0]?.plain_text || "",
            icon,
            iconType,
            children: await fetchChildren(page.id),
          };
        }),
      );
    }

    return await fetchChildren(query);
  } catch (error) {
    console.error("Error fetching page tree:", error);
    throw new Error(
      `Failed to fetch page tree: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }
}
