'use client';

import { useState, useRef, useEffect } from 'react';
import { CertificateTemplate } from './CertificateTemplate';

interface DownloadCertificateBtnProps {
  certData: {
    id: string;
    studentName: string;
    courseName: string;
    date: string;
  };
  className?: string;
  children?: React.ReactNode;
  autoDownload?: boolean;
}

export function DownloadCertificateBtn({ certData, className, children, autoDownload }: DownloadCertificateBtnProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [downloaded, setDownloaded] = useState(false);
  const [showTemplate, setShowTemplate] = useState(false);
  const certRef = useRef<HTMLDivElement>(null);

  const handleDownload = async () => {
    if (isGenerating) return;
    setIsGenerating(true);
    
    // Template'ni faqat PDF yaratish boshlanganda renderlaymiz (lazy)
    setShowTemplate(true);
    
    try {
      // Komponentni to'liq renderlanishi uchun kutish (QR + rasmlar)
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      if (!certRef.current) {
        throw new Error('Template render bo\'lmadi');
      }

      const element = certRef.current;

      // Fon rasmini data URL ga aylantirish (CORS uchun)
      const bgImages = Array.from(element.querySelectorAll('img'));
      for (const img of bgImages) {
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
          console.warn('Rasm convert xatosi:', img.src, e);
        }
      }

      await new Promise(resolve => setTimeout(resolve, 200));

      // Dynamic import — faqat kerak bo'lganda yuklanadi (~400KB tejash)
      const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
        import('html2canvas'),
        import('jspdf'),
      ]);

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#FFFFFF',
        logging: false,
        width: 1000,
        height: 707,
      });
      
      const imgData = canvas.toDataURL('image/png', 1.0);
      
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'px',
        format: [1000, 707],
      });
      
      pdf.addImage(imgData, 'PNG', 0, 0, 1000, 707);
      
      const fileName = `Sertifikat_${certData.courseName.replace(/\s+/g, '_')}_${certData.id.substring(0, 8)}.pdf`;
      pdf.save(fileName);
      setDownloaded(true);
      
    } catch (error: any) {
      console.error('PDF xatosi:', error);
      alert('Xatolik yuz berdi. Iltimos, sahifani yangilab qayta urinib ko\'ring.');
    } finally {
      setIsGenerating(false);
      // Template'ni olib tashlaymiz (xotira tejash)
      setShowTemplate(false);
    }
  };

  // Avtomatik yuklab olish — komponent renderlanganidan keyin
  useEffect(() => {
    if (autoDownload && !downloaded && certData.id) {
      const timer = setTimeout(() => {
        handleDownload();
      }, 500);
      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoDownload, certData.id]);

  return (
    <>
      <button 
        onClick={handleDownload} 
        disabled={isGenerating}
        className={className}
      >
        {isGenerating ? 'Yuklanmoqda...' : (downloaded && autoDownload ? '✅ Qayta yuklab olish' : children)}
      </button>

      {/* Offscreen — faqat PDF generatsiya paytida renderlanadi (lazy) */}
      {showTemplate && (
        <div 
          style={{ 
            position: 'fixed', 
            top: '-9999px',
            left: '-9999px',
            zIndex: -50,
            opacity: 0,
            pointerEvents: 'none',
          }}
        >
          <CertificateTemplate
            ref={certRef}
            id={certData.id}
            studentName={certData.studentName}
            courseName={certData.courseName}
            date={certData.date}
          />
        </div>
      )}
    </>
  );
}
