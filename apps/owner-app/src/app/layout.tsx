import type { Metadata, Viewport } from 'next';
import { Inter, Noto_Sans_Gujarati } from 'next/font/google';
import './globals.css';
import { Providers } from '@/providers';

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
  title: 'BAMS Owner | Business Account Management System',
  description: 'Mobile Business Account Management Portal for Business Owners',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'BAMS Owner',
  },
  icons: {
    icon: '/icons/icon-192x192.png',
    apple: '/icons/icon-192x192.png',
  },
};

export const viewport: Viewport = {
  themeColor: '#142B4A',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${notoSansGujarati.variable}`}>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </head>
      <body className="font-sans antialiased bg-[#F8FAFC] dark:bg-[#0F172A] text-slate-900 dark:text-slate-100 min-h-screen">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
