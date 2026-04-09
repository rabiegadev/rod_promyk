"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function FeePaidToggle({ feeId, isPaid }: { feeId: string; isPaid: boolean }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function toggle() {
    setPending(true);
    const res = await fetch(`/api/fees/${feeId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isPaid: !isPaid }),
    });
    setPending(false);
    if (res.ok) router.refresh();
  }

  return (
    <button
      type="button"
      onClick={() => void toggle()}
      disabled={pending}
      className={`min-h-10 rounded-full px-3 py-1.5 text-xs font-semibold ring-1 transition ${
        isPaid
          ? "bg-emerald-100 text-emerald-900 ring-emerald-300 hover:bg-emerald-200"
          : "bg-amber-50 text-amber-950 ring-amber-200 hover:bg-amber-100"
      } disabled:opacity-60`}
    >
      {pending ? "…" : isPaid ? "Opłacono" : "Do zapłaty"}
    </button>
  );
}
