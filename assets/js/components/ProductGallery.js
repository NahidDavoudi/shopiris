import { renderImageWithFallback, renderImagePlaceholder } from '../utils/imagePlaceholder.js';

const ProductGallery = {
  render({ images = [], name = '' }) {
    const validImages = images.filter((img) => img?.url);

    const slides = validImages.length
      ? validImages.map((img) => `
          <div class="gallery-slide relative min-w-full snap-center aspect-[4/5] flex items-center justify-center overflow-hidden">
            ${renderImageWithFallback({
        src: img.url,
        alt: name,
        imgClass: 'w-full h-full object-contain',
        iconSize: 'w-12 h-12',
      })}
          </div>`).join('')
      : `<div class="gallery-slide relative min-w-full snap-center aspect-[4/5] flex items-center justify-center overflow-hidden">
           ${renderImagePlaceholder('w-12 h-12')}
         </div>`;

    const dots = validImages.length > 1
      ? `<div class="gallery-dots flex items-center justify-center gap-3 py-5">
          ${validImages.map((_, i) => `
            <button type="button" data-dot-index="${i}" aria-label="Image ${i + 1}"
              class="gallery-dot w-1.5 h-1.5 rounded-full transition-all ${i === 0 ? 'gallery-dot-active' : 'bg-black/15'}"></button>`).join('')}
        </div>`
      : '<div class="py-3"></div>';

    return `
      <div class="product-gallery">
        <div id="gallery-track" class="gallery-track flex overflow-x-auto snap-x snap-mandatory no-scrollbar">
          ${slides}
        </div>
        ${dots}
      </div>`;
  },

  bind(container, callbacks = {}) {
    const track = container.querySelector('#gallery-track');
    const dots = container.querySelectorAll('.gallery-dot');
    if (!track) return;

    const setActiveDot = (idx) => {
      dots.forEach((d, i) => {
        d.classList.toggle('gallery-dot-active', i === idx);
        d.classList.toggle('bg-black/15', i !== idx);
      });
    };

    dots.forEach((dot) => {
      dot.addEventListener('click', () => {
        const idx = parseInt(dot.dataset.dotIndex, 10);
        track.scrollTo({ left: idx * track.clientWidth, behavior: 'smooth' });
      });
    });

    let raf = null;
    track.addEventListener('scroll', () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = null;
        if (!dots.length) return;
        const idx = Math.max(0,
          Math.min(dots.length - 1, Math.round(track.scrollLeft / track.clientWidth)));
        setActiveDot(idx);
        callbacks.onSlideChange?.(idx);
      });
    });
  },
};

export default ProductGallery;
