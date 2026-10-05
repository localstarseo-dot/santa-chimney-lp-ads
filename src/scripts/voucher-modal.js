(function () {
  "use strict";

  function initializeVoucherModal() {
    const modal = document.querySelector(".sc-voucher-modal");
    const header = document.getElementById("sc-ppc-header");

    if (!modal || !header) {
      return;
    }

    const configNode = header.querySelector(
      "[data-sc-ppc-config]"
    );

    if (!configNode || modal.dataset.scVoucherReady) {
      return;
    }

    modal.dataset.scVoucherReady = "true";

    const config = configNode.dataset;
    const expiryKey = config.expiryKey;
    const claimKey = expiryKey + "_claimed";
    const dismissKey = expiryKey + "_popup_dismissed";

    const sourceTimer = header.querySelector(
      "[data-sc-timer]"
    );

    const popupTimer = modal.querySelector(
      "[data-sc-voucher-timer]"
    );

    const timerLabel = modal.querySelector(
      "[data-sc-voucher-timer-label]"
    );

    const closeButton = modal.querySelector(
      "[data-sc-voucher-close]"
    );

    const successPanel = modal.querySelector(
      "[data-sc-voucher-success]"
    );

    const status = modal.querySelector(
      "[data-sc-voucher-status]"
    );

    let form = null;
    let submitButton = null;
    let previousFocus = null;
    let opened = false;

    modal.setAttribute("role", "dialog");
    modal.setAttribute("aria-modal", "true");
    modal.setAttribute(
      "aria-labelledby",
      "sc-voucher-modal-title"
    );
    modal.setAttribute("aria-hidden", "true");

    function readExpiry() {
      try {
        const value = Number(
          localStorage.getItem(expiryKey)
        );

        if (!Number.isSafeInteger(value)) {
          return null;
        }

        return value > 0 ? value : null;
      } catch (error) {
        return null;
      }
    }

    function isClaimed() {
      if (header.classList.contains("is-claimed")) {
        return true;
      }

      const expiry = readExpiry();

      if (expiry === null) {
        return false;
      }

      try {
        return (
          localStorage.getItem(claimKey) ===
          String(expiry)
        );
      } catch (error) {
        return false;
      }
    }

    function syncTimer() {
      if (sourceTimer) {
        if (popupTimer) {
          popupTimer.textContent =
            sourceTimer.textContent || "00:00";
        }
      }

      const expiry = readExpiry();
      let expired = false;

      if (expiry !== null) {
        expired = expiry <= Date.now();
      } else if (popupTimer) {
        expired =
          popupTimer.textContent.trim() === "00:00";
      }

      modal.classList.toggle(
        "is-expired",
        expired
      );

      if (timerLabel) {
        timerLabel.textContent = expired
          ? "VOUCHER RESERVATION EXPIRED"
          : "VOUCHER RESERVED FOR";
      }

      /*
       * The form remains usable after expiration.
       */
      if (submitButton) {
        submitButton.textContent = expired
          ? "CHECK CURRENT OFFER"
          : config.claimLabel ||
            "CLAIM MY VOUCHER";
      }
    }

    function getFocusableElements() {
      const selector = [
        "button:not([disabled])",
        "a[href]",
        "input:not([disabled]):not([type='hidden'])",
        "select:not([disabled])",
        "textarea:not([disabled])",
        "[tabindex]:not([tabindex='-1'])"
      ].join(",");

      return Array.from(
        modal.querySelectorAll(selector)
      ).filter(function (element) {
        return element.offsetParent !== null;
      });
    }

    function openModal() {
      if (opened || isClaimed()) {
        return;
      }

      opened = true;
      previousFocus = document.activeElement;

      modal.classList.add("is-open");
      modal.setAttribute("aria-hidden", "false");

      document.documentElement.classList.add(
        "sc-voucher-modal-open"
      );

      document.body.classList.add(
        "sc-voucher-modal-open"
      );

      syncTimer();

      window.requestAnimationFrame(function () {
        if (closeButton) {
          closeButton.focus({
            preventScroll: true
          });
        }
      });
    }

    function closeModal(recordDismissal) {
      if (!opened) {
        return;
      }

      opened = false;

      modal.classList.remove("is-open");
      modal.setAttribute("aria-hidden", "true");

      document.documentElement.classList.remove(
        "sc-voucher-modal-open"
      );

      document.body.classList.remove(
        "sc-voucher-modal-open"
      );

      if (recordDismissal) {
        try {
          sessionStorage.setItem(
            dismissKey,
            "true"
          );
        } catch (error) {
          /* Session storage is optional. */
        }
      }

      if (previousFocus) {
        if (
          typeof previousFocus.focus ===
          "function"
        ) {
          previousFocus.focus({
            preventScroll: true
          });
        }
      }
    }

    function showSuccess() {
      modal.classList.add("is-claimed");
      modal.setAttribute("aria-labelledby", "sc-voucher-success-title");

      if (successPanel) {
        successPanel.hidden = false;
        successPanel.focus({
          preventScroll: true
        });
      }

      if (status) {
        status.textContent =
          "Voucher claimed. Call to schedule or book online.";
      }
    }

    function notifyHeaderClaimed() {
      header.dispatchEvent(new CustomEvent("sc:voucher-claimed"));
    }

    function handleSuccessfulSubmission() {
      const expiry = readExpiry();

      if (expiry !== null) {
        try {
          localStorage.setItem(
            claimKey,
            String(expiry)
          );
        } catch (error) {
          /* Submission remains successful. */
        }

      }

      showSuccess();
      notifyHeaderClaimed();
    }

    function connectForm() {
      const foundForm = modal.querySelector(
        "form#forminator-module-4914"
      );

      if (!foundForm) {
        return false;
      }

      if (foundForm === form) {
        return true;
      }

      form = foundForm;
      if (form.hasAttribute("data-sc-preview-form")) {
        form.addEventListener("sc:preview-submit-success", handleSuccessfulSubmission);
      }

      form.setAttribute(
        "aria-label",
        "Claim your chimney repair voucher"
      );

      submitButton = form.querySelector(
        ".forminator-button-submit"
      );

      const nameField = form.querySelector(
        '[name="name-1"]'
      );

      const phoneField = form.querySelector(
        '[name="phone-1"]'
      );

      if (nameField) {
        nameField.autocomplete = "name";

        if (!nameField.placeholder) {
          nameField.placeholder = "Name";
        }
      }

      if (phoneField) {
        phoneField.autocomplete = "tel";
        phoneField.inputMode = "tel";

        if (!phoneField.placeholder) {
          phoneField.placeholder = "Phone";
        }
      }

      if (window.jQuery) {
        window
          .jQuery(form)
          .off(
            "forminator:form:submit:success.scVoucherPopup"
          )
          .on(
            "forminator:form:submit:success.scVoucherPopup",
            handleSuccessfulSubmission
          );
      }

      syncTimer();

      return true;
    }

    if (closeButton) {
      closeButton.addEventListener(
        "click",
        function () {
          closeModal(true);
        }
      );
    }

    modal.addEventListener(
      "click",
      function (event) {
        if (event.target === modal) {
          closeModal(true);
        }
      }
    );

    modal.addEventListener(
      "keydown",
      function (event) {
        if (event.key === "Escape") {
          event.preventDefault();
          closeModal(true);
          return;
        }

        if (event.key !== "Tab") {
          return;
        }

        const focusable = getFocusableElements();

        if (!focusable.length) {
          return;
        }

        const first = focusable[0];
        const last =
          focusable[focusable.length - 1];

        if (event.shiftKey) {
          if (document.activeElement === first || !focusable.includes(document.activeElement)) {
            event.preventDefault();
            last.focus();
          }

          return;
        }

        if (document.activeElement === last || !focusable.includes(document.activeElement)) {
          event.preventDefault();
          first.focus();
        }
      }
    );

    if (sourceTimer) {
      new MutationObserver(syncTimer).observe(
        sourceTimer,
        {
          childList: true,
          characterData: true,
          subtree: true
        }
      );
    }

    new MutationObserver(function () {
      if (
        !header.classList.contains("is-claimed")
      ) {
        return;
      }

      if (
        modal.classList.contains("is-claimed")
      ) {
        return;
      }

      closeModal(false);
    }).observe(header, {
      attributes: true,
      attributeFilter: ["class"]
    });

    if (!connectForm()) {
      const formObserver =
        new MutationObserver(function () {
          if (connectForm()) {
            formObserver.disconnect();
          }
        });

      formObserver.observe(modal, {
        childList: true,
        subtree: true
      });
    }

    modal.addEventListener("sc:preview-open", openModal);

    function schedulePopup() {
      window.setTimeout(openModal, 5000);
    }

    if (document.readyState === "complete") {
      schedulePopup();
    } else {
      window.addEventListener(
        "load",
        schedulePopup,
        { once: true }
      );
    }

    window.addEventListener(
      "pagehide",
      function () {
        document.documentElement.classList.remove(
          "sc-voucher-modal-open"
        );

        document.body.classList.remove(
          "sc-voucher-modal-open"
        );
      }
    );
  }

  if (document.readyState === "loading") {
    document.addEventListener(
      "DOMContentLoaded",
      initializeVoucherModal,
      { once: true }
    );
  } else {
    initializeVoucherModal();
  }
})();
