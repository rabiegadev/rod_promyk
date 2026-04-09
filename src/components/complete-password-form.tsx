"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function CompletePasswordForm() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (password.length < 8) {
      setError("Nowe hasło musi mieć minimum 8 znaków.");
      return;
    }
    if (password !== password2) {
      setError("Hasła nie są takie same.");
      return;
    }
    setPending(true);
    const res = await fetch("/api/me/password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ newPassword: password }),
    });
    const data = (await res.json().catch(() => ({}))) as { error?: string };
    setPending(false);
    if (!res.ok) {
      setError(data.error ?? "Nie udało się zmienić hasła.");
      return;
    }
    setPassword("");
    setPassword2("");
    router.refresh();
  }

  return (
    <div className="rounded-2xl border border-rose-200/90 bg-rose-50/80 p-4 text-rose-950 shadow-sm shadow-rose-900/5">
      <h2 className="font-semibold">Zmień hasło startowe</h2>
      <p className="mt-1 text-sm text-rose-900/80">
        To konto ma hasło tymczasowe. Ustaw nowe hasło, aby odblokować pełny dostęp.
      </p>
      <form onSubmit={onSubmit} className="mt-4 grid gap-3 sm:grid-cols-2">
        <input
          type="password"
          className="rounded-md border border-rose-300/60 px-3 py-2"
          placeholder="Nowe hasło (min. 8)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <input
          type="password"
          className="rounded-md border border-rose-300/60 px-3 py-2"
          placeholder="Powtórz nowe hasło"
          value={password2}
          onChange={(e) => setPassword2(e.target.value)}
          required
        />
        <div className="sm:col-span-2">
          <button
            type="submit"
            disabled={pending}
            className="rounded-md bg-rose-700 px-4 py-2 font-medium text-white hover:bg-rose-800 disabled:opacity-60"
          >
            {pending ? "Zmieniam…" : "Zmień hasło"}
          </button>
        </div>
      </form>
      {error ? <p className="mt-2 text-sm text-red-700">{error}</p> : null}
    </div>
  );
}
