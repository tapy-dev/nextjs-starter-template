import type { MetadataRoute } from 'next';
import { seoData } from '@/data/seo.data';

export const dynamic = 'force-static';

/**
 * sitemap.xml — `seoData.routes` içindeki yolları listeler.
 * Yeni sayfa eklediğinde `src/data/seo.data.ts` içinde `routes`'a ekle.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const base = seoData.siteUrl.replace(/\/$/, '');
  const routes = seoData.routes?.length ? seoData.routes : ['/'];

  return routes.map((path) => ({
    url: `${base}${path.startsWith('/') ? path : `/${path}`}`,
    lastModified: now,
    changeFrequency: path === '/' ? 'weekly' : 'monthly',
    priority: path === '/' ? 1 : 0.7,
  }));
}
