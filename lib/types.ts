// lib/types.ts
// Shared data shapes used across the entire backend.
// This is the "contract" between frontend and backend.

// ─── What kind of workflow the user wants ───
export type WorkflowType =
  | "flashcards"
  | "quiz"
  | "summary"
  | "organize"
  | "audio"
  | "revision";

// ─── Where the user's notes live ───
export type SourceType = "notion" | "local_files" | "downloads";

// ─── What kind of step is it? ───
// "accomplish" = user copies an instruction to AccomplishAI
// "link_input" = user pastes a link back (e.g. NotebookLM share link)
// "llm_process" = optional LLM cleanup step (user can skip)
export type StepType = "accomplish" | "link_input" | "llm_process";

// ─── Status of a single step ───
export type StepStatus = "pending" | "active" | "completed" | "failed";

// ─── Status of the overall workflow ───
export type WorkflowStatus =
  | "idle"
  | "preview"
  | "running"
  | "completed"
  | "failed";

// ─── A single step in a workflow ───
export interface WorkflowStep {
  id: number;
  name: string;
  description: string;
  type: StepType;
  instruction: string;
  status: StepStatus;
  optional?: boolean;
  /** If set, this step is only included when the user's sourceType matches one of these values.
   *  If omitted, the step is always included regardless of source. */
  sourceFilter?: SourceType[];
}

// ─── A full workflow template ───
export interface WorkflowTemplate {
  type: WorkflowType;
  title: string;
  description: string;
  estimatedTime: string;
  steps: WorkflowStep[];
}

// ─── What GPT-4o extracts from the user's prompt ───
export interface ParsedIntent {
  workflowType: WorkflowType;
  source: string; // Raw source string from GPT (e.g. "Notion", "Downloads folder")
  sourceType: SourceType; // Normalized source type
  topic: string;
  confidence: number;
}

// ─── Drag-drop context from the frontend ───
export interface ContextItem {
  id: string;
  title: string;
  source: "notion" | "local";
  icon?: string;
  iconType?: "emoji" | "external";
}

export interface ContextPayload {
  source?: string;
  items: ContextItem[];
}

// ─── Success response from POST /api/workflow/start ───
export interface StartResponse {
  success: true;
  intent: ParsedIntent;
  workflow: WorkflowTemplate;
}

// ─── Error response ───
export interface ErrorResponse {
  success: false;
  error: string;
  code: "PARSE_FAILED" | "INVALID_INPUT" | "OPENAI_ERROR" | "UNKNOWN";
}

// ─── Request to POST /api/workflow/process (LLM cleanup) ───
export interface ProcessRequest {
  content: string; // Raw notes content pasted by the user
  type: "cleanup" | "flashcard_format" | "quiz_format" | "revision_schedule";
}

// ─── Response from POST /api/workflow/process ───
export interface ProcessResponse {
  success: true;
  processed: string; // Cleaned/formatted content
}

// ─── Execution UI types (pipeline view) ───
export type ExecutionStageStatus = "completed" | "current" | "pending" | "failed";

export interface WorkflowStage {
  id: string;
  title: string;
  description?: string;
  command?: string;
  status: ExecutionStageStatus;
  duration?: string;
}

export interface WorkflowExecution {
  id: string;
  name: string;
  progress: number;
  stages: WorkflowStage[];
}
