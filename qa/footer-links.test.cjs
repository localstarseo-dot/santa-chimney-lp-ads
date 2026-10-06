const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const read = file => fs.readFileSync(path.resolve(__dirname, '..', file), 'utf8');
const footer = html => html.match(/<footer class="sc-ads-footer"[\s\S]*?<\/footer>/)[0];
const expected = footer(read('src/components/footer.html'));
const links = [
  ['guarantee', 'Guarantee'],
  ['privacy-policy', 'Privacy Policy'],
  ['disclaimer', 'Disclaimer']
];

for (const number of [1, 2, 3]) {
  const actual = footer(read(`lp-${number}/index.html`));
  assert.equal(actual, expected, `LP ${number} must use the updated shared footer`);
  const navigation = actual.match(/<nav class="sc-ads-footer__links"[\s\S]*?<\/nav>/)[0];
  assert.ok(navigation.includes('aria-label="Guarantee and policies"'));
  for (const [slug, label] of links) {
    const link = `<a href="https://www.santachimneys.com/${slug}/">${label}</a>`;
    assert.equal(navigation.split(link).length - 1, 1, `LP ${number} has one ${label} link`);
  }
  assert.ok(actual.includes('Copyright © 2026'));
  assert.ok(actual.includes('id="request-service"'));
  for (const group of ['reviews', 'trust', 'payments']) {
    assert.ok(actual.includes(`sc-ads-footer__${group}`), `LP ${number} retains ${group}`);
  }
}

console.log('All three landing pages share the supplied Guarantee, Privacy Policy and Disclaimer links');
