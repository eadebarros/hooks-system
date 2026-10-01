import type { LockInLine } from "./db/schema";

export interface ScriptDraft {
  title: string;
  hook: string;
  lockIn: LockInLine[];
  body: string;
  onScreenText?: string;
  visualHook?: string;
}

/** Introdução falada: hook + Lock-In Zone, na ordem em que serão ditos. */
export function introText(s: Pick<ScriptDraft, "hook" | "lockIn">) {
  return [s.hook, ...s.lockIn.map((l) => l.text)]
    .map((t) => t.trim())
    .filter(Boolean)
    .map((t) => (/[.!?…]$/.test(t) ? t : t + "."))
    .join(" ");
}

/** Texto completo para teleprompter e exportação. */
export function spokenText(s: Pick<ScriptDraft, "hook" | "lockIn" | "body">) {
  return [introText(s), s.body.trim()].filter(Boolean).join("\n\n");
}
