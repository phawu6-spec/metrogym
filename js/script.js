/* =====================================================================
   MetroGym — site scripts (Part 3: Functionality & SEO)
   Vanilla JavaScript, no frameworks. Every feature checks that its
   page elements exist, so one file safely serves all five pages.

   Features:
   1. Navigation      – closes the mobile menu after a link is chosen
   2. Scroll reveal   – CSS animation triggered by IntersectionObserver
   3. Today widget    – dynamic content: today's classes + open/closed status
   4. Class explorer  – search, filter and sort (services.html)
   5. Accordion       – FAQ (services.html)
   6. Gallery         – clickable thumbnails + lightbox (about.html)
   7. Map             – Leaflet + OpenStreetMap, two locations (contact.html)
   8. Enquiry form    – HTML5 + JS validation, AJAX lookup (enquiry.html)
   9. Contact form    – HTML5 + JS validation, compiled email (contact.html)
   ===================================================================== */

(function () {
  "use strict";

  /* ---------- Settings (change the recipient here) ---------- */
  var RECIPIENT_EMAIL = "info@metrogym.co.za";   // contact + enquiry emails are addressed to this
  var DATA_URL = "data/classes.json";            // prices, availability and timetable
  var GYM_TIMEZONE = "Africa/Johannesburg";
  var DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

  /* ---------- Small helpers ---------- */
  function $(selector, root) { return (root || document).querySelector(selector); }
  function $all(selector, root) { return Array.prototype.slice.call((root || document).querySelectorAll(selector)); }

  /* Build an element safely. User text always goes in via textContent, never innerHTML. */
  function make(tag, className, text) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined && text !== null) node.textContent = text;
    return node;
  }

  function clear(node) { while (node.firstChild) node.removeChild(node.firstChild); }

  function formatRand(amount) { return "R" + amount.toLocaleString("en-ZA"); }

  function pad(n) { return (n < 10 ? "0" : "") + n; }

  function timeToMinutes(hhmm) {
    var parts = hhmm.split(":");
    return parseInt(parts[0], 10) * 60 + parseInt(parts[1], 10);
  }

  /* Current day/time in the gym's own time zone (so visitors abroad still see correct hours). */
  function gymNow() {
    var parts = new Intl.DateTimeFormat("en-GB", {
      timeZone: GYM_TIMEZONE, weekday: "short", hour: "2-digit", minute: "2-digit", hour12: false
    }).formatToParts(new Date());
    var map = {};
    parts.forEach(function (p) { map[p.type] = p.value; });
    var dayIndex = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 }[map.weekday];
    return { day: dayIndex, minutes: parseInt(map.hour, 10) % 24 * 60 + parseInt(map.minute, 10) };
  }

  /* Today's date as YYYY-MM-DD in the gym's time zone (used for the date picker limits). */
  function gymToday() {
    var parts = new Intl.DateTimeFormat("en-CA", {
      timeZone: GYM_TIMEZONE, year: "numeric", month: "2-digit", day: "2-digit"
    }).format(new Date());
    return parts; // en-CA gives YYYY-MM-DD
  }

  function addDaysISO(iso, days) {
    var d = new Date(iso + "T12:00:00Z");
    d.setUTCDate(d.getUTCDate() + days);
    return d.toISOString().slice(0, 10);
  }

  function weekdayOfISO(iso) { return new Date(iso + "T12:00:00Z").getUTCDay(); }

  function prettyDate(iso) {
    return new Date(iso + "T12:00:00Z").toLocaleDateString("en-ZA", {
      weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: "UTC"
    });
  }

  function dayList(days) { return days.map(function (d) { return DAY_NAMES[d].slice(0, 3); }).join(", "); }

  /* ---------- AJAX: load prices / availability / timetable once, reuse everywhere ---------- */
  var dataPromise = null;
  function loadData() {
    if (!dataPromise) {
      dataPromise = fetch(DATA_URL, { headers: { Accept: "application/json" } })
        .then(function (res) {
          if (!res.ok) throw new Error("HTTP " + res.status);
          return res.json();
        })
        .catch(function (err) {
          dataPromise = null;           // allow a retry next time
          throw err;
        });
    }
    return dataPromise;
  }

  function findClass(data, id) {
    for (var i = 0; i < data.classes.length; i++) if (data.classes[i].id === id) return data.classes[i];
    return null;
  }

  /* =====================================================================
     1. NAVIGATION — the menu opens with CSS (checkbox); JS closes it
        after a link is chosen or Escape is pressed, and keeps ARIA in sync.
     ===================================================================== */
  function initNav() {
    var toggle = $("#nav-toggle");
    var label = $(".nav-toggle-label");
    if (!toggle) return;

    if (label) {
      label.setAttribute("role", "button");
      label.setAttribute("aria-expanded", "false");
      label.setAttribute("aria-controls", "site-nav");
      label.setAttribute("tabindex", "0");
      label.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); toggle.checked = !toggle.checked; sync(); }
      });
    }
    function sync() { if (label) label.setAttribute("aria-expanded", String(toggle.checked)); }
    toggle.addEventListener("change", sync);

    $all("nav a").forEach(function (a) {
      a.addEventListener("click", function () { toggle.checked = false; sync(); });
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && toggle.checked) { toggle.checked = false; sync(); if (label) label.focus(); }
    });
  }

  /* =====================================================================
     2. SCROLL REVEAL — subtle fade/slide-in animation for cards and sections
     ===================================================================== */
  function initReveal() {
    var items = $all(".reveal");
    if (!items.length) return;
    if (!("IntersectionObserver" in window)) {
      items.forEach(function (el) { el.classList.add("is-visible"); });
      return;
    }
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    items.forEach(function (el) { observer.observe(el); });
  }

  /* =====================================================================
     3. TODAY WIDGET + OPEN/CLOSED BADGE — dynamic content from JSON + the clock
     ===================================================================== */
  function openStatus(data) {
    var now = gymNow();
    var today = data.hours[String(now.day)];
    if (today) {
      var open = timeToMinutes(today[0]);
      var close = timeToMinutes(today[1]);
      if (now.minutes >= open && now.minutes < close) {
        return { open: true, text: "Open now · closes " + today[1] };
      }
      if (now.minutes < open) return { open: false, text: "Closed · opens today at " + today[0] };
    }
    for (var i = 1; i <= 7; i++) {
      var d = (now.day + i) % 7;
      if (data.hours[String(d)]) {
        return { open: false, text: "Closed · opens " + DAY_NAMES[d] + " at " + data.hours[String(d)][0] };
      }
    }
    return { open: false, text: "Closed" };
  }

  function initOpenBadges(data) {
    var status = openStatus(data);
    $all("[data-open-status]").forEach(function (badge) {
      badge.textContent = status.text;
      badge.className = "badge " + (status.open ? "open" : "closed");
    });
  }

  function initTodayWidget(data) {
    var host = $("#today-widget");
    if (!host) return;
    var now = gymNow();
    var list = (data.schedule[String(now.day)] || []);

    clear(host);
    var card = make("div", "today-card");
    card.appendChild(make("h3", "", "Today at MetroGym"));
    card.appendChild(make("p", "today-date", DAY_NAMES[now.day] + " · Gqeberha time"));

    var badge = make("span", "badge");
    badge.setAttribute("data-open-status", "");
    card.appendChild(badge);

    if (!list.length) {
      card.appendChild(make("p", "today-note", "No classes today. We are closed on Sundays — see you Monday morning."));
    } else {
      var ul = make("ul", "today-list");
      var nextMarked = false;
      list.forEach(function (entry) {
        var cls = findClass(data, entry[1]);
        var li = make("li");
        var upcoming = timeToMinutes(entry[0]) >= now.minutes;
        if (upcoming && !nextMarked) { li.className = "t-next"; nextMarked = true; }
        li.appendChild(make("span", "t-time", entry[0]));
        var info = make("span");
        info.appendChild(make("strong", "", cls ? cls.name : entry[1]));
        var state = upcoming ? (li.className ? " — up next" : " — later today") : " — finished for today";
        info.appendChild(document.createTextNode(state));
        li.appendChild(info);
        ul.appendChild(li);
      });
      card.appendChild(ul);
    }
    host.appendChild(card);
    initOpenBadges(data);
  }

  /* Highlight today's row in the static timetable (services.html) */
  function initScheduleHighlight() {
    var rows = $all("tr[data-day]");
    if (!rows.length) return;
    var today = String(gymNow().day);
    rows.forEach(function (row) {
      if (row.getAttribute("data-day") === today) row.classList.add("today-row");
    });
  }

  /* =====================================================================
     4. CLASS EXPLORER — search, filter and sort the class cards
     ===================================================================== */
  function initClassExplorer() {
    var grid = $("#class-grid");
    if (!grid) return;

    var search = $("#class-search");
    var level = $("#class-level");
    var time = $("#class-time");
    var sort = $("#class-sort");
    var count = $("#class-count");
    var empty = $("#class-empty");
    var reset = $("#class-reset");
    var cards = $all(".class-card", grid);

    function apply() {
      var q = search.value.trim().toLowerCase();
      var visible = 0;

      cards.forEach(function (card) {
        var haystack = (card.getAttribute("data-name") + " " + card.getAttribute("data-keywords")).toLowerCase();
        var okSearch = !q || haystack.indexOf(q) !== -1;
        var okLevel = level.value === "all" || card.getAttribute("data-level") === level.value;
        var okTime = time.value === "all" || card.getAttribute("data-times").split(" ").indexOf(time.value) !== -1;
        var show = okSearch && okLevel && okTime;

        var wasHidden = card.hidden;
        card.hidden = !show;
        if (show) {
          visible++;
          if (wasHidden) { card.classList.remove("pop-in"); void card.offsetWidth; card.classList.add("pop-in"); }
        }
      });

      // sort the visible/hidden cards by re-appending them in order
      var sorted = cards.slice().sort(function (a, b) {
        if (sort.value === "price-asc") return a.getAttribute("data-price") - b.getAttribute("data-price");
        if (sort.value === "price-desc") return b.getAttribute("data-price") - a.getAttribute("data-price");
        return a.getAttribute("data-name").localeCompare(b.getAttribute("data-name"));
      });
      sorted.forEach(function (card) { grid.appendChild(card); });

      count.textContent = "Showing " + visible + " of " + cards.length + " classes";
      empty.hidden = visible !== 0;
    }

    [search, level, time, sort].forEach(function (control) {
      control.addEventListener(control === search ? "input" : "change", apply);
    });
    reset.addEventListener("click", function () {
      search.value = ""; level.value = "all"; time.value = "all"; sort.value = "name";
      apply(); search.focus();
    });
    apply();
  }

  /* =====================================================================
     5. ACCORDION — FAQ panels open/close with an animated height
     ===================================================================== */
  function initAccordion() {
    var items = $all(".accordion-item");
    if (!items.length) return;

    items.forEach(function (item) {
      var trigger = $(".accordion-trigger", item);
      var panel = $(".accordion-panel", item);
      if (!trigger || !panel) return;

      trigger.addEventListener("click", function () {
        var isOpen = trigger.getAttribute("aria-expanded") === "true";
        // close the others so only one answer is open at a time
        items.forEach(function (other) {
          var t = $(".accordion-trigger", other), p = $(".accordion-panel", other);
          t.setAttribute("aria-expanded", "false");
          p.style.maxHeight = "0px";
        });
        if (!isOpen) {
          trigger.setAttribute("aria-expanded", "true");
          panel.style.maxHeight = panel.scrollHeight + "px";
        }
      });
    });
  }

  /* =====================================================================
     6. GALLERY + LIGHTBOX — click a thumbnail to view the larger photo
     ===================================================================== */
  function initGallery() {
    var links = $all(".gallery-item");
    if (!links.length) return;

    var current = 0;
    var lastFocus = null;

    var box = make("div", "lightbox");
    box.setAttribute("role", "dialog");
    box.setAttribute("aria-modal", "true");
    box.setAttribute("aria-label", "Photo viewer");

    var figure = make("figure");
    var img = make("img");
    img.alt = "Selected gallery photo";
    var caption = make("figcaption");
    figure.appendChild(img);
    figure.appendChild(caption);

    var closeBtn = make("button", "lb-close", "\u00D7");
    closeBtn.type = "button"; closeBtn.setAttribute("aria-label", "Close photo viewer");
    var prevBtn = make("button", "lb-prev", "\u2039");
    prevBtn.type = "button"; prevBtn.setAttribute("aria-label", "Previous photo");
    var nextBtn = make("button", "lb-next", "\u203A");
    nextBtn.type = "button"; nextBtn.setAttribute("aria-label", "Next photo");

    box.appendChild(closeBtn); box.appendChild(prevBtn); box.appendChild(nextBtn); box.appendChild(figure);
    document.body.appendChild(box);

    function show(index) {
      current = (index + links.length) % links.length;
      var link = links[current];
      var thumb = $("img", link);
      img.src = link.getAttribute("href");
      img.alt = thumb ? thumb.alt : "";
      caption.textContent = (current + 1) + " / " + links.length + " — " + (link.getAttribute("data-caption") || img.alt);
    }
    function open(index) {
      lastFocus = document.activeElement;
      show(index);
      box.classList.add("open");
      requestAnimationFrame(function () { box.classList.add("show"); });
      document.body.style.overflow = "hidden";
      closeBtn.focus();
    }
    function close() {
      box.classList.remove("show");
      setTimeout(function () { box.classList.remove("open"); }, 250);
      document.body.style.overflow = "";
      if (lastFocus) lastFocus.focus();
    }

    links.forEach(function (link, i) {
      link.addEventListener("click", function (e) { e.preventDefault(); open(i); });
    });
    closeBtn.addEventListener("click", close);
    prevBtn.addEventListener("click", function () { show(current - 1); });
    nextBtn.addEventListener("click", function () { show(current + 1); });
    box.addEventListener("click", function (e) { if (e.target === box) close(); });

    document.addEventListener("keydown", function (e) {
      if (!box.classList.contains("open")) return;
      if (e.key === "Escape") close();
      else if (e.key === "ArrowLeft") show(current - 1);
      else if (e.key === "ArrowRight") show(current + 1);
      else if (e.key === "Tab") {         // keep keyboard focus inside the dialog
        var focusable = [closeBtn, prevBtn, nextBtn];
        var idx = focusable.indexOf(document.activeElement);
        e.preventDefault();
        focusable[(idx + (e.shiftKey ? -1 : 1) + focusable.length) % focusable.length].focus();
      }
    });

    // swipe left/right on touch screens
    var startX = null;
    box.addEventListener("touchstart", function (e) { startX = e.changedTouches[0].clientX; }, { passive: true });
    box.addEventListener("touchend", function (e) {
      if (startX === null) return;
      var dx = e.changedTouches[0].clientX - startX;
      if (Math.abs(dx) > 50) show(current + (dx < 0 ? 1 : -1));
      startX = null;
    }, { passive: true });
  }

  /* =====================================================================
     7. MAP — Leaflet + OpenStreetMap with two MetroGym locations
        (coordinates are approximate; MetroGym is a fictional organisation)
     ===================================================================== */
  function initMap() {
    var mapEl = $("#map");
    if (!mapEl) return;

    if (!window.L) {                     // library blocked/offline: show a helpful fallback
      mapEl.classList.add("map-fallback");
      mapEl.textContent = "The interactive map could not load. MetroGym is on Cape Road, Gqeberha.";
      return;
    }

    var locations = [
      { key: "main", name: "MetroGym — Cape Road", lat: -33.9456, lng: 25.5702,
        detail: "Main facility · Mon–Fri 05:00–20:00, Sat 07:00–12:00" },
      { key: "walmer", name: "MetroGym — Walmer (opening soon)", lat: -33.9787, lng: 25.5898,
        detail: "Second studio planned for Walmer, Gqeberha" }
    ];

    var map = L.map(mapEl, { scrollWheelZoom: false });
    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: "&copy; <a href=\"https://www.openstreetmap.org/copyright\">OpenStreetMap</a> contributors"
    }).addTo(map);

    var markers = {};
    var bounds = [];
    locations.forEach(function (loc) {
      var popup = make("div");
      popup.appendChild(make("strong", "", loc.name));
      popup.appendChild(make("br"));
      popup.appendChild(document.createTextNode(loc.detail));
      markers[loc.key] = L.marker([loc.lat, loc.lng], { title: loc.name, alt: loc.name }).addTo(map).bindPopup(popup);
      bounds.push([loc.lat, loc.lng]);
    });
    map.fitBounds(bounds, { padding: [40, 40] });
    map.on("focus", function () { map.scrollWheelZoom.enable(); });
    map.on("blur", function () { map.scrollWheelZoom.disable(); });

    // buttons that fly the map to each location
    $all("[data-map-target]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var key = btn.getAttribute("data-map-target");
        var loc = locations.filter(function (l) { return l.key === key; })[0];
        $all("[data-map-target]").forEach(function (b) { b.setAttribute("aria-pressed", String(b === btn)); });
        map.flyTo([loc.lat, loc.lng], 15, { duration: 0.8 });
        markers[key].openPopup();
      });
    });
  }

  /* =====================================================================
     FORM VALIDATION ENGINE (shared by both forms)
     Reads the same HTML5 attributes used in the markup (required, type,
     minlength, maxlength, pattern, min, max) and adds friendly messages
     plus storyline rules. novalidate is set here so JS controls messages;
     without JS the browser's own HTML5 validation still works.
     ===================================================================== */
  var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  function errorEl(field) { return document.getElementById(field.id + "-error"); }

  function labelOf(field) {
    var lab = field.id ? document.querySelector("label[for=\"" + field.id + "\"]") : null;
    return lab ? lab.textContent.replace("*", "").trim().toLowerCase() : "this field";
  }

  function showError(field, message) {
    var holder = field.closest(".field") || field.closest("fieldset");
    var err = errorEl(field);
    if (err) err.textContent = message || "";
    if (holder) holder.classList.toggle("has-error", !!message);
    if (field.type === "radio") {
      $all("input[name=\"" + field.name + "\"]", field.form).forEach(function (r) {
        r.setAttribute("aria-invalid", message ? "true" : "false");
      });
    } else {
      field.setAttribute("aria-invalid", message ? "true" : "false");
      if (err) field.setAttribute("aria-describedby", err.id);
    }
  }

  /* Returns an error message for one field, or "" when it is valid. */
  function checkField(field, form) {
    var type = field.type;
    var value = (type === "checkbox" || type === "radio") ? "" : field.value.trim();

    if (type === "radio") {
      var group = $all("input[name=\"" + field.name + "\"]", form);
      var chosen = group.some(function (r) { return r.checked; });
      if (group[0].required && !chosen) return field.getAttribute("data-msg") || "Please choose an option.";
      return "";
    }
    if (type === "checkbox") {
      if (field.required && !field.checked) return field.getAttribute("data-msg") || "Please tick this box to continue.";
      return "";
    }

    if (!value) {
      if (field.required) return field.getAttribute("data-msg") || ("Please enter " + labelOf(field) + ".");
      // phone becomes required when the visitor asks to be phoned back
      if (field.getAttribute("data-required-if-phone-reply") !== null) {
        var reply = form.querySelector("input[name=\"reply\"]:checked");
        if (reply && reply.value === "phone") return "Please enter a phone number so we can call you back.";
      }
      return "";
    }

    if (type === "email" && !EMAIL_RE.test(value)) return "Enter a valid email address, e.g. name@example.com.";

    if (type === "tel") {
      var digits = value.replace(/[\s\-()]/g, "");
      if (!/^(\+27|0)[0-9]{9}$/.test(digits)) return "Enter a valid South African number, e.g. 082 123 4567 or +27 82 123 4567.";
    }

    if (field.getAttribute("data-name-field") !== null && !/^[A-Za-z\u00C0-\u024F][A-Za-z\u00C0-\u024F'\u2019\-. ]*$/.test(value)) {
      return "Names can only contain letters, spaces, hyphens and apostrophes.";
    }

    var min = parseInt(field.getAttribute("minlength"), 10);
    var max = parseInt(field.getAttribute("maxlength"), 10);
    if (min && value.length < min) return "Please enter at least " + min + " characters (you have " + value.length + ").";
    if (max && value.length > max) return "Please keep this under " + max + " characters.";

    if (type === "date") {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(value) || isNaN(new Date(value + "T12:00:00Z"))) return "Enter a valid date.";
      if (field.min && value < field.min) return "Please choose today or a later date.";
      if (field.max && value > field.max) return "Please choose a date within the next 60 days.";
    }
    if (field.tagName === "SELECT" && field.required && !value) return field.getAttribute("data-msg") || "Please choose an option.";

    return "";
  }

  /* Validate every field in a form; returns the first invalid field (or null). */
  function validateForm(form) {
    var firstBad = null;
    var seenRadio = {};
    $all("input, select, textarea", form).forEach(function (field) {
      if (field.closest(".hp") || field.type === "submit" || field.type === "button") return;
      if (field.type === "radio") {
        if (seenRadio[field.name]) return;
        seenRadio[field.name] = true;
      }
      var msg = checkField(field, form);
      showError(field, msg);
      if (msg && !firstBad) firstBad = field;
    });
    return firstBad;
  }

  /* Live feedback: re-check a field as soon as the visitor leaves it or edits an invalid one. */
  function attachLiveValidation(form) {
    form.noValidate = true;
    $all("input, select, textarea", form).forEach(function (field) {
      if (field.closest(".hp")) return;
      var evt = (field.type === "checkbox" || field.type === "radio" || field.tagName === "SELECT") ? "change" : "blur";
      field.addEventListener(evt, function () { showError(field, checkField(field, form)); });
      field.addEventListener("input", function () {
        var holder = field.closest(".field");
        if (holder && holder.classList.contains("has-error")) showError(field, checkField(field, form));
      });
    });
  }

  function attachCounter(textarea, counterEl) {
    if (!textarea || !counterEl) return;
    var max = parseInt(textarea.getAttribute("maxlength"), 10);
    function update() { counterEl.textContent = textarea.value.length + " / " + max; }
    textarea.addEventListener("input", update);
    update();
  }

  function setResponse(box, kind, nodes) {
    box.className = "form-response " + kind;
    clear(box);
    nodes.forEach(function (n) { box.appendChild(n); });
    box.setAttribute("tabindex", "-1");
  }

  function errorSummary(box, firstBad) {
    setResponse(box, "error", [make("p", "", "Please fix the highlighted fields and submit again.")]);
    if (firstBad) firstBad.focus();
  }

  function isSpam(form) {
    var trap = $("input[name=\"website\"]", form);
    return trap && trap.value.trim() !== "";
  }

  function mailtoLink(subject, body) {
    return "mailto:" + RECIPIENT_EMAIL + "?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(body);
  }

  /* =====================================================================
     8. ENQUIRY FORM — about a specific class: validate, look up cost and
        availability asynchronously (fetch), then show a tailored answer.
     ===================================================================== */
  function initEnquiryForm() {
    var form = $("#enquiry-form");
    if (!form) return;

    var responseBox = $("#enquiry-response");
    var submitBtn = $("button[type=\"submit\"]", form);
    var dateField = $("#start-date");
    var classField = $("#class");

    attachLiveValidation(form);
    attachCounter($("#message"), $("#message-count"));

    // sensible date limits: today up to 60 days ahead (set in the gym's time zone)
    var today = gymToday();
    dateField.min = today;
    dateField.max = addDaysISO(today, 60);

    // links from the classes page pre-select the class: enquiry.html?class=metrofit
    var wanted = new URLSearchParams(window.location.search).get("class");
    if (wanted) {
      $all("option", classField).forEach(function (o) { if (o.value === wanted) classField.value = wanted; });
    }

    // warm the cache so the answer feels instant
    loadData().catch(function () {});

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (isSpam(form)) return;                       // honeypot: bots fill the hidden field

      var firstBad = validateForm(form);
      if (firstBad) { errorSummary(responseBox, firstBad); return; }

      submitBtn.disabled = true;
      setResponse(responseBox, "loading", [make("p", "", "Checking class availability…")]);
      responseBox.setAttribute("aria-busy", "true");

      loadData().then(function (data) {
        var cls = findClass(data, classField.value);
        var slot = ($("input[name=\"session\"]:checked", form) || {}).value || "any";
        var iso = dateField.value;
        var weekday = weekdayOfISO(iso);

        // storyline rule: the class must actually run on the chosen start date
        var running = cls.sessions.filter(function (s) {
          return s.days.indexOf(weekday) !== -1 && (slot === "any" || s.slot === slot);
        });
        if (!running.length) {
          var runs = cls.sessions
            .filter(function (s) { return slot === "any" || s.slot === slot; })
            .map(function (s) { return dayList(s.days) + " at " + s.time; });
          var msg = runs.length
            ? cls.name + " (" + slot + ") runs " + runs.join(" and ") + ". Please pick one of those days."
            : cls.name + " has no " + slot + " sessions. Choose \"No preference\" or a different time.";
          showError(dateField, msg);
          setResponse(responseBox, "error", [make("p", "", "That start date doesn't match our timetable — see the message under the date field.")]);
          dateField.focus();
          return;
        }
        showError(dateField, "");

        var name = $("#name").value.trim();
        var email = $("#email").value.trim();
        var phone = $("#phone").value.trim();
        var note = $("#message").value.trim();
        var session = running[0];

        var list = make("ul", "response-list");
        [
          ["Class", cls.name + " — " + cls.summary],
          ["Cost", formatRand(cls.priceMonthly) + " per month. " + data.freeTrial],
          ["Your start date", prettyDate(iso) + " at " + session.time],
          ["Availability", session.spotsLeft > 0
            ? session.spotsLeft + " spot" + (session.spotsLeft === 1 ? "" : "s") + " left in this session."
            : "This session is currently full — we have added you to the waiting list."]
        ].forEach(function (row) {
          var li = make("li");
          li.appendChild(make("strong", "", row[0] + ": "));
          li.appendChild(document.createTextNode(row[1]));
          list.appendChild(li);
        });

        var body =
          "Name: " + name + "\nEmail: " + email + "\nPhone: " + (phone || "not given") + "\n" +
          "Class: " + cls.name + "\nPreferred time: " + slot + "\nStart date: " + iso + "\n\n" +
          "Message:\n" + (note || "(none)");
        var confirm = make("a", "btn", "Email this enquiry to MetroGym");
        confirm.href = mailtoLink("[MetroGym Enquiry] " + cls.name + " from " + name, body);

        setResponse(responseBox, "success", [
          make("h4", "", "Enquiry received, " + name.split(" ")[0]),
          make("p", "", "Here is what we can tell you right away:"),
          list,
          make("p", "", "To confirm your spot, send this enquiry to our team — we reply within one business day."),
          confirm
        ]);
        form.reset();
        $("#message-count").textContent = "0 / " + $("#message").getAttribute("maxlength");
        responseBox.focus();
      }).catch(function () {
        setResponse(responseBox, "error", [
          make("p", "", "We couldn't load live prices just now. Please try again, or email " + RECIPIENT_EMAIL + " and a coach will reply with cost and availability.")
        ]);
      }).then(function () {
        submitBtn.disabled = false;
        responseBox.removeAttribute("aria-busy");
      });
    });
  }

  /* =====================================================================
     9. CONTACT FORM — general message: validate, then compile the details
        into an email addressed to RECIPIENT_EMAIL.
     ===================================================================== */
  function initContactForm() {
    var form = $("#contact-form");
    if (!form) return;

    var responseBox = $("#contact-response");
    attachLiveValidation(form);
    attachCounter($("#c-message"), $("#c-message-count"));

    // when "phone" is chosen as the reply method, re-check the phone field straight away
    $all("input[name=\"reply\"]", form).forEach(function (r) {
      r.addEventListener("change", function () {
        var phone = $("#c-phone");
        if (phone.value || $(".field.has-error #c-phone")) showError(phone, checkField(phone, form));
      });
    });

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (isSpam(form)) return;

      var firstBad = validateForm(form);
      if (firstBad) { errorSummary(responseBox, firstBad); return; }

      var name = $("#c-name").value.trim();
      var email = $("#c-email").value.trim();
      var phone = $("#c-phone").value.trim();
      var type = $("#c-type").value;
      var subject = $("#c-subject").value.trim();
      var message = $("#c-message").value.trim();
      var reply = $("input[name=\"reply\"]:checked", form).value;

      var emailSubject = "[MetroGym Website] " + type + ": " + subject;
      var body =
        "Name: " + name + "\nEmail: " + email + "\nPhone: " + (phone || "not given") + "\n" +
        "Message type: " + type + "\nPreferred reply: " + reply + "\n\n" +
        "Subject: " + subject + "\n\n" + message;
      var link = mailtoLink(emailSubject, body);

      var list = make("ul", "response-list");
      [["To", RECIPIENT_EMAIL], ["Type", type], ["Subject", subject], ["Reply by", reply]].forEach(function (row) {
        var li = make("li");
        li.appendChild(make("strong", "", row[0] + ": "));
        li.appendChild(document.createTextNode(row[1]));
        list.appendChild(li);
      });
      var send = make("a", "btn", "Open email and send");
      send.href = link;

      setResponse(responseBox, "success", [
        make("h4", "", "Message ready to send"),
        make("p", "", "Thanks, " + name.split(" ")[0] + ". Your details are compiled into an email to MetroGym — opening your email app now. If nothing opens, use the button below."),
        list,
        send
      ]);
      responseBox.focus();
      form.reset();
      $("#c-message-count").textContent = "0 / " + $("#c-message").getAttribute("maxlength");
      window.location.href = link;
    });
  }

  /* =====================================================================
     Start-up
     ===================================================================== */
  function init() {
    initNav();
    initReveal();
    initClassExplorer();
    initAccordion();
    initGallery();
    initMap();
    initScheduleHighlight();
    initEnquiryForm();
    initContactForm();

    var year = $("#year");
    if (year) year.textContent = new Date().getFullYear();

    // pages that show live opening hours / today's timetable
    if ($("#today-widget") || $("[data-open-status]")) {
      loadData().then(function (data) {
        initTodayWidget(data);
        initOpenBadges(data);
      }).catch(function () {
        var host = $("#today-widget");
        if (host) {
          clear(host);
          host.appendChild(make("p", "today-note", "Today's timetable is unavailable right now — see the full weekly schedule on the Classes page."));
        }
        $all("[data-open-status]").forEach(function (b) { b.textContent = "Hours: Mon–Fri 05:00–20:00, Sat 07:00–12:00"; });
      });
    }
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
