"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

type MarkdownEditorProps = {
  id: string;
  label: string;
  value: string;
  onChange: (next: string) => void;
  placeholder?: string;
  minHeightClassName?: string;
};

const snippets = [
  { label: "Nagłówek", value: "## Nagłówek" },
  { label: "Pogrubienie", value: "**ważne**" },
  { label: "Lista", value: "- punkt 1\n- punkt 2" },
  { label: "Link", value: "[tekst linku](https://example.com)" },
];

export function MarkdownEditor({
  id,
  label,
  value,
  onChange,
  placeholder,
  minHeightClassName = "min-h-[180px]",
}: MarkdownEditorProps) {
  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <label className="text-sm font-medium text-emerald-950" htmlFor={id}>
          {label}
        </label>
        <div className="flex flex-wrap gap-1.5">
          {snippets.map((snippet) => (
            <button
              key={snippet.label}
              type="button"
              className="rounded-lg border border-lime-200 bg-lime-50 px-2 py-1 text-xs font-medium text-emerald-900 hover:bg-lime-100"
              onClick={() => {
                const prefix = value.trim().length === 0 ? "" : "\n\n";
                onChange(`${value}${prefix}${snippet.value}`);
              }}
            >
              {snippet.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        <textarea
          id={id}
          className={`${minHeightClassName} w-full rounded-xl border border-lime-200/80 bg-white px-3 py-2 text-sm`}
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
        />
        <div className={`${minHeightClassName} overflow-auto rounded-xl border border-lime-200/80 bg-lime-50/50 px-3 py-2`}>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-emerald-800/70">Podgląd</p>
          <article className="prose prose-sm max-w-none prose-headings:text-emerald-950 prose-p:text-emerald-950 prose-li:text-emerald-950 prose-strong:text-emerald-950">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {value.trim().length > 0 ? value : "_Podgląd markdown pojawi się tutaj._"}
            </ReactMarkdown>
          </article>
        </div>
      </div>
    </div>
  );
}
