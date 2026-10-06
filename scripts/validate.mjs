import { readFileSync, existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
for (const page of ['index.html', 'lp-1/index.html', 'lp-2/index.html', 'lp-3/index.html']) {
  const file = resolve(root, page);
  const html = readFileSync(file, 'utf8');
  const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map(match => match[1]);
  const duplicates = ids.filter((id, index) => ids.indexOf(id) !== index);
  if (duplicates.length) throw new Error('Duplicate IDs in ' + page + ': ' + duplicates.join(', '));
  if (/\[forminator_form|<!--\s*\/?wp:|\{\{[^}]+\}\}/.test(html)) throw new Error('Unrendered source markup in ' + page);
  for (const [, link] of html.matchAll(/(?:href|src)="([^"]+)"/g)) {
    if (/^(https?:|tel:|mailto:|data:)/.test(link)) continue;
    if (link.startsWith('#')) {
      if (!ids.includes(link.slice(1))) throw new Error('Missing anchor ' + link + ' in ' + page);
      continue;
    }
    if (link.startsWith('/')) throw new Error('Root-relative URL breaks the Pages project path: ' + link);
    const [localPath, fragment] = link.split('#');
    const target = resolve(dirname(file), localPath);
    if (!existsSync(target)) throw new Error('Missing local file ' + link + ' in ' + page);
    if (fragment) {
      const targetHtml = readFileSync(localPath.endsWith('/') ? resolve(target, 'index.html') : target, 'utf8');
      if (!targetHtml.includes('id="' + fragment + '"')) throw new Error('Missing destination anchor ' + link);
    }
  }
  console.log(page + ': static markup, anchors, IDs, and local assets passed');
}
for (const file of ['header.js', 'voucher-modal.js', 'preview-forms.js', 'service-stats.js', 'comparison.js', 'google-reviews.js', 'hero-slideshow.js']) {
  const result = spawnSync(process.execPath, ['--check', resolve(root, 'assets/js', file)], { encoding: 'utf8' });
  if (result.status !== 0) throw new Error(result.stderr);
}
if (!existsSync(resolve(root, '.nojekyll'))) throw new Error('Missing .nojekyll');
const repairPage = readFileSync(resolve(root, 'lp-1/index.html'), 'utf8');
const requireMatch = (expression, message) => {
  if (!expression.test(repairPage)) throw new Error(message);
};
requireMatch(/<h1[^>]*>Chimney Repair in Austin, TX<\/h1>/, 'LP 1 must retain the repair-first H1');
const requiredAnchors = ['home', 'repair-problems', 'our-work', 'scs-service-stats', 'scs-reviews', 'repair-process', 'repair-services', 'repair-questions', 'request-service'];
for (const id of requiredAnchors) requireMatch(new RegExp('id="' + id + '"'), 'Missing repair page anchor: ' + id);
if ((repairPage.match(/data-photo-slot="/g) || []).length !== 6) throw new Error('Expected six paired comparison photo slots');
const heroBackground = repairPage.match(/<div class="sc-hero-slideshow"[\s\S]*?<\/div>/)?.[0] || '';
if ((heroBackground.match(/class="sc-hero-slideshow__slide/g) || []).length !== 5 || !/aria-hidden="true"/.test(heroBackground)) throw new Error('Expected five decorative hero background images');
for (const file of ['01-chimney-crown-repair.png', '02-chimney-flashing-repair.png', '03-firebox-fireplace-repair.png', '04-chimney-cap-repair-replacement.png', '05-chimney-masonry-repair.png']) {
  if (!heroBackground.includes('https://www.santachimneys.com/wp-content/uploads/2026/10/' + file)) throw new Error('Missing supplied hero photo: ' + file);
}
if (/data-sc-hero-pause|Pause photos|Play photos/.test(repairPage)) throw new Error('Removed hero pause button must not return');
if (/Photo coming soon/.test(repairPage)) throw new Error('Supplied hero photos must replace the placeholder');
const comparisons = [...repairPage.matchAll(/<figure class="sc-ads-comparison sc-repair-comparison"[\s\S]*?<\/figure>/g)].map(match => match[0]);
if (comparisons.length !== 3) throw new Error('Expected three repair before/after sliders');
const ourWork = repairPage.match(/<section class="sc-repair-section sc-repair-work"[\s\S]*?<\/section>/)?.[0] || '';
if (/class="sc-repair-index"/.test(ourWork)) throw new Error('Removed Our Work project numbers must not return');
if ((ourWork.match(/class="sc-repair-button sc-repair-project__cta" href="tel:\+15129370590"/g) || []).length !== 3) throw new Error('Expected three styled Our Work phone CTA buttons');
if (/Project details coming soon|sc-repair-project__pending/.test(ourWork)) throw new Error('Supplied project details must replace pending copy');
if ((ourWork.match(/class="sc-repair-project__details"/g) || []).length !== 3 || (ourWork.match(/<dt>Problem<\/dt>/g) || []).length !== 3 || (ourWork.match(/<dt>Repair<\/dt>/g) || []).length !== 3 || (ourWork.match(/<dt>Why it matters<\/dt>/g) || []).length !== 3 || (ourWork.match(/class="sc-repair-project__prompt"/g) || []).length !== 3) throw new Error('Each project requires its three-part summary and enquiry prompt');
for (const label of ['Get Help With a Chimney Leak', 'Ask About Masonry Repair', 'Request Fireplace Repair']) {
  if (!ourWork.includes('>' + label + ' <span aria-hidden="true">')) throw new Error('Missing supplied project CTA: ' + label);
}
if (!ourWork.includes('should be evaluated before the fireplace is used again')) throw new Error('Preserve the supplied firebox evaluation precaution');
const comparisonFiles = [
  ['01-before-chimney-flashing.png', '02-after-chimney-flashing.png'],
  ['03-before-chimney-crown-masonry.png', '04-after-chimney-crown-masonry.png'],
  ['05-before-liner-firebox-structural.png', '06-after-liner-firebox-structural.png']
];
for (const [index, comparison] of comparisons.entries()) {
  if (!/data-sc-ads-component="before-after"/.test(comparison) || /data-sc-compare-pending/.test(comparison)) throw new Error('Photo comparisons must retain their interaction without a pending-photo state');
  const images = [...comparison.matchAll(/<img\b[^>]*>/g)].map(match => match[0]);
  if ((comparison.match(/data-photo-slot="/g) || []).length !== 2 || images.length !== 2) throw new Error('Keep two supplied images per comparison');
  for (const [imageIndex, image] of images.entries()) {
    const url = 'https://www.santachimneys.com/wp-content/uploads/2026/10/' + comparisonFiles[index][imageIndex];
    if (!image.includes('src="' + url + '"') || !/width="1448" height="1086"/.test(image) || !/loading="lazy"/.test(image) || !/alt="[^"]+"/.test(image)) throw new Error('Supplied comparison image order, dimensions, loading and text alternatives must remain intact');
  }
  if (!/data-sc-compare-range/.test(comparison) || !/type="range"/.test(comparison) || !/value="50"/.test(comparison) || !/aria-describedby="/.test(comparison) || !/<label\b/.test(comparison)) throw new Error('Comparison requires a labelled range starting at 50 percent');
  if (/Photo coming soon|Photos coming soon|Layout preview only/.test(comparison)) throw new Error('Photo comparisons must no longer show placeholder captions');
}
if ((repairPage.match(/class="sc-repair-problem"/g) || []).length !== 6) throw new Error('Expected six repair problem cards');
if ((repairPage.match(/class="scs-google-reviews__card"/g) || []).length !== 3) throw new Error('Expected three repair-focused reviews');
requireMatch(/data-scs-reviews-autoplay/, 'Repair reviews must enable the requested automatic loop');
if (/data-scs-reviews-pause|scs-google-reviews__mobile-hint|scs-google-reviews__disclosure/.test(repairPage)) throw new Error('Removed review controls and notes must not return');
requireMatch(/class="sc-repair-reviews__summary"[\s\S]*?4\.9 Google Rating[\s\S]*?View Google Reviews[\s\S]*?<\/header>/, 'Review rating and link must be in the section header');
if (/data-scs-reviews-static/.test(repairPage)) throw new Error('The old static review modifier must not block autoplay');
if ((repairPage.match(/data-sc-preview-form/g) || []).length !== 2) throw new Error('Keep only the sticky and popup preview forms');
if (/<details[^>]*id="all-services"[^>]*\sopen(?:\s|>)/.test(repairPage)) throw new Error('All Services must start collapsed');
for (const removed of ['fireplace-additional-services', 'chimney-services']) {
  if (repairPage.includes('id="' + removed + '"')) throw new Error('Broad-service promotion remains in repair funnel: ' + removed);
}
if (/class="[^"]*sc-repair-final/.test(repairPage)) throw new Error('Removed final CTA section must not return');
if (/class="sc-repair-preview"/.test(repairPage)) throw new Error('Removed preview-control row must not return');
const footerMarkup = repairPage.match(/<footer class="sc-ads-footer"[\s\S]*?<\/footer>/)?.[0] || '';
if (!/id="request-service"/.test(footerMarkup)) throw new Error('Contact anchor must target the footer business details');
const footerReviews = footerMarkup.match(/class="sc-ads-footer__reviews"[\s\S]*?<\/div>/)?.[0] || '';
const footerBadges = footerMarkup.match(/class="sc-ads-footer__trust"[\s\S]*?<\/ul>/)?.[0] || '';
if ((footerReviews.match(/<img /g) || []).length !== 2 || (footerBadges.match(/<li>/g) || []).length !== 4) {
  throw new Error('Footer requires the approved two-platform/four-credential layout');
}
console.log('LP 1 repair wireframe, placeholders, reviews, and conversion structure passed');
console.log('Generated JavaScript and Pages configuration files passed');
