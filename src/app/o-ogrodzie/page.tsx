import { prisma } from "@/lib/prisma";

export default async function OOgroduPage() {
  const page = await prisma.sitePage.findUnique({ where: { slug: "o-ogrodzie" } });

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-emerald-950">{page?.title ?? "O ogrodzie"}</h1>
      <div className="whitespace-pre-wrap rounded-xl border border-emerald-900/10 bg-white p-6 text-sm text-emerald-950/85 shadow-sm">
        {page?.content ?? "Treść zostanie uzupełniona przez zarząd."}
      </div>
    </div>
  );
}
