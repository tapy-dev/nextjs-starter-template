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

/**
 * ⚠️  TAPY PIPELINE ZONE — DO NOT MODIFY THIS LAYOUT WITHOUT EXPLICIT INSTRUCTION.
 *
 * The two NEXT_PUBLIC_ env vars below are set exclusively by the Tapy deploy pipeline,
 * NOT by the AI and NOT by the developer manually.
 *
 * Data flow:
 *   Tapy pipeline → sets NEXT_PUBLIC_TAPY_* env vars at build time
 *   layout.tsx    → converts them into <meta> tags (this file, below)
 *   submitTapyForm → reads ONLY the <meta> tags at runtime (never reads env directly)
 *
 * AI rules:
 *   ✗ Do NOT add or remove the tapy-project-id / tapy-api-url meta tags
 *   ✗ Do NOT read or write NEXT_PUBLIC_TAPY_* env vars in generated code
 *   ✓ DO use submitTapyForm() in form onSubmit handlers
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Build-time env vars → runtime meta tags.
  // Empty string = tag omitted; submitTapyForm will return MISSING_PROJECT_ID.
  const projectId = process.env.NEXT_PUBLIC_TAPY_PROJECT_ID ?? "";
  const apiUrl =
    (process.env.NEXT_PUBLIC_TAPY_API_URL ?? "").replace(/\/$/, "") ||
    "https://api.tapy.to";

  return (
    <html lang={seoData.locale.split('_')[0]}>
      <head>
        {/* tapy-pipeline:begin — managed by Tapy deploy pipeline, AI must not touch */}
        {projectId ? (
          <meta name="tapy-project-id" content={projectId} />
        ) : null}
        <meta name="tapy-api-url" content={apiUrl} />
        {/* tapy-pipeline:end */}
      </head>
      <body className="antialiased">
        <JsonLd />
        {children}
      </body>
    </html>
  );
}
