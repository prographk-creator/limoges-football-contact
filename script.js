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

  // Validation du formulaire de contact avant envoi vers Brevo
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

    var fieldWrapper = field.closest(".apply_field") || (field.form || document);
    var errorSpan = fieldWrapper.querySelector('[data-contact-' + field.name + '-error]');
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

  // Délégation sur document (plus robuste qu'un addEventListener direct sur
  // le formulaire si une extension du navigateur clone/modifie le DOM).
  document.addEventListener("submit", function (e) {
    var liveForm = e.target;
    if (!liveForm || !liveForm.matches || !liveForm.matches("[data-contact-form]")) return;
    e.preventDefault();

    var isFormValid = true;
    Object.keys(rules).forEach(function (name) {
      var field = liveForm.elements[name];
      if (field && !validateField(field)) isFormValid = false;
    });

    if (!isFormValid) return;

    var sujetField = liveForm.elements["sujet"];
    var messageValue = liveForm.elements["message"].value.trim();

    // Champs envoyés à Mailjet (les ID numériques des propriétés de contact
    // configurées côté Mailjet : nom, sujet, message).
    var payload = {
      Email: liveForm.elements["email"].value.trim(),
      Fields: [
        { ID: 891294, Value: liveForm.elements["nom"].value.trim() },
        { ID: 891301, Value: sujetField ? sujetField.value : "" },
        { ID: 891300, Value: messageValue }
      ]
    };

    var submitBtn = liveForm.querySelector(".apply_submit");
    if (submitBtn) submitBtn.disabled = true;

    // Mailjet répond en CORS classique, on peut donc lire la réponse.
    fetch(liveForm.action, {
      method: "POST",
      mode: "cors",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    })
      .then(function (response) {
        if (!response.ok) throw new Error("Réponse Mailjet non OK");
        liveForm.reset();
        liveForm.style.display = "none"; // style inline : prime sur la classe .apply_form
        if (successBox) successBox.classList.add("is-visible");
      })
      .catch(function () {
        if (submitBtn) submitBtn.disabled = false;
        alert("Une erreur est survenue lors de l'envoi. Merci de réessayer ou de nous contacter par email.");
      });
  });
});
