import type { Metadata, Viewport } from 'next';
import { seoData } from '@/data/seo.data';
import { JsonLd } from '@/components/seo/JsonLd';
import './globals.css';

/**
 * Metadata — `src/data/seo.data.ts` tek doğru kaynak. Buraya elle hiçbir
 * string yazma; SEO metinleri değişiyorsa `seo.data.ts`'i düzenle.
 *
 * icon / apple-icon / opengraph-image dosyaları Next.js tarafından
 * otomatik keşfedilir (bkz. `src/app/icon.tsx` vb.).
 */
export const metadata: Metadata = {
  metadataBase: new URL(seoData.siteUrl),
  title: {
    default: seoData.title,
    template: seoData.titleTemplate,
  },
  description: seoData.description,
  keywords: seoData.keywords,
  authors: [{ name: seoData.author }],
  creator: seoData.author,
  publisher: seoData.author,
  alternates: {
    canonical: seoData.siteUrl,
  },
  openGraph: {
    type: 'website',
    locale: seoData.locale,
    url: seoData.siteUrl,
    siteName: seoData.siteName,
    title: seoData.title,
    description: seoData.description,
  },
  twitter: {
    card: seoData.twitter?.card ?? 'summary_large_image',
    site: seoData.twitter?.handle
      ? `@${seoData.twitter.handle.replace(/^@/, '')}`
      : undefined,
    creator: seoData.twitter?.handle
      ? `@${seoData.twitter.handle.replace(/^@/, '')}`
      : undefined,
    title: seoData.title,
    description: seoData.description,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export const viewport: Viewport = {
  themeColor: seoData.themeColor,
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang={seoData.locale.split('_')[0]}>
      <body className="antialiased">
        <JsonLd />
        {children}
      </body>
    </html>
  );
}
