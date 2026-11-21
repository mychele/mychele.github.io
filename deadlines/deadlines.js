(function () {
  "use strict";

  // Resolve deadlines.json next to this script, whatever the page URL looks like
  var DATA_URL = new URL("deadlines.json", document.currentScript.src).href;

  var TAGS = [
    { id: "networking", label: "Networking" },
    { id: "wireless", label: "Wireless & mobile" },
    { id: "systems", label: "Systems" },
    { id: "measurement", label: "Measurement" },
    { id: "security", label: "Security" }
  ];

  function start(json) {
  var LAST_CHECKED = json.lastChecked;
  // Normalize the JSON entries to the shape the page code uses
  var DATA = json.deadlines.map(function (e) {
    var it = { id: e.id, name: e.name, cycle: e.cycle, status: e.status, tags: e.tags || [], where: e.where, note: e.note, url: e.url, sort: e.sort };
    if (e.dates && e.dates.length) it.dates = e.dates.map(function (d) { return [d.label, d.date, d.zone]; });
    else it.est = e.estimate;
    return it;
  }).filter(function (it) { return it.dates || (it.est && it.est.from && it.est.to); });

  var MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  var MON = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  var WD = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  var DAY = 86400000;

  function parts(s) { var p = s.split("-"); return [+p[0], +p[1] - 1, +p[2]]; }
  // End of the day Anywhere on Earth (UTC-12), or 5:59 pm EST (UTC-5).
  function moment(s, zone) {
    var p = parts(s);
    if (zone === "est") return Date.UTC(p[0], p[1], p[2], 22, 59);
    return Date.UTC(p[0], p[1], p[2] + 1, 11, 59);
  }
  function calDate(s) { var p = parts(s); return new Date(Date.UTC(p[0], p[1], p[2])); }
  function shortDate(s) { var d = calDate(s); return MON[d.getUTCMonth()] + " " + d.getUTCDate(); }

  DATA.forEach(function (it) {
    it.sortKey = it.sort || (it.dates ? it.dates[0][1] : it.est.from);
    if (it.dates) {
      it.moments = it.dates.map(function (d) { return moment(d[1], d[2]); });
      it.endMoment = it.moments[it.moments.length - 1];
    } else {
      it.endMoment = moment(it.est.to);
    }
  });
  DATA.sort(function (a, b) { return a.sortKey < b.sortKey ? -1 : a.sortKey > b.sortKey ? 1 : 0; });

  // State, with per-viewer memory of filters
  var state = { q: "", tags: [], est: true, closed: false };
  try {
    var saved = JSON.parse(localStorage.getItem("deadline-filters") || "null");
    if (saved && typeof saved === "object") {
      state.tags = Array.isArray(saved.tags) ? saved.tags.filter(function (t) { return TAGS.some(function (x) { return x.id === t; }); }) : [];
      state.est = saved.est !== false;
      state.closed = saved.closed === true;
    }
  } catch (e) {}
  function save() {
    try { localStorage.setItem("deadline-filters", JSON.stringify({ tags: state.tags, est: state.est, closed: state.closed })); } catch (e) {}
  }

  var now = Date.now();

  function nextDue(it) {
    if (!it.dates) return null;
    for (var i = 0; i < it.dates.length; i++) {
      if (it.moments[i] > now) return { label: it.dates[i][0], m: it.moments[i] };
    }
    return null;
  }
  function isClosed(it) { return it.endMoment < now; }

  function countdown(it) {
    if (isClosed(it)) return { text: "Closed", urgent: false, sub: "" };
    if (it.dates) {
      var nd = nextDue(it);
      var ms = nd.m - now;
      var days = Math.ceil(ms / DAY);
      var text = ms < DAY ? "Under a day" : days + (days === 1 ? " day" : " days");
      var sub = it.dates.length > 1 ? nd.label.toLowerCase() + " due" : "";
      return { text: text, urgent: days <= 14, sub: sub };
    }
    var mid = moment(it.sortKey) - now;
    var weeks = Math.max(1, Math.round(mid / (7 * DAY)));
    return { text: "About " + weeks + (weeks === 1 ? " week" : " weeks"), urgent: false, sub: "" };
  }

  function matches(it) {
    if (!state.est && it.status === "estimate") return false;
    if (!state.closed && isClosed(it)) return false;
    if (state.tags.length && !it.tags.some(function (t) { return state.tags.indexOf(t) >= 0; })) return false;
    if (state.q) {
      var hay = [it.name, it.cycle || "", it.where || "", it.note || ""].join(" ").toLowerCase();
      if (hay.indexOf(state.q) < 0) return false;
    }
    return true;
  }

  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  }

  // Chips
  var chipBox = document.getElementById("chips");
  TAGS.forEach(function (t) {
    var b = el("button", "chip", t.label);
    b.type = "button";
    b.setAttribute("aria-pressed", state.tags.indexOf(t.id) >= 0 ? "true" : "false");
    b.addEventListener("click", function () {
      var i = state.tags.indexOf(t.id);
      if (i >= 0) state.tags.splice(i, 1); else state.tags.push(t.id);
      b.setAttribute("aria-pressed", i >= 0 ? "false" : "true");
      save(); render();
    });
    chipBox.appendChild(b);
  });

  var q = document.getElementById("q");
  q.addEventListener("input", function () { state.q = q.value.trim().toLowerCase(); render(); });
  var estBox = document.getElementById("est");
  estBox.checked = state.est;
  estBox.addEventListener("change", function () { state.est = estBox.checked; save(); render(); });
  var closedBox = document.getElementById("closed");
  closedBox.checked = state.closed;
  closedBox.addEventListener("change", function () { state.closed = closedBox.checked; save(); render(); });

  function statusLabel(s) {
    return s === "posted" ? "Posted" : s === "unconfirmed" ? "Unconfirmed" : "Estimate";
  }

  function whenText(it) {
    if (!it.dates) return it.est.text;
    return it.dates.map(function (d, i) {
      var label = i === 0 ? d[0] : d[0].toLowerCase();
      return label + " " + shortDate(d[1]) + (d[2] === "est" ? ", 5:59 pm EST" : "");
    }).join(", ");
  }

  function renderItem(it) {
    var row = el("article", "item " + it.status + (isClosed(it) ? " closed" : ""));
    row.id = it.id;

    var day = el("div", "day");
    if (it.dates) {
      var d = calDate(it.dates[0][1]);
      day.appendChild(el("b", null, String(d.getUTCDate())));
      day.appendChild(el("small", null, WD[d.getUTCDay()]));
    } else {
      var a = el("span", "approx", "≈");
      a.setAttribute("aria-hidden", "true");
      day.appendChild(a);
    }
    row.appendChild(day);

    var body = el("div");
    var h = el("h3", "name");
    if (it.url) {
      var link = el("a", null, it.name);
      link.href = it.url; link.target = "_blank"; link.rel = "noopener noreferrer";
      h.appendChild(link);
    } else {
      h.appendChild(document.createTextNode(it.name));
    }
    if (it.cycle) { h.appendChild(document.createTextNode(" ")); h.appendChild(el("span", "cycle", it.cycle)); }
    body.appendChild(h);
    body.appendChild(el("p", "when", whenText(it)));
    if (it.where) body.appendChild(el("p", "where", it.where));
    if (it.note) body.appendChild(el("p", "note", it.note));
    row.appendChild(body);

    var c = countdown(it);
    var cnt = el("div", "count");
    var b = el("b", c.urgent ? "urgent" : null, c.text);
    cnt.appendChild(b);
    var sub = el("small", "status-" + it.status, statusLabel(it.status) + (c.sub ? "; " + c.sub : ""));
    cnt.appendChild(sub);
    row.appendChild(cnt);
    return row;
  }

  var list = document.getElementById("list");
  var countLine = document.getElementById("count-line");

  function render() {
    list.textContent = "";
    var shown = DATA.filter(matches);
    var groups = {};
    var order = [];
    shown.forEach(function (it) {
      var p = parts(it.sortKey);
      var key = p[0] + "-" + p[1];
      if (!groups[key]) { groups[key] = { label: MONTHS[p[1]] + " " + p[0], items: [] }; order.push(key); }
      groups[key].items.push(it);
    });
    order.forEach(function (k) {
      var sec = el("section", "month");
      sec.appendChild(el("h2", null, groups[k].label));
      groups[k].items.forEach(function (it) { sec.appendChild(renderItem(it)); });
      list.appendChild(sec);
    });
    if (!shown.length) {
      list.appendChild(el("p", "empty", "Nothing matches these filters. Clear the search or turn a topic back on."));
    }
    var upcoming = DATA.filter(function (it) { return !isClosed(it); }).length;
    countLine.textContent = shown.length + " of " + DATA.length + " deadlines shown; " + upcoming + " still open.";
    renderStrip(shown);
  }

  // Timeline strip
  var strip = document.getElementById("strip");
  var tip = document.getElementById("tip");
  var startD = new Date(Date.UTC(2026, 10, 1));
  var endD = new Date(Date.UTC(2027, 11, 1));
  (function () {
    var t = new Date(now);
    var s = new Date(Date.UTC(t.getUTCFullYear(), t.getUTCMonth(), 1));
    if (s > startD) startD = s;
    var lastEnd = DATA.reduce(function (m, it) { return Math.max(m, it.endMoment); }, 0);
    var le = new Date(lastEnd);
    var e = new Date(Date.UTC(le.getUTCFullYear(), le.getUTCMonth() + 1, 1));
    if (e > endD) endD = e;
  })();
  var span = endD - startD;
  function pct(ms) { return Math.max(0, Math.min(100, (ms - startD) / span * 100)); }

  function showTip(text, leftPct) {
    tip.textContent = text;
    tip.style.left = Math.max(8, Math.min(92, leftPct)) + "%";
    tip.classList.add("show");
  }
  function hideTip() { tip.classList.remove("show"); }

  function jumpTo(id) {
    var target = document.getElementById(id);
    if (!target) return;
    var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    target.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "center" });
    target.classList.add("is-flash");
    setTimeout(function () { target.classList.remove("is-flash"); }, 1400);
  }

  function renderStrip(items) {
    Array.prototype.slice.call(strip.querySelectorAll(".mark,.band,.month-tick,.month-line,.today")).forEach(function (n) { n.remove(); });

    for (var d = new Date(startD); d < endD; d = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 1))) {
      var left = pct(d.getTime());
      var line = el("div", "month-line"); line.style.left = left + "%"; strip.appendChild(line);
      var lab = d.getUTCMonth() === 0 ? "Jan ’" + String(d.getUTCFullYear()).slice(2) : MON[d.getUTCMonth()];
      var tk = el("div", "month-tick", lab); tk.style.left = "calc(" + left + "% + 4px)"; strip.appendChild(tk);
    }

    // Estimates as bands, stacked low; exact deadlines as lines with varied heights to reduce overlap
    var lane = 0;
    items.forEach(function (it, idx) {
      var label = it.name + (it.cycle ? ", " + it.cycle.toLowerCase() : "");
      if (it.dates) {
        var m = it.moments[it.moments.length - 1];
        var b = el("button", "mark " + it.status);
        b.type = "button";
        var left = pct(m);
        b.style.left = left + "%";
        b.style.height = (60 + (idx % 4) * 14) + "px";
        b.setAttribute("aria-label", label + ", " + whenText(it));
        b.addEventListener("mouseenter", function () { showTip(label + ": " + whenText(it), left); });
        b.addEventListener("focus", function () { showTip(label + ": " + whenText(it), left); });
        b.addEventListener("mouseleave", hideTip);
        b.addEventListener("blur", hideTip);
        b.addEventListener("click", function () { jumpTo(it.id); });
        strip.appendChild(b);
      } else {
        var l = pct(moment(it.est.from) - DAY / 2);
        var r = pct(moment(it.est.to));
        var band = el("button", "band");
        band.type = "button";
        band.style.left = l + "%";
        band.style.width = Math.max(0.6, r - l) + "%";
        band.style.bottom = (lane % 5) * 15 + "px";
        lane++;
        band.setAttribute("aria-label", label + ", " + it.est.text);
        var mid = (l + r) / 2;
        band.addEventListener("mouseenter", function () { showTip(label + ": " + it.est.text, mid); });
        band.addEventListener("focus", function () { showTip(label + ": " + it.est.text, mid); });
        band.addEventListener("mouseleave", hideTip);
        band.addEventListener("blur", hideTip);
        band.addEventListener("click", function () { jumpTo(it.id); });
        strip.appendChild(band);
      }
    });

    if (now >= startD && now <= endD) {
      var t = el("div", "today");
      t.style.left = pct(now) + "%";
      t.appendChild(el("span", null, "Today"));
      strip.appendChild(t);
    }
  }

  var c = calDate(LAST_CHECKED);
  document.getElementById("checked").textContent = "Last checked " + MONTHS[c.getUTCMonth()] + " " + c.getUTCDate() + ", " + c.getUTCFullYear() + ".";

  render();
  }

  fetch(DATA_URL, { cache: "no-cache" })
    .then(function (r) { if (!r.ok) throw new Error("HTTP " + r.status); return r.json(); })
    .then(start)
    .catch(function () {
      document.getElementById("checked").textContent = "";
      var p = document.createElement("p");
      p.className = "empty";
      p.textContent = "The deadline list didn’t load. Reload the page; if this copy was opened from a file on disk, open it from the website instead.";
      document.getElementById("list").appendChild(p);
    });
})();
