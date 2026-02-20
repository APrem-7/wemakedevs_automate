// lib/workflow-store.ts
// Unified Zustand store managing the entire app state machine.
// Replaces the old orca-store.ts.

// State machine: idle → loading → preview → running → completed/failed
// All transitions are guarded by canTransition().

import { create } from "zustand";
import type {
    ParsedIntent,
    WorkflowTemplate,
    WorkflowStatus,
    ContextItem,
    StepStatus,
} from "./types";

// STATE TRANSITION GUARD


const ALLOWED_TRANSITIONS: Record<WorkflowStatus, WorkflowStatus[]> = {
    idle: ["preview", "running"], // "running" added to support loading conceptually
    preview: ["running", "idle"],
    running: ["completed", "failed", "idle"],
    completed: ["idle"],
    failed: ["idle"],
};

function canTransition(
    from: WorkflowStatus,
    to: WorkflowStatus,
): boolean {
    return ALLOWED_TRANSITIONS[from]?.includes(to) ?? false;
}

// STORE TYPES

// App-level state (superset of WorkflowStatus — adds "loading" for UX)
export type AppState = "idle" | "loading" | "preview" | "executing" | "completed" | "failed";

interface WorkflowStore {
    //  App state machine 
    appState: AppState;

    // Prompt + context 
    currentPrompt: string;
    contextItems: ContextItem[];

    // Resolved workflow data (from API) 
    intent: ParsedIntent | null;
    workflow: WorkflowTemplate | null;
    workflowId: string | null;

    // Execution tracking
    currentStepIndex: number;
    workflowStartTime: number | null;

    // Result
    resultLink: string | null;

    // Error handling
    error: string | null;

    // Actions 
    setPrompt: (prompt: string) => void;
    addContextItem: (item: ContextItem) => void;
    removeContextItem: (id: string) => void;
    submitPrompt: () => Promise<void>;
    startWorkflow: () => void;
    cancelWorkflow: () => void;
    markStepComplete: () => void;
    submitLink: (link: string) => void;
    resetToIdle: () => void;
    clearError: () => void;
}


// MAP APP STATE → WORKFLOW STATUS (for DB/guard purposes)


function appStateToWorkflowStatus(state: AppState): WorkflowStatus {
    switch (state) {
        case "idle":
        case "loading":
            return "idle";
        case "preview":
            return "preview";
        case "executing":
            return "running";
        case "completed":
            return "completed";
        case "failed":
            return "failed";
    }
}


// STORE IMPLEMENTATION


export const useWorkflowStore = create<WorkflowStore>((set, get) => ({
    // Initial state 
    appState: "idle",
    currentPrompt: "",
    contextItems: [],
    intent: null,
    workflow: null,
    workflowId: null,
    currentStepIndex: 0,
    workflowStartTime: null,
    resultLink: null,
    error: null,

    // Prompt management
    setPrompt: (prompt: string) => set({ currentPrompt: prompt }),

    addContextItem: (item: ContextItem) =>
        set((state) => {
            if (state.contextItems.some((ci) => ci.id === item.id)) return state;
            return { contextItems: [...state.contextItems, item] };
        }),

    removeContextItem: (id: string) =>
        set((state) => ({
            contextItems: state.contextItems.filter((ci) => ci.id !== id),
        })),

    // Submit prompt → call API → transition to preview 

    submitPrompt: async () => {
        const { currentPrompt, contextItems, appState } = get();
        if (!currentPrompt.trim()) return;

        // Guard: can only submit from idle
        const currentStatus = appStateToWorkflowStatus(appState);
        if (currentStatus !== "idle") return;

        set({ appState: "loading", error: null });

        try {
            const res = await fetch("/api/workflow/start", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    prompt: currentPrompt,
                    context: {
                        items: contextItems,
                        source: contextItems.some((ci) => ci.source === "notion")
                            ? "Notion"
                            : undefined,
                    },
                }),
            });

            const data = await res.json();

            if (!data.success) {
                throw new Error(data.error || "Failed to process request");
            }

            // Guard: current state → preview
            if (!canTransition(appStateToWorkflowStatus(get().appState), "preview")) {
                throw new Error("Invalid state transition");
            }

            set({
                appState: "preview",
                intent: data.intent,
                workflow: data.workflow,
                workflowId: data.workflowId ?? null,
            });
        } catch (err: unknown) {
            const message =
                err instanceof Error ? err.message : "An unexpected error occurred";
            set({ appState: "idle", error: message });
        }
    },

    // Start workflow execution 

    startWorkflow: () => {
        const { workflow, appState } = get();
        if (!workflow) return;

        // Guard: current state → running
        if (!canTransition(appStateToWorkflowStatus(appState), "running")) return;

        // Set first step as active
        const updatedSteps = workflow.steps.map((step, i) => ({
            ...step,
            status: (i === 0 ? "active" : "pending") as StepStatus,
        }));

        set({
            appState: "executing",
            workflow: { ...workflow, steps: updatedSteps },
            currentStepIndex: 0,
            workflowStartTime: Date.now(),
        });
    },

    // Cancel and return to idle

    cancelWorkflow: () => {
        const { appState } = get();
        const currentStatus = appStateToWorkflowStatus(appState);

        // Guard: any state can go to idle
        if (!canTransition(currentStatus, "idle")) return;

        set({
            appState: "idle",
            currentPrompt: "",
            contextItems: [],
            intent: null,
            workflow: null,
            workflowId: null,
            currentStepIndex: 0,
            workflowStartTime: null,
            resultLink: null,
            error: null,
        });
    },

    // Mark current step as completed, advance to next

    markStepComplete: () => {
        const { workflow, currentStepIndex, appState } = get();

        // Guard: only allow step completion if we are actively executing
        if (appState !== "executing") return;

        if (!workflow) return;

        const updatedSteps = workflow.steps.map((step, i) => {
            if (i === currentStepIndex)
                return { ...step, status: "completed" as StepStatus };
            if (i === currentStepIndex + 1)
                return { ...step, status: "active" as StepStatus };
            return step;
        });

        const nextIndex = currentStepIndex + 1;
        const isLastStep = nextIndex >= updatedSteps.length;

        if (isLastStep) {
            // Guard: current state → completed
            if (!canTransition(appStateToWorkflowStatus(appState), "completed")) return;

            set({
                appState: "completed",
                workflow: { ...workflow, steps: updatedSteps },
                currentStepIndex: nextIndex,
            });
        } else {
            set({
                workflow: { ...workflow, steps: updatedSteps },
                currentStepIndex: nextIndex,
            });
        }
    },

    // Submit a link (for link_input steps)

    submitLink: (link: string) => {
        set({ resultLink: link });
        get().markStepComplete();
    },

    // Return to idle from completed/failed

    resetToIdle: () => {
        set({
            appState: "idle",
            currentPrompt: "",
            contextItems: [],
            intent: null,
            workflow: null,
            workflowId: null,
            currentStepIndex: 0,
            workflowStartTime: null,
            resultLink: null,
            error: null,
        });
    },

    // Clear error

    clearError: () => set({ error: null }),
}));
