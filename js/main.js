/* ==========================================================================
   MAIN — data binding, WhatsApp float, mobile sticky CTA, FAQ accordion,
   plan selector, analytics event stubs. Runs on every page.
   ========================================================================== */

(function () {
  const DATA = window.SITE_DATA;
  if (!DATA) return;

  /* ---------------- Analytics (stub — wire to a real provider later) ---------------- */
  function track(eventName, payload) {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({ event: eventName, ...payload });
    if (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") {
      console.log("[analytics]", eventName, payload || {});
    }
  }
  window.trackEvent = track;

  /* ---------------- WhatsApp link helper ---------------- */
  function buildWhatsAppLink(prefill) {
    const number = DATA.contact.whatsapp.replace(/\D/g, "");
    const text = encodeURIComponent(prefill || "Hi, I'd like to know more about a consultation.");
    return `https://wa.me/${number}?text=${text}`;
  }
  window.buildWhatsAppLink = buildWhatsAppLink;

  /* ---------------- Data binding ---------------- */
  function resolvePath(obj, path) {
    return path.split(".").reduce((acc, key) => (acc == null ? acc : acc[key]), obj);
  }

  function applyDataBindings() {
    document.querySelectorAll("[data-bind]").forEach((el) => {
      const value = resolvePath(DATA, el.getAttribute("data-bind"));
      if (value != null) el.textContent = value;
    });
    document.querySelectorAll("[data-bind-href]").forEach((el) => {
      const key = el.getAttribute("data-bind-href");
      if (key === "contact.whatsappLink") {
        el.setAttribute("href", buildWhatsAppLink());
        return;
      }
      if (key === "contact.telLink") {
        el.setAttribute("href", "tel:" + DATA.contact.phone.replace(/[^\d+]/g, ""));
        return;
      }
      if (key === "contact.mailLink") {
        el.setAttribute("href", "mailto:" + DATA.contact.email);
        return;
      }
      const value = resolvePath(DATA, key);
      if (value != null) el.setAttribute("href", value);
    });
  }

  /* ---------------- WhatsApp floating button + mobile sticky CTA ---------------- */
  function injectGlobalCTAs() {
    if (!document.querySelector(".whatsapp-float")) {
      const wa = document.createElement("a");
      wa.className = "whatsapp-float";
      wa.href = buildWhatsAppLink();
      wa.target = "_blank";
      wa.rel = "noopener";
      wa.setAttribute("aria-label", "Chat on WhatsApp");
      wa.innerHTML =
        '<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 3a9 9 0 0 0-7.8 13.5L3 21l4.6-1.2A9 9 0 1 0 12 3Z"/><path d="M8.5 8.8c.2-.5.5-.5.8-.5h.6c.2 0 .4 0 .6.4l.7 1.7c.1.2 0 .4-.1.6l-.5.6c-.1.2-.2.3 0 .6.2.4.8 1.2 1.7 1.9.9.7 1.4.9 1.7 1 .2.1.4.1.5-.1l.6-.7c.2-.2.4-.2.6-.1l1.5.7c.2.1.4.2.4.4 0 .8-.3 1.6-1.1 1.9-.7.3-1.6.5-3.4-.6-1.9-1.1-3.1-2.7-3.4-3.2-.3-.5-1-1.6-.9-2.7.1-.6.4-1.1.7-1.5Z" fill="currentColor" stroke="none"/></svg>';
      wa.addEventListener("click", () => track("click_whatsapp"));
      document.body.appendChild(wa);
    }

    if (!document.querySelector(".mobile-sticky-cta")) {
      const bar = document.createElement("div");
      bar.className = "mobile-sticky-cta";
      bar.innerHTML = `
        <a class="btn btn-secondary" href="${buildWhatsAppLink()}" target="_blank" rel="noopener" data-track="click_whatsapp">WhatsApp</a>
        <a class="btn btn-primary" href="${window.SITE_BASE}book-consultation/" data-track="click_book_consultation">Book Consultation</a>
      `;
      document.body.appendChild(bar);
    }
  }

  /* ---------------- Generic CTA click tracking ---------------- */
  function initCtaTracking() {
    document.querySelectorAll("[data-track]").forEach((el) => {
      el.addEventListener("click", () => track(el.getAttribute("data-track")));
    });
  }

  /* ---------------- FAQ accordion ---------------- */
  function initFaqAccordion() {
    document.querySelectorAll(".faq-item").forEach((item) => {
      const question = item.querySelector(".faq-question");
      const answer = item.querySelector(".faq-answer");
      if (!question || !answer) return;
      question.setAttribute("aria-expanded", "false");
      question.addEventListener("click", () => {
        const isOpen = item.classList.contains("is-open");
        item
          .closest(".faq-list")
          ?.querySelectorAll(".faq-item.is-open")
          .forEach((openItem) => {
            if (openItem !== item) {
              openItem.classList.remove("is-open");
              openItem.querySelector(".faq-answer").style.maxHeight = null;
              openItem.querySelector(".faq-question").setAttribute("aria-expanded", "false");
            }
          });
        if (isOpen) {
          item.classList.remove("is-open");
          answer.style.maxHeight = null;
          question.setAttribute("aria-expanded", "false");
        } else {
          item.classList.add("is-open");
          answer.style.maxHeight = answer.scrollHeight + "px";
          question.setAttribute("aria-expanded", "true");
        }
      });
    });
  }

  /* ---------------- Journey + Plan selector (Section 18A) ---------------- */
  function renderPlanSelector() {
    const grid = document.querySelector("[data-plan-grid]");
    if (!grid) return;

    grid.innerHTML = DATA.programs
      .map(
        (p) => `
      <div class="plan-card" data-plan-id="${p.id}" data-price="${p.price}" data-name="${p.name}" tabindex="0" role="button" aria-pressed="false">
        ${p.recommended ? '<span class="badge">Recommended</span>' : ""}
        <span class="check" aria-hidden="true"></span>
        <div class="duration">${p.duration}</div>
        <div class="price">${p.price}</div>
        <p class="text-muted" style="font-size:.8rem">${p.description}</p>
        <ul>${p.features.map((f) => `<li>${f}</li>`).join("")}</ul>
      </div>`
      )
      .join("");

    const summaryValue = document.querySelector("[data-selection-value]");
    const summaryLabel = document.querySelector("[data-selection-name]");
    const continueBtn = document.querySelector("[data-plan-continue]");

    function selectPlan(card) {
      grid.querySelectorAll(".plan-card").forEach((c) => {
        c.classList.remove("is-selected");
        c.setAttribute("aria-pressed", "false");
      });
      card.classList.add("is-selected");
      card.setAttribute("aria-pressed", "true");
      if (summaryValue) summaryValue.textContent = card.dataset.price;
      if (summaryLabel) summaryLabel.textContent = card.dataset.name + " Program";
      if (continueBtn) continueBtn.href = `${window.SITE_BASE}book-consultation/?program=${card.dataset.planId}`;
      track("select_service", { plan: card.dataset.planId });
    }

    grid.querySelectorAll(".plan-card").forEach((card) => {
      card.addEventListener("click", () => selectPlan(card));
      card.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          selectPlan(card);
        }
      });
    });

    // Pre-select the recommended plan by default.
    const recommended = grid.querySelector('.plan-card[data-plan-id]');
    const defaultCard = Array.from(grid.querySelectorAll(".plan-card")).find(
      (c) => DATA.programs.find((p) => p.id === c.dataset.planId)?.recommended
    ) || recommended;
    if (defaultCard) selectPlan(defaultCard);
  }

  function populateConsultationGoals() {
    const select = document.querySelector("[data-goal-select]");
    if (!select) return;
    select.innerHTML = DATA.consultationGoals.map((g) => `<option>${g}</option>`).join("");
  }

  document.addEventListener("DOMContentLoaded", () => {
    applyDataBindings();
    injectGlobalCTAs();
    initCtaTracking();
    initFaqAccordion();
    populateConsultationGoals();
    renderPlanSelector();
  });
})();
