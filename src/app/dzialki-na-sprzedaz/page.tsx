import { prisma } from "@/lib/prisma";

export default async function DzialkiNaSprzedazPage() {
  const plots = await prisma.plot.findMany({
    where: { availableForPurchase: true },
    orderBy: { number: "asc" },
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-emerald-950">Działki dostępne do zakupu</h1>
      {plots.length === 0 ? (
        <p className="text-emerald-950/70">Aktualnie brak działek w ofercie — sprawdzaj ogłoszenia lub skontaktuj się z zarządem.</p>
      ) : (
        <ul className="space-y-3">
          {plots.map((p) => (
            <li key={p.id} className="rounded-xl border border-emerald-900/10 bg-white p-5 shadow-sm">
              <span className="text-lg font-semibold text-emerald-950">Działka {p.number}</span>
              {p.areaSqm != null ? (
                <span className="ml-2 text-sm text-emerald-800/70">· {p.areaSqm} m²</span>
              ) : null}
              {p.purchaseInfo ? (
                <p className="mt-2 whitespace-pre-wrap text-sm text-emerald-950/85">{p.purchaseInfo}</p>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
