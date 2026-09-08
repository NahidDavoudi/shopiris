/**
 * shopFilterHelpers.js — derive shop filter options from real product data
 */

const SIZE_SLUG_HINTS = ['size', 'saiz'];
const COLOR_SLUG_HINTS = ['color', 'rang', 'colour'];

function slugIncludes(slug, hints) {
  const s = (slug || '').toLowerCase();
  return hints.some((h) => s.includes(h));
}

function nameIncludes(name, keyword) {
  return (name || '').includes(keyword);
}

function isSizeAxis(axis = {}) {
  return slugIncludes(axis.type_slug, SIZE_SLUG_HINTS) || nameIncludes(axis.type_name, 'سایز');
}

function isColorAxis(axis = {}) {
  return axis.input_type === 'swatch'
    || slugIncludes(axis.type_slug, COLOR_SLUG_HINTS)
    || nameIncludes(axis.type_name, 'رنگ');
}

export function getProductListPrice(product) {
  const prices = [];
  const push = (v) => {
    const n = Number(v);
    if (Number.isFinite(n) && n > 0) prices.push(n);
  };

  push(product?.sale_price);
  push(product?.price);
  (product?.variants || []).forEach((variant) => {
    push(variant.sale_price);
    push(variant.price);
  });

  if (!prices.length) return 0;
  return Math.min(...prices);
}

function collectAxisValues(products, matchAxis) {
  const map = new Map();

  products.forEach((product) => {
    (product.variant_axes || []).forEach((axis) => {
      if (!matchAxis(axis)) return;
      (axis.values || []).forEach((val) => {
        const id = String(val.id);
        if (!map.has(id)) {
          map.set(id, {
            id,
            label: val.value,
            slug: axis.type_slug,
            valueId: val.id,
          });
        }
      });
    });

    (product.variants || []).forEach((variant) => {
      (variant.attribute_values || []).forEach((av) => {
        if (!matchAxis({
          type_slug: av.type_slug,
          type_name: av.type_name,
          input_type: av.input_type,
        })) return;

        const id = String(av.id);
        if (!map.has(id)) {
          map.set(id, {
            id,
            label: av.value || av.value_value,
            slug: av.type_slug,
            valueId: av.id,
          });
        }
      });
    });

    (product.attributes || []).forEach((attr) => {
      if (!matchAxis({ type_slug: attr.type_slug, type_name: attr.type_name })) return;
      const label = attr.custom_value || attr.value_value;
      if (!label) return;
      const id = attr.value_id != null
        ? String(attr.value_id)
        : `${attr.type_slug || 'attr'}:${label}`;
      if (!map.has(id)) {
        map.set(id, {
          id,
          label,
          slug: attr.type_slug,
          valueId: attr.value_id ?? id,
        });
      }
    });
  });

  return [...map.values()].sort((a, b) => String(a.label).localeCompare(String(b.label), 'fa'));
}

function collectSizeOptions(products) {
  const fromAxes = collectAxisValues(products, isSizeAxis);
  return fromAxes.map((option) => ({
    id: option.label,
    label: option.label,
    valueId: option.valueId,
    slug: option.slug,
  }));
}

function collectColorOptions(products) {
  return collectAxisValues(products, isColorAxis).map((option) => ({
    id: option.id,
    label: option.label,
    valueId: option.valueId,
    slug: option.slug,
  }));
}

export function deriveShopFilters(products = []) {
  const prices = products.map(getProductListPrice).filter((price) => price > 0);
  const min = prices.length ? Math.min(...prices) : 0;
  const max = prices.length ? Math.max(...prices) : min;

  return {
    sizes: collectSizeOptions(products),
    colors: collectColorOptions(products),
    priceRange: { min, max },
  };
}

function iterAttributeValues(product, visitor) {
  (product.variants || []).forEach((variant) => {
    (variant.attribute_values || []).forEach((av) => visitor(av));
  });
  (product.attributes || []).forEach((attr) => {
    visitor({
      type_slug: attr.type_slug,
      type_name: attr.type_name,
      value: attr.custom_value || attr.value_value,
      value_value: attr.value_value,
      id: attr.value_id,
    });
  });
}

export function productMatchesSize(product, sizeValue) {
  if (!sizeValue) return true;
  const target = String(sizeValue).trim();
  let matched = false;

  iterAttributeValues(product, (av) => {
    if (!isSizeAxis(av)) return;
    const value = String(av.value || av.value_value || '').trim();
    if (value === target) matched = true;
  });

  return matched;
}

export function productMatchesColors(product, colorIds = []) {
  if (!colorIds.length) return true;
  const targets = new Set(colorIds.map(String));
  let matched = false;

  iterAttributeValues(product, (av) => {
    if (!isColorAxis(av)) return;
    const id = av.id != null ? String(av.id) : null;
    const label = String(av.value || av.value_value || '').trim();
    if ((id && targets.has(id)) || targets.has(label)) matched = true;
  });

  return matched;
}

export default {
  deriveShopFilters,
  getProductListPrice,
  productMatchesSize,
  productMatchesColors,
};
