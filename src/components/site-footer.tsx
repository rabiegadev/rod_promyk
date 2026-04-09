import { Flower2, Shovel } from "lucide-react";

export function SiteFooter() {
  return (
    <footer className="relative z-10 mt-auto border-t border-lime-200/90 bg-gradient-to-r from-lime-50/95 via-amber-50/90 to-lime-50/95 py-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] text-sm text-emerald-900/70 sm:py-8">
      <div className="mx-auto flex max-w-6xl min-w-0 flex-col gap-3 px-4 sm:flex-row sm:items-center sm:justify-between sm:gap-2">
        <p className="flex items-center gap-2">
          <Flower2 className="h-4 w-4 shrink-0 text-emerald-600" aria-hidden />
          © {new Date().getFullYear()} ROD „Promyk” w Przylepie.
        </p>
        <p className="flex items-center gap-2 text-emerald-900/60">
          <Shovel className="h-4 w-4 shrink-0 text-amber-700/80" aria-hidden />
          Dbamy o zieleń i dobre sąsiedztwo.
        </p>
      </div>
    </footer>
  );
}
