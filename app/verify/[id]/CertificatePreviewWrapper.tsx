'use client';

import { CertificatePreview } from '@/components/CertificatePreview';
import { DownloadCertificateBtn } from '@/components/DownloadCertificateBtn';

interface CertificatePreviewWrapperProps {
  certCode: string;
  studentName: string;
  courseName: string;
  issuedAt: string;
}

export function CertificatePreviewWrapper({ certCode, studentName, courseName, issuedAt }: CertificatePreviewWrapperProps) {
  const dateStr = new Date(issuedAt).toLocaleDateString('uz-UZ');

  return (
    <div className="space-y-4">
      <CertificatePreview
        id={certCode}
        studentName={studentName}
        courseName={courseName}
        date={dateStr}
      />
      <DownloadCertificateBtn
        className="w-full flex items-center justify-center gap-2 py-3 bg-[#2D5A27] text-white rounded-xl text-sm font-bold hover:bg-[#1e3c1a] transition-colors shadow-sm"
        certData={{
          id: certCode,
          studentName: studentName,
          courseName: courseName,
          date: dateStr,
        }}
      >
        📄 PDF yuklab olish
      </DownloadCertificateBtn>
    </div>
  );
}
