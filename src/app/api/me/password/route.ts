import bcrypt from "bcryptjs";
import { z } from "zod";

import { auth } from "@/auth";
import { unauthorized } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";

const bodySchema = z.object({
  newPassword: z.string().min(8).max(200),
});

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return unauthorized();

  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return Response.json({ error: "Niepoprawne JSON." }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return Response.json({ error: "Hasło musi mieć minimum 8 znaków." }, { status: 400 });
  }

  const hash = await bcrypt.hash(parsed.data.newPassword, 12);
  await prisma.user.update({
    where: { id: session.user.id },
    data: {
      passwordHash: hash,
      mustChangePassword: false,
    },
  });

  return Response.json({ ok: true });
}
