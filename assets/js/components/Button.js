import { storeConfig } from '../config/bootstrap.js';

const SIZES = {
  sm: 'btn-sm',
  md: 'btn-md',
  lg: 'btn-lg',
  icon: 'btn-icon',
};

// نگاشت متمرکز Variantها برای جلوگیری از if/else و کثیف شدن کد
const VARIANTS = {
  aluminum: storeConfig.ui?.btnAluminum || 'btn-aluminum',
  glass: storeConfig.ui?.btnGlass || 'btn-glass',
  text: 'btn-text',
};

const Button = {
  render({
    variant = 'aluminum',
    label = '',
    href = null,
    type = 'button',
    size = 'md',
    className = '',
    icon = '',
    disabled = false,
    attrs = {},
  } = {}) {
    // خواندن استایل مستقیماً از آبجکت
    const variantClass = VARIANTS[variant] || VARIANTS.aluminum;
    const sizeClass = SIZES[size] || SIZES.md;
    const disabledAttr = disabled ? 'disabled aria-disabled="true"' : '';

    const extraAttrs = Object.entries(attrs)
      .map(([k, v]) => `${k}="${v}"`)
      .join(' ');

    const content = icon
      ? `<span class="btn-inner flex items-center justify-center gap-2">${icon}<span>${label}</span></span>`
      : `<span class="btn-inner">${label}</span>`;

    const classes = `btn ${variantClass} ${sizeClass} ${className}`.trim();

    if (href) {
      const linkAttrs = href.startsWith('#') ? 'data-link' : '';
      return `<a href="${href}" ${linkAttrs} class="${classes}" ${disabledAttr} ${extraAttrs}>${content}</a>`;
    }

    return `<button type="${type}" class="${classes}" ${disabledAttr} ${extraAttrs}>${content}</button>`;
  },

  bind(container, callbacks = {}) {
    container.querySelectorAll('.btn[data-action]').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        if (btn.disabled || btn.getAttribute('aria-disabled') === 'true') return;
        const action = btn.dataset.action;
        callbacks[action]?.(e, btn);
      });
    });
  },
};

export default Button;