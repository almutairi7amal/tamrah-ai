export function PalmIllustration({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 200" className={className} aria-hidden="true">
      <circle cx="100" cy="100" r="80" className="fill-secondary" />
      <ellipse cx="100" cy="178" rx="48" ry="6" className="fill-palm-leaf/20" />
      <path d="M96 70 C92 110 94 150 90 178 L110 178 C106 150 106 110 104 70 Z" className="fill-palm-trunk" />
      {[86, 100, 114, 128, 142, 156].map((y) => (
        <path key={y} d={`M92 ${y} L108 ${y - 4}`} className="stroke-foreground/20" strokeWidth="2" />
      ))}
      <g className="fill-palm-leaf">
        <path d="M100 68 C80 40 50 38 24 56 C52 50 76 56 100 72 Z" />
        <path d="M100 68 C120 40 150 38 176 56 C148 50 124 56 100 72 Z" />
        <path d="M100 66 C70 58 44 72 30 100 C52 82 76 74 100 72 Z" />
        <path d="M100 66 C130 58 156 72 170 100 C148 82 124 74 100 72 Z" />
        <path d="M100 70 C90 40 96 22 112 14 C104 32 104 50 102 70 Z" />
      </g>
      <g className="fill-palm-date">
        {[[84, 84], [78, 92], [88, 94], [82, 102], [116, 84], [122, 92], [112, 94], [118, 102]].map(([x, y]) => (
          <ellipse key={`${x}-${y}`} cx={x} cy={y} rx="4" ry="5" />
        ))}
      </g>
    </svg>
  );
}
