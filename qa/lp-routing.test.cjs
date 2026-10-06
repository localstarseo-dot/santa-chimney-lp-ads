const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const read = file => fs.readFileSync(path.resolve(__dirname, '..', file), 'utf8');
for (const [number, heading] of [[1, 'Chimney Repair in Austin, TX'], [2, 'Chimney Sweep &amp; Cleaning in Austin, TX'], [3, 'Austin Chimney Inspection Services']]) {
  const html = read('lp-' + number + '/index.html');
  assert.match(html, new RegExp('<h1[^>]*>' + heading + '</h1>'));
  assert.doesNotMatch(html, /lp-redirect|http-equiv="refresh"/);
  assert.ok(read('index.html').includes('href="lp-' + number + '/"'));
}
const cleaning = read('lp-2/index.html');
const inspection = read('lp-3/index.html');
for (const [number, html] of [[2, cleaning], [3, inspection]]) {
  for (const marker of ['sc-ppc-offer-bar', 'sc-ppc-nav', 'sc-ads-footer', 'sc-voucher-modal__mascot', 'forminator-module-4877', 'forminator-module-4914', 'id="request-service"']) {
    assert.ok(html.includes(marker), `LP ${number} must reuse shared component: ${marker}`);
  }
  assert.equal((html.match(/data-sc-preview-form/g) || []).length, 2, `LP ${number} keeps only the sticky and popup forms`);
}
assert.ok(cleaning.includes('href="#our-work"'));
assert.doesNotMatch(cleaning, /href="\.\.\/lp-1\/#our-work"/);
assert.ok(cleaning.includes('20% OFF CHIMNEY CLEANING &amp; SWEEP'));
assert.equal(cleaning.split('Get 20% OFF for Chimney Sweep').length - 1, 2, 'Desktop and mobile top bars must match');
assert.ok(cleaning.includes('<span class="sc-voucher-modal__amount">Get 20% OFF</span>'));
assert.ok(cleaning.includes('<span class="sc-voucher-modal__service">for Chimney Sweep</span>'));
assert.ok(cleaning.includes('sc_staging_lp_2_cleaning_offer_expiry_59m_v1'));
assert.doesNotMatch(cleaning, /\$99|CHIMNEY REPAIR|data-campaign="repair"|lp_1_repair_offer/);
assert.ok(inspection.includes('data-campaign="inspection" data-service="Chimney Inspection" data-offer="20% OFF"'));
assert.ok(inspection.includes('data-hero-selector="#home.sc-ads-hero"'));
assert.ok(inspection.includes('20% OFF CHIMNEY INSPECTION'));
assert.equal(inspection.split('Get 20% OFF Chimney Inspection').length - 1, 2, 'LP 3 desktop and mobile top bars must match');
assert.ok(inspection.includes('<span class="sc-voucher-modal__amount">Get 20% OFF</span>'));
assert.ok(inspection.includes('<span class="sc-voucher-modal__service">Chimney Inspection</span>'));
assert.ok(inspection.includes('sc_staging_lp_3_inspection_offer_expiry_59m_v1'));
assert.doesNotMatch(inspection, /\$99|CHIMNEY REPAIR|CHIMNEY CLEANING|data-campaign="(?:repair|cleaning)"|lp_[12]_(?:repair|cleaning)_offer/);
for (const id of ['home', 'our-work', 'request-service']) assert.ok(inspection.includes(`id="${id}"`));
const footer = html => html.match(/<footer class="sc-ads-footer"[\s\S]*?<\/footer>/)[0];
assert.equal(footer(inspection), footer(cleaning), 'LP 3 uses the exact approved global footer');
assert.doesNotMatch(inspection, /data-sc-preview-open|data-sc-preview-reset/);
const repair = read('lp-1/index.html');
assert.ok(repair.includes('$99 OFF CHIMNEY REPAIR'));
assert.ok(repair.includes('sc_staging_lp_1_repair_offer_expiry_59m_v1'));
assert.doesNotMatch(repair, /20% OFF|lp_2_cleaning_offer/);
console.log('Three independent LP routes; LP 2 and LP 3 share approved globals with independent service offers and voucher state');
