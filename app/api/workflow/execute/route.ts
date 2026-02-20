// app/api/workflow/execute/route.ts
// POST /api/workflow/execute
//
// Starts or advances workflow execution.
// Updates workflow status from "preview" → "running" on first call.
// Returns the current step's execution instruction via the Accomplish bridge.
//
// Request:  { "workflowId": "uuid", "stepId": 1 }
// Response: { "success": true, "step": { instruction, action, stepId, stepName } }

import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { workflows } from "@/lib/db/schema";
import { executeStep } from "@/lib/accomplish/bridge";
import type { WorkflowStep, ErrorResponse, WorkflowType } from "@/lib/types";

export async function POST(request: NextRequest) {
    let body: { workflowId?: string; stepId?: number };

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

    const { workflowId, stepId } = body;

    if (!workflowId || typeof workflowId !== "string") {
        const error: ErrorResponse = {
            success: false,
            error: "Missing or invalid 'workflowId'.",
            code: "INVALID_INPUT",
        };
        return NextResponse.json(error, { status: 400 });
    }

    if (typeof stepId !== "number" || stepId < 1) {
        const error: ErrorResponse = {
            success: false,
            error: "Missing or invalid 'stepId' (must be a positive number).",
            code: "INVALID_INPUT",
        };
        return NextResponse.json(error, { status: 400 });
    }

    try {
        // Look up workflow from DB
        const row = db
            .select()
            .from(workflows)
            .where(eq(workflows.id, workflowId))
            .get();

        if (!row) {
            const error: ErrorResponse = {
                success: false,
                error: `Workflow "${workflowId}" not found.`,
                code: "PARSE_FAILED",
            };
            return NextResponse.json(error, { status: 404 });
        }

        // Update status from "preview" → "running" on first execution
        if (row.status === "preview") {
            db.update(workflows)
                .set({ status: "running" })
                .where(eq(workflows.id, workflowId))
                .run();
        }

        // Parse steps and find the requested step
        const steps = JSON.parse(row.steps as string) as WorkflowStep[];
        const step = steps.find((s) => s.id === stepId);

        if (!step) {
            const error: ErrorResponse = {
                success: false,
                error: `Step ${stepId} not found in workflow.`,
                code: "PARSE_FAILED",
            };
            return NextResponse.json(error, { status: 404 });
        }

        // Execute through Accomplish bridge
        const intent = {
            workflowType: row.type as WorkflowType,
            source: row.source,
            sourceType: row.sourceType as "notion" | "local_files" | "downloads",
            topic: row.topic,
            confidence: 1.0,
        };

        const result = executeStep(step, intent);

        return NextResponse.json({
            success: true,
            step: result,
        });
    } catch (err) {
        console.error("Error in /api/workflow/execute:", err);

        const error: ErrorResponse = {
            success: false,
            error:
                err instanceof Error ? err.message : "An unexpected error occurred.",
            code: "UNKNOWN",
        };
        return NextResponse.json(error, { status: 500 });
    }
}
