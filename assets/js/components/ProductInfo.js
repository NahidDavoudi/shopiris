import { storeConfig } from '../config/bootstrap.js';
import { formatPrice } from '../utils/priceFormatter.js';
import { escapeHtml, escapeAttr } from '../utils/htmlEscape.js';
import Button from './Button.js';

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
        class="product-variant-btn w-9 h-9 rounded-full border-2 transition-all ${active ? 'border-black/60 ring-2 ring-black/20' : 'border-black/10'} ${hasStock ? '' : 'opacity-30 cursor-not-allowed'}"
        title="${escapeAttr(val.value)}" style="${style}"></button>`;
    }).join('');
  }

  return axis.values.map((val) => {
    const hasStock = isValueAvailable(variants, selectedValues, axis.type_slug, val.id);
    const active = Number(selected) === Number(val.id);
    return `<button type="button" data-axis="${escapeAttr(axis.type_slug)}" data-value-id="${val.id}"
      ${hasStock ? '' : 'disabled'}
      class="product-variant-btn min-w-[2.75rem] h-11 px-3 rounded-lg border text-sm font-medium transition-colors
        ${active ? 'bg-black/8 text-body border-black/40' : hasStock ? 'border-black/10 hover:border-black/30 text-body' : 'border-black/10 text-muted/50 cursor-not-allowed'}">${escapeHtml(val.value)}</button>`;
  }).join('');
}

function renderAxisBlock(axis, variants, selectedValues) {
  return `
    <div class="mb-6" data-variant-axis="${escapeAttr(axis.type_slug)}">
      <p class="text-sm font-medium text-body mb-3">${escapeHtml(axis.type_name)}</p>
      <div class="flex flex-wrap gap-2 justify-end axis-values">${renderAxis(axis, variants, selectedValues)}</div>
    </div>`;
}

function setButtonActiveState(btn, active) {
  if (btn.classList.contains('rounded-full')) {
    btn.classList.toggle('border-black/60', active);
    btn.classList.toggle('ring-2', active);
    btn.classList.toggle('ring-black/20', active);
    btn.classList.toggle('border-black/10', !active);
  } else {
    btn.classList.toggle('bg-black/8', active);
    btn.classList.toggle('border-black/40', active);
    btn.classList.toggle('text-body', true);
    btn.classList.toggle('border-black/10', !active);
    btn.classList.toggle('hover:border-black/30', !active);
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
    detailBullets = [],
    shippingText = '',
    variantSetupIncomplete = false,
  } = {}) {
    const t = storeConfig.texts.product;
    const priceStr = formatPrice(price);
    const outOfStock = stock === 0;
    const desc = escapeHtml(shortDescription || description);
    const safeName = escapeHtml(name);
    const safeShipping = escapeHtml(shippingText || t.shippingText);
    const purchaseBlocked = variantSetupIncomplete || outOfStock;

    const incompleteHtml = variantSetupIncomplete
      ? `<p class="text-sm text-accent bg-accent/5 border border-accent/20 rounded-xl px-4 py-3 mb-6">${escapeHtml(t.variantSetupIncomplete || 'سایزبندی و رنگ‌بندی این محصول هنوز کامل نشده است.')}</p>`
      : '';

    const initialSelected = autoSelectVariants(variantAxes, variants);
    const axesHtml = variantAxes.length
      ? variantAxes.map((axis) => renderAxisBlock(axis, variants, initialSelected)).join('')
      : '';

    const bullets = detailBullets.map((item) =>
      `<li class="text-sm text-muted leading-relaxed">${escapeHtml(item)}</li>`).join('');

    return `
      <div class="product-info text-right">
        <h1 class="text-2xl md:text-4xl font-bold text-body leading-tight mb-3">${safeName}</h1>
        <p id="product-live-price" class="text-lg md:text-xl font-medium text-body mb-6">${priceStr}</p>
        ${desc ? `<p class="text-sm md:text-base text-muted leading-relaxed mb-8 max-w-lg">${desc}</p>` : ''}

        ${incompleteHtml}
        <div id="product-variant-selectors">${axesHtml}</div>

        <div class="flex items-center gap-3 mb-4">
          <div class="flex items-center border border-black/10 rounded-full overflow-hidden shrink-0" dir="ltr">
            <button type="button" id="qty-minus" class="w-10 h-10 flex items-center justify-center text-body hover:bg-black/5 transition-colors">−</button>
            <span id="qty-value" class="w-10 text-center text-sm font-medium text-body">1</span>
            <button type="button" id="qty-plus" class="w-10 h-10 flex items-center justify-center text-body hover:bg-black/5 transition-colors">+</button>
          </div>
          <div class="flex-1">
            ${Button.render({
              variant: 'aluminum',
              label: t.addToCart,
              className: 'w-full product-add-btn',
              disabled: purchaseBlocked,
              icon: '<i data-lucide="shopping-bag" class="w-4 h-4"></i>',
            })}
          </div>
        </div>

        <p id="product-stock-hint" class="text-xs text-muted mb-4 ${purchaseBlocked ? 'text-accent' : ''}">
          ${variantSetupIncomplete
            ? escapeHtml(t.variantSetupIncomplete || 'سایزبندی و رنگ‌بندی این محصول هنوز کامل نشده است.')
            : outOfStock ? (t.outOfStock || 'ناموجود') : ''}
        </p>

        <button type="button" id="quick-buy-btn"
                class="w-full text-center text-sm text-muted hover:text-body transition-colors mb-8 ${purchaseBlocked ? 'opacity-40 pointer-events-none' : ''}"
                ${purchaseBlocked ? 'disabled' : ''}>${t.quickBuy}</button>

        <div class="border-t border-black/10">
          <button type="button" data-accordion="details" aria-expanded="true"
                  class="product-acc-btn w-full flex items-center justify-between py-4 text-body">
            <i data-lucide="chevron-down" class="product-acc-icon w-4 h-4 transition-transform rotate-180"></i>
            <span class="font-medium text-sm">${t.detailsTitle}</span>
          </button>
          <div id="acc-details" class="product-acc-panel overflow-hidden" style="max-height:none">
            <ul class="pb-5 space-y-2 list-disc list-inside marker:text-muted">${bullets}</ul>
          </div>
        </div>

        <div class="border-t border-black/10">
          <button type="button" data-accordion="shipping" aria-expanded="false"
                  class="product-acc-btn w-full flex items-center justify-between py-4 text-body">
            <i data-lucide="chevron-down" class="product-acc-icon w-4 h-4 transition-transform"></i>
            <span class="font-medium text-sm">${t.shippingTitle}</span>
          </button>
          <div id="acc-shipping" class="product-acc-panel overflow-hidden" style="max-height:0">
            <p class="pb-5 text-sm text-muted leading-relaxed">${safeShipping}</p>
          </div>
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
    let qty = 1;
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
      if (qty > maxQty) {
        qty = maxQty;
        const qtyVal = container.querySelector('#qty-value');
        if (qtyVal) qtyVal.textContent = qty;
      }

      const priceEl = container.querySelector('#product-live-price');
      if (priceEl && variant) {
        priceEl.textContent = formatPrice(getVariantPrice(variant));
      }

      const addBtn = container.querySelector('.product-add-btn');
      const quickBtn = container.querySelector('#quick-buy-btn');
      const stockHint = container.querySelector('#product-stock-hint');
      const t = storeConfig.texts.product;
      const out = variantSetupIncomplete || stock === 0 || (variantAxes.length > 0 && !variant);

      if (addBtn) addBtn.disabled = out;
      if (quickBtn) {
        quickBtn.disabled = out;
        quickBtn.classList.toggle('opacity-40', out);
        quickBtn.classList.toggle('pointer-events-none', out);
      }
      if (stockHint) {
        if (variantSetupIncomplete) {
          stockHint.textContent = t.variantSetupIncomplete || 'سایزبندی و رنگ‌بندی این محصول هنوز کامل نشده است.';
        } else {
          stockHint.textContent = out ? (t.outOfStock || 'ناموجود') : '';
        }
        stockHint.classList.toggle('text-accent', out);
      }

      callbacks.onVariantChange?.(variant);
    }

    refreshAxisButtons();
    updateUI();

    const qtyVal = container.querySelector('#qty-value');
    container.querySelector('#qty-minus')?.addEventListener('click', () => {
      qty = Math.max(1, qty - 1);
      if (qtyVal) qtyVal.textContent = qty;
    });
    container.querySelector('#qty-plus')?.addEventListener('click', () => {
      qty = Math.min(maxQty, qty + 1);
      if (qtyVal) qtyVal.textContent = qty;
    });

    container.querySelector('.product-add-btn')?.addEventListener('click', async () => {
      const variant = findMatchingVariant();
      await callbacks.onAddToCart?.({ variant, qty });
    });

    container.querySelector('#quick-buy-btn')?.addEventListener('click', async () => {
      const variant = findMatchingVariant();
      await callbacks.onQuickBuy?.({ variant, qty });
    });

    container.querySelectorAll('.product-acc-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const key = btn.dataset.accordion;
        const panel = container.querySelector(`#acc-${key}`);
        const icon = btn.querySelector('.product-acc-icon');
        if (!panel) return;
        const isOpen = panel.style.maxHeight && panel.style.maxHeight !== '0px';
        panel.style.maxHeight = isOpen ? '0px' : `${panel.scrollHeight}px`;
        btn.setAttribute('aria-expanded', String(!isOpen));
        if (icon) icon.classList.toggle('rotate-180', !isOpen);
      });
    });
  },
};

export default ProductInfo;
