"use client";

// app/workflow/[id]/page.tsx
// Workflow Execution page — renders the pipeline view for a given workflow ID.
// Currently uses mock data; ready for Zustand / API integration.

import { WorkflowExecutionView } from "@/components/workflow/WorkflowExecutionView";
import { MOCK_EXECUTION } from "@/lib/mock-execution";

export default function WorkflowPage() {
    // In production: fetch execution data by params.id from store or API
    // For now, use static mock data
    return <WorkflowExecutionView initialExecution={MOCK_EXECUTION} />;
}
