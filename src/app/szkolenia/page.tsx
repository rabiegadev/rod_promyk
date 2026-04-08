import { prisma } from "@/lib/prisma";

export default async function SzkoleniaPage() {
  const list = await prisma.training.findMany({ orderBy: { startsAt: "desc" } });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-emerald-950">Szkolenia</h1>
      {list.length === 0 ? (
        <p className="text-emerald-950/70">Brak zaplanowanych szkoleń.</p>
      ) : (
        <ul className="space-y-4">
          {list.map((t) => (
            <li key={t.id} className="rounded-xl border border-emerald-900/10 bg-white p-5 shadow-sm">
              <h2 className="text-lg font-semibold text-emerald-950">{t.title}</h2>
              <p className="mt-1 text-sm text-emerald-800/70">
                {t.startsAt ? t.startsAt.toLocaleString("pl-PL") : "Data do ustalenia"}
                {t.location ? ` · ${t.location}` : ""}
              </p>
              {t.description ? (
                <p className="mt-3 whitespace-pre-wrap text-sm text-emerald-950/85">{t.description}</p>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
