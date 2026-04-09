import { auth } from "@/auth";
import { forbidden, isAdmin, unauthorized } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user) return unauthorized();
  if (!isAdmin(session)) return forbidden();

  const users = await prisma.user.findMany({
    orderBy: [{ role: "asc" }, { login: "asc" }, { email: "asc" }],
    select: {
      id: true,
      login: true,
      email: true,
      name: true,
      role: true,
      accountActive: true,
      pzdMemberSince: true,
      mustSetEmailOnLogin: true,
      createdAt: true,
    },
  });

  return Response.json({ users });
}
