import Link from "next/link";

import { PlotsAssignPanel } from "@/components/panel/plots-assign-panel";
import { prisma } from "@/lib/prisma";
import { Role } from "@prisma/client";

export default async function AdminPlotsPage() {
  const [plots, holders] = await Promise.all([
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
      where: { role: Role.PLOT_HOLDER },
      orderBy: { login: "asc" },
      select: { id: true, login: true, name: true },
    }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-emerald-950">Działki</h1>
        <p className="mt-1 text-sm text-emerald-900/70">Przypisanie konta działkowca do numeru działki.</p>
      </div>

      <PlotsAssignPanel plots={plots} holders={holders} />

      <p className="text-sm text-emerald-900/60">
        <Link href="/panel/admin" className="font-medium text-emerald-800 hover:underline">
          ← Administracja
        </Link>
      </p>
    </div>
  );
}
