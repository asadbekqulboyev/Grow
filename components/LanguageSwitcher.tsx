'use client'

import { useState, useRef, useEffect } from 'react';
import { Globe, ChevronDown } from 'lucide-react';

const languages = [
  { code: 'uz', name: "O'zbek" },
  { code: 'ru', name: "Русский" },
  { code: 'en', name: "English" },
];

export function LanguageSwitcher() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentLang, setCurrentLang] = useState('uz');
  const [mounted, setMounted] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedLang = languages.find(l => l.code === currentLang) || languages[0];

  if (!mounted) {
    return <div className="w-24 h-9 bg-[#F3F4F6] dark:bg-gray-800 rounded-full animate-pulse hidden sm:block"></div>;
  }

  return (
    <div className="relative" ref={dropdownRef} suppressHydrationWarning>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 bg-[#F3F4F6] dark:bg-gray-800 px-3 sm:px-4 py-2 rounded-full transition-colors duration-300 hover:bg-gray-200 dark:hover:bg-gray-700"
      >
        <Globe className="w-4 h-4 text-[#2D5A27] dark:text-[#A8E6CF]" />
        <span className="font-bold text-sm text-[#1F2937] dark:text-gray-200 hidden sm:inline-block">
          {selectedLang.name}
        </span>
        <span className="font-bold text-sm text-[#1F2937] dark:text-gray-200 sm:hidden">
          {selectedLang.code.toUpperCase()}
        </span>
        <ChevronDown className={`w-4 h-4 text-gray-500 dark:text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-36 bg-white dark:bg-gray-900 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-800 overflow-hidden z-50">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => {
                setCurrentLang(lang.code);
                setIsOpen(false);
              }}
              className={`w-full text-left px-4 py-3 text-sm font-bold transition-colors hover:bg-gray-50 dark:hover:bg-gray-800 ${
                currentLang === lang.code 
                  ? 'text-[#2D5A27] dark:text-[#A8E6CF] bg-[#A8E6CF]/10 dark:bg-[#A8E6CF]/5' 
                  : 'text-gray-600 dark:text-gray-400'
              }`}
            >
              {lang.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
