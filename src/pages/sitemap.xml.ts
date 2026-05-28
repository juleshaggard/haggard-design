import { getCollection } from 'astro:content';
import type { APIRoute } from 'astro';
import { noindexPaths, productionOrigin } from '../lib/seo';

function escapeXml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;');
}

export const GET: APIRoute = async ({ site }) => {
  const origin = site ?? new URL(productionOrigin);
  const collections = await Promise.all([
    getCollection('pages'),
    getCollection('projects'),
    getCollection('writing'),
  ]);

  const routes = collections
    .flat()
    .filter((entry) => !noindexPaths.has(entry.data.path))
    .sort((a, b) => a.data.path.localeCompare(b.data.path));

  const urls = routes
    .map((entry) => {
      const location = new URL(entry.data.path === '/' ? '' : entry.data.path, origin).toString();
      const lastmod = entry.data.lastMigrated ? `<lastmod>${escapeXml(entry.data.lastMigrated)}</lastmod>` : '';

      return `<url><loc>${escapeXml(location)}</loc>${lastmod}</url>`;
    })
    .join('');

  return new Response(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>`, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
    },
  });
};
