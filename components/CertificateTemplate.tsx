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
  'Shar dekoratsiyasi': '/certificates/shar.png',
  'Moliyaviy savodxonlik': '/certificates/moliya.png',
  'Vaqt boshqaruvi': '/certificates/vaqt.png',
  'Volontyorlik': '/certificates/volontyorlik.png',
  'Imij': '/certificates/imidj.png',
  'Imij (Shaxsiy Brend)': '/certificates/imidj.png',
  'default': '/certificates/default.png' // Agar boshqa kurs bo'lsa
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

        {/* O'quvchining ismi */}
        <div className="absolute z-10 w-full flex justify-start" style={{ top: '61%', left: '11%' }}>
           <h4 className="text-[32px] sm:text-[38px] font-black italic text-[#1F2937] px-4" style={{ fontFamily: 'serif' }}>
             {studentName}
           </h4>
        </div>

        {/* ID va Sana QR kod bilan pastki chap burchakda yoziladi */}
        <div className="absolute z-10 flex flex-col items-center" style={{ bottom: '40px', left: '40px' }}>
          <div className="w-20 h-20 bg-white border border-gray-200 p-1.5 shadow-sm rounded-lg flex items-center justify-center">
            <QrCode className="w-[68px] h-[68px] text-[#2D5A27]" strokeWidth={1.5} />
          </div>
          <p className="text-[10px] text-gray-700 mt-1.5 font-mono tracking-widest text-center font-bold bg-white/70 px-2 py-0.5 rounded">
            ID: {id} <br/> DATA: {date}
          </p>
        </div>

      </div>
    );
  }
);

CertificateTemplate.displayName = 'CertificateTemplate';
