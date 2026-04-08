"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function CompleteEmailForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setPending(true);
    const res = await fetch("/api/me/email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    const data = (await res.json().catch(() => ({}))) as { error?: string };
    setPending(false);
    if (!res.ok) {
      setError(data.error ?? "Nie udało się zapisać e-maila.");
      return;
    }
    router.refresh();
  }

  return (
    <div className="rounded-lg border border-amber-700/30 bg-amber-50 p-4 text-amber-950">
      <h2 className="font-semibold">Uzupełnij adres e-mail</h2>
      <p className="mt-1 text-sm text-amber-900/80">
        Przy pierwszym logowaniu prosimy o podanie działającego e-maila (powiadomienia, kontakt z zarządem).
      </p>
      <form onSubmit={onSubmit} className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="flex-1">
          <label htmlFor="email" className="sr-only">
            E-mail
          </label>
          <input
            id="email"
            type="email"
            required
            className="w-full rounded-md border border-amber-800/25 px-3 py-2"
            placeholder="twoj@email.pl"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <button
          type="submit"
          disabled={pending}
          className="rounded-md bg-amber-800 px-4 py-2 font-medium text-white hover:bg-amber-900 disabled:opacity-60"
        >
          {pending ? "Zapisuję…" : "Zapisz"}
        </button>
      </form>
      {error ? <p className="mt-2 text-sm text-red-700">{error}</p> : null}
    </div>
  );
}
