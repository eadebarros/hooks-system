"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { HighlightedText } from "@/components/HighlightedText";
import { ScoreBadge } from "@/components/ScoreBadge";
import { Button, Field, inputCls } from "@/components/ui";
import { auditScript } from "@/lib/auditor";
import type { Persona } from "@/lib/db/schema";
import { FUNNEL_STAGES, LOCKIN_FORMULAS, formulaById, type FunnelStage, type LockInFormulaId } from "@/lib/methodology";
import { introText } from "@/lib/script-text";

interface Variation {
  hook: string;
  lock_in: { formula: string; text: string }[];
  on_screen_text: string;
  visual_hook: string;
  rationale: string;
}

const DEFAULT_PROFILE = {
  audience: "Dono de clínica odontológica no Brasil",
  funnelStage: "TOFU" as FunnelStage,
  painPoint: "Impostos altos no Simples Nacional e falta de margem de lucro",
  solution: "Reestruturação fiscal legal e planejamento tributário para clínicas",
  proof: "",
  methodName: "",
  objection: "",
  notes: "",
};

export function StudioClient() {
  const router = useRouter();
  const [profile, setProfile] = useState(DEFAULT_PROFILE);
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
      .then(setPersonas)
      .catch(() => {});
  }, []);

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
        body: JSON.stringify({ ...profile, formulas, count }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Falha ao gerar.");
      setVariations(data.variations);
      setSaved(new Set());
      setSaved(new Set());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Falha ao gerar.");
    } finally {
      setLoading(false);
    }
  }

  async function savePersona() {
    const name = window.prompt("Nome da persona:", profile.audience.slice(0, 40));
    if (!name) return;
    const res = await fetch("/api/personas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, ...profile }),
    });
    if (res.ok) {
      const p = await res.json();
      setPersonas((list) => [p, ...list]);
    } else {
      setError((await res.json()).error ?? "Não foi possível salvar a persona.");
    }
  }

  function loadPersona(id: string) {
    const p = personas.find((x) => x.id === id);
    if (!p) return;
    setProfile((cur) => ({
      ...cur,
      audience: p.audience,
      painPoint: p.painPoint,
      solution: p.solution,
      proof: p.proof,
      methodName: p.methodName,
      objection: p.objection,
    }));
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
          audience: profile.audience,
          funnelStage: profile.funnelStage,
          painPoint: profile.painPoint,
          solution: profile.solution,
          hook: v.hook,
          lockIn,
          onScreenText: v.on_screen_text,
          visualHook: v.visual_hook,
          rationale: v.rationale,
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

        {personas.length > 0 && (
          <Field label="Carregar persona salva">
            <select className={inputCls} defaultValue="" onChange={(e) => loadPersona(e.target.value)}>
              <option value="" disabled>
                Selecione…
              </option>
              {personas.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </Field>
        )}

        <Field label="Público-alvo / persona">
          <input className={inputCls} value={profile.audience} onChange={(e) => set("audience", e.target.value)} />
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
        <button type="button" onClick={savePersona} className="text-sm text-stone-500 underline hover:text-stone-800">
          Salvar este perfil como persona
        </button>
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
                    <p className="text-xs font-semibold uppercase tracking-wider text-stone-400">Variação {i + 1}</p>
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
                        <span className="mr-2 rounded bg-green-50 px-1.5 py-0.5 text-[11px] font-medium text-green-800">
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
