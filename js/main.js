/* Tastes of Africa — shared behaviour for every page.
   - Light/dark theme toggle (remembered in localStorage)
   - Mobile menu and header search drawer
   - Saved recipes (bookmark buttons, header count, toast with undo)
   - Newsletter sign-up validation
*/
(function () {
  "use strict";

  var THEME_KEY = "toa-theme";
  var SAVED_KEY = "toa-saved";
  var root = document.documentElement;

  /* Safe storage wrapper (private browsing can throw) */
  var store = {
    get: function (key, fallback) {
      try {
        var value = localStorage.getItem(key);
        return value === null ? fallback : JSON.parse(value);
      } catch (e) {
        return fallback;
      }
    },
    set: function (key, value) {
      try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) { /* ignore */ }
    }
  };

  /* Live region used to announce changes to screen-reader users */
  var announcer = document.getElementById("announcer");
  function announce(message) {
    if (!announcer) return;
    announcer.textContent = "";
    window.setTimeout(function () { announcer.textContent = message; }, 50);
  }

  /* ---------------------------------------------------------------- Theme */
  function applyTheme(theme) {
    root.setAttribute("data-theme", theme);
    document.querySelectorAll(".theme-toggle").forEach(function (btn) {
      var isDark = theme === "dark";
      btn.setAttribute("aria-pressed", String(isDark));
      btn.setAttribute("aria-label", isDark ? "Switch to light theme" : "Switch to dark theme");
    });
  }

  applyTheme(root.getAttribute("data-theme") === "dark" ? "dark" : "light");

  document.querySelectorAll(".theme-toggle").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
      applyTheme(next);
      store.set(THEME_KEY, next);
      announce(next === "dark" ? "Dark theme on" : "Light theme on");
    });
  });

  /* ------------------------------------------------------------ Mobile menu */
  var menuToggle = document.querySelector(".menu-toggle");
  var menuPanel = document.getElementById("menu-panel");

  function setMenu(open) {
    if (!menuToggle || !menuPanel) return;
    menuToggle.setAttribute("aria-expanded", String(open));
    menuToggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    menuPanel.hidden = !open;
    if (open) {
      var first = menuPanel.querySelector("a, button, input");
      if (first) first.focus();
    }
  }

  if (menuToggle && menuPanel) {
    menuToggle.addEventListener("click", function () {
      setMenu(menuToggle.getAttribute("aria-expanded") !== "true");
    });
  }

  /* ---------------------------------------------------------- Search drawer */
  var searchToggle = document.querySelector(".header-search");
  var searchDrawer = document.getElementById("search-drawer");

  function setSearch(open) {
    if (!searchToggle || !searchDrawer) return;
    searchToggle.setAttribute("aria-expanded", String(open));
    searchDrawer.hidden = !open;
    if (open) searchDrawer.querySelector("input").focus();
  }

  if (searchToggle && searchDrawer) {
    searchToggle.addEventListener("click", function () {
      setSearch(searchToggle.getAttribute("aria-expanded") !== "true");
    });
  }

  document.addEventListener("keydown", function (event) {
    if (event.key !== "Escape") return;
    if (menuToggle && menuToggle.getAttribute("aria-expanded") === "true") {
      setMenu(false);
      menuToggle.focus();
    }
    if (searchToggle && searchToggle.getAttribute("aria-expanded") === "true") {
      setSearch(false);
      searchToggle.focus();
    }
  });

  /* ---------------------------------------------------------- Saved recipes */
  var saved = store.get(SAVED_KEY, []);
  if (!Array.isArray(saved)) saved = [];

  var toast = document.getElementById("toast");
  var toastMsg = toast ? toast.querySelector(".toast__msg") : null;
  var toastUndo = toast ? toast.querySelector(".toast__undo") : null;
  var toastTimer = null;
  var lastAction = null;

  function isSaved(slug) { return saved.indexOf(slug) !== -1; }

  function renderSaved() {
    document.querySelectorAll("[data-save]").forEach(function (btn) {
      var slug = btn.getAttribute("data-save");
      var name = btn.getAttribute("data-name") || "recipe";
      var on = isSaved(slug);
      btn.setAttribute("aria-pressed", String(on));
      if (btn.classList.contains("save-btn")) {
        btn.setAttribute("aria-label", (on ? "Remove " : "Save ") + name + (on ? " from saved recipes" : " to your recipes"));
      } else {
        var label = btn.querySelector(".save-label");
        if (label) label.textContent = on ? "Saved" : "Save";
      }
    });
    document.querySelectorAll(".saved-count").forEach(function (el) {
      el.textContent = saved.length;
    });
    document.querySelectorAll(".header-saved, .menu-panel__saved").forEach(function (el) {
      el.setAttribute("aria-label", "Saved recipes: " + saved.length);
    });
    document.dispatchEvent(new CustomEvent("saved:change", { detail: { saved: saved.slice() } }));
  }

  function showToast(message, canUndo) {
    if (!toast) { announce(message); return; }
    toastMsg.textContent = message;
    toastUndo.hidden = !canUndo;
    toast.hidden = false;
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(hideToast, 6000);
  }

  function hideToast() {
    if (toast) toast.hidden = true;
  }

  function toggleSaved(slug, name) {
    var wasSaved = isSaved(slug);
    if (wasSaved) {
      saved = saved.filter(function (s) { return s !== slug; });
    } else {
      saved.push(slug);
    }
    store.set(SAVED_KEY, saved);
    lastAction = { slug: slug, name: name, wasSaved: wasSaved };
    renderSaved();
    showToast(wasSaved ? name + " removed from your recipes." : name + " saved to your recipes.", true);
  }

  document.addEventListener("click", function (event) {
    var btn = event.target.closest("[data-save]");
    if (!btn) return;
    event.preventDefault();
    toggleSaved(btn.getAttribute("data-save"), btn.getAttribute("data-name") || "Recipe");
  });

  if (toastUndo) {
    toastUndo.addEventListener("click", function () {
      if (!lastAction) return;
      var a = lastAction;
      if (a.wasSaved) {
        if (!isSaved(a.slug)) saved.push(a.slug);
      } else {
        saved = saved.filter(function (s) { return s !== a.slug; });
      }
      store.set(SAVED_KEY, saved);
      lastAction = null;
      renderSaved();
      showToast(a.wasSaved ? a.name + " is back in your recipes." : a.name + " removed from your recipes.", false);
    });
  }

  renderSaved();

  /* Expose a tiny API for page scripts */
  window.TOA = {
    getSaved: function () { return saved.slice(); },
    announce: announce
  };

  /* ------------------------------------------------------------- Newsletter */
  var newsletter = document.getElementById("newsletter-form");
  if (newsletter) {
    var nlInput = newsletter.querySelector("input[type='email']");
    var nlStatus = document.getElementById("newsletter-status");
    newsletter.addEventListener("submit", function (event) {
      event.preventDefault();
      var value = nlInput.value.trim();
      var ok = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value);
      nlStatus.className = "newsletter__status " + (ok ? "is-success" : "is-error");
      if (ok) {
        nlStatus.textContent = "Thank you. Your first letter is on its way to " + value + ".";
        nlInput.removeAttribute("aria-invalid");
        newsletter.reset();
      } else {
        nlStatus.textContent = value
          ? "Use a complete email address, like name@example.com."
          : "Enter your email address to subscribe.";
        nlInput.setAttribute("aria-invalid", "true");
        nlInput.focus();
      }
    });
  }

  /* --------------------------------------------------------- Footer year */
  document.querySelectorAll(".year").forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });
})();
