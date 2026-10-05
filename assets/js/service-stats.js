(function () {
  "use strict";
  var group = document.querySelector("[data-scs-counter-group]");
  if (!group || group.dataset.scsCounterReady === "true") return;
  group.dataset.scsCounterReady = "true";
  var counters = Array.from(group.querySelectorAll("[data-scs-counter]"));
  var motion = window.matchMedia("(prefers-reduced-motion: reduce)");
  var frame = 0;
  var observer = null;
  var started = false;
  function render(counter, value) {
    counter.textContent = (counter.dataset.scsFormat === "comma"
      ? value.toLocaleString("en-US") : String(value)) + (counter.dataset.scsSuffix || "");
  }
  function finish() {
    window.cancelAnimationFrame(frame);
    counters.forEach(function (counter) { render(counter, Number(counter.dataset.scsEnd)); });
  }
  function start() {
    if (started) return;
    started = true;
    if (observer) observer.disconnect();
    if (motion.matches) { finish(); return; }
    counters.forEach(function (counter) { counter.setAttribute("aria-hidden", "true"); });
    var startTime = performance.now();
    function tick(now) {
      var progress = Math.min(1, (now - startTime) / 1300);
      var eased = 1 - Math.pow(1 - progress, 3);
      counters.forEach(function (counter) { render(counter, Math.round(Number(counter.dataset.scsEnd) * eased)); });
      if (progress < 1) frame = window.requestAnimationFrame(tick);
    }
    frame = window.requestAnimationFrame(tick);
  }
  // Final counts remain visible without JavaScript or observer support.
  if (!motion.matches && "IntersectionObserver" in window) {
    observer = new IntersectionObserver(function (entries) {
      if (entries.some(function (entry) { return entry.isIntersecting; })) start();
    }, { threshold: 0.15 });
    observer.observe(group);
  }
  motion.addEventListener("change", function () {
    if (motion.matches) {
      started = true;
      if (observer) observer.disconnect();
      finish();
    }
  });
})();
