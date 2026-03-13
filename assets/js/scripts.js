// Vanilla JS replacement for jQuery plugins
(function () {
  "use strict";

  // --- Mobile nav toggle ---
  var trigger = document.querySelector(".dl-trigger");
  var menu = document.querySelector(".dl-menu");
  if (trigger && menu) {
    trigger.addEventListener("click", function (e) {
      e.preventDefault();
      var isOpen = menu.classList.contains("dl-menuopen");
      menu.classList.toggle("dl-menuopen");
      trigger.classList.toggle("dl-active");
      // Toggle about submenu
      var submenu = menu.querySelector(".dl-submenu");
      if (submenu && isOpen) {
        submenu.classList.remove("dl-submenu-open");
      }
    });
    // About submenu toggle
    var aboutLink = menu.querySelector("li > a[href='#']");
    if (aboutLink) {
      aboutLink.addEventListener("click", function (e) {
        e.preventDefault();
        var submenu = this.nextElementSibling;
        if (submenu && submenu.classList.contains("dl-submenu")) {
          submenu.classList.toggle("dl-submenu-open");
        }
      });
    }
    // Close menu when clicking outside
    document.addEventListener("click", function (e) {
      if (!e.target.closest(".dl-menuwrapper")) {
        menu.classList.remove("dl-menuopen");
        trigger.classList.remove("dl-active");
        var openSub = menu.querySelector(".dl-submenu-open");
        if (openSub) openSub.classList.remove("dl-submenu-open");
      }
    });
  }

  // --- Safari back-button cache fix ---
  window.onpageshow = function (event) {
    var container = document.querySelector(".container");
    var wrapper = document.querySelector(".wrapper");
    if (container && container.classList.contains("fadeOut")) {
      container.classList.remove("fadeOut");
      container.classList.add("fadeIn");
    }
    if (wrapper && wrapper.classList.contains("fadeOut")) {
      wrapper.classList.remove("fadeOut");
      wrapper.classList.add("fadeIn");
    }
  };
  window.onunload = function () {};

  // --- Zoom button transition (page exit animation) ---
  document.querySelectorAll(".zoombtn").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var container = document.querySelector(".container");
      var wrapper = document.querySelector(".wrapper");
      if (container) {
        container.classList.remove("fadeIn");
        container.classList.add("fadeOut");
      }
      if (wrapper) {
        wrapper.classList.remove("fadeIn");
        wrapper.classList.add("fadeOut");
      }
    });
  });

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

  // --- Scroll-reveal animation (replaces WOW.js) ---
  var wowElements = document.querySelectorAll(".wow");
  if (wowElements.length && "IntersectionObserver" in window) {
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            var el = entry.target;
            var animClass =
              el.dataset.wowClass ||
              (el.classList.contains("fadeInLeft") ? "" : "fadeIn");
            if (animClass) {
              el.classList.add("animated", animClass);
            } else {
              el.classList.add("animated");
            }
            el.style.visibility = "visible";
            observer.unobserve(el);
          }
        });
      },
      { threshold: 0.1 }
    );
    wowElements.forEach(function (el) {
      el.style.visibility = "hidden";
      observer.observe(el);
    });
  } else {
    // Fallback: just show everything
    wowElements.forEach(function (el) {
      el.style.visibility = "visible";
    });
  }
})();
