const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

// Isolated trigger/guard checks. Real dialog layout, keyboard focus and the
// served preview are verified separately in the browser.
const source = fs.readFileSync(path.resolve(__dirname, '../src/scripts/voucher-modal.js'), 'utf8');

function element() {
  const listeners = new Map();
  const attributes = new Map();
  const classes = new Set();
  return {
    dataset: {}, listeners,
    classList: {
      add: value => classes.add(value),
      remove: value => classes.delete(value),
      contains: value => classes.has(value),
      toggle(value, enabled) { enabled ? classes.add(value) : classes.delete(value); }
    },
    addEventListener(name, callback) {
      if (!listeners.has(name)) listeners.set(name, new Set());
      listeners.get(name).add(callback);
    },
    removeEventListener(name, callback) { listeners.get(name)?.delete(callback); },
    emit(name, values = {}) {
      const event = { type: name, target: this, preventDefault() {}, ...values };
      for (const callback of [...(listeners.get(name) || [])]) callback(event);
    },
    setAttribute(name, value) { attributes.set(name, value); },
    getAttribute(name) { return attributes.get(name); },
    querySelector() { return null; },
    querySelectorAll() { return []; },
    matches() { return false; },
    closest() { return null; }
  };
}

function fixture({ claimed = false, scrollY = 0, hidden = false } = {}) {
  const document = element();
  document.readyState = 'complete';
  document.hidden = hidden;
  document.body = element();
  document.documentElement = element();
  document.activeElement = document.body;
  document.body.focus = () => { document.activeElement = document.body; };
  const modal = element();
  const header = element();
  const close = element();
  close.focus = () => { document.activeElement = close; };
  const timer = { textContent: '59:00' };
  const config = { dataset: { expiryKey: 'test_offer', claimLabel: 'CLAIM MY VOUCHER' } };
  modal.querySelector = selector => ({
    '[data-sc-voucher-close]': close,
    '[data-sc-voucher-timer]': timer
  }[selector] || null);
  header.querySelector = selector => ({
    '[data-sc-ppc-config]': config,
    '[data-sc-timer]': timer
  }[selector] || null);
  document.querySelector = () => modal;
  document.getElementById = () => header;
  const timeouts = new Map();
  let nextTimeout = 1;
  const window = element();
  window.scrollY = scrollY;
  window.setTimeout = (callback, delay) => {
    const id = nextTimeout++;
    timeouts.set(id, { callback, delay });
    return id;
  };
  window.clearTimeout = id => timeouts.delete(id);
  window.requestAnimationFrame = callback => callback();
  const expiry = String(Date.now() + 3540000);
  const localValues = new Map([['test_offer', expiry]]);
  if (claimed) localValues.set('test_offer_claimed', expiry);
  vm.runInNewContext(source, {
    document, window,
    localStorage: {
      getItem: key => localValues.get(key) || null,
      setItem: (key, value) => localValues.set(key, value)
    },
    // Old seen/dismissed flags must not be read or written at all.
    sessionStorage: new Proxy({}, { get() { throw new Error('Unexpected sessionStorage access'); } }),
    MutationObserver: class { observe() {} disconnect() {} }
  });
  return {
    document, modal, header, close, window, timeouts,
    engage() { window.scrollY = 100; window.emit('scroll'); },
    flush() {
      const work = [...timeouts.values()];
      timeouts.clear();
      for (const item of work) { assert.equal(item.delay, 5000); item.callback(); }
    },
    open() { return modal.classList.contains('is-open'); }
  };
}

const page = fixture();
assert.equal(page.timeouts.size, 0, 'no invitation before engagement');
page.window.scrollY = 79; page.window.emit('scroll');
assert.equal(page.timeouts.size, 0);
page.engage(); page.engage();
assert.equal(page.timeouts.size, 1, 'repeated scrolling must not stack timers');
page.flush();
assert.equal(page.open(), true);
assert.equal(page.modal.getAttribute('aria-hidden'), 'false');
assert.equal(page.document.activeElement, page.close);
assert.equal(page.document.body.classList.contains('sc-voucher-modal-open'), true);
page.modal.emit('keydown', { key: 'Escape' });
assert.equal(page.open(), false);
assert.equal(page.document.activeElement, page.document.body);
assert.equal(page.document.body.classList.contains('sc-voucher-modal-open'), false);
page.engage(); page.document.emit('visibilitychange'); page.document.emit('focusout');
assert.equal(page.timeouts.size, 0, 'closing must suppress repeat invitations on this load');

const reload = fixture({ scrollY: 100 });
assert.equal(reload.timeouts.size, 1, 'a restored scroll position counts as engagement');
reload.flush(); assert.equal(reload.open(), true, 'a fresh load can reopen the popup');
reload.close.emit('click'); assert.equal(reload.open(), false);

const hidden = fixture({ hidden: true });
hidden.engage(); assert.equal(hidden.timeouts.size, 0);
hidden.document.hidden = false; hidden.document.emit('visibilitychange');
assert.equal(hidden.timeouts.size, 1);
hidden.document.hidden = true; hidden.flush(); assert.equal(hidden.open(), false);
hidden.document.hidden = false; hidden.document.emit('visibilitychange');
hidden.flush(); assert.equal(hidden.open(), true, 'a hidden-tab deferral can retry');
hidden.modal.emit('click'); assert.equal(hidden.open(), false, 'backdrop closes');

const typing = fixture();
const field = element(); field.matches = () => true;
typing.document.activeElement = field; typing.engage();
assert.equal(typing.timeouts.size, 0, 'never interrupt an active field');
typing.document.activeElement = typing.document.body; typing.document.emit('focusout');
assert.equal(typing.timeouts.size, 1);
typing.document.activeElement = field; typing.flush(); assert.equal(typing.open(), false);
typing.document.activeElement = typing.document.body; typing.document.emit('focusout');
typing.flush(); assert.equal(typing.open(), true, 'typing deferral can retry');

const claimed = fixture({ claimed: true, scrollY: 100 });
claimed.engage(); claimed.modal.emit('sc:preview-open');
assert.equal(claimed.timeouts.size, 0); assert.equal(claimed.open(), false);
const laterClaim = fixture(); laterClaim.engage();
laterClaim.header.classList.add('is-claimed'); laterClaim.flush();
assert.equal(laterClaim.open(), false, 'claims during the delay still suppress the popup');

const manual = fixture(); manual.engage(); manual.modal.emit('sc:preview-open');
assert.equal(manual.open(), true); assert.equal(manual.timeouts.size, 0);
manual.close.emit('click'); manual.engage(); assert.equal(manual.timeouts.size, 0);

const leaving = fixture(); leaving.engage(); leaving.window.emit('pagehide');
assert.equal(leaving.timeouts.size, 0, 'do not leave a pending pagehide timer');
const links = fixture(); links.document.emit('click'); assert.equal(links.timeouts.size, 0);
links.document.emit('click', { target: { closest: () => ({}) } });
links.flush(); assert.equal(links.open(), true);

console.log('Voucher popup: per-load invitation, restored scrolling, dismissal, delay, focus restoration, hidden/typing retries, claimed guards, manual trigger and timer cleanup passed');
