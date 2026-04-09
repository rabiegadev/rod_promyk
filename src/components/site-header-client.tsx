"use client";

import { CalendarHeart, ImageIcon, Leaf, Menu, Sprout, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

const nav = [
  { href: "/", label: "Strona główna", icon: Leaf },
  { href: "/ogloszenia", label: "Ogłoszenia", icon: null as null },
  { href: "/o-ogrodzie", label: "O ogrodzie", icon: Sprout },
  { href: "/imprezy", label: "Imprezy", icon: CalendarHeart },
  { href: "/osiagniecia", label: "Osiągnięcia", icon: null },
  { href: "/regulaminy", label: "Regulaminy", icon: null },
  { href: "/statut", label: "Statut", icon: null },
  { href: "/szkolenia", label: "Szkolenia", icon: null },
  { href: "/dzialki-na-sprzedaz", label: "Działki na sprzedaż", icon: null },
  { href: "/galeria", label: "Galeria", icon: ImageIcon },
  { href: "/kontakt", label: "Kontakt", icon: null },
];

type Props = {
  isLoggedIn: boolean;
};

export function SiteHeaderClient({ isLoggedIn }: Props) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  useEffect(() => {
    const onResize = () => {
      if (window.matchMedia("(min-width: 1024px)").matches) setOpen(false);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const panelLinkClass =
    "flex min-h-12 items-center gap-3 rounded-xl px-3 py-2 text-base font-medium text-emerald-900 active:bg-lime-100/90";

  return (
    <>
      <nav
        className="hidden flex-wrap items-center justify-end gap-x-2 gap-y-2 text-sm font-medium text-emerald-900/85 lg:flex"
        aria-label="Główna nawigacja"
      >
        {nav.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className="inline-flex min-h-10 min-w-[2.5rem] items-center gap-1 rounded-full px-2 py-1.5 transition hover:bg-lime-100/80 hover:text-emerald-900"
            >
              {Icon ? <Icon className="h-3.5 w-3.5 shrink-0 text-emerald-600" strokeWidth={2} aria-hidden /> : null}
              {item.label}
            </Link>
          );
        })}
        {isLoggedIn ? (
          <Link
            href="/panel"
            className="ml-1 inline-flex min-h-10 items-center gap-1 rounded-full bg-amber-100/90 px-3 py-1.5 text-amber-950 ring-1 ring-amber-300/60 hover:bg-amber-200/90"
          >
            Panel
          </Link>
        ) : (
          <Link
            href="/logowanie"
            className="ml-1 inline-flex min-h-10 items-center gap-1 rounded-full bg-amber-100/90 px-3 py-1.5 text-amber-950 ring-1 ring-amber-300/60 hover:bg-amber-200/90"
          >
            Logowanie
          </Link>
        )}
      </nav>

      <div className="flex items-center gap-2 lg:hidden">
        {isLoggedIn ? (
          <Link
            href="/panel"
            className="inline-flex min-h-11 min-w-[2.75rem] items-center justify-center rounded-full bg-amber-100/90 px-3 text-sm font-semibold text-amber-950 ring-1 ring-amber-300/60"
          >
            Panel
          </Link>
        ) : null}
        <button
          type="button"
          className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-xl border border-lime-200/90 bg-white/90 text-emerald-900 shadow-sm ring-emerald-900/5 hover:bg-lime-50/90 active:bg-lime-100"
          onClick={() => setOpen(true)}
          aria-expanded={open}
          aria-controls="mobile-nav-panel"
          aria-label="Otwórz menu nawigacji"
        >
          <Menu className="h-6 w-6" strokeWidth={2} aria-hidden />
        </button>
      </div>

      {open ? (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Menu">
          <button
            type="button"
            className="absolute inset-0 bg-emerald-950/40 backdrop-blur-[2px]"
            aria-label="Zamknij menu"
            onClick={() => setOpen(false)}
          />
          <div
            id="mobile-nav-panel"
            className="absolute right-0 top-0 flex h-[100dvh] w-[min(100vw,20rem)] flex-col border-l border-lime-200/90 bg-[#fefce8] shadow-2xl shadow-emerald-950/20"
            style={{ paddingTop: "max(0.75rem, env(safe-area-inset-top))", paddingBottom: "env(safe-area-inset-bottom)" }}
          >
            <div className="flex items-center justify-between border-b border-lime-200/80 px-3 py-3">
              <span className="text-sm font-semibold text-emerald-950">Menu</span>
              <button
                type="button"
                className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-xl text-emerald-900 hover:bg-lime-100/80"
                onClick={() => setOpen(false)}
                aria-label="Zamknij"
              >
                <X className="h-6 w-6" aria-hidden />
              </button>
            </div>
            <nav className="flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain px-2 py-3" aria-label="Nawigacja mobilna">
              {nav.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={panelLinkClass}
                    onClick={() => setOpen(false)}
                  >
                    {Icon ? (
                      <Icon className="h-5 w-5 shrink-0 text-emerald-600" strokeWidth={2} aria-hidden />
                    ) : (
                      <span className="inline-block w-5 shrink-0" aria-hidden />
                    )}
                    {item.label}
                  </Link>
                );
              })}
              <div className="mt-auto border-t border-lime-200/80 pt-3">
                {isLoggedIn ? (
                  <Link href="/panel" className={`${panelLinkClass} font-semibold text-amber-950`} onClick={() => setOpen(false)}>
                    Przejdź do panelu
                  </Link>
                ) : (
                  <Link href="/logowanie" className={`${panelLinkClass} font-semibold text-amber-950`} onClick={() => setOpen(false)}>
                    Logowanie
                  </Link>
                )}
              </div>
            </nav>
          </div>
        </div>
      ) : null}
    </>
  );
}
