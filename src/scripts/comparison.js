(function () {
  "use strict";
  function initializeComparison(comparison) {
    if (comparison.dataset.scRealtimeReady === "true") return;
    var stage = comparison.querySelector(".sc-ads-comparison__stage");
    var range = comparison.querySelector("[data-sc-compare-range]");
    if (!stage || !range) return;
    comparison.dataset.scRealtimeReady = "true";
    var pointerState = null;
    var animationFrame = 0;
    var queuedClientX = null;
    function clamp(value) {
      return Math.min(100, Math.max(0, Math.round(Number(value))));
    }
    function setPosition(value) {
      var position = clamp(value);
      range.value = String(position);
      var content = comparison.dataset.scComparePending === "true" ? "photo placeholder" : "image";
      range.setAttribute("aria-valuetext", position + "% before " + content + " and " + (100 - position) + "% after " + content);
      comparison.style.setProperty("--compare-position", position + "%");
    }
    function setPositionFromClientX(clientX) {
      var rectangle = stage.getBoundingClientRect();
      if (!rectangle.width) return;
      setPosition(((clientX - rectangle.left) / rectangle.width) * 100);
    }
    function queuePositionUpdate(clientX) {
      queuedClientX = clientX;
      if (animationFrame) return;
      animationFrame = window.requestAnimationFrame(function () {
        animationFrame = 0;
        if (queuedClientX !== null) {
          setPositionFromClientX(queuedClientX);
          queuedClientX = null;
        }
      });
    }
    function cancelQueuedUpdate() {
      if (animationFrame) {
        window.cancelAnimationFrame(animationFrame);
        animationFrame = 0;
      }
      queuedClientX = null;
    }
    function resetPointer() {
      cancelQueuedUpdate();
      pointerState = null;
      comparison.classList.remove("is-dragging");
    }
    function releasePointer(event) {
      if (!stage.releasePointerCapture || !stage.hasPointerCapture || !stage.hasPointerCapture(event.pointerId)) return;
      try { stage.releasePointerCapture(event.pointerId); }
      catch (error) { /* The browser may already have released it. */ }
    }
    range.addEventListener("input", function () { setPosition(range.value); });
    stage.addEventListener("pointerdown", function (event) {
      if (pointerState || event.isPrimary === false || (typeof event.button === "number" && event.button !== 0)) return;
      cancelQueuedUpdate();
      range.focus({ preventScroll: true });
      pointerState = { id: event.pointerId, startX: event.clientX, startY: event.clientY, dragging: false, cancelled: false };
    });
    stage.addEventListener("pointermove", function (event) {
      if (!pointerState || pointerState.id !== event.pointerId || pointerState.cancelled) return;
      var horizontalDistance = Math.abs(event.clientX - pointerState.startX);
      var verticalDistance = Math.abs(event.clientY - pointerState.startY);
      if (!pointerState.dragging && verticalDistance > horizontalDistance && verticalDistance > 8) {
        pointerState.cancelled = true;
        return;
      }
      if (!pointerState.dragging && horizontalDistance > 5 && horizontalDistance > verticalDistance) {
        pointerState.dragging = true;
        pointerState.cancelled = false;
        comparison.classList.add("is-dragging");
        if (stage.setPointerCapture) {
          try { stage.setPointerCapture(event.pointerId); }
          catch (error) { /* Some touch browsers use implicit pointer capture. */ }
        }
      }
      if (!pointerState.dragging || pointerState.cancelled) return;
      event.preventDefault();
      queuePositionUpdate(event.clientX);
    }, { passive: false });
    stage.addEventListener("pointerup", function (event) {
      if (!pointerState || pointerState.id !== event.pointerId) return;
      if (!pointerState.cancelled) {
        cancelQueuedUpdate();
        setPositionFromClientX(event.clientX);
      }
      releasePointer(event);
      resetPointer();
    });
    stage.addEventListener("pointercancel", resetPointer);
    stage.addEventListener("lostpointercapture", resetPointer);
    setPosition(range.value);
  }
  function initializeAllComparisons() {
    document.querySelectorAll('[data-sc-ads-component="before-after"]').forEach(initializeComparison);
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initializeAllComparisons, { once: true });
  } else initializeAllComparisons();
})();
