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
      role: true,
      accountActive: true,
      pzdMemberSince: true,
    },
  });

  if (!user) notFound();

  const history = await getUserStatusHistory(id);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-emerald-950">Użytkownik</h1>
        <p className="mt-1 text-sm text-emerald-900/70">Edycja roli, aktywności i członkostwa PZD.</p>
      </div>

      <UserEditForm user={user} />

      <section className="rounded-2xl border border-lime-200/90 bg-white/90 p-5 shadow-sm">
        <h2 className="font-semibold text-emerald-950">Historia statusów</h2>
        {history.length === 0 ? (
          <p className="mt-2 text-sm text-emerald-900/70">Brak wpisów — pojawią się przy pierwszej zmianie statusu lub daty PZD.</p>
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
