// lib/workflows/organize.ts
// Organize workflow — 6 source-conditional steps.
// Collects scattered notes from the user's source, uploads them to a single
// NotebookLM notebook, and generates a mind map to visualize the structure.
// No share link step — the value is in the organized notebook itself.

import { WorkflowTemplate } from "../types";

export const organizeTemplate: WorkflowTemplate = {
  type: "organize",
  title: "Organize Notes for {topic}",
  description:
    "Collect your scattered {topic} notes from {source}, upload to NotebookLM, and generate a mind map to visualize the structure.",
  estimatedTime: "10-15 min",
  steps: [
    // ── Step: Export from Notion (only when source is Notion) ──
    {
      id: 1,
      name: "Export notes from Notion",
      description:
        "AccomplishAI will export your {topic} notes from Notion as PDF files.",
      type: "accomplish",
      instruction:
        'Open notion.so in the browser. In the left sidebar, navigate to the workspace and find ALL pages and subpages related to "{topic}". ' +
        "This may include lecture notes, assignments, readings, and project pages spread across different sections. " +
        'For each relevant page, click the "..." (three-dot menu) in the top-right corner, select "Export", ' +
        'set Format to "PDF", enable "Include subpages" if available, and click "Export". ' +
        "Repeat for all relevant pages. All files will be saved to ~/Downloads.",
      status: "pending",
      sourceFilter: ["notion"],
    },

    // ── Step: Locate local files (only when source is local_files or downloads) ──
    {
      id: 2,
      name: "Locate your files",
      description:
        "AccomplishAI will find all your {topic} files in your {source} folder.",
      type: "accomplish",
      instruction:
        'Open Finder. Navigate to the {source} folder. Search for all files related to "{topic}" — these may be PDFs, ' +
        "Word documents (.docx), text files, or images of handwritten notes. Check subfolders too. " +
        "Select all relevant files (Cmd+A or Cmd+Click). Keep this Finder window open — you will upload these files in the next step.",
      status: "pending",
      sourceFilter: ["local_files", "downloads"],
    },

    // ── Step: Optional LLM cleanup (always included, user can skip) ──
    {
      id: 3,
      name: "Clean up notes (optional)",
      description:
        "Use AI to clean and consolidate your raw notes before uploading. Helpful if notes are messy or duplicated.",
      type: "llm_process",
      instruction:
        "Paste your raw notes content here and we'll clean them up — removing duplicates, fixing formatting, and organizing the content by topic or chapter.",
      status: "pending",
      optional: true,
    },

    // ── Step: Upload to NotebookLM (always) ──
    {
      id: 4,
      name: "Upload sources to NotebookLM",
      description:
        "AccomplishAI will open Google NotebookLM and upload all your collected files.",
      type: "accomplish",
      instruction:
        "Open Google NotebookLM at notebooklm.google.com in the browser. " +
        'Click "New Notebook" or the "+" button to create a new notebook. ' +
        'Name the notebook "{topic} - Organized". ' +
        'In the Sources panel on the left, click "Add Source" then select "Upload files" (the file upload icon). ' +
        "Navigate to ~/Downloads and select ALL the exported {topic} files. Click Open to upload. " +
        "Wait for NotebookLM to finish processing all sources (a loading indicator will appear).",
      status: "pending",
    },

    // ── Step: Generate mind map (always) ──
    {
      id: 5,
      name: "Generate mind map in NotebookLM",
      description:
        "AccomplishAI will generate a mind map to visualize how your notes connect.",
      type: "accomplish",
      instruction:
        'In the NotebookLM notebook "{topic} - Organized", look at the bottom of the page for the "Notebook guide" ' +
        'button or the study tools panel. Click on it to open the study tools. ' +
        'Find and click the "Mind Map" option to generate a visual overview showing how all topics and subtopics connect. ' +
        "Wait for the generation to complete — this may take 15-30 seconds depending on the amount of content.",
      status: "pending",
    },

    // ── Step: Get share link (always) ──
    {
      id: 6,
      name: "Copy the share link",
      description:
        "AccomplishAI will get the shareable link for your organized notebook.",
      type: "accomplish",
      instruction:
        'In the NotebookLM notebook "{topic} - Organized", click the "Share" button in the top-right corner. ' +
        'In the sharing dialog, toggle "Enable sharing via link" if it is not already on. ' +
        "Click the copy icon or the Copy Link button to copy the shareable URL to the clipboard.",
      status: "pending",
    },

    // ── Step: Paste link back (always) ──
    {
      id: 7,
      name: "Paste the NotebookLM link",
      description:
        "Paste the NotebookLM share link so we can save it for you.",
      type: "link_input",
      instruction: "Paste the NotebookLM share link here:",
      status: "pending",
    },
  ],
};
