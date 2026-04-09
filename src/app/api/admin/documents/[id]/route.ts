import { del } from "@vercel/blob";
import { z } from "zod";

import { auth } from "@/auth";
import { forbidden, isAdmin, unauthorized } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";

const patchSchema = z.object({
  title: z.string().min(1).max(250).optional(),
  content: z.string().max(50_000).nullable().optional(),
  sortOrder: z.number().int().optional(),
});

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return unauthorized();
  if (!isAdmin(session)) return forbidden();

  const { id } = await ctx.params;
  const json = await req.json().catch(() => null);
  const parsed = patchSchema.safeParse(json);
  if (!parsed.success) {
    return Response.json({ error: "Walidacja nieudana." }, { status: 400 });
  }

  const updated = await prisma.document.update({
    where: { id },
    data: parsed.data,
  });

  return Response.json({ document: updated });
}

export async function DELETE(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return unauthorized();
  if (!isAdmin(session)) return forbidden();

  const { id } = await ctx.params;
  const doc = await prisma.document.findUnique({ where: { id } });
  await prisma.document.delete({ where: { id } });

  if (doc?.fileUrl?.includes(".public.blob.vercel-storage.com")) {
    await del(doc.fileUrl).catch(() => {});
  }

  return Response.json({ ok: true });
}
