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

  const created = await prisma.plot.create({
    data: {
      number: parsed.data.number.trim(),
      areaSqm: parsed.data.areaSqm ?? null,
      description: parsed.data.description ?? null,
      allowsTwoOwners: parsed.data.allowsTwoOwners,
      availableForPurchase: parsed.data.availableForPurchase,
      purchaseInfo: parsed.data.purchaseInfo ?? null,
    },
  }).catch(() => null);

  if (!created) {
    return Response.json({ error: "Nie udało się utworzyć działki (sprawdź unikalność numeru)." }, { status: 409 });
  }

  return Response.json({ plot: created });
}
