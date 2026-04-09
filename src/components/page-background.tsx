export function PageBackground() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10">
      <div className="absolute inset-0 bg-gradient-to-b from-amber-50 via-lime-50/90 to-emerald-100/85" />
      <div className="promyk-sun-glow" />
      <div className="promyk-sunbeams" />
      <svg
        className="promyk-trees max-sm:opacity-25"
        viewBox="0 0 1200 120"
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          fill="currentColor"
          d="M0 120V85c40-8 80-12 120-8s100 18 160 14 120-28 200-32 160 36 240 40 160-44 240-48 160 24 200 28 80-6 120-10 56 8 120 12V120H0z"
          opacity="0.25"
        />
        <g fill="currentColor">
          {[
            [40, 118],
            [120, 118],
            [200, 118],
            [280, 118],
            [360, 118],
            [440, 118],
            [520, 118],
            [600, 118],
            [680, 118],
            [760, 118],
            [840, 118],
            [920, 118],
            [1000, 118],
            [1080, 118],
          ].map(([x, y], i) => (
            <g key={i} transform={`translate(${x - 18} ${y - 95})`}>
              <path d="M18 95 L18 62 Q10 58 6 48 Q14 44 18 38 Q22 44 30 48 Q26 58 18 62 Z" opacity="0.55" />
              <path d="M18 72 L10 78 L18 68 L26 78 Z" opacity="0.35" />
            </g>
          ))}
        </g>
      </svg>
    </div>
  );
}
