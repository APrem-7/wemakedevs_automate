// app/api/workflow/start/route.ts
// POST /api/workflow/start
//
// Receives a prompt + optional context, resolves intent (rules → LLM fallback),
// looks up workflow template, populates it, saves to DB with status "preview",
// and returns the workflow + workflowId.
//
// Request:  { "prompt": "Generate flashcards for OS", "context": { items: [...] } }
// Response: { "success": true, "intent": {...}, "workflow": {...}, "workflowId": "..." }

import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { resolveIntent } from "@/lib/intentRouter";
import {
  getWorkflowTemplate,
  getAvailableWorkflows,
} from "@/lib/workflows/registry";
import { populateWorkflow } from "@/lib/instructionGenerator";
import { db } from "@/lib/db";
import { workflows } from "@/lib/db/schema";
import type {
  ErrorResponse,
  ContextPayload,
} from "@/lib/types";

export async function POST(request: NextRequest) {
  let body: { prompt?: string; context?: ContextPayload };

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

  const { prompt, context } = body;

  if (!prompt || typeof prompt !== "string" || prompt.trim().length === 0) {
    const error: ErrorResponse = {
      success: false,
      error: "Missing or empty 'prompt' in request body.",
      code: "INVALID_INPUT",
    };
    return NextResponse.json(error, { status: 400 });
  }

  try {
    // Resolve intent (rule-based fast path → LLM fallback)
    const intent = await resolveIntent(prompt.trim(), context);

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

    // Persist to DB with status "preview"
    const workflowId = randomUUID();
    db.insert(workflows).values({
      id: workflowId,
      type: intent.workflowType,
      topic: intent.topic,
      source: intent.source,
      sourceType: intent.sourceType,
      status: "preview",
      steps: JSON.stringify(workflow.steps),
    }).run();

    return NextResponse.json({
      success: true,
      intent,
      workflow,
      workflowId,
    });
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

