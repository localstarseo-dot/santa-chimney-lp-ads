(function () {
  "use strict";

  function initialize() {
    const background = document.querySelector("[data-sc-hero-slideshow]");
    if (!background || background.dataset.scHeroReady) return;
    const hero = background.closest(".sc-repair-hero");
    const slides = Array.from(background.querySelectorAll(".sc-hero-slideshow__slide"));
    if (slides.length < 2) return;
    background.dataset.scHeroReady = "true";

    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let active = 0;
    let inView = true;
    let timer = 0;
    let cleanupTimer = 0;

    function load(index) {
      const image = slides[index];
      if (!image.getAttribute("src") && image.dataset.src) image.src = image.dataset.src;
    }

    function mayPlay() {
      return !motion.matches && inView && !document.hidden &&
        !document.body.classList.contains("sc-voucher-modal-open");
    }

    function settle() {
      window.clearTimeout(cleanupTimer);
      cleanupTimer = 0;
      slides.forEach(slide => slide.classList.remove("is-leaving"));
    }

    function nextIndex() {
      // Skip known failed assets; retain the current image if none is ready.
      for (let offset = 1; offset < slides.length; offset++) {
        const index = (active + offset) % slides.length;
        if (slides[index].dataset.scFailed !== "true") return index;
      }
      return active;
    }

    function schedule() {
      window.clearTimeout(timer);
      timer = 0;
      if (!mayPlay()) return;
      load(nextIndex());
      timer = window.setTimeout(advance, 3000);
    }

    function advance() {
      timer = 0;
      if (!mayPlay()) return;
      const next = nextIndex();
      const image = slides[next];
      if (next !== active && image.complete && image.naturalWidth > 0) {
        settle();
        slides[active].classList.replace("is-active", "is-leaving");
        image.classList.add("is-active");
        active = next;
        background.dataset.scHeroIndex = String(active);
        cleanupTimer = window.setTimeout(settle, 1050);
      }
      schedule();
    }

    function sync() {
      if (!mayPlay()) settle();
      schedule();
    }

    slides.forEach((slide, index) => {
      slide.addEventListener("error", function () {
        slide.dataset.scFailed = "true";
        if (index === active) {
          const next = nextIndex();
          load(next);
          if (slides[next].complete && slides[next].naturalWidth > 0) {
            slide.classList.remove("is-active");
            slides[next].classList.add("is-active");
            active = next;
          }
        }
      });
    });
    document.addEventListener("visibilitychange", sync);
    motion.addEventListener("change", sync);
    new MutationObserver(sync).observe(document.body, { attributes: true, attributeFilter: ["class"] });
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (entries) {
        inView = entries[0].isIntersecting;
        sync();
      }, { threshold: 0.01 }).observe(hero);
    }
    window.addEventListener("pagehide", function () {
      window.clearTimeout(timer);
      settle();
    });
    window.addEventListener("pageshow", sync);
    background.dataset.scHeroIndex = "0";
    sync();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", initialize, { once: true });
  else initialize();
})();
