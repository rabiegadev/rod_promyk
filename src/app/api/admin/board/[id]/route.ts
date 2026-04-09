import { z } from "zod";

import { auth } from "@/auth";
import { forbidden, isAdmin, unauthorized } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";

const patchSchema = z.object({
  name: z.string().min(1).max(120).optional(),
  roleTitle: z.string().min(1).max(120).optional(),
  phone: z.string().max(80).optional().nullable(),
  email: z.string().email().max(200).optional().nullable(),
  sortOrder: z.number().int().optional(),
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

  const updated = await prisma.boardMember.update({
    where: { id },
    data: parsed.data,
  });

  return Response.json({ member: updated });
}

export async function DELETE(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return unauthorized();
  if (!isAdmin(session)) return forbidden();

  const { id } = await ctx.params;
  await prisma.boardMember.delete({ where: { id } });
  return Response.json({ ok: true });
}
