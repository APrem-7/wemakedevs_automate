---
name: notion-export
description: Export a Notion subject page and its chapter subpages individually, then return structured metadata for downstream skills.
command: /notion-export
outputs:
  - exported_files[]
  - subject_name
  - chapter_names[]
  - export_format
---

# Notion Export (Chapter-Aware)

## Overview

Exports a subject page from Notion.

If the subject contains subpages:
- Treat each subpage as a chapter
- Export each chapter individually
- Capture chapter name and corresponding file name
- Return structured output for downstream skills

If no subpages:
- Export the main page only

---

## Preconditions

- User logged into Notion
- Target subject page name known
- Browser download permissions enabled

---

## Inputs

- target_page_name (required)
- format: PDF | Markdown (default: PDF)
- include_subpages: auto-detect (do NOT rely on Notion's bulk export)

---

## Execution Flow

### STEP 1 — Open Notion

- Navigate to https://www.notion.so
- Confirm sidebar visible
- Confirm logged-in workspace

---

### STEP 2 — Locate Subject Page

- Use search (Cmd/Ctrl + P)
- Type target_page_name
- Open correct page
- Verify page title matches

Store:
subject_name = page title

---

### STEP 3 — Detect Subpages (Chapter Detection)

Scan the main content area for:
- Nested pages
- Toggle blocks containing pages
- Inline page links
- Child pages listed as blocks

Method:
- Scroll entire page
- Identify blocks with page icons
- Collect visible child page titles

If subpages found:
    chapter_names = [list of child page titles]
Else:
    chapter_names = []

---

### STEP 4 — Export Logic

IF chapter_names is NOT empty:

    For each chapter in chapter_names:

        1. Click chapter page
        2. Wait for page load
        3. Open "..." menu (top right)
        4. Click Export
        5. Select requested format
        6. Disable include subpages (chapters are atomic)
        7. Click Export
        8. Wait for download
        9. Confirm file exists in ~/Downloads
        10. Capture actual downloaded file name
        11. Store in exported_files[]

        12. Navigate back to subject page

ELSE:

    Export main page normally
    Confirm file download
    Store file in exported_files[]

---

### STEP 5 — Download Verification

For each export:

- Open ~/Downloads
- Sort by Date Modified
- Confirm new file exists
- Confirm file extension matches format
- Confirm filename contains chapter name (fuzzy match allowed)

If not found:
- Retry export once
- If still failing → abort and report

---

## Structured Output (CRITICAL FOR NEXT SKILL)

Return:

{
  subject_name: "Operating Systems",
  export_format: "PDF",
  chapter_names: [
      "Process Management",
      "Memory Management",
      "File Systems"
  ],
  exported_files: [
      {
          chapter: "Process Management",
          filename: "Process Management.pdf",
          path: "~/Downloads/Process Management.pdf"
      },
      {
          chapter: "Memory Management",
          filename: "Memory Management.pdf",
          path: "~/Downloads/Memory Management.pdf"
      }
  ]
}

---

## Edge Case Handling

- If subpages are deeply nested:
  Only process first-level children unless recursive mode enabled.

- If export dialog fails:
  Retry once after 5 seconds.

- If permission error:
  Notify user.

---

## Downstream Skill Compatibility

This skill guarantees:
- File paths are known
- Chapter names preserved
- Clean structured JSON output

Next skills (example):
- /notebooklm-upload
- /flashcard-generator
- /quiz-builder
- /notion-update

Each can loop over exported_files[].

---

## Examples

"Export my OS notes"
"Export DBMS subject chapters individually as PDF"
"Download CN subject and prepare chapters for flashcard creation"
