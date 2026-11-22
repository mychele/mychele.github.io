// Lightbox for the film photography page: loads the full-size image only when opened
(function () {
  "use strict";

  var items = Array.prototype.slice.call(document.querySelectorAll("#film .film-item"));
  var viewer = document.getElementById("film-viewer");
  if (!items.length || !viewer || typeof viewer.showModal !== "function") return;

  var img = document.getElementById("film-viewer-img");
  var caption = document.getElementById("film-viewer-caption");
  var index = 0;

  function preload(i) {
    var it = items[(i + items.length) % items.length];
    var p = new Image();
    p.src = it.getAttribute("data-full");
  }

  function show(i) {
    index = (i + items.length) % items.length;
    var it = items[index];
    var label = it.getAttribute("data-label");
    img.classList.add("is-loading");
    img.onload = function () { img.classList.remove("is-loading"); };
    img.src = it.getAttribute("data-full");
    img.alt = label;
    caption.textContent = label + " · " + (index + 1) + " of " + items.length;
    preload(index + 1);
  }

  items.forEach(function (it, i) {
    it.addEventListener("click", function (e) {
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
      e.preventDefault();
      show(i);
      viewer.showModal();
    });
  });

  document.getElementById("film-prev").addEventListener("click", function () { show(index - 1); });
  document.getElementById("film-next").addEventListener("click", function () { show(index + 1); });
  document.getElementById("film-close").addEventListener("click", function () { viewer.close(); });

  // Close when clicking the backdrop
  viewer.addEventListener("click", function (e) {
    if (e.target === viewer) viewer.close();
  });
  viewer.addEventListener("close", function () {
    img.removeAttribute("src");
    items[index].focus();
  });
  viewer.addEventListener("keydown", function (e) {
    if (e.key === "ArrowLeft") { e.preventDefault(); show(index - 1); }
    else if (e.key === "ArrowRight") { e.preventDefault(); show(index + 1); }
  });

  // Swipe left and right on touch screens
  var startX = null;
  viewer.addEventListener("touchstart", function (e) { startX = e.touches[0].clientX; }, { passive: true });
  viewer.addEventListener("touchend", function (e) {
    if (startX === null) return;
    var dx = e.changedTouches[0].clientX - startX;
    if (Math.abs(dx) > 50) show(index + (dx < 0 ? 1 : -1));
    startX = null;
  });
})();
