"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type PlotRow = {
  id: string;
  number: string;
  assignments: {
    id: string;
    user: { id: string; login: string | null; name: string | null };
  }[];
};

type Holder = { id: string; login: string | null; name: string | null };

export function PlotsAssignPanel({ plots, holders }: { plots: PlotRow[]; holders: Holder[] }) {
  const router = useRouter();
  const [plotId, setPlotId] = useState(plots[0]?.id ?? "");
  const [userId, setUserId] = useState(holders[0]?.id ?? "");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  if (plots.length === 0) {
    return <p className="text-sm text-emerald-900/70">Brak działek w bazie — dodaj je importem zbiorczym lub ręcznie.</p>;
  }
  if (holders.length === 0) {
    return <p className="text-sm text-emerald-900/70">Brak kont działkowców — utwórz użytkowników (import lub ręcznie).</p>;
  }

  async function assign(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setPending(true);
    const res = await fetch("/api/admin/plot-assignments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "assign", plotId, userId }),
    });
    setPending(false);
    const data = (await res.json().catch(() => ({}))) as { error?: string };
    if (!res.ok) {
      setError(data.error ?? "Nie udało się przypisać.");
      return;
    }
    router.refresh();
  }

  async function release(pid: string) {
    if (!confirm("Odłączyć obecnego działkowca od tej działki?")) return;
    setPending(true);
    const res = await fetch("/api/admin/plot-assignments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "release", plotId: pid }),
    });
    setPending(false);
    if (res.ok) router.refresh();
  }

  return (
    <div className="space-y-8">
      <form onSubmit={assign} className="space-y-3 rounded-2xl border border-lime-200/90 bg-white/90 p-5 shadow-sm">
        <h2 className="font-semibold text-emerald-950">Przypisz działkowca do działki</h2>
        <p className="text-sm text-emerald-900/70">
          Poprzedni przypisany użytkownik zostanie odłączony od wybranej działki (data zakończenia przypisania).
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="text-sm font-medium text-emerald-950">Działka</label>
            <select
              className="mt-1 w-full rounded-xl border border-lime-200/80 px-3 py-2 text-sm"
              value={plotId}
              onChange={(e) => setPlotId(e.target.value)}
            >
              {plots.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.number}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-emerald-950">Działkowiec</label>
            <select
              className="mt-1 w-full rounded-xl border border-lime-200/80 px-3 py-2 text-sm"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
            >
              {holders.map((h) => (
                <option key={h.id} value={h.id}>
                  {h.name ?? h.login ?? h.id}
                </option>
              ))}
            </select>
          </div>
        </div>
        {error ? <p className="text-sm text-red-700">{error}</p> : null}
        <button
          type="submit"
          disabled={pending || !plotId || !userId}
          className="rounded-xl bg-emerald-700 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-800 disabled:opacity-60"
        >
          {pending ? "Zapisuję…" : "Przypisz"}
        </button>
      </form>

      <div className="overflow-x-auto overscroll-x-contain rounded-2xl border border-lime-200/80 bg-white/90 shadow-sm [-webkit-overflow-scrolling:touch]">
        <table className="w-full min-w-[20rem] text-left text-sm md:min-w-0">
          <thead className="bg-lime-50/80 text-emerald-900">
            <tr>
              <th className="px-3 py-2 font-medium">Numer</th>
              <th className="px-3 py-2 font-medium">Przypisany</th>
              <th className="px-3 py-2 font-medium" />
            </tr>
          </thead>
          <tbody>
            {plots.map((p) => {
              const a = p.assignments[0];
              return (
                <tr key={p.id} className="border-t border-lime-100/90">
                  <td className="px-3 py-2 font-medium">{p.number}</td>
                  <td className="px-3 py-2 text-emerald-900/80">
                    {a ? a.user.name ?? a.user.login ?? a.user.id : "—"}
                  </td>
                  <td className="px-3 py-2 text-right">
                    {a ? (
                      <button
                        type="button"
                        onClick={() => void release(p.id)}
                        className="text-xs font-semibold text-red-700 hover:underline"
                      >
                        Odłącz
                      </button>
                    ) : null}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
