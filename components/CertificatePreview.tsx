'use client';

import { useEffect, useRef, useState } from 'react';
import { CertificateTemplate } from './CertificateTemplate';

// Sertifikat rasmlarini keshlaydigan global cache (sahifa bo'ylab saqlanadi)
const certImageCache = new Map<string, string>();

interface CertificatePreviewProps {
  id: string;
  studentName: string;
  courseName: string;
  date: string;
  className?: string;
}

export function CertificatePreview({ id, studentName, courseName, date, className }: CertificatePreviewProps) {
  const certRef = useRef<HTMLDivElement>(null);
  const [imageUrl, setImageUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  // Unikal kalit — cache uchun
  const cacheKey = `cert_${id}_${studentName}_${courseName}`;

  useEffect(() => {
    let cancelled = false;

    // 1) Avval keshdan tekshirish
    const cached = certImageCache.get(cacheKey);
    if (cached) {
      setImageUrl(cached);
      setIsLoading(false);
      return;
    }

    // 2) sessionStorage'dan tekshirish (sahifa yangilanganda ham saqlanadi)
    try {
      const stored = sessionStorage.getItem(cacheKey);
      if (stored) {
        certImageCache.set(cacheKey, stored);
        setImageUrl(stored);
        setIsLoading(false);
        return;
      }
    } catch {}

    const capture = async () => {
      // CertificateTemplate ichidagi QR code va rasmlar renderlanishi uchun kutish
      await new Promise(resolve => setTimeout(resolve, 1500));

      if (!certRef.current || cancelled) return;

      try {
        // Rasm elementlarini data URL ga aylantirish (CORS uchun)
        const imgs = Array.from(certRef.current.querySelectorAll('img'));
        for (const img of imgs) {
          try {
            if (img.src.startsWith('data:')) continue;
            const response = await fetch(img.src);
            const blob = await response.blob();
            const dataUrl = await new Promise<string>((resolve) => {
              const reader = new FileReader();
              reader.onloadend = () => resolve(reader.result as string);
              reader.readAsDataURL(blob);
            });
            img.src = dataUrl;
          } catch (e) {
            // Rasm convert xatosi — davom etamiz
          }
        }

        await new Promise(resolve => setTimeout(resolve, 200));

        // html2canvas dynamic import — faqat kerak bo'lganda yuklanadi (~400KB tejash)
        const html2canvas = (await import('html2canvas')).default;

        const canvas = await html2canvas(certRef.current, {
          scale: 1.5,
          useCORS: true,
          allowTaint: true,
          backgroundColor: '#FFFFFF',
          logging: false,
          width: 1000,
          height: 707,
        });

        if (!cancelled) {
          const dataUrl = canvas.toDataURL('image/png', 0.85);
          
          // Keshga saqlash
          certImageCache.set(cacheKey, dataUrl);
          try { sessionStorage.setItem(cacheKey, dataUrl); } catch {}
          
          setImageUrl(dataUrl);
          setIsLoading(false);
        }
      } catch (err) {
        console.warn('Certificate preview capture failed:', err);
        if (!cancelled) setIsLoading(false);
      }
    };

    capture();
    return () => { cancelled = true; };
  }, [id, studentName, courseName, date, cacheKey]);

  return (
    <>
      {/* Yashirin CertificateTemplate — faqat cache bo'lmaganda render qilinadi */}
      {!imageUrl && (
        <div
          style={{
            position: 'fixed',
            top: '-9999px',
            left: '-9999px',
            zIndex: -100,
            opacity: 0,
            pointerEvents: 'none',
          }}
        >
          <CertificateTemplate
            ref={certRef}
            id={id}
            studentName={studentName}
            courseName={courseName}
            date={date}
          />
        </div>
      )}

      {/* Ko'rsatiladigan rasm */}
      <div className={className}>
        {isLoading ? (
          <div className="w-full aspect-[1000/707] bg-gradient-to-br from-gray-100 to-gray-50 dark:from-gray-700 dark:to-gray-800 rounded-xl flex items-center justify-center animate-pulse">
            <div className="flex flex-col items-center gap-2">
              <div className="w-8 h-8 border-3 border-[#2D5A27] border-t-transparent rounded-full animate-spin"></div>
              <span className="text-xs text-gray-400 dark:text-gray-500 font-medium">Sertifikat yuklanmoqda...</span>
            </div>
          </div>
        ) : imageUrl ? (
          <img
            src={imageUrl}
            alt={`${courseName} — Sertifikat`}
            className="w-full rounded-xl shadow-md border border-gray-200 dark:border-gray-600"
            style={{ aspectRatio: '1000 / 707' }}
          />
        ) : (
          <div className="w-full aspect-[1000/707] bg-gray-100 dark:bg-gray-700 rounded-xl flex items-center justify-center">
            <span className="text-xs text-gray-400">Rasmni yuklashda xatolik</span>
          </div>
        )}
      </div>
    </>
  );
}
