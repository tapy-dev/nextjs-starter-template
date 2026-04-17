import { ImageResponse } from 'next/og';
import { seoData } from '@/data/seo.data';

/**
 * Dinamik favicon — `seoData.siteName` ilk harfi + marka rengi.
 * Build zamanında statik PNG olarak render olur (output: 'export' uyumlu).
 *
 * User kendi PNG'sini yüklemek isterse `src/app/icon.png` oluşturur —
 * Next.js app router otomatik olarak o dosyayı kullanır, bu tsx pasif kalır.
 */

export const size = { width: 32, height: 32 };
export const contentType = 'image/png';
export const dynamic = 'force-static';

export default function Icon() {
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
          fontSize: 22,
          fontWeight: 700,
          fontFamily: 'system-ui, sans-serif',
          letterSpacing: '-0.05em',
          borderRadius: 6,
        }}
      >
        {letter}
      </div>
    ),
    { ...size },
  );
}
