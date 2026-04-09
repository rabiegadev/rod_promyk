"use client";

import { Role } from "@prisma/client";
import { useRouter } from "next/navigation";
import { useState } from "react";

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
  const [role, setRole] = useState<Role>(Role.PLOT_HOLDER);
  const [accountActive, setAccountActive] = useState(true);
  const [pzdDate, setPzdDate] = useState("");
  const [plotId, setPlotId] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);
  const [createdCredentials, setCreatedCredentials] = useState<CreatedCredential[]>([]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    setError(null);
    setOk(null);
    if (!autoPassword && password.length < 3) {
      setPending(false);
      setError("Podaj hasło albo zaznacz automatyczne hasło.");
      return;
    }

    const res = await fetch("/api/admin/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        login,
        password: autoPassword ? undefined : password,
        autoGenerateSimplePassword: autoPassword,
        name: name || null,
        email: email || null,
        role,
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
    setRole(Role.PLOT_HOLDER);
    setAccountActive(true);
    setPzdDate("");
    setPlotId("");
    router.refresh();
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
      <p className="text-sm text-emerald-900/70">
        Jeśli nie podasz e-maila, użytkownik będzie musiał go uzupełnić po pierwszym logowaniu.
      </p>
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
            type="password"
            className="w-full rounded-xl border border-lime-200/80 px-3 py-2 text-sm"
            placeholder={autoPassword ? "Hasło wygeneruje się automatycznie" : "Hasło (proste startowe)"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={autoPassword}
            required={!autoPassword}
          />
          {autoPassword ? (
            <button
              type="button"
              className="rounded-lg border border-lime-200/80 bg-lime-50 px-2 py-1 text-xs font-medium text-emerald-900 hover:bg-lime-100"
              onClick={() => setPassword(generateClientSimplePassword())}
            >
              Podejrzyj losowe hasło
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
        <select
          className="rounded-xl border border-lime-200/80 px-3 py-2 text-sm"
          value={role}
          onChange={(e) => setRole(e.target.value as Role)}
        >
          <option value={Role.PLOT_HOLDER}>Działkowiec</option>
          <option value={Role.TREASURER}>Skarbnik</option>
          <option value={Role.ADMIN}>Administrator</option>
        </select>
        <input
          type="date"
          className="rounded-xl border border-lime-200/80 px-3 py-2 text-sm"
          value={pzdDate}
          onChange={(e) => setPzdDate(e.target.value)}
          placeholder="Członek PZD od"
        />
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

      <label className="inline-flex items-center gap-2 text-sm text-emerald-900">
        <input type="checkbox" checked={accountActive} onChange={(e) => setAccountActive(e.target.checked)} />
        Konto aktywne
      </label>
      <label className="inline-flex items-center gap-2 text-sm text-emerald-900">
        <input
          type="checkbox"
          checked={autoPassword}
          onChange={(e) => {
            setAutoPassword(e.target.checked);
            if (e.target.checked && !password) setPassword(generateClientSimplePassword());
          }}
        />
        Automatycznie wygeneruj proste hasło startowe (wymagana zmiana po logowaniu)
      </label>

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
