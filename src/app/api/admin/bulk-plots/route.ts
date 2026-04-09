import bcrypt from "bcryptjs";
import { Role } from "@prisma/client";
import { z } from "zod";

import { auth } from "@/auth";
import { forbidden, requireRoles, unauthorized } from "@/lib/api-auth";
import { generateSimplePassword } from "@/lib/password";
import { prisma } from "@/lib/prisma";

const bodySchema = z.object({
  count: z.number().int().min(1).max(50),
  numberPrefix: z.string().max(20).optional(),
  startNumber: z.number().int().min(1).default(1),
  createUsers: z.boolean().optional(),
  userLoginPrefix: z.string().max(30).default("dzialkowiec"),
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

  const { count, numberPrefix, startNumber, createUsers, userLoginPrefix } = parsed.data;
  const prefix = numberPrefix ?? "";

  const createdPlots: { id: string; number: string }[] = [];
  const createdUsers: { login: string; password: string; plotNumber: string }[] = [];

  try {
    await prisma.$transaction(async (tx) => {
      for (let i = 0; i < count; i++) {
        const num = String(startNumber + i);
        const plotNumber = prefix ? `${prefix}-${num}` : num;

        const existsPlot = await tx.plot.findUnique({ where: { number: plotNumber } });
        if (existsPlot) {
          throw new Error(`PLOT_DUP:${plotNumber}`);
        }

        const plot = await tx.plot.create({
          data: { number: plotNumber },
        });
        createdPlots.push({ id: plot.id, number: plot.number });

        if (createUsers) {
          const login = `${userLoginPrefix}-${plotNumber}`;
          const loginTaken = await tx.user.findUnique({ where: { login } });
          if (loginTaken) {
            throw new Error(`LOGIN_DUP:${login}`);
          }
          const password = generateSimplePassword();
          const passwordHash = await bcrypt.hash(password, 12);
          await tx.user.create({
            data: {
              login,
              passwordHash,
              mustSetEmailOnLogin: true,
              mustChangePassword: true,
              role: Role.PLOT_HOLDER,
              accountActive: true,
              name: `Działkowiec ${plotNumber}`,
            },
          });
          createdUsers.push({ login, password, plotNumber });
        }
      }
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "";
    if (msg.startsWith("PLOT_DUP:")) {
      return Response.json({ error: `Numer działki już istnieje: ${msg.slice("PLOT_DUP:".length)}` }, { status: 409 });
    }
    if (msg.startsWith("LOGIN_DUP:")) {
      return Response.json({ error: `Login już istnieje: ${msg.slice("LOGIN_DUP:".length)}` }, { status: 409 });
    }
    throw e;
  }

  return Response.json({
    plots: createdPlots,
    users: createUsers ? createdUsers : undefined,
    message:
      createUsers &&
      "Konta utworzone. Hasła pokazane tylko w tej odpowiedzi — zapisz je i przekaż działkowcom. Działki trzeba przypisać w panelu.",
  });
}
