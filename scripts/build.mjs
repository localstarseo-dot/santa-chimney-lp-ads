import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const read = (path) => readFileSync(resolve(root, path), 'utf8');
const write = (path, contents) => {
  mkdirSync(dirname(resolve(root, path)), { recursive: true });
  writeFileSync(resolve(root, path), contents.replace(/[ \t]+$/gm, ''));
};

function previewForm(id) {
  const sticky = id === '4877';
  const field = (type, label, name) => `
    <div class="forminator-row">
      <div class="forminator-col" id="${sticky ? name : 'popup-' + name}">
        <div class="forminator-field">
          <label class="forminator-label" for="sc-preview-${id}-${name}">${label}</label>
          <input class="forminator-input" id="sc-preview-${id}-${name}" name="${name}" type="${type}" placeholder="${label}" required autocomplete="${type === 'tel' ? 'tel' : 'name'}" ${type === 'tel' ? 'inputmode="tel"' : ''}>
        </div>
      </div>
    </div>`;
  return `<form id="forminator-module-${id}" class="forminator-ui" data-sc-preview-form="" onsubmit="return false" aria-label="Preview voucher form, no request is sent">
    ${field('text', 'Name', 'name-1')}
    ${field('tel', 'Phone', 'phone-1')}
    <div class="forminator-row forminator-row-last"><div class="forminator-col">
      <button type="submit" class="forminator-button-submit">CLAIM MY VOUCHER</button>
    </div></div>
  </form>`;
}

const headerSource = read('src/components/header.html');
const modalSource = read('src/components/voucher-modal.html');
const footerSource = read('src/components/footer.html');
const floatingSource = read('src/components/floating-actions.html');
const clean = (html) => html.replace(/<!--\s*\/?wp:[\s\S]*?-->/g, '').replace(/\[forminator_form id="(4877|4914)"\]/g, (_, id) => previewForm(id));
const header = clean(headerSource).replace(/data-expiry-key="[^"]+"/, 'data-expiry-key="sc_staging_lp_1_repair_offer_expiry_59m_v1"');
const modal = clean(modalSource);
// LP-specific offer copy, while retaining the approved global component markup.
const cleaningHeader = header
  .replace('href="#repair-services"', 'href="#cleaning-services"')
  .replace('href="#repair-questions"', 'href="#cleaning-questions"')
  .replace('id="sc-ppc-header"', 'id="sc-ppc-header" data-sc-landing-page="cleaning"')
  .replace('data-campaign="repair"', 'data-campaign="cleaning"')
  .replace('data-service="Chimney Repair"', 'data-service="Chimney Sweep"')
  .replace('data-offer="$99 OFF"', 'data-offer="20% OFF"')
  .replace('sc_staging_lp_1_repair_offer_expiry_59m_v1', 'sc_staging_lp_2_cleaning_offer_expiry_59m_v1')
  .replaceAll('$99 VOUCHER RESERVED', 'Get 20% OFF for Chimney Sweep')
  .replaceAll('$99 OFF CHIMNEY REPAIR', '20% OFF CHIMNEY CLEANING &amp; SWEEP')
  .replaceAll('$99 OFF', '20% OFF');
const cleaningModal = modal
  .replace('LIMITED-TIME REPAIR VOUCHER', 'LIMITED-TIME CHIMNEY SWEEP VOUCHER')
  .replace('$99 OFF', 'Get 20% OFF')
  .replace('CHIMNEY REPAIR', 'for Chimney Sweep');
const inspectionHeader = header
  .replace('href="#repair-services"', 'href="#inspection-services"')
  .replace('href="#repair-questions"', 'href="#inspection-questions"')
  .replace('id="sc-ppc-header"', 'id="sc-ppc-header" data-sc-landing-page="inspection"')
  .replace('data-campaign="repair"', 'data-campaign="inspection"')
  .replace('data-service="Chimney Repair"', 'data-service="Chimney Inspection"')
  .replace('data-offer="$99 OFF"', 'data-offer="20% OFF"')
  .replace('sc_staging_lp_1_repair_offer_expiry_59m_v1', 'sc_staging_lp_3_inspection_offer_expiry_59m_v1')
  .replaceAll('$99 VOUCHER RESERVED', 'Get 20% OFF Chimney Inspection')
  .replaceAll('$99 OFF CHIMNEY REPAIR', '20% OFF CHIMNEY INSPECTION')
  .replaceAll('$99 OFF', '20% OFF');
const inspectionModal = modal
  .replace('LIMITED-TIME REPAIR VOUCHER', 'LIMITED-TIME CHIMNEY INSPECTION VOUCHER')
  .replace('$99 OFF', 'Get 20% OFF')
  .replace('CHIMNEY REPAIR', 'Chimney Inspection');

const document = (title, body, page = false) => `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="robots" content="noindex, nofollow">
  <title>${title}</title>
  <link rel="icon" href="data:,">
  <link rel="stylesheet" href="${page ? '../' : ''}assets/css/preview.css">
  ${page ? '<link rel="stylesheet" href="../assets/css/shared.css">' : ''}
  ${page ? '<script src="../assets/js/header.js" defer></script>\n  <script src="../assets/js/voucher-modal.js" defer></script>\n  <script src="../assets/js/preview-forms.js" defer></script>' : ''}
  ${page ? '<script src="../assets/js/service-stats.js" defer></script>\n  <script src="../assets/js/comparison.js" defer></script>\n  <script src="../assets/js/google-reviews.js" defer></script>\n  <script src="../assets/js/hero-slideshow.js" defer></script>' : ''}
</head>
<body class="sc-staging-site" data-sc-staging="true">
${body}
</body>
</html>
`;

const pageBody = read('src/pages/lp-1.html');
write('lp-1/index.html', document('Santa Chimney | LP 1 Chimney Repair staging', header + '\n' + pageBody + '\n' + clean(footerSource) + '\n' + clean(floatingSource) + '\n' + modal, true));
for (const [number, service] of [[2, 'Chimney Cleaning & Sweep'], [3, 'Chimney Inspections']]) {
  const body = read('src/pages/lp-' + number + '.html');
  const contents = number === 2
    ? cleaningHeader + '\n' + body + '\n' + clean(footerSource) + '\n' + clean(floatingSource) + '\n' + cleaningModal
    : inspectionHeader + '\n' + body + '\n' + clean(footerSource) + '\n' + clean(floatingSource) + '\n' + inspectionModal;
  write('lp-' + number + '/index.html', document('Santa Chimney | LP ' + number + ' ' + service + ' staging', contents, true));
}
write('index.html', document('Santa Chimney | Landing page staging', `<main class="sc-staging-preview"><section class="sc-staging-preview__section">
  <p class="sc-staging-preview__eyebrow">Santa Chimney · Ads landing pages</p>
  <h1>Landing page staging</h1>
  <p>Review the supplied components and each landing page as it is assembled.</p>
  <ul class="sc-staging-preview__variants">
    <li><a href="lp-1/">LP 1 · Chimney Repair</a> · Approved repair page. Staging preview only.</li>
    <li><a href="lp-2/">LP 2 · Chimney Cleaning &amp; Sweep</a> · Cleaning-focused template with three supplied before/after photo pairs.</li>
    <li><a href="lp-3/">LP 3 · Chimney Inspections</a> · Inspection-focused template with five hero photos and three inspection photo cards.</li>
    <li>LP 4 · Awaiting supplied page code.</li>
  </ul>
  <p>Preview forms do not submit leads. These pages are for development review.</p>
</section></main>`));
write('assets/css/shared.css', ['shared.css', 'cleaning.css', 'inspection.css', 'footer.css', 'floating-actions.css'].map(file => read('src/styles/' + file)).join('\n\n'));
write('assets/css/preview.css', read('src/styles/preview.css'));
for (const file of ['header.js', 'voucher-modal.js', 'preview-forms.js', 'service-stats.js', 'comparison.js', 'google-reviews.js', 'hero-slideshow.js']) write('assets/js/' + file, read('src/scripts/' + file));
write('wordpress/header-and-popup.gutenberg.html', headerSource + '\n' + modalSource);
console.log('Built LP 1 Repair, separate LP 2 Cleaning and LP 3 Inspections previews, dashboard and assets.');
