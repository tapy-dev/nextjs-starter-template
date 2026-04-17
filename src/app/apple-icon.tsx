import { ImageResponse } from 'next/og';
import { seoData } from '@/data/seo.data';

/**
 * iOS/iPadOS home-screen icon — 180×180.
 * icon.tsx ile aynı görsel, sadece büyüklük farklı.
 */

export const size = { width: 180, height: 180 };
export const contentType = 'image/png';
export const dynamic = 'force-static';

export default function AppleIcon() {
  const letter = (seoData.siteName.trim()[0] || 'T').toUpperCase();

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: seoData.themeColor,
          color: '#ffffff',
          fontSize: 120,
          fontWeight: 700,
          fontFamily: 'system-ui, sans-serif',
          letterSpacing: '-0.05em',
          borderRadius: 36,
        }}
      >
        {letter}
      </div>
    ),
    { ...size },
  );
}
