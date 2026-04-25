'use client';

export function Logo({ size = 40, className = '' }: { size?: number; className?: string }) {
  return (
    <img
      src="/images/logo.svg"
      alt="Grow.UZ Logo"
      style={{ width: size, height: size, objectFit: 'contain' }}
      className={className}
      decoding="async"
      loading="lazy"
    />
  );
}
