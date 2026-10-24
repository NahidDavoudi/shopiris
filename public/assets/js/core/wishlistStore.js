/**
 * core/wishlistStore.js — guest localStorage + authenticated API (mirror cartStore)
 */
import * as auth from './auth.js';

const KEY = 'iris_wishlist_v1';

function readRaw() {
  try {
    const raw = localStorage.getItem(KEY);
    const arr = raw ? JSON.parse(raw) : [];
    return Array.isArray(arr) ? arr.map(Number).filter(Boolean) : [];
  } catch {
    return [];
  }
}

function writeRaw(list) {
  try {
    localStorage.setItem(KEY, JSON.stringify(list));
  } catch { /* storage unavailable */ }
  window.dispatchEvent(new CustomEvent('wishlist:change', { detail: { count: list.length } }));
}

function normalizeGuestItem(product) {
  const mainImage = product.main_image
    || product.images?.find((i) => i.is_main)?.url
    || product.images?.[0]?.url
    || '';
  return {
    product_id: Number(product.id),
    name: product.name || '',
    product_slug: product.slug || '',
    image: mainImage,
    price: Number(product.sale_price ?? product.price ?? 0),
    stock: Number(product.stock ?? 0),
    in_stock: Number(product.stock ?? 0) > 0,
    requires_variant:
      product.product_type === 'variable'
      || !!product.variant_setup_incomplete
      || (product.variant_axes?.length || 0) > 0,
    is_active: product.is_active !== 0 && product.is_active !== false,
    default_variant_id: product.default_variant_id ?? null,
  };
}

export function createWishlistStore(http) {
  const { get, post, del, withFallback, fetchProduct, cartAdd } = http;

  async function getGuestWishlist() {
    const ids = readRaw();
    if (!ids.length) return { id: null, items: [], count: 0 };

    const results = await Promise.all(
      ids.map(async (id) => {
        try {
          const product = await fetchProduct(id);
          if (!product || product.is_active === 0 || product.is_active === false) return null;
          return normalizeGuestItem(product);
        } catch {
          return null;
        }
      }),
    );

    const items = results.filter(Boolean);
    if (items.length !== ids.length) {
      writeRaw(items.map((i) => i.product_id));
    }
    return { id: null, items, count: items.length };
  }

  function cacheFromServerWishlist(serverWishlist) {
    const items = serverWishlist?.items || [];
    writeRaw(items.map((i) => Number(i.product_id)));
  }

  // ─── Store object — NOTE: use `store.xxx()` inside methods (not `this.xxx`) ──
  const store = {
    // ─── Sync helpers (for render-time) ─────────────────────
    list: () => readRaw(),
    has: (id) => readRaw().includes(Number(id)),
    count: () => readRaw().length,

    // ─── Read ───────────────────────────────────────────────
    get: async () => {
      if (auth.isLoggedIn()) {
        const data = await withFallback(get('/wishlist'), { id: null, items: [], count: 0 });
        cacheFromServerWishlist(data);
        return data;
      }
      return getGuestWishlist();
    },

    // ─── Mutations ──────────────────────────────────────────
    add: async (productId) => {
      if (auth.isLoggedIn()) {
        const res = await post('/wishlist/items', { product_id: Number(productId) });
        cacheFromServerWishlist(res);
        return res;
      }
      const list = readRaw();
      const id = Number(productId);
      if (!list.includes(id)) {
        list.unshift(id);
        writeRaw(list);
      }
      return { id: null, items: [], count: list.length };
    },

    remove: async (productId) => {
      if (auth.isLoggedIn()) {
        const res = await del(`/wishlist/items/${productId}`);
        cacheFromServerWishlist(res);
        return res;
      }
      const list = readRaw().filter((id) => id !== Number(productId));
      writeRaw(list);
      return { id: null, items: [], count: list.length };
    },

    toggle: async (productId) => {
      const isIn = readRaw().includes(Number(productId));
      if (isIn) {
        await store.remove(productId);
        return false;
      }
      await store.add(productId);
      return true;
    },

    clear: async () => {
      if (auth.isLoggedIn()) {
        await del('/wishlist');
      }
      writeRaw([]);
      return { id: null, items: [], count: 0 };
    },

    moveToCart: async (productId, variantId = null) => {
      if (!auth.isLoggedIn()) {
        if (typeof cartAdd !== 'function') {
          throw new Error('Move to cart is not available for guests.');
        }
        await cartAdd(productId, 1, variantId);
        const list = readRaw().filter((id) => id !== Number(productId));
        writeRaw(list);
        return { cart: null, wishlist: { id: null, items: [], count: list.length } };
      }
      const body = variantId ? { variant_id: variantId } : {};
      const res = await post(`/wishlist/items/${productId}/move-to-cart`, body);
      cacheFromServerWishlist(res?.wishlist);
      return res;
    },

    // ─── Sync from server (after login / on app init) ──────
    mergeGuestIfNeeded: async () => {
      if (!auth.isLoggedIn()) return null;

      const ids = readRaw();
      let res;
      if (ids.length) {
        res = await post('/wishlist/merge', { items: ids });
        cacheFromServerWishlist(res?.wishlist);
      } else {
        res = await withFallback(get('/wishlist'), { id: null, items: [], count: 0 });
        cacheFromServerWishlist(res);
      }
      return res;
    },
  };

  return store;
}

export default createWishlistStore;