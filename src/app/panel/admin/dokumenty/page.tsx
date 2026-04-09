import Link from "next/link";

import { DocumentsAdminPanel } from "@/components/panel/documents-admin-panel";
import { prisma } from "@/lib/prisma";

export default async function AdminDocumentsPage() {
  const docs = await prisma.document.findMany({
    orderBy: [{ kind: "asc" }, { sortOrder: "asc" }],
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-emerald-950">Dokumenty (regulaminy / statut)</h1>
        <p className="mt-1 text-sm text-emerald-900/70">Upload plików przez Vercel Blob lub publikacja treści bez pliku.</p>
      </div>

      <DocumentsAdminPanel items={docs} />

      <p className="text-sm text-emerald-900/60">
        <Link href="/panel/admin" className="font-medium text-emerald-800 hover:underline">
          ← Administracja
        </Link>
      </p>
    </div>
  );
}
