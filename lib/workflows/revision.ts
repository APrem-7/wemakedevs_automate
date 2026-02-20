// lib/workflows/revision.ts
// Revision planning workflow — 9 source-conditional steps.
// Unique workflow: includes TWO LLM steps and a calendar skill.
//   1. Gather notes (source-dependent)
//   2. Optional cleanup
//   3. Upload to NotebookLM + generate study guide (for reference)
//   4. LLM analyzes content and generates a smart revision schedule
//   5. AccomplishAI creates calendar events from the schedule
//   6. Share link for the study guide

import { WorkflowTemplate } from "../types";

export const revisionTemplate: WorkflowTemplate = {
  type: "revision",
  title: "Create Revision Plan for {topic}",
  description:
    "Export your {topic} notes from {source}, generate a study guide, then create a smart revision schedule on Google Calendar.",
  estimatedTime: "15-25 min",
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
        "Paste your raw notes content here and we'll clean them up — fixing formatting, removing duplicates, and organizing the content before analysis.",
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
        'Name the notebook "{topic} - Revision". ' +
        'In the Sources panel on the left, click "Add Source" then select "Upload files" (the file upload icon). ' +
        "Navigate to ~/Downloads and select the exported {topic} files. Click Open to upload. " +
        "Wait for NotebookLM to finish processing all sources (a loading indicator will appear).",
      status: "pending",
    },

    // ── Step: Generate study guide in NotebookLM (always) ──
    {
      id: 5,
      name: "Generate study guide in NotebookLM",
      description:
        "AccomplishAI will generate a study guide so you have a reference while revising.",
      type: "accomplish",
      instruction:
        'In the NotebookLM notebook "{topic} - Revision", look at the bottom of the page for the "Notebook guide" ' +
        'button or the study tools panel. Click on it to open the study tools. ' +
        'Find and click the "Study Guide" option to generate a comprehensive study guide. ' +
        "Wait for the generation to complete. This study guide will be your reference material during revision sessions.",
      status: "pending",
    },

    // ── Step: LLM generates smart revision schedule (always) ──
    {
      id: 6,
      name: "Generate revision schedule",
      description:
        "AI will analyze your study material and create a spaced-repetition revision schedule tailored to the content.",
      type: "llm_process",
      instruction:
        "Paste a summary or table of contents of your {topic} material here (you can copy from the study guide). " +
        "Include your exam date if you have one. " +
        "AI will analyze the topics and generate a smart revision schedule using spaced repetition principles — " +
        "harder or larger topics get more sessions, and reviews are spaced out for optimal retention.",
      status: "pending",
    },

    // ── Step: Create calendar events (always) ──
    {
      id: 7,
      name: "Create revision events on Google Calendar",
      description:
        "AccomplishAI will add the revision schedule as events on your Google Calendar.",
      type: "accomplish",
      instruction:
        "Open Google Calendar at calendar.google.com in the browser. " +
        "For each study session in the revision schedule below, create a new event: " +
        'click the "+" or click on the target date, enter the session title (e.g. "{topic} — Chapter 3 Review"), ' +
        "set the start and end time as specified, and save. Repeat for all sessions. " +
        "The revision schedule with specific dates, times, and topics will be provided from the previous step.",
      status: "pending",
    },

    // ── Step: Get share link for study guide (always) ──
    {
      id: 8,
      name: "Copy the share link",
      description:
        "AccomplishAI will get the shareable link for your NotebookLM revision notebook.",
      type: "accomplish",
      instruction:
        'In the NotebookLM notebook "{topic} - Revision", click the "Share" button in the top-right corner. ' +
        'In the sharing dialog, toggle "Enable sharing via link" if it is not already on. ' +
        "Click the copy icon or the Copy Link button to copy the shareable URL to the clipboard.",
      status: "pending",
    },

    // ── Step: Paste link back (always) ──
    {
      id: 9,
      name: "Paste the NotebookLM link",
      description:
        "Paste the NotebookLM share link so we can save it for you.",
      type: "link_input",
      instruction: "Paste the NotebookLM share link here:",
      status: "pending",
    },
  ],
};
