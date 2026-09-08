/**
 * core/wishlistStore.js — wishlist persistence (pure localStorage)
 */
const KEY = 'iris_wishlist_v1';

function read() {
  try {
    const raw = localStorage.getItem(KEY);
    const arr = raw ? JSON.parse(raw) : [];
    return Array.isArray(arr) ? arr.map(Number).filter(Boolean) : [];
  } catch {
    return [];
  }
}

function write(list) {
  try {
    localStorage.setItem(KEY, JSON.stringify(list));
  } catch { /* storage unavailable */ }
  window.dispatchEvent(new CustomEvent('wishlist:change', { detail: { count: list.length } }));
}

const wishlistStore = {
  list() {
    return read();
  },

  has(id) {
    return read().includes(Number(id));
  },

  count() {
    return read().length;
  },

  toggle(id) {
    const list = read();
    const numId = Number(id);
    const idx = list.indexOf(numId);
    if (idx >= 0) {
      list.splice(idx, 1);
    } else {
      list.unshift(numId);
    }
    write(list);
    return idx < 0;
  },
};

export default wishlistStore;
