const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');

function element(initial = []) {
  const classes = new Set(initial);
  const listeners = new Map();
  return {
    dataset: {}, attributes: {}, hidden: false,
    classList: {
      add: value => classes.add(value), remove: value => classes.delete(value),
      contains: value => classes.has(value),
      replace(from, to) { classes.delete(from); classes.add(to); }
    },
    addEventListener(name, callback) {
      if (!listeners.has(name)) listeners.set(name, []);
      listeners.get(name).push(callback);
    },
    emit(name) { (listeners.get(name) || []).forEach(callback => callback()); },
    getAttribute(name) { return this[name] || this.attributes[name] || null; },
    setAttribute(name, value) { this.attributes[name] = value; }
  };
}

const body = element();
const slides = Array.from({ length: 5 }, (_, index) => {
  const slide = element(index === 0 ? ['is-active'] : []);
  slide.dataset.src = 'photo-' + index;
  if (index === 0) slide.src = slide.dataset.src;
  slide.complete = true;
  slide.naturalWidth = 1448;
  return slide;
});
const hero = {};
const background = element();
background.closest = () => hero;
background.querySelectorAll = () => slides;
const document = element();
document.readyState = 'complete';
document.body = body;
document.querySelector = () => background;
const motion = element();
motion.matches = false;
const timers = new Map();
let nextId = 1;
let intersection;
let bodyObserver;
const window = element();
window.matchMedia = () => motion;
window.setTimeout = (callback, delay) => { const id = nextId++; timers.set(id, { callback, delay }); return id; };
window.clearTimeout = id => timers.delete(id);
window.IntersectionObserver = class { constructor(callback) { intersection = callback; } observe() {} };
const source = fs.readFileSync(path.resolve(__dirname, '../src/scripts/hero-slideshow.js'), 'utf8');
const context = {
  window, document,
  IntersectionObserver: window.IntersectionObserver,
  MutationObserver: class { constructor(callback) { bodyObserver = callback; } observe() {} }
};
function advanceTimer(delay) {
  const found = [...timers].find(([, timer]) => timer.delay === delay);
  assert.ok(found, 'Expected scheduled timer: ' + delay);
  timers.delete(found[0]); found[1].callback();
}
function playTimers() { return [...timers.values()].filter(timer => timer.delay === 3000).length; }
vm.runInNewContext(source, context);
assert.equal(background.dataset.scHeroReady, 'true');
assert.equal(slides[1].src, 'photo-1', 'prefetch only the next photo');
assert.equal(slides[2].src, undefined);
assert.equal(playTimers(), 1);
for (const expected of [1, 2, 3, 4, 0]) {
  advanceTimer(3000);
  assert.equal(background.dataset.scHeroIndex, String(expected));
  assert.equal(slides.filter(slide => slide.classList.contains('is-active')).length, 1);
  assert.equal(slides.filter(slide => slide.classList.contains('is-leaving')).length, 1);
  advanceTimer(1050);
  assert.equal(slides.filter(slide => slide.classList.contains('is-leaving')).length, 0);
}
document.hidden = true; document.emit('visibilitychange'); assert.equal(playTimers(), 0);
document.hidden = false; document.emit('visibilitychange'); assert.equal(playTimers(), 1);
intersection([{ isIntersecting: false }]); assert.equal(playTimers(), 0);
intersection([{ isIntersecting: true }]); assert.equal(playTimers(), 1);
body.classList.add('sc-voucher-modal-open'); bodyObserver(); assert.equal(playTimers(), 0);
body.classList.remove('sc-voucher-modal-open'); bodyObserver(); assert.equal(playTimers(), 1);
motion.matches = true; motion.emit('change'); assert.equal(playTimers(), 0);
motion.matches = false; motion.emit('change'); assert.equal(playTimers(), 1);
slides[1].complete = false; advanceTimer(3000);
assert.equal(background.dataset.scHeroIndex, '0', 'never transition to an unloaded photo');
slides[1].complete = true; slides[1].naturalWidth = 0; slides[1].emit('error');
advanceTimer(3000); assert.equal(background.dataset.scHeroIndex, '2', 'skip failed photos');
advanceTimer(1050);
vm.runInNewContext(source, context); assert.equal(playTimers(), 1, 'duplicate initialization must not add timers');
window.emit('pagehide'); assert.equal(timers.size, 0);
window.emit('pageshow'); assert.equal(playTimers(), 1);
console.log('Hero background: 3-second fade sequence, wrap, prefetch, visibility, popup, reduced motion, failed/unloaded photos, single initialization and cleanup passed');
