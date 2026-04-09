"use client";

import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

type Member = {
  id: string;
  name: string;
  roleTitle: string;
  phone: string | null;
  email: string | null;
  sortOrder: number;
};

export function BoardAdminPanel({ members }: { members: Member[] }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [roleTitle, setRoleTitle] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setPending(true);
    const res = await fetch("/api/admin/board", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        roleTitle,
        phone: phone || null,
        email: email || null,
        sortOrder: members.length,
      }),
    });
    setPending(false);
    if (!res.ok) {
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      setError(data.error ?? "Nie udało się dodać.");
      return;
    }
    setName("");
    setRoleTitle("");
    setPhone("");
    setEmail("");
    router.refresh();
  }

  async function remove(id: string) {
    if (!confirm("Usunąć osobę z listy kontaktowej?")) return;
    const res = await fetch(`/api/admin/board/${id}`, { method: "DELETE" });
    if (res.ok) router.refresh();
  }

  return (
    <div className="space-y-8">
      <form onSubmit={add} className="space-y-3 rounded-2xl border border-lime-200/90 bg-white/90 p-5 shadow-sm">
        <h2 className="font-semibold text-emerald-950">Dodaj osobę</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <input
            className="rounded-xl border border-lime-200/80 px-3 py-2 text-sm"
            placeholder="Imię i nazwisko"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <input
            className="rounded-xl border border-lime-200/80 px-3 py-2 text-sm"
            placeholder="Funkcja (np. prezes)"
            value={roleTitle}
            onChange={(e) => setRoleTitle(e.target.value)}
            required
          />
          <input
            className="rounded-xl border border-lime-200/80 px-3 py-2 text-sm"
            placeholder="Telefon"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
          <input
            className="rounded-xl border border-lime-200/80 px-3 py-2 text-sm"
            placeholder="E-mail"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        {error ? <p className="text-sm text-red-700">{error}</p> : null}
        <button
          type="submit"
          disabled={pending}
          className="rounded-xl bg-emerald-700 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-800 disabled:opacity-60"
        >
          {pending ? "Dodaję…" : "Dodaj"}
        </button>
      </form>

      <ul className="space-y-3">
        {members.map((m) => (
          <li
            key={m.id}
            className="flex items-start justify-between gap-3 rounded-2xl border border-lime-200/80 bg-white/90 px-4 py-3 shadow-sm"
          >
            <div>
              <p className="font-semibold text-emerald-950">{m.name}</p>
              <p className="text-sm text-emerald-900/70">{m.roleTitle}</p>
              <p className="mt-1 text-sm text-emerald-900/80">
                {m.phone ?? "—"}
                {m.email ? ` · ${m.email}` : ""}
              </p>
            </div>
            <button
              type="button"
              onClick={() => void remove(m.id)}
              className="rounded-lg p-2 text-red-700 hover:bg-red-50"
              aria-label="Usuń"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
