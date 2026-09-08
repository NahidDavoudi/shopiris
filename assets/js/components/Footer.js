import { storeConfig } from '../config/bootstrap.js';
import { getEnamadBadgeHtml } from '../utils/enamadHelpers.js';

function renderEnamadBadge() {
  const html = getEnamadBadgeHtml(storeConfig.enamad?.html);
  if (!html) return '';
  return `<div class="enamad-badge">${html}</div>`;
}

const Footer = {
  render() {
    const { footer } = storeConfig.texts;
    const navLinks = storeConfig.texts.nav;
    const legalLinks = storeConfig.texts.legal?.footerLinks || [];
    const enamadBadge = renderEnamadBadge();
    const phone = storeConfig.texts.legal?.contact?.phone?.value;
    const email = storeConfig.texts.legal?.contact?.email?.value;

    return `
      <footer class="footer-formal border-t border-border bg-body mt-20" dir="ltr">
        <div class="max-w-[1280px] mx-auto px-4 md:px-6 pt-14 pb-8">

          <div class="grid grid-cols-2 lg:grid-cols-12 gap-x-6 gap-y-10 lg:gap-6 mb-12">

            <div class="col-span-1 lg:col-span-4 flex flex-col items-start text-left">
              <div class="flex items-center gap-3 mb-4">
                <img src="${storeConfig.logo}" alt="${storeConfig.name}" class="w-9 h-9 object-contain">
                <span class="font-display text-lg text-body">${storeConfig.name}</span>
              </div>
              <p class="text-sm text-muted leading-relaxed max-w-xs">${footer.tagline}</p>
            </div>

            <div class="col-span-1 lg:col-span-3 lg:col-start-10 flex items-start justify-end lg:order-last">
              ${enamadBadge}
            </div>

            <div class="col-span-1 lg:col-span-2 lg:col-start-6 text-left">
              <h3 class="footer-heading">Quick Links</h3>
              <ul class="space-y-2.5">
                ${navLinks.map((l) => `
                  <li><a href="${l.href}" data-link class="footer-link">${l.label}</a></li>`).join('')}
              </ul>
            </div>

            <div class="col-span-1 lg:col-span-2 lg:col-start-8 text-left">
              <h3 class="footer-heading">Privacy Policy</h3>
              <ul class="space-y-2.5">
                ${legalLinks.map((l) => `
                  <li><a href="${l.href}" data-link class="footer-link">${l.label}</a></li>`).join('')}
              </ul>
            </div>

            <div class="col-span-2 lg:col-span-3 lg:col-start-10 lg:row-start-1 text-left">
              <h3 class="footer-heading">Contact Us</h3>
              <p class="text-sm text-muted leading-relaxed mb-3">${footer.support}</p>
              <div class="space-y-1.5">
                ${phone ? `<p class="text-sm text-body">${phone}</p>` : ''}
                ${email ? `<p class="text-sm text-body">${email}</p>` : ''}
              </div>
              ${footer.social ? `<p class="text-sm text-body mt-3">${footer.social}</p>` : ''}
            </div>

          </div>

          <div class="footer-bottom border-t border-border pt-6 flex flex-col-reverse sm:flex-row items-center justify-between gap-5">
            <p class="text-xs text-muted/70 text-center sm:text-left">${footer.copyright}</p>
            <div class="flex flex-wrap gap-5 justify-center text-xs">
              ${legalLinks.slice(2, 4).map((l) => `
                <a href="${l.href}" data-link class="text-muted/70 hover:text-body transition-colors">${l.label}</a>`).join('')}
            </div>
          </div>

        </div>
      </footer>`;
  },

  bind() { /* no events */ },
};

export default Footer;