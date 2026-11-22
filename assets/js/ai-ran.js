// Interactive AI-RAN results panel on /research/ai-ran/
(function () {
  "use strict";

  var root = document.getElementById("airan");
  var dataEl = document.getElementById("airan-data");
  if (!root || !dataEl) return;
  var data = JSON.parse(dataEl.textContent);
  var axis = document.getElementById("airan-axis");
  var detail = document.getElementById("airan-detail");

  var papers = {};
  data.papers.forEach(function (p) { papers[p.id] = p; });

  // Log scale from 100 ns to 1000 s
  var MIN = -7, MAX = 3;
  function pos(t) { return (Math.log10(t) - MIN) / (MAX - MIN) * 100; }
  var TICKS = ["100 ns", "1 µs", "10 µs", "100 µs", "1 ms", "10 ms", "100 ms", "1 s", "10 s", "100 s", "1000 s"];

  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  }

  // O-RAN control loop bands
  Array.prototype.forEach.call(axis.querySelectorAll(".airan-oran"), function (b) {
    var l = pos(+b.getAttribute("data-from")), r = pos(+b.getAttribute("data-to"));
    b.style.left = l + "%";
    b.style.width = (r - l) + "%";
  });

  var line = el("div", "airan-line");
  axis.appendChild(line);
  TICKS.forEach(function (label, i) {
    var x = i / (TICKS.length - 1) * 100;
    var tick = el("span", "airan-tick", label);
    tick.style.left = x + "%";
    axis.appendChild(tick);
  });

  // Markers above the line, stacked in lanes so close values don't collide
  var lanes = [];
  data.timeline.forEach(function (m) {
    var x = pos(m.t);
    var lane = 0;
    while (lanes[lane] != null && x - lanes[lane] < 11) lane++;
    lanes[lane] = x;
    var b = el("button", "airan-mark");
    b.type = "button";
    b.setAttribute("data-paper", m.paper);
    b.style.left = x + "%";
    b.style.setProperty("--lane", lane);
    if (x > 78) b.classList.add("is-flip");
    b.setAttribute("aria-label", m.label + ": " + m.what);
    b.appendChild(el("b", null, m.label));
    b.appendChild(el("span", null, m.what));
    axis.appendChild(b);
  });
  axis.style.setProperty("--lanes", lanes.length);

  // Ranges below the line
  data.bands.forEach(function (r) {
    var l = pos(r.from), w = pos(r.to) - l;
    var b = el("button", "airan-range", r.label);
    b.type = "button";
    b.setAttribute("data-paper", r.paper);
    b.style.left = l + "%";
    b.style.width = w + "%";
    axis.appendChild(b);
  });

  var linked = root.querySelectorAll("[data-paper]");

  function show(id) {
    var p = papers[id];
    if (!p) return;
    Array.prototype.forEach.call(linked, function (n) {
      n.classList.toggle("is-active", n.getAttribute("data-paper") === id);
    });
    detail.textContent = "";
    var head = el("p", "airan-kicker", p.venue);
    var h = el("h3", null);
    if (p.url) {
      var a = el("a", null, p.title);
      a.href = p.url; a.target = "_blank"; a.rel = "noopener noreferrer";
      h.appendChild(a);
    } else {
      h.textContent = p.title;
    }
    var tags = el("p", "airan-tags");
    p.pillars.forEach(function (pid) {
      var pl = data.pillars.filter(function (x) { return x.id === pid; })[0];
      if (pl) tags.appendChild(el("span", null, pl.label));
    });
    var ul = el("ul");
    p.facts.forEach(function (f) { ul.appendChild(el("li", null, f)); });
    detail.appendChild(head);
    detail.appendChild(h);
    detail.appendChild(el("p", "airan-summary", p.summary));
    detail.appendChild(ul);
    detail.appendChild(tags);
  }

  Array.prototype.forEach.call(linked, function (n) {
    n.addEventListener("click", function () { show(n.getAttribute("data-paper")); });
  });

  // Pillar toggles dim everything outside the selected areas
  var active = [];
  Array.prototype.forEach.call(root.querySelectorAll(".airan-pillar"), function (b) {
    b.addEventListener("click", function () {
      var id = b.getAttribute("data-pillar");
      var i = active.indexOf(id);
      if (i >= 0) active.splice(i, 1); else active.push(id);
      b.setAttribute("aria-pressed", i >= 0 ? "false" : "true");
      Array.prototype.forEach.call(linked, function (n) {
        var p = papers[n.getAttribute("data-paper")];
        var match = !active.length || p.pillars.some(function (x) { return active.indexOf(x) >= 0; });
        n.classList.toggle("is-dim", !match);
      });
    });
  });

  show(data.timeline[0].paper);
})();
