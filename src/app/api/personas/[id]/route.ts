import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db, schema } from "@/lib/db";

export async function DELETE(_req: Request, ctx: RouteContext<"/api/personas/[id]">) {
  const { id } = await ctx.params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) return NextResponse.json({ error: "Não encontrado." }, { status: 404 });
  await db().delete(schema.personas).where(eq(schema.personas.id, id));
  return new NextResponse(null, { status: 204 });
}
