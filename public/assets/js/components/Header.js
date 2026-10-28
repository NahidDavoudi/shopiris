import { storeConfig } from '../config/bootstrap.js';
import auth from '../core/auth.js';

/**
 * Header — مینیمال (موبایل + دسکتاپ یکسان)
 * ساختار نوار: [همبرگری] — [لوگو وسط] — [آیکون کاربر]
 *
 * نکته مهم درباره‌ی bind:
 * به‌جای اتصال listener به تک‌تک المان‌ها (که اگر bind چند بار صدا زده شود
 * روی هم انبار می‌شوند و یک کلیک = چند toggle = باز و بسته شدن فوری منو)،
 * همه‌ی رویدادها یک‌بار و به‌صورت delegated روی document وصل می‌شوند.
 * المان‌ها در لحظه‌ی کلیک از DOM خوانده می‌شوند، پس re-render شدن هدر هم
 * مشکلی ایجاد نمی‌کند. گارد ۲۵۰ میلی‌ثانیه‌ای هم جلوی دابل‌کلیک/رویداد
 * تکراری روی دکمه‌ی تاگل را می‌گیرد.
 */
let _docBound = false;
let _lastToggleAt = 0;

const Header = {
  _callbacks: {},

  render() {
    const user = auth.getCurrentUser();
    const loggedIn = auth.isLoggedIn();
    const navLinks = storeConfig.texts.nav;

    // آیکون کاربر سمت مقابل همبرگری — مثل تصویر مرجع
    // لاگین‌شده: منوی اکانت را باز می‌کند | مهمان: صفحه لاگین
    const accountAction = loggedIn
      ? `<button type="button" id="header-account-btn"
                 class="w-9 h-9 shrink-0 flex items-center justify-center rounded-full hover:bg-black/5 transition-colors justify-self-end"
                 title="account" aria-label="account" aria-haspopup="true" aria-controls="mobile-menu">
           <i data-lucide="user" class="w-[18px] h-[18px] text-muted"></i>
         </button>`
      : `<a href="login.html"
            class="w-9 h-9 shrink-0 flex items-center justify-center rounded-full hover:bg-black/5 transition-colors justify-self-end"
            title="login" aria-label="login">
           <i data-lucide="user" class="w-[18px] h-[18px] text-muted"></i>
         </a>`;

    const userRow = loggedIn && (user?.name || user?.phone)
      ? `
                <div class="flex items-center gap-2 px-4 py-1.5 text-xs text-muted">
                  <i data-lucide="user" class="w-3.5 h-3.5"></i>
                  <span>${user?.name || user?.phone}</span>
                </div>`
      : '';

    return `
      <header class="fixed top-0 left-0 right-0 z-50 w-full bg-white/80 backdrop-blur-xl border-b border-black/5">
        <div class="max-w-[1280px] mx-auto px-4 md:px-6 h-16 grid grid-cols-[1fr_auto_1fr] items-center">
          <button id="mobile-menu-btn"
                  class="w-9 h-9 shrink-0 flex items-center justify-center rounded-full hover:bg-black/5 transition-colors justify-self-start"
                  aria-label="menu" aria-controls="mobile-menu" aria-expanded="false">
            <i data-lucide="menu" class="w-[18px] h-[18px] text-muted"></i>
          </button>

          <a href="#/" data-link class="shrink-0 justify-self-center" aria-label="${storeConfig.name}">
            <img src="assets/images/text_logo.png" alt="${storeConfig.name}" class="h-7 w-auto object-contain">
          </a>

          ${accountAction}
        </div>

        <div id="mobile-menu" class="hidden border-t border-black/5 bg-white/95 backdrop-blur-xl max-h-[calc(100vh-4rem)] overflow-y-auto">
          <div class="max-w-[1280px] mx-auto px-4 md:px-6 py-4">
            <div class="flex flex-col gap-1 md:max-w-sm">

              <button data-open-search type="button"
                      class="flex items-center justify-between gap-3 w-full px-4 py-3 rounded-xl bg-surface/60 border border-black/5 text-sm text-muted hover:text-body hover:border-black/10 transition-colors">
                <span class="flex items-center gap-2.5">
                  <i data-lucide="search" class="w-4 h-4"></i>
                  <span>Search</span>
                </span>
                <i data-lucide="chevron-left" class="w-4 h-4 opacity-40"></i>
              </button>

              <nav class="flex flex-col gap-1 pt-1">
                ${navLinks.map((l) => `
                  <a href="${l.href}" data-link
                     class="mobile-nav-item px-4 py-3 rounded-xl text-sm text-body hover:bg-black/5 transition-colors">${l.label}</a>`).join('')}
              </nav>

              <a href="#/cart" data-link
                 class="flex items-center justify-between gap-3 px-4 py-3 rounded-xl text-sm text-body hover:bg-black/5 transition-colors">
                <span class="flex items-center gap-2.5">
                  <i data-lucide="shopping-bag" class="w-4 h-4"></i>
                  <span>Cart</span>
                </span>
                <span id="cart-badge"
                      class="hidden min-w-4 h-4 px-1 bg-black text-white text-[9px] font-bold rounded-full flex items-center justify-center">0</span>
              </a>

              <div class="border-t border-black/5 mt-2 pt-2 flex flex-col gap-1">
                ${loggedIn ? `
                ${userRow}
                <button id="mobile-logout-btn" type="button"
                        class="flex items-center justify-between gap-3 w-full px-4 py-3 rounded-xl text-sm text-body hover:bg-black/5 transition-colors">
                  <span>logout</span>
                  <i data-lucide="log-out" class="w-4 h-4 text-muted"></i>
                </button>` : `
                <a href="login.html"
                   class="flex items-center justify-between gap-3 w-full px-4 py-3 rounded-xl text-sm text-body hover:bg-black/5 transition-colors">
                  <span>login</span>
                  <i data-lucide="user" class="w-4 h-4 text-muted"></i>
                </a>`}
              </div>

            </div>
          </div>
        </div>
      </header>
      <div id="mobile-menu-backdrop" class="hidden fixed inset-0 z-40 bg-black/30"></div>`;
  },

  bind(container, callbacks = {}) {
    // آخرین callbacks همیشه نگه داشته می‌شود، حتی اگر bind چند بار صدا زده شود
    Header._callbacks = callbacks || {};

    if (_docBound) return;
    _docBound = true;

    function isOpen() {
      const menu = document.getElementById('mobile-menu');
      return !!menu && !menu.classList.contains('hidden');
    }

    function setMenuOpen(open) {
      const menu = document.getElementById('mobile-menu');
      const backdrop = document.getElementById('mobile-menu-backdrop');
      const btn = document.getElementById('mobile-menu-btn');

      menu?.classList.toggle('hidden', !open);
      backdrop?.classList.toggle('hidden', !open);
      btn?.setAttribute('aria-expanded', String(open));
      document.body.classList.toggle('overflow-hidden', open);

      const icon = btn?.querySelector('[data-lucide]');
      if (icon) {
        icon.setAttribute('data-lucide', open ? 'x' : 'menu');
        window.lucide?.createIcons();
      }
    }

    // تاگل با گارد ضد دابل‌کلیک/رویداد تکراری
    function tryToggle() {
      const now = Date.now();
      if (now - _lastToggleAt < 250) return;
      _lastToggleAt = now;
      setMenuOpen(!isOpen());
    }

    function highlightNav() {
      const menu = document.getElementById('mobile-menu');
      if (!menu) return;
      const hash = location.hash.split('?')[0];
      menu.querySelectorAll('a[data-link]').forEach((a) => {
        const href = a.getAttribute('href');
        const active = href === hash || (hash === '#/' && href === '#/');
        a.classList.toggle('font-bold', active);
        if (a.classList.contains('mobile-nav-item')) {
          a.classList.toggle('text-accent', active);
        }
      });
    }

    document.addEventListener('click', (e) => {
      const target = e.target instanceof Element ? e.target : null;
      if (!target) return;

      const menu = document.getElementById('mobile-menu');
      if (!menu) return;

      // ۱) دکمه‌های تاگل: همبرگری / آیکون اکانت (در حالت لاگین)
      if (target.closest('#mobile-menu-btn, #header-account-btn')) {
        tryToggle();
        return;
      }

      // ۲) ردیف سرچ داخل منو
      if (target.closest('[data-open-search]')) {
        setMenuOpen(false);
        Header._callbacks?.onOpenSearch?.();
        return;
      }

      // ۳) دکمه‌ی خروج داخل منو
      if (target.closest('#mobile-logout-btn')) {
        setMenuOpen(false);
        Header._callbacks?.onLogout?.();
        return;
      }

      if (!isOpen()) return;

      // ۴) کلیک بیرون از هدر (روی بک‌دراپ یا هر جای صفحه)
      if (!target.closest('header')) {
        setMenuOpen(false);
        return;
      }

      // ۵) لینک‌های داخل هدر: دسته‌بندی‌ها، لوگو، سبد خرید
      if (target.closest('a[data-link]')) {
        setMenuOpen(false);
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && isOpen()) setMenuOpen(false);
    });

    window.addEventListener('hashchange', highlightNav);
    highlightNav();
  },
};

export default Header;