import type { MetadataRoute } from 'next';
import { seoData } from '@/data/seo.data';

export const dynamic = 'force-static';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
      },
    ],
    sitemap: `${seoData.siteUrl}/sitemap.xml`,
    host: seoData.siteUrl,
  };
}
