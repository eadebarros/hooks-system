"use client";

import { formulaById } from "./methodology";
import { spokenText, type ScriptDraft } from "./script-text";

type Exportable = ScriptDraft & { score?: number };

function slug(s: string) {
  return (
    s
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "") || "roteiro"
  );
}

function asText(s: Exportable) {
  const lines = [
    s.title,
    "",
    "HOOK (0–3s)",
    s.hook,
    "",
    "LOCK-IN ZONE (3–8s)",
    ...s.lockIn.map((l) => `[${formulaById(l.formula)?.name ?? l.formula}] ${l.text}`),
  ];
  if (s.body.trim()) lines.push("", "CORPO", s.body.trim());
  if (s.onScreenText) lines.push("", "TEXTO NA TELA", s.onScreenText);
  if (s.visualHook) lines.push("", "HOOK VISUAL", s.visualHook);
  if (typeof s.score === "number") lines.push("", `Score do Auditor: ${s.score}/100`);
  lines.push("", "— TEXTO CORRIDO PARA GRAVAÇÃO —", "", spokenText(s));
  return lines.join("\n");
}

export function downloadTxt(s: Exportable) {
  const blob = new Blob([asText(s)], { type: "text/plain;charset=utf-8" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `${slug(s.title)}.txt`;
  a.click();
  URL.revokeObjectURL(a.href);
}

export async function downloadPdf(s: Exportable) {
  const { jsPDF } = await import("jspdf");
  const pdf = new jsPDF({ unit: "pt", format: "a4" });
  const margin = 56;
  const width = pdf.internal.pageSize.getWidth() - margin * 2;
  const height = pdf.internal.pageSize.getHeight();
  let y = margin;

  const write = (text: string, size = 11, bold = false, gap = 6) => {
    pdf.setFont("helvetica", bold ? "bold" : "normal");
    pdf.setFontSize(size);
    for (const line of pdf.splitTextToSize(text, width) as string[]) {
      if (y > height - margin) {
        pdf.addPage();
        y = margin;
      }
      pdf.text(line, margin, y);
      y += size * 1.4;
    }
    y += gap;
  };

  write(s.title, 18, true, 12);
  if (typeof s.score === "number") write(`Score do Auditor: ${s.score}/100`, 9, false, 14);
  write("HOOK (0-3s)", 9, true, 2);
  write(s.hook, 14, false, 14);
  write("LOCK-IN ZONE (3-8s)", 9, true, 2);
  for (const l of s.lockIn) {
    write(formulaById(l.formula)?.name ?? l.formula, 8, true, 0);
    write(l.text, 12, false, 8);
  }
  if (s.body.trim()) {
    y += 6;
    write("CORPO", 9, true, 2);
    write(s.body.trim(), 12, false, 10);
  }
  if (s.onScreenText) {
    write("TEXTO NA TELA", 9, true, 2);
    write(s.onScreenText, 11, false, 10);
  }
  if (s.visualHook) {
    write("HOOK VISUAL", 9, true, 2);
    write(s.visualHook, 11, false, 10);
  }
  pdf.save(`${slug(s.title)}.pdf`);
}
