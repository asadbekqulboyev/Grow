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

        {/* O'quvchining ismi - Yashil rangda va Chiziq ustida, Chapdan */}
        <div className="absolute z-10" style={{ top: '60.5%', left: '4%' }}>
           <h4 className="text-[36px] font-black text-[#2D5A27] leading-none" style={{ 
             fontFamily: "'Inter', 'Segoe UI', Roboto, Helvetica, Arial, sans-serif", 
             letterSpacing: '-0.5px'
           }}>
             {studentName}
           </h4>
        </div>

        {/* ID va Sana QR kod bilan - Dinamik QR-kod */}
        <div className="absolute z-10 flex flex-col items-center opacity-85" style={{ bottom: '45px', right: '55px' }}>
          <div className="w-[85px] h-[85px] bg-white p-1 shadow-md rounded-lg flex items-center justify-center border border-gray-100 overflow-hidden">
            <img 
              src={`https://chart.googleapis.com/chart?chs=150x150&cht=qr&chl=${encodeURIComponent(typeof window !== 'undefined' ? window.location.origin : '')}/verify/${id}&choe=UTF-8`}
              alt="QR Verification"
              className="w-full h-full object-contain"
              crossOrigin="anonymous"
            />
          </div>
          <div className="mt-2 text-right bg-white/40 backdrop-blur-[2px] px-2 py-0.5 rounded text-[8px] font-mono font-bold text-gray-700">
            ID: {id} | {date}
          </div>
        </div>

      </div>
    );
  }
);

CertificateTemplate.displayName = 'CertificateTemplate';
