import Link from "next/link";
import { notFound } from "next/navigation";

import { UserEditForm } from "@/components/panel/user-edit-form";
import { prisma } from "@/lib/prisma";
import { getUserStatusHistory } from "@/lib/user-status";

export default async function AdminUserDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      login: true,
      email: true,
      name: true,
      roles: { select: { role: true } },
      accountActive: true,
      pzdMemberSince: true,
    },
  });

  if (!user) notFound();

  const history = await getUserStatusHistory(id);
  const changeLogs = await prisma.userChangeLog.findMany({
    where: { userId: id },
    orderBy: { createdAt: "desc" },
    include: {
      changedBy: { select: { name: true, login: true } },
      plot: { select: { number: true } },
    },
    take: 200,
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-emerald-950">Użytkownik</h1>
        <p className="mt-1 text-sm text-emerald-900/70">Edycja roli, aktywności i członkostwa PZD.</p>
      </div>

      <UserEditForm user={user} />

      <section className="rounded-2xl border border-lime-200/90 bg-white/90 p-5 shadow-sm">
        <h2 className="font-semibold text-emerald-950">Historia zmian konta</h2>
        {changeLogs.length === 0 ? (
          <p className="mt-2 text-sm text-emerald-900/70">Brak wpisów — każdy etap zmian będzie zapisywany automatycznie.</p>
        ) : (
          <ul className="mt-4 space-y-3 text-sm">
            {changeLogs.map((h) => (
              <li key={h.id} className="rounded-xl border border-lime-100 bg-lime-50/50 px-3 py-2">
                <p className="text-xs text-emerald-800/60">{h.createdAt.toLocaleString("pl-PL")}</p>
                <p className="mt-1 font-semibold text-emerald-950">{h.action}</p>
                {h.details ? <p className="mt-1 text-emerald-900/85">{h.details}</p> : null}
                <p className="text-xs text-emerald-800/70">
                  Autor: {h.changedBy?.name ?? h.changedBy?.login ?? "system"}
                  {h.plot ? ` · Działka: ${h.plot.number}` : ""}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="rounded-2xl border border-lime-200/90 bg-white/90 p-5 shadow-sm">
        <h2 className="font-semibold text-emerald-950">Historia statusów (okresy)</h2>
        {history.length === 0 ? (
          <p className="mt-2 text-sm text-emerald-900/70">Brak wpisów.</p>
        ) : (
          <ul className="mt-4 space-y-3 text-sm">
            {history.map((h) => (
              <li key={h.id} className="rounded-xl border border-lime-100 bg-lime-50/50 px-3 py-2">
                <p className="text-xs text-emerald-800/60">
                  {h.effectiveFrom.toLocaleString("pl-PL")}
                  {h.effectiveTo ? ` → ${h.effectiveTo.toLocaleString("pl-PL")}` : " → obecnie"}
                </p>
                <p className="mt-1 text-emerald-950">
                  Aktywny: {h.accountActive ? "tak" : "nie"}
                  {h.pzdMemberSince ? ` · PZD od ${h.pzdMemberSince.toLocaleDateString("pl-PL")}` : ""}
                </p>
                <p className="text-xs text-emerald-800/70">
                  Zmiana: {h.changedBy.name ?? h.changedBy.login ?? "—"}
                  {h.note ? ` · ${h.note}` : ""}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>

      <p className="text-sm text-emerald-900/60">
        <Link href="/panel/admin/uzytkownicy" className="font-medium text-emerald-800 hover:underline">
          ← Lista użytkowników
        </Link>
      </p>
    </div>
  );
}
