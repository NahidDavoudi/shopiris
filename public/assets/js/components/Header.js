import { storeConfig } from '../config/bootstrap.js';
import auth from '../core/auth.js';

const Header = {
  render() {
    const user = auth.getCurrentUser();
    const loggedIn = auth.isLoggedIn();
    const navLinks = storeConfig.texts.nav;

    // منوی دسکتاپ
    const navItems = navLinks.map((l) => `
      <a href="${l.href}" data-link
         class="text-sm text-dim hover:text-body transition-colors px-2 py-1 rounded-full hover:bg-black/5 header-nav-link">
        ${l.label}
      </a>`).join('');

    // بخش کاربر در دسکتاپ
    const desktopUserArea = loggedIn
      ? `<div class="flex items-center gap-2">
           <span class="text-xs text-muted hidden sm:inline">${user?.name || user?.phone || ''}</span>
           <button id="header-logout-btn" class="text-xs text-muted hover:text-body transition-colors">logout</button>
         </div>`
      : `<a href="login.html" class="w-9 h-9 shrink-0 flex items-center justify-center rounded-full hover:bg-black/5 transition-colors" title="login" aria-label="login">
           <i data-lucide="user" class="w-[18px] h-[18px] text-muted"></i>
         </a>`;

    return `
      <header class="fixed top-0 left-0 right-0 z-50 w-full bg-white/80 backdrop-blur-xl border-b border-black/5">
        <div class="max-w-[1280px] mx-auto px-4 md:px-6 h-16 flex items-center justify-between md:grid md:grid-cols-3">
          
          <!-- چپ: منو در موبایل / لینک‌ها در دسکتاپ -->
          <div class="flex items-center md:hidden">
            <button id="mobile-menu-btn"
                    class="w-10 h-10 -ml-2 flex items-center justify-center rounded-full hover:bg-black/5 transition-colors"
                    aria-label="menu">
              <i data-lucide="menu" class="w-6 h-6 text-body"></i>
            </button>
          </div>
          <nav class="hidden md:flex items-center gap-1">${navItems}</nav>

          <!-- وسط: لوگو (در موبایل کاملاً وسط‌چین می‌شود) -->
          <a href="#/" data-link class="absolute left-1/2 -translate-x-1/2 md:static md:translate-x-0 md:justify-self-start">
            <img src="assets/images/text_logo.png" alt="${storeConfig.name}" class="h-5 md:h-7 w-auto object-contain">
          </a>

          <!-- راست: آیکون کاربر در موبایل / سرچ و سبد خرید در دسکتاپ -->
          <div class="flex items-center justify-end gap-1">
            <!-- دسکتاپ: سرچ -->
            <button data-open-search
                    class="hidden md:flex w-9 h-9 shrink-0 items-center justify-center rounded-full hover:bg-black/5 transition-colors"
                    title="search" aria-label="search">
              <i data-lucide="search" class="w-[18px] h-[18px] text-muted"></i>
            </button>
            
            <!-- دسکتاپ: کاربر -->
            <div class="hidden md:block">${desktopUserArea}</div>

            <!-- موبایل: آیکون کاربر (مشابه عکس) -->
            <a href="${loggedIn ? '#/profile' : 'login.html'}" class="md:hidden w-10 h-10 -mr-2 flex items-center justify-center rounded-full hover:bg-black/5 transition-colors">
              <i data-lucide="user" class="w-5 h-5 text-body"></i>
            </a>

            <!-- دسکتاپ: سبد خرید -->
            <a href="#/cart" data-link
               class="hidden md:flex relative w-9 h-9 shrink-0 items-center justify-center rounded-full hover:bg-black/5 transition-colors group"
               aria-label="cart">
              <i data-lucide="shopping-bag" class="w-[18px] h-[18px] text-muted group-hover:text-body transition-colors"></i>
              <span id="cart-badge"
                    class="hidden absolute -top-0.5 -right-0.5 w-4 h-4 bg-black text-white text-[9px] font-bold rounded-full flex items-center justify-center">0</span>
            </a>
          </div>
        </div>

        <!-- منوی کشویی موبایل -->
        <div id="mobile-menu" class="md:hidden px-4 py-4 absolute top-16 left-0 right-0 bg-white border-b border-black/5 shadow-xl">
          
          <!-- گزینه سرچ داخل منو -->
          <button data-open-search class="w-full flex items-center gap-3 px-4 py-3 bg-surface rounded-xl text-muted mb-4 transition-colors hover:bg-black/5">
            <i data-lucide="search" class="w-4 h-4"></i>
            <span class="text-sm">Search products...</span>
          </button>

          <!-- دسته‌بندی‌ها (منوها) -->
          <nav class="flex flex-col gap-1 mb-4">
            ${navLinks.map((l) => `
              <a href="${l.href}" data-link class="mobile-nav-item py-2.5 px-3 rounded-lg hover:bg-black/5 text-sm font-medium text-body">
                ${l.label}
              </a>`).join('')}
          </nav>

          <!-- بخش پایینی منو: سبد خرید و لاگین/لاگ‌اوت -->
          <div class="border-t border-black/5 pt-4 flex flex-col gap-1">
            <a href="#/cart" data-link class="flex items-center gap-3 py-2.5 px-3 rounded-lg hover:bg-black/5 text-sm font-medium text-body">
              <i data-lucide="shopping-bag" class="w-4 h-4"></i> 
              <span>Cart</span>
            </a>
            
            ${loggedIn ? `
              <button id="mobile-logout-btn" class="flex items-center gap-3 py-2.5 px-3 rounded-lg hover:bg-black/5 text-sm font-medium text-body text-left">
                <i data-lucide="log-out" class="w-4 h-4"></i> 
                <span>Logout</span>
              </button>` : `
              <a href="login.html" class="flex items-center gap-3 py-2.5 px-3 rounded-lg hover:bg-black/5 text-sm font-medium text-body">
                <i data-lucide="user" class="w-4 h-4"></i> 
                <span>Login</span>
              </a>`}
          </div>
        </div>
        
        <!-- بک‌دراپ منو -->
        <div id="mobile-menu-backdrop" class="fixed inset-0 top-16 bg-black/20 hidden md:hidden"></div>
      </header>`;
  },

  bind(container, callbacks = {}) {
    const menuBtn = container.querySelector('#mobile-menu-btn');
    const menu = container.querySelector('#mobile-menu');
    const backdrop = container.querySelector('#mobile-menu-backdrop');

    function setMenuOpen(open) {
      menu?.classList.toggle('hidden', !open);
      backdrop?.classList.toggle('hidden', !open);
      document.body.classList.toggle('overflow-hidden', open);

      // تغییر آیکون منو به ضربدر
      const icon = menuBtn?.querySelector('[data-lucide]');
      if (icon) {
        icon.setAttribute('data-lucide', open ? 'x' : 'menu');
        window.lucide?.createIcons();
      }
    }

    function highlightNav() {
      const hash = location.hash.split('?')[0];
      container.querySelectorAll('.header-nav-link, #mobile-menu a[data-link]').forEach((a) => {
        const href = a.getAttribute('href');
        const active = href === hash || (hash === '#/' && href === '#/');
        a.classList.toggle('text-body', active);
        a.classList.toggle('font-bold', active);
        if (a.classList.contains('mobile-nav-item')) {
          a.classList.toggle('text-accent', active);
          a.classList.toggle('bg-black/5', active);
        }
      });
    }

    highlightNav();
    window.addEventListener('hashchange', highlightNav);

    // لاگ‌اوت دسکتاپ
    container.querySelector('#header-logout-btn')?.addEventListener('click', async () => {
      await callbacks.onLogout?.();
    });

    // لاگ‌اوت موبایل
    container.querySelector('#mobile-logout-btn')?.addEventListener('click', async () => {
      setMenuOpen(false);
      await callbacks.onLogout?.();
    });

    // باز کردن سرچ (هم از دسکتاپ و هم از داخل منوی موبایل)
    container.querySelectorAll('[data-open-search]').forEach((btn) => {
      btn.addEventListener('click', () => {
        setMenuOpen(false);
        callbacks.onOpenSearch?.();
      });
    });

    // دکمه همبرگر
    menuBtn?.addEventListener('click', () => {
      setMenuOpen(menu?.classList.contains('hidden'));
    });

    // بستن منو با کلیک روی بک‌دراپ
    backdrop?.addEventListener('click', () => setMenuOpen(false));

    // بستن منو هنگام کلیک روی لینک‌ها
    container.querySelectorAll('#mobile-menu a[data-link]').forEach((a) => {
      a.addEventListener('click', () => setMenuOpen(false));
    });

    // بستن با کلید Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !menu?.classList.contains('hidden')) setMenuOpen(false);
    });
  },
};

export default Header;