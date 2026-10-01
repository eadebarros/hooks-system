import type { Highlight } from "@/lib/auditor";

export function HighlightedText({ text, highlights }: { text: string; highlights: Highlight[] }) {
  const parts: React.ReactNode[] = [];
  let cursor = 0;
  highlights.forEach((h, i) => {
    if (h.start > cursor) parts.push(text.slice(cursor, h.start));
    parts.push(
      <mark key={i} className={`hl hl-${h.kind}`} title={h.label}>
        {text.slice(h.start, h.end)}
      </mark>,
    );
    cursor = h.end;
  });
  parts.push(text.slice(cursor));
  return <p className="whitespace-pre-wrap leading-relaxed">{parts}</p>;
}

const LEGEND = [
  ["hl-delay", "Atraso"],
  ["hl-jargon", "Jargão"],
  ["hl-first_person", "Eu/meu"],
  ["hl-second_person", "Você/sua"],
  ["hl-lockin", "Fórmula Lock-In"],
] as const;

export function HighlightLegend() {
  return (
    <div className="flex flex-wrap gap-3 text-xs text-stone-500">
      {LEGEND.map(([cls, label]) => (
        <mark key={cls} className={`hl ${cls}`}>
          {label}
        </mark>
      ))}
    </div>
  );
}
