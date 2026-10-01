import { scoreTone } from "@/lib/auditor";

const TONES = {
  good: "bg-green-100 text-green-800 ring-green-600/20",
  ok: "bg-amber-100 text-amber-800 ring-amber-600/20",
  bad: "bg-red-100 text-red-800 ring-red-600/20",
};

export function ScoreBadge({ score, size = "sm" }: { score: number; size?: "sm" | "lg" }) {
  const tone = TONES[scoreTone(score)];
  if (size === "lg") {
    return (
      <div className={`flex size-20 shrink-0 flex-col items-center justify-center rounded-full ring-4 ${tone}`}>
        <span className="text-2xl font-bold tabular-nums">{score}</span>
        <span className="text-[10px] uppercase tracking-wide opacity-70">/ 100</span>
      </div>
    );
  }
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold tabular-nums ring-1 ${tone}`}>
      {score}
    </span>
  );
}
