// lib/intentRouter.ts
// Hybrid intent router: tries fast rule-based matching first,
// falls back to OpenAI function calling when rules can't determine intent.
//
// resolveIntent() is the primary entry point — always returns ParsedIntent.
// parseIntent() is the LLM fallback — preserved unchanged.

import OpenAI from "openai";
import {
  ParsedIntent,
  WorkflowType,
  SourceType,
  ContextPayload,
} from "./types";

// OpenAI client (only created when LLM fallback is needed)

let _openai: OpenAI | null = null;

function getOpenAI(): OpenAI {
  if (!_openai) {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error(
        "OPENAI_API_KEY environment variable is required but not set. " +
        "Please set the OpenAI API key in your environment variables.",
      );
    }
    _openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  return _openai;
}

// RULE-BASED FAST PATH — instant, deterministic, no API cost(we save money yey)

// Study-context words that must appear alongside ambiguous keywords
const STUDY_CONTEXT = /\b(notes?|files?|docs?|pages?|material|chapter|lecture|course|class|subject|worksheet|slides?|pdf|textbook|book|study|studies|studying|learn|learning)\b/i;

const WORKFLOW_RULES: {
  pattern: RegExp;
  type: WorkflowType;
  confidence: number;
  requiresStudyContext?: boolean;
}[] = [
    // High-confidence, unambiguous keywords — always match
    {
      pattern: /\b(flash\s?cards?|anki|memory\s?cards?)\b/i,
      type: "flashcards",
      confidence: 0.95,
    },
    {
      pattern: /\b(summarize|summarise)\b/i,
      type: "summary",
      confidence: 0.9,
    },
    {
      pattern: /\b(podcast|tts|text\s?to\s?speech)\b/i,
      type: "audio",
      confidence: 0.9,
    },
    // Medium-confidence — require study context to avoid false positives
    {
      pattern: /\b(quiz(zes)?|practice\s?(questions?)?|mock\s+test(s)?|practice\s+test(s)?)\b/i,
      type: "quiz",
      confidence: 0.8,
    },
    {
      pattern: /\b(summary|summaries)\b/i,
      type: "summary",
      confidence: 0.85,
      requiresStudyContext: true,
    },
    {
      pattern: /\b(organize|organise|organizing|organising|structure|restructure)\b/i,
      type: "organize",
      confidence: 0.85,
      requiresStudyContext: true,
    },
    {
      pattern: /\b(audio)\b/i,
      type: "audio",
      confidence: 0.8,
      requiresStudyContext: true,
    },
    {
      pattern: /\b(revision|revise|revising|study\s?plan|study\s*schedule|exam\s*schedule|revision\s*schedule)\b/i,
      type: "revision",
      confidence: 0.85,
    },
    {
      pattern: /\b(exam(s)?)\b/i,
      type: "revision",
      confidence: 0.75,
      requiresStudyContext: true,
    },
  ];


// Classify by rule — checks study context for ambiguous keywords
function classifyByRules(
  text: string,
): { type: WorkflowType; confidence: number } | null {
  for (const rule of WORKFLOW_RULES) {
    if (rule.pattern.test(text)) {
      // If this rule requires study context, verify it exists in the prompt
      if (rule.requiresStudyContext && !STUDY_CONTEXT.test(text)) {
        continue; // Skip this rule — keyword matched but no study context
      }
      return { type: rule.type, confidence: rule.confidence };
    }
  }
  return null; // No match → use LLM
}


// Infer sourceType from drag-drop context

function inferSourceType(context?: ContextPayload): SourceType {
  if (!context?.items?.length) return "local_files";
  const hasNotion = context.items.some((item) => item.source === "notion");
  return hasNotion ? "notion" : "local_files";
}

// Infer human-readable source label

function inferSourceLabel(context?: ContextPayload): string {
  if (!context?.items?.length) return "Local files";
  const hasNotion = context.items.some((item) => item.source === "notion");
  return hasNotion ? "Notion" : "Local files";
}

// Extract topic from prompt (heuristic way) 

const FILLER_WORDS = new Set([
  "generate",
  "create",
  "make",
  "build",
  "do",
  "get",
  "give",
  "help",
  "me",
  "my",
  "the",
  "a",
  "an",
  "for",
  "from",
  "with",
  "in",
  "on",
  "of",
  "to",
  "and",
  "some",
  "please",
  "want",
  "need",
  "i",
]);

const WORKFLOW_KEYWORDS = new Set([
  "flashcard",
  "flashcards",
  "quiz",
  "quizzes",
  "summary",
  "summaries",
  "summarize",
  "organize",
  "audio",
  "podcast",
  "revision",
  "revise",
  "exam",
  "schedule",
]);

function extractTopic(prompt: string, context?: ContextPayload): string {
  // Prefer drag-drop context item titles when available
  if (context?.items?.length) {
    const titles = context.items.map((item) => item.title).filter(Boolean);
    if (titles.length > 0) {
      return titles.length === 1 ? titles[0] : titles.join(" & ");
    }
  }

  const words = prompt
    .replace(/[^\w\s]/g, "") // strip punctuation
    .split(/\s+/)
    .filter(
      (w) =>
        w.length > 0 &&
        !FILLER_WORDS.has(w.toLowerCase()) &&
        !WORKFLOW_KEYWORDS.has(w.toLowerCase()),
    );

  if (words.length === 0) return "Study Material";
  // Capitalize first letter of each remaining word
  return words.map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
}



// ═══════════════════════════════════════════════════════════════════════
// PRIMARY ENTRY POINT — tries rules first, else falls back to LLM
// ═══════════════════════════════════════════════════════════════════════

// Minimum confidence to accept a classification (below this → reject)
const CONFIDENCE_THRESHOLD = 0.4;

export async function resolveIntent(
  prompt: string,
  context?: ContextPayload,
): Promise<ParsedIntent> {
  const ruleMatch = classifyByRules(prompt);

  if (ruleMatch) {
    return {
      workflowType: ruleMatch.type,
      source: inferSourceLabel(context),
      sourceType: inferSourceType(context),
      topic: extractTopic(prompt, context),
      confidence: ruleMatch.confidence,
    };
  }

  // No rule match → fall back to LLM (OpenAI GPT-4o function calling)
  const llmResult = await parseIntent(prompt, context);

  // Reject if LLM says "none" or confidence is too low
  if (
    llmResult.workflowType === ("none" as WorkflowType) ||
    llmResult.confidence < CONFIDENCE_THRESHOLD
  ) {
    throw new Error(
      "I couldn't identify a study workflow from your request. " +
      "Try something like \"generate flashcards for OS\" or \"summarize my DBMS notes\".",
    );
  }

  return llmResult;
}

// ═══════════════════════════════════════════════════════════════════════
// LLM FALLBACK — GPT-4o function calling (unchanged from original)
// ═══════════════════════════════════════════════════════════════════════

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
            "none",
          ],
          description:
            '"flashcards" for flashcard/study card generation, ' +
            '"quiz" for practice quiz/test generation, ' +
            '"summary" for condensed study summary/guide, ' +
            '"organize" for organizing and structuring scattered notes, ' +
            '"audio" for audio overview/podcast-style study material, ' +
            '"revision" for creating a revision/review schedule with calendar events, ' +
            '"none" if the request is NOT related to studying, academics, or working with notes/study materials.',
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

Your job is to determine if a user's request is about studying or working with study materials, and if so, extract structured information.

Supported study workflows:
- "flashcards" — generating flashcards or study cards from notes
- "quiz" — creating practice quizzes or tests from study material
- "summary" — condensing notes into a study summary or guide
- "organize" — organizing or structuring scattered notes
- "audio" — generating audio overviews or podcast-style study material
- "revision" — creating a revision/review schedule or exam prep plan
- "none" — the request is NOT about studying, notes, or academics

Note sources:
- "local_files" — files on their computer (default if not mentioned)
- "notion" — Notion workspace
- "downloads" — Downloads folder

IMPORTANT RULES:
1. If the request is clearly NOT about studying, notes, or academic work, return workflow_type: "none" with confidence 0.1.
   Examples of non-study requests: "what is the meaning of life", "hello how are you", "tell me a joke", "what's the weather".
2. If the request is vaguely study-related but doesn't clearly map to a workflow, return your best guess but set confidence below 0.4.
3. Only set confidence above 0.7 if you are genuinely confident the user wants a specific study workflow.
4. Always call the parse_study_intent function.`;

export async function parseIntent(prompt: string, context?: ContextPayload): Promise<ParsedIntent> {
  const openai = getOpenAI();

  const impliedSourceLabel = inferSourceLabel(context);
  const impliedSourceType = inferSourceType(context);

  const enrichedPrompt = `User Request: ${prompt}

[System Context: Based on provided context/files, the expected source is "${impliedSourceLabel}" (source_type: "${impliedSourceType}") unless the user request explicitly overrides it.]`;

  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: enrichedPrompt },
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
  const VALID_WORKFLOW_TYPES = [
    "flashcards",
    "quiz",
    "summary",
    "organize",
    "audio",
    "revision",
    "none", // Allowed from LLM — rejected later by confidence check in resolveIntent
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
