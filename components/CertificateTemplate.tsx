'use client';

import React, { forwardRef } from 'react';
import { QrCode } from 'lucide-react';

interface CertificateTemplateProps {
  id: string;
  studentName: string;
  courseName: string;
  date: string;
}

export const CertificateTemplate = forwardRef<HTMLDivElement, CertificateTemplateProps>(
  ({ id, studentName, courseName, date }, ref) => {
    return (
      // The wrapper must have fixed dimensions matching an A4 paper in landscape
      // 1056x816 (standard US letter ratio landscape) or A4 ratio (1122x793) 
      // We will use 1000x707 for 1.414 ratio (A4)
      <div
        ref={ref}
        style={{ width: '1000px', height: '707px', backgroundColor: 'white' }}
        className="relative bg-white text-[#1F2937] border-[16px] border-[#2D5A27] flex font-sans overflow-hidden box-border"
      >
        {/* Background Decorative SVG Graphic (simulating the faded logo in background) */}
        <svg
          className="absolute right-32 top-8 opacity-[0.03] scale-150 pointer-events-none"
          width="400"
          height="400"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-2-12h4v2h-4zm0 4h4v6h-4z" />
        </svg>

        {/* Corner Decors */}
        <div className="absolute left-0 bottom-0 w-64 h-64 bg-[#2D5A27] rounded-tr-[100%] absolute opacity-90" style={{ transform: 'translate(-30%, 30%)' }}></div>
        <div className="absolute left-0 bottom-0 w-80 h-80 bg-[#A8E6CF] rounded-tr-[100%] absolute opacity-40" style={{ transform: 'translate(-20%, 20%)' }}></div>

        {/* Right Vertical Bar */}
        <div className="absolute right-24 top-0 bottom-0 w-32 bg-[#487343] shadow-lg z-10"></div>

        {/* Wax Seal Simulation */}
        <div className="absolute right-12 top-1/2 -translate-y-1/2 w-48 h-48 bg-[#487343] rounded-full border-8 border-[#3A5D35] flex items-center justify-center shadow-[0_10px_30px_rgba(45,90,39,0.5)] z-20 overflow-hidden transform rotate-[-15deg]">
           <div className="w-40 h-40 rounded-full border border-[#5fa158] flex items-center justify-center relative">
             <div className="absolute w-full h-full border-t-2 border-[#5fa158] rounded-full animate-spin-slow opacity-30"></div>
             <p className="text-[#81c07a] font-bold text-center tracking-widest text-xs rotate-[-20deg]" style={{ writingMode: 'vertical-rl', textOrientation: 'mixed' }}>
                GROW ACADEMY
             </p>
             <p className="text-[#81c07a] font-bold text-center tracking-widest text-xs rotate-[160deg] absolute right-4" style={{ writingMode: 'vertical-rl', textOrientation: 'mixed' }}>
                GROW ACADEMY
             </p>
             <div className="w-20 h-20 bg-[#3A5D35] rounded-full shadow-inner flex items-center justify-center border-b border-[#5fa158]/50">
               <span className="text-[#81c07a]/80 font-bold text-3xl font-serif">G</span>
             </div>
           </div>
        </div>

        {/* Content Container */}
        <div className="flex-1 py-16 pl-16 pr-64 flex flex-col z-10 relative">
          
          {/* Header */}
          <div className="flex items-start gap-4 mb-8">
            <div className="flex flex-col items-center">
              <svg className="w-10 h-10 text-[#487343]" fill="currentColor" viewBox="0 0 24 24">
                 <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
              </svg>
              <h1 className="text-4xl font-black text-[#2D5A27] tracking-tighter uppercase mt-2 leading-none">
                G
              </h1>
            </div>
          </div>

          <h2 className="text-7xl font-black text-[#2D5A27] uppercase tracking-tighter mb-4" style={{ letterSpacing: '-2px' }}>
            SERTIFIKAT
          </h2>

          <p className="text-2xl text-[#2D5A27] font-semibold mb-6">
            Grow akademiyasining
          </p>

          <h3 className="text-5xl font-bold text-[#2D5A27] mb-2 font-serif capitalize">
            {courseName}
          </h3>

          <p className="text-2xl text-[#2D5A27] font-bold mb-10">
            Kursini muvaffaqiyatli tamomlagani uchun
          </p>

          <div className="w-full h-1 bg-[#2D5A27]/20 mb-8 max-w-3xl"></div>

          <div className="flex justify-between items-end border-b-2 border-gray-100 pb-2 mb-6 max-w-2xl">
             <h4 className="text-3xl font-black text-[#1F2937] italic">
               {studentName}
             </h4>
          </div>

          <p className="text-2xl text-[#2D5A27] font-bold mb-14">
            ushbu sertifikat bilan taqdirlanadi
          </p>

          <div className="mt-auto flex justify-between items-end">
            <div className="max-w-xs border-l-4 border-[#2D5A27] pl-4">
              <p className="text-[#2D5A27] font-bold text-lg leading-tight">
                Ushbu sertifikat muvaffaqiyatli kelajagingiz uchun kichik bir qadam bo'lsin !
              </p>
            </div>
            
            <div className="flex flex-col items-center">
              <div className="w-24 h-24 bg-white border border-gray-200 p-2 shadow-sm rounded-lg flex items-center justify-center">
                <QrCode className="w-20 h-20 text-[#2D5A27]" strokeWidth={1} />
              </div>
              <p className="text-[10px] text-gray-500 mt-2 font-mono tracking-wider text-center">
                ID: {id} <br/> DATA: {date}
              </p>
            </div>
          </div>

        </div>
      </div>
    );
  }
);

CertificateTemplate.displayName = 'CertificateTemplate';
