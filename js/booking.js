/* ==========================================================================
   BOOKING FLOW — multi-step vanilla JS wizard for book-consultation.html
   Steps: Service -> Type -> Date -> Time -> Details -> Summary/Confirm -> Confirmation
   Each booking is recorded to a Google Sheet on confirm; payment is handled
   separately by the team after the booking request comes through.
   ========================================================================== */

(function () {
  const DATA = window.SITE_DATA;
  const root = document.querySelector("[data-booking-app]");
  if (!DATA || !root) return;

  // Google Apps Script Web App URL that appends each booking as a row in a
  // Google Sheet. See README-booking-sheet.md for setup steps. Leave the
  // placeholder in place and bookings simply won't be recorded remotely.
  const BOOKING_SHEET_WEBHOOK_URL = "https://script.google.com/macros/s/AKfycbxLb9gQkTSILpg7eSlB_Vpi_l6hIDLEEiWvmWvrMDowWD5XmNfrw_CKcQW95CsZ-YNLeQ/exec";

  function submitBookingToSheet(data) {
    if (!BOOKING_SHEET_WEBHOOK_URL || BOOKING_SHEET_WEBHOOK_URL.indexOf("PASTE_YOUR") === 0) {
      console.warn("Booking sheet webhook URL not configured — booking was not recorded.");
      return;
    }
    // Sent as GET (data in the query string) rather than POST — Apps Script
    // Web Apps relay a POST body through a second domain, and that hop can
    // fail under browsers that block cross-site cookies. GET avoids it.
    const url = BOOKING_SHEET_WEBHOOK_URL + "?" + new URLSearchParams(data).toString();
    fetch(url, { mode: "no-cors" }).catch((err) => {
      console.error("Failed to record booking to Google Sheet", err);
    });
  }

  const state = {
    step: 1,
    service: null,
    treatment: new URLSearchParams(window.location.search).get("treatment") || "",
    type: null,
    date: null,
    time: null,
    name: "",
    phone: "",
    email: "",
    notes: "",
  };

  const totalSteps = 6;

  // Wires up "pick one card in this container" behaviour shared by the
  // service, type and time-slot steps: clicking a card clears any sibling
  // selection, marks the clicked one, runs onSelect, then re-checks the
  // step's Continue button.
  function selectOne(container, selector, onSelect) {
    container.querySelectorAll(selector).forEach((card) => {
      card.addEventListener("click", () => {
        container.querySelectorAll(selector).forEach((c) => c.classList.remove("is-selected"));
        card.classList.add("is-selected");
        onSelect(card);
        updateNextEnabled();
      });
    });
  }

  function renderServiceOptions() {
    const params = new URLSearchParams(window.location.search);
    const presetProgram = params.get("program");
    const container = root.querySelector("[data-step-service]");
    const allServices = [
      ...DATA.programs.map((p) => ({ id: p.id, name: p.name + " Program", price: p.price })),
    ];
    container.innerHTML = allServices
      .map(
        (s) => `
      <div class="option-card" data-service-id="${s.id}" data-service-name="${s.name}" role="button" tabindex="0">
        <strong>${s.name}</strong>
        <div class="text-muted" style="font-size:.85rem;margin-top:4px;">${s.price}</div>
      </div>`
      )
      .join("");

    selectOne(container, ".option-card", (card) => {
      state.service = card.dataset.serviceName;
      window.trackEvent?.("select_service", { service: state.service });
    });

    if (presetProgram) {
      const match = container.querySelector(`[data-service-id="${presetProgram}"]`);
      if (match) match.click();
    }
  }

  function renderTypeOptions() {
    const container = root.querySelector("[data-step-type]");
    const options = [
      { id: "online", label: "Online Consultation", desc: "Video call from anywhere" },
      { id: "in-clinic", label: "In-Clinic Consultation", desc: "In person at the clinic" },
    ];
    container.innerHTML = options
      .map(
        (o) => `
      <div class="option-card" data-type-id="${o.id}" role="button" tabindex="0">
        <strong>${o.label}</strong>
        <div class="text-muted" style="font-size:.85rem;margin-top:4px;">${o.desc}</div>
      </div>`
      )
      .join("");
    selectOne(container, ".option-card", (card) => {
      state.type = card.querySelector("strong").textContent;
    });
  }

  function renderDateOptions() {
    const container = root.querySelector("[data-step-date]");
    const input = document.createElement("input");
    input.type = "date";
    input.className = "select-input";
    const now = new Date();
    const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
    input.min = today;
    input.addEventListener("change", () => {
      // Typed-in past dates bypass the picker's min, so reject them here too.
      if (input.value && input.value < today) {
        input.value = "";
        state.date = null;
        updateNextEnabled();
        return;
      }
      state.date = input.value;
      window.trackEvent?.("select_date", { date: input.value });
      updateNextEnabled();
    });
    container.innerHTML = "";
    container.appendChild(input);
  }

  function renderTimeOptions() {
    const container = root.querySelector("[data-step-time]");
    const slots = ["10:00 AM", "11:00 AM", "12:30 PM", "2:00 PM", "3:30 PM", "5:00 PM", "6:00 PM", "6:45 PM"];
    // Deterministic placeholder unavailability so the "disabled slot" state is visible.
    const unavailable = new Set(["12:30 PM", "6:45 PM"]);
    container.innerHTML = `<div class="time-slot-grid">${slots
      .map(
        (t) =>
          `<div class="time-slot${unavailable.has(t) ? " is-disabled" : ""}" data-time="${t}">${t}</div>`
      )
      .join("")}</div>`;
    selectOne(container, ".time-slot:not(.is-disabled)", (slot) => {
      state.time = slot.dataset.time;
      window.trackEvent?.("select_time", { time: state.time });
    });
  }

  function setupPhoneInput() {
    const phone = root.querySelector('[name="phone"]');
    if (!phone) return;
    phone.setAttribute("inputmode", "numeric");
    phone.setAttribute("maxlength", "10");
    phone.setAttribute("pattern", "[0-9]{10}");
    phone.addEventListener("input", () => {
      phone.value = phone.value.replace(/\D/g, "").slice(0, 10);
    });
  }

  function validateDetailsForm() {
    const form = root.querySelector("[data-details-form]");
    let valid = true;
    const nameField = form.querySelector('[name="name"]');
    const phoneField = form.querySelector('[name="phone"]');
    const emailField = form.querySelector('[name="email"]');

    toggleError(nameField, nameField.value.trim().length < 2, "Please enter your full name.");
    toggleError(phoneField, !/^\d{10}$/.test(phoneField.value.trim()), "Please enter a valid 10-digit phone number.");
    toggleError(emailField, emailField.value && !/^\S+@\S+\.\S+$/.test(emailField.value), "Please enter a valid email address.");

    [nameField, phoneField, emailField].forEach((f) => {
      if (f.closest(".form-group").classList.contains("has-error")) valid = false;
    });
    return valid;
  }

  function toggleError(field, hasError, message) {
    const group = field.closest(".form-group");
    group.classList.toggle("has-error", hasError);
    const msg = group.querySelector(".error-msg");
    if (msg) msg.textContent = message;
  }

  function renderSummary() {
    const container = root.querySelector("[data-step-summary]");
    container.innerHTML = `
      ${state.treatment ? `<div class="summary-row"><span>Treatment</span><strong>${state.treatment.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c])}</strong></div>` : ""}
      <div class="summary-row"><span>Service</span><strong>${state.service || "—"}</strong></div>
      <div class="summary-row"><span>Consultation Type</span><strong>${state.type || "—"}</strong></div>
      <div class="summary-row"><span>Date</span><strong>${state.date || "—"}</strong></div>
      <div class="summary-row"><span>Time</span><strong>${state.time || "—"}</strong></div>
      <div class="summary-row"><span>Name</span><strong>${state.name}</strong></div>
      <div class="summary-row"><span>Phone</span><strong>${state.phone}</strong></div>
    `;
  }

  function updateNextEnabled() {
    const nextBtn = root.querySelector(`.booking-step[data-step="${state.step}"] [data-action="next"]`);
    if (!nextBtn) return;
    let enabled = true;
    if (state.step === 1) enabled = !!state.service;
    if (state.step === 2) enabled = !!state.type;
    if (state.step === 3) enabled = !!state.date && !!state.time;
    nextBtn.toggleAttribute("disabled", !enabled);
    nextBtn.style.opacity = enabled ? "1" : "0.5";
    nextBtn.style.pointerEvents = enabled ? "auto" : "none";
  }

  function goToStep(n) {
    state.step = n;
    root.querySelectorAll(".booking-step").forEach((el) => {
      el.classList.toggle("is-active", Number(el.dataset.step) === n);
    });
    root.querySelectorAll(".progress-step").forEach((el) => {
      const stepNum = Number(el.dataset.step);
      el.classList.toggle("is-active", stepNum === Math.min(n, totalSteps));
      el.classList.toggle("is-done", stepNum < n);
    });
    if (n === 5) renderSummary();
    updateNextEnabled();
    root.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  /* ---------------- Confirmation celebration (confetti + popup) ---------------- */
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function fireConfetti() {
    if (prefersReducedMotion) return;

    const canvas = document.createElement("canvas");
    canvas.className = "confetti-canvas";
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    document.body.appendChild(canvas);
    const ctx = canvas.getContext("2d");

    const colors = ["#3F5B4E", "#B5643F", "#CE8563", "#C9BFA9", "#F8F5EE"];
    const particles = Array.from({ length: 140 }, () => ({
      x: Math.random() * canvas.width,
      y: -20 - Math.random() * canvas.height * 0.4,
      size: 6 + Math.random() * 6,
      color: colors[Math.floor(Math.random() * colors.length)],
      speedY: 2 + Math.random() * 3,
      speedX: (Math.random() - 0.5) * 2,
      rotation: Math.random() * 360,
      rotationSpeed: (Math.random() - 0.5) * 10,
      shape: Math.random() > 0.5 ? "rect" : "circle",
    }));

    const duration = 3200;
    const start = performance.now();

    function frame(now) {
      const elapsed = now - start;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p) => {
        p.y += p.speedY;
        p.x += p.speedX;
        p.rotation += p.rotationSpeed;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.fillStyle = p.color;
        if (p.shape === "rect") {
          ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
        } else {
          ctx.beginPath();
          ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      });
      if (elapsed < duration) {
        requestAnimationFrame(frame);
      } else {
        canvas.remove();
      }
    }
    requestAnimationFrame(frame);
  }

  function showConfirmPopup() {
    const overlay = document.createElement("div");
    overlay.className = "confirm-popup-overlay";
    overlay.innerHTML = `
      <div class="confirm-popup-card" role="alertdialog" aria-modal="true" aria-labelledby="confirm-popup-title">
        <div class="confirm-popup-icon" aria-hidden="true">🎉</div>
        <h3 id="confirm-popup-title">Booking Request Sent!</h3>
        <p>Thank you — we've got your request. Our team will get back to you soon.</p>
        <button class="btn btn-primary confirm-popup-close" data-popup-close>Got It</button>
      </div>`;
    document.body.appendChild(overlay);
    requestAnimationFrame(() => overlay.classList.add("is-visible"));

    function close() {
      overlay.classList.remove("is-visible");
      document.removeEventListener("keydown", onKey);
      setTimeout(() => overlay.remove(), 300);
    }
    function onKey(e) {
      if (e.key === "Escape") close();
    }
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) close();
    });
    overlay.querySelector("[data-popup-close]").addEventListener("click", close);
    document.addEventListener("keydown", onKey);
  }

  function handleConfirmStep() {
    const confirmBtn = root.querySelector("[data-pay-action]");
    const statusEl = root.querySelector("[data-payment-status]");
    confirmBtn.addEventListener("click", () => {
      window.trackEvent?.("confirm_booking", { service: state.service });
      statusEl.textContent = "Booking request sent — our team will be in touch shortly.";
      statusEl.style.color = "var(--color-muted)";
      submitBookingToSheet({
        timestamp: new Date().toISOString(),
        service: state.service || "",
        type: state.type || "",
        date: state.date || "",
        time: state.time || "",
        name: state.name || "",
        phone: state.phone || "",
        email: state.email || "",
        notes: state.notes || "",
        treatment: state.treatment || "",
      });
      fireConfetti();
      showConfirmPopup();
      setTimeout(() => goToStep(6), 900);
    });
  }

  function init() {
    renderServiceOptions();
    renderTypeOptions();
    renderDateOptions();
    setupPhoneInput();
    renderTimeOptions();
    handleConfirmStep();

    root.querySelectorAll("[data-action='next']").forEach((btn) => {
      btn.addEventListener("click", () => {
        const current = state.step;
        if (current === 4) {
          const form = root.querySelector("[data-details-form]");
          state.name = form.querySelector('[name="name"]').value.trim();
          state.phone = form.querySelector('[name="phone"]').value.trim();
          state.email = form.querySelector('[name="email"]').value.trim();
          state.notes = form.querySelector('[name="notes"]').value.trim();
          if (!validateDetailsForm()) return;
          window.trackEvent?.("submit_booking", { service: state.service });
        }
        goToStep(Math.min(current + 1, totalSteps));
      });
    });
    root.querySelectorAll("[data-action='back']").forEach((btn) => {
      btn.addEventListener("click", () => goToStep(Math.max(state.step - 1, 1)));
    });

    goToStep(1);
    window.trackEvent?.("start_booking");
  }

  document.addEventListener("DOMContentLoaded", init);
})();
