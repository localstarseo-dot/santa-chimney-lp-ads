const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const read = file => fs.readFileSync(path.resolve(__dirname, '..', file), 'utf8');
const source = read('src/pages/lp-2.html');
const built = read('lp-2/index.html');
const reference = read('src/pages/lp-1.html');
const sections = [...source.matchAll(/<section\b[^>]*\bid="([^"]+)"/g)].map(m => m[1]);
assert.deepEqual(sections, ['home', 'cleaning-problems', 'our-work', 'scs-service-stats', 'scs-reviews', 'cleaning-process', 'cleaning-services', 'cleaning-questions']);
assert.equal((reference.match(/<section\b/g) || []).length, sections.length, 'Reuse LP 1 section count and sequence');
const hero = source.match(/<section id="home"[\s\S]*?<\/section>/)[0];
for (const name of ['03-soot-creosote-vacuum-cleaning.webp', '01-chimney-sweeping-fireplace.webp', '02-flue-brush-cleaning.webp', '04-rooftop-chimney-sweeping.webp']) assert.ok(hero.includes(name));
assert.equal((hero.match(/class="sc-hero-slideshow__slide/g) || []).length, 4);
assert.ok(hero.includes('loading="eager" fetchpriority="high"'));
assert.equal((source.match(/class="sc-repair-problem" href="#our-work"/g) || []).length, 6);
const comparisons = [...source.matchAll(/<figure\b[\s\S]*?<\/figure>/g)].map(m => m[0]);
assert.equal(comparisons.length, 3);
for (const figure of comparisons) {
  assert.equal((figure.match(/data-photo-slot=/g) || []).length, 2);
  assert.ok(figure.includes('data-sc-compare-range'));
}
const photoPairs = [
  ['chimney-sweeping', '01-chimney-sweeping-before.png', '02-chimney-sweeping-after.png'],
  ['creosote-soot', '03-creosote-soot-before.png', '04-creosote-soot-after.png'],
  ['fireplace-flue', '05-fireplace-flue-before.png', '06-fireplace-flue-after.png']
];
for (const [index, [slug, before, after]] of photoPairs.entries()) {
  const figure = comparisons[index];
  assert.doesNotMatch(figure, /data-sc-compare-pending|Layout preview only|Coming soon|sc-repair-compare-placeholder/);
  const images = [...figure.matchAll(/<img\b[^>]*>/g)].map(m => m[0]);
  assert.equal(images.length, 2);
  for (const [sideIndex, side] of ['before', 'after'].entries()) {
    assert.ok(images[sideIndex].includes(`data-photo-slot="${slug}-${side}"`));
    assert.ok(images[sideIndex].includes(`src="https://www.santachimneys.com/wp-content/uploads/2026/10/${side === 'before' ? before : after}"`));
    assert.ok(images[sideIndex].includes('width="1200" height="900"'));
    assert.ok(images[sideIndex].includes('loading="lazy" decoding="async"'));
    assert.match(images[sideIndex], /alt="[^"\s][^"]+"/);
  }
  assert.ok(figure.includes('Compare before and after images for'));
}
assert.doesNotMatch(source.match(/<section[^>]*id="our-work"[\s\S]*?<\/section>/)[0], /coming soon|layout preview|data-sc-compare-pending/i);
assert.equal((built.match(/data-sc-compare-pending/g) || []).length, 0);
assert.equal((built.match(/data-photo-slot=/g) || []).length, 6);
const stats = source.match(/<section[^>]*id="scs-service-stats"[\s\S]*?<\/section>/)[0];
assert.equal((stats.match(/data-scs-counter /g) || []).length, 4);
assert.equal(stats, reference.match(/<section[^>]*id="scs-service-stats"[\s\S]*?<\/section>/)[0], 'LP 2 reuses the full LP 1 experience section');
const reviewSection = source.match(/<section[^>]*id="scs-reviews"[\s\S]*?<\/section>/)[0];
assert.equal((reviewSection.match(/class="scs-google-reviews__card"/g) || []).length, 6);
for (const name of ['Betty', 'I. Glatthorn', 'J. Bontke', 'N. Kuyer', 'P. Newman', 'A. Gleizer']) assert.ok(reviewSection.includes(name));
assert.ok(reviewSection.includes('What Austin-Area Homeowners Say'));
assert.ok(reviewSection.includes('data-scs-reviews-autoplay'));
assert.doesNotMatch(source, /sc-repair-final|sc-staging-preview|before-chimney-flashing|after-chimney-crown/);
assert.equal((built.match(/data-sc-preview-form/g) || []).length, 2);
assert.ok(built.includes('Get 20% OFF for Chimney Sweep'));
assert.doesNotMatch(built, /\$99/);
assert.doesNotMatch(source, /<details[^>]*id="all-services"[^>]*\sopen(?:\s|>)/);
console.log('LP 2 cleaning: approved section layout, supplied hero/icons, all three supplied comparison pairs, full LP 1 stats, all six supplied reviews, independent offer and shared globals passed');
