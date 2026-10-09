/* MetroGym — site scripts (Part 3: Functionality & SEO)
   Handles client-side validation and processing for the two required forms:
   - enquiry.html : trial / class enquiry -> returns cost & availability info
   - contact.html : general message -> compiles and sends an email via mailto:
*/

(function () {
  "use strict";

  var EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  var RECIPIENT_EMAIL = "info@metrogym.co.za";

  function qs(id) { return document.getElementById(id); }

  function setFieldError(fieldId, errorId, message) {
    var field = qs(fieldId);
    var errorEl = qs(errorId);
    if (errorEl) errorEl.textContent = message || "";
    if (field) {
      var wrapper = field.closest(".field");
      if (wrapper) wrapper.classList.toggle("has-error", !!message);
    }
  }

  function clearErrors(ids) {
    ids.forEach(function (pair) { setFieldError(pair[0], pair[1], ""); });
  }

  /* ---------------- Enquiry form: validation + simulated processing ---------------- */

  var CLASS_INFO = {
    "MetroFit": {
      cost: "R450 / month",
      availability: "Open — morning (05:30) and evening (18:00) sessions have spots available Mon-Fri, plus Saturday mornings."
    },
    "Strength & Conditioning": {
      cost: "R550 / month",
      availability: "Limited — evening sessions (Mon/Wed) are close to capacity. Morning waitlist is open."
    },
    "MetroStart": {
      cost: "R350 / month",
      availability: "Open — beginner slots available Tuesday and Thursday mornings, ideal for your first four weeks."
    },
    "Not Sure Yet": {
      cost: "From R350 / month, depending on the class",
      availability: "A coach will review your goals and recommend the best-fit class and current availability."
    }
  };

  function initEnquiryForm() {
    var form = qs("enquiry-form");
    if (!form) return;

    form.addEventListener("submit", function (e) {
      e.preventDefault();

      var fieldPairs = [["name", "name-error"], ["email", "email-error"]];
      clearErrors(fieldPairs);

      var name = qs("name").value.trim();
      var email = qs("email").value.trim();
      var interest = qs("interest").value;
      var responseEl = qs("enquiry-response");

      var valid = true;

      if (name.length < 2) {
        setFieldError("name", "name-error", "Please enter your full name.");
        valid = false;
      }
      if (!EMAIL_PATTERN.test(email)) {
        setFieldError("email", "email-error", "Please enter a valid email address.");
        valid = false;
      }

      if (!valid) {
        responseEl.className = "form-response error";
        responseEl.textContent = "Please fix the highlighted fields and submit again.";
        return;
      }

      /* "Processing" step: look up cost & availability for the selected class */
      var info = CLASS_INFO[interest] || CLASS_INFO["Not Sure Yet"];

      responseEl.className = "form-response success";
      responseEl.innerHTML =
        "<h4>Enquiry Received</h4>" +
        "<p>Thanks, " + escapeHtml(name) + " \u2014 here's what we can tell you right away about <strong>" + escapeHtml(interest) + "</strong>:</p>" +
        "<p><strong>Cost:</strong> " + escapeHtml(info.cost) + "</p>" +
        "<p><strong>Availability:</strong> " + escapeHtml(info.availability) + "</p>" +
        "<p>A coach will also follow up by email at " + escapeHtml(email) + " to confirm your first session.</p>";

      form.reset();
    });
  }

  /* ---------------- Contact form: validation + compile & send email ---------------- */

  function initContactForm() {
    var form = qs("contact-form");
    if (!form) return;

    form.addEventListener("submit", function (e) {
      e.preventDefault();

      var fieldPairs = [
        ["c-name", "c-name-error"],
        ["c-email", "c-email-error"],
        ["c-type", "c-type-error"],
        ["c-message", "c-message-error"]
      ];
      clearErrors(fieldPairs);

      var name = qs("c-name").value.trim();
      var email = qs("c-email").value.trim();
      var type = qs("c-type").value;
      var message = qs("c-message").value.trim();
      var responseEl = qs("contact-response");

      var valid = true;

      if (name.length < 2) {
        setFieldError("c-name", "c-name-error", "Please enter your full name.");
        valid = false;
      }
      if (!EMAIL_PATTERN.test(email)) {
        setFieldError("c-email", "c-email-error", "Please enter a valid email address.");
        valid = false;
      }
      if (!type) {
        setFieldError("c-type", "c-type-error", "Please select a message type.");
        valid = false;
      }
      if (message.length < 10) {
        setFieldError("c-message", "c-message-error", "Please enter at least 10 characters.");
        valid = false;
      }

      if (!valid) {
        responseEl.className = "form-response error";
        responseEl.textContent = "Please fix the highlighted fields and submit again.";
        return;
      }

      /* "Processing" step: compile the validated input into an email and open it
         for the customer to send to the organisation's inbox (client-side email,
         no backend available — this is the standard approach for a static site). */
      var subject = "[MetroGym Website] " + type + " from " + name;
      var body =
        "Name: " + name + "\n" +
        "Email: " + email + "\n" +
        "Type: " + type + "\n\n" +
        "Message:\n" + message;

      var mailtoLink =
        "mailto:" + RECIPIENT_EMAIL +
        "?subject=" + encodeURIComponent(subject) +
        "&body=" + encodeURIComponent(body);

      responseEl.className = "form-response success";
      responseEl.innerHTML =
        "<h4>Message Ready To Send</h4>" +
        "<p>Thanks, " + escapeHtml(name) + " \u2014 your message has been compiled. Click below to send it to <strong>" + RECIPIENT_EMAIL + "</strong> from your own email app.</p>" +
        '<a href="' + mailtoLink + '" class="btn" style="margin-top:12px;">Send Email To MetroGym</a>';

      /* Also attempt to open the user's email client automatically. */
      window.location.href = mailtoLink;

      form.reset();
    });
  }

  function escapeHtml(str) {
    var div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
  }

  document.addEventListener("DOMContentLoaded", function () {
    initEnquiryForm();
    initContactForm();
  });
})();
