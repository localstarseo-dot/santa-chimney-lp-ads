const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const read = file => fs.readFileSync(path.resolve(__dirname, '..', file), 'utf8');

for (const [number, service] of [[1, 'repair'], [2, 'cleaning'], [3, 'inspection']]) {
  const html = read(`lp-${number}/index.html`);
  const nav = html.match(/<nav class="sc-ppc-links"[\s\S]*?<\/nav>/)[0];
  const links = [...nav.matchAll(/<a href="([^"]+)">\s*([^<]+?)\s*<\/a>/g)]
    .map(([, href, label]) => [href, label.trim()]);
  assert.deepEqual(links, [
    ['#our-work', 'Our Work'],
    [`#${service}-services`, 'Services'],
    [`#${service}-questions`, 'FAQs']
  ], `LP ${number} uses the same three navigation labels with its own section targets`);
  assert.doesNotMatch(nav, /Home|Contact Us|sc-ppc-home-link/);
  assert.ok(nav.includes('aria-label="Landing page navigation"'));
  for (const [href] of links) {
    assert.match(html, new RegExp(`<section\\b[^>]*id="${href.slice(1)}"`), `LP ${number} contains ${href}`);
  }
  assert.ok(html.includes('class="sc-ppc-logo" href="#home"'), 'The approved logo still returns to the hero');
}

assert.doesNotMatch(read('src/styles/shared.css'), /sc-ppc-home-link/);
console.log('LP 1, LP 2 and LP 3 navigation: Our Work, Services and FAQs target the current page sections');
