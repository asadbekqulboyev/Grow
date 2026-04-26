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

export const CertificateTemplate = forwardRef<HTMLDivElement, CertificateTemplateProps>(
  ({ id, studentName, courseName, date }, ref) => {
    
    const bgUrl = backgrounds[courseName] || backgrounds['default'];

    return (
      <div
        ref={ref}
        style={{ 
          width: '1000px', 
          height: '707px', 
          backgroundColor: 'white',
          position: 'relative'
        }}
        className="flex flex-col items-center overflow-hidden box-border"
      >
        {/* Fon rasmi (Dinamik) */}
        <img 
          src={bgUrl}
          className="absolute inset-0 w-full h-full object-cover z-0"
          alt="Certificate Background"
          crossOrigin="anonymous"
          onError={(e) => {
            // Agar rasm topilmasa, default rasmga qaytadi
            (e.target as HTMLImageElement).src = backgrounds['default'];
          }}
        />

        <div className="relative z-10 w-full h-full flex flex-col items-center">
          {/* Sarlavha: SERTIFIKAT - Montserrat Bold, 100pt */}
          <div className="mt-[75px]">
             <h1 className="text-[85px] font-bold text-[#228B22] uppercase tracking-[4px] leading-none" style={{ fontFamily: "var(--font-montserrat), sans-serif" }}>
               SERTIFIKAT
             </h1>
          </div>

          {/* Text: ushbu sertifikat bilan taqdirlanadi - 24pt */}
          <div className="mt-12">
             <p className="text-[21px] font-medium text-[#228B22]/90 italic" style={{ fontFamily: "var(--font-montserrat), sans-serif" }}>
               ushbu sertifikat bilan taqdirlanadi
             </p>
          </div>

          {/* O'quvchining ismi - Montserrat Bold, Chiziq ustida, Chapdan */}
          <div className="mt-12 w-full px-[11.5%] text-left" style={{ marginTop: '45px' }}>
             <h2 className="text-[44px] font-bold text-[#228B22] uppercase tracking-tight" style={{ fontFamily: "var(--font-montserrat), sans-serif" }}>
               {studentName}
             </h2>
          </div>

          {/* Kurs Nomi - Montserrat Bold, 50pt */}
          <div className="mt-14 w-full px-[11.5%]">
             <h3 className="text-[48px] font-bold text-[#228B22] uppercase tracking-wider" style={{ fontFamily: "var(--font-montserrat), sans-serif" }}>
               {courseName}
             </h3>
          </div>

          {/* Footer Area: Date and QR/Stamp */}
          <div className="absolute bottom-14 left-[5%] right-[5%] flex justify-between items-end w-[90%]">
             <div className="text-left text-[#228B22] pl-8">
                <p className="text-[20px] font-bold uppercase" style={{ fontFamily: "var(--font-montserrat), sans-serif" }}>SANA: {date}</p>
                <p className="text-[12px] font-medium opacity-60 font-mono mt-1">ID: {id}</p>
             </div>
             
             {/* Dynamic QR Code - O'ngda */}
             <div className="flex flex-col items-center pr-8">
                <div className="w-[90px] h-[90px] bg-white/95 p-1 rounded-lg border border-[#228B22]/20 shadow-sm overflow-hidden flex items-center justify-center">
                   <img 
                      src={`https://chart.googleapis.com/chart?chs=150x150&cht=qr&chl=${encodeURIComponent(typeof window !== 'undefined' ? window.location.origin : '')}/verify/${id}&choe=UTF-8`}
                      alt="QR"
                      className="w-full h-full object-contain"
                      crossOrigin="anonymous"
                   />
                </div>
             </div>
          </div>
        </div>
      </div>
    );
  }
);

CertificateTemplate.displayName = 'CertificateTemplate';
