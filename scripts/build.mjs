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
</head>
<body class="sc-staging-site" data-sc-staging="true">
${body}
</body>
</html>
`;

write('lp-1/index.html', document('Santa Chimney | LP 1 component preview', header + '\n' + read('src/pages/lp-1.html') + '\n' + clean(footerSource) + '\n' + clean(floatingSource) + '\n' + modal, true));
write('index.html', document('Santa Chimney | Landing page staging', `<main class="sc-staging-preview"><section class="sc-staging-preview__section">
  <p class="sc-staging-preview__eyebrow">Santa Chimney · Ads landing pages</p>
  <h1>Landing page staging</h1>
  <p>Review the supplied components and each landing page as it is assembled.</p>
  <ul class="sc-staging-preview__variants">
    <li><a href="lp-1/">LP 1</a> · Header, sticky voucher form, popup, footer, and floating actions preview. Page body pending.</li>
    <li>LP 2 · Awaiting supplied page code.</li>
    <li>LP 3 · Awaiting supplied page code.</li>
    <li>LP 4 · Awaiting supplied page code.</li>
  </ul>
  <p>Preview forms do not submit leads. These pages are for development review.</p>
</section></main>`));
write('assets/css/shared.css', ['shared.css', 'footer.css', 'floating-actions.css'].map(file => read('src/styles/' + file)).join('\n\n'));
write('assets/css/preview.css', read('src/styles/preview.css'));
for (const file of ['header.js', 'voucher-modal.js', 'preview-forms.js']) write('assets/js/' + file, read('src/scripts/' + file));
write('wordpress/header-and-popup.gutenberg.html', headerSource + '\n' + modalSource);
console.log('Built staging dashboard, LP 1 global components, and shared assets.');
