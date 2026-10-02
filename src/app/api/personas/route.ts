import { desc } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db, schema } from "@/lib/db";
import { PersonaInputSchema, issues } from "@/lib/validation";

export async function GET() {
  const rows = await db().select().from(schema.personas).orderBy(desc(schema.personas.updatedAt));
  return NextResponse.json(rows);
}

export async function POST(req: Request) {
  const parsed = PersonaInputSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: issues(parsed.error) }, { status: 400 });
  const [row] = await db().insert(schema.personas).values(parsed.data).returning();
  return NextResponse.json(row, { status: 201 });
}
