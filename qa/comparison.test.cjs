const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

// Isolated interaction checks. Browser layout and native keyboard behavior are
// checked separately; this fixture does not pretend to be a real touch device.
function element() {
  const listeners = new Map();
  return {
    listeners,
    addEventListener(name, callback) {
      const callbacks = listeners.get(name) || [];
      callbacks.push(callback);
      listeners.set(name, callbacks);
    },
    emit(name, values = {}) {
      const event = { pointerId: 1, isPrimary: true, button: 0, clientX: 200, clientY: 100, prevented: false, preventDefault() { this.prevented = true; }, ...values };
      for (const callback of listeners.get(name) || []) callback(event);
      return event;
    }
  };
}
function comparison(pending = true) {
  const stage = element();
  const captures = new Set();
  stage.getBoundingClientRect = () => ({ left: 100, width: 400 });
  stage.setPointerCapture = id => captures.add(id);
  stage.hasPointerCapture = id => captures.has(id);
  stage.releasePointerCapture = id => captures.delete(id);
  const range = element();
  range.value = '50';
  range.attributes = {};
  range.setAttribute = (name, value) => { range.attributes[name] = value; };
  range.focus = options => { range.focusOptions = options; };
  const classes = new Set();
  return {
    stage, range,
    dataset: pending ? { scComparePending: 'true' } : {},
    style: { values: {}, setProperty(name, value) { this.values[name] = value; } },
    classList: { add: name => classes.add(name), remove: name => classes.delete(name), contains: name => classes.has(name) },
    querySelector: selector => selector === '.sc-ads-comparison__stage' ? stage : range
  };
}
const items = [comparison(), comparison(), comparison(false)];
const frames = new Map();
let nextFrame = 1;
const document = element();
document.readyState = 'loading';
document.querySelectorAll = () => items;
vm.runInNewContext(fs.readFileSync(path.resolve(__dirname, '../src/scripts/comparison.js'), 'utf8'), {
  document,
  window: {
    requestAnimationFrame(callback) { const id = nextFrame++; frames.set(id, callback); return id; },
    cancelAnimationFrame(id) { frames.delete(id); }
  }
});
document.emit('DOMContentLoaded');
function flush() { const work = [...frames.values()]; frames.clear(); work.forEach(callback => callback()); }
function position(item, expected) {
  assert.equal(item.range.value, String(expected));
  assert.equal(item.style.values['--compare-position'], expected + '%');
}
items.forEach(item => position(item, 50));
assert.match(items[0].range.attributes['aria-valuetext'], /photo placeholder/);
assert.match(items[2].range.attributes['aria-valuetext'], /before image/);
document.emit('DOMContentLoaded');
assert.equal(items[0].stage.listeners.get('pointerdown').length, 1, 'initialization must be idempotent');
const first = items[0];
first.range.value = '51'; first.range.emit('input'); position(first, 51);
first.range.value = '-10'; first.range.emit('input'); position(first, 0);
first.range.value = '120'; first.range.emit('input'); position(first, 100);
first.stage.emit('pointerdown', { clientX: 300 });
assert.equal(first.range.focusOptions.preventScroll, true);
const move = first.stage.emit('pointermove', { clientX: 350 });
first.stage.emit('pointermove', { clientX: 400 });
assert.equal(move.prevented, true);
assert.equal(frames.size, 1, 'coalesce moves into one animation frame');
flush(); position(first, 75);
assert.equal(first.classList.contains('is-dragging'), true, 'position updates before pointerup');
position(items[1], 50); position(items[2], 50);
first.stage.emit('pointerup', { clientX: 420 }); position(first, 80);
assert.equal(first.classList.contains('is-dragging'), false);
first.stage.emit('pointerdown', { clientX: 300, clientY: 100 });
first.stage.emit('pointermove', { clientX: 302, clientY: 120 });
first.stage.emit('pointermove', { clientX: 450, clientY: 121 });
flush(); first.stage.emit('pointerup', { clientX: 450 }); position(first, 80);
for (const reason of ['pointercancel', 'lostpointercapture']) {
  first.stage.emit('pointerdown', { clientX: 300 });
  first.stage.emit('pointermove', { clientX: 400 });
  first.stage.emit(reason); flush(); position(first, 80);
  assert.equal(first.classList.contains('is-dragging'), false);
}
for (const invalid of [{ button: 2 }, { isPrimary: false }]) {
  first.stage.emit('pointerdown', invalid);
  first.stage.emit('pointerup', { clientX: 500 }); position(first, 80);
}
first.stage.emit('pointerdown', { clientX: 300 });
first.stage.emit('pointerdown', { pointerId: 2, clientX: 200 });
first.stage.emit('pointermove', { pointerId: 2, clientX: 450 });
flush(); position(first, 80);
first.stage.emit('pointermove', { clientX: 700 }); flush(); position(first, 100);
first.stage.emit('pointerup', { clientX: 50 }); position(first, 0);
for (const pointerType of ['mouse', 'touch', 'pen']) {
  first.stage.emit('pointerdown', { pointerType, clientX: 300 });
  first.stage.emit('pointermove', { pointerType, clientX: 340 });
  flush(); position(first, 60);
  first.stage.emit('pointerup', { pointerType, clientX: 340 });
  first.stage.emit('pointerdown', { pointerType, clientX: 300, clientY: 100 });
  const scrollMove = first.stage.emit('pointermove', { pointerType, clientX: 302, clientY: 130 });
  assert.equal(scrollMove.prevented, false, pointerType + ' vertical movement must remain available');
  first.stage.emit('pointerup', { pointerType, clientX: 302, clientY: 130 });
  position(first, 60);
}
console.log('Comparison interaction: initialization, RAF live drag, independent controls, clamping, cancellation and mouse/touch/pen vertical-scroll guards passed');
