"use client";

import { Role } from "@prisma/client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type PlotOption = {
  id: string;
  number: string;
  allowsTwoOwners: boolean;
  activeAssignments: number;
  assignedTo: string | null;
};

type CreatedCredential = {
  login: string;
  password: string;
  name: string | null;
  plotLabel: string | null;
};

export function UserCreateForm({ plotOptions }: { plotOptions: PlotOption[] }) {
  const router = useRouter();
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [autoPassword, setAutoPassword] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [roles, setRoles] = useState<Role[]>([]);
  const [accountActive, setAccountActive] = useState(true);
  const [pzdDate, setPzdDate] = useState("");
  const [plotId, setPlotId] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);
  const [createdCredentials, setCreatedCredentials] = useState<CreatedCredential[]>([]);

  useEffect(() => {
    if (autoPassword && !password) {
      setPassword(generateClientSimplePassword());
    }
    // only initialize/refresh preview for auto mode
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoPassword]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    setError(null);
    setOk(null);
    if (password.trim().length < 3) {
      setPending(false);
      setError("Hasło startowe musi mieć co najmniej 3 znaki.");
      return;
    }

    const res = await fetch("/api/admin/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        login,
        password,
        autoGenerateSimplePassword: autoPassword,
        name: name || null,
        email: email || null,
        roles,
        accountActive,
        pzdMemberSince: pzdDate ? new Date(pzdDate).toISOString() : null,
        plotId: plotId || undefined,
      }),
    });
    setPending(false);
    const data = (await res.json().catch(() => ({}))) as { error?: string; generatedPassword?: string };
    if (!res.ok) {
      setError(data.error ?? "Nie udało się utworzyć użytkownika.");
      return;
    }
    const selectedPlot = plotOptions.find((p) => p.id === plotId);
    setCreatedCredentials((prev) => [
      {
        login,
        password: data.generatedPassword ?? password,
        name: name || null,
        plotLabel: selectedPlot ? `Działka ${selectedPlot.number}` : null,
      },
      ...prev,
    ]);
    setOk("Użytkownik został utworzony. Hasło trzeba zmienić po pierwszym logowaniu.");
    setLogin("");
    setPassword("");
    setName("");
    setEmail("");
    setRoles([]);
    setAccountActive(true);
    setPzdDate("");
    setPlotId("");
    router.refresh();
  }

  function toggleRole(role: Role, checked: boolean) {
    setRoles((prev) => {
      if (checked) return Array.from(new Set([...prev, role]));
      return prev.filter((r) => r !== role);
    });
  }

  function generateClientSimplePassword() {
    const words = ["ogrod", "promyk", "kwiat", "drzewo", "dzialka", "lato", "wiosna", "ziemia"];
    const word = words[Math.floor(Math.random() * words.length)];
    const num = Math.floor(Math.random() * 90) + 10;
    return `${word}${num}`;
  }

  function printCredentials() {
    if (createdCredentials.length === 0) return;
    const rows = createdCredentials
      .map(
        (c) =>
          `<tr><td>${c.login}</td><td>${c.password}</td><td>${c.name ?? "-"}</td><td>${c.plotLabel ?? "-"}</td></tr>`,
      )
      .join("");
    const html = `<!doctype html><html><head><meta charset="utf-8"/><title>Lista loginów i haseł</title><style>
      body{font-family:Arial,sans-serif;padding:20px}
      h1{font-size:18px}
      table{border-collapse:collapse;width:100%;margin-top:12px}
      th,td{border:1px solid #ccc;padding:8px;text-align:left;font-size:13px}
      th{background:#f3f4f6}
      </style></head><body>
      <h1>ROD Promyk - lista loginów i haseł startowych</h1>
      <p>Hasła są tymczasowe. Użytkownik musi zmienić hasło po pierwszym logowaniu.</p>
      <table><thead><tr><th>Login</th><th>Hasło startowe</th><th>Nazwa</th><th>Działka</th></tr></thead><tbody>${rows}</tbody></table>
      </body></html>`;
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.open();
    w.document.write(html);
    w.document.close();
    w.focus();
    w.print();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4 rounded-2xl border border-lime-200/90 bg-white/90 p-5 shadow-sm">
      <h2 className="font-semibold text-emerald-950">Dodaj użytkownika ręcznie</h2>
      <p className="text-sm text-emerald-900/70">Jeśli nie podasz e-maila, użytkownik będzie musiał go uzupełnić po pierwszym logowaniu.</p>
      <div className="grid gap-3 sm:grid-cols-2">
        <input
          className="rounded-xl border border-lime-200/80 px-3 py-2 text-sm"
          placeholder="Login"
          value={login}
          onChange={(e) => setLogin(e.target.value)}
          required
        />
        <div className="space-y-2">
          <input
            type="text"
            className="w-full rounded-xl border border-lime-200/80 px-3 py-2 text-sm"
            placeholder="Hasło startowe (proste, do zmiany po logowaniu)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          {autoPassword ? (
            <button
              type="button"
              className="rounded-lg border border-lime-200/80 bg-lime-50 px-2 py-1 text-xs font-medium text-emerald-900 hover:bg-lime-100"
              onClick={() => setPassword(generateClientSimplePassword())}
            >
              Wygeneruj proste hasło
            </button>
          ) : null}
        </div>
        <input
          className="rounded-xl border border-lime-200/80 px-3 py-2 text-sm"
          placeholder="Imię i nazwisko (opcjonalnie)"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          type="email"
          className="rounded-xl border border-lime-200/80 px-3 py-2 text-sm"
          placeholder="E-mail (opcjonalnie)"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <fieldset className="rounded-xl border border-lime-200/80 bg-lime-50/40 px-3 py-2 text-sm">
          <legend className="px-1 text-xs font-semibold text-emerald-900">Uprawnienia specjalne (opcjonalnie)</legend>
          <div className="mt-1 flex flex-wrap gap-4">
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
          </div>
        </fieldset>
        <input
          type="date"
          className="rounded-xl border border-lime-200/80 px-3 py-2 text-sm"
          value={pzdDate}
          onChange={(e) => setPzdDate(e.target.value)}
          placeholder="Członek PZD od"
        />
        <p className="text-xs text-emerald-900/65 sm:col-span-2">
          Data „Członek PZD od” oznacza początek członkostwa danej osoby w PZD.
        </p>
        <select
          className="rounded-xl border border-lime-200/80 px-3 py-2 text-sm sm:col-span-2"
          value={plotId}
          onChange={(e) => setPlotId(e.target.value)}
        >
          <option value="">(opcjonalnie) przypisz działkę przy tworzeniu</option>
          {plotOptions.map((p) => (
            <option key={p.id} value={p.id}>
              Działka {p.number}
              {p.allowsTwoOwners ? " [2 właścicieli]" : " [1 właściciel]"}
              {p.activeAssignments === 1 && p.assignedTo ? ` (obecnie: ${p.assignedTo})` : ""}
            </option>
          ))}
        </select>
      </div>

      <div className="grid gap-2 sm:grid-cols-2">
        <label className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-lime-200/70 bg-lime-50/40 px-2 text-sm text-emerald-900">
          <input type="checkbox" checked={accountActive} onChange={(e) => setAccountActive(e.target.checked)} />
          Konto aktywne
        </label>
        <label className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-lime-200/70 bg-lime-50/40 px-2 text-sm text-emerald-900">
          <input
            type="checkbox"
            checked={autoPassword}
            onChange={(e) => {
              setAutoPassword(e.target.checked);
              if (e.target.checked) setPassword(generateClientSimplePassword());
            }}
          />
          Auto proste hasło (wymagana zmiana po logowaniu)
        </label>
      </div>

      {error ? <p className="text-sm text-red-700">{error}</p> : null}
      {ok ? <p className="text-sm text-emerald-700">{ok}</p> : null}
      <button
        type="submit"
        disabled={pending}
        className="rounded-xl bg-emerald-700 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-800 disabled:opacity-60"
      >
        {pending ? "Tworzę…" : "Utwórz użytkownika"}
      </button>

      {createdCredentials.length > 0 ? (
        <section className="rounded-xl border border-lime-200/90 bg-lime-50/70 p-4">
          <div className="mb-2 flex items-center justify-between gap-3">
            <h3 className="font-semibold text-emerald-950">Nowo utworzone dane (do wydruku)</h3>
            <button
              type="button"
              onClick={printCredentials}
              className="rounded-lg border border-emerald-300 bg-white px-3 py-1.5 text-xs font-semibold text-emerald-900 hover:bg-emerald-50"
            >
              Drukuj listę
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr>
                  <th className="px-2 py-1">Login</th>
                  <th className="px-2 py-1">Hasło startowe</th>
                  <th className="px-2 py-1">Nazwa</th>
                  <th className="px-2 py-1">Działka</th>
                </tr>
              </thead>
              <tbody>
                {createdCredentials.map((c, idx) => (
                  <tr key={`${c.login}-${idx}`} className="border-t border-lime-200/70">
                    <td className="px-2 py-1 font-medium">{c.login}</td>
                    <td className="px-2 py-1">{c.password}</td>
                    <td className="px-2 py-1">{c.name ?? "—"}</td>
                    <td className="px-2 py-1">{c.plotLabel ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}
    </form>
  );
}
