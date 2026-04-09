"use client";

import { useState } from "react";

export function BulkImportPanel() {
  const [plotsJson, setPlotsJson] = useState("");
  const [usersJson, setUsersJson] = useState("");
  const [msg, setMsg] = useState<string | null>(null);

  async function runPlots() {
    setMsg(null);
    const body = JSON.parse(plotsJson) as Record<string, unknown>;
    const res = await fetch("/api/admin/bulk-plots", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json().catch(() => ({}));
    setMsg(JSON.stringify(data, null, 2));
  }

  async function runUsers() {
    setMsg(null);
    const body = JSON.parse(usersJson) as Record<string, unknown>;
    const res = await fetch("/api/admin/bulk-users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json().catch(() => ({}));
    setMsg(JSON.stringify(data, null, 2));
  }

  return (
    <div className="space-y-8">
      <section className="rounded-2xl border border-lime-200/90 bg-white/90 p-5 shadow-sm">
        <h2 className="font-semibold text-emerald-950">Działki (JSON)</h2>
        <p className="mt-1 text-sm text-emerald-900/70">
          Przykład:{" "}
          <code className="rounded bg-lime-50 px-1">
            {`{"count":5,"numberPrefix":"D","startNumber":1,"createUsers":true}`}
          </code>
        </p>
        <textarea
          className="mt-3 min-h-[120px] w-full rounded-xl border border-lime-200/80 px-3 py-2 font-mono text-xs"
          value={plotsJson}
          onChange={(e) => setPlotsJson(e.target.value)}
          placeholder='{"count":3,"startNumber":1}'
        />
        <button
          type="button"
          onClick={() => void runPlots().catch(() => setMsg("Błąd JSON lub sieci."))}
          className="mt-3 rounded-xl bg-emerald-700 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-800"
        >
          Wyślij
        </button>
      </section>

      <section className="rounded-2xl border border-lime-200/90 bg-white/90 p-5 shadow-sm">
        <h2 className="font-semibold text-emerald-950">Konta działkowców (JSON)</h2>
        <p className="mt-1 text-sm text-emerald-900/70">
          Przykład: <code className="rounded bg-lime-50 px-1">{`{"count":5,"loginPrefix":"dzialkowiec","startIndex":1}`}</code>
        </p>
        <textarea
          className="mt-3 min-h-[120px] w-full rounded-xl border border-lime-200/80 px-3 py-2 font-mono text-xs"
          value={usersJson}
          onChange={(e) => setUsersJson(e.target.value)}
          placeholder='{"count":3,"loginPrefix":"dzialkowiec","startIndex":1}'
        />
        <button
          type="button"
          onClick={() => void runUsers().catch(() => setMsg("Błąd JSON lub sieci."))}
          className="mt-3 rounded-xl bg-emerald-700 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-800"
        >
          Wyślij
        </button>
      </section>

      {msg ? (
        <pre className="max-h-96 overflow-auto rounded-2xl border border-amber-200/80 bg-amber-50/80 p-4 text-xs text-emerald-950">{msg}</pre>
      ) : null}
    </div>
  );
}
