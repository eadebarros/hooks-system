import { desc } from "drizzle-orm";
import Link from "next/link";
import { ScoreBadge } from "@/components/ScoreBadge";
import { ButtonLink, PageHeader } from "@/components/ui";
import { db, schema } from "@/lib/db";
import { FUNNEL_STAGES } from "@/lib/methodology";

export const dynamic = "force-dynamic";
export const metadata = { title: "Biblioteca · Hook & Lock-In Engine" };

export default async function LibraryPage({ searchParams }: PageProps<"/library">) {
  const { stage, status, q, icp } = (await searchParams) as Record<string, string | undefined>;

  let rows: (typeof schema.scripts.$inferSelect)[] = [];
  let personas: (typeof schema.personas.$inferSelect)[] = [];
  let dbError = "";
  try {
    [rows, personas] = await Promise.all([
      db().select().from(schema.scripts).orderBy(desc(schema.scripts.updatedAt)),
      db().select().from(schema.personas).orderBy(schema.personas.name),
    ]);
  } catch (e) {
    dbError = e instanceof Error ? e.message : "Erro ao acessar o banco.";
  }

  const term = q?.toLowerCase().trim();
  const filtered = rows.filter(
    (r) =>
      (!stage || r.funnelStage === stage) &&
      (!icp || r.personaId === icp) &&
      (!status || r.status === status) &&
      (!term || `${r.title} ${r.hook} ${r.audience}`.toLowerCase().includes(term)),
  );

  const chip = (active: boolean) =>
    `rounded-full border px-3 py-1 text-sm ${active ? "border-brand-500 bg-brand-50 text-brand-700" : "border-stone-200 bg-white text-stone-600 hover:border-stone-400"}`;
  const href = (patch: Record<string, string | undefined>) => {
    const p = new URLSearchParams(Object.entries({ stage, status, q, icp, ...patch }).filter(([, v]) => v) as [string, string][]);
    return `/library${p.size ? `?${p}` : ""}`;
  };

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader title="Biblioteca de roteiros" subtitle="Roteiros salvos pela equipe, prontos para reaproveitar, gravar e exportar.">
        <ButtonLink href="/studio">Gerar novos</ButtonLink>
      </PageHeader>

      <form className="mb-4" action="/library">
        {stage && <input type="hidden" name="stage" value={stage} />}
        {status && <input type="hidden" name="status" value={status} />}
        {icp && <input type="hidden" name="icp" value={icp} />}
        <input
          name="q"
          defaultValue={q}
          placeholder="Buscar por título, hook ou público…"
          className="w-full rounded-lg border border-stone-300 bg-white px-3 py-2"
        />
      </form>

      <div className="mb-6 flex flex-wrap gap-2">
        <Link href={href({ stage: undefined })} className={chip(!stage)}>
          Todos
        </Link>
        {FUNNEL_STAGES.map((s) => (
          <Link key={s.id} href={href({ stage: s.id })} className={chip(stage === s.id)}>
            {s.id}
          </Link>
        ))}
        <span className="mx-2 w-px bg-stone-200" />
        <Link href={href({ status: status === "approved" ? undefined : "approved" })} className={chip(status === "approved")}>
          Só aprovados
        </Link>
      </div>

      {personas.length > 0 && (
        <div className="-mt-3 mb-6 flex flex-wrap gap-2">
          <Link href={href({ icp: undefined })} className={chip(!icp)}>
            Todos os ICPs
          </Link>
          {personas.map((p) => (
            <Link key={p.id} href={href({ icp: p.id })} className={chip(icp === p.id)}>
              {p.name}
            </Link>
          ))}
        </div>
      )}

      {dbError && (
        <p className="rounded-lg bg-red-50 p-4 text-sm text-red-800">
          Não foi possível carregar a biblioteca: {dbError}
        </p>
      )}

      {!dbError && filtered.length === 0 && (
        <div className="rounded-2xl border border-dashed border-stone-300 p-10 text-center text-stone-500">
          Nenhum roteiro encontrado.
        </div>
      )}

      <ul className="space-y-3">
        {filtered.map((r) => (
          <li key={r.id}>
            <Link
              href={`/library/${r.id}`}
              className="flex items-start gap-4 rounded-xl border border-stone-200 bg-white p-4 hover:border-brand-500"
            >
              <ScoreBadge score={r.score} />
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">{r.title}</p>
                <p className="line-clamp-2 text-sm text-stone-600">{r.hook}</p>
                <p className="mt-1 text-xs text-stone-400">
                  {r.funnelStage} · {personas.find((p) => p.id === r.personaId)?.name ?? (r.audience || "sem público")} · {r.updatedAt.toLocaleDateString("pt-BR")}
                </p>
              </div>
              {r.status === "approved" && (
                <span className="shrink-0 rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800">Aprovado</span>
              )}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
