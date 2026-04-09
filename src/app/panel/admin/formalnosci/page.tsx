import Link from "next/link";

import { FormalitiesEditForm } from "@/components/panel/formalities-edit-form";
import { prisma } from "@/lib/prisma";

export default async function AdminFormalitiesPage() {
  const f =
    (await prisma.formalities.findUnique({ where: { id: "default" } })) ??
    ({
      gardenBankAccount: null,
      waterBankAccount: null,
      otherAccountsNote: null,
      contactPhone: null,
      contactEmail: null,
      extraMarkdown: null,
    } as const);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-emerald-950">Formalności</h1>
        <p className="mt-1 text-sm text-emerald-900/70">Numery kont widoczne dla zalogowanych działkowców w /panel/formalnosci.</p>
      </div>

      <FormalitiesEditForm
        initial={{
          gardenBankAccount: f.gardenBankAccount,
          waterBankAccount: f.waterBankAccount,
          otherAccountsNote: f.otherAccountsNote,
          contactPhone: f.contactPhone,
          contactEmail: f.contactEmail,
          extraMarkdown: f.extraMarkdown,
        }}
      />

      <p className="text-sm text-emerald-900/60">
        <Link href="/panel/admin" className="font-medium text-emerald-800 hover:underline">
          ← Administracja
        </Link>
      </p>
    </div>
  );
}
