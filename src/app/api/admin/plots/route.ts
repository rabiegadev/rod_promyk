import { auth } from "@/auth";
import { forbidden, isAdmin, unauthorized } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user) return unauthorized();
  if (!isAdmin(session)) return forbidden();

  const plots = await prisma.plot.findMany({
    orderBy: { number: "asc" },
    include: {
      assignments: {
        where: { unassignedAt: null },
        include: { user: { select: { id: true, login: true, name: true, email: true } } },
      },
    },
  });

  return Response.json({ plots });
}
