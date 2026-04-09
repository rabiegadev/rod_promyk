import { z } from "zod";

import { auth } from "@/auth";
import { forbidden, isAdmin, unauthorized } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";

const postSchema = z.object({
  imageUrl: z
    .string()
    .min(1)
    .max(2000)
    .refine((s) => s.startsWith("/") || /^https?:\/\//i.test(s), "Podaj adres https://... lub ścieżkę od /"),
  caption: z.string().max(500).optional().nullable(),
  sortOrder: z.number().int().optional(),
});

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

  const created = await prisma.galleryItem.create({
    data: {
      imageUrl: parsed.data.imageUrl,
      caption: parsed.data.caption ?? null,
      sortOrder: parsed.data.sortOrder ?? 0,
      createdById: session.user.id,
    },
  });

  return Response.json({ item: created });
}
