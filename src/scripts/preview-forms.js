/* Staging only. Never enqueue this file in WordPress. */
(function () {
  "use strict";

  document.querySelectorAll("form[data-sc-preview-form]").forEach(function (form) {
    form.addEventListener("submit", function (event) {
      event.preventDefault();
      if (!form.reportValidity()) return;

      const modal = document.querySelector(".sc-voucher-modal");
      const header = document.getElementById("sc-ppc-header");
      const success = modal.querySelector("[data-sc-voucher-success]");
      success.querySelector("h2").textContent = "VOUCHER CLAIMED (PREVIEW)";
      success.querySelector("p").textContent = "Preview complete. No voucher request was sent and no contact details were saved.";
      header.querySelector(".sc-ppc-claimed-actions strong").textContent = "Voucher claimed (preview)";

      form.dispatchEvent(new CustomEvent("sc:preview-submit-success"));
      header.querySelector("[data-sc-announcement]").textContent = "Preview claim complete. No request was sent.";
      modal.querySelector("[data-sc-voucher-status]").textContent = "Preview claim complete. No request was sent.";
      form.reset();
    });
  });

  const open = document.querySelector("[data-sc-preview-open]");
  if (open) open.addEventListener("click", function () {
    document.querySelector(".sc-voucher-modal").dispatchEvent(new CustomEvent("sc:preview-open"));
  });

  const reset = document.querySelector("[data-sc-preview-reset]");
  if (reset) reset.addEventListener("click", function () {
    const key = document.querySelector("[data-sc-ppc-config]").dataset.expiryKey;
    try {
      localStorage.removeItem(key);
      localStorage.removeItem(key + "_claimed");
      sessionStorage.removeItem(key + "_popup_dismissed");
    } catch (_) {}
    window.location.reload();
  });
})();
