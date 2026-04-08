import { prisma } from "@/lib/prisma";

export default async function OsiagnieciaPage() {
  const [page, items] = await Promise.all([
    prisma.sitePage.findUnique({ where: { slug: "osiagniecia" } }),
    prisma.achievement.findMany({ orderBy: [{ year: "desc" }, { title: "asc" }] }),
  ]);

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-emerald-950">{page?.title ?? "Osiągnięcia"}</h1>
      {page?.content ? (
        <div className="whitespace-pre-wrap rounded-xl border border-emerald-900/10 bg-white p-6 text-sm text-emerald-950/85 shadow-sm">
          {page.content}
        </div>
      ) : null}
      {items.length === 0 ? (
        <p className="text-emerald-950/70">Lista osiągnięć w przygotowaniu.</p>
      ) : (
        <ul className="space-y-3">
          {items.map((a) => (
            <li key={a.id} className="rounded-lg border border-emerald-900/10 bg-white px-4 py-3 shadow-sm">
              <span className="font-medium text-emerald-950">{a.title}</span>
              {a.year ? <span className="ml-2 text-sm text-emerald-800/70">({a.year})</span> : null}
              {a.description ? (
                <p className="mt-2 text-sm text-emerald-950/80">{a.description}</p>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
