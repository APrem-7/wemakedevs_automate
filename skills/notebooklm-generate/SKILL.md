---
name: notebooklm-generate
description: Generate study materials in a Google NotebookLM notebook — flashcards, audio overviews, quizzes, mind maps, study guides, briefing docs, timelines, FAQs, and video overviews. Supports generating one or multiple output types.
command: /notebooklm-generate
inputs:
  - notebook_url (from notebooklm-upload)
  - output_types[] (one or more of the available types)
outputs:
  - generated_materials[]
  - notebook_url
  - notebook_name
---

# NotebookLM — Generate Study Materials

## Overview

Generates AI-powered study materials from uploaded sources in a NotebookLM notebook.

- Supports all NotebookLM output types
- Can generate multiple types in a single run
- Waits for each generation to complete before proceeding
- Returns structured metadata for each generated material

---

## Preconditions

- Notebook exists at notebook_url (created by notebooklm-upload)
- At least one source is uploaded and fully indexed
- User logged into Google account in the browser

---

## Inputs

- notebook_url (required): URL of the target notebook
- output_types[] (required): one or more of:
    - "flashcards"
    - "study_guide"
    - "quiz"
    - "mind_map"
    - "audio_overview"
    - "video_overview"
    - "briefing_doc"
    - "timeline"
    - "faq"
    - "all" (generate every available type)

---

## Available Output Types

| Type | UI Label in NotebookLM | Generation Time | Description |
|------|----------------------|-----------------|-------------|
| flashcards | Flashcards | 15-30 sec | Key concept Q&A cards for active recall |
| study_guide | Study Guide | 15-30 sec | Condensed summary of all source material |
| quiz | Quiz | 15-30 sec | Practice questions with answers |
| mind_map | Mind Map | 15-30 sec | Visual concept map showing relationships |
| audio_overview | Audio Overview | 1-3 min | Podcast-style discussion of the material |
| video_overview | Video Overview | 1-3 min | Video summary of the content |
| briefing_doc | Briefing Doc | 15-30 sec | Executive-style summary document |
| timeline | Timeline | 15-30 sec | Chronological event summary |
| faq | FAQ | 15-30 sec | Frequently asked questions from the material |

---

## Execution Flow

### STEP 1 — Open Notebook

- Navigate to notebook_url in the browser
- Wait for page to fully load
- Confirm notebook title is visible
- Confirm sources are listed in the Sources panel (left sidebar)

Store:
notebook_name = visible notebook title

---

### STEP 2 — Open Notebook Guide Panel

- Look for the "Notebook guide" button at the bottom of the page
  (may also appear as a floating button or in the right panel)
- Click to open the study tools / notebook guide panel
- Confirm the panel is visible with generation options

If panel does not appear:
- Try scrolling to the bottom of the notebook
- Look for alternative entry points: right sidebar, toolbar icons
- If still not found → abort and report

---

### STEP 3 — Generate Each Requested Type

If output_types contains "all":
    Expand to all 9 available types

For each type in output_types[]:

    1. Locate the corresponding button/card in the Notebook Guide panel
       Match by UI label (see Available Output Types table)

    2. Click the generation button for this type

    3. Wait for generation to complete:
        - Text-based types (flashcards, study_guide, quiz, mind_map, briefing_doc, timeline, faq):
          Wait up to 60 seconds. Look for content appearing or a "Done" indicator.
        - Media types (audio_overview, video_overview):
          Wait up to 180 seconds (3 minutes). Look for a playback control or "Ready" state.

    4. Confirm generation succeeded:
        - Content is visible/playable
        - No error messages displayed

    5. Store in generated_materials[]:
        - type: the output type
        - status: "ready" | "failed"
        - label: the visible title/label in NotebookLM

    If generation fails for a type:
    - Note the error message if visible
    - Mark status as "failed" with reason
    - Continue to next type (do NOT abort entire run)

---

### STEP 4 — Generation Verification

After all types are processed:

- Review the Notebook Guide panel
- Confirm each requested type shows as generated
- Count successful generations vs requested

If any types failed:
- Report which types failed and why
- Suggest retry for failed types

---

## Structured Output (CRITICAL FOR NEXT SKILL)

Return:

{
  notebook_name: "Operating Systems - Flashcards",
  notebook_url: "https://notebooklm.google.com/notebook/abc123",
  generated_materials: [
      {
          type: "flashcards",
          status: "ready",
          label: "Flashcards"
      },
      {
          type: "audio_overview",
          status: "ready",
          label: "Audio Overview"
      },
      {
          type: "quiz",
          status: "failed",
          reason: "Generation timed out after 60 seconds"
      }
  ]
}

---

## Edge Case Handling

- If Notebook Guide panel shows "Not enough sources":
  Report error. At least one source must be fully indexed before generation works.

- If a type is already generated (from a previous run):
  Skip regeneration unless explicitly requested. Mark as "ready" in output.

- If audio/video generation is stuck in "Generating..." state beyond 3 minutes:
  Mark as "failed" with reason "timeout". These can be retried later.

- If NotebookLM shows a rate limit or quota error:
  Wait 30 seconds, retry once. If still limited → abort remaining types and report.

- If the notebook has no sources loaded:
  Abort immediately. Report "No sources found in notebook. Run /notebooklm-upload first."

---

## Downstream Skill Compatibility

This skill guarantees:
- Each requested type has a clear status (ready/failed)
- Notebook URL preserved for sharing
- Failed types identified with reasons
- Clean structured JSON output

Next skills (example):
- /notebooklm-share (share the notebook with generated materials)
- /calendar (schedule revision sessions based on generated content)

---

## Examples

"Generate flashcards from my OS notebook"
"Create an audio overview and study guide for DBMS"
"Generate all study materials for my CN notebook"
"Make a quiz and mind map from my uploaded notes"
"Create flashcards and an audio overview for exam prep"
