// lib/accomplish/bridge.ts
// Accomplish bridge — stub executor layer.
// Maps workflow step types to execution strategies.
//
// Currently returns structured instructions for the frontend to render.
// When AccomplishAI integration is added, this is the single file to update.

import type { WorkflowStep, ParsedIntent } from "../types";

export type StepAction = "copy_to_clipboard" | "show_link_input";

export interface StepResult {
    instruction: string;
    action: StepAction;
    stepId: number;
    stepName: string;
}

export function executeStep(
    step: WorkflowStep,
    _intent: ParsedIntent,
): StepResult {
    switch (step.type) {
        case "link_input":
            return {
                instruction: step.instruction,
                action: "show_link_input",
                stepId: step.id,
                stepName: step.name,
            };

        case "accomplish":
        default:
            return {
                instruction: step.instruction,
                action: "copy_to_clipboard",
                stepId: step.id,
                stepName: step.name,
            };
    }
}
