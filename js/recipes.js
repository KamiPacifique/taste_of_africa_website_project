/* Recipes page: search, region chips, dietary + time filters, sort, saved-only view. */
(function () {
  "use strict";

  var grid = document.getElementById("recipe-grid");
  if (!grid) return;

  var cards = Array.prototype.slice.call(grid.querySelectorAll(".card[data-slug]"));
  var note = grid.querySelector(".kitchen-note");
  var searchForm = document.getElementById("recipe-search");
  var searchInput = document.getElementById("recipe-query");
  var chips = Array.prototype.slice.call(document.querySelectorAll("[data-region-filter]"));
  var dietSelect = document.getElementById("diet");
  var timeSelect = document.getElementById("time");
  var sortSelect = document.getElementById("sort");
  var activeBox = document.getElementById("active-filters");
  var countEl = document.getElementById("results-count");
  var savedCountEl = document.getElementById("results-saved");
  var emptyState = document.getElementById("empty-state");

  var REGION_LABELS = {
    all: "All regions",
    west: "West Africa",
    east: "East Africa",
    north: "North Africa",
    southern: "Southern Africa",
    central: "Central Africa"
  };
  var DIET_LABELS = {
    "plant-based": "Plant-based",
    "gluten-free": "Gluten-free",
    "dairy-free": "Dairy-free",
    "meat": "With meat"
  };
  var TIME_LABELS = {
    "60": "60 min or less",
    "90": "Up to 90 min",
    "91": "Over 90 min"
  };

  var params = new URLSearchParams(window.location.search);
  var state = {
    q: params.get("q") || "",
    region: REGION_LABELS[params.get("region")] ? params.get("region") : "all",
    diet: params.get("diet") || "",
    time: params.get("time") || "",
    savedOnly: params.has("saved"),
    sort: "editor"
  };

  searchInput.value = state.q;
  if (DIET_LABELS[state.diet]) dietSelect.value = state.diet; else state.diet = "";
  if (TIME_LABELS[state.time]) timeSelect.value = state.time; else state.time = "";

  function matches(card) {
    var d = card.dataset;
    if (state.region !== "all" && d.region !== state.region) return false;
    if (state.diet && (" " + d.diet + " ").indexOf(" " + state.diet + " ") === -1) return false;
    var mins = Number(d.time);
    if (state.time === "60" && mins > 60) return false;
    if (state.time === "90" && mins > 90) return false;
    if (state.time === "91" && mins <= 90) return false;
    if (state.savedOnly && window.TOA && window.TOA.getSaved().indexOf(d.slug) === -1) return false;
    if (state.q) {
      var terms = state.q.toLowerCase().split(/\s+/).filter(Boolean);
      var haystack = (d.name + " " + d.keywords).toLowerCase();
      for (var i = 0; i < terms.length; i++) {
        if (haystack.indexOf(terms[i]) === -1) return false;
      }
    }
    return true;
  }

  function sortCards(list) {
    return list.slice().sort(function (a, b) {
      if (state.sort === "time") return Number(a.dataset.time) - Number(b.dataset.time);
      if (state.sort === "az") return a.dataset.name.localeCompare(b.dataset.name);
      return Number(a.dataset.order) - Number(b.dataset.order);
    });
  }

  function pill(label, onRemove) {
    var btn = document.createElement("button");
    btn.type = "button";
    btn.className = "chip chip--active";
    btn.innerHTML = '<span></span><span aria-hidden="true">×</span>';
    btn.firstChild.textContent = label;
    btn.setAttribute("aria-label", "Remove filter: " + label);
    btn.addEventListener("click", function () {
      onRemove();
      render();
      (searchInput).focus();
    });
    return btn;
  }

  function renderActive() {
    activeBox.innerHTML = "";
    var any = false;
    if (state.q) { any = true; activeBox.appendChild(pill("“" + state.q + "”", function () { state.q = ""; searchInput.value = ""; })); }
    if (state.region !== "all") { any = true; activeBox.appendChild(pill(REGION_LABELS[state.region], function () { state.region = "all"; })); }
    if (state.diet) { any = true; activeBox.appendChild(pill(DIET_LABELS[state.diet], function () { state.diet = ""; dietSelect.value = ""; })); }
    if (state.time) { any = true; activeBox.appendChild(pill(TIME_LABELS[state.time], function () { state.time = ""; timeSelect.value = ""; })); }
    if (state.savedOnly) { any = true; activeBox.appendChild(pill("Saved recipes", function () { state.savedOnly = false; })); }
    if (any) {
      var clear = document.createElement("button");
      clear.type = "button";
      clear.className = "clear-btn";
      clear.textContent = "Clear all";
      clear.addEventListener("click", clearAll);
      activeBox.appendChild(clear);
    }
    return any;
  }

  function clearAll() {
    state.q = ""; state.region = "all"; state.diet = ""; state.time = ""; state.savedOnly = false;
    searchInput.value = ""; dietSelect.value = ""; timeSelect.value = "";
    render();
    searchInput.focus();
  }

  function syncUrl() {
    var p = new URLSearchParams();
    if (state.q) p.set("q", state.q);
    if (state.region !== "all") p.set("region", state.region);
    if (state.diet) p.set("diet", state.diet);
    if (state.time) p.set("time", state.time);
    if (state.savedOnly) p.set("saved", "");
    var qs = p.toString().replace(/saved=(&|$)/, "saved$1");
    window.history.replaceState(null, "", window.location.pathname + (qs ? "?" + qs : ""));
  }

  function render() {
    chips.forEach(function (chip) {
      chip.setAttribute("aria-pressed", String(chip.getAttribute("data-region-filter") === state.region));
    });

    var filtersOn = renderActive();
    var visible = 0;

    sortCards(cards).forEach(function (card) {
      var show = matches(card);
      card.hidden = !show;
      if (show) visible++;
      grid.insertBefore(card, note);
    });

    if (!filtersOn) {
      countEl.textContent = "Showing all " + cards.length + " recipes";
    } else {
      countEl.textContent = visible === 1 ? "1 recipe matches your filters" : visible + " recipes match your filters";
    }

    var savedNum = window.TOA ? window.TOA.getSaved().length : 0;
    savedCountEl.textContent = savedNum ? "Saved " + savedNum : "";

    emptyState.hidden = visible !== 0;
    note.hidden = visible === 0;
    syncUrl();
  }

  searchForm.addEventListener("submit", function (event) {
    event.preventDefault();
    state.q = searchInput.value.trim();
    render();
  });

  var debounce;
  searchInput.addEventListener("input", function () {
    window.clearTimeout(debounce);
    debounce = window.setTimeout(function () {
      state.q = searchInput.value.trim();
      render();
    }, 250);
  });

  chips.forEach(function (chip) {
    chip.addEventListener("click", function () {
      state.region = chip.getAttribute("data-region-filter");
      render();
    });
  });

  dietSelect.addEventListener("change", function () { state.diet = dietSelect.value; render(); });
  timeSelect.addEventListener("change", function () { state.time = timeSelect.value; render(); });
  sortSelect.addEventListener("change", function () { state.sort = sortSelect.value; render(); });
  document.getElementById("empty-clear").addEventListener("click", clearAll);

  /* Re-filter when a recipe is unsaved while viewing saved-only */
  document.addEventListener("saved:change", function () {
    if (cards.length) render();
  });

  render();
})();
