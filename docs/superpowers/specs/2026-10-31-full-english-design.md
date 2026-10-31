# Full English pass — Iris store

## Intent
Zero Persian anywhere: UI strings, API messages, HTML pages, digits, currency, code comments, DB content. Font becomes pure EB Garamond.

## Goals
- No `[\u0600-\u06FF]` match left in `public/assets/js` (non-minified), `public/*.html`, `api` PHP, or `.env.example`.
- `fa-IR` → `en-US` everywhere; Persian digits normalized; `تومان` → `Toman`.
- EB Garamond as the only font: `store.config.js` fonts.body/display = 'EB Garamond'; Vazirmatn dropped from `input.css` vars; purge `fonts.css` of Montserrat/Vazirmatn @font-face blocks; remove `persian-date.min.js` usage if replaceable by native `toLocaleDateString('en-US')`.
- DB: one-shot script `tools/translate_db.php` (CLI, reads api `.env`) rewritten to English from source Persian; all replacements report-only, rest printed for manual fix in admin.
- Admin layout, payment providers (Zarinpal, Melipayamak), Enamad badge: function preserved, labels English.

## Non-goals
- No behavior changes, no refactors, no i18n framework introduction.
- Minified libs (swiper, d3, lucide) untouched.

## Approach (chosen: A)
Mechanical translator pass, executed file-group by file-group via subagents, verified by a final Persian scan.
Traded off: B (keep Persian comments — rejected: user wants zero Persian), C (storefront only — rejected).

## Constraints
- Persian exact-match translation maps must preserve behavior: error messages only switch language, keys/identifiers/sku unchanged.
- RTL idioms inline `dir="ltr"` stay harmless; template classes `text-right`/`text-left` left as-is (visual review after).
- DB writes are destructive on decision: fixer script edits live settings row — run only once, confirmed by user.

## Left to builder
- Exact English phrasing per string (short, UI-appropriate).
- Where DB Persian appears in product/category names: report, don't guess.
