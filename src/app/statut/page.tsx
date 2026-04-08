import { DocumentKind } from "@prisma/client";

import { prisma } from "@/lib/prisma";

export default async function StatutPage() {
  const docs = await prisma.document.findMany({
    where: { kind: DocumentKind.STATUTE },
    orderBy: { sortOrder: "asc" },
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-emerald-950">Statut</h1>
      {docs.length === 0 ? (
        <p className="text-emerald-950/70">Treść statutu zostanie opublikowana przez zarząd.</p>
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
              {d.content ? <p className="mt-3 whitespace-pre-wrap text-sm text-emerald-950/85">{d.content}</p> : null}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
