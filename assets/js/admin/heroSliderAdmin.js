/**
 * admin/heroSliderAdmin.js — Hero slider images management (admin only)
 * Slider playback logic lives in utils/heroSlider.js
 */

import { storeConfig } from '../config/bootstrap.js';
import { normalizeHeroImages, reorderHeroImages } from '../utils/heroImages.js';

const HeroSliderAdmin = {
  _images: [],
  _replaceIndex: null,
  _dragIndex: null,
  _bound: false,

  _maxImages() {
    return storeConfig.hero?.slider?.maxImages ?? 3;
  },

  _t(path, fallback) {
    return window.getAdminText?.(path, fallback) ?? fallback;
  },

  getImages() {
    return [...this._images];
  },

  setImages(images) {
    this._images = normalizeHeroImages(images, {
      max: this._maxImages(),
      defaultAlt: $('settingsShopName')?.value?.trim() || storeConfig.name,
    });
    this._render();
  },

  collectPayloadImages() {
    const list = $('heroSliderList');
    if (!list) return reorderHeroImages(this._images);

    const items = [...list.querySelectorAll('[data-hero-item]')];
    return reorderHeroImages(items.map((item) => ({
      url: item.dataset.url,
      alt: item.querySelector('[data-hero-alt]')?.value?.trim() || '',
      order: Number(item.dataset.order) || 1,
    })));
  },

  _render() {
    const list = $('heroSliderList');
    const countEl = $('heroSliderCount');
    const addBtn = $('heroSliderAddBtn');
    if (!list) return;

    const t = this._t.bind(this);
    const max = this._maxImages();
    const images = this._images;

    if (countEl) {
      countEl.textContent = `${images.length}/${max}`;
    }

    if (addBtn) {
      addBtn.disabled = images.length >= max;
      addBtn.classList.toggle('opacity-50', images.length >= max);
      addBtn.classList.toggle('pointer-events-none', images.length >= max);
    }

    if (!images.length) {
      list.innerHTML = `
        <p class="col-span-full text-sm text-muted text-center py-8 border border-dashed border-border rounded-xl"
           data-admin-text="settings.identity.heroSliderEmpty">
          ${t('settings.identity.heroSliderEmpty', 'هنوز تصویری برای اسلایدر هیرو آپلود نشده است.')}
        </p>`;
      return;
    }

    list.innerHTML = images.map((item, index) => `
      <div class="hero-slider-admin__item bg-surface border border-border rounded-2xl p-4 space-y-3 cursor-grab active:cursor-grabbing"
           data-hero-item
           data-url="${item.url}"
           data-order="${item.order}"
           draggable="true">
        <div class="flex items-center justify-between gap-2">
          <span class="inline-flex items-center gap-1 text-xs text-muted">
            <i data-lucide="grip-vertical" class="w-4 h-4"></i>
            #${index + 1}
          </span>
          <div class="flex items-center gap-2">
            <button type="button"
                    class="text-xs px-3 py-1.5 rounded-lg bg-card hover:bg-body border border-border transition-all"
                    data-hero-replace="${index}">
              ${t('settings.identity.heroSliderReplace', 'جایگزینی')}
            </button>
            <button type="button"
                    class="text-xs px-3 py-1.5 rounded-lg bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 transition-all"
                    data-hero-remove="${index}">
              ${t('settings.identity.heroSliderRemove', 'حذف')}
            </button>
          </div>
        </div>
        <div class="aspect-video rounded-xl bg-card border border-border overflow-hidden">
          <img src="${item.url}" alt="" class="w-full h-full object-cover pointer-events-none">
        </div>
        <div>
          <label class="block text-muted mb-1.5 text-xs">${t('settings.identity.heroSliderAlt', 'متن جایگزین (alt)')}</label>
          <input type="text"
                 data-hero-alt
                 value="${item.alt || ''}"
                 class="w-full bg-card border border-border rounded-xl px-3 py-2 text-sm text-body focus:border-accent outline-none">
        </div>
      </div>`).join('');

    if (window.lucide) lucide.createIcons();
  },

  _removeAt(index) {
    this._images = reorderHeroImages(this._images.filter((_, i) => i !== index));
    this._render();
  },

  _bindListEvents() {
    const list = $('heroSliderList');
    if (!list || list.dataset.heroBound === '1') return;
    list.dataset.heroBound = '1';

    list.addEventListener('click', (e) => {
      const removeBtn = e.target.closest('[data-hero-remove]');
      if (removeBtn) {
        this._removeAt(Number(removeBtn.dataset.heroRemove));
        return;
      }

      const replaceBtn = e.target.closest('[data-hero-replace]');
      if (replaceBtn) {
        this._replaceIndex = Number(replaceBtn.dataset.heroReplace);
        $('heroSliderUploadInput')?.click();
      }
    });

    list.addEventListener('dragstart', (e) => {
      const item = e.target.closest('[data-hero-item]');
      if (!item) return;
      this._dragIndex = [...list.querySelectorAll('[data-hero-item]')].indexOf(item);
      item.classList.add('opacity-60');
      e.dataTransfer.effectAllowed = 'move';
    });

    list.addEventListener('dragend', (e) => {
      const item = e.target.closest('[data-hero-item]');
      item?.classList.remove('opacity-60');
      this._dragIndex = null;
      list.querySelectorAll('[data-hero-item]').forEach((el) => el.classList.remove('ring-2', 'ring-accent'));
    });

    list.addEventListener('dragover', (e) => {
      const item = e.target.closest('[data-hero-item]');
      if (!item) return;
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
      item.classList.add('ring-2', 'ring-accent');
    });

    list.addEventListener('dragleave', (e) => {
      const item = e.target.closest('[data-hero-item]');
      item?.classList.remove('ring-2', 'ring-accent');
    });

    list.addEventListener('drop', (e) => {
      const item = e.target.closest('[data-hero-item]');
      if (!item) return;
      e.preventDefault();
      item.classList.remove('ring-2', 'ring-accent');
      if (this._dragIndex == null) return;

      const items = [...list.querySelectorAll('[data-hero-item]')];
      const dropIndex = items.indexOf(item);
      if (dropIndex < 0 || dropIndex === this._dragIndex) return;

      const next = [...this._images];
      const [moved] = next.splice(this._dragIndex, 1);
      next.splice(dropIndex, 0, moved);
      this._images = reorderHeroImages(next);
      this._render();
    });
  },

  bind() {
    this._bindListEvents();

    if (this._bound) return;
    this._bound = true;

    $('heroSliderAddBtn')?.addEventListener('click', () => {
      if (this._images.length >= this._maxImages()) {
        toast(this._t('settings.identity.heroSliderMaxReached', 'حداکثر ۳ تصویر مجاز است.'), 'error');
        return;
      }
      this._replaceIndex = null;
      $('heroSliderUploadInput')?.click();
    });

    $('heroSliderUploadInput')?.addEventListener('change', async (e) => {
      const file = e.target.files?.[0];
      e.target.value = '';
      if (!file) return;

      if (this._replaceIndex == null && this._images.length >= this._maxImages()) {
        toast(this._t('settings.identity.heroSliderMaxReached', 'حداکثر ۳ تصویر مجاز است.'), 'error');
        return;
      }

      try {
        setLoading(true);
        const result = await API.settings.uploadHeroSlide(file);
        const url = result?.url;
        if (!url) throw new Error('آدرس تصویر دریافت نشد');

        const defaultAlt = $('settingsShopName')?.value?.trim() || storeConfig.name;

        if (this._replaceIndex != null) {
          const idx = this._replaceIndex;
          this._replaceIndex = null;
          if (this._images[idx]) {
            this._images[idx] = {
              ...this._images[idx],
              url,
              alt: this._images[idx].alt || defaultAlt,
            };
          }
        } else {
          this._images = reorderHeroImages([
            ...this._images,
            { url, alt: defaultAlt, order: this._images.length + 1 },
          ]);
        }

        this._render();
        toast(this._t('settings.uploadSuccess', 'تصویر آپلود شد'));
      } catch (err) {
        toast(err.message, 'error');
      } finally {
        setLoading(false);
      }
    });
  },
};

export default HeroSliderAdmin;
