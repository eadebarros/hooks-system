import { desc } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db, schema } from "@/lib/db";
import { ScriptInputSchema, issues } from "@/lib/validation";

export async function GET() {
  const rows = await db().select().from(schema.scripts).orderBy(desc(schema.scripts.updatedAt));
  return NextResponse.json(rows);
}

export async function POST(req: Request) {
  const parsed = ScriptInputSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: issues(parsed.error) }, { status: 400 });
  const [row] = await db().insert(schema.scripts).values(parsed.data).returning();
  return NextResponse.json(row, { status: 201 });
}
