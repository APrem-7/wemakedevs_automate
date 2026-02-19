import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
// ─── Workflows table ───
export const workflows = sqliteTable("workflows", {
  id: text("id").primaryKey(), // UUID
  type: text("type").notNull(), // WorkflowType
  topic: text("topic").notNull(),
  source: text("source").notNull(), // "Notion", "Downloads folder", etc.
  sourceType: text("source_type").notNull(), // SourceType
  status: text("status")
    .notNull() // WorkflowStatus
    .default("preview"),
  steps: text("steps", { mode: "json" }) // JSON array of WorkflowStep[]
    .notNull(),
  outputLink: text("output_link"), // NotebookLM share link (nullable)
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
  completedAt: integer("completed_at", { mode: "timestamp" }),
});
// ─── Revision schedules table ───
export const revisionSchedules = sqliteTable("revision_schedules", {
  id: text("id").primaryKey(), // UUID
  workflowId: text("workflow_id")
    .notNull()
    .references(() => workflows.id),
  topic: text("topic").notNull(),
  events: text("events", { mode: "json" }) // JSON array of calendar events
    .notNull(),
  nextReview: integer("next_review", { mode: "timestamp" }),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});
