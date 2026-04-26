'use client';

import { useState, useRef } from 'react';
import { CertificateTemplate } from './CertificateTemplate';
import * as htmlToImage from 'html-to-image';
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
      
      // html-to-image options to handle CORS and quality
      const imgData = await htmlToImage.toPng(element, {
        quality: 0.95,
        pixelRatio: 2,
        cacheBust: true, // CORS xatoliklarini oldini olish uchun
        backgroundColor: '#FFFFFF',
      });
      
      const width = 1000;
      const height = 707;

      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'px',
        format: [width, height]
      });
      
      pdf.addImage(imgData, 'PNG', 0, 0, width, height);
      pdf.save(`Sertifikat_${certData.courseName.replace(/\s+/g, '_')}_${certData.id.substring(0, 8)}.pdf`);
      
    } catch (error: any) {
      console.error('PDF Generation Detail Error:', error);
      alert(`Sertifikatni yuklab olishda xato: ${error.message || 'Noma\'lum xatolik'}`);
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

      {/* Visually hidden container specifically for the print generation */}
      <div 
        style={{ 
          position: 'fixed', 
          top: '-9999px',
          left: '-9999px',
          zIndex: -50,
          opacity: 0,
          pointerEvents: 'none',
          visibility: 'hidden'
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
