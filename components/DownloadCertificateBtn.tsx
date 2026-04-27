'use client';

import { useState, useRef } from 'react';
import { CertificateTemplate } from './CertificateTemplate';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

interface DownloadCertificateBtnProps {
  certData: {
    id: string;
    studentName: string;
    courseName: string;
    date: string;
  };
  className?: string;
  children?: React.ReactNode;
}

export function DownloadCertificateBtn({ certData, className, children }: DownloadCertificateBtnProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const certRef = useRef<HTMLDivElement>(null);

  const handleDownload = async () => {
    if (!certRef.current) return;
    setIsGenerating(true);
    try {
      const element = certRef.current;
      
      // Komponentni to'liq renderlanishi uchun kutish (QR + rasmlar)
      await new Promise(resolve => setTimeout(resolve, 1200));

      // Fon rasmini data URL ga aylantirish (CORS uchun)
      const bgImages = Array.from(element.querySelectorAll('img'));
      for (const img of bgImages) {
        try {
          if (img.src.startsWith('data:')) continue; // QR allaqachon data URL
          
          // Faqat lokal rasmlarni convert qilish
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

      // Yana biroz kutish (rasmlar yangilangandan keyin)
      await new Promise(resolve => setTimeout(resolve, 300));

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
      
    } catch (error: any) {
      console.error('PDF xatosi:', error);
      alert('Xatolik yuz berdi. Iltimos, sahifani yangilab qayta urinib ko\'ring.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <>
      <button 
        onClick={handleDownload} 
        disabled={isGenerating}
        className={className}
      >
        {isGenerating ? 'Yuklanmoqda...' : children}
      </button>

      {/* Offscreen — PDF generatsiya uchun */}
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
    </>
  );
}
