import { PromykLogo } from "@/components/promyk-logo";
import { SiteHeaderClient } from "@/components/site-header-client";
import { auth } from "@/auth";

export async function SiteHeader() {
  const session = await auth();

  return (
    <header className="sticky top-0 z-20 border-b border-lime-200/80 bg-white/75 shadow-sm shadow-lime-900/5 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:gap-4">
        <PromykLogo className="min-w-0 flex-1" />
        <SiteHeaderClient isLoggedIn={Boolean(session?.user)} />
      </div>
    </header>
  );
}
