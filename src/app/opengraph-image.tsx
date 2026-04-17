import { ImageResponse } from 'next/og';
import { seoData } from '@/data/seo.data';

/**
 * Open Graph image — sosyal medya paylaşımlarında (Twitter/X, Facebook,
 * WhatsApp, Slack, Discord, LinkedIn) görünen 1200×630 kart.
 *
 * Minimalist stil: marka rengi arka plan + büyük başlık + altında küçük
 * açıklama ve site adı. Build zamanında statik PNG olarak render olur.
 *
 * Özel OG image yüklemek istersen `src/app/opengraph-image.png` (veya .jpg)
 * dosyası oluştur — Next.js o dosyayı kullanır, bu tsx devre dışı kalır.
 */

export const alt = seoData.title;
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';
export const dynamic = 'force-static';

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          background: seoData.themeColor,
          color: '#ffffff',
          padding: 80,
          fontFamily: 'system-ui, -apple-system, sans-serif',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            fontSize: 24,
            opacity: 0.65,
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
            fontWeight: 500,
          }}
        >
          <div
            style={{
              width: 12,
              height: 12,
              background: '#ffffff',
              borderRadius: 2,
              opacity: 0.6,
            }}
          />
          {seoData.siteName}
        </div>

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 28,
            maxWidth: 960,
          }}
        >
          <div
            style={{
              fontSize: 72,
              fontWeight: 700,
              letterSpacing: '-0.03em',
              lineHeight: 1.05,
            }}
          >
            {seoData.title}
          </div>
          <div
            style={{
              fontSize: 28,
              fontWeight: 400,
              lineHeight: 1.4,
              opacity: 0.7,
              maxWidth: 860,
            }}
          >
            {seoData.description}
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            width: '100%',
            fontSize: 22,
            opacity: 0.5,
            fontWeight: 500,
          }}
        >
          <span>{seoData.siteUrl.replace(/^https?:\/\//, '')}</span>
          <span>{seoData.author}</span>
        </div>
      </div>
    ),
    { ...size },
  );
}
