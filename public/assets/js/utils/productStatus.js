/**
 * productStatus.js — normalize product status for admin UI
 */

export function resolveProductStatus(product = {}) {
  if (product.status) return product.status;
  return Number(product.is_active) === 1 ? 'active' : 'archived';
}

export default { resolveProductStatus };
