"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { useState } from "react";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/panel";

  const [loginOrEmail, setLoginOrEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setPending(true);
    const res = await signIn("credentials", {
      loginOrEmail,
      password,
      redirect: false,
    });
    setPending(false);
    if (res?.error) {
      setError("Nieprawidłowy login lub hasło.");
      return;
    }
    router.push(callbackUrl);
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="mx-auto max-w-md space-y-4 rounded-xl border border-emerald-900/10 bg-white p-6 shadow-sm">
      <div>
        <label className="block text-sm font-medium text-emerald-950" htmlFor="loginOrEmail">
          Login lub e-mail
        </label>
        <input
          id="loginOrEmail"
          name="loginOrEmail"
          autoComplete="username"
          className="mt-1 w-full rounded-md border border-emerald-900/20 px-3 py-2 text-emerald-950"
          value={loginOrEmail}
          onChange={(e) => setLoginOrEmail(e.target.value)}
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-emerald-950" htmlFor="password">
          Hasło
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          className="mt-1 w-full rounded-md border border-emerald-900/20 px-3 py-2 text-emerald-950"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>
      {error ? <p className="text-sm text-red-700">{error}</p> : null}
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-md bg-emerald-800 px-4 py-2 font-medium text-white hover:bg-emerald-900 disabled:opacity-60"
      >
        {pending ? "Logowanie…" : "Zaloguj się"}
      </button>
    </form>
  );
}
