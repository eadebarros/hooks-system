"use client";

import { useState } from "react";
import type { AuditResult, CheckStatus } from "@/lib/auditor";
import { ScoreBadge } from "./ScoreBadge";

const STATUS: Record<CheckStatus, { icon: string; cls: string }> = {
  PASSED: { icon: "✓", cls: "text-green-700 bg-green-50" },
  WARNING: { icon: "!", cls: "text-amber-700 bg-amber-50" },
  FAILED: { icon: "✕", cls: "text-red-700 bg-red-50" },
};

const ALERT = {
  red: "border-red-300 bg-red-50 text-red-900",
  yellow: "border-amber-300 bg-amber-50 text-amber-900",
  green: "border-green-300 bg-green-50 text-green-900",
};
const ALERT_DOT = { red: "🔴", yellow: "🟡", green: "🟢" };

const LABELS = {
  delay_check: "Atraso",
  confusion_check: "Confusão",
  irrelevance_check: "Irrelevância",
  disinterest_check: "Desinteresse",
} as const;

const PATTERN = { tres_passos: "Fórmula de 3 passos", xyz: "Quer X? Não faça Y, faça Z" };

const READING = { "6th_grade": "6º ano", high_school: "ensino médio", college: "complexa" };

export function AuditPanel({ audit, compact = false }: { audit: AuditResult; compact?: boolean }) {
  const [showJson, setShowJson] = useState(false);
  const { overall_score, checks, timing } = audit.audit_results;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <ScoreBadge score={overall_score} size="lg" />
        <div>
          <p className="font-semibold">Score do Hook</p>
          <p className="text-sm text-stone-500">
            Leitura: {READING[checks.confusion_check.reading_level]} · Densidade de “você”:{" "}
            {checks.irrelevance_check.second_person_density}
          </p>
          <p className="text-sm text-stone-500">
            Falado: hook ≈ {timing.hook_seconds}s · introdução ≈ {timing.intro_seconds}s
            {checks.disinterest_check.hook_pattern && ` · ${PATTERN[checks.disinterest_check.hook_pattern]}`}
          </p>
        </div>
      </div>

      {audit.alerts.length > 0 && (
        <ul className="space-y-2">
          {audit.alerts.map((a, i) => (
            <li key={i} className={`rounded-lg border px-3 py-2 text-sm ${ALERT[a.level]}`}>
              <span className="font-semibold">
                {ALERT_DOT[a.level]} {a.title}
              </span>
              <span className="block opacity-80">{a.detail}</span>
            </li>
          ))}
        </ul>
      )}

      <ul className="divide-y divide-stone-100 rounded-lg border border-stone-200 bg-white">
        {(Object.keys(LABELS) as (keyof typeof LABELS)[]).map((key) => {
          const c = checks[key];
          const s = STATUS[c.status];
          return (
            <li key={key} className="flex gap-3 px-3 py-2.5">
              <span
                className={`mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${s.cls}`}
              >
                {s.icon}
              </span>
              <div className="min-w-0 flex-1">
                <p className="flex justify-between text-sm font-medium">
                  {LABELS[key]}
                  <span className="tabular-nums text-stone-400">{c.score}/25</span>
                </p>
                <p className="text-sm text-stone-600">{c.message}</p>
              </div>
            </li>
          );
        })}
      </ul>

      {!compact && (
        <>
          <button onClick={() => setShowJson((v) => !v)} className="text-xs text-stone-500 underline">
            {showJson ? "Ocultar" : "Ver"} JSON da auditoria
          </button>
          {showJson && (
            <pre className="max-h-72 overflow-auto rounded-lg bg-stone-900 p-3 text-xs text-stone-100">
              {JSON.stringify({ audit_results: audit.audit_results }, null, 2)}
            </pre>
          )}
        </>
      )}
    </div>
  );
}
