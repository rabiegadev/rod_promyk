"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type PlotRow = {
  id: string;
  number: string;
  allowsTwoOwners: boolean;
  availableForPurchase: boolean;
  areaSqm: number | null;
  description: string | null;
  purchaseInfo: string | null;
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
  const [newNumber, setNewNumber] = useState("");
  const [newAllowsTwoOwners, setNewAllowsTwoOwners] = useState(false);
  const [newAvailableForPurchase, setNewAvailableForPurchase] = useState(false);
  const [newAreaSqm, setNewAreaSqm] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newPurchaseInfo, setNewPurchaseInfo] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [savePending, setSavePending] = useState<string | null>(null);

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

  async function createPlot(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setPending(true);
    const res = await fetch("/api/admin/plots", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        number: newNumber,
        allowsTwoOwners: newAllowsTwoOwners,
        availableForPurchase: newAvailableForPurchase,
        areaSqm: newAreaSqm ? Number(newAreaSqm) : null,
        description: newDescription || null,
        purchaseInfo: newPurchaseInfo || null,
      }),
    });
    setPending(false);
    const data = (await res.json().catch(() => ({}))) as { error?: string };
    if (!res.ok) {
      setError(data.error ?? "Nie udało się utworzyć działki.");
      return;
    }
    setNewNumber("");
    setNewAllowsTwoOwners(false);
    setNewAvailableForPurchase(false);
    setNewAreaSqm("");
    setNewDescription("");
    setNewPurchaseInfo("");
    router.refresh();
  }

  async function toggleOwnersMode(plot: PlotRow) {
    setSavePending(plot.id);
    const res = await fetch(`/api/admin/plots/${plot.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ allowsTwoOwners: !plot.allowsTwoOwners }),
    });
    setSavePending(null);
    const data = (await res.json().catch(() => ({}))) as { error?: string };
    if (!res.ok) {
      setError(data.error ?? "Nie udało się zaktualizować działki.");
      return;
    }
    router.refresh();
  }

  return (
    <div className="space-y-8">
      <form onSubmit={createPlot} className="space-y-3 rounded-2xl border border-lime-200/90 bg-white/90 p-5 shadow-sm">
        <h2 className="font-semibold text-emerald-950">Dodaj pojedynczą działkę</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <input
            className="rounded-xl border border-lime-200/80 px-3 py-2 text-sm"
            placeholder="Numer działki (np. A-12)"
            value={newNumber}
            onChange={(e) => setNewNumber(e.target.value)}
            required
          />
          <input
            type="number"
            step="0.01"
            className="rounded-xl border border-lime-200/80 px-3 py-2 text-sm"
            placeholder="Powierzchnia m² (opcjonalnie)"
            value={newAreaSqm}
            onChange={(e) => setNewAreaSqm(e.target.value)}
          />
          <input
            className="rounded-xl border border-lime-200/80 px-3 py-2 text-sm sm:col-span-2"
            placeholder="Opis (opcjonalnie)"
            value={newDescription}
            onChange={(e) => setNewDescription(e.target.value)}
          />
          <input
            className="rounded-xl border border-lime-200/80 px-3 py-2 text-sm sm:col-span-2"
            placeholder="Info sprzedaży (opcjonalnie)"
            value={newPurchaseInfo}
            onChange={(e) => setNewPurchaseInfo(e.target.value)}
          />
        </div>
        <div className="flex flex-wrap gap-4">
          <label className="inline-flex items-center gap-2 text-sm text-emerald-900">
            <input type="checkbox" checked={newAllowsTwoOwners} onChange={(e) => setNewAllowsTwoOwners(e.target.checked)} />
            Współmałżonkowie / dwoje właścicieli
          </label>
          <label className="inline-flex items-center gap-2 text-sm text-emerald-900">
            <input
              type="checkbox"
              checked={newAvailableForPurchase}
              onChange={(e) => setNewAvailableForPurchase(e.target.checked)}
            />
            Działka na sprzedaż
          </label>
        </div>
        <button
          type="submit"
          disabled={pending}
          className="rounded-xl bg-emerald-700 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-800 disabled:opacity-60"
        >
          {pending ? "Tworzę…" : "Utwórz działkę"}
        </button>
      </form>

      <form onSubmit={assign} className="space-y-3 rounded-2xl border border-lime-200/90 bg-white/90 p-5 shadow-sm">
        <h2 className="font-semibold text-emerald-950">Przypisz działkowca do działki</h2>
        <p className="text-sm text-emerald-900/70">
          Dla działki pojedynczej (1 właściciel) nowe przypisanie zastąpi poprzednie. Dla działki z opcją „dwoje właścicieli”
          można dodać drugą osobę.
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
              <th className="px-3 py-2 font-medium">Tryb właścicieli</th>
              <th className="px-3 py-2 font-medium">Przypisany</th>
              <th className="px-3 py-2 font-medium" />
            </tr>
          </thead>
          <tbody>
            {plots.map((p) => {
              return (
                <tr key={p.id} className="border-t border-lime-100/90">
                  <td className="px-3 py-2 font-medium">{p.number}</td>
                  <td className="px-3 py-2 text-emerald-900/80">
                    <button
                      type="button"
                      disabled={savePending === p.id}
                      onClick={() => void toggleOwnersMode(p)}
                      className="rounded-full border border-lime-300 bg-lime-50 px-2 py-1 text-xs font-semibold text-emerald-900 hover:bg-lime-100 disabled:opacity-60"
                    >
                      {p.allowsTwoOwners ? "2 właścicieli" : "1 właściciel"}
                    </button>
                  </td>
                  <td className="px-3 py-2 text-emerald-900/80">
                    {p.assignments.length === 0
                      ? "—"
                      : p.assignments.map((x) => x.user.name ?? x.user.login ?? x.user.id).join(", ")}
                  </td>
                  <td className="px-3 py-2 text-right">
                    {p.assignments.length > 0 ? (
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
