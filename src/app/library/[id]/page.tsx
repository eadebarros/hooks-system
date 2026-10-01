"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ScriptEditor, type EditorValue } from "@/components/ScriptEditor";
import { Button, ButtonLink } from "@/components/ui";
import { auditScript } from "@/lib/auditor";
import type { Script } from "@/lib/db/schema";
import { downloadPdf, downloadTxt } from "@/lib/export";
import { introText } from "@/lib/script-text";

function toEditor(s: Script): EditorValue {
  return {
    title: s.title,
    audience: s.audience,
    funnelStage: s.funnelStage as EditorValue["funnelStage"],
    painPoint: s.painPoint,
    solution: s.solution,
    hook: s.hook,
    lockIn: s.lockIn,
    body: s.body,
    onScreenText: s.onScreenText,
    visualHook: s.visualHook,
    rationale: s.rationale,
    status: s.status as EditorValue["status"],
  };
}

export default function ScriptPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [value, setValue] = useState<EditorValue | null>(null);
  const [savedJson, setSavedJson] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    fetch(`/api/scripts/${id}`)
      .then(async (r) => {
        const data = await r.json();
        if (!r.ok) throw new Error(data.error ?? "Roteiro não encontrado.");
        const v = toEditor(data);
        setValue(v);
        setSavedJson(JSON.stringify(v));
      })
      .catch((e) => setError(e.message));
  }, [id]);

  if (error && !value) {
    return (
      <div className="mx-auto max-w-xl rounded-xl bg-red-50 p-6 text-red-800">
        {error} <Link href="/library" className="underline">Voltar à biblioteca</Link>
      </div>
    );
  }
  if (!value) return <div className="mx-auto max-w-7xl animate-pulse text-stone-400">Carregando…</div>;

  const dirty = JSON.stringify(value) !== savedJson;
  const score = auditScript(introText(value)).audit_results.overall_score;

  async function save(patch: Partial<EditorValue> = {}) {
    const next = { ...value!, ...patch };
    setBusy(true);
    setError("");
    try {
      const res = await fetch(`/api/scripts/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...next,
          lockIn: next.lockIn.filter((l) => l.text.trim()),
          score: auditScript(introText(next)).audit_results.overall_score,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Falha ao salvar.");
      const v = toEditor(data);
      setValue(v);
      setSavedJson(JSON.stringify(v));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Falha ao salvar.");
    } finally {
      setBusy(false);
    }
  }

  async function remove() {
    if (!window.confirm("Excluir este roteiro da biblioteca?")) return;
    await fetch(`/api/scripts/${id}`, { method: "DELETE" });
    router.push("/library");
    router.refresh();
  }

  const exportable = { ...value, score };

  return (
    <div className="mx-auto max-w-7xl">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link href="/library" className="text-sm text-stone-500 hover:text-stone-800">
            ← Biblioteca
          </Link>
          <h1 className="text-2xl font-bold tracking-tight">{value.title || "Roteiro sem título"}</h1>
          <p className="text-sm text-stone-500">
            {value.status === "approved" ? "✓ Aprovado para gravação" : "Rascunho"}
            {dirty && " · alterações não salvas"}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <ButtonLink href={`/teleprompter/${id}`} variant="secondary">
            ▶ Teleprompter
          </ButtonLink>
          <Button variant="secondary" onClick={() => downloadTxt(exportable)}>
            TXT
          </Button>
          <Button variant="secondary" onClick={() => downloadPdf(exportable)}>
            PDF
          </Button>
          <Button variant="danger" onClick={remove}>
            Excluir
          </Button>
        </div>
      </div>

      {error && <p className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-800">{error}</p>}
      {value.rationale && (
        <p className="mb-6 rounded-xl bg-stone-100 p-4 text-sm text-stone-700">
          <strong>Por que funciona:</strong> {value.rationale}
        </p>
      )}

      <ScriptEditor
        value={value}
        onChange={setValue}
        actions={
          <>
            <Button onClick={() => save()} disabled={busy || !dirty}>
              {busy ? "Salvando…" : "Salvar"}
            </Button>
            {value.status === "approved" ? (
              <Button variant="secondary" onClick={() => save({ status: "draft" })} disabled={busy}>
                Voltar para rascunho
              </Button>
            ) : (
              <Button variant="secondary" onClick={() => save({ status: "approved" })} disabled={busy}>
                ✓ Aprovar roteiro
              </Button>
            )}
          </>
        }
      />
    </div>
  );
}
