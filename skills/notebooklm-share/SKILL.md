---
name: notebooklm-share
description: Get a shareable link for a Google NotebookLM notebook and optionally configure sharing permissions. Returns the share URL for downstream use.
command: /notebooklm-share
inputs:
  - notebook_url (from notebooklm-upload or notebooklm-generate)
outputs:
  - share_url
  - notebook_name
  - sharing_enabled
---

# NotebookLM — Share Notebook

## Overview

Gets a shareable link for a NotebookLM notebook.

- Opens the target notebook
- Enables link sharing if not already on
- Copies the share URL
- Returns the URL for downstream use or for the user to save

---

## Preconditions

- Notebook exists at notebook_url
- User logged into Google account in the browser
- User has owner/editor permissions on the notebook

---

## Inputs

- notebook_url (required): URL of the target notebook
  (from notebooklm-upload.notebook_url or notebooklm-generate.notebook_url)

---

## Execution Flow

### STEP 1 — Open Notebook

- Navigate to notebook_url in the browser
- Wait for page to fully load
- Confirm notebook title is visible
- Confirm this is the correct notebook

Store:
notebook_name = visible notebook title

---

### STEP 2 — Open Share Dialog

- Locate the "Share" button in the top-right corner of the page
  (typically next to the notebook title or in the toolbar)
- Click the "Share" button
- Wait for the sharing dialog/modal to appear

If share button not found:
- Look for alternative locations: toolbar menu, "..." overflow menu
- If still not found → abort and report

---

### STEP 3 — Enable Link Sharing

Check the current sharing state in the dialog:

IF link sharing is already enabled:
    - Note: sharing_enabled = true (already)
    - Proceed to STEP 4

IF link sharing is NOT enabled:
    - Find the "Enable sharing via link" toggle or similar option
    - Click to enable it
    - Wait for the toggle state to change
    - Confirm sharing is now enabled

Store:
sharing_enabled = true

---

### STEP 4 — Copy Share Link

- Locate the share URL in the dialog
  (may be displayed as a text field, or behind a "Copy Link" button)
- Click "Copy Link" button or the copy icon next to the URL
- If no copy button:
    - Select the URL text field
    - Use Cmd/Ctrl + C to copy
- Confirm the URL is in the clipboard

Store:
share_url = copied URL

---

### STEP 5 — Verify Share Link

- Confirm share_url starts with "https://notebooklm.google.com/"
- Confirm share_url contains the notebook identifier
- Close the sharing dialog

If URL appears malformed:
- Re-open share dialog
- Retry copy
- If still malformed → report the raw URL and let user verify

---

## Structured Output (CRITICAL FOR NEXT SKILL)

Return:

{
  notebook_name: "Operating Systems - Flashcards",
  notebook_url: "https://notebooklm.google.com/notebook/abc123",
  share_url: "https://notebooklm.google.com/notebook/abc123?sharing=enabled",
  sharing_enabled: true
}

---

## Edge Case Handling

- If sharing is restricted by organization policy (Google Workspace admin):
  Report "Sharing restricted by organization policy. Contact your admin."
  Return sharing_enabled = false.

- If the share dialog layout has changed:
  Look for any element containing "share", "link", or "copy" text.
  Attempt to interact with the most likely element.

- If copy to clipboard fails:
  Read the URL text directly from the dialog element.
  Store it in share_url even if clipboard copy failed.

- If notebook is empty (no sources, no generated content):
  Sharing still works. Proceed normally but note in output that notebook has no content.

---

## Downstream Skill Compatibility

This skill guarantees:
- share_url is a valid, accessible URL
- Sharing is confirmed enabled
- URL can be pasted into StudyEngine's link_input step
- Clean structured JSON output

Next steps (example):
- User pastes share_url into StudyEngine's "Paste link" step
- /calendar (include notebook link in calendar event descriptions)

---

## Examples

"Get the share link for my OS notebook"
"Share my NotebookLM study guide"
"Copy the notebook link so I can save it"
"Enable sharing and get the URL for my DBMS notebook"
