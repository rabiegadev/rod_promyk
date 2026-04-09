"use client";

import { DocumentKind } from "@prisma/client";
import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

type Item = {
  id: string;
  title: string;
  kind: DocumentKind;
  fileUrl: string | null;
  content: string | null;
  sortOrder: number;
};

export function DocumentsAdminPanel({ items }: { items: Item[] }) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [kind, setKind] = useState<DocumentKind>(DocumentKind.REGULATION);
  const [content, setContent] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setPending(true);
    const form = new FormData();
    form.set("title", title);
    form.set("kind", kind);
    form.set("content", content);
    if (file) form.set("file", file);

    const res = await fetch("/api/admin/documents/upload", {
      method: "POST",
      body: form,
    });
    setPending(false);
    if (!res.ok) {
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      setError(data.error ?? "Nie udało się dodać dokumentu.");
      return;
    }
    setTitle("");
    setContent("");
    setFile(null);
    router.refresh();
  }

  async function remove(id: string) {
    if (!confirm("Usunąć dokument?")) return;
    const res = await fetch(`/api/admin/documents/${id}`, { method: "DELETE" });
    if (res.ok) router.refresh();
  }

  return (
    <div className="space-y-8">
      <form onSubmit={add} className="space-y-4 rounded-2xl border border-lime-200/90 bg-white/90 p-5 shadow-sm">
        <h2 className="font-semibold text-emerald-950">Dodaj dokument</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <input
            className="w-full rounded-xl border border-lime-200/80 px-3 py-2 text-sm"
            placeholder="Tytuł dokumentu"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
          <select
            className="w-full rounded-xl border border-lime-200/80 px-3 py-2 text-sm"
            value={kind}
            onChange={(e) => setKind(e.target.value as DocumentKind)}
          >
            <option value={DocumentKind.REGULATION}>Regulamin</option>
            <option value={DocumentKind.STATUTE}>Statut</option>
            <option value={DocumentKind.OTHER}>Inny</option>
          </select>
        </div>
        <input
          type="file"
          className="w-full rounded-xl border border-lime-200/80 px-3 py-2 text-sm"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
        />
        <textarea
          className="min-h-[120px] w-full rounded-xl border border-lime-200/80 px-3 py-2 text-sm"
          placeholder="Treść dokumentu (opcjonalnie). Możesz dodać sam plik, sam tekst lub oba."
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
        {error ? <p className="text-sm text-red-700">{error}</p> : null}
        <button
          type="submit"
          disabled={pending}
          className="rounded-xl bg-emerald-700 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-800 disabled:opacity-60"
        >
          {pending ? "Wysyłam…" : "Dodaj dokument"}
        </button>
      </form>

      <ul className="space-y-3">
        {items.map((d) => (
          <li key={d.id} className="rounded-2xl border border-lime-200/90 bg-white/90 p-4 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate font-semibold text-emerald-950">{d.title}</p>
                <p className="text-xs text-emerald-900/65">
                  {d.kind}
                  {d.fileUrl ? " · ma plik" : ""}
                  {d.content ? " · ma treść" : ""}
                </p>
                {d.fileUrl ? (
                  <a href={d.fileUrl} className="mt-1 inline-block text-sm text-emerald-800 hover:underline" target="_blank" rel="noreferrer">
                    Otwórz plik
                  </a>
                ) : null}
              </div>
              <button
                type="button"
                onClick={() => void remove(d.id)}
                className="rounded-lg p-2 text-red-700 hover:bg-red-50"
                aria-label="Usuń dokument"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
