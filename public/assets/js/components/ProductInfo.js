import api from '../core/api.js';
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
    productId = null,
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
    const w = storeConfig.texts.wishlist || {};
    const priceStr = formatPrice(price);
    const outOfStock = stock === 0;
    const desc = shortDescription;
    const fullDesc = escapeHtml(description);
    const safeName = escapeHtml(name);
    const purchaseBlocked = variantSetupIncomplete || outOfStock;

    const addLabel = w.addToWishlist || 'Add to wishlist';
    const removeLabel = w.removeFromWishlist || 'Remove from wishlist';

    const initialSelected = autoSelectVariants(variantAxes, variants);
    const axesHtml = variantAxes.length
      ? variantAxes.map((axis) => renderAxisBlock(axis, variants, initialSelected)).join('')
      : '';

    const blockedText = variantSetupIncomplete
      ? (t.variantSetupIncomplete || 'Sizing and color options for this product are not yet complete.')
      : outOfStock ? (t.outOfStock || 'Out of stock') : '';

    return `
      <div class="product-info max-w-xl mx-auto px-4 font-display">
        <div class="flex items-start justify-between gap-3">
          <h1 class="text-lg md:text-2xl font-bold uppercase tracking-[0.25em] text-body leading-relaxed flex-1">${safeName}</h1>
          ${productId ? `
            <button type="button" id="wishlist-toggle-btn"
                    class="wishlist-heart-btn mt-1 w-9 h-9 shrink-0 flex items-center justify-center rounded-full text-muted hover:bg-black/5 transition-colors disabled:opacity-50"
                    data-product-id="${productId}"
                    aria-pressed="false"
                    aria-label="${addLabel}">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"
                   fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                   class="pointer-events-none">
                <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>
              </svg>
            </button>` : ''}
        </div>
        <p class="mt-2 text-sm font-light uppercase tracking-[0.15em] text-muted">${desc}</p>

        ${axesHtml ? `<div id="product-variant-selectors" class="mt-8">${axesHtml}</div>` : ''}

        <p id="product-stock-hint" class="mt-4 text-[11px] uppercase tracking-widest text-accent ${purchaseBlocked ? '' : 'hidden'}">${blockedText}</p>

        <div id="product-buy-bar" class="bottom-0 inset-x-0 z-40">
          <button type="button" id="buy-now-btn"
                  class="w-full flex items-center justify-between px-6 md:px-10 py-5 bg-[#8a8a8a] hover:bg-black transition-colors text-white disabled:pointer-events-none disabled:opacity-40">
            <span class="text-sm font-bold uppercase tracking-[0.25em]">${t.quickBuy}</span>
            <span id="buy-bar-price" class="text-sm font-semibold tracking-wider" dir="ltr">${priceStr}</span>
          </button>
        </div>

        <div id="product-description" class="mt-8 pt-6 border-t border-black/10">
          <h2 class="text-xs font-bold uppercase tracking-[0.2em] text-body mb-3">${t.descriptionTitle || 'description'}</h2>
          <p class="text-sm leading-8 text-dim whitespace-pre-line">${fullDesc}</p>
        </div>
      </div>
      `;
  },

  bind(container, callbacks = {}) {
    const {
      variants = [],
      variantAxes = [],
      resolveVariant = () => null,
      getVariantPrice = () => 0,
      variantSetupIncomplete = false,
    } = callbacks;

    // ─── Wishlist heart ──────────────────────────────────────
    const wishBtn = container.querySelector('#wishlist-toggle-btn');
    if (wishBtn) {
      const pid = wishBtn.dataset.productId;
      const w = storeConfig.texts.wishlist || {};
      const addLabel = w.addToWishlist || 'Add to wishlist';
      const removeLabel = w.removeFromWishlist || 'Remove from wishlist';
      const addedMsg = w.added || 'Added to wishlist';
      const removedMsg = w.removed || 'Removed from wishlist';
      const errorMsg = w.error || 'Could not update wishlist';

      const updateWishHeart = (active) => {
        wishBtn.setAttribute('aria-pressed', String(active));
        wishBtn.setAttribute('aria-label', active ? removeLabel : addLabel);
        wishBtn.classList.toggle('text-red-500', active);
        wishBtn.classList.toggle('text-muted', !active);
        const svg = wishBtn.querySelector('svg');
        if (svg) svg.setAttribute('fill', active ? 'currentColor' : 'none');
      };

      updateWishHeart(api.wishlist.has(pid));

      wishBtn.addEventListener('click', async (e) => {
        e.preventDefault();
        if (wishBtn.disabled) return;
        wishBtn.disabled = true;
        try {
          const active = await api.wishlist.toggle(pid);
          updateWishHeart(active);
          api.utils.toast(active ? addedMsg : removedMsg, 'success', 1500);
        } catch (err) {
          api.utils.toast(err?.message || errorMsg, 'error');
        } finally {
          wishBtn.disabled = false;
        }
      });
    }

    // ─── Variant selectors ───────────────────────────────────
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