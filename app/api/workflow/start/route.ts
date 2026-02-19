// app/api/workflow/start/route.ts
// POST /api/workflow/start
//
// Receives a prompt, parses intent with GPT-4o, returns a populated workflow.
// Request:  { "prompt": "Generate flashcards for my OS course" }
// Response: { "success": true, "intent": {...}, "workflow": {...} }

import { NextRequest, NextResponse } from "next/server";
import { parseIntent } from "@/lib/intentRouter";
import { getWorkflowTemplate, getAvailableWorkflows } from "@/lib/workflows/registry";
import { populateWorkflow } from "@/lib/instructionGenerator";
import type { StartResponse, ErrorResponse } from "@/lib/types";

export async function POST(request: NextRequest) {
  let body: { prompt?: string };

  try {
    body = await request.json();
  } catch {
    const error: ErrorResponse = {
      success: false,
      error: "Invalid JSON in request body.",
      code: "INVALID_INPUT",
    };
    return NextResponse.json(error, { status: 400 });
  }

  const { prompt } = body;

  if (!prompt || typeof prompt !== "string" || prompt.trim().length === 0) {
    const error: ErrorResponse = {
      success: false,
      error: "Missing or empty 'prompt' in request body.",
      code: "INVALID_INPUT",
    };
    return NextResponse.json(error, { status: 400 });
  }

  try {
    const intent = await parseIntent(prompt.trim());

    const template = getWorkflowTemplate(intent.workflowType);

    if (!template) {
      const error: ErrorResponse = {
        success: false,
        error: `Workflow type "${intent.workflowType}" is not yet supported. Available types: ${getAvailableWorkflows().join(", ")}.`,
        code: "PARSE_FAILED",
      };
      return NextResponse.json(error, { status: 400 });
    }

    const workflow = populateWorkflow(template, intent);

    const response: StartResponse = {
      success: true,
      intent,
      workflow,
    };

    return NextResponse.json(response);
    
  } catch (err) {
    console.error("Error in /api/workflow/start:", err);

    const error: ErrorResponse = {
      success: false,
      error:
        err instanceof Error ? err.message : "An unexpected error occurred.",
      code: "OPENAI_ERROR",
    };
    return NextResponse.json(error, { status: 500 });
  }
}
