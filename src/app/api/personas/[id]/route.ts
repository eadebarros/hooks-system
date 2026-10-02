import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db, schema } from "@/lib/db";
import { PersonaInputSchema, issues } from "@/lib/validation";

const UUID = /^[0-9a-f-]{36}$/i;

export async function PUT(req: Request, ctx: RouteContext<"/api/personas/[id]">) {
  const { id } = await ctx.params;
  if (!UUID.test(id)) return NextResponse.json({ error: "Não encontrado." }, { status: 404 });
  const parsed = PersonaInputSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: issues(parsed.error) }, { status: 400 });
  const [row] = await db()
    .update(schema.personas)
    .set({ ...parsed.data, updatedAt: new Date() })
    .where(eq(schema.personas.id, id))
    .returning();
  if (!row) return NextResponse.json({ error: "Não encontrado." }, { status: 404 });
  return NextResponse.json(row);
}

export async function DELETE(_req: Request, ctx: RouteContext<"/api/personas/[id]">) {
  const { id } = await ctx.params;
  if (!UUID.test(id)) return NextResponse.json({ error: "Não encontrado." }, { status: 404 });
  await db().delete(schema.personas).where(eq(schema.personas.id, id));
  return new NextResponse(null, { status: 204 });
}
