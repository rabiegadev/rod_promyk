import { z } from "zod";

import { auth } from "@/auth";
import { forbidden, isAdmin, unauthorized } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";

const bodySchema = z.object({
  title: z.string().min(1).max(300),
  body: z.string().min(1).max(20000),
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

  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return Response.json({ error: "Walidacja nieudana." }, { status: 400 });
  }

  const created = await prisma.announcement.create({
    data: {
      title: parsed.data.title,
      body: parsed.data.body,
      authorId: session.user.id,
    },
  });

  return Response.json({ announcement: created });
}
