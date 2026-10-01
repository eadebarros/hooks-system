"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { EMPTY_SCRIPT, ScriptEditor, type EditorValue } from "@/components/ScriptEditor";
import { Button, PageHeader } from "@/components/ui";
import { auditScript } from "@/lib/auditor";
import { introText } from "@/lib/script-text";

const SAMPLE: EditorValue = {
  ...EMPTY_SCRIPT,
  title: "Exemplo · Simples Nacional",
  hook: "Olá doutor, tudo bem? Meu nome é Carlos e eu ajudei mais de 100 clínicas com a contabilidade.",
  lockIn: [{ formula: "transformacao", text: "Hoje vou falar sobre impostos." }],
};

export default function AuditorPage() {
  const router = useRouter();
  const [value, setValue] = useState<EditorValue>(EMPTY_SCRIPT);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function save() {
    setSaving(true);
    setError("");
    try {
      const score = auditScript(introText(value)).audit_results.overall_score;
      const res = await fetch("/api/scripts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...value,
          title: value.title || value.hook.slice(0, 60),
          lockIn: value.lockIn.filter((l) => l.text.trim()),
          score,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Falha ao salvar.");
      router.push(`/library/${data.id}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Falha ao salvar.");
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader
        title="Auditor de Hook em tempo real"
        subtitle="Escreva ou cole sua introdução. O score de 0 a 100 é recalculado a cada tecla, com base nos 4 erros fatais do hook."
      >
        <Button variant="secondary" onClick={() => setValue(SAMPLE)}>
          Carregar exemplo ruim
        </Button>
      </PageHeader>
      {error && <p className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-800">{error}</p>}
      <ScriptEditor
        value={value}
        onChange={setValue}
        actions={
          <Button onClick={save} disabled={saving || !value.hook.trim()}>
            {saving ? "Salvando…" : "Salvar na biblioteca"}
          </Button>
        }
      />
    </div>
  );
}
