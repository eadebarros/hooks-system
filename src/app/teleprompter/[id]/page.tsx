"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import type { Script } from "@/lib/db/schema";
import { spokenText } from "@/lib/script-text";

const PREFS_KEY = "teleprompter-prefs";

export default function TeleprompterPage() {
  const { id } = useParams<{ id: string }>();
  const [script, setScript] = useState<Script | null>(null);
  const [error, setError] = useState("");
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(40); // px por segundo
  const [fontSize, setFontSize] = useState(56);
  const [mirror, setMirror] = useState(false);
  const scroller = useRef<HTMLDivElement>(null);
  const frame = useRef<number | null>(null);

  const [prefsLoaded, setPrefsLoaded] = useState(false);

  useEffect(() => {
    fetch(`/api/scripts/${id}`)
      .then(async (r) => {
        const data = await r.json();
        if (!r.ok) throw new Error(data.error ?? "Roteiro não encontrado.");
        // Preferências salvas são restauradas junto com o roteiro.
        try {
          const p = JSON.parse(localStorage.getItem(PREFS_KEY) ?? "{}");
          if (p.speed) setSpeed(p.speed);
          if (p.fontSize) setFontSize(p.fontSize);
          if (typeof p.mirror === "boolean") setMirror(p.mirror);
        } catch {}
        setPrefsLoaded(true);
        setScript(data);
      })
      .catch((e) => setError(e.message));
  }, [id]);

  useEffect(() => {
    if (!prefsLoaded) return;
    try {
      localStorage.setItem(PREFS_KEY, JSON.stringify({ speed, fontSize, mirror }));
    } catch {}
  }, [prefsLoaded, speed, fontSize, mirror]);

  // Rolagem contínua baseada no tempo, independente da taxa de quadros.
  useEffect(() => {
    if (!playing) return;
    let last = performance.now();
    let carry = 0;
    const tick = (now: number) => {
      const el = scroller.current;
      if (!el) return;
      carry += ((now - last) / 1000) * speed;
      last = now;
      const step = Math.floor(carry);
      if (step > 0) {
        el.scrollTop += step;
        carry -= step;
      }
      if (el.scrollTop + el.clientHeight >= el.scrollHeight - 1) {
        setPlaying(false);
        return;
      }
      frame.current = requestAnimationFrame(tick);
    };
    frame.current = requestAnimationFrame(tick);
    return () => {
      if (frame.current) cancelAnimationFrame(frame.current);
    };
  }, [playing, speed]);

  const restart = useCallback(() => {
    setPlaying(false);
    scroller.current?.scrollTo({ top: 0 });
  }, []);

  const toggleFullscreen = useCallback(() => {
    if (document.fullscreenElement) document.exitFullscreen();
    else document.documentElement.requestFullscreen?.();
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        e.preventDefault();
        setPlaying((p) => !p);
      } else if (e.key === "ArrowUp") setSpeed((s) => Math.min(200, s + 5));
      else if (e.key === "ArrowDown") setSpeed((s) => Math.max(5, s - 5));
      else if (e.key === "+" || e.key === "=") setFontSize((f) => Math.min(120, f + 4));
      else if (e.key === "-") setFontSize((f) => Math.max(24, f - 4));
      else if (e.key.toLowerCase() === "r") restart();
      else if (e.key.toLowerCase() === "f") toggleFullscreen();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [restart, toggleFullscreen]);

  if (error) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-black text-white">
        <p>
          {error} <Link href="/library" className="underline">Voltar</Link>
        </p>
      </div>
    );
  }

  const text = script ? spokenText(script) : "";

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black text-white">
      <div className="flex flex-wrap items-center gap-4 border-b border-white/10 bg-neutral-950 px-4 py-2 text-sm">
        <Link href={`/library/${id}`} className="text-neutral-400 hover:text-white">
          ← Sair
        </Link>
        <button
          onClick={() => setPlaying((p) => !p)}
          className="rounded-md bg-orange-600 px-4 py-1.5 font-semibold hover:bg-orange-500"
        >
          {playing ? "❚❚ Pausar" : "▶ Rolar"}
        </button>
        <button onClick={restart} className="text-neutral-300 hover:text-white">
          ↺ Início
        </button>
        <label className="flex items-center gap-2 text-neutral-400">
          Velocidade
          <input type="range" min={5} max={200} value={speed} onChange={(e) => setSpeed(Number(e.target.value))} />
        </label>
        <label className="flex items-center gap-2 text-neutral-400">
          Fonte
          <input type="range" min={24} max={120} value={fontSize} onChange={(e) => setFontSize(Number(e.target.value))} />
        </label>
        <label className="flex items-center gap-2 text-neutral-400">
          <input type="checkbox" checked={mirror} onChange={(e) => setMirror(e.target.checked)} />
          Espelhar
        </label>
        <button onClick={toggleFullscreen} className="text-neutral-300 hover:text-white">
          ⛶ Tela cheia
        </button>
        <span className="ml-auto hidden text-xs text-neutral-500 lg:inline">
          Espaço: rolar · ↑↓: velocidade · +/−: fonte · R: início · F: tela cheia
        </span>
      </div>

      <div className="pointer-events-none absolute inset-x-0 top-1/3 z-10 h-0.5 bg-orange-500/40" />

      <div ref={scroller} className="flex-1 overflow-y-auto" style={{ scrollbarWidth: "none" }}>
        <div
          className="mx-auto max-w-5xl px-6 py-[33vh] font-semibold leading-snug"
          style={{ fontSize, transform: mirror ? "scaleX(-1)" : undefined }}
        >
          {script ? (
            text.split("\n\n").map((para, i) => (
              <p key={i} className="mb-[1em] whitespace-pre-wrap">
                {para}
              </p>
            ))
          ) : (
            <p className="text-neutral-600">Carregando…</p>
          )}
          <p className="text-neutral-700">— fim —</p>
        </div>
      </div>
    </div>
  );
}
