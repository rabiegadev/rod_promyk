import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Role } from "@prisma/client";

export default async function AdminSectionLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect("/logowanie?callbackUrl=/panel/admin");
  if (!(session.user.roles ?? []).includes(Role.ADMIN)) {
    redirect("/panel");
  }
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { mustSetEmailOnLogin: true, mustChangePassword: true },
  });
  if (user?.mustSetEmailOnLogin || user?.mustChangePassword) redirect("/panel");
  return <div className="space-y-6">{children}</div>;
}
