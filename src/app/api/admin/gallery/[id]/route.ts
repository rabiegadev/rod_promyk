import { del } from "@vercel/blob";
import { auth } from "@/auth";
import { forbidden, isAdmin, unauthorized } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";

export async function DELETE(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return unauthorized();
  if (!isAdmin(session)) return forbidden();

  const { id } = await ctx.params;
  const item = await prisma.galleryItem.findUnique({ where: { id } });
  await prisma.galleryItem.delete({ where: { id } });

  // Best-effort cleanup of file from Blob storage.
  if (item?.imageUrl?.includes(".public.blob.vercel-storage.com")) {
    await del(item.imageUrl).catch(() => {});
  }
  return Response.json({ ok: true });
}
