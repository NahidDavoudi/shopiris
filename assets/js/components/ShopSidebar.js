import { storeConfig } from '../config/bootstrap.js';
import { formatPrice, parsePrice, attachPriceFormatterEl } from '../utils/priceFormatter.js';
import Button from './Button.js';

const ShopSidebar = {
  render({
    activeSize = '',
    activeColors = [],
    priceMin = 0,
    priceMax = 0,
    sizes = [],
    colors = [],
    priceRange = { min: 0, max: 0 },
  } = {}) {
    const t = storeConfig.texts.shop;
    const range = priceRange;

    const sizeSection = sizes.length ? `
        <div class="mb-8">
          <h3 class="text-sm font-medium text-body mb-3">${t.sizeLabel}</h3>
          <div class="flex flex-wrap gap-2 justify-end">${sizes.map((s) => {
            const active = activeSize === s.id;
            return `<button type="button" data-size="${s.id}"
              class="shop-size-btn w-10 h-10 rounded-lg text-sm font-medium border transition-colors
                     ${active
                       ? 'bg-black/8 text-body border-black/40'
                       : 'bg-white text-body border-black/10 hover:border-black/30'}">${s.label}</button>`;
          }).join('')}</div>
        </div>` : '';

    const colorSection = colors.length ? `
        <div class="mb-8">
          <h3 class="text-sm font-medium text-body mb-3">${t.colorLabel}</h3>
          <div class="space-y-3">${colors.map((c) => {
            const checked = activeColors.includes(c.id);
            return `
              <label class="flex items-center gap-3 flex-row-reverse cursor-pointer group">
                <input type="checkbox" data-color="${c.id}" ${checked ? 'checked' : ''}
                       class="shop-color-check w-4 h-4 rounded border-black/20 text-body focus:ring-0 focus:ring-offset-0">
                <span class="text-sm text-body/80 group-hover:text-body transition-colors">${c.label}</span>
              </label>`;
          }).join('')}</div>
        </div>` : '';

    const minVal = priceMin || range.min;
    const maxVal = priceMax || range.max;
    const hasPriceRange = range.max > range.min || range.max > 0;

    const priceSection = hasPriceRange ? `
        <div class="mb-8">
          <h3 class="text-sm font-medium text-body mb-4">${t.priceLabel}</h3>
          <div class="space-y-3">
            <p class="text-xs text-muted">${t.priceBoundsHint || 'حداقل و حداکثر قیمت محصولات:'} ${formatPrice(range.min)} — ${formatPrice(range.max)}</p>
            <div class="grid grid-cols-2 gap-3">
              <label class="block">
                <span class="block text-xs text-muted mb-1.5">${t.priceFromLabel || 'از'}</span>
                <input type="text" inputmode="numeric" id="price-input-min"
                       value="${minVal.toLocaleString('fa-IR')}"
                       min="${range.min}" max="${range.max}"
                       placeholder="${range.min.toLocaleString('fa-IR')}"
                       class="shop-price-input w-full rounded-lg border border-black/10 px-3 py-2 text-sm text-body bg-white focus:outline-none focus:border-black/30"
                       dir="ltr">
              </label>
              <label class="block">
                <span class="block text-xs text-muted mb-1.5">${t.priceToLabel || 'تا'}</span>
                <input type="text" inputmode="numeric" id="price-input-max"
                       value="${maxVal.toLocaleString('fa-IR')}"
                       min="${range.min}" max="${range.max}"
                       placeholder="${range.max.toLocaleString('fa-IR')}"
                       class="shop-price-input w-full rounded-lg border border-black/10 px-3 py-2 text-sm text-body bg-white focus:outline-none focus:border-black/30"
                       dir="ltr">
              </label>
            </div>
          </div>
        </div>` : '';

    return `
      <aside id="shop-sidebar" class="shop-sidebar w-full md:w-56 lg:w-64 shrink-0">
        <div class="flex items-center justify-between mb-6 md:mb-8">
          <h2 class="text-lg font-bold text-body">${t.filtersTitle}</h2>
          <button id="sidebar-close" type="button" class="md:hidden text-muted hover:text-body p-1" aria-label="بستن">
            <i data-lucide="x" class="w-5 h-5"></i>
          </button>
        </div>

        ${sizeSection}
        ${colorSection}
        ${priceSection}

        ${Button.render({
          variant: 'aluminum',
          label: t.applyFilters,
          className: 'w-full shop-apply-btn',
          attrs: { 'data-action': 'apply-filters' },
        })}

        <button type="button" id="clear-filters"
                class="hidden w-full mt-3 text-sm text-muted hover:text-body transition-colors text-center">
          ${t.clearFilters}
        </button>
      </aside>`;
  },

  bind(container, callbacks = {}) {
    const range = callbacks.priceRange || { min: 0, max: 0 };
    let selectedSize = container.querySelector('.shop-size-btn.border-black\\/40')?.dataset.size || '';

    container.querySelectorAll('.shop-size-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const size = btn.dataset.size;
        selectedSize = selectedSize === size ? '' : size;
        container.querySelectorAll('.shop-size-btn').forEach((b) => {
          const active = b.dataset.size === selectedSize;
          b.classList.toggle('bg-black/8', active);
          b.classList.toggle('border-black/40', active);
          b.classList.toggle('text-body', true);
          b.classList.toggle('bg-white', !active);
          b.classList.toggle('border-black/10', !active);
        });
      });
    });

    const minInput = container.querySelector('#price-input-min');
    const maxInput = container.querySelector('#price-input-max');

    container.querySelectorAll('.shop-price-input').forEach(attachPriceFormatterEl);

    function clampPrice(value, fallback) {
      const parsed = parsePrice(value);
      if (!parsed && fallback != null) return fallback;
      if (parsed < range.min) return range.min;
      if (parsed > range.max) return range.max;
      return parsed;
    }

    function normalizePriceInputs() {
      if (!minInput || !maxInput) return { priceMin: range.min, priceMax: range.max };

      let priceMin = clampPrice(minInput.value, range.min);
      let priceMax = clampPrice(maxInput.value, range.max);

      if (priceMin > priceMax) {
        [priceMin, priceMax] = [priceMax, priceMin];
      }

      minInput.value = priceMin.toLocaleString('fa-IR');
      maxInput.value = priceMax.toLocaleString('fa-IR');

      return { priceMin, priceMax };
    }

    minInput?.addEventListener('blur', normalizePriceInputs);
    maxInput?.addEventListener('blur', normalizePriceInputs);

    container.querySelector('.shop-apply-btn')?.addEventListener('click', () => {
      const colors = [...container.querySelectorAll('.shop-color-check:checked')]
        .map((el) => el.dataset.color);
      const { priceMin, priceMax } = normalizePriceInputs();

      callbacks.onApply?.({
        size: selectedSize,
        colors,
        priceMin,
        priceMax,
      });
    });

    container.querySelector('#clear-filters')?.addEventListener('click', () => {
      callbacks.onClear?.();
    });

    container.querySelector('#sidebar-close')?.addEventListener('click', () => {
      callbacks.onClose?.();
    });
  },
};

export default ShopSidebar;
