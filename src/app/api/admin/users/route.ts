import bcrypt from "bcryptjs";
import { Role } from "@prisma/client";
import { z } from "zod";

import { auth } from "@/auth";
import { forbidden, isAdmin, unauthorized } from "@/lib/api-auth";
import { generateSimplePassword } from "@/lib/password";
import { prisma } from "@/lib/prisma";

const postSchema = z.object({
  login: z.string().min(3).max(64),
  password: z.string().min(3).max(200).optional(),
  autoGenerateSimplePassword: z.boolean().optional().default(true),
  name: z.string().max(120).optional().nullable(),
  roles: z.array(z.nativeEnum(Role)).optional().default([]),
  email: z.union([z.string().email().max(255), z.literal(""), z.null()]).optional(),
  accountActive: z.boolean().optional().default(true),
  pzdMemberSince: z.union([z.coerce.date(), z.null()]).optional(),
  plotId: z.string().optional(),
});

export async function GET() {
  const session = await auth();
  if (!session?.user) return unauthorized();
  if (!isAdmin(session)) return forbidden();

  const users = await prisma.user.findMany({
    orderBy: [{ login: "asc" }, { email: "asc" }],
    select: {
      id: true,
      login: true,
      email: true,
      name: true,
      roles: { select: { role: true } },
      accountActive: true,
      pzdMemberSince: true,
      mustSetEmailOnLogin: true,
      createdAt: true,
    },
  });

  return Response.json({ users });
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
    return Response.json({ error: "Walidacja nieudana.", details: parsed.error.flatten() }, { status: 400 });
  }

  const emailNormalized =
    parsed.data.email && parsed.data.email !== "" ? parsed.data.email.toLowerCase() : null;

  const loginTaken = await prisma.user.findUnique({ where: { login: parsed.data.login } });
  if (loginTaken) {
    return Response.json({ error: "Login jest już zajęty." }, { status: 409 });
  }
  if (emailNormalized) {
    const emailTaken = await prisma.user.findFirst({ where: { email: emailNormalized } });
    if (emailTaken) {
      return Response.json({ error: "E-mail jest już używany." }, { status: 409 });
    }
  }

  const providedPassword = parsed.data.password?.trim();
  const plainPassword = providedPassword
    ? providedPassword
    : parsed.data.autoGenerateSimplePassword
      ? generateSimplePassword()
      : undefined;
  if (!plainPassword) {
    return Response.json({ error: "Podaj hasło lub włącz automatyczne hasło." }, { status: 400 });
  }

  const passwordHash = await bcrypt.hash(plainPassword, 12);
  const created = await prisma.$transaction(async (tx) => {
    const uniqueRoles = Array.from(new Set(parsed.data.roles));

    const user = await tx.user.create({
      data: {
        login: parsed.data.login,
        passwordHash,
        name: parsed.data.name ?? null,
        email: emailNormalized,
        mustSetEmailOnLogin: !emailNormalized,
        mustChangePassword: true,
        accountActive: parsed.data.accountActive,
        pzdMemberSince: parsed.data.pzdMemberSince ?? null,
        roles: uniqueRoles.length
          ? {
              createMany: {
                data: uniqueRoles.map((role) => ({ role })),
              },
            }
          : undefined,
      },
      select: {
        id: true,
        login: true,
        email: true,
        name: true,
        roles: { select: { role: true } },
        accountActive: true,
        mustSetEmailOnLogin: true,
      },
    });

    if (parsed.data.plotId) {
      const plot = await tx.plot.findUnique({
        where: { id: parsed.data.plotId },
        select: { allowsTwoOwners: true, number: true },
      });
      if (!plot) {
        throw new Error("PLOT_NOT_FOUND");
      }

      const activeAssignments = await tx.plotAssignment.findMany({
        where: { plotId: parsed.data.plotId, unassignedAt: null },
        select: { id: true },
      });
      if (activeAssignments.length > 1) {
        throw new Error("PLOT_HAS_TOO_MANY_ASSIGNMENTS");
      }
      if (activeAssignments.length === 1 && !plot.allowsTwoOwners) {
        await tx.plotAssignment.updateMany({
          where: { plotId: parsed.data.plotId, unassignedAt: null },
          data: { unassignedAt: new Date() },
        });
      }
      if (activeAssignments.length === 1 && plot.allowsTwoOwners === true) {
        // For co-owner mode we keep the existing owner and add the second one.
      }
      await tx.plotAssignment.create({
        data: {
          plotId: parsed.data.plotId,
          userId: user.id,
          assignedById: session.user.id,
        },
      });
    }

    return user;
  }).catch((e) => {
    if (e instanceof Error && e.message === "PLOT_NOT_FOUND") {
      return "PLOT_NOT_FOUND" as const;
    }
    if (e instanceof Error && e.message === "PLOT_HAS_TOO_MANY_ASSIGNMENTS") {
      return "PLOT_HAS_TOO_MANY_ASSIGNMENTS" as const;
    }
    throw e;
  });

  if (created === "PLOT_NOT_FOUND") {
    return Response.json({ error: "Wybrana działka nie istnieje." }, { status: 404 });
  }
  if (created === "PLOT_HAS_TOO_MANY_ASSIGNMENTS") {
    return Response.json({ error: "Wybrana działka ma więcej niż jedno aktywne przypisanie." }, { status: 409 });
  }

  return Response.json({
    user: created,
    generatedPassword: parsed.data.autoGenerateSimplePassword ? plainPassword : undefined,
  });
}
