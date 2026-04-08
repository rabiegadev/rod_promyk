import Link from "next/link";
import { redirect } from "next/navigation";

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
      role: true,
      login: true,
      name: true,
    },
  });

  if (!user) redirect("/logowanie");

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-emerald-950">Panel</h1>
        <p className="mt-1 text-sm text-emerald-950/70">
          Zalogowano: <span className="font-medium">{user.name ?? user.login ?? session.user.email}</span> · rola:{" "}
          <span className="font-medium">{roleLabel(user.role)}</span>
        </p>
      </div>

      {user.mustSetEmailOnLogin ? <CompleteEmailForm /> : null}

      <div className="grid gap-4 md:grid-cols-2">
        {(user.role === Role.ADMIN || user.role === Role.TREASURER) && (
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

        {user.role === Role.ADMIN && (
          <section className="rounded-xl border border-emerald-900/10 bg-white p-5 shadow-sm">
            <h2 className="font-semibold text-emerald-950">Administrator</h2>
            <p className="mt-2 text-sm text-emerald-950/75">
              Masowy import działek i kont: endpointy <code className="rounded bg-emerald-50 px-1">POST /api/admin/bulk-plots</code> oraz{" "}
              <code className="rounded bg-emerald-50 px-1">POST /api/admin/bulk-users</code> (max 50 na żądanie). Wkrótce: formularz w
              panelu.
            </p>
          </section>
        )}

        {user.role === Role.PLOT_HOLDER && (
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

function roleLabel(role: Role) {
  switch (role) {
    case Role.ADMIN:
      return "Administrator / prezes";
    case Role.TREASURER:
      return "Skarbnik";
    default:
      return "Działkowiec";
  }
}
