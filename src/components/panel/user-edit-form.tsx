"use client";

import { Role } from "@prisma/client";
import { useRouter } from "next/navigation";
import { useState } from "react";

type UserRow = {
  id: string;
  login: string | null;
  email: string | null;
  name: string | null;
  role: Role;
  accountActive: boolean;
  pzdMemberSince: Date | null;
};

export function UserEditForm({ user }: { user: UserRow }) {
  const router = useRouter();
  const [name, setName] = useState(user.name ?? "");
  const [role, setRole] = useState<Role>(user.role);
  const [accountActive, setAccountActive] = useState(user.accountActive);
  const [pzd, setPzd] = useState(user.pzdMemberSince ? user.pzdMemberSince.toISOString().slice(0, 10) : "");
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setPending(true);
    const res = await fetch(`/api/admin/users/${user.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        role,
        accountActive,
        pzdMemberSince: pzd === "" ? null : new Date(pzd).toISOString(),
        note: note || undefined,
      }),
    });
    setPending(false);
    if (!res.ok) {
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      setError(data.error ?? "Nie udało się zapisać.");
      return;
    }
    setNote("");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4 rounded-2xl border border-lime-200/90 bg-white/90 p-5 shadow-sm">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="text-sm font-medium text-emerald-950">Login</label>
          <p className="mt-1 rounded-xl border border-lime-100 bg-lime-50/50 px-3 py-2 text-sm">{user.login ?? "—"}</p>
        </div>
        <div>
          <label className="text-sm font-medium text-emerald-950">E-mail</label>
          <p className="mt-1 rounded-xl border border-lime-100 bg-lime-50/50 px-3 py-2 text-sm">{user.email ?? "—"}</p>
        </div>
      </div>
      <div>
        <label className="text-sm font-medium text-emerald-950" htmlFor="name">
          Imię i nazwisko / nazwa
        </label>
        <input
          id="name"
          className="mt-1 w-full rounded-xl border border-lime-200/80 px-3 py-2 text-sm"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>
      <div>
        <label className="text-sm font-medium text-emerald-950" htmlFor="role">
          Rola
        </label>
        <select
          id="role"
          className="mt-1 w-full rounded-xl border border-lime-200/80 px-3 py-2 text-sm"
          value={role}
          onChange={(e) => setRole(e.target.value as Role)}
        >
          <option value={Role.PLOT_HOLDER}>Działkowiec</option>
          <option value={Role.TREASURER}>Skarbnik</option>
          <option value={Role.ADMIN}>Administrator</option>
        </select>
      </div>
      <label className="flex items-center gap-2 text-sm font-medium text-emerald-950">
        <input type="checkbox" checked={accountActive} onChange={(e) => setAccountActive(e.target.checked)} />
        Konto aktywne
      </label>
      <div>
        <label className="text-sm font-medium text-emerald-950" htmlFor="pzd">
          Członek PZD od (data)
        </label>
        <input
          id="pzd"
          type="date"
          className="mt-1 w-full rounded-xl border border-lime-200/80 px-3 py-2 text-sm"
          value={pzd}
          onChange={(e) => setPzd(e.target.value)}
        />
        <p className="mt-1 text-xs text-emerald-900/60">Przy zmianie statusu lub daty PZD dopisywana jest historia.</p>
      </div>
      <div>
        <label className="text-sm font-medium text-emerald-950" htmlFor="note">
          Notatka do wpisu historii (opcjonalnie)
        </label>
        <input
          id="note"
          className="mt-1 w-full rounded-xl border border-lime-200/80 px-3 py-2 text-sm"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="np. zmiana z urzędu"
        />
      </div>
      {error ? <p className="text-sm text-red-700">{error}</p> : null}
      <button
        type="submit"
        disabled={pending}
        className="rounded-xl bg-emerald-700 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-800 disabled:opacity-60"
      >
        {pending ? "Zapisuję…" : "Zapisz zmiany"}
      </button>
    </form>
  );
}
