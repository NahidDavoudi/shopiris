/**
 * pages/wishlist.js — wishlist page (guest + authenticated)
 */
import api from '../core/api.js';
import Router from '../core/router.js';
import { renderImageWithFallback } from '../utils/imagePlaceholder.js';
import { escapeHtml, escapeAttr } from '../utils/htmlEscape.js';
import { formatPrice } from '../utils/priceFormatter.js';
import DOM from '../utils/dom.js';

const { show, hide, hashHref } = DOM;

function _renderItem(item) {
  const id = Number(item.product_id);
  const name = escapeHtml(item.name || '');
  const href = hashHref('product', { id });
  const image = item.image || '';
  const price = formatPrice(item.price || 0);
  const inStock = item.in_stock !== false && Number(item.stock ?? 0) > 0;
  const requiresVariant = !!item.requires_variant;

  return `
    <div class="wishlist-item flex flex-col font-display" data-product-id="${id}">
      <a href="${href}" data-link
         class="relative block aspect-square overflow-hidden bg-white mb-4 rounded-xl">
        ${renderImageWithFallback({
          src: image,
          alt: item.name,
          imgClass: 'w-full h-full object-contain transition-opacity duration-300 group-hover:opacity-90',
          iconSize: 'w-8 h-8',
        })}
        <button type="button"
                class="wishlist-remove-btn absolute top-2 right-2 w-8 h-8 rounded-full bg-white/90 backdrop-blur flex items-center justify-center text-muted hover:text-red-500 hover:bg-white shadow-sm transition-colors"
                data-product-id="${id}"
                aria-label="حذف از ویش‌لیست">
          <i data-lucide="x" class="w-4 h-4"></i>
        </button>
        ${!inStock ? '<span class="absolute bottom-2 left-2 bg-black text-white text-[10px] px-2 py-0.5 rounded-full">ناموجود</span>' : ''}
      </a>
      <h3 class="text-[13px] font-bold uppercase tracking-[0.12em] text-body leading-relaxed line-clamp-2 mb-1">
        <a href="${href}" data-link class="hover:opacity-70">${name}</a>
      </h3>
      <p class="text-[13px] font-bold tracking-wide text-body mt-1" dir="ltr">${price}</p>
      <button type="button"
              class="wishlist-move-cart-btn mt-3 w-full text-[11px] font-bold uppercase tracking-[0.18em] py-2.5 border border-black/15 hover:border-black hover:bg-black hover:text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              data-product-id="${id}"
              data-requires-variant="${requiresVariant ? '1' : '0'}"
              data-in-stock="${inStock ? '1' : '0'}"
              ${!inStock ? 'disabled' : ''}>
        ${requiresVariant ? 'انتخاب گزینه و افزودن' : 'افزودن به سبد'}
      </button>
    </div>`;
}

function _renderGrid(items) {
  const grid = document.getElementById('wishlist-items');
  if (!grid) return;
  grid.innerHTML = items.map(_renderItem).join('');
  _bindGrid(grid);
  if (window.lucide) lucide.createIcons();
}

async function _removeItem(productId) {
  try {
    await api.wishlist.remove(productId);
    await _loadWishlist();
  } catch (err) {
    api.utils.toast(err?.message || 'خطا در حذف', 'error');
  }
}

async function _moveToCart(productId, requiresVariant) {
  if (requiresVariant) {
    Router.go('/product', { id: productId });
    return;
  }
  try {
    await api.wishlist.moveToCart(productId, null);
    api.utils.toast('به سبد خرید منتقل شد', 'success', 1800);
    window.loadCartCount?.();
    await _loadWishlist();
  } catch (err) {
    api.utils.toast(err?.message || 'خطا در انتقال به سبد', 'error');
  }
}

function _bindGrid(grid) {
  grid.querySelectorAll('.wishlist-remove-btn').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      _removeItem(btn.dataset.productId);
    });
  });

  grid.querySelectorAll('.wishlist-move-cart-btn').forEach((btn) => {
    btn.addEventListener('click', async () => {
      if (btn.disabled) return;
      btn.disabled = true;
      await _moveToCart(
        btn.dataset.productId,
        btn.dataset.requiresVariant === '1',
      );
      btn.disabled = false;
    });
  });
}

async function _loadWishlist() {
  show('wishlist-loading');
  hide('wishlist-empty');
  hide('wishlist-content');

  try {
    const data = await api.wishlist.get();
    hide('wishlist-loading');
    const items = data?.items || [];

    if (!items.length) {
      show('wishlist-empty');
      const clearBtn = document.getElementById('wishlist-clear-btn');
      if (clearBtn) clearBtn.classList.add('hidden');
      return;
    }

    show('wishlist-content');
    const clearBtn = document.getElementById('wishlist-clear-btn');
    if (clearBtn) clearBtn.classList.remove('hidden');
    _renderGrid(items);
  } catch (err) {
    const loadEl = document.getElementById('wishlist-loading');
    if (loadEl) {
      loadEl.innerHTML = `<p class="text-accent text-center">${escapeHtml(err?.message || 'خطا در بارگذاری')}</p>`;
    }
  }
}

Router.onEnter('wishlist', async function () {
  const clearBtn = DOM.reclone('wishlist-clear-btn');
  clearBtn?.addEventListener('click', async () => {
    if (!confirm('ویش‌لیست خالی شود؟')) return;
    try {
      await api.wishlist.clear();
      await _loadWishlist();
    } catch (err) {
      api.utils.toast(err?.message || 'خطا', 'error');
    }
  });

  await _loadWishlist();
  if (window.lucide) lucide.createIcons();
});