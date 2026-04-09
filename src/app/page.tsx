import { CalendarHeart, Droplets, Images, MessageCircle, Sprout, Sun, Trees } from "lucide-react";
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
      <section className="relative overflow-hidden rounded-2xl border border-lime-200/90 bg-gradient-to-br from-lime-100 via-amber-50 to-yellow-100 px-4 py-8 shadow-lg shadow-lime-900/10 ring-1 ring-white/70 sm:rounded-3xl sm:px-6 sm:py-12">
        <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-yellow-200/50 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-10 -left-10 h-48 w-48 rounded-full bg-lime-300/35 blur-3xl" />
        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="max-w-2xl">
            <p className="inline-flex items-center gap-2 rounded-full bg-white/70 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-emerald-800 ring-1 ring-lime-200/80">
              <Sun className="h-3.5 w-3.5 text-amber-500" aria-hidden />
              Promyk słońca nad działkami
            </p>
            <h1 className="mt-4 text-2xl font-bold tracking-tight text-emerald-950 sm:text-4xl">Witamy w ROD „Promyk”</h1>
            <p className="mt-3 text-base text-emerald-900/80 sm:text-lg">
              Społeczność działkowców w Przylepie — ogłoszenia, wydarzenia, zieleń i kontakt z zarządem w jednym miejscu.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Link
                href="/ogloszenia"
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-emerald-700 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-emerald-900/15 hover:bg-emerald-800 sm:min-h-0 sm:justify-start"
              >
                <Sprout className="h-4 w-4" aria-hidden />
                Ogłoszenia
              </Link>
              <Link
                href="/kontakt"
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-emerald-700/20 bg-white/80 px-4 py-2.5 text-sm font-semibold text-emerald-900 hover:bg-white sm:min-h-0 sm:justify-start"
              >
                <MessageCircle className="h-4 w-4 text-emerald-700" aria-hidden />
                Kontakt
              </Link>
              <Link
                href="/logowanie"
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-amber-300/80 bg-amber-50/90 px-4 py-2.5 text-sm font-semibold text-amber-950 hover:bg-amber-100 sm:min-h-0 sm:justify-start"
              >
                <Trees className="h-4 w-4 text-emerald-700" aria-hidden />
                Logowanie działkowca
              </Link>
            </div>
          </div>
          <div className="grid shrink-0 grid-cols-2 gap-2 sm:mt-2">
            <div className="flex flex-col items-center rounded-2xl bg-white/70 px-4 py-3 text-center ring-1 ring-lime-200/90">
              <Sprout className="h-7 w-7 text-emerald-600" strokeWidth={1.75} />
              <span className="mt-1 text-xs font-medium text-emerald-900">Nasadzenia</span>
            </div>
            <div className="flex flex-col items-center rounded-2xl bg-white/70 px-4 py-3 text-center ring-1 ring-lime-200/90">
              <Droplets className="h-7 w-7 text-sky-600" strokeWidth={1.75} />
              <span className="mt-1 text-xs font-medium text-emerald-900">Woda</span>
            </div>
            <div className="flex flex-col items-center rounded-2xl bg-white/70 px-4 py-3 text-center ring-1 ring-lime-200/90">
              <CalendarHeart className="h-7 w-7 text-rose-500" strokeWidth={1.75} />
              <span className="mt-1 text-xs font-medium text-emerald-900">Wydarzenia</span>
            </div>
            <div className="flex flex-col items-center rounded-2xl bg-white/70 px-4 py-3 text-center ring-1 ring-lime-200/90">
              <Images className="h-7 w-7 text-amber-600" strokeWidth={1.75} />
              <span className="mt-1 text-xs font-medium text-emerald-900">Galeria</span>
            </div>
          </div>
        </div>
      </section>

      <section>
        <div className="flex items-baseline justify-between gap-4">
          <h2 className="inline-flex items-center gap-2 text-xl font-semibold text-emerald-950">
            <Sprout className="h-5 w-5 text-emerald-600" aria-hidden />
            Ostatnie ogłoszenia
          </h2>
          <Link href="/ogloszenia" className="text-sm font-medium text-emerald-800 hover:underline">
            Wszystkie
          </Link>
        </div>
        {latest.length === 0 ? (
          <p className="mt-4 rounded-xl border border-dashed border-lime-300/90 bg-white/60 px-4 py-6 text-emerald-900/70">
            Brak ogłoszeń — zarząd doda je w panelu administracyjnym.
          </p>
        ) : (
          <ul className="mt-4 space-y-3">
            {latest.map((a) => (
              <li
                key={a.id}
                className="rounded-2xl border border-lime-200/80 bg-white/85 px-4 py-3 shadow-sm shadow-lime-900/5 backdrop-blur-sm"
              >
                <p className="font-medium text-emerald-950">{a.title}</p>
                <p className="text-xs text-emerald-800/60">{a.publishedAt.toLocaleDateString("pl-PL")}</p>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="grid gap-4 sm:grid-cols-2 sm:gap-6">
        <div className="rounded-2xl border border-lime-200/90 bg-white/80 p-4 shadow-sm shadow-lime-900/5 backdrop-blur-sm sm:p-6">
          <h3 className="inline-flex items-center gap-2 font-semibold text-emerald-950">
            <Trees className="h-5 w-5 text-emerald-600" aria-hidden />
            Dla działkowców
          </h3>
          <p className="mt-2 text-sm text-emerald-950/80">
            Po zalogowaniu: opłaty, czat z zarządem, plan działek i sekcja „Formalności” z numerami kont (dla
            zalogowanych).
          </p>
        </div>
        <div className="rounded-2xl border border-amber-200/90 bg-amber-50/80 p-4 shadow-sm shadow-amber-900/5 backdrop-blur-sm sm:p-6">
          <h3 className="inline-flex items-center gap-2 font-semibold text-emerald-950">
            <Sun className="h-5 w-5 text-amber-500" aria-hidden />
            Społeczność
          </h3>
          <p className="mt-2 text-sm text-emerald-950/80">
            Budujemy przyjazną atmosferę: wspólne imprezy, porady ogrodnicze i wsparcie sąsiadów przy grządce i nie tylko.
          </p>
        </div>
      </section>
    </div>
  );
}
