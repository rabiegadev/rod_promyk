import { prisma } from "@/lib/prisma";

/**
 * Zamyka otwarty okres w historii i zapisuje nowy snapshot (konto + PZD).
 */
export async function recordUserStatusChange(
  subjectUserId: string,
  changedById: string,
  next: { accountActive: boolean; pzdMemberSince: Date | null },
  note?: string | null,
) {
  const now = new Date();

  await prisma.$transaction(async (tx) => {
    await tx.userStatusHistory.updateMany({
      where: { userId: subjectUserId, effectiveTo: null },
      data: { effectiveTo: now },
    });

    await tx.userStatusHistory.create({
      data: {
        userId: subjectUserId,
        effectiveFrom: now,
        effectiveTo: null,
        accountActive: next.accountActive,
        pzdMemberSince: next.pzdMemberSince,
        changedById,
        note: note ?? null,
      },
    });
  });
}

export async function getUserStatusHistory(userId: string) {
  return prisma.userStatusHistory.findMany({
    where: { userId },
    orderBy: { effectiveFrom: "desc" },
    include: { changedBy: { select: { name: true, login: true } } },
  });
}
