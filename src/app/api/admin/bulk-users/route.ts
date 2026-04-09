import bcrypt from "bcryptjs";
import { Role } from "@prisma/client";
import { z } from "zod";

import { auth } from "@/auth";
import { forbidden, requireRoles, unauthorized } from "@/lib/api-auth";
import { generateSimplePassword } from "@/lib/password";
import { prisma } from "@/lib/prisma";

const bodySchema = z.object({
  count: z.number().int().min(1).max(50),
  loginPrefix: z.string().min(1).max(30).default("dzialkowiec"),
  startIndex: z.number().int().min(1).default(1),
});

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) return unauthorized();
  if (!requireRoles(session, [Role.ADMIN])) return forbidden();

  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return Response.json({ error: "Niepoprawne JSON." }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return Response.json({ error: "Walidacja nieudana.", details: parsed.error.flatten() }, { status: 400 });
  }

  const { count, loginPrefix, startIndex } = parsed.data;
  const created: { login: string; password: string }[] = [];

  for (let i = 0; i < count; i++) {
    const login = `${loginPrefix}-${startIndex + i}`;
    const existing = await prisma.user.findUnique({ where: { login } });
    if (existing) {
      return Response.json({ error: `Login już istnieje: ${login}` }, { status: 409 });
    }
    const password = generateSimplePassword();
    const passwordHash = await bcrypt.hash(password, 12);
    await prisma.user.create({
      data: {
        login,
        passwordHash,
        mustSetEmailOnLogin: true,
        mustChangePassword: true,
        role: Role.PLOT_HOLDER,
        accountActive: true,
        name: `Działkowiec ${startIndex + i}`,
      },
    });
    created.push({ login, password });
  }

  return Response.json({
    users: created,
    message:
      "Konta utworzone. Hasła są widoczne tylko w tej odpowiedzi — zapisz je i bezpiecznie przekaż działkowcom.",
  });
}
