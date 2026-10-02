"use client";

import { useDeferredValue, useMemo } from "react";
import { auditScript } from "@/lib/auditor";
import type { LockInLine } from "@/lib/db/schema";
import { FUNNEL_STAGES, LOCKIN_LINE_TYPES } from "@/lib/methodology";
import { introText } from "@/lib/script-text";
import { AuditPanel } from "./AuditPanel";
import { HighlightLegend, HighlightedText } from "./HighlightedText";
import { Field, inputCls } from "./ui";

export interface EditorValue {
  title: string;
  audience: string;
  funnelStage: "TOFU" | "MOFU" | "BOFU";
  painPoint: string;
  solution: string;
  hook: string;
  lockIn: LockInLine[];
  body: string;
  onScreenText: string;
  visualHook: string;
  rationale: string;
  status: "draft" | "approved";
}

export const EMPTY_SCRIPT: EditorValue = {
  title: "",
  audience: "",
  funnelStage: "TOFU",
  painPoint: "",
  solution: "",
  hook: "",
  lockIn: [{ formula: "prova_concreta", text: "" }],
  body: "",
  onScreenText: "",
  visualHook: "",
  rationale: "",
  status: "draft",
};

export function useAudit(value: Pick<EditorValue, "hook" | "lockIn">) {
  const text = useDeferredValue(introText(value));
  return { text, audit: useMemo(() => auditScript(text), [text]) };
}

export function ScriptEditor({
  value,
  onChange,
  actions,
}: {
  value: EditorValue;
  onChange: (v: EditorValue) => void;
  actions?: React.ReactNode;
}) {
  const { text, audit } = useAudit(value);
  const set = <K extends keyof EditorValue>(k: K, v: EditorValue[K]) => onChange({ ...value, [k]: v });
  const setLine = (i: number, patch: Partial<LockInLine>) =>
    set(
      "lockIn",
      value.lockIn.map((l, j) => (j === i ? { ...l, ...patch } : l)),
    );

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
      <div className="space-y-5">
        <Field label="Título interno">
          <input className={inputCls} value={value.title} onChange={(e) => set("title", e.target.value)} placeholder="Ex.: Simples Nacional caro · TOFU · v1" />
        </Field>

        <section className="rounded-xl border border-stone-200 bg-white p-4">
          <div className="mb-2 flex items-baseline justify-between">
            <h3 className="font-semibold">Hook</h3>
            <span className="text-xs text-stone-400">1 frase ou 2 curtas · 0–3s</span>
          </div>
          <textarea
            className={`${inputCls} min-h-20 text-lg`}
            value={value.hook}
            onChange={(e) => set("hook", e.target.value)}
            placeholder="Se você é dono de clínica no Simples Nacional, pode estar pagando imposto demais todo mês."
          />
        </section>

        <section className="rounded-xl border border-stone-200 bg-white p-4">
          <div className="mb-2 flex items-baseline justify-between">
            <h3 className="font-semibold">Lock-In Zone</h3>
            <span className="text-xs text-stone-400">até 3 frases após o hook · 3–8s</span>
          </div>
          <div className="space-y-3">
            {value.lockIn.map((line, i) => (
              <div key={i} className="space-y-1.5">
                <div className="flex gap-2">
                  <select
                    className={`${inputCls} w-auto text-sm`}
                    value={line.formula}
                    onChange={(e) => setLine(i, { formula: e.target.value })}
                  >
                    {LOCKIN_LINE_TYPES.map((f) => (
                      <option key={f.id} value={f.id}>
                        {"number" in f ? `${f.number}. ${f.name}` : f.name}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => set("lockIn", value.lockIn.filter((_, j) => j !== i))}
                    className="ml-auto text-sm text-stone-400 hover:text-red-600"
                  >
                    remover
                  </button>
                </div>
                <textarea className={`${inputCls} min-h-16`} value={line.text} onChange={(e) => setLine(i, { text: e.target.value })} />
              </div>
            ))}
            {value.lockIn.length < 3 && (
              <button
                type="button"
                onClick={() => set("lockIn", [...value.lockIn, { formula: "objecao", text: "" }])}
                className="text-sm font-medium text-brand-600 hover:text-brand-700"
              >
                + adicionar frase de Lock-In
              </button>
            )}
          </div>
        </section>

        <section className="rounded-xl border border-stone-200 bg-white p-4">
          <h3 className="mb-1 font-semibold">Pré-visualização auditada</h3>
          <div className="mb-3">
            <HighlightLegend />
          </div>
          {text ? (
            <HighlightedText text={text} highlights={audit.highlights} />
          ) : (
            <p className="text-sm text-stone-400">Escreva o hook para ver a análise.</p>
          )}
        </section>

        <Field label="Corpo do roteiro (opcional)" hint="Entra no teleprompter e na exportação depois da introdução.">
          <textarea className={`${inputCls} min-h-32`} value={value.body} onChange={(e) => set("body", e.target.value)} />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Texto na tela (text hook)">
            <input className={inputCls} value={value.onScreenText} onChange={(e) => set("onScreenText", e.target.value)} />
          </Field>
          <Field label="Hook visual">
            <input className={inputCls} value={value.visualHook} onChange={(e) => set("visualHook", e.target.value)} />
          </Field>
        </div>

        <details className="rounded-xl border border-stone-200 bg-white p-4">
          <summary className="cursor-pointer font-semibold">Contexto (público e funil)</summary>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Field label="Público-alvo">
              <input className={inputCls} value={value.audience} onChange={(e) => set("audience", e.target.value)} />
            </Field>
            <Field label="Estágio do funil">
              <select className={inputCls} value={value.funnelStage} onChange={(e) => set("funnelStage", e.target.value as EditorValue["funnelStage"])}>
                {FUNNEL_STAGES.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.label}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Dor principal">
              <input className={inputCls} value={value.painPoint} onChange={(e) => set("painPoint", e.target.value)} />
            </Field>
            <Field label="Solução / promessa">
              <input className={inputCls} value={value.solution} onChange={(e) => set("solution", e.target.value)} />
            </Field>
          </div>
        </details>
      </div>

      <aside className="space-y-4 lg:sticky lg:top-6 lg:self-start">
        {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
        <AuditPanel audit={audit} />
      </aside>
    </div>
  );
}
