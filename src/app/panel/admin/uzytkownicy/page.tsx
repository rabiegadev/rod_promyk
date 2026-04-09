import Link from "next/link";

import { UserCreateForm } from "@/components/panel/user-create-form";
import { prisma } from "@/lib/prisma";

export default async function AdminUsersPage() {
  const [users, plots] = await Promise.all([
    prisma.user.findMany({
      orderBy: [{ login: "asc" }],
      select: {
        id: true,
        login: true,
        email: true,
        name: true,
        roles: { select: { role: true } },
        accountActive: true,
        pzdMemberSince: true,
        _count: {
          select: {
            plotAssignmentsAsHolder: {
              where: { unassignedAt: null },
            },
          },
        },
      },
    }),
    prisma.plot.findMany({
      orderBy: { number: "asc" },
      include: {
        assignments: {
          where: { unassignedAt: null },
          include: { user: { select: { name: true, login: true } } },
        },
      },
    }),
  ]);

  const plotOptions = plots
    .filter((p) => p.assignments.length === 0 || (p.assignments.length === 1 && p.allowsTwoOwners))
    .map((p) => ({
      id: p.id,
      number: p.number,
      allowsTwoOwners: p.allowsTwoOwners,
      activeAssignments: p.assignments.length,
      assignedTo:
        p.assignments[0]?.user.name ??
        p.assignments[0]?.user.login ??
        null,
    }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-emerald-950 sm:text-2xl">Użytkownicy</h1>
        <p className="mt-1 text-sm text-emerald-900/70">Kliknij wiersz, aby edytować konto i zobaczyć historię statusów.</p>
      </div>

      <UserCreateForm plotOptions={plotOptions} />

      <div className="overflow-x-auto overscroll-x-contain rounded-2xl border border-lime-200/80 bg-white/90 shadow-sm [-webkit-overflow-scrolling:touch]">
        <table className="w-full min-w-[36rem] text-left text-sm md:min-w-0">
          <thead className="bg-lime-50/80 text-emerald-900">
            <tr>
              <th className="px-3 py-2 font-medium">Login / nazwa</th>
              <th className="px-3 py-2 font-medium">E-mail</th>
              <th className="px-3 py-2 font-medium">Rola</th>
              <th className="px-3 py-2 font-medium">Aktywny</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-t border-lime-100/90">
                <td className="px-3 py-2">
                  <Link href={`/panel/admin/uzytkownicy/${u.id}`} className="font-medium text-emerald-900 hover:underline">
                    {u.name ?? u.login ?? u.id}
                  </Link>
                </td>
                <td className="px-3 py-2 text-emerald-900/75">{u.email ?? "—"}</td>
                <td className="px-3 py-2">
                  {[
                    ...(u.roles.some((r) => r.role === "ADMIN") ? ["ADMIN"] : []),
                    ...(u.roles.some((r) => r.role === "TREASURER") ? ["TREASURER"] : []),
                    ...(u._count.plotAssignmentsAsHolder > 0 ? ["DZIAŁKOWIEC"] : []),
                  ].join(", ") || "—"}
                </td>
                <td className="px-3 py-2">{u.accountActive ? "tak" : "nie"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-sm text-emerald-900/60">
        <Link href="/panel/admin" className="font-medium text-emerald-800 hover:underline">
          ← Administracja
        </Link>
      </p>
    </div>
  );
}
