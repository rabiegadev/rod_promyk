import { Role } from "@prisma/client";
import { z } from "zod";

import { auth } from "@/auth";
import { forbidden, isAdmin, unauthorized } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";
import { recordUserStatusChange } from "@/lib/user-status";

const patchSchema = z.object({
  name: z.string().min(1).max(120).optional(),
  roles: z.array(z.nativeEnum(Role)).optional(),
  accountActive: z.boolean().optional(),
  pzdMemberSince: z.union([z.coerce.date(), z.null()]).optional(),
  note: z.string().max(500).optional(),
});

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return unauthorized();
  if (!isAdmin(session)) return forbidden();

  const { id } = await ctx.params;

  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return Response.json({ error: "Niepoprawne JSON." }, { status: 400 });
  }

  const parsed = patchSchema.safeParse(json);
  if (!parsed.success) {
    return Response.json({ error: "Walidacja nieudana." }, { status: 400 });
  }

  const existing = await prisma.user.findUnique({
    where: { id },
    include: { roles: { select: { role: true } } },
  });
  if (!existing) return Response.json({ error: "Nie znaleziono." }, { status: 404 });

  const nextActive = parsed.data.accountActive ?? existing.accountActive;
  const nextPzd =
    parsed.data.pzdMemberSince === undefined ? existing.pzdMemberSince : parsed.data.pzdMemberSince;

  const statusChanged =
    parsed.data.accountActive !== undefined || parsed.data.pzdMemberSince !== undefined;

  if (statusChanged) {
    await recordUserStatusChange(
      id,
      session.user.id,
      { accountActive: nextActive, pzdMemberSince: nextPzd },
      parsed.data.note,
    );
  }

  const updated = await prisma.$transaction(async (tx) => {
    const nextRoles = parsed.data.roles !== undefined ? Array.from(new Set(parsed.data.roles)) : null;
    const beforeRoles = existing.roles.map((r) => r.role).sort();
    const afterRoles = nextRoles ? [...nextRoles].sort() : beforeRoles;

    const updatedUser = await tx.user.update({
      where: { id },
      data: {
        ...(parsed.data.name !== undefined ? { name: parsed.data.name } : {}),
        ...(parsed.data.accountActive !== undefined ? { accountActive: parsed.data.accountActive } : {}),
        ...(parsed.data.pzdMemberSince !== undefined ? { pzdMemberSince: parsed.data.pzdMemberSince } : {}),
        ...(nextRoles
          ? {
              roles: {
                deleteMany: {},
                createMany: {
                  data: nextRoles.map((role) => ({ role })),
                },
              },
            }
          : {}),
      },
      select: {
        id: true,
        login: true,
        email: true,
        name: true,
        roles: { select: { role: true } },
        accountActive: true,
        pzdMemberSince: true,
        mustSetEmailOnLogin: true,
      },
    });

    const logs: { action: string; details?: string; plotId?: string }[] = [];
    if (parsed.data.name !== undefined && parsed.data.name !== (existing.name ?? "")) {
      logs.push({
        action: "Zmiana imienia i nazwiska",
        details: `Zmieniono z "${existing.name ?? "—"}" na "${parsed.data.name}".`,
      });
    }
    if (parsed.data.accountActive !== undefined && parsed.data.accountActive !== existing.accountActive) {
      logs.push({
        action: parsed.data.accountActive ? "Aktywacja konta" : "Dezaktywacja konta",
      });
    }
    if (parsed.data.pzdMemberSince !== undefined) {
      const prev = existing.pzdMemberSince?.toISOString().slice(0, 10) ?? "—";
      const next = parsed.data.pzdMemberSince?.toISOString().slice(0, 10) ?? "—";
      if (prev !== next) {
        logs.push({
          action: "Zmiana daty członkostwa PZD",
          details: `Zmieniono z ${prev} na ${next}.`,
        });
      }
    }
    if (nextRoles && beforeRoles.join(",") !== afterRoles.join(",")) {
      logs.push({
        action: "Zmiana ról",
        details: `Role: ${beforeRoles.join(", ") || "brak"} → ${afterRoles.join(", ") || "brak"}.`,
      });
    }

    for (const log of logs) {
      await tx.userChangeLog.create({
        data: {
          userId: id,
          changedById: session.user.id,
          action: log.action,
          details: log.details ?? null,
          plotId: log.plotId ?? null,
        },
      });
    }

    return updatedUser;
  });

  return Response.json({ user: updated });
}
