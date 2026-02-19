---
name: local-files
description: Find, select, and verify local files on the user's machine for use in downstream skills. Scans folders, matches files by name or type, and returns structured metadata.
command: /local-files
outputs:
  - located_files[]
  - source_folder
  - subject_name
  - file_count
---

# Local Files (Scan & Select)

## Overview

Locates and selects study material files on the local filesystem.

- Scans a target folder for files matching a subject or topic
- Filters by file type (PDF, Markdown, DOCX, TXT)
- Verifies files are non-empty and readable
- Returns structured output for downstream skills

---

## Preconditions

- Target folder exists on the local machine
- Files are already present (exported from Notion, downloaded, or user-created)
- Finder or file system access available

---

## Inputs

- target_folder (required): path to scan (e.g., ~/Downloads, ~/Documents, ~/Desktop)
- subject_hint (optional): topic name to filter files by (e.g., "Operating Systems")
- file_types: PDF | Markdown | DOCX | TXT | ALL (default: ALL)

---

## Execution Flow

### STEP 1 — Open Target Folder

- Open Finder
- Navigate to target_folder path
- If path does not exist → abort and report
- Confirm folder is accessible

Store:
source_folder = target_folder path

---

### STEP 2 — Scan for Files

Scan the folder contents:

- List all files (not subdirectories)
- Filter by requested file_types
- If subject_hint provided:
    - Match filenames containing subject_hint (case-insensitive)
    - Match filenames containing keywords from subject_hint
    - Include partial matches (e.g., "OS" matches "Operating Systems")

Sort results by:
1. Date Modified (newest first)
2. Filename (alphabetical, secondary sort)

---

### STEP 3 — Verify Files

For each matched file:

1. Confirm file size > 0 bytes
2. Confirm file extension matches expected type
3. Read file metadata (name, size, modified date)
4. Store in located_files[]

If no files match:
- Broaden search: remove subject_hint filter
- If still no files → report "No matching files found in {target_folder}"

---

### STEP 4 — User Confirmation

Present found files to user:

- Show list: filename, size, modified date
- Ask user to confirm selection
- User can deselect specific files
- User can request scanning a different folder

After confirmation:
- Finalize located_files[]
- Store file_count = number of selected files

---

## Structured Output (CRITICAL FOR NEXT SKILL)

Return:

{
  source_folder: "~/Downloads",
  subject_name: "Operating Systems",
  file_count: 3,
  located_files: [
      {
          filename: "Process Management.pdf",
          path: "~/Downloads/Process Management.pdf",
          size: "2.4 MB",
          modified: "2026-02-19T10:30:00",
          type: "PDF"
      },
      {
          filename: "Memory Management.pdf",
          path: "~/Downloads/Memory Management.pdf",
          size: "1.8 MB",
          modified: "2026-02-19T10:31:00",
          type: "PDF"
      },
      {
          filename: "File Systems.pdf",
          path: "~/Downloads/File Systems.pdf",
          size: "3.1 MB",
          modified: "2026-02-19T10:32:00",
          type: "PDF"
      }
  ]
}

---

## Edge Case Handling

- If target_folder is empty:
  Report "Folder is empty" and suggest alternative paths (~/Downloads, ~/Documents, ~/Desktop).

- If files are zip archives (Notion bulk export):
  Detect .zip files, extract contents to same folder, then re-scan.

- If duplicate filenames found:
  Include all duplicates but flag them in output with a "duplicate: true" field.

- If folder contains hundreds of files:
  Apply subject_hint filter strictly. If no hint provided, show only files modified in the last 7 days.

---

## Downstream Skill Compatibility

This skill guarantees:
- All file paths are absolute and verified
- File sizes confirmed non-zero
- File types validated
- Clean structured JSON output

Next skills (example):
- /notebooklm-upload (loop over located_files[])
- /notion-export (if files need re-export)
- /organize-files (if files need sorting)

---

## Examples

"Find my OS notes in Downloads"
"Locate the PDF files on my Desktop"
"Select the DBMS exported files from Documents"
"Scan Downloads for any study materials from this week"
