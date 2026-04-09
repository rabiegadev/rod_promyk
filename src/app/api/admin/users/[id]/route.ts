import { Role } from "@prisma/client";
import { z } from "zod";

import { auth } from "@/auth";
import { forbidden, isAdmin, unauthorized } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";
import { recordUserStatusChange } from "@/lib/user-status";

const patchSchema = z.object({
  name: z.string().min(1).max(120).optional(),
  role: z.nativeEnum(Role).optional(),
  accountActive: z.boolean().optional(),
  pzdMemberSince: z.union([z.coerce.date(), z.null()]).optional(),
  note: z.string().max(500).optional(),
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

  const existing = await prisma.user.findUnique({ where: { id } });
  if (!existing) return Response.json({ error: "Nie znaleziono." }, { status: 404 });

  const nextActive = parsed.data.accountActive ?? existing.accountActive;
  const nextPzd =
    parsed.data.pzdMemberSince === undefined ? existing.pzdMemberSince : parsed.data.pzdMemberSince;

  const statusChanged =
    parsed.data.accountActive !== undefined || parsed.data.pzdMemberSince !== undefined;

  if (statusChanged) {
    await recordUserStatusChange(
      id,
      session.user.id,
      { accountActive: nextActive, pzdMemberSince: nextPzd },
      parsed.data.note,
    );
  }

  const updated = await prisma.user.update({
    where: { id },
    data: {
      ...(parsed.data.name !== undefined ? { name: parsed.data.name } : {}),
      ...(parsed.data.role !== undefined ? { role: parsed.data.role } : {}),
      ...(parsed.data.accountActive !== undefined ? { accountActive: parsed.data.accountActive } : {}),
      ...(parsed.data.pzdMemberSince !== undefined ? { pzdMemberSince: parsed.data.pzdMemberSince } : {}),
    },
    select: {
      id: true,
      login: true,
      email: true,
      name: true,
      role: true,
      accountActive: true,
      pzdMemberSince: true,
      mustSetEmailOnLogin: true,
    },
  });

  return Response.json({ user: updated });
}
