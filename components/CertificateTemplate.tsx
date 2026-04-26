import React, { forwardRef } from 'react';
import { QrCode } from 'lucide-react';

interface CertificateTemplateProps {
  id: string;
  studentName: string;
  courseName: string;
  date: string;
}

// Kurs nomiga qarab fon rasmi tanlanadi
const backgrounds: Record<string, string> = {
  'Shar dekoratsiyasi': '/certificates/shar_sertficate.png',
  'SMM': '/certificates/moliyaviy_savodxonlik.png', // SMM uchun hozircha shu, yoki boshqa rasm
  'Time Management': '/certificates/time_management.png',
  'Vaqt boshqaruvi': '/certificates/time_management.png',
  'Notiqlik': '/certificates/notiqlik sertifikat.png',
  'Volontyorlik': '/certificates/volontyorlik sertifikat.png',
  'Imij': '/certificates/Imidj sertifikat.png',
  'Imij (Shaxsiy Brend)': '/certificates/Imidj sertifikat.png',
  'default': '/certificates/moliyaviy_savodxonlik.png' 
};

export const CertificateTemplate = forwardRef<HTMLDivElement, CertificateTemplateProps>(
  ({ id, studentName, courseName, date }, ref) => {
    
    const bgImage = backgrounds[courseName] || backgrounds['default'];

    return (
      <div
        ref={ref}
        style={{ width: '1000px', height: '707px', backgroundColor: 'white' }}
        className="relative flex overflow-hidden box-border"
      >
        {/* Fon rasmi */}
        <img 
          src={bgImage} 
          alt="Certificate Background" 
          className="absolute inset-0 w-full h-full object-cover z-0" 
          crossOrigin="anonymous" /* rasm cross-origin blokirovka bo'lmasligi uchun */
        />

        {/* O'quvchining ismi - Premium dizayn stili */}
        <div className="absolute z-10" style={{ top: '60.8%', left: '11.8%', width: '70%' }}>
           <h4 className="text-[34px] font-black text-[#1F1F1F] leading-none" style={{ 
             fontFamily: "'Segoe UI', Roboto, Helvetica, Arial, sans-serif", 
             textShadow: '0.4px 0.4px 0px rgba(255,255,255,0.7)',
             letterSpacing: '0.5px'
           }}>
             {studentName}
           </h4>
        </div>

        {/* ID va Sana QR kod bilan - Professional burchak */}
        <div className="absolute z-10 flex flex-col items-center opacity-90" style={{ bottom: '48px', left: '65px' }}>
          <div className="w-[84px] h-[84px] bg-white/95 p-2 shadow-md rounded-xl flex items-center justify-center border border-gray-100">
            <QrCode className="w-full h-full text-[#1a3a16]" strokeWidth={1.2} />
          </div>
          <div className="mt-2 text-center bg-white/80 backdrop-blur-sm px-3 py-1 rounded-lg border border-white/50 shadow-sm">
            <p className="text-[9px] text-[#2d4a22] font-mono leading-tight font-bold tracking-tighter">
              CERT ID: <span className="text-black">{id}</span>
            </p>
            <p className="text-[9px] text-[#2d4a22] font-mono leading-tight font-bold tracking-tighter">
              ISSUED: <span className="text-black">{date}</span>
            </p>
          </div>
        </div>

      </div>
    );
  }
);

CertificateTemplate.displayName = 'CertificateTemplate';
