/* Contact page: helpful, human form validation and a clear confirmation. */
(function () {
  "use strict";

  var form = document.getElementById("contact-form");
  if (!form) return;

  var alertBox = document.getElementById("form-alert");
  var alertText = document.getElementById("form-alert-text");
  var formWrap = document.getElementById("form-wrap");
  var confirmation = document.getElementById("confirmation");
  var submitted = false;

  var rules = {
    name: function (v) {
      return v.trim() ? "" : "Enter your name so we know how to address you.";
    },
    email: function (v) {
      v = v.trim();
      if (!v) return "Enter your email address so we can reply.";
      return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v) ? "" : "Use a complete email address, like name@example.com.";
    },
    message: function (v) {
      var len = v.trim().length;
      if (!len) return "Write a short message so we know how to help.";
      return len < 10 ? "Please write at least 10 characters about your question or idea." : "";
    }
  };

  function validateField(name) {
    var input = form.elements[name];
    var error = document.getElementById(name + "-error");
    var message = rules[name](input.value);
    var field = input.closest(".field");
    field.classList.toggle("field--error", Boolean(message));
    if (message) {
      input.setAttribute("aria-invalid", "true");
      error.querySelector("span").textContent = message;
      error.hidden = false;
    } else {
      input.removeAttribute("aria-invalid");
      error.hidden = true;
    }
    return !message;
  }

  function validateAll() {
    var invalid = Object.keys(rules).filter(function (name) { return !validateField(name); });
    if (invalid.length) {
      alertText.textContent = invalid.length === 1
        ? "Please check 1 field before sending."
        : "Please check " + invalid.length + " fields before sending.";
      alertBox.hidden = false;
    } else {
      alertBox.hidden = true;
    }
    return invalid;
  }

  /* After the first attempt, re-check fields as people fix them */
  Object.keys(rules).forEach(function (name) {
    var input = form.elements[name];
    input.addEventListener("blur", function () {
      if (submitted || input.value) validateField(name);
    });
    input.addEventListener("input", function () {
      if (submitted) {
        validateField(name);
        validateAll();
      }
    });
  });

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    submitted = true;
    var invalid = validateAll();
    if (invalid.length) {
      alertBox.focus();
      return;
    }

    var name = form.elements.name.value.trim();
    var email = form.elements.email.value.trim();
    var country = form.elements.country.value;
    var message = form.elements.message.value.trim();
    var firstName = name.split(/\s+/)[0];
    var about = message.length > 60 ? message.slice(0, 57).trim() + "…" : message;

    document.getElementById("confirm-name").textContent = firstName;
    document.getElementById("confirm-email").textContent = email;
    document.getElementById("confirm-from").textContent = name + (country ? " · " + country : "");
    document.getElementById("confirm-about").textContent = about;

    formWrap.hidden = true;
    confirmation.hidden = false;
    var heading = confirmation.querySelector("h2");
    heading.focus();
    window.scrollTo({ top: confirmation.getBoundingClientRect().top + window.scrollY - 40 });
  });

  document.getElementById("send-another").addEventListener("click", function () {
    form.reset();
    submitted = false;
    alertBox.hidden = true;
    form.querySelectorAll(".field--error").forEach(function (f) { f.classList.remove("field--error"); });
    form.querySelectorAll("[aria-invalid]").forEach(function (i) { i.removeAttribute("aria-invalid"); });
    form.querySelectorAll(".field__error").forEach(function (e) { e.hidden = true; });
    confirmation.hidden = true;
    formWrap.hidden = false;
    form.elements.name.focus();
  });
})();
