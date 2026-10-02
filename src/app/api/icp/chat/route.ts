import { NextResponse } from "next/server";
import { claudeErrorResponse, missingKeyResponse } from "@/lib/claude";
import { IcpChatInputSchema, icpTurn } from "@/lib/icp";
import { issues } from "@/lib/validation";

export const maxDuration = 120;

export async function POST(req: Request) {
  const noKey = missingKeyResponse();
  if (noKey) return noKey;

  const parsed = IcpChatInputSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: issues(parsed.error) }, { status: 400 });

  try {
    return NextResponse.json(await icpTurn(parsed.data));
  } catch (err) {
    return claudeErrorResponse(err, "Erro inesperado na conversa.");
  }
}
