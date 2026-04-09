"use client";

import { Role } from "@prisma/client";
import { useRouter } from "next/navigation";
import { useState } from "react";

type UserRow = {
  id: string;
  login: string | null;
  email: string | null;
  name: string | null;
  roles: { role: Role }[];
  accountActive: boolean;
  pzdMemberSince: Date | null;
};

export function UserEditForm({ user }: { user: UserRow }) {
  const router = useRouter();
  const [name, setName] = useState(user.name ?? "");
  const [roles, setRoles] = useState<Role[]>(user.roles.map((r) => r.role));
  const [accountActive, setAccountActive] = useState(user.accountActive);
  const [pzd, setPzd] = useState(user.pzdMemberSince ? user.pzdMemberSince.toISOString().slice(0, 10) : "");
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [resetPasswordPreview, setResetPasswordPreview] = useState<string | null>(null);
  const [resetPending, setResetPending] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setPending(true);
    const res = await fetch(`/api/admin/users/${user.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        roles,
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

  function toggleRole(role: Role, checked: boolean) {
    setRoles((prev) => {
      if (checked) return Array.from(new Set([...prev, role]));
      return prev.filter((r) => r !== role);
    });
  }

  async function resetPassword() {
    const confirmed = confirm("Na pewno zresetować hasło użytkownika do nowego prostego hasła startowego?");
    if (!confirmed) return;

    setResetPending(true);
    setError(null);
    const res = await fetch(`/api/admin/users/${user.id}/reset-password`, {
      method: "POST",
    });
    setResetPending(false);
    const data = (await res.json().catch(() => ({}))) as { error?: string; generatedPassword?: string };
    if (!res.ok) {
      setError(data.error ?? "Nie udało się zresetować hasła.");
      return;
    }
    setResetPasswordPreview(data.generatedPassword ?? null);
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
      <fieldset className="space-y-2 rounded-xl border border-lime-200/80 bg-lime-50/40 p-3">
        <legend className="px-1 text-sm font-medium text-emerald-950">Uprawnienia specjalne</legend>
        <label className="inline-flex items-center gap-2 text-sm text-emerald-900">
          <input
            type="checkbox"
            checked={roles.includes(Role.TREASURER)}
            onChange={(e) => toggleRole(Role.TREASURER, e.target.checked)}
          />
          Skarbnik
        </label>
        <label className="inline-flex items-center gap-2 text-sm text-emerald-900">
          <input type="checkbox" checked={roles.includes(Role.ADMIN)} onChange={(e) => toggleRole(Role.ADMIN, e.target.checked)} />
          Administrator / prezes
        </label>
        <p className="text-xs text-emerald-900/70">
          Status działkowca wynika z aktywnego przypisania działki, a nie z checkboxa roli.
        </p>
      </fieldset>
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

      <section className="space-y-2 rounded-xl border border-amber-200/80 bg-amber-50/70 p-3">
        <p className="text-sm font-semibold text-amber-900">Reset hasła użytkownika</p>
        <p className="text-xs text-amber-900/80">
          Po resecie generowane jest proste hasło startowe, a użytkownik musi je zmienić po następnym logowaniu.
        </p>
        <button
          type="button"
          onClick={() => void resetPassword()}
          disabled={resetPending}
          className="rounded-lg bg-amber-700 px-3 py-2 text-xs font-semibold text-white hover:bg-amber-800 disabled:opacity-60"
        >
          {resetPending ? "Resetuję..." : "Resetuj hasło"}
        </button>
        {resetPasswordPreview ? (
          <div className="rounded-lg border border-amber-300 bg-white p-2">
            <p className="text-xs text-amber-900/70">Nowe hasło startowe (pokaż/zanotuj teraz):</p>
            <input
              readOnly
              value={resetPasswordPreview}
              className="mt-1 w-full rounded border border-amber-200 px-2 py-1 text-sm font-semibold text-emerald-900"
            />
            <button
              type="button"
              onClick={() => setResetPasswordPreview(null)}
              className="mt-2 text-xs font-semibold text-amber-800 hover:underline"
            >
              Ukryj
            </button>
          </div>
        ) : null}
      </section>
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
