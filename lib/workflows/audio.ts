// lib/workflows/audio.ts
// Audio overview workflow — 7 source-conditional steps.
// Generates a podcast-style audio overview from NotebookLM's Audio Overview feature.
// Great for auditory learners — listen to your notes as a conversation.

import { WorkflowTemplate } from "../types";

export const audioTemplate: WorkflowTemplate = {
  type: "audio",
  title: "Generate Audio Overview for {topic}",
  description:
    "Export your {topic} notes from {source}, upload to NotebookLM, and generate a podcast-style audio overview.",
  estimatedTime: "12-18 min",
  steps: [
    // ── Step: Export from Notion (only when source is Notion) ──
    {
      id: 1,
      name: "Export notes from Notion",
      description:
        "AccomplishAI will export your {topic} notes from Notion as PDF files.",
      type: "accomplish",
      instruction:
        'Open notion.so in the browser. In the left sidebar, navigate to the workspace and find the page or database titled "{topic}". ' +
        'Click the "..." (three-dot menu) in the top-right corner of the page. ' +
        'Select "Export". In the export dialog, set Format to "PDF", and enable "Include subpages" if available. ' +
        'Click "Export". Wait for the download to complete. The file will be saved to ~/Downloads.',
      status: "pending",
      sourceFilter: ["notion"],
    },

    // ── Step: Locate local files (only when source is local_files or downloads) ──
    {
      id: 2,
      name: "Locate your files",
      description:
        "AccomplishAI will find your {topic} files in your {source} folder.",
      type: "accomplish",
      instruction:
        'Open Finder. Navigate to the {source} folder. Look for files related to "{topic}" — these may be PDFs, ' +
        "Word documents (.docx), or text files. Select all relevant files. If there are multiple files, " +
        "select them all (Cmd+A or Cmd+Click). Keep this Finder window open — you will upload these files in the next step.",
      status: "pending",
      sourceFilter: ["local_files", "downloads"],
    },

    // ── Step: Optional LLM cleanup (always included, user can skip) ──
    {
      id: 3,
      name: "Clean up notes (optional)",
      description:
        "Use AI to clean and format your raw notes before uploading. You can skip this step if your notes are already well-formatted.",
      type: "llm_process",
      instruction:
        "Paste your raw notes content here and we'll clean them up — fixing formatting, removing duplicates, and organizing the content for a better audio overview.",
      status: "pending",
      optional: true,
    },

    // ── Step: Upload to NotebookLM (always) ──
    {
      id: 4,
      name: "Upload sources to NotebookLM",
      description:
        "AccomplishAI will open Google NotebookLM and upload your exported files.",
      type: "accomplish",
      instruction:
        "Open Google NotebookLM at notebooklm.google.com in the browser. " +
        'Click "New Notebook" or the "+" button to create a new notebook. ' +
        'Name the notebook "{topic} - Audio Overview". ' +
        'In the Sources panel on the left, click "Add Source" then select "Upload files" (the file upload icon). ' +
        "Navigate to ~/Downloads and select the exported {topic} files. Click Open to upload. " +
        "Wait for NotebookLM to finish processing all sources (a loading indicator will appear).",
      status: "pending",
    },

    // ── Step: Generate audio overview (always) ──
    {
      id: 5,
      name: "Generate audio overview in NotebookLM",
      description:
        "AccomplishAI will use NotebookLM's Audio Overview to create a podcast-style discussion of your notes.",
      type: "accomplish",
      instruction:
        'In the NotebookLM notebook "{topic} - Audio Overview", look at the bottom of the page for the "Notebook guide" ' +
        'button or the study tools panel. Click on it to open the study tools. ' +
        'Find and click the "Audio Overview" option. NotebookLM will generate a podcast-style conversation between two AI hosts ' +
        "discussing your study material. This takes 2-5 minutes to generate — wait for the audio player to appear. " +
        "Once ready, you can play it directly or download it.",
      status: "pending",
    },

    // ── Step: Get share link (always) ──
    {
      id: 6,
      name: "Copy the share link",
      description:
        "AccomplishAI will get the shareable link for your NotebookLM notebook with the audio overview.",
      type: "accomplish",
      instruction:
        'In the NotebookLM notebook "{topic} - Audio Overview", click the "Share" button in the top-right corner. ' +
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
