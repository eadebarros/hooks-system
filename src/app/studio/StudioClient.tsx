"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { HighlightedText } from "@/components/HighlightedText";
import { ScoreBadge } from "@/components/ScoreBadge";
import { Button, ButtonLink, Field, inputCls } from "@/components/ui";
import { auditScript } from "@/lib/auditor";
import type { Persona } from "@/lib/db/schema";
import {
  FUNNEL_STAGES,
  LOCKIN_FORMULAS,
  formulaById,
  leverById,
  type FunnelStage,
  type LockInFormulaId,
} from "@/lib/methodology";
import { introText } from "@/lib/script-text";

interface Variation {
  structure: "tres_passos" | "classica";
  lean_lever: string;
  hook: string;
  lock_in: { formula: string; text: string }[];
  on_screen_text: string;
  visual_hook: string;
  rationale: string;
}

const DEFAULT_PROFILE = {
  niche: "",
  audience: "",
  funnelStage: "TOFU" as FunnelStage,
  painPoint: "",
  desires: "",
  solution: "",
  language: "",
  proof: "",
  methodName: "",
  objection: "",
  notes: "",
};

export function StudioClient({ initialIcpId }: { initialIcpId?: string }) {
  const router = useRouter();
  const [profile, setProfile] = useState(DEFAULT_PROFILE);
  const [personaId, setPersonaId] = useState<string | null>(null);
  const [personasLoaded, setPersonasLoaded] = useState(false);
  const [formulas, setFormulas] = useState<LockInFormulaId[]>([]);
  const [count, setCount] = useState(3);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [variations, setVariations] = useState<Variation[]>([]);
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [savingIdx, setSavingIdx] = useState<number | null>(null);
  const [saved, setSaved] = useState<Set<number>>(new Set());

  useEffect(() => {
    fetch("/api/personas")
      .then((r) => (r.ok ? r.json() : []))
      .then((list: Persona[]) => {
        setPersonas(list);
        const initial = list.find((p) => p.id === initialIcpId);
        if (initial) loadPersona(initial);
      })
      .catch(() => {})
      .finally(() => setPersonasLoaded(true));
  }, [initialIcpId]);

  const set = (k: keyof typeof DEFAULT_PROFILE, v: string) => setProfile((p) => ({ ...p, [k]: v }));
  const toggleFormula = (id: LockInFormulaId) =>
    setFormulas((list) => (list.includes(id) ? list.filter((f) => f !== id) : [...list, id]));

  async function generate() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...profile, personaId, formulas, count }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Falha ao gerar.");
      setVariations(data.variations);
      setSaved(new Set());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Falha ao gerar.");
    } finally {
      setLoading(false);
    }
  }

  function loadPersona(p: Persona) {
    setPersonaId(p.id);
    setProfile((cur) => ({
      ...cur,
      niche: p.niche,
      audience: p.audience,
      painPoint: p.painPoint,
      desires: p.desires,
      solution: p.solution,
      language: p.language,
      proof: p.proof,
      methodName: p.methodName,
      objection: p.objection,
    }));
  }

  function selectPersona(id: string) {
    const p = personas.find((x) => x.id === id);
    if (p) loadPersona(p);
    else {
      setPersonaId(null);
      setProfile((cur) => ({ ...DEFAULT_PROFILE, funnelStage: cur.funnelStage, notes: cur.notes }));
    }
  }

  async function saveVariation(v: Variation, i: number, openAfter: boolean) {
    setSavingIdx(i);
    const lockIn = v.lock_in.map((l) => ({ formula: l.formula, text: l.text }));
    const score = auditScript(introText({ hook: v.hook, lockIn })).audit_results.overall_score;
    try {
      const res = await fetch("/api/scripts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: `${profile.funnelStage} · ${v.hook.slice(0, 60)}`,
          personaId,
          audience: profile.audience,
          funnelStage: profile.funnelStage,
          painPoint: profile.painPoint,
          solution: profile.solution,
          hook: v.hook,
          lockIn,
          onScreenText: v.on_screen_text,
          visualHook: v.visual_hook,
          rationale: `[${v.structure === "tres_passos" ? "3 passos" : "Clássica"} · ${leverById(v.lean_lever)?.name ?? v.lean_lever}] ${v.rationale}`,
          score,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Falha ao salvar.");
      if (openAfter) router.push(`/library/${data.id}`);
      else setSaved((cur) => new Set(cur).add(i));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Falha ao salvar.");
    } finally {
      setSavingIdx(null);
    }
  }

  return (
    <div className="grid gap-8 xl:grid-cols-[420px_minmax(0,1fr)]">
      {/* Módulo 1 — Profiler */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">1. Profiler de Público & Funil</h2>
        </div>

        {personasLoaded && personas.length === 0 ? (
          <div className="rounded-xl border border-dashed border-brand-500 bg-brand-50 p-4 text-sm text-brand-700">
            <p className="mb-2 font-medium">Nenhum ICP cadastrado ainda.</p>
            <p className="mb-3 text-stone-600">Defina o cliente ideal numa conversa com a IA e ele aparece aqui. Ou preencha o briefing à mão abaixo.</p>
            <ButtonLink href="/icp">Definir ICP</ButtonLink>
          </div>
        ) : (
          <Field label="Para qual ICP são estes hooks?">
            <div className="flex gap-2">
              <select className={inputCls} value={personaId ?? ""} onChange={(e) => selectPersona(e.target.value)}>
                <option value="">Sem ICP (preencher à mão)</option>
                {personas.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                    {p.niche ? ` · ${p.niche}` : ""}
                  </option>
                ))}
              </select>
              <ButtonLink href="/icp" variant="secondary" className="shrink-0">
                {personaId ? "Gerenciar" : "Novo ICP"}
              </ButtonLink>
            </div>
          </Field>
        )}
        {personaId && (
          <p className="-mt-2 text-xs text-stone-500">
            O briefing abaixo veio do ICP. Ajustes aqui valem só para esta geração; para mudar o ICP, edite em ICP.
          </p>
        )}

        <Field label="Público-alvo / ICP">
          <input className={inputCls} value={profile.audience} onChange={(e) => set("audience", e.target.value)} placeholder="Ex.: dono de clínica odontológica com 2 a 5 cadeiras" />
        </Field>

        <fieldset className="space-y-1.5">
          <legend className="text-sm font-medium text-stone-700">Estágio do funil</legend>
          <div className="grid grid-cols-3 gap-2">
            {FUNNEL_STAGES.map((s) => (
              <button
                key={s.id}
                type="button"
                title={s.focus}
                onClick={() => set("funnelStage", s.id)}
                className={`rounded-lg border px-2 py-2 text-sm font-medium ${
                  profile.funnelStage === s.id
                    ? "border-brand-500 bg-brand-50 text-brand-700"
                    : "border-stone-300 bg-white text-stone-600 hover:bg-stone-50"
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
          <p className="text-xs text-stone-500">{FUNNEL_STAGES.find((s) => s.id === profile.funnelStage)?.focus}</p>
        </fieldset>

        <Field label="Dor principal (pain point)">
          <textarea className={`${inputCls} min-h-16`} value={profile.painPoint} onChange={(e) => set("painPoint", e.target.value)} />
        </Field>
        <Field label="Solução / promessa">
          <textarea className={`${inputCls} min-h-16`} value={profile.solution} onChange={(e) => set("solution", e.target.value)} />
        </Field>

        <details className="rounded-xl border border-stone-200 bg-white p-4">
          <summary className="cursor-pointer text-sm font-semibold">Contexto do ICP</summary>
          <div className="mt-3 space-y-3">
            <Field label="Nicho">
              <input className={inputCls} value={profile.niche} onChange={(e) => set("niche", e.target.value)} placeholder="Ex.: odontologia, advocacia trabalhista" />
            </Field>
            <Field label="Desejos do público">
              <textarea className={`${inputCls} min-h-16`} value={profile.desires} onChange={(e) => set("desires", e.target.value)} />
            </Field>
            <Field label="Linguagem do público" hint="Palavras e expressões que o público usa. A IA escreve o hook com elas.">
              <textarea className={`${inputCls} min-h-16`} value={profile.language} onChange={(e) => set("language", e.target.value)} />
            </Field>
          </div>
        </details>

        <details className="rounded-xl border border-stone-200 bg-white p-4" open>
          <summary className="cursor-pointer text-sm font-semibold">Munição para a Lock-In Zone</summary>
          <div className="mt-3 space-y-3">
            <Field label="Dados de prova reais" hint="Números verificáveis. Sem isso, a IA não usa Prova Concreta (ou deixa [marcadores]).">
              <input className={inputCls} value={profile.proof} onChange={(e) => set("proof", e.target.value)} placeholder="Ex.: clínica parceira reduziu 28% de imposto em 60 dias" />
            </Field>
            <Field label="Nome do método (Magic Box)">
              <input className={inputCls} value={profile.methodName} onChange={(e) => set("methodName", e.target.value)} placeholder="Ex.: Método de Equiparação Fiscal Odonto" />
            </Field>
            <Field label="Principal objeção do público">
              <input className={inputCls} value={profile.objection} onChange={(e) => set("objection", e.target.value)} placeholder="Ex.: não entendo de contabilidade / não tenho tempo" />
            </Field>
            <Field label="Observações para a IA">
              <input className={inputCls} value={profile.notes} onChange={(e) => set("notes", e.target.value)} placeholder="Tom, palavras a evitar, oferta do workshop…" />
            </Field>
          </div>
        </details>

        <fieldset className="space-y-2">
          <legend className="text-sm font-medium text-stone-700">Fórmulas de Lock-In</legend>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setFormulas([])}
              className={`rounded-full border px-3 py-1 text-xs font-medium ${
                formulas.length === 0 ? "border-brand-500 bg-brand-50 text-brand-700" : "border-stone-300 bg-white text-stone-600"
              }`}
            >
              Automático
            </button>
            {LOCKIN_FORMULAS.map((f) => (
              <button
                key={f.id}
                type="button"
                title={f.whenToUse}
                onClick={() => toggleFormula(f.id)}
                className={`rounded-full border px-3 py-1 text-xs font-medium ${
                  formulas.includes(f.id) ? "border-green-600 bg-green-50 text-green-800" : "border-stone-300 bg-white text-stone-600"
                }`}
              >
                {f.number}. {f.name}
              </button>
            ))}
          </div>
        </fieldset>

        <div className="flex items-end gap-3">
          <Field label="Variações">
            <select className={`${inputCls} w-24`} value={count} onChange={(e) => setCount(Number(e.target.value))}>
              {[3, 4, 5].map((n) => (
                <option key={n}>{n}</option>
              ))}
            </select>
          </Field>
          <Button onClick={generate} disabled={loading} className="flex-1 py-2.5">
            {loading ? "Gerando…" : "Gerar introduções"}
          </Button>
        </div>
        {error && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-800">{error}</p>}
      </section>

      {/* Módulo 2 — Matriz de saída */}
      <section>
        <h2 className="mb-4 text-lg font-semibold">2. Matriz de saída</h2>
        {loading && (
          <div className="space-y-4">
            {Array.from({ length: count }).map((_, i) => (
              <div key={i} className="h-40 animate-pulse rounded-2xl bg-stone-200/60" />
            ))}
          </div>
        )}
        {!loading && variations.length === 0 && (
          <div className="rounded-2xl border border-dashed border-stone-300 p-10 text-center text-stone-500">
            Preencha o perfil e clique em <strong>Gerar introduções</strong>. Cada variação chega com o score do Auditor.
          </div>
        )}
        {!loading && (
          <div className="space-y-4">
            {variations.map((v, i) => {
              const lockIn = v.lock_in.map((l) => ({ formula: l.formula, text: l.text }));
              const text = introText({ hook: v.hook, lockIn });
              const audit = auditScript(text);
              const isSaved = saved.has(i);
              return (
                <article key={i} className="rounded-2xl border border-stone-200 bg-white p-5">
                  <div className="mb-3 flex items-start justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-xs font-semibold uppercase tracking-wider text-stone-400">Variação {i + 1}</p>
                      <span className="rounded-full bg-stone-100 px-2 py-0.5 text-[11px] font-medium text-stone-600">
                        {v.structure === "tres_passos" ? "3 passos" : "Clássica"}
                      </span>
                      {leverById(v.lean_lever) && (
                        <span className="rounded-full bg-brand-50 px-2 py-0.5 text-[11px] font-medium text-brand-700">
                          {leverById(v.lean_lever)!.name}
                        </span>
                      )}
                    </div>
                    <span className="flex items-center gap-2 text-xs text-stone-500">
                      Auditor <ScoreBadge score={audit.audit_results.overall_score} />
                    </span>
                  </div>
                  <p className="text-xs font-semibold uppercase text-brand-600">Hook · 0–3s</p>
                  <p className="mb-3 text-lg font-semibold leading-snug">{v.hook}</p>
                  <p className="text-xs font-semibold uppercase text-green-700">Lock-In Zone · 3–8s</p>
                  <ul className="mb-3 space-y-1.5">
                    {v.lock_in.map((l, j) => (
                      <li key={j}>
                        <span
                          className={`mr-2 rounded px-1.5 py-0.5 text-[11px] font-medium ${
                            l.formula === "interjeicao" ? "bg-amber-50 text-amber-800" : "bg-green-50 text-green-800"
                          }`}
                        >
                          {formulaById(l.formula)?.name ?? l.formula}
                        </span>
                        {l.text}
                      </li>
                    ))}
                  </ul>
                  <details className="mb-4 text-sm text-stone-600">
                    <summary className="cursor-pointer text-stone-500">Detalhes e análise</summary>
                    <div className="mt-2 space-y-2">
                      <p>
                        <strong>Texto na tela:</strong> {v.on_screen_text}
                      </p>
                      <p>
                        <strong>Hook visual:</strong> {v.visual_hook}
                      </p>
                      <p>
                        <strong>Por que funciona:</strong> {v.rationale}
                      </p>
                      <div className="rounded-lg bg-stone-50 p-3">
                        <HighlightedText text={text} highlights={audit.highlights} />
                      </div>
                      <ul className="list-inside list-disc">
                        {Object.values(audit.audit_results.checks).map((c, k) => (
                          <li key={k}>{c.message}</li>
                        ))}
                      </ul>
                    </div>
                  </details>
                  <div className="flex flex-wrap gap-2">
                    <Button onClick={() => saveVariation(v, i, true)} disabled={savingIdx !== null}>
                      Editar e aprovar
                    </Button>
                    <Button variant="secondary" onClick={() => saveVariation(v, i, false)} disabled={savingIdx !== null || isSaved}>
                      {isSaved ? "Salvo na biblioteca ✓" : "Salvar na biblioteca"}
                    </Button>
                    <Button variant="secondary" onClick={() => navigator.clipboard.writeText(text)}>
                      Copiar
                    </Button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
