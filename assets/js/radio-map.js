// Research radio map on the home page: hovering or focusing a wave shows its summary
(function () {
  "use strict";

  var map = document.querySelector(".rmap");
  if (!map) return;
  var title = document.getElementById("rmap-title");
  var text = document.getElementById("rmap-text");
  var defaults = [title.textContent, text.textContent];
  var arcs = map.querySelectorAll(".rmap-arc");

  function show(arc) {
    map.classList.add("is-focus");
    Array.prototype.forEach.call(arcs, function (a) { a.classList.toggle("is-on", a === arc); });
    title.textContent = arc.getAttribute("data-title");
    text.textContent = arc.getAttribute("data-text");
  }
  function reset() {
    map.classList.remove("is-focus");
    Array.prototype.forEach.call(arcs, function (a) { a.classList.remove("is-on"); });
    title.textContent = defaults[0];
    text.textContent = defaults[1];
  }

  Array.prototype.forEach.call(arcs, function (arc) {
    arc.addEventListener("mouseenter", function () { show(arc); });
    arc.addEventListener("focus", function () { show(arc); });
    arc.addEventListener("blur", reset);
  });
  map.querySelector("svg").addEventListener("mouseleave", reset);
})();
