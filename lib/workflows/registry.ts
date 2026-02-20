// lib/workflows/registry.ts
// Maps workflow type → template.
// To add a new workflow: create a template file, import it, add to the map.
//
// All 6 workflow types are now registered.
// getWorkflowTemplate() returns undefined for any type not in the map,
// and the start route handler already checks for this.

import { WorkflowType, WorkflowTemplate } from "../types";
import { flashcardsTemplate } from "./flashcards";
import { quizTemplate } from "./quiz";
import { summaryTemplate } from "./summary";
import { organizeTemplate } from "./organize";
import { audioTemplate } from "./audio";
import { revisionTemplate } from "./revision";

const registry: Record<WorkflowType, WorkflowTemplate> = {
  flashcards: flashcardsTemplate,
  quiz: quizTemplate,
  summary: summaryTemplate,
  organize: organizeTemplate,
  audio: audioTemplate,
  revision: revisionTemplate,
};

export function getWorkflowTemplate(
  type: WorkflowType
): WorkflowTemplate | undefined {
  return registry[type];
}

export function getAvailableWorkflows(): WorkflowType[] {
  return Object.keys(registry) as WorkflowType[];
}
