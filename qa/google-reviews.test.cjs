const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const source = fs.readFileSync(path.resolve(__dirname, '../src/scripts/google-reviews.js'), 'utf8');
function element(attributes = {}) {
  const classes = new Set();
  const listeners = new Map();
  return {
    attributes: { ...attributes }, dataset: {}, hidden: false, textContent: '',
    classList: {
      add(...values) { values.forEach(value => classes.add(value)); },
      remove(...values) { values.forEach(value => classes.delete(value)); },
      contains(value) { return classes.has(value); },
      toggle(value, enabled) {
        const next = enabled === undefined ? !classes.has(value) : enabled;
        if (next) classes.add(value); else classes.delete(value);
      }
    },
    hasAttribute(name) { return Object.hasOwn(this.attributes, name); },
    setAttribute(name, value) { this.attributes[name] = value; },
    getAttribute(name) { return this.attributes[name] ?? null; },
    removeAttribute(name) { delete this.attributes[name]; },
    addEventListener(name, callback) {
      if (!listeners.has(name)) listeners.set(name, []);
      listeners.get(name).push(callback);
    },
    emit(name) { (listeners.get(name) || []).forEach(callback => callback()); }
  };
}

function fixture({ autoplay = true, mobile = false, reduced = false, staticReviews = false, intersectionAvailable = true, controls = true } = {}) {
  const section = element({
    ...(autoplay ? { 'data-scs-reviews-autoplay': '' } : {}),
    ...(staticReviews ? { 'data-scs-reviews-static': '' } : {})
  });
  const track = element();
  track.children = [];
  track.appendChild = child => {
    track.children.push(child);
    child.remove = () => track.children.splice(track.children.indexOf(child), 1);
  };
  const original = element({ 'data-scs-reviews-group': '', role: 'list', id: 'original-list' });
  original.cloneNode = () => {
    const clone = element(original.attributes);
    clone.link = element({ id: 'review-link', tabindex: '0' });
    clone.querySelectorAll = selector => selector === '[id]' ? [clone.link] : [clone.link];
    return clone;
  };
  const viewport = element();
  const hint = element();
  const pause = element();
  const selectors = {
    '[data-scs-reviews-track]': track,
    '[data-scs-reviews-group]': original,
    '.scs-google-reviews__viewport': viewport,
    '.scs-google-reviews__mobile-hint': controls ? hint : null,
    '[data-scs-reviews-pause]': controls ? pause : null
  };
  section.querySelector = selector => selectors[selector];
  const document = element();
  document.getElementById = () => section;
  const motion = element();
  motion.matches = reduced;
  const manual = element();
  manual.matches = mobile;
  let idle;
  let intersection;
  const window = {
    matchMedia: query => query.includes('reduced-motion') ? motion : manual,
    requestIdleCallback: callback => { idle = callback; }
  };
  class Observer {
    constructor(callback) { this.callback = callback; intersection = this; }
    observe() { this.callback([{ isIntersecting: true }]); }
    unobserve() {}
    disconnect() { this.disconnected = true; }
  }
  if (intersectionAvailable) window.IntersectionObserver = Observer;
  const context = { document, window, IntersectionObserver: Observer };
  vm.runInNewContext(source, context);
  idle();
  return { section, track, viewport, hint, pause, document, motion, manual, context,
    get observer() { return intersection; } };
}

for (const mobile of [false, true]) {
  const f = fixture({ mobile });
  assert.equal(f.track.children.length, 1, 'exactly one seamless clone at either width');
  const clone = f.track.children[0];
  assert.equal(clone.getAttribute('aria-hidden'), 'true');
  assert.equal(clone.hasAttribute('inert'), true);
  assert.equal(clone.hasAttribute('data-scs-reviews-group'), false);
  assert.equal(clone.hasAttribute('role'), false);
  assert.equal(clone.hasAttribute('id'), false);
  assert.equal(clone.link.hasAttribute('id'), false);
  assert.equal(clone.link.getAttribute('tabindex'), '-1');
  assert.equal(f.pause.hidden, false);
  assert.equal(f.pause.textContent, 'Pause reviews');
  assert.equal(f.section.classList.contains('scs-google-reviews--in-view'), true);
  f.pause.emit('click');
  assert.equal(f.section.classList.contains('scs-google-reviews--paused'), true);
  assert.equal(f.pause.getAttribute('aria-pressed'), 'true');
  assert.equal(f.pause.textContent, 'Resume reviews');
  f.manual.matches = !mobile;
  f.manual.emit('change');
  assert.equal(f.track.children.length, 1, 'resize must not restart or duplicate autoplay');
  assert.equal(f.track.children[0], clone);
  f.motion.matches = true;
  f.motion.emit('change');
  assert.equal(f.track.children.length, 0, 'reduced motion removes clone');
  assert.equal(f.pause.hidden, true);
  assert.equal(f.section.classList.contains('scs-google-reviews--enhanced'), false);
  assert.match(f.hint.textContent, /Swipe or scroll/);
  f.motion.matches = false;
  f.motion.emit('change');
  assert.equal(f.track.children.length, 1);
  assert.equal(f.section.classList.contains('scs-google-reviews--paused'), true, 'manual pause survives motion preference changes');
  f.pause.emit('click');
  assert.equal(f.section.classList.contains('scs-google-reviews--paused'), false);
  f.observer.callback([{ isIntersecting: false }]);
  assert.equal(f.section.classList.contains('scs-google-reviews--in-view'), false);
  f.observer.callback([{ isIntersecting: true }]);
  f.document.hidden = true;
  f.document.emit('visibilitychange');
  assert.equal(f.section.classList.contains('scs-google-reviews--in-view'), false);
  f.document.hidden = false;
  f.document.emit('visibilitychange');
  assert.equal(f.section.classList.contains('scs-google-reviews--in-view'), true);
  vm.runInNewContext(source, f.context);
  assert.equal(f.track.children.length, 1, 'single initialization guard');
}
for (const options of [{ reduced: true }, { staticReviews: true }, { intersectionAvailable: false }]) {
  const f = fixture(options);
  assert.equal(f.track.children.length, 0);
  assert.equal(f.pause.hidden, true);
}
const legacy = fixture({ autoplay: false, mobile: true });
assert.equal(legacy.track.children.length, 0, 'preserve legacy mobile manual-scroll mode');
legacy.manual.matches = false;
legacy.manual.emit('change');
assert.equal(legacy.track.children.length, 1);

for (const mobile of [false, true]) {
  const withoutControls = fixture({ mobile, controls: false });
  assert.equal(withoutControls.track.children.length, 1, 'LP 1 loops without visible controls');
  assert.match(withoutControls.viewport.getAttribute('aria-label'), /Focus or press and hold/);
  assert.doesNotMatch(withoutControls.viewport.getAttribute('aria-label'), /button/);
  withoutControls.motion.matches = true;
  withoutControls.motion.emit('change');
  assert.equal(withoutControls.track.children.length, 0);
  assert.match(withoutControls.viewport.getAttribute('aria-label'), /Scroll to read more/);
}

const css = fs.readFileSync(path.resolve(__dirname, '../src/styles/shared.css'), 'utf8');
assert.match(css, /@keyframes scs-repair-reviews-marquee\s*\{\s*from\s*\{\s*transform: translate3d\(0, 0, 0\);\s*\}\s*to\s*\{\s*transform: translate3d\(-50%, 0, 0\);/);
const reviews = html => new Map([...html.matchAll(/<article class="scs-google-reviews__card"[^>]*aria-label="([^"]+)"[\s\S]*?<blockquote>\s*<p>([\s\S]*?)<\/p>[\s\S]*?<\/article>/g)]
  .map(match => [match[1], match[2].replace(/\s+/g, ' ').trim()]));
const supplied = reviews(fs.readFileSync(path.resolve(__dirname, '../sources/supplied-google-reviews.html'), 'utf8'));
const current = reviews(fs.readFileSync(path.resolve(__dirname, '../src/pages/lp-1.html'), 'utf8'));
assert.equal(current.size, 3);
for (const [label, quote] of current) assert.equal(quote, supplied.get(label), 'preserve supplied quote: ' + label);
const cleaning = reviews(fs.readFileSync(path.resolve(__dirname, '../src/pages/lp-2.html'), 'utf8'));
assert.equal(cleaning.size, supplied.size, 'LP 2 includes the entire supplied review set');
for (const [label, quote] of cleaning) assert.equal(quote, supplied.get(label), 'preserve supplied LP 2 quote: ' + label);
console.log('Reviews: desktop/mobile autoplay, one inert clone, optional controls, control-free labels, resize, visibility, reduced motion, fallbacks, right-to-left keyframes and original quotes passed');
