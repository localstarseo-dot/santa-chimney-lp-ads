const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const read = file => fs.readFileSync(path.resolve(__dirname, '..', file), 'utf8');
for (const [number, heading] of [[1, 'Chimney Repair in Austin, TX'], [2, 'Chimney Sweep &amp; Cleaning in Austin, TX'], [3, 'Chimney Inspections']]) {
  const html = read('lp-' + number + '/index.html');
  assert.match(html, new RegExp('<h1[^>]*>' + heading + '</h1>'));
  assert.doesNotMatch(html, /lp-redirect|http-equiv="refresh"/);
  assert.ok(read('index.html').includes('href="lp-' + number + '/"'));
}
const cleaning = read('lp-2/index.html');
for (const marker of ['sc-ppc-offer-bar', 'sc-ppc-nav', 'sc-ads-footer', 'forminator-module-4877', 'forminator-module-4914', 'id="request-service"']) {
  assert.ok(cleaning.includes(marker), 'LP 2 must reuse shared component: ' + marker);
}
assert.ok(cleaning.includes('href="#our-work"'));
assert.doesNotMatch(cleaning, /href="\.\.\/lp-1\/#our-work"/);
assert.ok(cleaning.includes('20% OFF CHIMNEY CLEANING &amp; SWEEP'));
assert.equal(cleaning.split('Get 20% OFF for Chimney Sweep').length - 1, 2, 'Desktop and mobile top bars must match');
assert.ok(cleaning.includes('<span class="sc-voucher-modal__amount">Get 20% OFF</span>'));
assert.ok(cleaning.includes('<span class="sc-voucher-modal__service">for Chimney Sweep</span>'));
assert.ok(cleaning.includes('sc_staging_lp_2_cleaning_offer_expiry_59m_v1'));
assert.doesNotMatch(cleaning, /\$99|CHIMNEY REPAIR|data-campaign="repair"|lp_1_repair_offer/);
const repair = read('lp-1/index.html');
assert.ok(repair.includes('$99 OFF CHIMNEY REPAIR'));
assert.ok(repair.includes('sc_staging_lp_1_repair_offer_expiry_59m_v1'));
assert.doesNotMatch(repair, /20% OFF|lp_2_cleaning_offer/);
console.log('Three independent LP routes; LP 2 shares header, navigation, footer and voucher plumbing');
