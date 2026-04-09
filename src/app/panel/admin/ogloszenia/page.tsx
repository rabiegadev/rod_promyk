import Link from "next/link";

import { AnnouncementForm } from "@/components/panel/announcement-form";

export default function AdminAnnouncementsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-emerald-950">Ogłoszenia</h1>
        <p className="mt-1 text-sm text-emerald-900/70">Publikacja na stronie „Ogłoszenia” i skrót na stronie głównej.</p>
      </div>
      <AnnouncementForm />
      <p className="text-sm text-emerald-900/60">
        <Link href="/panel/admin" className="font-medium text-emerald-800 hover:underline">
          ← Administracja
        </Link>
      </p>
    </div>
  );
}
