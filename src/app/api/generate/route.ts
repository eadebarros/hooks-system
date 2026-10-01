import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";
import { db, schema } from "@/lib/db";
import { GenerateInputSchema, GenerationError, generateVariations } from "@/lib/generator";

export const maxDuration = 300;

export async function POST(req: Request) {
  if (!process.env.ANTHROPIC_API_KEY && !process.env.ANTHROPIC_AUTH_TOKEN) {
    return NextResponse.json(
      { error: "ANTHROPIC_API_KEY não configurada no servidor." },
      { status: 500 },
    );
  }

  const parsed = GenerateInputSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues.map((i) => i.message).join(" ") },
      { status: 400 },
    );
  }

  try {
    const result = await generateVariations(parsed.data);

    // O histórico é opcional: uma falha no banco não deve perder a geração.
    if (process.env.DATABASE_URL) {
      await db()
        .insert(schema.generations)
        .values({
          model: result.model,
          input: parsed.data,
          output: result.variations,
          inputTokens: result.usage.input,
          outputTokens: result.usage.output,
        })
        .catch((err) => console.error("Falha ao salvar histórico:", err));
    }

    return NextResponse.json(result);
  } catch (err) {
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
    return NextResponse.json({ error: "Erro inesperado ao gerar." }, { status: 500 });
  }
}
