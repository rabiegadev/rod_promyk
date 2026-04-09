import { z } from "zod";

import { auth } from "@/auth";
import { forbidden, isAdmin, unauthorized } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";

const postSchema = z.object({
  number: z.string().min(1).max(30),
  areaSqm: z.union([z.number().positive(), z.null()]).optional(),
  description: z.string().max(1000).optional().nullable(),
  allowsTwoOwners: z.boolean().optional().default(false),
  availableForPurchase: z.boolean().optional().default(false),
  purchaseInfo: z.string().max(3000).optional().nullable(),
  assignUserIds: z.array(z.string().min(1)).max(2).optional(),
});

export async function GET() {
  const session = await auth();
  if (!session?.user) return unauthorized();
  if (!isAdmin(session)) return forbidden();

  const plots = await prisma.plot.findMany({
    orderBy: { number: "asc" },
    include: {
      assignments: {
        where: { unassignedAt: null },
        include: { user: { select: { id: true, login: true, name: true, email: true } } },
      },
    },
  });

  return Response.json({ plots });
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) return unauthorized();
  if (!isAdmin(session)) return forbidden();

  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return Response.json({ error: "Niepoprawne JSON." }, { status: 400 });
  }

  const parsed = postSchema.safeParse(json);
  if (!parsed.success) {
    return Response.json({ error: "Walidacja nieudana." }, { status: 400 });
  }

  const uniqueAssignIds = Array.from(new Set(parsed.data.assignUserIds ?? []));
  if (!parsed.data.allowsTwoOwners && uniqueAssignIds.length > 1) {
    return Response.json(
      { error: "Dla działki 1-właściciel możesz przypisać maksymalnie jedną osobę." },
      { status: 400 },
    );
  }

  const created = await prisma.$transaction(async (tx) => {
    const plot = await tx.plot.create({
      data: {
        number: parsed.data.number.trim(),
        areaSqm: parsed.data.areaSqm ?? null,
        description: parsed.data.description ?? null,
        allowsTwoOwners: parsed.data.allowsTwoOwners,
        availableForPurchase: parsed.data.availableForPurchase,
        purchaseInfo: parsed.data.purchaseInfo ?? null,
      },
    });

    if (uniqueAssignIds.length > 0) {
      const holders = await tx.user.findMany({
        where: { id: { in: uniqueAssignIds }, accountActive: true },
        select: { id: true },
      });
      if (holders.length !== uniqueAssignIds.length) {
        throw new Error("INVALID_USER_SELECTION");
      }
      for (const holder of holders) {
        await tx.plotAssignment.create({
          data: {
            plotId: plot.id,
            userId: holder.id,
            assignedById: session.user.id,
          },
        });
      }
    }
    return plot;
  }).catch((e) => {
    if (e instanceof Error && e.message === "INVALID_USER_SELECTION") {
      return "INVALID_USER_SELECTION" as const;
    }
    return null;
  });

  if (created === "INVALID_USER_SELECTION") {
    return Response.json({ error: "Wybrani użytkownicy muszą istnieć i mieć aktywne konto." }, { status: 400 });
  }
  if (!created) {
    return Response.json({ error: "Nie udało się utworzyć działki (sprawdź unikalność numeru)." }, { status: 409 });
  }

  return Response.json({ plot: created });
}
