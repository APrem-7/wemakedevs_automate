// lib/instructionGenerator.ts
// Takes a workflow template with placeholders ({topic}, {source})
// and a parsed intent with actual values, returns a populated workflow.
//
// Key feature: source-aware step filtering.
// If a step has a `sourceFilter` array, it is only included when the
// user's sourceType matches one of the values. Steps without sourceFilter
// are always included. After filtering, step IDs are re-numbered sequentially.

import { ParsedIntent, WorkflowTemplate, WorkflowStep } from "./types";

function fillPlaceholders(text: string, intent: ParsedIntent): string {
  return text
    .replace(/\{topic\}/g, intent.topic)
    .replace(/\{source\}/g, intent.source)
    .replace(/\{sourceType\}/g, intent.sourceType);
}

export function populateWorkflow(
  template: WorkflowTemplate,
  intent: ParsedIntent
): WorkflowTemplate {
  // 1. Filter steps by sourceType
  const filteredSteps = template.steps.filter((step) => {
    if (!step.sourceFilter) return true; // no filter = always include
    return step.sourceFilter.includes(intent.sourceType);
  });

  // 2. Fill placeholders and re-number IDs sequentially
  const populatedSteps: WorkflowStep[] = filteredSteps.map((step, index) => ({
    ...step,
    id: index + 1,
    name: fillPlaceholders(step.name, intent),
    description: fillPlaceholders(step.description, intent),
    instruction: fillPlaceholders(step.instruction, intent),
    status: index === 0 ? "active" : "pending",
    // Remove sourceFilter from the output — frontend doesn't need it
    sourceFilter: undefined,
  }));

  return {
    ...template,
    title: fillPlaceholders(template.title, intent),
    description: fillPlaceholders(template.description, intent),
    steps: populatedSteps,
  };
}
