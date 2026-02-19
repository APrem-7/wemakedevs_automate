// lib/intentRouter.ts
// Uses OpenAI function calling to parse a natural language prompt
// into structured data (workflow type, source type, topic, confidence).

import OpenAI from "openai";
import { ParsedIntent, WorkflowType, SourceType } from "./types";

// Validate OpenAI API key before creating client
if (!process.env.OPENAI_API_KEY) {
  throw new Error(
    "OPENAI_API_KEY environment variable is required but not set. " +
      "Please set the OpenAI API key in your environment variables.",
  );
}

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Tool definition — tells GPT-4o the exact shape we want back
const PARSE_INTENT_TOOL: OpenAI.Chat.Completions.ChatCompletionTool = {
  type: "function",
  function: {
    name: "parse_study_intent",
    description:
      "Parse a student's natural language request into a structured study workflow intent. " +
      "Extract what type of study material they want, where their notes are, and what topic/subject it's about.",
    parameters: {
      type: "object",
      properties: {
        workflow_type: {
          type: "string",
          enum: [
            "flashcards",
            "quiz",
            "summary",
            "organize",
            "audio",
            "revision",
          ],
          description:
            '"flashcards" for flashcard/study card generation, ' +
            '"quiz" for practice quiz/test generation, ' +
            '"summary" for condensed study summary/guide, ' +
            '"organize" for organizing and structuring scattered notes, ' +
            '"audio" for audio overview/podcast-style study material, ' +
            '"revision" for creating a revision/review schedule with calendar events.',
        },
        source: {
          type: "string",
          description:
            'Where the notes are. Examples: "local files", "Notion", "Downloads folder". ' +
            'Default to "local files" if not specified.',
        },
        source_type: {
          type: "string",
          enum: ["notion", "local_files", "downloads"],
          description:
            'Normalized source type. "notion" if notes are in Notion, ' +
            '"local_files" if notes are on the local machine (Desktop, Documents, specific folder), ' +
            '"downloads" if notes are in the Downloads folder. ' +
            'Default to "local_files" if not specified.',
        },
        topic: {
          type: "string",
          description:
            'The subject or topic. Examples: "Operating Systems", "DBMS Chapter 5".',
        },
        confidence: {
          type: "number",
          description: "How confident you are in this parsing, 0.0 to 1.0.",
        },
      },
      required: [
        "workflow_type",
        "source",
        "source_type",
        "topic",
        "confidence",
      ],
    },
  },
};

const SYSTEM_PROMPT = `You are an intent parser for StudyEngine, an academic workflow automation tool.

Your job is to understand what a student wants to do with their study materials and extract structured information.

The student can:
- Generate flashcards from their notes (workflow_type: "flashcards")
- Generate practice quizzes from their notes (workflow_type: "quiz")
- Create condensed study summaries (workflow_type: "summary")
- Organize scattered notes into a structured format (workflow_type: "organize")
- Generate audio overviews / podcast-style study material (workflow_type: "audio")
- Create a revision/review schedule with calendar events (workflow_type: "revision")

Their notes can come from:
- Local files on their computer, e.g. Desktop, Documents folder (source_type: "local_files") — this is the default if not clearly mentioned
- Notion (source_type: "notion")
- Downloads folder specifically (source_type: "downloads")

Always call the parse_study_intent function with your best interpretation.
If the request is unclear or not study-related, still make your best guess but set confidence low.`;

export async function parseIntent(prompt: string): Promise<ParsedIntent> {
  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: prompt },
    ],
    tools: [PARSE_INTENT_TOOL],
    tool_choice: {
      type: "function",
      function: { name: "parse_study_intent" },
    },
  });

  const message = response.choices[0]?.message;
  const toolCall = message?.tool_calls?.[0];

  if (!toolCall || toolCall.type !== "function") {
    throw new Error("OpenAI did not return expected function call");
  }

  // Cast needed for OpenAI SDK v6 type quirk
  const fnCall = toolCall as {
    type: "function";
    function: { name: string; arguments: string };
  };

  let args: Record<string, unknown>;
  try {
    args = JSON.parse(fnCall.function.arguments);
  } catch {
    throw new Error(
      "Failed to parse GPT response — received malformed JSON from function call.",
    );
  }

  // Runtime validation — GPT might return values outside our allowed sets
  const VALID_WORKFLOW_TYPES: WorkflowType[] = [
    "flashcards",
    "quiz",
    "summary",
    "organize",
    "audio",
    "revision",
  ];
  const VALID_SOURCE_TYPES: SourceType[] = [
    "notion",
    "local_files",
    "downloads",
  ];

  const workflowType = args.workflow_type as string;
  const sourceType = args.source_type as string;

  if (!VALID_WORKFLOW_TYPES.includes(workflowType as WorkflowType)) {
    throw new Error(
      `GPT returned invalid workflow type "${workflowType}". Valid types: ${VALID_WORKFLOW_TYPES.join(", ")}`,
    );
  }

  if (!VALID_SOURCE_TYPES.includes(sourceType as SourceType)) {
    throw new Error(
      `GPT returned invalid source type "${sourceType}". Valid types: ${VALID_SOURCE_TYPES.join(", ")}`,
    );
  }

  return {
    workflowType: workflowType as WorkflowType,
    source: (args.source as string) || "Local files",
    sourceType: sourceType as SourceType,
    topic: (args.topic as string) || "Unknown Topic",
    confidence: typeof args.confidence === "number" ? args.confidence : 0.5,
  };
}
