import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { Role } from "@prisma/client";

export default async function AdminSectionLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect("/logowanie?callbackUrl=/panel/admin");
  if (session.user.role !== Role.ADMIN) {
    redirect("/panel");
  }
  return <div className="space-y-6">{children}</div>;
}
