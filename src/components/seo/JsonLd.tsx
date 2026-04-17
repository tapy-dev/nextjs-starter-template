import { seoData } from '@/data/seo.data';

/**
 * JSON-LD yapılandırılmış veri — Google rich snippets.
 * `Organization` + `WebSite` şemaları, Google Knowledge Panel ve
 * sitelink search box için gerekli.
 */
export function JsonLd() {
  const org = seoData.organization;
  const base = seoData.siteUrl.replace(/\/$/, '');

  const organization = org
    ? {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: org.name,
        url: base,
        logo: org.logo.startsWith('http') ? org.logo : `${base}${org.logo}`,
        description: org.description ?? seoData.description,
        ...(org.sameAs && org.sameAs.length > 0 ? { sameAs: org.sameAs } : {}),
        ...(org.contact?.email || org.contact?.telephone
          ? {
              contactPoint: {
                '@type': 'ContactPoint',
                contactType: 'customer support',
                ...(org.contact.email ? { email: org.contact.email } : {}),
                ...(org.contact.telephone
                  ? { telephone: org.contact.telephone }
                  : {}),
              },
            }
          : {}),
      }
    : null;

  const website = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: seoData.siteName,
    url: base,
    description: seoData.description,
    inLanguage: seoData.locale.replace('_', '-'),
    ...(org ? { publisher: { '@type': 'Organization', name: org.name } } : {}),
  };

  return (
    <>
      {organization ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organization) }}
        />
      ) : null}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(website) }}
      />
    </>
  );
}
