import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL ||
    process.env.NEXT_PUBLIC_APP_URL ||
    'https://vendle.com.ng';

  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/s/', '/explore'],
        disallow: ['/dashboard/', '/api/', '/login', '/signup', '/seed/'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
