'use client';

import { useState, useEffect } from 'react';
import { Logo } from './Logo';

export default function Preloader() {
  const [isVisible, setIsVisible] = useState(true);
  const [isFading, setIsFading] = useState(false);

  useEffect(() => {
    // Only show on first visit per session
    if (sessionStorage.getItem('preloader_shown')) {
      setIsVisible(false);
      return;
    }
    sessionStorage.setItem('preloader_shown', 'true');

    const timer = setTimeout(() => {
      setIsFading(true);
      setTimeout(() => setIsVisible(false), 500);
    }, 1200);

    return () => clearTimeout(timer);
  }, []);

  if (!isVisible) return null;

  return (
    <div
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-gradient-to-br from-[#1a3a15] via-[#2D5A27] to-[#1a4520] transition-opacity duration-500 ${
        isFading ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      <div className="relative w-24 h-24 mb-6">
        <div className="absolute inset-0 rounded-full bg-[#A8E6CF]/20 animate-ping" style={{ animationDuration: '2s' }}></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <Logo size={64} />
        </div>
      </div>

      <h1 className="text-3xl font-bold text-white tracking-tight mb-1">
        Grow<span className="text-[#A8E6CF]">.UZ</span>
      </h1>
      <p className="text-[#A8E6CF]/60 text-sm font-medium tracking-widest uppercase">
        Soft Skills Academy
      </p>

      <div className="flex gap-1.5 mt-6">
        <div className="w-2 h-2 rounded-full bg-[#A8E6CF] animate-bounce" style={{ animationDelay: '0ms' }}></div>
        <div className="w-2 h-2 rounded-full bg-[#A8E6CF] animate-bounce" style={{ animationDelay: '150ms' }}></div>
        <div className="w-2 h-2 rounded-full bg-[#A8E6CF] animate-bounce" style={{ animationDelay: '300ms' }}></div>
      </div>
    </div>
  );
}
