/**
 * variantHelpers.js — pure helpers for variant selection rules
 */
export function productRequiresVariantSelection(product) {
  if (!product) return false;
  if (product.variant_setup_incomplete) return true;
  if (product.product_type === 'variable') return true;
  if ((product.variant_axes?.length || 0) > 0) return true;
  if ((product.variant_count || 0) > 1) return true;
  return false;
}

export function quickAddNeedsProductPage(btn) {
  if (!btn?.dataset) return false;
  return btn.dataset.productType === 'variable' || btn.dataset.hasVariants === '1';
}

export function resolveProductVariant(product, variantId, { strict = false } = {}) {
  if (!product?.variants?.length) return null;

  if (variantId) {
    const match = product.variants.find((v) => Number(v.id) === Number(variantId));
    if (!match && strict) {
      throw new Error('واریانت انتخاب‌شده معتبر نیست.');
    }
    return match || null;
  }

  if (productRequiresVariantSelection(product)) {
    if (strict) {
      throw new Error('انتخاب واریانت (سایز/رنگ) برای این محصول الزامی است.');
    }
    return null;
  }

  return product.variants.find((v) => v.is_default) || product.variants[0] || null;
}

export default {
  productRequiresVariantSelection,
  quickAddNeedsProductPage,
  resolveProductVariant,
};
