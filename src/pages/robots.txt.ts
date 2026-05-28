import type { APIRoute } from 'astro';
import { noindexPaths, productionOrigin } from '../lib/seo';

export const GET: APIRoute = ({ site }) => {
  const origin = site ?? new URL(productionOrigin);
  const disallowed = Array.from(noindexPaths)
    .sort()
    .map((path) => `Disallow: ${path}`)
    .join('\n');

  return new Response(`User-agent: *\nAllow: /\n${disallowed}\nSitemap: ${new URL('/sitemap.xml', origin).toString()}\n`, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
    },
  });
};
