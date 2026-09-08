/**
 * heroSlider.js — automatic crossfade hero slider (vanilla JS + CSS)
 *
 * Timing:
 * - Each slide stays visible for displayDurationMs (default 5s).
 * - Ken Burns runs for the full visible period on the active slide.
 * - Crossfade between slides uses fadeDurationMs (default 1s) opacity transition.
 * - Slider only runs when 2+ images exist (single image = static, no autoplay).
 */

const INSTANCES = new WeakMap();

/**
 * @param {HTMLElement} root
 * @param {{
 *   displayDurationMs?: number,
 *   fadeDurationMs?: number,
 * }} [options]
 */
export function initHeroSlider(root, options = {}) {
  if (!root) return null;

  destroyHeroSlider(root);

  const slides = [...root.querySelectorAll('[data-hero-slide]')];
  if (slides.length < 2) return null;

  const displayDurationMs = options.displayDurationMs ?? 5000;
  const fadeDurationMs = options.fadeDurationMs ?? 1000;

  root.style.setProperty('--hero-fade-duration', `${fadeDurationMs}ms`);
  root.style.setProperty('--hero-display-duration', `${displayDurationMs}ms`);
  root.style.setProperty('--hero-ken-burns-duration', `${displayDurationMs}ms`);

  let activeIndex = slides.findIndex((slide) => slide.classList.contains('is-active'));
  if (activeIndex < 0) activeIndex = 0;

  slides.forEach((slide, index) => {
    slide.classList.toggle('is-active', index === activeIndex);
    slide.setAttribute('aria-hidden', index === activeIndex ? 'false' : 'true');
  });

  let timerId = null;
  let fading = false;

  const restartKenBurns = (slide) => {
    const img = slide?.querySelector('img');
    if (!img) return;
    img.style.animation = 'none';
    // Force reflow so the animation restarts on each activation
    void img.offsetWidth;
    img.style.animation = '';
  };

  const goTo = (nextIndex) => {
    if (fading || nextIndex === activeIndex) return;

    fading = true;
    const current = slides[activeIndex];
    const next = slides[nextIndex];

    next.classList.add('is-entering');
    current.classList.add('is-leaving');
    current.classList.remove('is-active');
    next.classList.add('is-active');
    next.setAttribute('aria-hidden', 'false');
    current.setAttribute('aria-hidden', 'true');

    restartKenBurns(next);

    window.setTimeout(() => {
      current.classList.remove('is-leaving');
      next.classList.remove('is-entering');
      activeIndex = nextIndex;
      fading = false;
      scheduleNext();
    }, fadeDurationMs);
  };

  const scheduleNext = () => {
    if (timerId) window.clearTimeout(timerId);
    timerId = window.setTimeout(() => {
      goTo((activeIndex + 1) % slides.length);
    }, displayDurationMs);
  };

  restartKenBurns(slides[activeIndex]);
  scheduleNext();

  const instance = {
    destroy() {
      if (timerId) window.clearTimeout(timerId);
      slides.forEach((slide, index) => {
        slide.classList.toggle('is-active', index === 0);
        slide.classList.remove('is-leaving', 'is-entering');
        slide.setAttribute('aria-hidden', index === 0 ? 'false' : 'true');
      });
      INSTANCES.delete(root);
    },
  };

  INSTANCES.set(root, instance);
  return instance;
}

export function destroyHeroSlider(root) {
  INSTANCES.get(root)?.destroy();
}

export default initHeroSlider;
