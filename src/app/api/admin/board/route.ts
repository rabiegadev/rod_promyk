import { z } from "zod";

import { auth } from "@/auth";
import { forbidden, isAdmin, unauthorized } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";

const postSchema = z.object({
  name: z.string().min(1).max(120),
  roleTitle: z.string().min(1).max(120),
  phone: z.string().max(80).optional().nullable(),
  email: z.string().email().max(200).optional().nullable(),
  sortOrder: z.number().int().optional(),
});

export async function GET() {
  const session = await auth();
  if (!session?.user) return unauthorized();
  if (!isAdmin(session)) return forbidden();

  const members = await prisma.boardMember.findMany({ orderBy: { sortOrder: "asc" } });
  return Response.json({ members });
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

  const created = await prisma.boardMember.create({
    data: {
      name: parsed.data.name,
      roleTitle: parsed.data.roleTitle,
      phone: parsed.data.phone ?? null,
      email: parsed.data.email ?? null,
      sortOrder: parsed.data.sortOrder ?? 0,
    },
  });

  return Response.json({ member: created });
}
