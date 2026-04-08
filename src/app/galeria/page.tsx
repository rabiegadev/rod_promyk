import { prisma } from "@/lib/prisma";

export default async function GaleriaPage() {
  const items = await prisma.galleryItem.findMany({ orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }] });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-emerald-950">Galeria</h1>
      {items.length === 0 ? (
        <p className="text-emerald-950/70">Zdjęcia pojawią się po dodaniu ich w panelu administratora.</p>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((g) => (
            <li key={g.id} className="overflow-hidden rounded-xl border border-emerald-900/10 bg-white shadow-sm">
              <div className="aspect-[4/3] w-full bg-emerald-50">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={g.imageUrl} alt={g.caption ?? "Zdjęcie z ogrodu"} className="h-full w-full object-cover" />
              </div>
              {g.caption ? <p className="p-3 text-sm text-emerald-950/85">{g.caption}</p> : null}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
