import Link from "next/link";

import { BulkImportPanel } from "@/components/panel/bulk-import-panel";

export default function AdminBulkPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-emerald-950">Import zbiorczy</h1>
        <p className="mt-1 text-sm text-emerald-900/70">
          Wywołuje istniejące endpointy API. Hasła są zwracane w odpowiedzi — skopiuj je od razu.
        </p>
      </div>

      <BulkImportPanel />

      <p className="text-sm text-emerald-900/60">
        <Link href="/panel/admin" className="font-medium text-emerald-800 hover:underline">
          ← Administracja
        </Link>
      </p>
    </div>
  );
}
