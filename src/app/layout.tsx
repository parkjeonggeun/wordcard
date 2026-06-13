import type { Metadata, Viewport } from 'next';
import { Noto_Sans_KR } from 'next/font/google';
import './globals.css';

const notoSansKR = Noto_Sans_KR({
  subsets: ['latin'],
  weight: ['400', '700', '900'],
  variable: '--font-noto-sans-kr',
  display: 'swap',
});

export const metadata: Metadata = {
  title: '낱말카드',
  description: '아이와 함께하는 한국어·영어 낱말 카드 놀이',
  manifest: '/manifest.json',
  // BUG-11: appleWebApp generates the apple-mobile-web-app-* tags automatically.
  // Removed duplicate declarations from `other`.
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: '낱말카드',
  },
  other: {
    'mobile-web-app-capable': 'yes', // Chrome Android only
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  themeColor: '#7dd3fc',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" className={notoSansKR.variable}>
      <head>
        <link rel="apple-touch-icon" sizes="192x192" href="/icons/icon-192x192.png" />
      </head>
      <body className={notoSansKR.className}>{children}</body>
    </html>
  );
}
