import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Role } from "@prisma/client";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default async function FormalnosciPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/logowanie");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      mustSetEmailOnLogin: true,
      mustChangePassword: true,
      roles: { select: { role: true } },
      _count: { select: { plotAssignmentsAsHolder: { where: { unassignedAt: null } } } },
    },
  });
  if (user?.mustSetEmailOnLogin || user?.mustChangePassword) redirect("/panel");

  const allowed = user ? user.roles.some((r) => r.role === Role.ADMIN) || user._count.plotAssignmentsAsHolder > 0 : false;
  if (!allowed) {
    return (
      <p className="text-emerald-950/80">
        Ta sekcja jest dostępna tylko dla zalogowanych działkowców (oraz administratora w celach edycji — UI edycji w kolejnej
        iteracji).
      </p>
    );
  }

  const f = await prisma.formalities.findUnique({ where: { id: "default" } });

  return (
    <div className="max-w-none">
      <h1 className="text-2xl font-bold text-emerald-950">Formalności</h1>
      <p className="text-sm text-emerald-950/70">Numery kont i dane do przelewów — widoczne po zalogowaniu.</p>
      <dl className="mt-6 space-y-4 text-base">
        <div>
          <dt className="font-medium text-emerald-900">Konto ogrodu</dt>
          <dd className="text-emerald-950/85">{f?.gardenBankAccount ?? "—"}</dd>
        </div>
        <div>
          <dt className="font-medium text-emerald-900">Konto wody</dt>
          <dd className="text-emerald-950/85">{f?.waterBankAccount ?? "—"}</dd>
        </div>
        {f?.otherAccountsNote ? (
          <div>
            <dt className="font-medium text-emerald-900">Inne</dt>
            <dd className="whitespace-pre-wrap text-emerald-950/85">{f.otherAccountsNote}</dd>
          </div>
        ) : null}
        <div>
          <dt className="font-medium text-emerald-900">Kontakt</dt>
          <dd className="text-emerald-950/85">
            {f?.contactPhone ?? "—"}
            {f?.contactEmail ? ` · ${f.contactEmail}` : ""}
          </dd>
        </div>
      </dl>
      {f?.extraMarkdown ? (
        <article className="prose prose-sm mt-8 max-w-none rounded-lg border border-emerald-900/10 bg-white p-4 prose-headings:text-emerald-950 prose-p:text-emerald-950 prose-li:text-emerald-950">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{f.extraMarkdown}</ReactMarkdown>
        </article>
      ) : null}
    </div>
  );
}
