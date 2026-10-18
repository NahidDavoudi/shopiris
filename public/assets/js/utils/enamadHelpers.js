/**
 * enamadHelpers.js — parse, validate, and sanitize Enamad embed HTML
 */

import { escapeAttr } from './htmlEscape.js';

const ENAMAD_HOSTS = ['trustseal.enamad.ir', 'www.enamad.ir', 'enamad.ir'];

function isEnamadHost(hostname) {
  return ENAMAD_HOSTS.some((host) => hostname === host || hostname.endsWith(`.${host}`));
}

export function isValidEnamadUrl(url) {
  if (!url || typeof url !== 'string') return false;
  const trimmed = url.trim();
  if (!trimmed) return false;

  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol !== 'https:') return false;
    return isEnamadHost(parsed.hostname);
  } catch {
    return false;
  }
}

function isValidEnamadLogoUrl(url) {
  if (!isValidEnamadUrl(url)) return false;
  try {
    const parsed = new URL(url.trim());
    return parsed.pathname.includes('logo.aspx');
  } catch {
    return false;
  }
}

export function buildEnamadLogoUrl(verificationUrl) {
  if (!isValidEnamadUrl(verificationUrl)) return null;

  try {
    const parsed = new URL(verificationUrl.trim());
    const id = parsed.searchParams.get('id');
    const code = parsed.searchParams.get('Code') || parsed.searchParams.get('code');
    if (!id) return null;

    const logo = new URL('https://trustseal.enamad.ir/logo.aspx');
    logo.searchParams.set('id', id);
    if (code) logo.searchParams.set('Code', code);
    return logo.toString();
  } catch {
    return null;
  }
}

export function getEnamadBadgeData(url) {
  if (!isValidEnamadUrl(url)) return null;

  const logoSrc = buildEnamadLogoUrl(url);
  if (!logoSrc) return null;

  return {
    href: url.trim(),
    logoSrc,
  };
}

function extractEmbedUrls(raw) {
  const hrefMatch = raw.match(/<a\b[^>]*\bhref\s*=\s*['"]([^'"]+)['"]/i);
  const srcMatch = raw.match(/<img\b[^>]*\bsrc\s*=\s*['"]([^'"]+)['"]/i);
  return {
    href: hrefMatch?.[1]?.trim() || '',
    src: srcMatch?.[1]?.trim() || '',
  };
}

function buildSanitizedBadge(href, logoSrc) {
  return `<a href="${escapeAttr(href)}" target="_blank" rel="noopener noreferrer" referrerpolicy="origin" class="inline-flex shrink-0"><img referrerpolicy="origin" src="${escapeAttr(logoSrc)}" alt="نماد اعتماد الکترونیکی" class="h-16 w-auto object-contain cursor-pointer"></a>`;
}

export function sanitizeEnamadEmbed(input) {
  const raw = String(input || '').trim();
  if (!raw) return null;

  if (!raw.includes('<')) {
    const badge = getEnamadBadgeData(raw);
    if (!badge) return null;
    return buildSanitizedBadge(badge.href, badge.logoSrc);
  }

  const { href, src } = extractEmbedUrls(raw);
  if (!href || !src) return null;
  if (!isValidEnamadUrl(href) || !isValidEnamadLogoUrl(src)) return null;

  return buildSanitizedBadge(href, src);
}

export function isValidEnamadEmbed(input) {
  return !!sanitizeEnamadEmbed(input);
}

export function getEnamadBadgeHtml(input) {
  return sanitizeEnamadEmbed(input) || '';
}

export default {
  isValidEnamadUrl,
  buildEnamadLogoUrl,
  getEnamadBadgeData,
  sanitizeEnamadEmbed,
  isValidEnamadEmbed,
  getEnamadBadgeHtml,
};
