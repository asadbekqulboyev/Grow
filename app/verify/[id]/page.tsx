import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { CheckCircle, XCircle, Award, ArrowLeft, ExternalLink } from 'lucide-react';
import { CertificatePreviewWrapper } from './CertificatePreviewWrapper';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function VerifyCertificatePage({ params }: PageProps) {
  const { id: certCode } = await params;
  const supabase = await createClient();

  // Sertifikatni cert_code bo'yicha qidirish
  const { data: certificate, error } = await supabase
    .from('certificates')
    .select('*')
    .eq('cert_code', certCode)
    .maybeSingle();

  // Agar cert_code bo'yicha topilmasa, id bo'yicha ham qidirab ko'ramiz
  let cert = certificate;
  if (!cert && !error) {
    const { data: certById } = await supabase
      .from('certificates')
      .select('*')
      .eq('id', certCode)
      .maybeSingle();
    cert = certById;
  }

  if (!cert) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-[#111827] dark:to-[#1a2332] flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-900 rounded-3xl p-8 sm:p-12 shadow-xl border border-gray-100 dark:border-gray-800 max-w-md w-full text-center">
          <div className="w-20 h-20 bg-red-50 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <XCircle className="w-10 h-10 text-red-500" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
            Sertifikat topilmadi
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mb-2 text-sm">
            Ushbu kod bilan bog&apos;liq sertifikat mavjud emas.
          </p>
          <p className="text-gray-400 dark:text-gray-500 text-xs mb-8 font-mono bg-gray-50 dark:bg-gray-800 px-4 py-2 rounded-xl">
            Kod: {certCode}
          </p>
          <Link 
            href="/" 
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#2D5A27] text-white rounded-xl font-bold hover:bg-[#1e3c1a] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Bosh sahifaga qaytish
          </Link>
        </div>
      </div>
    );
  }

  const issuedDate = new Date(cert.issued_at).toLocaleDateString('uz-UZ', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-[#111827] dark:to-[#1a2332] flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-800 max-w-2xl w-full overflow-hidden">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-[#2D5A27] to-[#4a8c42] px-6 sm:px-8 py-6 text-white text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('/images/logo.svg')] bg-no-repeat bg-center opacity-5 bg-contain"></div>
          <div className="relative z-10">
            <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-3 border border-white/30">
              <CheckCircle className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Sertifikat tasdiqlandi ✅</h1>
            <p className="text-green-100 text-sm mt-1.5 font-medium">Ushbu sertifikat haqiqiy va Grow Academy tomonidan berilgan</p>
          </div>
        </div>

        {/* Certificate Image Preview */}
        <div className="px-4 sm:px-6 pt-6">
          <CertificatePreviewWrapper
            certCode={cert.cert_code}
            studentName={cert.student_name}
            courseName={cert.course_name}
            issuedAt={cert.issued_at}
          />
        </div>

        {/* Content */}
        <div className="px-6 sm:px-8 py-6">
          
          {/* Certificate Info */}
          <div className="space-y-5">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-[#A8E6CF]/20 rounded-xl flex items-center justify-center shrink-0">
                <Award className="w-5 h-5 text-[#2D5A27]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-400 dark:text-gray-500 font-semibold uppercase tracking-wider mb-1">Talaba</p>
                <p className="text-lg font-bold text-gray-900 dark:text-white leading-tight truncate">{cert.student_name}</p>
              </div>
            </div>

            <div className="h-px bg-gray-100 dark:bg-gray-800"></div>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-blue-50 dark:bg-blue-900/20 rounded-xl flex items-center justify-center shrink-0">
                <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-400 dark:text-gray-500 font-semibold uppercase tracking-wider mb-1">Kurs nomi</p>
                <p className="text-base font-bold text-gray-900 dark:text-white leading-tight">{cert.course_name}</p>
              </div>
            </div>

            <div className="h-px bg-gray-100 dark:bg-gray-800"></div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-4">
                <p className="text-[10px] text-gray-400 dark:text-gray-500 font-bold uppercase tracking-wider mb-1.5">Sertifikat ID</p>
                <p className="text-xs font-mono font-bold text-gray-700 dark:text-gray-300 break-all leading-relaxed">{cert.cert_code}</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-4">
                <p className="text-[10px] text-gray-400 dark:text-gray-500 font-bold uppercase tracking-wider mb-1.5">Berilgan sana</p>
                <p className="text-xs font-bold text-gray-700 dark:text-gray-300 leading-relaxed">{issuedDate}</p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-8 flex flex-col gap-3">
            <Link
              href="/"
              className="w-full flex items-center justify-center gap-2 py-3.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl font-bold text-sm hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Grow Academy platformasiga o&apos;tish
            </Link>
          </div>
        </div>
        
        {/* Trust Badge */}
        <div className="border-t border-gray-100 dark:border-gray-800 px-6 sm:px-8 py-4 bg-gray-50/50 dark:bg-gray-800/30">
          <div className="flex items-center justify-center gap-2">
            <div className="w-5 h-5 bg-[#2D5A27] rounded-md flex items-center justify-center">
              <span className="text-white text-[8px] font-bold font-serif">G</span>
            </div>
            <span className="text-xs text-gray-400 dark:text-gray-500 font-medium">
              Grow Academy — O&apos;zingizni rivojlantiring
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
