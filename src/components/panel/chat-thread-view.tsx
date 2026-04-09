"use client";

import { useEffect, useState } from "react";

type Msg = {
  id: string;
  body: string;
  createdAt: string;
  senderId: string;
};

export function PlotHolderChatView() {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [body, setBody] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function load() {
    const res = await fetch("/api/chat/messages");
    const data = (await res.json()) as { messages?: Msg[] };
    setMessages(data.messages ?? []);
  }

  useEffect(() => {
    void load();
  }, []);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setPending(true);
    const res = await fetch("/api/chat/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body }),
    });
    setPending(false);
    if (!res.ok) {
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      setError(data.error ?? "Nie udało się wysłać.");
      return;
    }
    setBody("");
    await load();
  }

  return (
    <div className="space-y-4">
      <div className="max-h-[min(55vh,24rem)] space-y-3 overflow-y-auto overscroll-contain rounded-2xl border border-lime-200/80 bg-white/90 p-4 shadow-inner sm:max-h-[420px]">
        {messages.length === 0 ? (
          <p className="text-sm text-emerald-900/70">Brak wiadomości — napisz pierwszą.</p>
        ) : (
          messages.map((m) => (
            <div key={m.id} className="rounded-xl bg-lime-50/80 px-3 py-2 text-sm text-emerald-950">
              <p className="text-xs text-emerald-800/60">{new Date(m.createdAt).toLocaleString("pl-PL")}</p>
              <p className="mt-1 whitespace-pre-wrap">{m.body}</p>
            </div>
          ))
        )}
      </div>
      <form onSubmit={send} className="flex flex-col gap-2 sm:flex-row sm:items-end">
        <textarea
          className="min-h-[88px] flex-1 rounded-2xl border border-lime-200/80 px-3 py-2 text-sm"
          placeholder="Treść wiadomości do zarządu…"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          required
        />
        <button
          type="submit"
          disabled={pending}
          className="min-h-11 w-full rounded-2xl bg-emerald-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-800 disabled:opacity-60 sm:min-h-0 sm:w-auto sm:py-2"
        >
          {pending ? "Wysyłam…" : "Wyślij"}
        </button>
      </form>
      {error ? <p className="text-sm text-red-700">{error}</p> : null}
      <p className="text-xs text-emerald-900/60">
        Jeśli skonfigurujesz RESEND w zmiennych środowiska, administratorzy dostaną powiadomienie e-mail o nowej wiadomości.
      </p>
    </div>
  );
}
