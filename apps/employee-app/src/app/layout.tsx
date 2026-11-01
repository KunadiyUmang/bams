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
  variable: '--font-noto-gujarati',
  weight: ['400', '500', '600', '700'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'BAMS Employee - Business Account Management System',
  description: 'Mobile-first PWA for business account management and cashflow tracking',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'BAMS Employee',
  },
  icons: {
    icon: '/icons/icon-192x192.png',
    apple: '/icons/icon-192x192.png',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#142B4A',
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
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body>
        <div className="app-viewport">
          <Providers>{children}</Providers>
        </div>
      </body>
    </html>
  );
}
