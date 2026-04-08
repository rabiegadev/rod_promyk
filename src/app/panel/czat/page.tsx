import Link from "next/link";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Role } from "@prisma/client";

export default async function CzatPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/logowanie");

  if (session.user.role !== Role.PLOT_HOLDER) {
    return (
      <div className="space-y-4">
        <p className="text-emerald-950/80">Czat po stronie działkowca jest dostępny tylko dla roli „Działkowiec”.</p>
        <p className="text-sm text-emerald-950/70">
          Widok administratora (wszystkie wątki, powiadomienia e-mail) zostanie dodany w kolejnym etapie.
        </p>
        <Link href="/panel" className="text-sm text-emerald-800 hover:underline">
          ← Panel
        </Link>
      </div>
    );
  }

  const thread = await prisma.chatThread.findUnique({
    where: { plotHolderId: session.user.id },
    include: {
      messages: { orderBy: { createdAt: "asc" }, take: 50 },
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-emerald-950">Czat z zarządem</h1>
        <p className="mt-1 text-sm text-emerald-950/70">
          Wysyłanie wiadomości i powiadomienia na e-mail — w przygotowaniu. Poniżej podgląd wątku.
        </p>
      </div>

      <div className="min-h-[200px] rounded-lg border border-emerald-900/10 bg-white p-4 shadow-sm">
        {!thread || thread.messages.length === 0 ? (
          <p className="text-sm text-emerald-950/70">Brak wiadomości — napisz pierwszą (formularz wkrótce).</p>
        ) : (
          <ul className="space-y-3 text-sm">
            {thread.messages.map((m) => (
              <li key={m.id} className="rounded-md bg-emerald-50/50 px-3 py-2">
                <p className="text-xs text-emerald-800/60">{m.createdAt.toLocaleString("pl-PL")}</p>
                <p className="mt-1 whitespace-pre-wrap text-emerald-950">{m.body}</p>
              </li>
            ))}
          </ul>
        )}
      </div>

      <Link href="/panel" className="text-sm text-emerald-800 hover:underline">
        ← Panel
      </Link>
    </div>
  );
}
