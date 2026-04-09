import {
  FileText,
  ImageIcon,
  LayoutDashboard,
  Megaphone,
  MessageCircle,
  FolderInput,
  Settings2,
  Sprout,
  Trees,
  Users,
} from "lucide-react";
import Link from "next/link";

const links = [
  { href: "/panel/admin/ogloszenia", label: "Ogłoszenia", desc: "Dodaj aktualność na stronę główną.", icon: Megaphone },
  { href: "/panel/admin/galeria", label: "Galeria", desc: "Zdjęcia (URL obrazka).", icon: ImageIcon },
  { href: "/panel/admin/uzytkownicy", label: "Użytkownicy", desc: "Role, status, członkostwo PZD, historia.", icon: Users },
  { href: "/panel/admin/dzialki", label: "Działki i przypisania", desc: "Przypisz działkowca do działki.", icon: Trees },
  { href: "/panel/admin/formalnosci", label: "Formalności", desc: "Numery kont (dla zalogowanych).", icon: Settings2 },
  { href: "/panel/admin/zarzad", label: "Zarząd (kontakt)", desc: "Dane widoczne na stronie Kontakt.", icon: LayoutDashboard },
  { href: "/panel/admin/dokumenty", label: "Dokumenty", desc: "Regulaminy i statut (upload do Blob).", icon: FileText },
  { href: "/panel/admin/zbiorczo", label: "Import zbiorczy", desc: "Generowanie działek i kont.", icon: FolderInput },
  { href: "/panel/admin/czat", label: "Czat", desc: "Wszystkie wątki z działkowcami.", icon: MessageCircle },
];

export default function AdminHomePage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="inline-flex items-center gap-2 text-xl font-bold text-emerald-950 sm:text-2xl">
          <Sprout className="h-7 w-7 text-emerald-600" aria-hidden />
          Panel administratora
        </h1>
        <p className="mt-1 text-sm text-emerald-900/70">Zarządzanie treścią, ludźmi, działkami i komunikacją.</p>
      </div>

      <ul className="grid gap-4 sm:grid-cols-2">
        {links.map((item) => {
          const Icon = item.icon;
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className="flex h-full flex-col rounded-2xl border border-lime-200/90 bg-white/85 p-5 shadow-sm shadow-lime-900/5 transition hover:border-amber-200/90 hover:bg-amber-50/40"
              >
                <span className="inline-flex items-center gap-2 font-semibold text-emerald-950">
                  <Icon className="h-5 w-5 text-emerald-600" aria-hidden />
                  {item.label}
                </span>
                <span className="mt-2 text-sm text-emerald-900/70">{item.desc}</span>
              </Link>
            </li>
          );
        })}
      </ul>

      <p className="text-sm text-emerald-900/60">
        <Link href="/panel" className="font-medium text-emerald-800 hover:underline">
          ← Wróć do panelu
        </Link>
      </p>
    </div>
  );
}
