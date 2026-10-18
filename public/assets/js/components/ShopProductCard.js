import ProductCard from './ProductCard.js';

const ShopProductCard = {
  render(p) {
    return ProductCard.render(p);
  },

  bind(container, callbacks = {}) {
    ProductCard.bind(container, callbacks);
  },
};

export default ShopProductCard;
