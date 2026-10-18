import { storeConfig } from '../config/bootstrap.js';
import Button from './Button.js';
import { normalizeHeroImages } from '../utils/heroImages.js';
import { destroyHeroSlider, initHeroSlider } from '../utils/heroSlider.js';

const HeroSection = {
  _getImages() {
    const { hero } = storeConfig;
    const fromArray = normalizeHeroImages(hero.images, {
      max: hero.slider?.maxImages ?? 3,
      defaultAlt: storeConfig.name,
    });

    if (fromArray.length) return fromArray;

    if (hero.image) {
      return [{ url: hero.image, alt: storeConfig.name, order: 1 }];
    }

    return [];
  },

  _renderSlides(images) {
    const isSlider = images.length > 1;

    return images.map((item, index) => `
      <div class="hero-slider__slide${index === 0 ? ' is-active' : ''}"
           data-hero-slide
           aria-hidden="${index === 0 ? 'false' : 'true'}">
        <img src="${item.url}" alt="${item.alt || storeConfig.name}"
             class="hero-slider__image w-full h-full object-cover"
             loading="${index === 0 ? 'eager' : 'lazy'}"
             decoding="async">
      </div>`).join('');
  },

  render() {
    const { hero } = storeConfig;
    const images = this._getImages();
    const isSlider = images.length > 1;

    return `
      <section class="hero-fullbleed relative w-full overflow-hidden bg-white">
        <div class="relative w-full aspect-[4/5] sm:aspect-[16/9] md:aspect-[21/9] min-h-[320px] sm:min-h-[420px] md:min-h-[560px]">
          <div class="hero-slider absolute inset-0${isSlider ? ' hero-slider--active' : ''}"
               data-hero-slider-root
               role="${isSlider ? 'region' : 'img'}"
               aria-label="${isSlider ? 'اسلایدر تصاویر هیرو' : (images[0]?.alt || storeConfig.name)}"
               aria-live="${isSlider ? 'off' : undefined}">
            ${images.length
        ? this._renderSlides(images)
        : `<div class="hero-slider__slide is-active" data-hero-slide aria-hidden="false">
                   <div class="w-full h-full bg-surface"></div>
                 </div>`}
          </div>
          <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent pointer-events-none z-[1]"></div>
        </div>
        <div class="absolute bottom-4 md:bottom-12 left-0 right-0 z-10 px-4 md:px-6">
          <div class="max-w-[1280px] mx-auto flex items-end justify-between gap-4">
            <div class="flex flex-col items-end gap-4 shrink-0">
              ${Button.render({
          variant: 'aluminium',
          label: hero.ctaPrimary, // Explore Collection
          href: '#/shop',
          className: 'hero',
          icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-arrow-left preview-icon"><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg>'
        })}
            </div>
          </div>
        </div>
      </section>`;
  },

  bind(element) {
    const root = element?.querySelector('[data-hero-slider-root]');
    if (!root) return;

    const slides = root.querySelectorAll('[data-hero-slide]');
    if (slides.length < 2) return;

    const { hero } = storeConfig;
    const sliderOpts = hero.slider || {};

    initHeroSlider(root, {
      displayDurationMs: sliderOpts.displayDurationMs ?? 5000,
      fadeDurationMs: sliderOpts.fadeDurationMs ?? 1000,
    });
  },

  destroy(element) {
    const root = element?.querySelector('[data-hero-slider-root]');
    if (root) destroyHeroSlider(root);
  },
};

export default HeroSection;