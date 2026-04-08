import { z } from "zod";

import { auth } from "@/auth";
import { unauthorized } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";

const bodySchema = z.object({
  email: z.string().email().max(255).transform((e) => e.toLowerCase()),
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
    return Response.json({ error: "Podaj poprawny adres e-mail." }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { mustSetEmailOnLogin: true },
  });

  if (!user?.mustSetEmailOnLogin) {
    return Response.json({ error: "E-mail jest już ustawiony lub nie wymaga uzupełnienia." }, { status: 400 });
  }

  const taken = await prisma.user.findFirst({
    where: { email: parsed.data.email, NOT: { id: session.user.id } },
  });
  if (taken) {
    return Response.json({ error: "Ten adres e-mail jest już używany." }, { status: 409 });
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: {
      email: parsed.data.email,
      mustSetEmailOnLogin: false,
    },
  });

  return Response.json({ ok: true });
}
