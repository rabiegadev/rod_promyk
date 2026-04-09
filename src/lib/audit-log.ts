import { prisma } from "@/lib/prisma";

export async function logUserChange(args: {
  userId: string;
  changedById?: string | null;
  action: string;
  details?: string | null;
  plotId?: string | null;
}) {
  await prisma.userChangeLog.create({
    data: {
      userId: args.userId,
      changedById: args.changedById ?? null,
      action: args.action,
      details: args.details ?? null,
      plotId: args.plotId ?? null,
    },
  });
}

export async function logPlotChange(args: {
  plotId: string;
  changedById?: string | null;
  action: string;
  details?: string | null;
  userId?: string | null;
}) {
  await prisma.plotChangeLog.create({
    data: {
      plotId: args.plotId,
      changedById: args.changedById ?? null,
      action: args.action,
      details: args.details ?? null,
      userId: args.userId ?? null,
    },
  });
}
