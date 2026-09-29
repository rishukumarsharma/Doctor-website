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
    type: null,
    date: null,
    time: null,
    name: "",
    phone: "",
    email: "",
    notes: "",
  };

  const totalSteps = 6;

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

    container.querySelectorAll(".option-card").forEach((card) => {
      card.addEventListener("click", () => {
        container.querySelectorAll(".option-card").forEach((c) => c.classList.remove("is-selected"));
        card.classList.add("is-selected");
        state.service = card.dataset.serviceName;
        window.trackEvent?.("select_service", { service: state.service });
        updateNextEnabled();
      });
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
    container.querySelectorAll(".option-card").forEach((card) => {
      card.addEventListener("click", () => {
        container.querySelectorAll(".option-card").forEach((c) => c.classList.remove("is-selected"));
        card.classList.add("is-selected");
        state.type = card.querySelector("strong").textContent;
        updateNextEnabled();
      });
    });
  }

  function renderDateOptions() {
    const container = root.querySelector("[data-step-date]");
    const input = document.createElement("input");
    input.type = "date";
    input.className = "select-input";
    input.min = new Date().toISOString().split("T")[0];
    input.addEventListener("change", () => {
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
    container.querySelectorAll(".time-slot:not(.is-disabled)").forEach((slot) => {
      slot.addEventListener("click", () => {
        container.querySelectorAll(".time-slot").forEach((s) => s.classList.remove("is-selected"));
        slot.classList.add("is-selected");
        state.time = slot.dataset.time;
        window.trackEvent?.("select_time", { time: state.time });
        updateNextEnabled();
      });
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
      });
      setTimeout(() => goToStep(6), 900);
    });
  }

  function init() {
    renderServiceOptions();
    renderTypeOptions();
    renderDateOptions();
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
