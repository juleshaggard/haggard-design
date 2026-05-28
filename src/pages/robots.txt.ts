import type { APIRoute } from 'astro';
import { absoluteSiteUrl, withBasePath } from '../lib/paths';
import { noindexPaths, productionOrigin } from '../lib/seo';

export const GET: APIRoute = ({ site }) => {
  const origin = site ?? new URL(productionOrigin);
  const disallowed = Array.from(noindexPaths)
    .sort()
    .map((path) => `Disallow: ${withBasePath(path)}`)
    .join('\n');

  return new Response(`User-agent: *\nAllow: ${withBasePath('/')}\n${disallowed}\nSitemap: ${absoluteSiteUrl('/sitemap.xml', origin)}\n`, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
    },
  });
};
