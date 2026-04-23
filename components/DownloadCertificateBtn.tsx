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
      
      // html-to-image safely renders the element bypassing html2canvas css-parser errors like 'oklab'
      const imgData = await htmlToImage.toPng(element, {
        quality: 1,
        pixelRatio: 2,
        backgroundColor: '#FFFFFF',
      });
      
      // We know our CertificateTemplate is fixed at 800x600 size
      const width = 800;
      const height = 600;

      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'px',
        format: [width, height]
      });
      
      pdf.addImage(imgData, 'PNG', 0, 0, width, height);
      pdf.save(`Sertifikat_${certData.courseName.replace(/\s+/g, '_')}_${certData.id}.pdf`);
      
    } catch (error) {
      console.error('Failed to generate PDF', error);
      alert('Sertifikat yaratishda xato yuz berdi.');
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
          pointerEvents: 'none'
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
