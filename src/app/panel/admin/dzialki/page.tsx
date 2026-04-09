import Link from "next/link";

import { PlotsAssignPanel } from "@/components/panel/plots-assign-panel";
import { prisma } from "@/lib/prisma";

export default async function AdminPlotsPage() {
  const [plots, holders, plotLogs] = await Promise.all([
    prisma.plot.findMany({
      orderBy: { number: "asc" },
      include: {
        assignments: {
          where: { unassignedAt: null },
          include: { user: { select: { id: true, login: true, name: true } } },
        },
      },
    }),
    prisma.user.findMany({
      where: {
        accountActive: true,
        plotAssignmentsAsHolder: {
          none: { unassignedAt: null },
        },
      },
      orderBy: { login: "asc" },
      select: { id: true, login: true, name: true },
    }),
    prisma.plotChangeLog.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        plot: { select: { id: true } },
        user: { select: { id: true, login: true, name: true } },
        changedBy: { select: { login: true, name: true } },
      },
      take: 400,
    }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-emerald-950">Działki</h1>
        <p className="mt-1 text-sm text-emerald-900/70">Przypisanie konta działkowca do numeru działki.</p>
      </div>

      <PlotsAssignPanel
        plots={plots}
        holders={holders}
        plotLogs={plotLogs.map((l) => ({
          id: l.id,
          plotId: l.plotId,
          action: l.action,
          details: l.details,
          createdAt: l.createdAt,
          userLabel: l.user ? (l.user.name ?? l.user.login ?? l.user.id) : null,
          changedByLabel: l.changedBy ? (l.changedBy.name ?? l.changedBy.login ?? "—") : "system",
        }))}
      />

      <p className="text-sm text-emerald-900/60">
        <Link href="/panel/admin" className="font-medium text-emerald-800 hover:underline">
          ← Administracja
        </Link>
      </p>
    </div>
  );
}
