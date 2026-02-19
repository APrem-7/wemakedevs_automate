import { defineConfig } from "drizzle-kit";
export default defineConfig({
  schema: "./lib/db/schema.ts",
  out: "./drizzle", // migration files go here
  dialect: "sqlite",
  dbCredentials: {
    url: "./studyengine.db", // SQLite file at project root
  },
});
