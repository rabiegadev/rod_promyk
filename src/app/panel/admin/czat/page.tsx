import Link from "next/link";

import { AdminChatView } from "@/components/panel/admin-chat-view";

export default async function AdminChatPage({ searchParams }: { searchParams: Promise<{ u?: string }> }) {
  const sp = await searchParams;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-emerald-950">Czat z działkowcami</h1>
        <p className="mt-1 text-sm text-emerald-900/70">
          Wybierz wątek po lewej. Możesz otworzyć bezpośredni link:{" "}
          <code className="rounded bg-lime-50 px-1">/panel/admin/czat?u=ID_DZIALKOWCA</code>
        </p>
      </div>

      <AdminChatView initialUserId={sp.u} />

      <p className="text-sm text-emerald-900/60">
        <Link href="/panel/admin" className="font-medium text-emerald-800 hover:underline">
          ← Administracja
        </Link>
      </p>
    </div>
  );
}
