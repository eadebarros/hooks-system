// Cliente do Claude compartilhado pelo Gerador e pela entrevista de ICP.
import "server-only";
import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";

export const MODEL = process.env.ANTHROPIC_MODEL || "claude-opus-5-5";

export const client = new Anthropic();

export class GenerationError extends Error {}

export function missingKeyResponse() {
  if (process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_AUTH_TOKEN) return null;
  return NextResponse.json({ error: "ANTHROPIC_API_KEY não configurada no servidor." }, { status: 500 });
}

export function claudeErrorResponse(err: unknown, fallback: string) {
  if (err instanceof GenerationError) {
    return NextResponse.json({ error: err.message }, { status: 422 });
  }
  if (err instanceof Anthropic.AuthenticationError) {
    return NextResponse.json({ error: "ANTHROPIC_API_KEY inválida ou ausente." }, { status: 500 });
  }
  if (err instanceof Anthropic.RateLimitError) {
    return NextResponse.json({ error: "Limite de uso da API atingido. Aguarde e tente novamente." }, { status: 429 });
  }
  if (err instanceof Anthropic.APIError) {
    console.error("Erro da API Anthropic:", err.status, err.message);
    return NextResponse.json({ error: `Erro da API (${err.status}).` }, { status: 502 });
  }
  console.error(err);
  return NextResponse.json({ error: fallback }, { status: 500 });
}
