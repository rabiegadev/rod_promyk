import Link from "next/link";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Role } from "@prisma/client";

export default async function OplatyZarzadPage() {
  const session = await auth();
  if (!session?.user) redirect("/logowanie");
  if (session.user.role !== Role.ADMIN && session.user.role !== Role.TREASURER) {
    return (
      <p className="text-emerald-950/80">
        Dostęp tylko dla administratora i skarbnika.{" "}
        <Link href="/panel" className="text-emerald-800 hover:underline">
          Wróć
        </Link>
      </p>
    );
  }

  const fees = await prisma.feeLine.findMany({
    orderBy: [{ dueDate: "asc" }, { createdAt: "desc" }],
    take: 200,
    include: {
      plot: { select: { number: true } },
      user: { select: { login: true, name: true } },
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-emerald-950">Opłaty (skarbnik)</h1>
        <p className="mt-1 text-sm text-emerald-950/70">
          Lista pozycji z bazy — zaznaczanie „opłacono”, terminy i naliczanie per działka zostanie uzupełnione w UI (obecnie
          widok read-only).
        </p>
      </div>

      <div className="overflow-x-auto rounded-lg border border-emerald-900/10 bg-white shadow-sm">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-emerald-50/80 text-emerald-900">
            <tr>
              <th className="px-3 py-2 font-medium">Pozycja</th>
              <th className="px-3 py-2 font-medium">Działka</th>
              <th className="px-3 py-2 font-medium">Członek</th>
              <th className="px-3 py-2 font-medium">Kwota</th>
              <th className="px-3 py-2 font-medium">Termin</th>
              <th className="px-3 py-2 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {fees.map((f) => (
              <tr key={f.id} className={f.isPaid ? "bg-emerald-100/50" : ""}>
                <td className="px-3 py-2">{f.label}</td>
                <td className="px-3 py-2 text-emerald-950/70">{f.plot?.number ?? "—"}</td>
                <td className="px-3 py-2 text-emerald-950/70">{f.user?.name ?? f.user?.login ?? "—"}</td>
                <td className="px-3 py-2 font-medium">{String(f.amount)} zł</td>
                <td className="px-3 py-2 text-emerald-950/70">
                  {f.dueDate ? f.dueDate.toLocaleDateString("pl-PL") : "—"}
                </td>
                <td className="px-3 py-2">{f.isPaid ? "Opłacono" : "Do zapłaty"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Link href="/panel" className="text-sm text-emerald-800 hover:underline">
        ← Panel
      </Link>
    </div>
  );
}
