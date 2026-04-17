/**
 * SEO — tek doğru kaynak (single source of truth).
 *
 * `src/app/layout.tsx`, `icon.tsx`, `opengraph-image.tsx`, `robots.ts`,
 * `sitemap.ts` ve `JsonLd` bileşeni buradan okur. Metadata değiştirmek için
 * SADECE bu dosyayı düzenle — başka hiçbir yere dokunma.
 *
 * İlk proje kurulumunda AI buradaki tüm alanları gerçek içerikle doldurur.
 * `siteUrl` deploy zamanında backend tarafından gerçek subdomain/custom
 * domain ile patch'lenir — doldurduğun placeholder değerler hiç sorun değil.
 */

export type Locale = 'tr_TR' | 'en_US';

export interface SeoOrganization {
  /** Yasal / ticari isim */
  name: string;
  /** Logo — mutlak URL veya /icon (dinamik favicon) yazabilirsin */
  logo: string;
  /** Kısa açıklama (Google Knowledge Panel için) */
  description?: string;
  /** Sosyal medya / ilgili URL'ler */
  sameAs?: string[];
  /** İletişim (opsiyonel) */
  contact?: {
    email?: string;
    telephone?: string;
    address?: string;
  };
}

export interface SeoData {
  /** Markanın kısa adı (layout title template'inde ve OG'de kullanılır) */
  siteName: string;
  /** Ana <title> — 50-60 karakter, anahtar kelime içersin */
  title: string;
  /**
   * Alt sayfa başlıkları için template — "%s" o sayfanın başlığı ile yer
   * değiştirir. Örn "%s · Markam". Boş bırakma.
   */
  titleTemplate: string;
  /** Meta description — 150-160 karakter, action + değer önerisi */
  description: string;
  /** 5-8 adet, Türkçe siteler için Türkçe anahtar kelimeler */
  keywords: string[];
  /** Canonical URL — deploy'da gerçek domain ile override edilir */
  siteUrl: string;
  /** Dil/ülke kodu */
  locale: Locale;
  /** Marka yazar / yayıncı adı */
  author: string;
  /** PWA + browser chrome rengi — globals.css'teki --primary ile uyumlu hex */
  themeColor: string;
  /** Twitter/X handle (@olmadan) ve kart tipi */
  twitter?: {
    handle?: string;
    card?: 'summary' | 'summary_large_image';
  };
  /** Yapılandırılmış veri (Google rich snippets) */
  organization?: SeoOrganization;
  /** Sitemap'e eklenecek sayfalar (ana sayfa otomatik) */
  routes?: string[];
}

export const seoData: SeoData = {
  siteName: 'Site Adı',
  title: 'Site Adı — Tek Cümlelik Slogan',
  titleTemplate: '%s · Site Adı',
  description:
    'Bu sitenin ne yaptığını, kime hitap ettiğini ve değer önerisini 150 karakterde özetleyen, arama motorlarında tıklanma oranını artıran cümle.',
  keywords: [
    'anahtar-kelime-1',
    'anahtar-kelime-2',
    'anahtar-kelime-3',
    'anahtar-kelime-4',
    'anahtar-kelime-5',
  ],
  siteUrl: 'https://site-adi.tapy.dev',
  locale: 'tr_TR',
  author: 'Site Adı',
  themeColor: '#0a0a0a',
  twitter: {
    card: 'summary_large_image',
  },
  organization: {
    name: 'Site Adı',
    logo: '/icon',
    description: 'Kısa şirket tanımı (60-80 karakter).',
    sameAs: [],
  },
  routes: ['/'],
};
