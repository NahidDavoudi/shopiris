/**
 * pages/product.js
 */
import api from '../core/api.js';
import Router from '../core/router.js';
import ProductGallery from '../components/ProductGallery.js';
import ProductInfo from '../components/ProductInfo.js';
import { storeConfig } from '../config/bootstrap.js';
import { pageTitle } from '../core/theme.js';
import DOM from '../utils/dom.js';

const { show, hide, text } = DOM;

function normalizeImages(images = []) {
  return images.map((img) => ({
    ...img,
    url: img.url || img.image_url || '',
  })).filter((img) => img.url);
}

function normalizeProduct(p) {
  const images = normalizeImages(p.images || []);
  if (!images.length && p.main_image) {
    images.push({ url: p.main_image, is_main: true });
  }
  return { ...p, images };
}

function getVariantPrice(variant, product) {
  if (variant?.sale_price) return Number(variant.sale_price);
  if (variant?.price) return Number(variant.price);
  if (product.sale_price) return Number(product.sale_price);
  return Number(product.price) || 0;
}

async function addToCart(p, { variant, qty }) {
  if (p.variant_setup_incomplete) {
    throw new Error(storeConfig.texts.product.variantSetupIncomplete || 'سایزبندی و رنگ‌بندی این محصول هنوز کامل نشده است.');
  }
  if ((p.variant_axes?.length || 0) > 0 && !variant) {
    throw new Error(storeConfig.texts.product.selectVariant || 'لطفاً گزینه محصول را انتخاب کنید');
  }
  const variantId = variant?.id || p.default_variant_id || null;
  await api.cart.add(p.id, qty, variantId);
  window.loadCartCount?.();
}

Router.onEnter('products', async function (params) {
  const { id } = params;
  if (!id) { Router.go('/shop'); return; }

  const t = storeConfig.texts.product;
  text('product-loading-text', t.loading);

  hide('product-detail');
  show('product-loading');

  try {
    const raw = await api.products.get(id);
    const p = normalizeProduct(raw);
    pageTitle(p.name);

    hide('product-loading');
    show('product-detail');

    const images = p.images.length ? p.images : [];
    const defaultVariant = p.variants?.find((v) => v.is_default) || p.variants?.[0];
    const displayPrice = defaultVariant
      ? getVariantPrice(defaultVariant, p)
      : Number(p.price);
    const displayStock = defaultVariant
      ? Number(defaultVariant.inventory?.quantity ?? 0)
      : Number(p.stock ?? 0);

    const galleryWrap = document.getElementById('product-gallery-wrap');
    if (galleryWrap) {
      galleryWrap.innerHTML = ProductGallery.render({
        images,
        name: p.name,
      });
      ProductGallery.bind(galleryWrap, { images });
    }

    const infoWrap = document.getElementById('product-info-wrap');
    if (infoWrap) {
      infoWrap.innerHTML = ProductInfo.render({
        name: p.name,
        price: displayPrice,
        description: p.description,
        shortDescription: p.short_description,
        variantAxes: p.variant_axes || [],
        variants: p.variants || [],
        stock: displayStock,
        variantSetupIncomplete: !!p.variant_setup_incomplete,
      });
      console.log(p)
      ProductInfo.bind(infoWrap, {
        variants: p.variants || [],
        variantAxes: p.variant_axes || [],
        variantSetupIncomplete: !!p.variant_setup_incomplete,
        maxQty: Math.max(1, displayStock || 1),
        getVariantPrice: (variant) => getVariantPrice(variant, p),
        onBuyNow: async ({ variant, qty }) => {
          try {
            if (p.variant_setup_incomplete) {
              api.utils.toast(storeConfig.texts.product.variantSetupIncomplete || 'سایزبندی و رنگ‌بندی این محصول هنوز کامل نشده است.', 'error');
              return;
            }
            if ((p.variant_axes?.length || 0) > 0 && !variant) {
              api.utils.toast(storeConfig.texts.product.selectVariant || 'لطفاً گزینه محصول را انتخاب کنید', 'error');
              return;
            }
            await addToCart(p, { variant, qty });
            Router.go('/checkout');
          } catch (e) {
            api.utils.toast(e.message, 'error');
          }
        },
      });
    }
  } catch (e) {
    const loadEl = document.getElementById('product-loading');
    if (loadEl) loadEl.innerHTML = `<p class="text-body text-xl text-center">${e.message}</p>`;
  }

  if (window.lucide) lucide.createIcons();
});
