import { storeConfig } from '../config/bootstrap.js';
import { formatPrice } from '../utils/priceFormatter.js';
import { escapeHtml, escapeAttr } from '../utils/htmlEscape.js';

function variantHasValue(variant, valueId) {
  return (variant.attribute_values || []).some((av) => Number(av.id) === Number(valueId));
}

function variantMatchesPartialSelection(variant, selected, excludeAxis = null) {
  if (!variant.is_active) return false;
  return Object.entries(selected).every(([slug, valueId]) => {
    if (slug === excludeAxis || valueId == null) return true;
    return (variant.attribute_values || []).some(
      (av) => av.type_slug === slug && Number(av.id) === Number(valueId),
    );
  });
}

function isValueAvailable(variants, selected, axisSlug, valueId) {
  return variants.some((v) =>
    (v.inventory?.quantity ?? 0) > 0 &&
    variantHasValue(v, valueId) &&
    variantMatchesPartialSelection(v, selected, axisSlug),
  );
}

function autoSelectVariants(variantAxes, variants) {
  const selected = {};
  variantAxes.forEach((axis) => {
    const match = axis.values.find((val) =>
      isValueAvailable(variants, selected, axis.type_slug, val.id),
    );
    if (match) selected[axis.type_slug] = match.id;
  });
  return selected;
}

function renderAxis(axis, variants, selectedValues) {
  const selected = selectedValues[axis.type_slug] || null;

  if (axis.input_type === 'swatch') {
    return axis.values.map((val) => {
      const hasStock = isValueAvailable(variants, selectedValues, axis.type_slug, val.id);
      const active = Number(selected) === Number(val.id);
      const style = val.swatch_hex ? `background:${escapeAttr(val.swatch_hex)}` : '';
      return `<button type="button" data-axis="${escapeAttr(axis.type_slug)}" data-value-id="${val.id}"
        ${hasStock ? '' : 'disabled'}
        class="product-variant-btn w-6 h-6 rounded-full transition-all ${active ? 'ring-1 ring-black ring-offset-2' : 'ring-1 ring-black/10'} ${hasStock ? '' : 'opacity-25 cursor-not-allowed'}"
        title="${escapeAttr(val.value)}" style="${style}"></button>`;
    }).join('');
  }

  return axis.values.map((val) => {
    const hasStock = isValueAvailable(variants, selectedValues, axis.type_slug, val.id);
    const active = Number(selected) === Number(val.id);
    return `<button type="button" data-axis="${escapeAttr(axis.type_slug)}" data-value-id="${val.id}"
      ${hasStock ? '' : 'disabled'}
      class="product-variant-btn text-xs uppercase tracking-[0.18em] pb-1 border-b transition-colors
        ${active ? 'border-black text-body' : hasStock ? 'border-transparent text-muted hover:text-body' : 'border-transparent text-muted/40 cursor-not-allowed'}">${escapeHtml(val.value)}</button>`;
  }).join('');
}

function renderAxisBlock(axis, variants, selectedValues) {
  return `
    <div class="mb-4" data-variant-axis="${escapeAttr(axis.type_slug)}">
      <div class="flex flex-wrap gap-x-5 gap-y-3 axis-values">${renderAxis(axis, variants, selectedValues)}</div>
    </div>`;
}

function setButtonActiveState(btn, active) {
  if (btn.classList.contains('rounded-full')) {
    btn.classList.toggle('ring-black', active);
    btn.classList.toggle('ring-offset-2', active);
    btn.classList.toggle('ring-black/10', !active);
  } else {
    btn.classList.toggle('border-black', active);
    btn.classList.toggle('border-transparent', !active);
    btn.classList.toggle('text-body', active);
    btn.classList.toggle('text-muted', !active);
  }
}

const ProductInfo = {
  render({
    name = '',
    price = 0,
    description = '',
    shortDescription = '',
    variantAxes = [],
    variants = [],
    stock = 0,
    variantSetupIncomplete = false,
  } = {}) {
    const t = storeConfig.texts.product;
    const priceStr = formatPrice(price);
    const outOfStock = stock === 0;
    const desc = escapeHtml(shortDescription || description || '');
    const safeName = escapeHtml(name);
    const purchaseBlocked = variantSetupIncomplete || outOfStock;

    const initialSelected = autoSelectVariants(variantAxes, variants);
    const axesHtml = variantAxes.length
      ? variantAxes.map((axis) => renderAxisBlock(axis, variants, initialSelected)).join('')
      : '';

    const blockedText = variantSetupIncomplete
      ? (t.variantSetupIncomplete || 'Sizing and color options for this product are not yet complete.')
      : outOfStock ? (t.outOfStock || 'Out of stock') : '';

    return `
      <div class="product-info max-w-xl mx-auto px-4">
        <h1 class="text-lg md:text-2xl font-bold uppercase tracking-[0.25em] text-body leading-relaxed">${safeName}</h1>
        ${desc ? `<p class="mt-2 text-sm uppercase tracking-[0.15em] text-muted">${desc}</p>` : ''}

        ${axesHtml ? `<div id="product-variant-selectors" class="mt-8">${axesHtml}</div>` : ''}

        <p id="product-stock-hint" class="mt-4 text-[11px] uppercase tracking-widest text-accent ${purchaseBlocked ? '' : 'hidden'}">${blockedText}</p>

        <div id="product-buy-bar" class="fixed bottom-0 inset-x-0 z-40">
          <button type="button" id="buy-now-btn"
                  class="w-full flex items-center justify-between px-6 md:px-10 py-5 bg-[#8a8a8a] hover:bg-black transition-colors text-white disabled:pointer-events-none disabled:opacity-40">
            <span class="text-sm font-bold uppercase tracking-[0.25em]">${t.quickBuy}</span>
            <span id="buy-bar-price" class="text-sm font-semibold tracking-wider" dir="ltr">${priceStr}</span>
          </button>
        </div>
      </div>`;
  },

  bind(container, callbacks = {}) {
    const {
      variants = [],
      variantAxes = [],
      resolveVariant = () => null,
      getVariantPrice = () => 0,
      variantSetupIncomplete = false,
    } = callbacks;

    const selected = autoSelectVariants(variantAxes, variants);
    let maxQty = callbacks.maxQty || 99;

    function findMatchingVariant() {
      if (variantSetupIncomplete) return null;

      const axisSlugs = variantAxes.map((a) => a.type_slug);
      if (!axisSlugs.length) {
        if (resolveVariant) return resolveVariant(selected);
        return variants.find((v) => v.is_default)
          || variants.find((v) => v.is_active)
          || variants[0]
          || null;
      }

      const allSelected = axisSlugs.every((slug) => selected[slug]);
      if (!allSelected) return null;

      return variants.find((v) => {
        if (!v.is_active) return false;
        const valueMap = {};
        (v.attribute_values || []).forEach((av) => {
          valueMap[av.type_slug] = Number(av.id);
        });
        return axisSlugs.every((slug) => valueMap[slug] === Number(selected[slug]));
      }) || null;
    }

    function refreshAxisButtons() {
      variantAxes.forEach((axis) => {
        const block = container.querySelector(`[data-variant-axis="${axis.type_slug}"]`);
        if (!block) return;

        const valuesWrap = block.querySelector('.axis-values');
        if (valuesWrap) {
          valuesWrap.innerHTML = renderAxis(axis, variants, selected);
        }

        valuesWrap?.querySelectorAll('.product-variant-btn').forEach((btn) => {
          const axisSlug = btn.dataset.axis;
          const valueId = Number(btn.dataset.valueId);
          setButtonActiveState(btn, Number(selected[axisSlug]) === valueId);

          if (!btn.disabled) {
            btn.addEventListener('click', () => {
              selected[axisSlug] = valueId;
              refreshAxisButtons();
              updateUI();
            });
          }
        });
      });
    }

    function updateUI() {
      const variant = findMatchingVariant();
      const stock = variantSetupIncomplete
        ? 0
        : (variant ? Number(variant.inventory?.quantity ?? 0) : maxQty);
      maxQty = Math.max(1, stock);

      const priceEl = container.querySelector('#buy-bar-price');
      if (priceEl && variant) {
        priceEl.textContent = formatPrice(getVariantPrice(variant));
      }

      const buyBtn = container.querySelector('#buy-now-btn');
      const stockHint = container.querySelector('#product-stock-hint');
      const t = storeConfig.texts.product;
      const out = variantSetupIncomplete || stock === 0 || (variantAxes.length > 0 && !variant);

      if (buyBtn) buyBtn.disabled = out;
      if (stockHint) {
        if (variantSetupIncomplete) {
          stockHint.textContent = t.variantSetupIncomplete || 'Sizing and color options for this product are not yet complete.';
        } else {
          stockHint.textContent = out ? (t.outOfStock || 'Out of stock') : '';
        }
        stockHint.classList.toggle('hidden', !out);
      }

      callbacks.onVariantChange?.(variant);
    }

    refreshAxisButtons();
    updateUI();

    container.querySelector('#buy-now-btn')?.addEventListener('click', async () => {
      const variant = findMatchingVariant();
      await callbacks.onBuyNow?.({ variant, qty: 1 });
    });
  },
};

export default ProductInfo;
