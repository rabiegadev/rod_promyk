"use client";

import { useEffect, useState } from "react";

type Thread = {
  id: string;
  lastMessageAt: string;
  plotHolder: { id: string; login: string | null; name: string | null; email: string | null };
  messages: { body: string; createdAt: string }[];
};

type Msg = {
  id: string;
  body: string;
  createdAt: string;
  senderId: string;
};

export function AdminChatView({ initialUserId }: { initialUserId?: string | null }) {
  const [threads, setThreads] = useState<Thread[]>([]);
  const [selected, setSelected] = useState<string | null>(initialUserId ?? null);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [body, setBody] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function loadThreads() {
    const res = await fetch("/api/admin/chat-threads");
    const data = (await res.json()) as { threads?: Thread[] };
    setThreads(data.threads ?? []);
  }

  async function loadMessages(userId: string) {
    const res = await fetch(`/api/chat/messages?plotHolderId=${encodeURIComponent(userId)}`);
    const data = (await res.json()) as { messages?: Msg[] };
    setMessages(data.messages ?? []);
  }

  useEffect(() => {
    void loadThreads();
  }, []);

  useEffect(() => {
    if (initialUserId) setSelected(initialUserId);
  }, [initialUserId]);

  useEffect(() => {
    if (selected) void loadMessages(selected);
  }, [selected]);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    if (!selected) return;
    setError(null);
    setPending(true);
    const res = await fetch("/api/chat/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body, plotHolderId: selected }),
    });
    setPending(false);
    if (!res.ok) {
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      setError(data.error ?? "Nie udało się wysłać.");
      return;
    }
    setBody("");
    await loadMessages(selected);
    await loadThreads();
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,280px)_minmax(0,1fr)] lg:gap-6">
      <div className="rounded-2xl border border-lime-200/80 bg-white/90 p-3 shadow-sm lg:min-h-0">
        <h2 className="px-2 pb-2 text-sm font-semibold text-emerald-950">Wątki</h2>
        <ul className="max-h-[min(40vh,22rem)] space-y-1 overflow-y-auto overscroll-contain lg:max-h-[520px]">
          {threads.map((t) => (
            <li key={t.id}>
              <button
                type="button"
                onClick={() => setSelected(t.plotHolder.id)}
                className={`w-full rounded-xl px-3 py-2 text-left text-sm transition ${
                  selected === t.plotHolder.id ? "bg-lime-100/90 font-semibold text-emerald-950" : "hover:bg-lime-50/80"
                }`}
              >
                <span className="block">{t.plotHolder.name ?? t.plotHolder.login ?? t.plotHolder.id}</span>
                <span className="block text-xs text-emerald-800/60">
                  {new Date(t.lastMessageAt).toLocaleString("pl-PL")}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div className="space-y-4">
        {!selected ? (
          <p className="text-sm text-emerald-900/70">
            Wybierz działkowca z listy powyżej (lub otwórz link z parametrem ?u=).
          </p>
        ) : (
          <>
            <div className="max-h-[min(50vh,24rem)] space-y-3 overflow-y-auto overscroll-contain rounded-2xl border border-lime-200/80 bg-white/90 p-4 shadow-inner sm:max-h-[360px]">
              {messages.map((m) => (
                <div key={m.id} className="rounded-xl bg-lime-50/80 px-3 py-2 text-sm text-emerald-950">
                  <p className="text-xs text-emerald-800/60">{new Date(m.createdAt).toLocaleString("pl-PL")}</p>
                  <p className="mt-1 whitespace-pre-wrap">{m.body}</p>
                </div>
              ))}
            </div>
            <form onSubmit={send} className="flex flex-col gap-2 sm:flex-row sm:items-end">
              <textarea
                className="min-h-[88px] flex-1 rounded-2xl border border-lime-200/80 px-3 py-2 text-sm"
                placeholder="Odpowiedź do działkowca…"
                value={body}
                onChange={(e) => setBody(e.target.value)}
                required
              />
              <button
                type="submit"
                disabled={pending}
                className="min-h-11 shrink-0 rounded-2xl bg-emerald-700 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-800 disabled:opacity-60 sm:min-h-0"
              >
                {pending ? "Wysyłam…" : "Wyślij"}
              </button>
            </form>
            {error ? <p className="text-sm text-red-700">{error}</p> : null}
          </>
        )}
      </div>
    </div>
  );
}
