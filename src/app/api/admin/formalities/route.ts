import { z } from "zod";

import { auth } from "@/auth";
import { forbidden, isAdmin, unauthorized } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";

const patchSchema = z.object({
  gardenBankAccount: z.string().max(2000).optional().nullable(),
  waterBankAccount: z.string().max(2000).optional().nullable(),
  otherAccountsNote: z.string().max(4000).optional().nullable(),
  contactPhone: z.string().max(200).optional().nullable(),
  contactEmail: z.union([z.string().email().max(200), z.literal(""), z.null()]).optional(),
  extraMarkdown: z.string().max(20000).optional().nullable(),
});

export async function PATCH(req: Request) {
  const session = await auth();
  if (!session?.user) return unauthorized();
  if (!isAdmin(session)) return forbidden();

  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return Response.json({ error: "Niepoprawne JSON." }, { status: 400 });
  }

  const parsed = patchSchema.safeParse(json);
  if (!parsed.success) {
    return Response.json({ error: "Walidacja nieudana." }, { status: 400 });
  }

  const p = parsed.data;
  const contactEmail = p.contactEmail === "" ? null : p.contactEmail;

  const updated = await prisma.formalities.upsert({
    where: { id: "default" },
    create: {
      id: "default",
      gardenBankAccount: p.gardenBankAccount ?? null,
      waterBankAccount: p.waterBankAccount ?? null,
      otherAccountsNote: p.otherAccountsNote ?? null,
      contactPhone: p.contactPhone ?? null,
      contactEmail: contactEmail === undefined ? null : contactEmail,
      extraMarkdown: p.extraMarkdown ?? null,
      updatedById: session.user.id,
    },
    update: {
      ...(p.gardenBankAccount !== undefined ? { gardenBankAccount: p.gardenBankAccount } : {}),
      ...(p.waterBankAccount !== undefined ? { waterBankAccount: p.waterBankAccount } : {}),
      ...(p.otherAccountsNote !== undefined ? { otherAccountsNote: p.otherAccountsNote } : {}),
      ...(p.contactPhone !== undefined ? { contactPhone: p.contactPhone } : {}),
      ...(p.contactEmail !== undefined ? { contactEmail } : {}),
      ...(p.extraMarkdown !== undefined ? { extraMarkdown: p.extraMarkdown } : {}),
      updatedById: session.user.id,
    },
  });

  return Response.json({ formalities: updated });
}
