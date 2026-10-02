import { integer, jsonb, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export interface LockInLine {
  formula: string;
  text: string;
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

// ICP (perfil de cliente ideal). A tabela mantém o nome original "personas".
export const personas = pgTable("personas", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  niche: text("niche").notNull().default(""),
  audience: text("audience").notNull(),
  painPoint: text("pain_point").notNull().default(""),
  desires: text("desires").notNull().default(""),
  solution: text("solution").notNull().default(""),
  proof: text("proof").notNull().default(""),
  methodName: text("method_name").notNull().default(""),
  objection: text("objection").notNull().default(""),
  language: text("language").notNull().default(""),
  conversation: jsonb("conversation").$type<ChatMessage[]>().notNull().default([]),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const scripts = pgTable("scripts", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull(),
  personaId: uuid("persona_id").references(() => personas.id, { onDelete: "set null" }),
  audience: text("audience").notNull().default(""),
  funnelStage: text("funnel_stage").notNull().default("TOFU"),
  painPoint: text("pain_point").notNull().default(""),
  solution: text("solution").notNull().default(""),
  hook: text("hook").notNull(),
  lockIn: jsonb("lock_in").$type<LockInLine[]>().notNull().default([]),
  body: text("body").notNull().default(""),
  onScreenText: text("on_screen_text").notNull().default(""),
  visualHook: text("visual_hook").notNull().default(""),
  rationale: text("rationale").notNull().default(""),
  score: integer("score").notNull().default(0),
  status: text("status").notNull().default("draft"), // draft | approved
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const generations = pgTable("generations", {
  id: uuid("id").primaryKey().defaultRandom(),
  model: text("model").notNull(),
  input: jsonb("input").notNull(),
  output: jsonb("output").notNull(),
  inputTokens: integer("input_tokens"),
  outputTokens: integer("output_tokens"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type Script = typeof scripts.$inferSelect;
export type NewScript = typeof scripts.$inferInsert;
export type Persona = typeof personas.$inferSelect;
