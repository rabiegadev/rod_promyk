import { z } from "zod";

import { auth } from "@/auth";
import { forbidden, isAdmin, unauthorized } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";

const patchSchema = z.object({
  number: z.string().min(1).max(30).optional(),
  areaSqm: z.union([z.number().positive(), z.null()]).optional(),
  description: z.string().max(1000).optional().nullable(),
  allowsTwoOwners: z.boolean().optional(),
  availableForPurchase: z.boolean().optional(),
  purchaseInfo: z.string().max(3000).optional().nullable(),
});

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return unauthorized();
  if (!isAdmin(session)) return forbidden();

  const { id } = await ctx.params;
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

  const existing = await prisma.plot.findUnique({ where: { id } });
  if (!existing) {
    return Response.json({ error: "Nie znaleziono działki." }, { status: 404 });
  }

  if (parsed.data.allowsTwoOwners === false) {
    const count = await prisma.plotAssignment.count({
      where: { plotId: id, unassignedAt: null },
    });
    if (count > 1) {
      return Response.json(
        { error: "Ta działka ma dwoje aktywnych właścicieli. Najpierw odłącz jedną osobę." },
        { status: 409 },
      );
    }
  }

  const updated = await prisma.$transaction(async (tx) => {
    const updatedPlot = await tx.plot.update({
      where: { id },
      data: {
        ...(parsed.data.number !== undefined ? { number: parsed.data.number.trim() } : {}),
        ...(parsed.data.areaSqm !== undefined ? { areaSqm: parsed.data.areaSqm } : {}),
        ...(parsed.data.description !== undefined ? { description: parsed.data.description } : {}),
        ...(parsed.data.allowsTwoOwners !== undefined ? { allowsTwoOwners: parsed.data.allowsTwoOwners } : {}),
        ...(parsed.data.availableForPurchase !== undefined
          ? { availableForPurchase: parsed.data.availableForPurchase }
          : {}),
        ...(parsed.data.purchaseInfo !== undefined ? { purchaseInfo: parsed.data.purchaseInfo } : {}),
      },
    });

    const changes: string[] = [];
    if (parsed.data.number !== undefined && parsed.data.number.trim() !== existing.number) {
      changes.push(`numer: ${existing.number} → ${parsed.data.number.trim()}`);
    }
    if (parsed.data.areaSqm !== undefined && parsed.data.areaSqm !== existing.areaSqm) {
      changes.push(`powierzchnia: ${existing.areaSqm ?? "—"} → ${parsed.data.areaSqm ?? "—"}`);
    }
    if (parsed.data.description !== undefined && parsed.data.description !== existing.description) {
      changes.push("opis");
    }
    if (parsed.data.allowsTwoOwners !== undefined && parsed.data.allowsTwoOwners !== existing.allowsTwoOwners) {
      changes.push(`tryb właścicieli: ${existing.allowsTwoOwners ? "2" : "1"} → ${parsed.data.allowsTwoOwners ? "2" : "1"}`);
    }
    if (parsed.data.availableForPurchase !== undefined && parsed.data.availableForPurchase !== existing.availableForPurchase) {
      changes.push(
        `na sprzedaż: ${existing.availableForPurchase ? "tak" : "nie"} → ${parsed.data.availableForPurchase ? "tak" : "nie"}`,
      );
    }
    if (parsed.data.purchaseInfo !== undefined && parsed.data.purchaseInfo !== existing.purchaseInfo) {
      changes.push("informacje sprzedażowe");
    }
    if (changes.length > 0) {
      await tx.plotChangeLog.create({
        data: {
          plotId: id,
          changedById: session.user.id,
          action: "Edycja danych działki",
          details: `Zmiany: ${changes.join("; ")}.`,
        },
      });
    }

    return updatedPlot;
  }).catch(() => null);

  if (!updated) {
    return Response.json({ error: "Nie udało się zaktualizować działki." }, { status: 409 });
  }

  return Response.json({ plot: updated });
}
