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

  await prisma.$transaction([
    prisma.plotAssignment.updateMany({
      where: { plotId, unassignedAt: null },
      data: { unassignedAt: now },
    }),
    prisma.plotAssignment.create({
      data: {
        plotId,
        userId,
        assignedById: session.user.id,
      },
    }),
  ]);

  return Response.json({ ok: true });
}
