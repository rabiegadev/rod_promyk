import { Role } from "@prisma/client";
import { z } from "zod";

import { auth } from "@/auth";
import { forbidden, requireRoles, unauthorized } from "@/lib/api-auth";
import { getPublicAppUrl } from "@/lib/app-url";
import { notifyNewChatMessage } from "@/lib/mail";
import { prisma } from "@/lib/prisma";

const postSchema = z.object({
  body: z.string().min(1).max(8000),
  plotHolderId: z.string().optional(),
});

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user) return unauthorized();

  const url = new URL(req.url);
  const plotHolderIdParam = url.searchParams.get("plotHolderId");

  if (session.user.role === Role.ADMIN) {
    if (!plotHolderIdParam) {
      return Response.json({ error: "Podaj plotHolderId." }, { status: 400 });
    }
    const thread = await prisma.chatThread.findUnique({
      where: { plotHolderId: plotHolderIdParam },
      include: {
        messages: { orderBy: { createdAt: "asc" } },
      },
    });
    return Response.json({ messages: thread?.messages ?? [] });
  }

  if (session.user.role !== Role.PLOT_HOLDER) return forbidden();

  const thread = await prisma.chatThread.findUnique({
    where: { plotHolderId: session.user.id },
    include: {
      messages: { orderBy: { createdAt: "asc" } },
    },
  });

  return Response.json({ messages: thread?.messages ?? [] });
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) return unauthorized();

  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return Response.json({ error: "Niepoprawne JSON." }, { status: 400 });
  }

  const parsed = postSchema.safeParse(json);
  if (!parsed.success) {
    return Response.json({ error: "Walidacja nieudana." }, { status: 400 });
  }

  const text = parsed.data.body.trim();
  if (!text) return Response.json({ error: "Pusta wiadomość." }, { status: 400 });

  const baseUrl = getPublicAppUrl();

  if (session.user.role === Role.PLOT_HOLDER) {
    const thread =
      (await prisma.chatThread.findUnique({ where: { plotHolderId: session.user.id } })) ??
      (await prisma.chatThread.create({ data: { plotHolderId: session.user.id } }));

    const msg = await prisma.chatMessage.create({
      data: {
        threadId: thread.id,
        senderId: session.user.id,
        body: text,
      },
    });

    await prisma.chatThread.update({
      where: { id: thread.id },
      data: { lastMessageAt: new Date() },
    });

    const admins = await prisma.user.findMany({
      where: { role: Role.ADMIN, email: { not: null } },
      select: { email: true },
    });
    const emails = admins.map((a) => a.email!).filter(Boolean);
    void notifyNewChatMessage({
      to: emails,
      senderLabel: session.user.name ?? session.user.login ?? "Działkowiec",
      preview: text,
      threadUrl: `${baseUrl}/panel/admin/czat?u=${session.user.id}`,
    }).catch(() => {});

    return Response.json({ message: msg });
  }

  if (!requireRoles(session, [Role.ADMIN])) return forbidden();

  const targetId = parsed.data.plotHolderId;
  if (!targetId) {
    return Response.json({ error: "Administrator musi podać plotHolderId odbiorcy." }, { status: 400 });
  }

  const thread =
    (await prisma.chatThread.findUnique({ where: { plotHolderId: targetId } })) ??
    (await prisma.chatThread.create({ data: { plotHolderId: targetId } }));

  const msg = await prisma.chatMessage.create({
    data: {
      threadId: thread.id,
      senderId: session.user.id,
      body: text,
    },
  });

  await prisma.chatThread.update({
    where: { id: thread.id },
    data: { lastMessageAt: new Date() },
  });

  const holder = await prisma.user.findUnique({
    where: { id: targetId },
    select: { email: true, name: true, login: true },
  });

  if (holder?.email) {
    void notifyNewChatMessage({
      to: [holder.email],
      senderLabel: "Zarząd ROD Promyk",
      preview: text,
      threadUrl: `${baseUrl}/panel/czat`,
    }).catch(() => {});
  }

  return Response.json({ message: msg });
}
