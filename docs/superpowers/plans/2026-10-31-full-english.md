# Full English pass Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans (user supplied execution method: "just do it" — native, inline).

**Goal:** Zero Persian in Iris: all strings, comments, HTML, PHP messages, digits, currency, DB content; pure EB Garamond font.

**Architecture:** Mechanical translation pass over file groups; each group verified by a Persian-character scan; DB handled by a one-shot CLI script run only after user go-ahead.

**Tech Stack:** Vanilla JS (ES modules), PHP 8, Tailwind v4, MySQL.

**Spec:** `docs/superpowers/specs/2026-10-31-full-english-design.md`

## Global Constraints

- Remove every `[\u0600-\u06FF]` match in `public/assets/js` non-minified, `public/*.html`, `api` (PHP + `.env.example`), except reported product/category DB names.
- `fa-IR` → `en-US`, `'fa-IR'` locale strings replaced everywhere (JS `toLocaleString`, `toLocaleDateString`).
- `تومان` → `Toman`. Persian digits `۰-۹` → Latin in displayed strings.
- No behavior/keys/API changes: only language of strings and comments. Translation comments also to English.
- Minified libs (`libs/*.min.js`) untouched except `persian-date.min.js` usage removal (Task 7).
- Names preserved verbatim in code: `STATUS_MAP`, `_t`, `storeConfig.texts.*` keys stay as-is (keys already English).

## Review Focus

- Translation inserted inside template literals: quote escaping (e.g. `"` inside strings that go to `innerHTML`) — verify via scan for unbalanced quotes in edited files.
- `_t(path, fallback)` fallbacks replaced but keys kept — wrong-path fallbacks would 500 nothing (they're fallbacks), acceptable; keys untouched.
- `fa-IR` digit parse in `priceFormatter.js` retains Persian→Latin normalize (data may still contain Persian digits from DB) — do NOT delete parse lines, only output locale.
- Legal pages (`terms.js|privacy.js|refund.js|faq.js`) read `storeConfig.texts.legal` — if content lives mostly in DB, English source rewrite in `store.config.js` + DB script.
- After font purges, `fonts.css` first line has broken comment (`/* EB Garamond ... .`) — fix.

## Tasks

### Task 1: Storefront core/config files
**Files (Modify):** `public/assets/js/config/app.config.js`, `config/store.config.js`, `config/bootstrap.js`, `core/api.js`, `core/cartStore.js`, `core/theme.js` (comment-only if any), `utils/*.js` (variantHelpers, helpers.js STATUS_MAP, iranLocations names→English, priceFormatter comment, shopFilterHints 'سایز/رنگ' match strings stay (data matching) — make match only if DB English: keep Persian + add English slug hints), `core/auth.js`.
- [ ] Translate strings+comments.
- [ ] `helpers.js`, `OrderRow.js` STATUS_MAP labels English.

### Task 2: Storefront pages + components
**Files (Modify):** all `public/assets/js/pages/*.js`, `components/*.js` (non-minified): toasts, inline errors, table headers, `تومان`, `fa-IR`.
- [ ] Translate; drop dead Persian fallbacks where config key is English.
- [ ] `Pagination.js`, `orders.js`, `OrderDetail.js`, `OrderRow.js` digit/locale swap.

### Task 3: Admin JS
**Files (Modify):** all `public/assets/js/admin/**/*.js` non-minified incl. tabs.
- [ ] Translate `_t` fallbacks, toasts, confirms, comments.

### Task 4: PHP API user-facing messages
**Files (Modify):** `api/app/Modules/**` (Controllers/Services `RuntimeException` + success messages), `api/app/Core/Validation/*.php`, `api/app/Core/UploadHelper.php`, `api/app/Core/Http/Response.php` defaults, `ExceptionHandler.php` 4xx map + fallback HTML, `api/app/Core/Sms/SmsService.php` OTP template, `api/routes/api.php` comments okay, `api/.env.example` comments.
- [ ] Messages English; comments full English too.

### Task 5: PHP views + HTML
**Files (Modify):** `api/views/401|403|404|500.php` fully English, `api/index.php` + `views/40x/exception handler comments`, `public/index.html`, `login.html` (incl. hardcoded `!important` font and all copy), `admin.html` (`lang="en" dir="ltr"`, strings).
- [ ] Scan-clean.

### Task 6: Font to EB Garamond everywhere
**Files (Modify):** `store.config.js` fonts.body='EB Garamond', fonts.display='EB Garamond'; `input.css` `--font-display`/`--font-vazir` → `'EB Garamond', serif`; `fonts.css` strip Montserrat+Vazirmatn @font-face blocks (keep Felipa/MeaCulpa/AlexBrush), fix header comment; `login.html` remove `!important` Montserrat line; add Google-Fonts EB Garamond link + preconnect to `login.html`, `admin.html`; `theme.js` keep --font-vazir var name (renaming keys risks misses) pointing EB Garamond.
- [ ] Verify: grep 'Montserrat|Vazirmatn' = 0 hits outside commented heritage, no `font-family` referencing removed faces.

### Task 7: persian-date removal
**Files (Modify):** find usage: `grep -l persianDate public/assets/js` → replace `new persianDate(...)` with native `new Date(...).toLocaleDateString('en-US',{...})` (or `{format:'mediumDate'}` equivalent); delete `persian-date.min.js` + `<script>` include.
- [ ] Dates render Gregorian Latin.

### Task 8: DB translation script
**Files (Create):** `docs/superpowers/tools/translate_db.php`
**Interfaces:** CLI: `php translate_db.php [--dry-run] [--apply]`; reads `.env` from `api/`; PDO; exact-string Persian→English map run over `shop_settings` (shop_slogan, shop_description, contact_address, meta_title, meta_description), `legal_content` JSON path values; lists product/category/pages rows still containing `[\u0600-\u06FF]`.
- [ ] Dry-run output diff shown to user.
- [ ] User approves → `--apply` runs once.

### Task 9: Final verification
- [ ] PowerShell scan `[\u0600-\u06FF]` over approved paths = 0 hits (excluding min libs, reported DB rows).
- [ ] `git add -A && git commit -m "i18n: full English pass + EB Garamond everywhere"`.
- [ ] Commit separately: `i18n: translate_db tool` (Task 8) — before vs after codebase restore.
