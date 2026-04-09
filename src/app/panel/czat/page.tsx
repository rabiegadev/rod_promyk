import Link from "next/link";
import { redirect } from "next/navigation";

import { PlotHolderChatView } from "@/components/panel/chat-thread-view";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export default async function CzatPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/logowanie");

  const dbUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { mustSetEmailOnLogin: true, mustChangePassword: true },
  });
  if (dbUser?.mustSetEmailOnLogin || dbUser?.mustChangePassword) redirect("/panel");

  const activeAssignmentsCount = await prisma.plotAssignment.count({
    where: { userId: session.user.id, unassignedAt: null },
  });
  if (activeAssignmentsCount === 0) {
    return (
      <div className="space-y-4">
        <p className="text-emerald-950/80">Czat działkowca jest dostępny dla użytkownika z przypisaną aktywną działką.</p>
        <p className="text-sm text-emerald-950/70">Administrator korzysta z widoku w panelu: /panel/admin/czat</p>
        <Link href="/panel" className="text-sm font-medium text-emerald-800 hover:underline">
          ← Panel
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-emerald-950">Czat z zarządem</h1>
        <p className="mt-1 text-sm text-emerald-900/70">
          Wiadomości trafiają do członków zarządu. Przy skonfigurowanym Resend wysyłane jest powiadomienie e-mail.
        </p>
      </div>

      <PlotHolderChatView />

      <Link href="/panel" className="text-sm font-medium text-emerald-800 hover:underline">
        ← Panel
      </Link>
    </div>
  );
}
