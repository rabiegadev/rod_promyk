import { prisma } from "@/lib/prisma";

export default async function ImprezyPage() {
  const events = await prisma.gardenEvent.findMany({ orderBy: { startsAt: "desc" } });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-emerald-950">Imprezy i wydarzenia</h1>
      {events.length === 0 ? (
        <p className="text-emerald-950/70">Brak zaplanowanych wydarzeń.</p>
      ) : (
        <ul className="space-y-4">
          {events.map((e) => (
            <li key={e.id} className="rounded-xl border border-emerald-900/10 bg-white p-5 shadow-sm">
              <h2 className="text-lg font-semibold text-emerald-950">{e.title}</h2>
              <p className="mt-1 text-sm text-emerald-800/70">
                {e.startsAt.toLocaleString("pl-PL")}
                {e.endsAt ? ` – ${e.endsAt.toLocaleString("pl-PL")}` : ""}
                {e.location ? ` · ${e.location}` : ""}
              </p>
              {e.description ? (
                <p className="mt-3 whitespace-pre-wrap text-sm text-emerald-950/85">{e.description}</p>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
