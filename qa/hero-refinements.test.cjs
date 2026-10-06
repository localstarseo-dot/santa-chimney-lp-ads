const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const read = file => fs.readFileSync(path.resolve(__dirname, '..', file), 'utf8');
const expectedCopy = [
  "Tell us what you're seeing and we'll help you determine the next step.",
  "Tell us what you're noticing and schedule your cleaning.",
  'Santa Chimney Sweep can inspect the issue and help you understand the next step. No need to diagnose it before calling.'
];

for (const number of [1, 2, 3]) {
  const source = read(`src/pages/lp-${number}.html`);
  const built = read(`lp-${number}/index.html`);
  const hero = source.match(/<section id="home"[\s\S]*?<\/section>/)[0];
  assert.ok(hero.includes('<p class="sc-ads-hero__eyebrow">Santa Chimney Sweeps</p>'));
  assert.ok(hero.includes(`<p class="sc-ads-hero__copy">${expectedCopy[number - 1]}</p>`));
  assert.ok(built.includes(hero));
  assert.doesNotMatch(hero, /Leaks, damaged masonry|Soot, creosote and debris|Not sure what condition your chimney/);
  assert.ok(hero.includes('sc-ads-trust__reviews'));
  assert.ok(hero.includes('sc-ads-trust__credentials-row'));
  assert.ok(hero.includes('sc-ads-hero__actions'));
}

const css = read('src/styles/shared.css');
assert.match(css, /\.sc-ads-trust__stars\s*\{\s*color: #ebb305;/);
assert.equal((css.match(/--scs-reviews-gold-text: #ebb305;/g) || []).length, 3, 'Base, dark summary and white review cards use the sampled gold');
assert.match(css, /\.sc-repair-reviews__summary p > span \{ color: var\(--scs-reviews-gold-text\)/);
assert.match(css, /\.sc-repair-hero \.sc-ads-hero__eyebrow \{[^}]*color: #ff4d4f;/);
assert.match(css, /\.sc-repair-hero \.sc-ads-hero__eyebrow::before,\s*\.sc-repair-hero \.sc-ads-hero__eyebrow::after \{ display: none; \}/);
const photos = read('src/styles/inspection.css');
assert.match(photos, /\.sc-inspection-page \.sc-inspection-photo \{[^}]*overflow: hidden;[^}]*border: 0;/);
assert.match(photos, /\.sc-inspection-page \.sc-inspection-photo img \{[^}]*object-fit: cover;[\s\S]*?transform: scale\(1\.03\);/);

console.log('All LP hero copy and red line-free labels, sampled Google star color and LP 3 photo edge crops passed');
