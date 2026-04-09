"use client";

import { LogOut } from "lucide-react";
import { signOut } from "next-auth/react";

export function LogoutButton({ className = "" }: { className?: string }) {
  return (
    <button
      type="button"
      onClick={() => void signOut({ callbackUrl: "/" })}
      className={className}
      aria-label="Wyloguj"
      title="Wyloguj"
    >
      <LogOut className="h-4 w-4" aria-hidden />
      Wyloguj
    </button>
  );
}
