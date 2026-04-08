import Link from "next/link";

import { prisma } from "@/lib/prisma";

export default async function HomePage() {
  const latest = await prisma.announcement.findMany({
    orderBy: { publishedAt: "desc" },
    take: 3,
    select: { id: true, title: true, publishedAt: true },
  });

  return (
    <div className="space-y-10">
      <section className="rounded-2xl bg-gradient-to-br from-emerald-900 to-emerald-700 px-6 py-12 text-white shadow-lg">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Witamy w ROD „Promyk”</h1>
        <p className="mt-3 max-w-2xl text-lg text-emerald-100">
          Społeczność działkowców w Przylepie — aktualności, wydarzenia, formalności i kontakt z zarządem w jednym
          miejscu.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/ogloszenia"
            className="rounded-md bg-white px-4 py-2 text-sm font-medium text-emerald-900 hover:bg-emerald-50"
          >
            Ogłoszenia
          </Link>
          <Link
            href="/kontakt"
            className="rounded-md border border-white/40 px-4 py-2 text-sm font-medium text-white hover:bg-white/10"
          >
            Kontakt
          </Link>
          <Link
            href="/logowanie"
            className="rounded-md border border-white/40 px-4 py-2 text-sm font-medium text-white hover:bg-white/10"
          >
            Logowanie działkowca
          </Link>
        </div>
      </section>

      <section>
        <div className="flex items-baseline justify-between gap-4">
          <h2 className="text-xl font-semibold text-emerald-950">Ostatnie ogłoszenia</h2>
          <Link href="/ogloszenia" className="text-sm font-medium text-emerald-800 hover:underline">
            Wszystkie
          </Link>
        </div>
        {latest.length === 0 ? (
          <p className="mt-4 text-emerald-950/70">Brak ogłoszeń — zarząd doda je w panelu administracyjnym.</p>
        ) : (
          <ul className="mt-4 space-y-3">
            {latest.map((a) => (
              <li key={a.id} className="rounded-lg border border-emerald-900/10 bg-white px-4 py-3 shadow-sm">
                <p className="font-medium text-emerald-950">{a.title}</p>
                <p className="text-xs text-emerald-800/60">{a.publishedAt.toLocaleDateString("pl-PL")}</p>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="grid gap-6 sm:grid-cols-2">
        <div className="rounded-xl border border-emerald-900/10 bg-white p-6 shadow-sm">
          <h3 className="font-semibold text-emerald-950">Dla działkowców</h3>
          <p className="mt-2 text-sm text-emerald-950/75">
            Po zalogowaniu: opłaty, czat z prezesem, plan działek i sekcja „Formalności” (numery kont — wg uprawnień).
          </p>
        </div>
        <div className="rounded-xl border border-emerald-900/10 bg-white p-6 shadow-sm">
          <h3 className="font-semibold text-emerald-950">Technicznie</h3>
          <p className="mt-2 text-sm text-emerald-950/75">
            Aplikacja jest przygotowana pod hosting Vercel, bazę PostgreSQL oraz automatyczne wdrożenia z repozytorium
            Git.
          </p>
        </div>
      </section>
    </div>
  );
}
