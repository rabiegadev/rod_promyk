"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { MarkdownEditor } from "@/components/panel/markdown-editor";

type F = {
  gardenBankAccount: string | null;
  waterBankAccount: string | null;
  otherAccountsNote: string | null;
  contactPhone: string | null;
  contactEmail: string | null;
  extraMarkdown: string | null;
};

export function FormalitiesEditForm({ initial }: { initial: F }) {
  const router = useRouter();
  const [form, setForm] = useState<F>(initial);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setPending(true);
    const res = await fetch("/api/admin/formalities", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        contactEmail: form.contactEmail === "" ? null : form.contactEmail,
      }),
    });
    setPending(false);
    if (!res.ok) {
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      setError(data.error ?? "Nie udało się zapisać.");
      return;
    }
    router.refresh();
  }

  function field<K extends keyof F>(key: K, label: string, multiline?: boolean) {
    return (
      <div>
        <label className="text-sm font-medium text-emerald-950" htmlFor={key}>
          {label}
        </label>
        {multiline ? (
          <textarea
            id={key}
            className="mt-1 min-h-[100px] w-full rounded-xl border border-lime-200/80 px-3 py-2 text-sm"
            value={form[key] ?? ""}
            onChange={(e) => setForm({ ...form, [key]: e.target.value })}
          />
        ) : (
          <input
            id={key}
            className="mt-1 w-full rounded-xl border border-lime-200/80 px-3 py-2 text-sm"
            value={form[key] ?? ""}
            onChange={(e) => setForm({ ...form, [key]: e.target.value })}
          />
        )}
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4 rounded-2xl border border-lime-200/90 bg-white/90 p-5 shadow-sm">
      {field("gardenBankAccount", "Konto ogrodu")}
      {field("waterBankAccount", "Konto wody")}
      {field("otherAccountsNote", "Inne uwagi do przelewów", true)}
      {field("contactPhone", "Telefon (widoczny w sekcji)")}
      {field("contactEmail", "E-mail (widoczny w sekcji)")}
      <MarkdownEditor
        id="extraMarkdown"
        label="Dodatkowa treść (markdown)"
        value={form.extraMarkdown ?? ""}
        onChange={(next) => setForm({ ...form, extraMarkdown: next })}
        minHeightClassName="min-h-[220px]"
        placeholder="Np. instrukcja wykonania przelewu, terminy i uwagi..."
      />
      {error ? <p className="text-sm text-red-700">{error}</p> : null}
      <button
        type="submit"
        disabled={pending}
        className="rounded-xl bg-emerald-700 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-800 disabled:opacity-60"
      >
        {pending ? "Zapisuję…" : "Zapisz formalności"}
      </button>
    </form>
  );
}
