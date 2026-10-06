const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const read = file => fs.readFileSync(path.resolve(__dirname, '..', file), 'utf8');
const source = read('src/pages/lp-3.html');
const built = read('lp-3/index.html');
const reference = read('src/pages/lp-2.html');
const section = (html, id) => [...html.matchAll(/<section\b[^>]*>[\s\S]*?<\/section>/g)].map(m => m[0]).find(s => s.includes(`id="${id}"`));
const sections = [...source.matchAll(/<section\b[^>]*\bid="([^"]+)"/g)].map(m => m[1]);
assert.deepEqual(sections, ['home', 'inspection-problems', 'our-work', 'scs-service-stats', 'scs-reviews', 'inspection-process', 'inspection-services', 'inspection-questions']);
assert.equal((reference.match(/<section\b/g) || []).length, sections.length, 'Keep the approved eight-section flow');
const hero = section(source, 'home');
const images = [...hero.matchAll(/<img class="sc-hero-slideshow__slide[^>]*>/g)].map(m => m[0]);
const photos = [
  ['01-fireplace-inspection.png', 510, 510],
  ['02-video-chimney-inspection.png', 508, 510],
  ['03-rooftop-chimney-inspection.png', 510, 510],
  ['04-flue-inspection.png', 766, 510],
  ['05-inspection-findings-report.png', 766, 510]
];
assert.equal(images.length, photos.length);
for (const [i, [name, width, height]] of photos.entries()) {
  assert.ok(images[i].includes(`${i === 0 ? ' src' : ' data-src'}="https://www.santachimneys.com/wp-content/uploads/2026/10/${name}"`));
  assert.ok(images[i].includes(`width="${width}" height="${height}"`));
  if (i === 0) assert.ok(images[i].includes('loading="eager" fetchpriority="high"'));
  else assert.doesNotMatch(images[i], /\ssrc=/, 'Later slides load one ahead, not all eagerly');
}
assert.ok(hero.includes('Book Chimney Inspection'));
assert.ok(hero.includes('sc-ads-trust__credentials-row'));
assert.equal((hero.match(/class="sc-ads-trust__platform /g) || []).length, 2);
const chooser = section(source, 'inspection-problems');
assert.equal((chooser.match(/class="sc-repair-problem" href="#our-work"/g) || []).length, 6);
for (const icon of ['chimney_inspection_magnifier_icon.png', 'video_chimney_inspection_icon.png', 'chimney_flue_inspection_icon.png', 'fireplace_inspection_magnifier_icon.png', 'roof_chimney_inspection_icon.png', 'chimney_inspection_report_icon.png']) assert.ok(chooser.includes(icon));
const work = section(source, 'our-work');
const figures = [...work.matchAll(/<figure\b[\s\S]*?<\/figure>/g)].map(m => m[0]);
assert.equal(figures.length, 3);
for (const [i, figure] of figures.entries()) {
  assert.equal((figure.match(/<img\b/g) || []).length, 1);
  assert.ok(figure.includes(photos[i][0]));
  assert.ok(figure.includes('loading="lazy" decoding="async"'));
  assert.match(figure, /alt="[^"\s][^"]+"/);
}
assert.doesNotMatch(source, /data-sc-ads-component="before-after"|data-sc-compare-range|type="range"|sc-ads-comparison__|>Before<|>After</);
assert.equal((work.match(/sc-repair-project__cta/g) || []).length, 3);
const stats = section(source, 'scs-service-stats');
assert.equal((stats.match(/data-scs-counter /g) || []).length, 2);
assert.ok(stats.includes('data-scs-end="831"'));
assert.ok(stats.includes('data-scs-end="20" data-scs-suffix="+"'));
assert.doesNotMatch(stats, /1478|874|sc-repair-badges/);
const reviews = section(source, 'scs-reviews');
const cards = html => [...html.matchAll(/<article class="scs-google-reviews__card"[\s\S]*?<\/article>/g)].map(m => m[0]);
assert.deepEqual(cards(reviews), cards(section(reference, 'scs-reviews')).slice(0, 3), 'Keep the three supplied inspection-relevant excerpts unchanged');
assert.ok(reviews.includes('data-scs-reviews-autoplay'));
assert.ok(reviews.includes('4.9 Google Rating'));
const directory = section(source, 'inspection-services');
assert.equal((directory.split('<details')[0].match(/<li>/g) || []).length, 7);
for (const suffix of ['', 'level-2/', 'home-buyers/']) assert.ok(directory.includes(`href="https://www.santachimneys.com/services/chimney-inspections/${suffix}"`));
assert.doesNotMatch(directory, /<details[^>]*id="all-services"[^>]*\sopen(?:\s|>)/);
assert.equal((section(source, 'inspection-questions').match(/<details>/g) || []).length, 6);
assert.doesNotMatch(source, /sc-repair-final|sc-staging-preview|coming soon|chimney-sweeping-before|chimney-flashing-repair|Body content pending/i);
assert.ok(built.includes('Get 20% OFF Chimney Inspection'));
assert.ok(built.includes('sc_staging_lp_3_inspection_offer_expiry_59m_v1'));
assert.equal((built.match(/data-sc-preview-form/g) || []).length, 2);
console.log('LP 3 inspection: approved flow, five supplied hero photos, six icons, three photo-only cards, two inspection statistics, unchanged review excerpts and independent offer passed');
