(() => {
  "use strict";
  const section = document.getElementById("scs-reviews");
  if (!section || section.dataset.scsReviewsReady === "true") return;
  const track = section.querySelector("[data-scs-reviews-track]");
  const originalGroup = section.querySelector("[data-scs-reviews-group]");
  const viewport = section.querySelector(".scs-google-reviews__viewport");
  const hint = section.querySelector(".scs-google-reviews__mobile-hint");
  const pauseButton = section.querySelector("[data-scs-reviews-pause]");
  const autoplayAllWidths = section.hasAttribute("data-scs-reviews-autoplay");
  const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  const manualScrollQuery = window.matchMedia("(max-width: 48rem)");
  if (!track || !originalGroup) return;
  section.dataset.scsReviewsReady = "true";
  let duplicateGroup = null;
  let observer = null;
  let manuallyPaused = false;
  const setInView = (inView) => {
    section.classList.toggle("scs-google-reviews--in-view", inView && !document.hidden);
  };
  const setHint = (animated) => {
    if (hint) hint.textContent = animated
      ? (manuallyPaused ? "Reviews paused. Resume when you're ready." : "Reviews move automatically. Pause to read.")
      : "Swipe or scroll to read more reviews.";
    if (viewport) viewport.setAttribute("aria-label", animated
      ? "Selected Google customer reviews. Use the Pause reviews button to stop movement."
      : "Selected Google customer reviews. Scroll to read more.");
    if (pauseButton) {
      pauseButton.hidden = !animated;
      pauseButton.textContent = manuallyPaused ? "Resume reviews" : "Pause reviews";
      pauseButton.setAttribute("aria-pressed", String(manuallyPaused));
    }
  };
  const removeEnhancement = () => {
    if (observer) { observer.disconnect(); observer = null; }
    if (duplicateGroup) { duplicateGroup.remove(); duplicateGroup = null; }
    section.classList.remove("scs-google-reviews--enhanced", "scs-google-reviews--in-view", "scs-google-reviews--paused");
    setHint(false);
  };
  const addEnhancement = () => {
    if (section.hasAttribute("data-scs-reviews-static") || reducedMotionQuery.matches || (!autoplayAllWidths && manualScrollQuery.matches) || duplicateGroup || !("IntersectionObserver" in window)) {
      if (!duplicateGroup) setHint(false);
      return;
    }
    duplicateGroup = originalGroup.cloneNode(true);
    duplicateGroup.removeAttribute("data-scs-reviews-group");
    duplicateGroup.removeAttribute("role");
    duplicateGroup.setAttribute("aria-hidden", "true");
    duplicateGroup.setAttribute("inert", "");
    duplicateGroup.removeAttribute("id");
    duplicateGroup.querySelectorAll("[id]").forEach((element) => element.removeAttribute("id"));
    duplicateGroup.querySelectorAll("a, button, input, select, textarea, [tabindex]")
      .forEach((element) => element.setAttribute("tabindex", "-1"));
    track.appendChild(duplicateGroup);
    section.classList.add("scs-google-reviews--enhanced");
    section.classList.toggle("scs-google-reviews--paused", manuallyPaused);
    setHint(true);
    observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting),
      { rootMargin: "120px 0px", threshold: 0.01 });
    observer.observe(section);
  };
  const syncMode = () => { removeEnhancement(); addEnhancement(); };
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) setInView(false);
    else if (observer) { observer.unobserve(section); observer.observe(section); }
  });
  reducedMotionQuery.addEventListener("change", syncMode);
  manualScrollQuery.addEventListener("change", () => {
    if (!autoplayAllWidths) syncMode();
  });
  if (pauseButton) pauseButton.addEventListener("click", () => {
    if (!duplicateGroup) return;
    manuallyPaused = !manuallyPaused;
    section.classList.toggle("scs-google-reviews--paused", manuallyPaused);
    setHint(true);
  });
  setHint(false);
  if ("requestIdleCallback" in window) window.requestIdleCallback(addEnhancement, { timeout: 1500 });
  else window.setTimeout(addEnhancement, 250);
})();
