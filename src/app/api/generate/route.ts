import { NextResponse } from "next/server";
import { claudeErrorResponse, missingKeyResponse } from "@/lib/claude";
import { db, schema } from "@/lib/db";
import { GenerateInputSchema, generateVariations } from "@/lib/generator";

export const maxDuration = 300;

export async function POST(req: Request) {
  const noKey = missingKeyResponse();
  if (noKey) return noKey;

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
    return claudeErrorResponse(err, "Erro inesperado ao gerar.");
  }
}
