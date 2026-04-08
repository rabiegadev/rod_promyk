import { redirect } from "next/navigation";
import { Suspense } from "react";

import { LoginForm } from "@/components/login-form";
import { auth } from "@/auth";

export default async function LoginPage() {
  const session = await auth();
  if (session?.user) redirect("/panel");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-emerald-950">Logowanie</h1>
        <p className="mt-1 text-sm text-emerald-950/70">
          Działkowcy i członkowie zarządu logują się loginem lub adresem e-mail.
        </p>
      </div>
      <Suspense fallback={<p className="text-sm text-emerald-800/70">Ładowanie formularza…</p>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
