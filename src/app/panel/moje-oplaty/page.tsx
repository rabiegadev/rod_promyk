import Link from "next/link";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export default async function MojeOplatyPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/logowanie");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      mustSetEmailOnLogin: true,
      mustChangePassword: true,
      _count: { select: { plotAssignmentsAsHolder: { where: { unassignedAt: null } } } },
    },
  });
  if (user?.mustSetEmailOnLogin || user?.mustChangePassword) redirect("/panel");

  const isPlotHolder = (user?._count.plotAssignmentsAsHolder ?? 0) > 0;
  if (!isPlotHolder) {
    return <p className="text-emerald-950/80">Ta strona jest przeznaczona dla działkowców.</p>;
  }

  const assignments = await prisma.plotAssignment.findMany({
    where: { userId: session.user.id, unassignedAt: null },
    include: { plot: true },
  });

  const plotIds = assignments.map((a) => a.plotId);

  const feesOnPlots =
    plotIds.length > 0
      ? await prisma.feeLine.findMany({
          where: { plotId: { in: plotIds } },
          orderBy: [{ dueDate: "asc" }, { createdAt: "desc" }],
        })
      : [];

  const membershipFees = await prisma.feeLine.findMany({
    where: { userId: session.user.id },
    orderBy: [{ dueDate: "asc" }, { createdAt: "desc" }],
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-bold text-emerald-950 sm:text-2xl">Moje opłaty</h1>
        <p className="mt-1 text-sm text-emerald-950/70">Podsumowanie składek przypisanych do Twojej działki i do Ciebie jako członka.</p>
      </div>

      <section>
        <h2 className="text-lg font-semibold text-emerald-950">Przypisane działki</h2>
        {assignments.length === 0 ? (
          <p className="mt-2 text-sm text-emerald-950/70">
            Brak przypisanej działki — prezes musi przypisać działkę do Twojego konta.
          </p>
        ) : (
          <ul className="mt-2 space-y-1 text-sm">
            {assignments.map((a) => (
              <li key={a.id}>
                Działka <span className="font-medium">{a.plot.number}</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <FeeTable title="Opłaty związane z działką" fees={feesOnPlots} empty="Brak pozycji." />

      <FeeTable title="Składki i opłaty członkowskie" fees={membershipFees} empty="Brak pozycji." />

      <Link href="/panel" className="text-sm text-emerald-800 hover:underline">
        ← Panel
      </Link>
    </div>
  );
}

function FeeTable({
  title,
  fees,
  empty,
}: {
  title: string;
  fees: { id: string; label: string; amount: unknown; category: string; dueDate: Date | null; isPaid: boolean }[];
  empty: string;
}) {
  return (
    <section>
      <h2 className="text-lg font-semibold text-emerald-950">{title}</h2>
      {fees.length === 0 ? (
        <p className="mt-2 text-sm text-emerald-950/70">{empty}</p>
      ) : (
        <div className="mt-3 overflow-x-auto overscroll-x-contain rounded-lg border border-emerald-900/10 bg-white shadow-sm [-webkit-overflow-scrolling:touch]">
          <table className="w-full min-w-[36rem] text-left text-sm md:min-w-0">
            <thead className="bg-emerald-50/80 text-emerald-900">
              <tr>
                <th className="px-3 py-2 font-medium">Pozycja</th>
                <th className="px-3 py-2 font-medium">Kategoria</th>
                <th className="px-3 py-2 font-medium">Kwota</th>
                <th className="px-3 py-2 font-medium">Termin</th>
                <th className="px-3 py-2 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {fees.map((f) => (
                <tr key={f.id} className={f.isPaid ? "bg-emerald-50/40" : ""}>
                  <td className="px-3 py-2">{f.label}</td>
                  <td className="px-3 py-2 text-emerald-950/70">{f.category}</td>
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
      )}
    </section>
  );
}
