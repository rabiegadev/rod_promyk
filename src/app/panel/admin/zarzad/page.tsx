import Link from "next/link";

import { BoardAdminPanel } from "@/components/panel/board-admin-panel";
import { prisma } from "@/lib/prisma";

export default async function AdminBoardPage() {
  const members = await prisma.boardMember.findMany({ orderBy: { sortOrder: "asc" } });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-emerald-950">Zarząd — kontakt</h1>
        <p className="mt-1 text-sm text-emerald-900/70">Dane wyświetlane na stronie „Kontakt”.</p>
      </div>

      <BoardAdminPanel members={members} />

      <p className="text-sm text-emerald-900/60">
        <Link href="/panel/admin" className="font-medium text-emerald-800 hover:underline">
          ← Administracja
        </Link>
      </p>
    </div>
  );
}
