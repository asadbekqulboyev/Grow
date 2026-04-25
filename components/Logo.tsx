'use client';

export function Logo({ size = 40, className = '' }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Tree trunk */}
      <path
        d="M50 85 L50 55"
        stroke="#2D5A27"
        strokeWidth="6"
        strokeLinecap="round"
      />
      {/* Roots */}
      <path
        d="M50 85 L38 92 M50 85 L62 92 M50 85 L50 95"
        stroke="#2D5A27"
        strokeWidth="3"
        strokeLinecap="round"
      />
      {/* Left branch */}
      <path
        d="M50 65 L32 50"
        stroke="#2D5A27"
        strokeWidth="4"
        strokeLinecap="round"
      />
      {/* Right branch */}
      <path
        d="M50 65 L68 50"
        stroke="#2D5A27"
        strokeWidth="4"
        strokeLinecap="round"
      />
      {/* Main leaf cluster - center */}
      <ellipse cx="50" cy="32" rx="18" ry="22" fill="#2D5A27" opacity="0.9" />
      {/* Light accent leaves */}
      <ellipse cx="35" cy="42" rx="12" ry="14" fill="#A8E6CF" opacity="0.7" />
      <ellipse cx="65" cy="42" rx="12" ry="14" fill="#A8E6CF" opacity="0.7" />
      {/* Dark overlay leaves */}
      <ellipse cx="40" cy="35" rx="10" ry="13" fill="#2D5A27" opacity="0.6" />
      <ellipse cx="60" cy="35" rx="10" ry="13" fill="#2D5A27" opacity="0.6" />
      {/* Small sprout on top */}
      <path
        d="M50 12 Q55 18 50 22 Q45 18 50 12Z"
        fill="#A8E6CF"
      />
    </svg>
  );
}
