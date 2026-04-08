import { prisma } from "@/lib/prisma";

export default async function OgloszeniaPage() {
  const list = await prisma.announcement.findMany({
    orderBy: { publishedAt: "desc" },
    include: { author: { select: { name: true, login: true } } },
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-emerald-950">Ogłoszenia</h1>
      {list.length === 0 ? (
        <p className="text-emerald-950/70">Brak ogłoszeń.</p>
      ) : (
        <ul className="space-y-4">
          {list.map((a) => (
            <li key={a.id} className="rounded-xl border border-emerald-900/10 bg-white p-5 shadow-sm">
              <h2 className="text-lg font-semibold text-emerald-950">{a.title}</h2>
              <p className="mt-1 text-xs text-emerald-800/60">
                {a.publishedAt.toLocaleString("pl-PL")}
                {a.author ? ` · ${a.author.name ?? a.author.login}` : ""}
              </p>
              <p className="mt-3 whitespace-pre-wrap text-sm text-emerald-950/85">{a.body}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
