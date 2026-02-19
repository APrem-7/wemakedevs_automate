---
name: notebooklm-upload
description: Create a new notebook in Google NotebookLM and upload source files from the local machine. Accepts file paths from upstream skills and returns notebook metadata.
command: /notebooklm-upload
inputs:
  - files[] (from notion-export or local-files)
  - notebook_name
outputs:
  - notebook_id
  - notebook_name
  - notebook_url
  - uploaded_sources[]
  - source_count
---

# NotebookLM — Upload Sources

## Overview

Creates a new notebook in Google NotebookLM and uploads study material files.

- Accepts file paths from upstream skills (notion-export, local-files)
- Creates a named notebook
- Uploads each file as a separate source
- Waits for processing confirmation on each source
- Returns structured notebook metadata for downstream skills

---

## Preconditions

- User logged into Google account in the browser
- Files exist at the provided paths (verified by upstream skill)
- NotebookLM accessible at notebooklm.google.com

---

## Inputs

- files[]: array of file objects with `path` and `filename` fields
  (from notion-export.exported_files[] or local-files.located_files[])
- notebook_name (required): name for the new notebook (e.g., "Operating Systems - Flashcards")

---

## Execution Flow

### STEP 1 — Open NotebookLM

- Navigate to https://notebooklm.google.com
- Wait for page to fully load
- Confirm user is logged in (Google account avatar visible in top-right)
- If login required → notify user and wait

---

### STEP 2 — Create New Notebook

- Click "New Notebook" button or "+" icon on the main page
- If a naming dialog appears:
    - Enter notebook_name
    - Click Create / Confirm
- If no naming dialog (auto-creates untitled):
    - Click on the notebook title area
    - Clear default text
    - Type notebook_name
    - Click outside to confirm

Store:
notebook_name = confirmed notebook title
notebook_url = current browser URL

---

### STEP 3 — Upload Source Files

For each file in files[]:

    1. In the Sources panel (left sidebar), click "Add Source"
    2. In the source type picker, select "Upload files" (file/document upload icon)
    3. In the file picker dialog:
        - Navigate to the file's directory path
        - Select the file by filename
        - Click "Open" / "Upload"
    4. Wait for upload progress to complete
    5. Wait for source processing indicator to finish
       (NotebookLM shows a loading spinner on each source while indexing)
    6. Confirm source appears in the Sources panel with a checkmark or ready state
    7. Store in uploaded_sources[]:
        - source_name (as shown in NotebookLM)
        - original_filename
        - status: "ready" | "processing" | "failed"

    If upload fails for a file:
    - Retry once
    - If still failing → mark status as "failed" and continue with next file

---

### STEP 4 — Upload Verification

After all files are uploaded:

- Count sources visible in the Sources panel
- Compare with expected file count
- Confirm all sources show "ready" status (fully indexed)

If source_count < expected:
- Identify which files failed
- Report failed files to user
- Continue with successfully uploaded sources

Store:
source_count = number of successfully uploaded sources

---

## Structured Output (CRITICAL FOR NEXT SKILL)

Return:

{
  notebook_name: "Operating Systems - Flashcards",
  notebook_url: "https://notebooklm.google.com/notebook/abc123",
  source_count: 3,
  uploaded_sources: [
      {
          source_name: "Process Management",
          original_filename: "Process Management.pdf",
          status: "ready"
      },
      {
          source_name: "Memory Management",
          original_filename: "Memory Management.pdf",
          status: "ready"
      },
      {
          source_name: "File Systems",
          original_filename: "File Systems.pdf",
          status: "ready"
      }
  ]
}

---

## Edge Case Handling

- If NotebookLM is temporarily unavailable:
  Wait 10 seconds, refresh, retry once. If still down → abort and report.

- If file picker cannot find the file:
  Verify path exists. If file was moved/deleted since upstream skill ran → report missing file.

- If source processing takes > 60 seconds per file:
  Continue waiting up to 120 seconds. If still processing → mark as "processing" and move on.

- If notebook name already exists:
  NotebookLM allows duplicate names. Proceed normally but note in output.

- If unsupported file format:
  Report the file as failed with reason "unsupported format". Supported: PDF, Google Docs, Google Slides, text files, Markdown, web URLs, audio files.

---

## Downstream Skill Compatibility

This skill guarantees:
- Notebook exists and is accessible via notebook_url
- All uploaded sources are indexed and ready
- Source count verified
- Clean structured JSON output

Next skills (example):
- /notebooklm-generate (generate flashcards, quizzes, audio from this notebook)
- /notebooklm-share (get share link for this notebook)

---

## Examples

"Upload my exported OS notes to NotebookLM"
"Create a NotebookLM notebook called DBMS Study and upload these files"
"Upload the PDFs from Downloads to a new notebook"
