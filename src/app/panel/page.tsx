import Link from "next/link";
import { redirect } from "next/navigation";

import { CompletePasswordForm } from "@/components/complete-password-form";
import { CompleteEmailForm } from "@/components/complete-email-form";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Role } from "@prisma/client";

export default async function PanelPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/logowanie");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      mustSetEmailOnLogin: true,
      mustChangePassword: true,
      login: true,
      name: true,
      roles: { select: { role: true } },
      _count: {
        select: {
          plotAssignmentsAsHolder: {
            where: { unassignedAt: null },
          },
        },
      },
    },
  });

  if (!user) redirect("/logowanie");

  const roleList = user.roles.map((r) => r.role);
  const isAdmin = roleList.includes(Role.ADMIN);
  const isTreasurer = roleList.includes(Role.TREASURER);
  const isPlotHolder = user._count.plotAssignmentsAsHolder > 0;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-bold text-emerald-950 sm:text-2xl">Panel</h1>
        <p className="mt-1 text-sm text-emerald-950/70">
          Zalogowano: <span className="font-medium">{user.name ?? user.login ?? session.user.email}</span> · uprawnienia:{" "}
          <span className="font-medium">{roleLabel(roleList, isPlotHolder)}</span>
        </p>
      </div>

      {user.mustSetEmailOnLogin ? <CompleteEmailForm /> : null}
      {user.mustChangePassword ? <CompletePasswordForm /> : null}

      <div className="grid gap-4 md:grid-cols-2">
        {!user.mustSetEmailOnLogin && !user.mustChangePassword && (isAdmin || isTreasurer) && (
          <section className="rounded-xl border border-emerald-900/10 bg-white p-5 shadow-sm">
            <h2 className="font-semibold text-emerald-950">Skarbnik / zarząd</h2>
            <ul className="mt-3 space-y-2 text-sm">
              <li>
                <Link href="/panel/oplaty" className="text-emerald-800 hover:underline">
                  Opłaty i rozliczenia
                </Link>
              </li>
            </ul>
          </section>
        )}

        {!user.mustSetEmailOnLogin && !user.mustChangePassword && isAdmin && (
          <section className="rounded-2xl border border-lime-200/90 bg-white/90 p-5 shadow-sm shadow-lime-900/5">
            <h2 className="font-semibold text-emerald-950">Administrator</h2>
            <p className="mt-2 text-sm text-emerald-900/75">
              Pełny panel: ogłoszenia, galeria, użytkownicy i historia statusów, działki, formalności, zarząd, import zbiorczy, czat.
            </p>
            <p className="mt-3">
              <Link
                href="/panel/admin"
                className="inline-flex rounded-xl bg-emerald-700 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-800"
              >
                Otwórz panel administratora
              </Link>
            </p>
          </section>
        )}

        {!user.mustSetEmailOnLogin && !user.mustChangePassword && isPlotHolder && (
          <section className="rounded-xl border border-emerald-900/10 bg-white p-5 shadow-sm">
            <h2 className="font-semibold text-emerald-950">Działkowiec</h2>
            <ul className="mt-3 space-y-2 text-sm">
              <li>
                <Link href="/panel/moje-oplaty" className="text-emerald-800 hover:underline">
                  Moje opłaty
                </Link>
              </li>
              <li>
                <Link href="/panel/czat" className="text-emerald-800 hover:underline">
                  Czat z zarządem
                </Link>
              </li>
              <li>
                <Link href="/panel/formalnosci" className="text-emerald-800 hover:underline">
                  Formalności (numery kont)
                </Link>
              </li>
              <li>
                <Link href="/o-ogrodzie?plan=1" className="text-emerald-800 hover:underline">
                  Plan działek (treść w „O ogrodzie”)
                </Link>
              </li>
            </ul>
          </section>
        )}
      </div>

      <p className="text-sm text-emerald-950/60">
        <Link href="/" className="text-emerald-800 hover:underline">
          Wróć na stronę główną
        </Link>
      </p>
    </div>
  );
}

function roleLabel(roles: Role[], isPlotHolder: boolean) {
  const labels: string[] = [];
  if (roles.includes(Role.ADMIN)) labels.push("Administrator / prezes");
  if (roles.includes(Role.TREASURER)) labels.push("Skarbnik");
  if (isPlotHolder) labels.push("Działkowiec");
  if (labels.length === 0) return "Brak ról specjalnych";
  return labels.join(", ");
}
