"use client";

import { useEffect, useRef, useState } from "react";
import { Button, ButtonLink, Field, inputCls } from "@/components/ui";
import type { ChatMessage, Persona } from "@/lib/db/schema";
import { ICP_FIELDS, type IcpDraft, type IcpFieldKey } from "@/lib/icp-fields";

const GREETING: ChatMessage = {
  role: "assistant",
  content:
    "Vamos definir o seu cliente ideal. Para começar: o que a sua empresa vende e para qual nicho? Se já tiver um público em mente, me conta também quem é.",
};

const EMPTY_DRAFT = Object.fromEntries(ICP_FIELDS.map((f) => [f.key, ""])) as IcpDraft;
const SHORT_FIELDS: IcpFieldKey[] = ["name", "niche", "methodName"];

function draftOf(p: Persona): IcpDraft {
  return Object.fromEntries(ICP_FIELDS.map((f) => [f.key, p[f.key] ?? ""])) as IcpDraft;
}

export function IcpClient() {
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([GREETING]);
  const [draft, setDraft] = useState<IcpDraft>(EMPTY_DRAFT);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [saving, setSaving] = useState(false);
  const [ready, setReady] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const chatEnd = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/personas")
      .then((r) => (r.ok ? r.json() : []))
      .then(setPersonas)
      .catch(() => {});
  }, []);

  useEffect(() => {
    chatEnd.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [messages, sending]);

  const filled = ICP_FIELDS.filter((f) => draft[f.key].trim()).length;

  function confirmDiscard() {
    return !dirty || window.confirm("Há alterações não salvas neste ICP. Descartar?");
  }

  function startNew() {
    if (!confirmDiscard()) return;
    setSelectedId(null);
    setMessages([GREETING]);
    setDraft(EMPTY_DRAFT);
    setReady(false);
    setDirty(false);
    setError("");
    setNotice("");
  }

  function open(p: Persona) {
    if (p.id === selectedId || !confirmDiscard()) return;
    setSelectedId(p.id);
    setMessages(p.conversation.length ? p.conversation : [GREETING]);
    setDraft(draftOf(p));
    setReady(false);
    setDirty(false);
    setError("");
    setNotice("");
  }

  function setField(k: IcpFieldKey, v: string) {
    setDraft((d) => ({ ...d, [k]: v }));
    setDirty(true);
  }

  async function send() {
    const text = input.trim();
    if (!text || sending) return;
    const next: ChatMessage[] = [...messages, { role: "user", content: text }];
    setMessages(next);
    setInput("");
    setSending(true);
    setError("");
    try {
      const res = await fetch("/api/icp/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next, draft }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Falha na conversa.");
      setMessages([...next, { role: "assistant", content: data.reply }]);
      setDraft({ ...EMPTY_DRAFT, ...data.icp });
      setReady(data.ready);
      setDirty(true);
    } catch (e) {
      // Devolve o texto ao campo para o usuário tentar de novo sem redigitar.
      setMessages(messages);
      setInput(text);
      setError(e instanceof Error ? e.message : "Falha na conversa.");
    } finally {
      setSending(false);
    }
  }

  async function save() {
    setSaving(true);
    setError("");
    setNotice("");
    try {
      const res = await fetch(selectedId ? `/api/personas/${selectedId}` : "/api/personas", {
        method: selectedId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...draft, conversation: messages }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Não foi possível salvar o ICP.");
      setPersonas((list) => [data, ...list.filter((p) => p.id !== data.id)]);
      setSelectedId(data.id);
      setDirty(false);
      setNotice("ICP salvo.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Não foi possível salvar o ICP.");
    } finally {
      setSaving(false);
    }
  }

  async function remove() {
    if (!selectedId || !window.confirm(`Excluir o ICP "${draft.name}"? Os roteiros dele continuam na biblioteca.`)) return;
    const res = await fetch(`/api/personas/${selectedId}`, { method: "DELETE" });
    if (!res.ok) return setError("Não foi possível excluir o ICP.");
    setPersonas((list) => list.filter((p) => p.id !== selectedId));
    setDirty(false);
    setSelectedId(null);
    setMessages([GREETING]);
    setDraft(EMPTY_DRAFT);
    setReady(false);
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[220px_minmax(0,1fr)_400px]">
      {/* Lista de ICPs */}
      <aside className="space-y-2">
        <Button onClick={startNew} className="w-full">
          + Novo ICP
        </Button>
        {personas.length === 0 && <p className="px-1 text-sm text-stone-500">Nenhum ICP salvo ainda.</p>}
        <ul className="space-y-1">
          {personas.map((p) => (
            <li key={p.id}>
              <button
                type="button"
                onClick={() => open(p)}
                className={`w-full rounded-lg px-3 py-2 text-left text-sm ${
                  p.id === selectedId ? "bg-brand-50 font-medium text-brand-700" : "text-stone-700 hover:bg-stone-100"
                }`}
              >
                <span className="block truncate">{p.name}</span>
                {p.niche && <span className="block truncate text-xs text-stone-500">{p.niche}</span>}
              </button>
            </li>
          ))}
        </ul>
      </aside>

      {/* Conversa */}
      <section className="flex min-h-[32rem] flex-col rounded-2xl border border-stone-200 bg-white">
        <div className="flex-1 space-y-3 overflow-y-auto p-4 xl:max-h-[calc(100vh-16rem)]">
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
              <p
                className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                  m.role === "user" ? "bg-brand-600 text-white" : "bg-stone-100 text-stone-800"
                }`}
              >
                {m.content}
              </p>
            </div>
          ))}
          {sending && <p className="animate-pulse px-1 text-sm text-stone-400">Pensando…</p>}
          <div ref={chatEnd} />
        </div>
        <form
          className="flex items-end gap-2 border-t border-stone-200 p-3"
          onSubmit={(e) => {
            e.preventDefault();
            send();
          }}
        >
          <textarea
            className={`${inputCls} max-h-40 min-h-11 flex-1 resize-y`}
            rows={2}
            value={input}
            placeholder="Responda aqui… (Enter envia, Shift+Enter quebra linha)"
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
                e.preventDefault();
                send();
              }
            }}
          />
          <Button type="submit" disabled={sending || !input.trim()}>
            Enviar
          </Button>
        </form>
      </section>

      {/* Ficha */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Ficha do ICP</h2>
          <span className="text-xs text-stone-500">
            {filled}/{ICP_FIELDS.length} campos
          </span>
        </div>
        {ready && !selectedId && (
          <p className="rounded-lg bg-green-50 p-3 text-sm text-green-800">A ficha já tem o essencial. Revise e salve.</p>
        )}
        {ICP_FIELDS.map((f) => (
          <Field key={f.key} label={f.label}>
            {SHORT_FIELDS.includes(f.key) ? (
              <input className={inputCls} value={draft[f.key]} onChange={(e) => setField(f.key, e.target.value)} />
            ) : (
              <textarea
                className={`${inputCls} min-h-16`}
                value={draft[f.key]}
                onChange={(e) => setField(f.key, e.target.value)}
              />
            )}
          </Field>
        ))}
        <div className="flex flex-wrap gap-2 pt-1">
          <Button onClick={save} disabled={saving || sending || !draft.name.trim() || !draft.audience.trim()}>
            {saving ? "Salvando…" : selectedId ? "Salvar alterações" : "Salvar ICP"}
          </Button>
          {selectedId && !dirty && (
            <ButtonLink href={`/studio?icp=${selectedId}`} variant="secondary">
              Gerar hooks para este ICP
            </ButtonLink>
          )}
          {selectedId && (
            <Button variant="danger" onClick={remove}>
              Excluir
            </Button>
          )}
        </div>
        {!draft.name.trim() || !draft.audience.trim() ? (
          <p className="text-xs text-stone-500">Para salvar, preencha pelo menos o nome e o &quot;quem é&quot;.</p>
        ) : null}
        {notice && <p className="rounded-lg bg-green-50 p-3 text-sm text-green-800">{notice}</p>}
        {error && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-800">{error}</p>}
      </section>
    </div>
  );
}
