// app/api/workflow/process/route.ts
// POST /api/workflow/process
//
// LLM cleanup endpoint. Takes raw notes content and a processing type,
// sends to GPT-4o for formatting, returns cleaned content.
// Request:  { "content": "raw notes...", "type": "cleanup" }
// Response: { "success": true, "processed": "cleaned notes..." }

import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import type { ProcessRequest, ProcessResponse, ErrorResponse } from "@/lib/types";

const openai = new OpenAI();

const PROCESS_PROMPTS: Record<ProcessRequest["type"], string> = {
  cleanup: `You are a study notes formatter. The student has provided raw, messy notes.
Your job is to clean them up:
- Fix spelling and grammar errors
- Remove duplicates and redundant content
- Organize into clear sections with headings
- Preserve all factual content — do NOT add information that isn't there
- Use Markdown formatting for structure

Return ONLY the cleaned notes, no commentary.`,

  flashcard_format: `You are a study material formatter. The student wants to turn these notes into flashcard-ready content.
Your job is to restructure the content:
- Identify key concepts, definitions, and facts
- Organize into question-answer pairs where possible
- Group related concepts together
- Remove filler text and keep only study-relevant content
- Use Markdown formatting

Return ONLY the formatted content, no commentary.`,

  quiz_format: `You are a study material formatter. The student wants to turn these notes into quiz-ready content.
Your job is to restructure the content:
- Identify testable facts, concepts, and relationships
- Highlight key definitions and their explanations
- Note important distinctions and comparisons
- Remove filler text and keep only quiz-relevant content
- Use Markdown formatting

Return ONLY the formatted content, no commentary.`,

  revision_schedule: `You are a spaced-repetition study planner. The student has provided their study material or topic list.
Your job is to generate a revision schedule using spaced-repetition intervals (Day 1, Day 3, Day 7, Day 14, Day 30).

Analyze the content and:
- Break it into logical study topics/chunks
- Assign each topic a difficulty estimate (easy, medium, hard)
- Harder topics get more frequent review sessions
- Distribute sessions so no single day is overloaded
- Each session should be 30-60 minutes

Return ONLY valid JSON (no markdown fences, no commentary) in this exact format:
{
  "events": [
    {
      "day_offset": 1,
      "topic": "Topic name or chapter",
      "duration_minutes": 45,
      "difficulty": "medium",
      "session_type": "initial_review"
    },
    {
      "day_offset": 3,
      "topic": "Topic name or chapter",
      "duration_minutes": 30,
      "difficulty": "medium",
      "session_type": "spaced_review"
    }
  ],
  "total_sessions": 12,
  "estimated_days": 30
}

session_type must be one of: "initial_review", "spaced_review", "deep_dive", "practice_problems".
day_offset is the number of days from today (1 = tomorrow).`,
};

export async function POST(request: NextRequest) {
  let body: ProcessRequest;

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

  const { content, type } = body;

  if (!content || typeof content !== "string" || content.trim().length === 0) {
    const error: ErrorResponse = {
      success: false,
      error: "Missing or empty 'content' in request body.",
      code: "INVALID_INPUT",
    };
    return NextResponse.json(error, { status: 400 });
  }

  if (!type || !PROCESS_PROMPTS[type]) {
    const error: ErrorResponse = {
      success: false,
      error: `Invalid 'type'. Must be one of: ${Object.keys(PROCESS_PROMPTS).join(", ")}`,
      code: "INVALID_INPUT",
    };
    return NextResponse.json(error, { status: 400 });
  }

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: PROCESS_PROMPTS[type] },
        { role: "user", content: content.trim() },
      ],
      temperature: 0.3, // Low temperature for consistent formatting
    });

    const processed = response.choices[0]?.message?.content;

    if (!processed) {
      throw new Error("OpenAI returned empty response");
    }

    const result: ProcessResponse = {
      success: true,
      processed,
    };

    return NextResponse.json(result);
  } catch (err) {
    console.error("Error in /api/workflow/process:", err);

    const error: ErrorResponse = {
      success: false,
      error:
        err instanceof Error ? err.message : "An unexpected error occurred.",
      code: "OPENAI_ERROR",
    };
    return NextResponse.json(error, { status: 500 });
  }
}
