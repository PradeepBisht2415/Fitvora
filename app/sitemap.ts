import type { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://fitvora.com';

  const publicRoutes = [
    '',
    '/how-it-works',
    '/weight-loss',
    '/weight-gain',
    '/plans',
    '/privacy',
    '/terms',
    '/refund-policy',
    '/contact',
  ];

  return publicRoutes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: route === '' ? 'daily' : 'weekly',
    priority: route === '' ? 1.0 : route.startsWith('/weight-') || route === '/plans' ? 0.8 : 0.5,
  }));
}
