import { productionOrigin } from './seo';

const normalizedBase = (import.meta.env.BASE_URL ?? '/').replace(/\/$/, '');

export const basePath = normalizedBase === '' ? '' : normalizedBase;

export function isRootRelativeUrl(value: string) {
  return value.startsWith('/') && !value.startsWith('//');
}

export function withBasePath(value: string) {
  if (!basePath || !isRootRelativeUrl(value)) return value;
  if (value === '/') return `${basePath}/`;
  if (value === basePath || value.startsWith(`${basePath}/`)) return value;

  return `${basePath}${value}`;
}

export function absoluteSiteUrl(pathname: string, site?: URL | null) {
  const origin = site ?? new URL(productionOrigin);
  const path = pathname === '' ? '/' : pathname;

  return new URL(withBasePath(path), origin).toString();
}
