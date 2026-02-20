// lib/workflows/quiz.ts
// Quiz generation workflow — 7 source-conditional steps.
// Mirrors the flashcards template but generates a quiz in NotebookLM.
// Steps are filtered by sourceType at runtime in instructionGenerator.ts.

import { WorkflowTemplate } from "../types";

export const quizTemplate: WorkflowTemplate = {
  type: "quiz",
  title: "Generate Quiz for {topic}",
  description:
    "Export your {topic} notes from {source}, upload to NotebookLM, and generate a practice quiz.",
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
        "Paste your raw notes content here and we'll clean them up — fixing formatting, removing duplicates, and organizing the content for better quiz generation.",
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
        'Name the notebook "{topic} - Quiz". ' +
        'In the Sources panel on the left, click "Add Source" then select "Upload files" (the file upload icon). ' +
        "Navigate to ~/Downloads and select the exported {topic} files. Click Open to upload. " +
        "Wait for NotebookLM to finish processing all sources (a loading indicator will appear).",
      status: "pending",
    },

    // ── Step: Generate quiz (always) ──
    {
      id: 5,
      name: "Generate quiz in NotebookLM",
      description:
        "AccomplishAI will use NotebookLM's Notebook Guide to generate a practice quiz.",
      type: "accomplish",
      instruction:
        'In the NotebookLM notebook "{topic} - Quiz", look at the bottom of the page for the "Notebook guide" ' +
        'button or the study tools panel. Click on it to open the study tools. ' +
        'Find and click the "Quiz" option to generate a practice quiz from the uploaded sources. ' +
        "Wait for the generation to complete — this may take 15-30 seconds depending on the amount of content.",
      status: "pending",
    },

    // ── Step: Get share link (always) ──
    {
      id: 6,
      name: "Copy the share link",
      description:
        "AccomplishAI will get the shareable link for your NotebookLM notebook.",
      type: "accomplish",
      instruction:
        'In the NotebookLM notebook "{topic} - Quiz", click the "Share" button in the top-right corner. ' +
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
