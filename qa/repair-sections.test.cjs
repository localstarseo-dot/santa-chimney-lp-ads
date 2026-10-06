const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const read = file => fs.readFileSync(path.resolve(__dirname, '..', file), 'utf8');
const source = read('src/pages/lp-1.html');
assert.ok(read('lp-1/index.html').includes(source.trim()), 'rebuild output from the editable body');
const section = id => source.match(new RegExp('<section\\b[^>]*id="' + id + '"[\\s\\S]*?<\\/section>'))?.[0] || '';
const anchors = html => [...html.matchAll(/<a\b[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/g)]
  .map(([, href, text]) => [href, text.replace(/<span[^>]*>[\s\S]*?<\/span>/g, '').replace(/\s+/g, ' ').trim()]);

const proof = section('scs-service-stats');
assert.match(proof, /data-scs-counter-group/);
assert.match(proof, /data-scs-end="874" data-scs-suffix="\+">874\+<\/strong>/);
assert.match(proof, /data-scs-end="20" data-scs-suffix="\+">20\+<\/strong>/);
assert.doesNotMatch(proof, /sc-repair-proof__credentials|Service credentials|<img\b/, 'removed experience credential strip must not return');
const heroBadges = section('home').match(/<ul class="sc-ads-trust__badges"[\s\S]*?<\/ul>/)?.[0] || '';
const footerBadges = read('src/components/footer.html').match(/<ul class="sc-ads-footer__trust"[\s\S]*?<\/ul>/)?.[0] || '';
assert.equal((heroBadges.match(/<img /g) || []).length, 4, 'hero credentials stay unchanged');
assert.equal((footerBadges.match(/<img /g) || []).length, 4, 'footer credentials stay unchanged');

const directory = section('repair-services');
assert.doesNotMatch(directory, /sc-repair-section--cream/);
const [primary, allServices] = directory.split('<details class="sc-repair-all-services"');
const originalRepairLinks = allServices.match(/<ul class="sc-repair-link-grid">[\s\S]*?<\/ul>/)?.[0];
assert.deepEqual(anchors(primary), anchors(originalRepairLinks), 'all 24 labels and destinations preserved in order');
assert.equal(anchors(primary).length, 24);
const groups = [...primary.matchAll(/<details class="sc-repair-service-group"([^>]*)>([\s\S]*?)<\/details>/g)];
assert.equal(groups.length, 4);
assert.deepEqual(groups.map(([, , body]) => anchors(body).length), [8, 7, 3, 5]);
assert.deepEqual(groups.map(([, attrs]) => /\bopen\b/.test(attrs)), [true, false, false, false]);
assert.doesNotMatch(allServices.slice(0, allServices.indexOf('>')), /\bopen\b/);
for (const [, , body] of groups) {
  assert.match(body, /<summary><h3>/);
  assert.match(body, /sc-repair-service-group__toggle" aria-hidden="true"/);
}

const reviews = section('scs-reviews');
const header = reviews.match(/<header class="scs-google-reviews__header">[\s\S]*?<\/header>/)?.[0] || '';
assert.match(header, /4\.9 Google Rating/);
assert.match(header, /View Google Reviews/);
assert.equal((reviews.match(/View Google Reviews/g) || []).length, 1);
assert.doesNotMatch(reviews, /data-scs-reviews-pause|scs-google-reviews__disclosure|scs-google-reviews__mobile-hint|Reviews move automatically/);
assert.match(reviews, /scs-google-reviews__viewport"[^>]*tabindex="0"/);
const css = read('src/styles/shared.css');
assert.match(css, /\.sc-repair-directory \{[^}]*background: #1c1c1c/);
assert.match(css, /#scs-reviews\.sc-repair-reviews \{[^}]*--scs-reviews-bg: #1c1c1c;/);
assert.match(css, /#scs-reviews\.sc-repair-reviews \.scs-google-reviews__card \{[^}]*--scs-reviews-panel: #ffffff;[^}]*--scs-reviews-panel-hover: #ffffff;[^}]*--scs-reviews-text: #111619;/);
assert.match(css, /\.scs-google-reviews__viewport:is\(:focus-within, :active\)[^}]*animation-play-state: paused/);
console.log('Repair sections: statistics, removed experience credential strip, retained hero/footer badges, all 24 links, native groups and reviews passed');
