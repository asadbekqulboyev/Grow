import { Inter } from 'next/font/google';
import { AppLayout } from '@/components/layout/AppLayout';
import { ThemeProvider } from '@/components/theme-provider';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });

export const metadata = {
  title: 'Grow.UZ - Soft Skills Academy',
  description: 'Online academy and marketplace for learning soft skills.',
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="uz" className={`${inter.variable} suppressHydrationWarning`} suppressHydrationWarning>
      <body className="font-sans bg-[#F3F4F6] text-[#1F2937] dark:bg-[#111827] dark:text-[#E5E7EB] antialiased min-h-screen flex transition-colors duration-300" suppressHydrationWarning>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <AppLayout>
            {children}
          </AppLayout>
        </ThemeProvider>
      </body>
    </html>
  );
}
