import type { Metadata } from 'next';
import { Inter, Noto_Sans_Gujarati } from 'next/font/google';
import './globals.css';
import { AppProviders } from '@/providers';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const notoSansGujarati = Noto_Sans_Gujarati({
  subsets: ['gujarati'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-noto-gujarati',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'BAMS - Super Admin Dashboard',
  description: 'Enterprise Business Account Management System - Super Admin Console',
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${notoSansGujarati.variable}`}>
      <body className="min-h-screen bg-[#F1F5F9] dark:bg-[#0A0F1E] text-slate-900 dark:text-slate-100 antialiased font-sans">
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
