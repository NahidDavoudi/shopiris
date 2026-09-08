import { storeConfig } from '../config/bootstrap.js';
import { formatPrice } from '../utils/priceFormatter.js';
import { renderImageWithFallback, renderImagePlaceholder } from '../utils/imagePlaceholder.js';
import { escapeHtml } from '../utils/htmlEscape.js';
import DOM from '../utils/dom.js';
import api from '../core/api.js';
import Router from '../core/router.js';
import wishlistStore from '../core/wishlistStore.js';
import { productRequiresVariantSelection, quickAddNeedsProductPage } from '../utils/variantHelpers.js';

function syncWishlistButtons(id, active) {
  document.querySelectorAll(`.card-wishlist-btn[data-product-id="${id}"]`).forEach((btn) => {
    btn.setAttribute('aria-pressed', String(active));
    const plus = btn.querySelector('.card-btn-plus');
    if (plus) plus.textContent = active ? '✓' : '+';
  });
}

async function defaultQuickBuy(id, btn) {
  const t = storeConfig.texts.product;
  if (quickAddNeedsProductPage(btn)) {
    Router.go(`/products/${id}`);
    api.utils.toast(t.variantRequired || 'برای این محصول ابتدا سایز/رنگ را انتخاب کنید.', 'info', 2500);
    return;
  }
  await api.cart.add(id, 1);
  window.loadCartCount?.();
  api.utils.toast(t.addedToCart || 'به سبد اضافه شد', 'success', 2000);
}

const ProductCard = {
  render(p) {
    const t = storeConfig.texts.product;
    const img = p.images?.find((i) => i.is_main)?.url
      || p.images?.[0]?.url
      || p.main_image
      || p.image
      || '';
    const price = formatPrice(p.price);
    const href = DOM.hashHref('product', { id: p.id });
    const name = escapeHtml(p.name);
    const subtitle = escapeHtml(p.short_description || p.category_name || '');
    const needsVariant = productRequiresVariantSelection(p);
    const outOfStock = Number(p.stock) === 0;
    const wished = wishlistStore.has(p.id);

    const image = img
      ? renderImageWithFallback({
          src: img,
          alt: p.name,
          imgClass: 'w-full h-full object-contain transition-opacity duration-500 group-hover:opacity-90',
          iconSize: 'w-8 h-8',
        })
      : renderImagePlaceholder('w-8 h-8');

    const quickBuyControl = outOfStock
      ? `<span class="text-[11px] uppercase tracking-[0.15em] text-muted">${t.outOfStock || 'Out of stock'}</span>`
      : `<button type="button" class="card-quick-buy text-[11px] font-bold uppercase tracking-[0.15em] text-body transition-opacity hover:opacity-60"
                data-product-id="${p.id}"
                data-product-type="${escapeHtml(p.product_type || 'simple')}"
                data-has-variants="${needsVariant ? '1' : '0'}">
            <span class="card-btn-label">${t.cardQuickBuy || 'Quick Buy'}</span> <span class="card-btn-plus">+</span>
        </button>`;

    return `
      <div class="product-card group flex flex-col font-display" data-product-id="${p.id}">
        <a href="${href}" data-link class="relative block aspect-square overflow-hidden bg-white mb-6">
          ${image}
        </a>
        <h3 class="text-[13px] font-bold uppercase tracking-[0.15em] text-body leading-relaxed">
          <a href="${href}" data-link class="transition-opacity hover:opacity-70">${name}</a>
        </h3>
        ${subtitle ? `<p class="mt-1 text-[13px] font-light uppercase tracking-[0.15em] text-muted leading-relaxed">${subtitle}</p>` : ''}
        <p class="mt-4 text-[13px] tracking-wide text-body" dir="ltr">${price}</p>
        <div class="mt-5 flex items-center justify-between gap-3">
          ${quickBuyControl}
          <button type="button" class="card-wishlist-btn text-[11px] font-bold uppercase tracking-[0.15em] text-body transition-opacity hover:opacity-60"
                  data-product-id="${p.id}" aria-pressed="${wished}">
            <span class="card-btn-label">${t.cardWishlist || 'Wishlist'}</span> <span class="card-btn-plus">${wished ? '✓' : '+'}</span>
          </button>
        </div>
      </div>`;
  },

  bind(container, callbacks = {}) {
    container.querySelectorAll('.card-quick-buy').forEach((btn) => {
      btn.addEventListener('click', async (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (btn.disabled || btn.getAttribute('aria-disabled') === 'true') return;
        const id = btn.dataset.productId;
        if (!id) return;

        const label = btn.querySelector('.card-btn-label');
        const plus = btn.querySelector('.card-btn-plus');
        const origLabel = label?.textContent ?? '';
        const origPlus = plus?.textContent ?? '';

        btn.setAttribute('aria-disabled', 'true');
        btn.classList.add('opacity-40', 'pointer-events-none');
        try {
          if (callbacks.onQuickBuy) await callbacks.onQuickBuy(id, btn);
          else await defaultQuickBuy(id, btn);
          if (label) label.textContent = '✓';
          if (plus) plus.textContent = '';
        } catch (_) { /* page shows toast */ }
        setTimeout(() => {
          btn.removeAttribute('aria-disabled');
          btn.classList.remove('opacity-40', 'pointer-events-none');
          if (label) label.textContent = origLabel;
          if (plus) plus.textContent = origPlus;
        }, 1500);
      });
    });

    container.querySelectorAll('.card-wishlist-btn').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const id = btn.dataset.productId;
        if (!id) return;
        const active = wishlistStore.toggle(id);
        syncWishlistButtons(id, active);
        callbacks.onToggleWishlist?.(id, active);
      });
    });
  },
};

export default ProductCard;
