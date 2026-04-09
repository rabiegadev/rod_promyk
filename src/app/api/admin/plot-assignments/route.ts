import { z } from "zod";

import { auth } from "@/auth";
import { forbidden, isAdmin, unauthorized } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";

const bodySchema = z.union([
  z.object({
    action: z.literal("assign"),
    plotId: z.string().min(1),
    userId: z.string().min(1),
  }),
  z.object({
    action: z.literal("release"),
    plotId: z.string().min(1),
  }),
]);

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

  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return Response.json({ error: "Walidacja nieudana." }, { status: 400 });
  }

  const now = new Date();

  if (parsed.data.action === "release") {
    await prisma.plotAssignment.updateMany({
      where: { plotId: parsed.data.plotId, unassignedAt: null },
      data: { unassignedAt: now },
    });
    return Response.json({ ok: true });
  }

  const { plotId, userId } = parsed.data;
  const holder = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, accountActive: true },
  });
  if (!holder || !holder.accountActive) {
    return Response.json({ error: "Nie znaleziono aktywnego użytkownika do przypisania." }, { status: 404 });
  }

  const plot = await prisma.plot.findUnique({
    where: { id: plotId },
    select: { allowsTwoOwners: true },
  });
  if (!plot) {
    return Response.json({ error: "Nie znaleziono działki." }, { status: 404 });
  }

  try {
    await prisma.$transaction(async (tx) => {
      const activeAssignments = await tx.plotAssignment.findMany({
        where: { plotId, unassignedAt: null },
        select: { id: true, userId: true },
      });

      if (activeAssignments.some((a) => a.userId === userId)) {
        throw new Error("ALREADY_ASSIGNED");
      }

      const maxOwners = plot.allowsTwoOwners ? 2 : 1;
      if (activeAssignments.length >= maxOwners) {
        if (!plot.allowsTwoOwners) {
          await tx.plotAssignment.updateMany({
            where: { plotId, unassignedAt: null },
            data: { unassignedAt: now },
          });
        } else {
          throw new Error("TOO_MANY_OWNERS");
        }
      }

      await tx.plotAssignment.create({
        data: {
          plotId,
          userId,
          assignedById: session.user.id,
        },
      });
    });
  } catch (e) {
    if (e instanceof Error && e.message === "ALREADY_ASSIGNED") {
      return Response.json({ error: "Ten użytkownik jest już przypisany do tej działki." }, { status: 409 });
    }
    if (e instanceof Error && e.message === "TOO_MANY_OWNERS") {
      return Response.json({ error: "Działka ma już maksymalną liczbę aktywnych właścicieli (2)." }, { status: 409 });
    }
    throw e;
  }

  return Response.json({ ok: true });
}
