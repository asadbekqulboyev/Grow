import React, { forwardRef } from 'react';

interface CertificateTemplateProps {
  id: string;
  studentName: string;
  courseName: string;
  date: string;
}

// Kurs nomiga qarab fon rasmi tanlanadi
const backgrounds: Record<string, string> = {
  'Shar dekoratsiyasi': '/certificates/shar_sertficate.png',
  'Vaqt boshqaruvi': '/certificates/time_management.png',
  'Time Management': '/certificates/time_management.png',
  'Notiqlik': '/certificates/notiqlik sertifikat.png',
  'Volontyorlik': '/certificates/volontyorlik sertifikat.png',
  'Imij': '/certificates/Imidj sertifikat.png',
  'Imij (Shaxsiy Brend)': '/certificates/Imidj sertifikat.png',
  'Moliyaviy savodxonlik': '/certificates/moliyaviy_savodxonlik.png',
  'SMM': '/certificates/moliyaviy_savodxonlik.png',
  'default': '/certificates/moliyaviy_savodxonlik.png'
};

// Sayt domenini aniqlash (har qanday muhitda ishlashi uchun)
function getAppBaseUrl(): string {
  // 1. NEXT_PUBLIC_APP_URL env o'zgaruvchisi
  if (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL;
  }
  // 2. Browser muhitida hozirgi domain
  if (typeof window !== 'undefined' && window.location?.origin) {
    return window.location.origin;
  }
  // 3. Vercel muhiti uchun fallback
  if (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_VERCEL_URL) {
    return `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`;
  }
  return 'https://grow.uz';
}

// Ism uzunligiga qarab font o'lchamini dinamik hisoblash
function calculateFontSize(name: string): number {
  const len = name.length;
  if (len <= 18) return 22;
  if (len <= 25) return 20;
  if (len <= 32) return 18;
  if (len <= 40) return 16;
  return 14;
}

export const CertificateTemplate = forwardRef<HTMLDivElement, CertificateTemplateProps>(
  ({ id, studentName, courseName, date }, ref) => {
    
    const bgUrl = backgrounds[courseName] || backgrounds['default'];
    const baseUrl = getAppBaseUrl();
    const verifyUrl = `${baseUrl}/verify/${id}`;
    const fontSize = calculateFontSize(studentName);

    return (
      <div
        ref={ref}
        style={{ 
          width: '1000px', 
          height: '707px', 
          backgroundColor: 'white',
          position: 'relative',
          fontFamily: "var(--font-montserrat), sans-serif"
        }}
        className="flex flex-col items-center overflow-hidden box-border"
      >
        {/* Background Image */}
        <img 
          src={bgUrl}
          className="absolute inset-0 w-full h-full object-cover z-0"
          alt="Certificate Template"
          crossOrigin="anonymous"
        />

        <div className="relative z-10 w-full h-full flex flex-col">
          
          {/* Ism-sharif — Chiziq ustida, fond rangi bilan birxil, kichikroq */}
          <div 
            className="absolute"
            style={{ 
              top: '52%', 
              left: '11.8%', 
              width: '55%',
            }}
          >
             <h2 
               style={{ 
                 fontSize: `${fontSize}px`,
                 fontWeight: 700,
                 color: '#2D5A27',
                 textTransform: 'uppercase',
                 lineHeight: 1.3,
                 letterSpacing: '0.3px',
                 overflow: 'hidden',
                 textOverflow: 'ellipsis',
                 whiteSpace: 'nowrap',
                 margin: 0,
                 padding: 0,
               }}
             >
               {studentName}
             </h2>
          </div>

          {/* QR kod — Pastki chap burchak (Muhurga to'qnashmasligi uchun) */}
          <div 
            className="absolute flex items-end gap-2"
            style={{ 
              bottom: '30px', 
              left: '75px',
            }}
          >
            <div 
              style={{ 
                width: '62px', 
                height: '62px', 
                backgroundColor: '#FFFFFF', 
                padding: '3px', 
                borderRadius: '4px', 
                border: '1px solid #e5e7eb',
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                overflow: 'hidden',
                boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
              }}
            >
               <img 
                src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(verifyUrl)}`}
                alt="QR Code"
                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                crossOrigin="anonymous"
               />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
               <span 
                 style={{ 
                   fontSize: '7px', 
                   fontFamily: 'monospace',
                   fontWeight: 600,
                   color: '#6B7280',
                   opacity: 0.7,
                 }}
               >
                 ID: {id}
               </span>
               <span 
                 style={{ 
                   fontSize: '7px', 
                   fontFamily: 'monospace',
                   fontWeight: 600,
                   color: '#6B7280',
                   opacity: 0.7,
                 }}
               >
                 {date}
               </span>
            </div>
          </div>

        </div>
      </div>
    );
  }
);

CertificateTemplate.displayName = 'CertificateTemplate';
