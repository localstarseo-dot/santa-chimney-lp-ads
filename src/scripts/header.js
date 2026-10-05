(function () {
  "use strict";

  function initialize() {
    const root = document.getElementById("sc-ppc-header");
    if (!root || root.dataset.scReady) return;
    root.dataset.scReady = "true";

    const config = root.querySelector("[data-sc-ppc-config]").dataset;
    const shell = root.querySelector(".sc-ppc-shell");
    const nav = root.querySelector(".sc-ppc-nav");
    const bar = root.querySelector(".sc-ppc-offer-bar");
    const lead = root.querySelector(".sc-ppc-lead");
    let form = null;

    const hero = document.querySelector(config.heroSelector);
    const toolbar = document.getElementById("wpadminbar");
    const timers = root.querySelectorAll("[data-sc-timer]");
    const reservations = root.querySelectorAll(".sc-ppc-reservation");
    const offerDots = root.querySelectorAll(".sc-ppc-offer-dot");
    const announcement = root.querySelector("[data-sc-announcement]");

    let submit = null;
    const key = config.expiryKey;
    const claimKey = key + "_claimed";
    const duration = Number(config.duration) * 1000;

    let expiry = null;
    let claimed = false;
    let state = "";
    let clock = 0;
    let geometryFrame = 0;
    let heroObserver;
    let observedAdmin = -1;

    try {
      const saved = localStorage.getItem(key);

      if (
        [saved === null, Number.isFinite(duration), duration > 0].every(
          Boolean
        )
      ) {
        localStorage.setItem(key, String(Date.now() + duration));
      }

      let stored = Number(localStorage.getItem(key));

      if (
        Number.isSafeInteger(stored)
          ? stored > Date.now() + duration
          : false
      ) {
        stored = Date.now() + duration;
        localStorage.setItem(key, String(stored));
      }

      if (Number.isSafeInteger(stored) ? stored > 0 : false) {
        expiry = stored;
      }

      claimed =
        expiry !== null
          ? localStorage.getItem(claimKey) === String(expiry)
          : false;
    } catch (_) {
      // If storage is unavailable, keep the form usable and show 00:00.
    }

    function renderState(next) {
      if (next === state) return;

      const previous = state;
      state = next;

      root.dataset.offerState = next;
      root.classList.toggle("is-claimed", next === "claimed");

      reservations.forEach(function (node) {
        node.hidden = next === "claimed";
      });

      offerDots.forEach(function (node) {
        node.hidden = next === "claimed";
      });

      root.querySelector(".sc-ppc-claimed-actions").hidden =
        next !== "claimed";

      /*
       * The visible offer, service and form-label wording now stays
       * controlled by the HTML block. JavaScript does not replace it.
       */

      if (submit) {
        submit.textContent = config.claimLabel;
      }

      if ([previous, next === "expired"].every(Boolean)) {
        announcement.textContent =
          "Voucher timer ended. The form remains available.";
      }

      if (next === "claimed") {
        announcement.textContent =
          "Voucher claimed. Call to schedule or book online.";
      }

      scheduleGeometry();
    }

    function tick() {
  clearTimeout(clock);

  /*
   * Restart the countdown automatically when it reaches zero.
   * It uses the current data-duration value.
   */
  if (!claimed) {
    if (expiry !== null) {
      if (expiry <= Date.now()) {
        expiry = Date.now() + duration;

        try {
          localStorage.setItem(
            key,
            String(expiry)
          );

          localStorage.removeItem(claimKey);
        } catch (_) {}
      }
    }
  }

  const remaining =
    expiry === null
      ? 0
      : Math.max(0, expiry - Date.now());

  renderState(
    claimed
      ? "claimed"
      : expiry === null
        ? "unavailable"
        : remaining > 0
          ? "active"
          : "expired"
  );

  const seconds = Math.max(
    0,
    Math.ceil(remaining / 1000)
  );

  const display = [
    Math.floor(seconds / 60),
    seconds % 60
  ]
    .map(function (value) {
      return String(value).padStart(2, "0");
    })
    .join(":");

  timers.forEach(function (node) {
    node.textContent = display;
  });

  if (
    [state === "active", !document.hidden].every(
      Boolean
    )
  ) {
    clock = setTimeout(tick, 1000);
  }
}

    function toolbarOffset() {
      if (!toolbar) return 0;

      const rect = toolbar.getBoundingClientRect();

      return rect.top <= 0
        ? Math.max(0, rect.bottom)
        : 0;
    }

    function updateMode() {
      if (!hero || !form) return;

      const past =
        hero.getBoundingClientRect().bottom <= toolbarOffset();

      if (
        [past, nav.contains(document.activeElement)].every(Boolean)
      ) {
        return;
      }

      if (
        [!past, lead.contains(document.activeElement)].every(Boolean)
      ) {
        return;
      }

      root.classList.toggle("is-past-hero", past);
    }

    function measure() {
      geometryFrame = 0;

      const admin = toolbarOffset();

      root.style.setProperty("--sc-ppc-admin", admin + "px");

      if (!root.classList.contains("is-past-hero")) {
        root.style.setProperty(
          "--sc-ppc-slot",
          shell.getBoundingClientRect().height + "px"
        );
      }

      root.classList.add("is-ready");

      if (
        [
          hero,
          "IntersectionObserver" in window,
          admin !== observedAdmin
        ].every(Boolean)
      ) {
        observedAdmin = admin;

        if (heroObserver) {
          heroObserver.disconnect();
        }

        heroObserver = new IntersectionObserver(updateMode, {
          rootMargin: "-" + admin + "px 0px 0px 0px",
          threshold: [0, 1]
        });

        heroObserver.observe(hero);
      }

      updateMode();
    }

    function scheduleGeometry() {
      if (!geometryFrame) {
        geometryFrame = requestAnimationFrame(measure);
      }
    }

    function handleSuccessfulSubmission() {
      claimed = true;
      try {
        localStorage.setItem(claimKey, String(expiry));
      } catch (_) {}
      tick();
    }

    root.addEventListener("sc:voucher-claimed", handleSuccessfulSubmission);

    function connectForm() {
      const found = root.querySelector(
        "form#forminator-module-4877"
      );

      if (!found || found === form) {
        return Boolean(form);
      }

      form = found;
      if (form.hasAttribute("data-sc-preview-form")) {
        form.addEventListener("sc:preview-submit-success", handleSuccessfulSubmission);
      }
      form.setAttribute("aria-label", "Claim your voucher");

      submit = form.querySelector(".forminator-button-submit");

      const name = form.querySelector('[name="name-1"]');
      const phone = form.querySelector('[name="phone-1"]');

      if (name) {
        if (!name.placeholder) {
          name.placeholder = "Name";
        }

        name.autocomplete = "name";
      }

      if (phone) {
        if (!phone.placeholder) {
          phone.placeholder = "Phone";
        }

        phone.inputMode = "tel";
        phone.autocomplete = "tel";
      }

      /*
       * Submission remains available before and after timer expiration.
       */
      if (window.jQuery) {
        window
          .jQuery(form)
          .on(
            "forminator:form:submit:success.scPpc",
            handleSuccessfulSubmission
          );
      }

      if (submit) {
        submit.textContent = config.claimLabel;
      }

      scheduleGeometry();
      return true;
    }

    if (!connectForm()) {
      const pendingForm = new MutationObserver(function () {
        if (connectForm()) {
          pendingForm.disconnect();
        }
      });

      pendingForm.observe(
        root.querySelector(".sc-ppc-form"),
        {
          childList: true,
          subtree: true
        }
      );
    }

    if ("ResizeObserver" in window) {
      const resize = new ResizeObserver(scheduleGeometry);

      [bar, nav, hero, toolbar]
        .filter(Boolean)
        .forEach(function (node) {
          resize.observe(node);
        });
    }

    if (
      [toolbar, "IntersectionObserver" in window].every(Boolean)
    ) {
      new IntersectionObserver(scheduleGeometry, {
        threshold: [0, 1]
      }).observe(toolbar);
    }

    if (toolbar) {
      window.addEventListener(
        "scroll",
        function () {
          if (
            getComputedStyle(toolbar).position === "absolute"
          ) {
            scheduleGeometry();
          }
        },
        { passive: true }
      );
    }

    if (!("IntersectionObserver" in window)) {
      window.addEventListener(
        "scroll",
        scheduleGeometry,
        { passive: true }
      );
    }

    window.addEventListener(
      "resize",
      scheduleGeometry,
      { passive: true }
    );

    window.addEventListener(
      "scrollend",
      updateMode,
      { passive: true }
    );

    root.addEventListener("focusout", function () {
      requestAnimationFrame(updateMode);
    });

    window.addEventListener("pageshow", function () {
      tick();
      scheduleGeometry();
    });

    document.addEventListener(
      "visibilitychange",
      tick
    );

    window.addEventListener("storage", function (event) {
      if (![key, claimKey, null].includes(event.key)) {
        return;
      }

      try {
        const stored = Number(
          localStorage.getItem(key)
        );

        expiry = Number.isSafeInteger(stored)
          ? stored > 0
            ? stored
            : null
          : null;

        claimed =
          expiry !== null
            ? localStorage.getItem(claimKey) ===
              String(expiry)
            : false;
      } catch (_) {
        expiry = null;
      }

      tick();
    });

    nav.addEventListener("click", function (event) {
      const link = event.target.closest(
        'a[href^="#"]'
      );

      if (
        !link ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return;
      }

      const target = document.getElementById(
        link.hash.slice(1)
      );

      if (!target) return;

      event.preventDefault();
      link.blur();

      const top =
        link.hash === "#home"
          ? 0
          : window.scrollY +
            target.getBoundingClientRect().top -
            shell.offsetHeight -
            toolbarOffset() -
            12;

      window.scrollTo({
        top: Math.max(0, top),
        behavior: "instant"
      });

      updateMode();

      if (link.hash !== "#home") {
        requestAnimationFrame(function () {
          window.scrollBy({
            top:
              target.getBoundingClientRect().top -
              shell.offsetHeight -
              toolbarOffset() -
              12,
            behavior: "instant"
          });
        });
      }

      history.replaceState(null, "", link.hash);
    });

    tick();
    measure();
  }

  if (document.readyState === "loading") {
    document.addEventListener(
      "DOMContentLoaded",
      initialize,
      { once: true }
    );
  } else {
    initialize();
  }
})();
