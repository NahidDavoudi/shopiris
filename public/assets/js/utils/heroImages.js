/**
 * heroImages.js — pure helpers for hero slider image arrays
 */

/**
 * @param {Array<{url?: string, alt?: string, order?: number}>|null|undefined} images
 * @param {{ max?: number, defaultAlt?: string }} [opts]
 * @returns {Array<{url: string, alt: string, order: number}>}
 */
export function normalizeHeroImages(images, opts = {}) {
  const { max = 3, defaultAlt = '' } = opts;

  if (!Array.isArray(images)) return [];

  const sorted = [...images]
    .filter((item) => item && String(item.url || '').trim())
    .sort((a, b) => (Number(a.order) || 0) - (Number(b.order) || 0))
    .slice(0, max)
    .map((item, index) => ({
      url: String(item.url).trim(),
      alt: String(item.alt ?? defaultAlt).trim(),
      order: index + 1,
    }));

  return sorted;
}

/**
 * @param {Array<{url: string, alt: string, order: number}>} images
 * @returns {Array<{url: string, alt: string, order: number}>}
 */
export function reorderHeroImages(images) {
  return images.map((item, index) => ({
    ...item,
    order: index + 1,
  }));
}

export function getHeroImagesFromSettings(remote, fallback = {}) {
  if (remote?.shop_hero_images && Array.isArray(remote.shop_hero_images)) {
    return normalizeHeroImages(remote.shop_hero_images, {
      defaultAlt: remote.shop_name || fallback.name || '',
    });
  }

  const legacyUrl = remote?.shop_hero_image || fallback.image || '';
  if (!legacyUrl) return [];

  return normalizeHeroImages([{
    url: legacyUrl,
    alt: remote?.shop_name || fallback.name || '',
    order: 1,
  }]);
}
