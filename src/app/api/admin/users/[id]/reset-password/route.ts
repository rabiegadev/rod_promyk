import bcrypt from "bcryptjs";

import { auth } from "@/auth";
import { forbidden, isAdmin, unauthorized } from "@/lib/api-auth";
import { generateSimplePassword } from "@/lib/password";
import { prisma } from "@/lib/prisma";

export async function POST(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return unauthorized();
  if (!isAdmin(session)) return forbidden();

  const { id } = await ctx.params;
  const target = await prisma.user.findUnique({
    where: { id },
    select: { id: true, login: true, name: true },
  });
  if (!target) {
    return Response.json({ error: "Nie znaleziono użytkownika." }, { status: 404 });
  }

  const generatedPassword = generateSimplePassword();
  const passwordHash = await bcrypt.hash(generatedPassword, 12);

  await prisma.$transaction(async (tx) => {
    await tx.user.update({
      where: { id },
      data: {
        passwordHash,
        mustChangePassword: true,
      },
    });
    await tx.userChangeLog.create({
      data: {
        userId: id,
        changedById: session.user.id,
        action: "Reset hasła",
        details: "Zresetowano hasło startowe (wymagana zmiana po logowaniu).",
      },
    });
  });

  return Response.json({
    user: target,
    generatedPassword,
    message: "Hasło zresetowane. Użytkownik będzie musiał je zmienić po zalogowaniu.",
  });
}
