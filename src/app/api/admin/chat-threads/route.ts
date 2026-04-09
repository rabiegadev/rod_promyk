import { auth } from "@/auth";
import { forbidden, isAdmin, unauthorized } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user) return unauthorized();
  if (!isAdmin(session)) return forbidden();

  const threads = await prisma.chatThread.findMany({
    orderBy: { lastMessageAt: "desc" },
    include: {
      plotHolder: {
        select: { id: true, login: true, name: true, email: true },
      },
      messages: {
        orderBy: { createdAt: "desc" },
        take: 1,
        select: { body: true, createdAt: true, senderId: true },
      },
    },
  });

  return Response.json({ threads });
}
