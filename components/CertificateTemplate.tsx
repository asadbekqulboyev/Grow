'use client';

import React, { forwardRef, useEffect, useState } from 'react';
import QRCode from 'qrcode';

interface CertificateTemplateProps {
  id: string;
  studentName: string;
  courseName: string;
  date: string;
}

// Kurs nomi → sertifikat fon rasmi (kalit so'z asosida)
// Har bir entry: [kalit so'zlar massivi, rasm yo'li]
const CERT_BACKGROUNDS: Array<[string[], string]> = [
  [['shar', 'dekoratsiya'], '/certificates/shar_sertficate.png'],
  [['smm', 'social media'], '/certificates/smm_darslari.png'],
  [['time', 'vaqt', 'management', 'boshqaruv'], '/certificates/time_management.png'],
  [['notiqlik', 'nutq'], '/certificates/notiqlik sertifikat.png'],
  [['volontyorlik', 'volontyor', 'volunteer'], '/certificates/volontyorlik sertifikat.png'],
  [['imij', 'imidj', 'brend', 'brand'], '/certificates/Imidj sertifikat.png'],
  [['moliyaviy', 'moliya', 'savodxonlik', 'finance', 'financial'], '/certificates/moliyaviy_savodxonlik.png'],
];

const DEFAULT_BG = '/certificates/shar_sertficate.png';

function getCertificateBackground(courseName: string): string {
  const lower = courseName.toLowerCase().trim();
  for (const [keywords, bgPath] of CERT_BACKGROUNDS) {
    if (keywords.some(kw => lower.includes(kw))) {
      return bgPath;
    }
  }
  return DEFAULT_BG;
}

// Domen
function getAppBaseUrl(): string {
  if (typeof window !== 'undefined' && window.location?.origin) {
    return window.location.origin;
  }
  return process.env.NEXT_PUBLIC_APP_URL || 'https://grows-alpha.vercel.app';
}

// ===== ISM O'LCHAMI =====
// Dizayner: Montserrat Medium, 22-28 pt
function calculateFontSize(name: string): number {
  const len = name.length;
  if (len <= 18) return 28;
  if (len <= 25) return 26;
  if (len <= 32) return 24;
  if (len <= 40) return 22;
  return 20;
}

// ===== SERTIFIKAT POZITSIYALARI =====
const CERT_WIDTH = 1000;
const CERT_HEIGHT = 707;

export const CertificateTemplate = forwardRef<HTMLDivElement, CertificateTemplateProps>(
  ({ id, studentName, courseName, date }, ref) => {
    const bgUrl = getCertificateBackground(courseName);
    const baseUrl = getAppBaseUrl();
    const verifyUrl = `${baseUrl}/verify/${id}`;
    const fontSize = calculateFontSize(studentName);
    const [qrDataUrl, setQrDataUrl] = useState<string>('');

    useEffect(() => {
      let cancelled = false;
      
      QRCode.toDataURL(verifyUrl, {
        width: 200,
        margin: 1,
        color: {
          dark: '#000000',
          light: '#FFFFFF',
        },
        errorCorrectionLevel: 'M',
      })
        .then((dataUrl) => {
          if (!cancelled) setQrDataUrl(dataUrl);
        })
        .catch((err) => {
          console.warn('QR generation failed:', err);
        });

      return () => { cancelled = true; };
    }, [verifyUrl]);

    return (
      <div
        ref={ref}
        style={{ 
          width: `${CERT_WIDTH}px`, 
          height: `${CERT_HEIGHT}px`, 
          backgroundColor: 'white',
          position: 'relative',
          fontFamily: "'Montserrat', sans-serif",
          overflow: 'hidden',
        }}
      >
        {/* Fon rasmi */}
        <img 
          src={bgUrl}
          style={{ 
            position: 'absolute', top: 0, left: 0, 
            width: '100%', height: '100%', 
            objectFit: 'cover',
          }}
          alt="Certificate Background"
          crossOrigin="anonymous"
        />

        {/* ISM-FAMILIYA — chiziqdan yuqorida */}
        <div 
          style={{ 
            position: 'absolute',
            bottom: '285px',
            left: '143px',
            maxWidth: '500px',
            whiteSpace: 'nowrap',
            textOverflow: 'ellipsis',
          }}
        >
          <span 
            style={{ 
              fontSize: `${fontSize}px`,
              fontWeight: 600,
              color: '#228B22',
              textTransform: 'uppercase',
              lineHeight: 'normal',
              letterSpacing: '0.5px',
              display: 'block',
            }}
          >
            {studentName}
          </span>
        </div>

        {/* QR kod — pastki chap (haqiqiy, skanerlanadigan) */}
        <div 
          style={{ 
            position: 'absolute',
            bottom: '28px', 
            left: '70px',
            display: 'flex',
            alignItems: 'flex-end',
            gap: '6px',
          }}
        >
          <div 
            style={{ 
              width: '60px', height: '60px', 
              backgroundColor: '#FFFFFF', 
              padding: '3px', borderRadius: '4px', 
              border: '1px solid rgba(0,0,0,0.08)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', 
              overflow: 'hidden',
            }}
          >
            {qrDataUrl ? (
              <img src={qrDataUrl} alt="QR" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
            ) : (
              <div style={{ width: '100%', height: '100%', backgroundColor: '#f3f4f6' }} />
            )}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
            <span style={{ fontSize: '7px', fontFamily: 'monospace', fontWeight: 600, color: '#9CA3AF' }}>
              ID: {id.length > 12 ? id.substring(0, 12) + '...' : id}
            </span>
            <span style={{ fontSize: '7px', fontFamily: 'monospace', fontWeight: 600, color: '#9CA3AF' }}>
              {date}
            </span>
          </div>
        </div>
      </div>
    );
  }
);

CertificateTemplate.displayName = 'CertificateTemplate';
