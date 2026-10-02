import { z } from "zod";

export const ScriptInputSchema = z.object({
  title: z.string({ error: "Dê um título ao roteiro." }).trim().min(1, "Dê um título ao roteiro."),
  personaId: z.uuid().nullable().optional(), // ausente no PUT = mantém o ICP atual
  audience: z.string().default(""),
  funnelStage: z.enum(["TOFU", "MOFU", "BOFU"]).default("TOFU"),
  painPoint: z.string().default(""),
  solution: z.string().default(""),
  hook: z.string({ error: "O hook não pode ficar vazio." }).trim().min(1, "O hook não pode ficar vazio."),
  lockIn: z.array(z.object({ formula: z.string(), text: z.string() })).default([]),
  body: z.string().default(""),
  onScreenText: z.string().default(""),
  visualHook: z.string().default(""),
  rationale: z.string().default(""),
  score: z.number().int().min(0).max(100).default(0),
  status: z.enum(["draft", "approved"]).default("draft"),
});

export const ChatMessageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string().trim().min(1).max(8000),
});

export const PersonaInputSchema = z.object({
  name: z.string({ error: "Dê um nome ao ICP." }).trim().min(1, "Dê um nome ao ICP."),
  niche: z.string().default(""),
  audience: z.string({ error: "Descreva o público." }).trim().min(1, "Descreva o público."),
  painPoint: z.string().default(""),
  desires: z.string().default(""),
  solution: z.string().default(""),
  proof: z.string().default(""),
  methodName: z.string().default(""),
  objection: z.string().default(""),
  language: z.string().default(""),
  conversation: z.array(ChatMessageSchema).max(200).default([]),
});

export function issues(error: z.ZodError) {
  return error.issues.map((i) => i.message).join(" ");
}
