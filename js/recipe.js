/* Recipe pages: servings scaling, collapsible method steps, step-complete state, print. */
(function () {
  "use strict";

  /* ------------------------------------------------------------- Servings */
  var stepper = document.querySelector(".stepper");
  if (stepper) {
    var base = Number(stepper.getAttribute("data-base")) || 4;
    var min = 1;
    var max = 16;
    var current = base;
    var output = stepper.querySelector("output");
    var minus = stepper.querySelector("[data-step='-1']");
    var plus = stepper.querySelector("[data-step='1']");
    var note = document.getElementById("servings-note");
    var servesFact = document.getElementById("serves-fact");
    var quantities = document.querySelectorAll(".qty[data-base]");

    var FRACTIONS = [
      [0, ""], [0.125, "⅛"], [0.25, "¼"], [0.333, "⅓"], [0.5, "½"],
      [0.667, "⅔"], [0.75, "¾"], [1, ""]
    ];

    function formatQty(value, mode) {
      if (mode === "decimal") {
        var rounded = Math.round(value * 10) / 10;
        return String(rounded).replace(/\.0$/, "");
      }
      if (mode === "whole") {
        /* grams and millilitres: round to a friendly number */
        var step = value >= 100 ? 10 : value >= 20 ? 5 : 1;
        return String(Math.max(step, Math.round(value / step) * step));
      }
      var whole = Math.floor(value);
      var rest = value - whole;
      var best = FRACTIONS[0];
      FRACTIONS.forEach(function (f) {
        if (Math.abs(f[0] - rest) < Math.abs(best[0] - rest)) best = f;
      });
      if (best[0] === 1) { whole += 1; best = FRACTIONS[0]; }
      if (whole === 0 && best[1] === "") return "⅛";
      return (whole ? String(whole) : "") + best[1];
    }

    function update() {
      var factor = current / base;
      output.textContent = current;
      minus.disabled = current <= min;
      plus.disabled = current >= max;

      quantities.forEach(function (el) {
        var value = Number(el.getAttribute("data-base")) * factor;
        el.textContent = formatQty(value, el.getAttribute("data-mode"));
        el.classList.toggle("is-scaled", factor !== 1);

        /* Simple singular/plural agreement within the same ingredient line */
        var li = el.closest("li");
        if (li && li.querySelector(".qty") === el) {
          li.querySelectorAll(".pl").forEach(function (word) {
            word.textContent = value > 1 ? word.getAttribute("data-many") : word.getAttribute("data-one");
          });
        }
      });

      var people = current === 1 ? "1 person" : current + " people";
      note.textContent = current === base
        ? "Quantities shown for " + people + ". Adjust with − / +."
        : "Quantities scaled for " + people + ". Cooking times do not change automatically.";
      if (servesFact) servesFact.textContent = current;
    }

    stepper.addEventListener("click", function (event) {
      var btn = event.target.closest("button[data-step]");
      if (!btn || btn.disabled) return;
      current = Math.min(max, Math.max(min, current + Number(btn.getAttribute("data-step"))));
      update();
      if (window.TOA) window.TOA.announce("Serves " + current + ". Ingredient quantities updated.");
    });

    update();
  }

  /* ----------------------------------------------------- Method accordion */
  var toggles = Array.prototype.slice.call(document.querySelectorAll(".step__toggle"));
  var toggleAll = document.querySelector(".toggle-all");

  function setStep(btn, open) {
    btn.setAttribute("aria-expanded", String(open));
    document.getElementById(btn.getAttribute("aria-controls")).hidden = !open;
  }

  function refreshToggleAll() {
    if (!toggleAll) return;
    var anyOpen = toggles.some(function (b) { return b.getAttribute("aria-expanded") === "true"; });
    toggleAll.textContent = anyOpen ? "Collapse all −" : "Expand all +";
    toggleAll.setAttribute("aria-label", anyOpen ? "Collapse all steps" : "Expand all steps");
  }

  toggles.forEach(function (btn) {
    btn.addEventListener("click", function () {
      setStep(btn, btn.getAttribute("aria-expanded") !== "true");
      refreshToggleAll();
    });
  });

  if (toggleAll) {
    toggleAll.addEventListener("click", function () {
      var anyOpen = toggles.some(function (b) { return b.getAttribute("aria-expanded") === "true"; });
      toggles.forEach(function (b) { setStep(b, !anyOpen); });
      refreshToggleAll();
    });
    refreshToggleAll();
  }

  /* Step complete: mark the step and close it, opening the next one */
  document.querySelectorAll(".step__done input").forEach(function (box, index) {
    box.addEventListener("change", function () {
      var step = box.closest(".step");
      step.classList.toggle("is-done", box.checked);
      if (box.checked) {
        var btn = step.querySelector(".step__toggle");
        setStep(btn, false);
        var next = toggles[index + 1];
        if (next) {
          setStep(next, true);
          next.focus();
        }
        refreshToggleAll();
        if (window.TOA) {
          window.TOA.announce("Step " + (index + 1) + " complete." + (next ? " Next step opened." : " All steps done. Enjoy your meal."));
        }
      }
    });
  });

  /* ---------------------------------------------------------------- Print */
  document.querySelectorAll(".print-btn").forEach(function (btn) {
    btn.addEventListener("click", function () { window.print(); });
  });
})();
