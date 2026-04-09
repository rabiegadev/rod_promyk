import Link from "next/link";

type Props = {
  className?: string;
  showText?: boolean;
};

export function PromykLogo({ className = "", showText = true }: Props) {
  return (
    <Link href="/" className={`group flex min-w-0 items-center gap-2 sm:gap-3 ${className}`}>
      <span className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-100 to-lime-200 p-1.5 shadow-md ring-2 ring-white/80 sm:h-11 sm:w-11">
        <svg viewBox="0 0 40 40" className="h-full w-full" aria-hidden>
          <defs>
            <linearGradient id="promyk-sun" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fef08a" />
              <stop offset="100%" stopColor="#facc15" />
            </linearGradient>
          </defs>
          <circle cx="20" cy="16" r="9" fill="url(#promyk-sun)" />
          {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
            <line
              key={deg}
              x1="20"
              y1="16"
              x2={20 + Math.cos(((deg - 90) * Math.PI) / 180) * 12}
              y2={16 + Math.sin(((deg - 90) * Math.PI) / 180) * 12}
              stroke="#fbbf24"
              strokeWidth="1.2"
              strokeLinecap="round"
              opacity={0.35}
            />
          ))}
          <path
            d="M20 24c-3.5 1.2-6 3.8-6 6.8 0 1 .8 1.8 1.8 1.8h8.4c1 0 1.8-.8 1.8-1.8 0-3-2.5-5.6-6-6.8z"
            fill="#22c55e"
          />
          <path d="M17 28c1.5-.8 3-1.2 4.5-1.2s3 .4 4.5 1.2" stroke="#15803d" strokeWidth="0.8" opacity={0.45} fill="none" />
        </svg>
      </span>
      {showText ? (
        <span className="min-w-0">
          <span className="block truncate text-sm font-bold tracking-tight text-emerald-950 group-hover:text-emerald-800 sm:text-base">
            ROD „Promyk”
          </span>
          <span className="hidden text-xs font-medium text-emerald-800/75 sm:block">Przylep · rodzinny ogród działkowy</span>
          <span className="block text-[11px] font-medium leading-tight text-emerald-800/75 sm:hidden">Przylep</span>
        </span>
      ) : null}
    </Link>
  );
}
