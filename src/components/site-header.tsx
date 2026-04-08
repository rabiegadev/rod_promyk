import Link from "next/link";

import { auth } from "@/auth";

const nav = [
  { href: "/", label: "Strona główna" },
  { href: "/ogloszenia", label: "Ogłoszenia" },
  { href: "/o-ogrodzie", label: "O ogrodzie" },
  { href: "/imprezy", label: "Imprezy" },
  { href: "/osiagniecia", label: "Osiągnięcia" },
  { href: "/regulaminy", label: "Regulaminy" },
  { href: "/statut", label: "Statut" },
  { href: "/szkolenia", label: "Szkolenia" },
  { href: "/dzialki-na-sprzedaz", label: "Działki na sprzedaż" },
  { href: "/galeria", label: "Galeria" },
  { href: "/kontakt", label: "Kontakt" },
];

export async function SiteHeader() {
  const session = await auth();

  return (
    <header className="border-b border-emerald-900/15 bg-emerald-950 text-emerald-50">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link href="/" className="text-lg font-semibold tracking-tight text-white">
            ROD „Promyk” · Przylep
          </Link>
          <p className="text-sm text-emerald-200/80">Rodzinny ogród działkowy</p>
        </div>
        <nav className="flex flex-wrap gap-x-4 gap-y-2 text-sm">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-emerald-100/90 underline-offset-4 hover:text-white hover:underline"
            >
              {item.label}
            </Link>
          ))}
          {session?.user ? (
            <Link
              href="/panel"
              className="font-medium text-amber-200 underline-offset-4 hover:text-amber-100 hover:underline"
            >
              Panel
            </Link>
          ) : (
            <Link
              href="/logowanie"
              className="font-medium text-amber-200 underline-offset-4 hover:text-amber-100 hover:underline"
            >
              Logowanie
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
