document.addEventListener("DOMContentLoaded", function () {

  // Menu burger (identique au site Webflow)
  var burger = document.querySelector(".navbar_burger");
  var menu = document.querySelector(".navbar_menu");
  if (burger && menu) {
    burger.addEventListener("click", function () {
      var isOpen = menu.classList.toggle("is-open");
      burger.setAttribute("aria-expanded", isOpen ? "true" : "false");
    });
  }

  // Menus déroulants (Équipes / Le Club)
  // Split target : le mot est un lien normal vers la page, seule la flèche ouvre/ferme le sous-menu
  var dropdowns = document.querySelectorAll(".navbar_dropdown");
  dropdowns.forEach(function (dropdown) {
    var caretBtn = dropdown.querySelector(".navbar_dropdown-caret-btn");
    if (!caretBtn) return;
    caretBtn.addEventListener("click", function (e) {
      e.preventDefault();
      e.stopPropagation();
      var isOpen = dropdown.classList.toggle("is-open");
      dropdowns.forEach(function (other) {
        if (other !== dropdown) other.classList.remove("is-open");
      });
      caretBtn.setAttribute("aria-expanded", isOpen ? "true" : "false");
    });
  });

  document.addEventListener("click", function (e) {
    dropdowns.forEach(function (dropdown) {
      if (!dropdown.contains(e.target)) dropdown.classList.remove("is-open");
    });
  });

  // Validation du formulaire de contact avant envoi vers Netlify Forms
  var form = document.querySelector("[data-contact-form]");
  if (!form) return;

  var successBox = document.querySelector("[data-contact-success]");

  var rules = {
    nom: { required: true, minLength: 2, label: "Le nom" },
    email: { required: true, email: true, label: "L'email" },
    message: { required: true, minLength: 10, label: "Le message" }
  };

  function isValidEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  }

  function validateField(field) {
    var rule = rules[field.name];
    if (!rule) return true;

    var value = field.value.trim();
    var errorText = "";

    if (rule.required && value.length === 0) {
      errorText = rule.label + " est obligatoire.";
    } else if (rule.minLength && value.length < rule.minLength) {
      errorText = rule.label + " doit contenir au moins " + rule.minLength + " caractères.";
    } else if (rule.email && !isValidEmail(value)) {
      errorText = "Merci d'indiquer une adresse email valide.";
    }

    var errorSpan = form.querySelector('[data-contact-' + field.name + '-error]');
    if (errorSpan) {
      errorSpan.textContent = errorText;
      errorSpan.classList.toggle("is-visible", errorText !== "");
    }
    field.classList.toggle("is-error", errorText !== "");
    return errorText === "";
  }

  Object.keys(rules).forEach(function (name) {
    var field = form.elements[name];
    if (field) field.addEventListener("blur", function () { validateField(field); });
  });

  form.addEventListener("submit", function (e) {
    var isFormValid = true;
    Object.keys(rules).forEach(function (name) {
      var field = form.elements[name];
      if (field && !validateField(field)) isFormValid = false;
    });

    if (!isFormValid) {
      e.preventDefault();
      return;
    }

    // Pas de preventDefault : Netlify Forms traite l'envoi nativement.
    if (successBox) successBox.classList.add("is-visible");
  });
});
