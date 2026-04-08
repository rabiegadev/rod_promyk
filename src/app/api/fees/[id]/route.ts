import { Role } from "@prisma/client";
import { z } from "zod";

import { auth } from "@/auth";
import { forbidden, requireRoles, unauthorized } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";

const patchSchema = z.object({
  isPaid: z.boolean(),
});

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return unauthorized();
  if (!requireRoles(session, [Role.ADMIN, Role.TREASURER])) return forbidden();

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

  const existing = await prisma.feeLine.findUnique({ where: { id } });
  if (!existing) {
    return Response.json({ error: "Nie znaleziono pozycji." }, { status: 404 });
  }

  const updated = await prisma.feeLine.update({
    where: { id },
    data: {
      isPaid: parsed.data.isPaid,
      paidAt: parsed.data.isPaid ? new Date() : null,
      paidMarkedById: parsed.data.isPaid ? session.user.id : null,
    },
  });

  return Response.json({ fee: updated });
}
