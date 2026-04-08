import { prisma } from "@/lib/prisma";

export default async function KontaktPage() {
  const board = await prisma.boardMember.findMany({ orderBy: { sortOrder: "asc" } });

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-emerald-950">Kontakt</h1>
      <p className="text-sm text-emerald-950/75">
        Dane kontaktowe do zarządu można edytować w bazie (tabela <code className="rounded bg-emerald-100 px-1">BoardMember</code>) —
        wkrótce formularz w panelu administratora.
      </p>
      {board.length === 0 ? (
        <p className="text-emerald-950/70">Lista zarządu zostanie uzupełniona.</p>
      ) : (
        <ul className="space-y-4">
          {board.map((b) => (
            <li key={b.id} className="rounded-xl border border-emerald-900/10 bg-white p-5 shadow-sm">
              <p className="font-semibold text-emerald-950">{b.name}</p>
              <p className="text-sm text-emerald-800/80">{b.roleTitle}</p>
              <p className="mt-2 text-sm text-emerald-950/85">
                {b.phone ? <>Tel. {b.phone}</> : null}
                {b.phone && b.email ? " · " : null}
                {b.email ? <a href={`mailto:${b.email}`}>{b.email}</a> : null}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
