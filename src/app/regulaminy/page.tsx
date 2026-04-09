import { DocumentKind } from "@prisma/client";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { prisma } from "@/lib/prisma";

export default async function RegulaminyPage() {
  const docs = await prisma.document.findMany({
    where: { kind: DocumentKind.REGULATION },
    orderBy: { sortOrder: "asc" },
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-emerald-950">Regulaminy</h1>
      {docs.length === 0 ? (
        <p className="text-emerald-950/70">Dokumenty zostaną opublikowane przez zarząd.</p>
      ) : (
        <ul className="space-y-4">
          {docs.map((d) => (
            <li key={d.id} className="rounded-xl border border-emerald-900/10 bg-white p-5 shadow-sm">
              <h2 className="font-semibold text-emerald-950">{d.title}</h2>
              {d.fileUrl ? (
                <a href={d.fileUrl} className="mt-2 inline-block text-sm text-emerald-800 hover:underline">
                  Pobierz plik
                </a>
              ) : null}
              {d.content ? (
                <article className="prose prose-sm mt-3 max-w-none prose-headings:text-emerald-950 prose-p:text-emerald-950 prose-li:text-emerald-950">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{d.content}</ReactMarkdown>
                </article>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
