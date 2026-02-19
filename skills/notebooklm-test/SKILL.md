---
name: notebooklm-e2e-flashcards
description: End-to-end test skill — find study files in ~/Downloads, create a NotebookLM notebook, upload sources, generate flashcards, enable sharing, and return a share link. Use this to verify the full flashcard pipeline works.
command: /notebooklm-flashcards
inputs:
  - subject_name (required)
  - file_hint (optional)
outputs:
  - notebook_name
  - notebook_url
  - share_url
  - flashcard_status
  - uploaded_files[]
---

# NotebookLM End-to-End Flashcard Automation

## Overview

This skill performs a complete browser automation flow:

1. Locate study files in ~/Downloads
2. Create a new NotebookLM notebook
3. Upload files as sources
4. Generate flashcards
5. Enable sharing
6. Return structured output

---

## Execution Rules

- Always verify UI state before proceeding.
- Never assume a click succeeded.
- Wait for visible confirmation after each step.
- If an element is missing → scroll → retry → refresh once → abort.
- Maximum 2 retries per critical action.

---

## Step 1 — File Discovery (Local)

Directory: ~/Downloads

Allowed File Types:
- .pdf
- .md
- .docx
- .txt

Excluded:
- .zip
- .dmg
- .app
- .exe
- images
- videos

Matching Logic:
If file_hint exists → use it
Else → use subject_name

Match:
- Case-insensitive
- Filename contains keyword

If no match:
- Select 5 most recent document files
- Request confirmation before proceeding

Abort if no valid files found.

---

## Step 2 — Open NotebookLM

Navigate: https://notebooklm.google.com

Confirm loaded when ALL are visible:
- "NotebookLM" (top-left)
- "Create notebook" button
- Notebook grid or library view

If not loaded:
- Wait 10s
- Refresh once
- Abort if still failing

---

## Step 3 — Create New Notebook

Click either:
- "+ Create notebook" OR
- "Create new notebook" card

Confirm workspace view:

Left Sidebar:
- "Sources"
- "+ Add sources"

Center:
- "Add a source to get started"

Right Panel:
- "Studio"
- Flashcards button visible

---

## Step 4 — Rename Notebook

Default title: Untitled notebook

Action:
1. Click notebook title
2. Replace with: {subject_name} - Flashcards
3. Press Enter

Validate title updates visually.

---

## Step 5 — Upload Files

For each file:
1. Click "+ Add sources"
2. Select "Upload files"
3. Navigate to ~/Downloads
4. Select file
5. Click Open

Wait until:
- Spinner disappears
- File shows ready state

Max wait: 3 minutes per file
Retry upload once if failed

---

## Step 6 — Generate Flashcards

In Studio panel, click: Flashcards

Flashcards ready when:
- Card-style Q/A interface visible
- No loading spinner

Timeout: 60 seconds
Retry once if failed

---

## Step 7 — Enable Sharing

1. Click Share (top-right)
2. Enable link sharing if disabled
3. Copy link

Store share_url.

---

## Structured Output (CRITICAL FOR NEXT SKILL)

Return:

{
  "notebook_name": "Operating Systems - Flashcards",
  "notebook_url": "https://notebooklm.google.com/notebook/abc123",
  "share_url": "https://notebooklm.google.com/notebook/abc123?sharing=enabled",
  "flashcard_status": "ready",
  "file_count": 3,
  "uploaded_files": [
    {
      "filename": "Process Management.pdf",
      "path": "~/Downloads/Process Management.pdf",
      "status": "uploaded"
    }
  ]
}

---

## Hard Failure Conditions

Abort if:
- Google login not detected
- Notebook creation fails twice
- Upload fails twice per file
- Share dialog inaccessible
- No files found

Return explicit failure reason.
