import Link from "next/link";

import { GalleryAdminPanel } from "@/components/panel/gallery-admin-panel";
import { prisma } from "@/lib/prisma";

export default async function AdminGalleryPage() {
  const items = await prisma.galleryItem.findMany({
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-emerald-950">Galeria</h1>
        <p className="mt-1 text-sm text-emerald-900/70">
          Dodawaj zdjęcia przez upload do Vercel Blob (lub awaryjnie przez URL).
        </p>
      </div>
      <GalleryAdminPanel items={items} />
      <p className="text-sm text-emerald-900/60">
        <Link href="/panel/admin" className="font-medium text-emerald-800 hover:underline">
          ← Administracja
        </Link>
      </p>
    </div>
  );
}
