"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { MarkdownEditor } from "@/components/panel/markdown-editor";

export function AnnouncementForm() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setPending(true);
    const res = await fetch("/api/admin/announcements", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, body }),
    });
    setPending(false);
    if (!res.ok) {
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      setError(data.error ?? "Nie udało się opublikować.");
      return;
    }
    setTitle("");
    setBody("");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4 rounded-2xl border border-lime-200/90 bg-white/90 p-5 shadow-sm">
      <div>
        <label className="text-sm font-medium text-emerald-950" htmlFor="title">
          Tytuł
        </label>
        <input
          id="title"
          className="mt-1 w-full rounded-xl border border-lime-200/80 px-3 py-2 text-sm"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
      </div>
      <MarkdownEditor
        id="body"
        label="Treść (markdown)"
        value={body}
        onChange={setBody}
        minHeightClassName="min-h-[220px]"
        placeholder="Napisz treść ogłoszenia..."
      />
      {error ? <p className="text-sm text-red-700">{error}</p> : null}
      <button
        type="submit"
        disabled={pending}
        className="rounded-xl bg-emerald-700 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-800 disabled:opacity-60"
      >
        {pending ? "Publikuję…" : "Opublikuj ogłoszenie"}
      </button>
    </form>
  );
}
