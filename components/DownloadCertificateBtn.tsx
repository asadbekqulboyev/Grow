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
      
      // Wait for the component to be fully rendered
      await new Promise(resolve => setTimeout(resolve, 800));

      // Function to convert image to data URL
      const toDataURL = (url: string): Promise<string> => {
        return new Promise((resolve, reject) => {
          const img = new Image();
          img.crossOrigin = 'Anonymous';
          img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');
            ctx?.drawImage(img, 0, 0);
            resolve(canvas.toDataURL('image/png'));
          };
          img.onerror = reject;
          img.src = url;
        });
      };

      // Convert all images in the element to Data URLs
      const images = Array.from(element.getElementsByTagName('img'));
      for (const img of images) {
        try {
          if (img.src.startsWith('data:')) continue;
          
          // Add a dummy param for cache busting
          const separator = img.src.includes('?') ? '&' : '?';
          const cacheBustUrl = `${img.src}${separator}cert_cb=${Date.now()}`;
          
          const dataUrl = await toDataURL(cacheBustUrl);
          img.src = dataUrl;
        } catch (e) {
          console.warn('Image to Data URL failed, keeping original:', img.src, e);
          // If it fails, keep the original but set crossOrigin
          img.crossOrigin = 'Anonymous';
        }
      }

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#FFFFFF',
        logging: false,
        // Ensure no oklch colors are processed by forcing CSS styles if needed
        onclone: (clonedDoc) => {
          const el = clonedDoc.querySelector('[ref]') || clonedDoc.body;
          // You could potentially traverse and replace oklch here if needed, 
          // but we handled it in the component itself.
        }
      });
      
      const imgData = canvas.toDataURL('image/png');
      
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
      console.error('PDF Final Error:', error);
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
