import React, { forwardRef } from 'react';

interface CertificateTemplateProps {
  id: string;
  studentName: string;
  courseName: string;
  date: string;
}

export const CertificateTemplate = forwardRef<HTMLDivElement, CertificateTemplateProps>(
  ({ id, studentName, courseName, date }, ref) => {
    return (
      <div
        ref={ref}
        style={{ 
          width: '1000px', 
          height: '707px', 
          backgroundColor: 'white',
          backgroundImage: 'url("/certificates/moliyaviy_savodxonlik.png")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          fontFamily: "var(--font-montserrat), sans-serif"
        }}
        className="relative flex flex-col items-center overflow-hidden box-border"
      >
        {/* Title: SERTIFIKAT - Montserrat Bold, 100pt */}
        <div className="mt-[80px]">
           <h1 className="text-[80px] font-bold text-[#228B22] uppercase tracking-[4px] leading-none">
             SERTIFIKAT
           </h1>
        </div>

        {/* Text: ushbu sertifikat bilan taqdirlanadi - 24pt */}
        <div className="mt-10">
           <p className="text-[20px] font-medium text-[#228B22]/90 italic">
             ushbu sertifikat bilan taqdirlanadi
           </p>
        </div>

        {/* Student Name - Montserrat Bold, 38pt (approx 50px) */}
        <div className="mt-8 border-b-2 border-[#228B22] px-12 min-w-[400px] text-center">
           <h2 className="text-[42px] font-bold text-[#228B22] pb-1 uppercase">
             {studentName}
           </h2>
        </div>

        {/* Course Name - Montserrat Bold, 50pt */}
        <div className="mt-8">
           <h3 className="text-[42px] font-bold text-[#228B22] uppercase tracking-wider">
             {courseName}
           </h3>
        </div>

        {/* Footer Area: Date and QR/Stamp */}
        <div className="absolute bottom-12 left-16 right-16 flex justify-between items-end">
           <div className="text-left">
              <p className="text-[18px] font-bold text-[#228B22]">SANA: {date}</p>
              <p className="text-[14px] font-medium text-[#228B22]/70 font-mono mt-1">ID: {id}</p>
           </div>
           
           {/* Dynamic QR Code */}
           <div className="flex flex-col items-center">
              <div className="w-20 h-20 bg-white/80 p-1 rounded-lg border border-[#228B22]/20 shadow-sm overflow-hidden flex items-center justify-center">
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
    );
  }
);

CertificateTemplate.displayName = 'CertificateTemplate';
