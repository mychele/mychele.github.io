// Vanilla JS replacement for jQuery plugins
(function () {
  "use strict";

  // --- Top bar menu toggle on narrow screens ---
  var bar = document.querySelector(".topbar");
  var toggle = document.querySelector(".topbar-toggle");
  if (bar && toggle) {
    toggle.addEventListener("click", function () {
      var open = bar.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      toggle.textContent = open ? "Close" : "Menu";
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && bar.classList.contains("is-open")) toggle.click();
    });
  }

  // --- Add lightbox class to image links ---
  document
    .querySelectorAll(
      'a[href$=".jpg"], a[href$=".jpeg"], a[href$=".JPG"], a[href$=".png"], a[href$=".gif"]'
    )
    .forEach(function (link) {
      link.classList.add("image-popup");
    });

  // --- Responsive video embeds (replaces FitVids) ---
  document
    .querySelectorAll(
      '.content iframe[src*="youtube"], .content iframe[src*="vimeo"]'
    )
    .forEach(function (iframe) {
      if (!iframe.parentElement.classList.contains("fitvid-wrapper")) {
        var wrapper = document.createElement("div");
        wrapper.classList.add("fitvid-wrapper");
        iframe.parentNode.insertBefore(wrapper, iframe);
        wrapper.appendChild(iframe);
      }
    });

  // --- Go-to-top button (replaces jQuery GoUp) ---
  var goupBtn = document.createElement("div");
  goupBtn.id = "goup";
  goupBtn.setAttribute("aria-label", "Back to top");
  goupBtn.innerHTML = "&#9650;";
  document.body.appendChild(goupBtn);

  window.addEventListener("scroll", function () {
    if (window.scrollY > 500) {
      goupBtn.classList.add("goup-visible");
    } else {
      goupBtn.classList.remove("goup-visible");
    }
  });

  goupBtn.addEventListener("click", function () {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  // --- Simple lightbox (replaces Magnific Popup) ---
  function openLightbox(src, gallery, index) {
    var overlay = document.createElement("div");
    overlay.className = "lightbox-overlay";
    var img = document.createElement("img");
    img.src = src;
    img.className = "lightbox-img";
    overlay.appendChild(img);

    if (gallery && gallery.length > 1) {
      var prevBtn = document.createElement("button");
      prevBtn.className = "lightbox-prev";
      prevBtn.innerHTML = "&#10094;";
      prevBtn.setAttribute("aria-label", "Previous image");
      var nextBtn = document.createElement("button");
      nextBtn.className = "lightbox-next";
      nextBtn.innerHTML = "&#10095;";
      nextBtn.setAttribute("aria-label", "Next image");
      overlay.appendChild(prevBtn);
      overlay.appendChild(nextBtn);

      var current = index;
      prevBtn.addEventListener("click", function (e) {
        e.stopPropagation();
        current = (current - 1 + gallery.length) % gallery.length;
        img.src = gallery[current];
      });
      nextBtn.addEventListener("click", function (e) {
        e.stopPropagation();
        current = (current + 1) % gallery.length;
        img.src = gallery[current];
      });
    }

    overlay.addEventListener("click", function (e) {
      if (e.target === overlay) {
        overlay.classList.add("lightbox-closing");
        setTimeout(function () {
          overlay.remove();
        }, 300);
      }
    });

    document.addEventListener(
      "keydown",
      function handler(e) {
        if (e.key === "Escape") {
          overlay.classList.add("lightbox-closing");
          setTimeout(function () {
            overlay.remove();
          }, 300);
          document.removeEventListener("keydown", handler);
        }
      }
    );

    document.body.appendChild(overlay);
    requestAnimationFrame(function () {
      overlay.classList.add("lightbox-visible");
    });
  }

  var popups = document.querySelectorAll(".image-popup");
  var gallerySrcs = Array.prototype.map.call(popups, function (a) {
    return a.href;
  });

  popups.forEach(function (link, i) {
    link.addEventListener("click", function (e) {
      e.preventDefault();
      openLightbox(this.href, gallerySrcs, i);
    });
  });
})();
