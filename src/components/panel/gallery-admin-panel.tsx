"use client";

import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

type Item = {
  id: string;
  imageUrl: string;
  caption: string | null;
  sortOrder: number;
};

export function GalleryAdminPanel({ items }: { items: Item[] }) {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState("");
  const [caption, setCaption] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function addByUpload(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!file) {
      setError("Wybierz plik obrazu do wysłania.");
      return;
    }
    const body = new FormData();
    body.set("file", file);
    body.set("caption", caption);

    setPending(true);
    const res = await fetch("/api/admin/gallery/upload", {
      method: "POST",
      body,
    });
    setPending(false);
    if (!res.ok) {
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      setError(data.error ?? "Nie udało się dodać.");
      return;
    }
    setFile(null);
    setCaption("");
    router.refresh();
  }

  async function addByUrl(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setPending(true);
    const res = await fetch("/api/admin/gallery", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ imageUrl, caption: caption || null }),
    });
    setPending(false);
    if (!res.ok) {
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      setError(data.error ?? "Nie udało się dodać.");
      return;
    }
    setImageUrl("");
    setCaption("");
    router.refresh();
  }

  async function remove(id: string) {
    if (!confirm("Usunąć zdjęcie z galerii?")) return;
    const res = await fetch(`/api/admin/gallery/${id}`, { method: "DELETE" });
    if (res.ok) router.refresh();
  }

  return (
    <div className="space-y-8">
      <form onSubmit={addByUpload} className="space-y-3 rounded-2xl border border-lime-200/90 bg-white/90 p-5 shadow-sm">
        <h2 className="font-semibold text-emerald-950">Dodaj zdjęcie (upload pliku)</h2>
        <p className="text-sm text-emerald-900/70">
          Plik trafi do Vercel Blob, a wpis pojawi się automatycznie w galerii.
        </p>
        <input
          type="file"
          accept="image/*"
          className="w-full rounded-xl border border-lime-200/80 px-3 py-2 text-sm"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          required
        />
        <input
          className="w-full rounded-xl border border-lime-200/80 px-3 py-2 text-sm"
          placeholder="Podpis (opcjonalnie)"
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
        />
        {error ? <p className="text-sm text-red-700">{error}</p> : null}
        <button
          type="submit"
          disabled={pending}
          className="rounded-xl bg-emerald-700 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-800 disabled:opacity-60"
        >
          {pending ? "Wysyłam…" : "Wyślij plik"}
        </button>
      </form>

      <form onSubmit={addByUrl} className="space-y-3 rounded-2xl border border-lime-200/90 bg-white/90 p-5 shadow-sm">
        <h2 className="font-semibold text-emerald-950">Alternatywnie: dodaj przez URL</h2>
        <input
          className="w-full rounded-xl border border-lime-200/80 px-3 py-2 text-sm"
          placeholder="https://… lub /uploads/…"
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
          required
        />
        <button
          type="submit"
          disabled={pending}
          className="rounded-xl border border-emerald-700/20 bg-white px-4 py-2 text-sm font-semibold text-emerald-900 hover:bg-lime-50 disabled:opacity-60"
        >
          {pending ? "Dodaję…" : "Dodaj URL"}
        </button>
      </form>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((g) => (
          <div key={g.id} className="overflow-hidden rounded-2xl border border-lime-200/80 bg-white shadow-sm">
            <div className="relative aspect-[4/3] w-full bg-emerald-50">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={g.imageUrl} alt="" className="h-full w-full object-cover" />
            </div>
            <div className="flex items-start justify-between gap-2 p-3">
              <p className="text-sm text-emerald-950/85">{g.caption ?? "—"}</p>
              <button
                type="button"
                onClick={() => void remove(g.id)}
                className="rounded-lg p-2 text-red-700 hover:bg-red-50"
                aria-label="Usuń"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
