/* ==========================================================================
   MAIN — data binding, WhatsApp float, mobile sticky CTA, FAQ accordion,
   plan selector, analytics event stubs. Runs on every page.
   ========================================================================== */

(function () {
  const DATA = window.SITE_DATA;
  if (!DATA) return;

  /* ---------------- Analytics & Google Ads Conversion Tracking ---------------- */
  // The gtag.js loader and config calls live in each page's <head>.
  const isDev = location.hostname === "localhost" || location.hostname === "127.0.0.1";

  function sendGoogleAdsConversion(conversionLabel, extraPayload) {
    if (!conversionLabel || typeof window.gtag !== "function") return;

    let sendTo = String(conversionLabel).trim();
    if (!sendTo) return;

    // Support either just the label (e.g. "AbCdEf123") or full target ("AW-XXXXXXXXX/AbCdEf123")
    if (DATA.googleAds && DATA.googleAds.conversionId && !sendTo.includes("/") && !sendTo.startsWith("AW-")) {
      sendTo = `${DATA.googleAds.conversionId}/${sendTo}`;
    }

    // Skip if placeholder
    if (sendTo.includes("AW-XXXXXXXXX") || sendTo.includes("CONVERSION_LABEL") || sendTo.includes("XXXXXXXXX")) {
      if (isDev) {
        console.log("[google-ads] Skipping conversion due to placeholder ID/label:", sendTo);
      }
      return;
    }

    const convData = {
      send_to: sendTo,
      currency: DATA.googleAds?.currency || "INR",
      ...(extraPayload || {})
    };

    window.gtag("event", "conversion", convData);

    if (isDev) {
      console.log("[google-ads] Conversion sent:", convData);
    }
  }

  /* ---------------- Meta Pixel (loads lazily, like the Google tag) ---------------- */
  const metaPixelId = DATA.metaPixel && String(DATA.metaPixel.id || "").trim();
  if (metaPixelId && !window.fbq) {
    const q = (window.fbq = function () { q.callMethod ? q.callMethod.apply(q, arguments) : q.queue.push(arguments); });
    q.push = q; q.loaded = true; q.version = "2.0"; q.queue = [];
    window.fbq("init", metaPixelId);
    window.fbq("track", "PageView");
    let pixelLoaded = false;
    const loadPixel = () => {
      if (pixelLoaded) return;
      pixelLoaded = true;
      const s = document.createElement("script");
      s.async = true;
      s.src = "https://connect.facebook.net/en_US/fbevents.js";
      document.head.appendChild(s);
    };
    ["pointerdown", "keydown", "scroll", "touchstart"].forEach((e) => window.addEventListener(e, loadPixel, { once: true, passive: true }));
    window.addEventListener("load", () => setTimeout(loadPixel, 3500));
  }
  const META_EVENTS = {
    confirm_booking: ["track", "Lead"],
    contact_form_submitted: ["track", "Lead"],
    click_whatsapp: ["track", "Contact"],
    click_phone: ["track", "Contact"],
    start_booking: ["trackCustom", "StartBooking"],
  };

  function track(eventName, payload) {
    if (metaPixelId && window.fbq && META_EVENTS[eventName]) {
      window.fbq(META_EVENTS[eventName][0], META_EVENTS[eventName][1]);
    }
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({ event: eventName, ...payload });
    if (typeof window.gtag === "function") {
      window.gtag("event", eventName, payload || {});
    }

    // Map site actions to Google Ads conversions and GA4 standard events
    const ads = DATA.googleAds || {};
    const labels = ads.labels || {};

    switch (eventName) {
      case "confirm_booking":
        sendGoogleAdsConversion(labels.bookingConfirmed, { value: 1.0, ...payload });
        if (typeof window.gtag === "function") {
          window.gtag("event", "generate_lead", {
            event_category: "Booking",
            event_label: payload?.service || "Consultation",
            value: 1.0,
            currency: ads.currency || "INR",
          });
        }
        break;

      case "start_booking":
        sendGoogleAdsConversion(labels.bookingStarted, payload);
        break;

      case "click_whatsapp":
        sendGoogleAdsConversion(labels.whatsappClick, payload);
        if (typeof window.gtag === "function") {
          window.gtag("event", "contact", { method: "WhatsApp" });
        }
        break;

      case "click_phone":
        sendGoogleAdsConversion(labels.phoneClick, payload);
        if (typeof window.gtag === "function") {
          window.gtag("event", "contact", { method: "Phone" });
        }
        break;

      case "contact_form_submitted":
        sendGoogleAdsConversion(labels.contactFormSubmit, payload);
        if (typeof window.gtag === "function") {
          window.gtag("event", "generate_lead", {
            event_category: "Contact Form",
            event_label: "Inquiry",
          });
        }
        break;
    }

    if (isDev) {
      console.log("[analytics]", eventName, payload || {});
    }
  }
  window.trackEvent = track;
  window.sendGoogleAdsConversion = sendGoogleAdsConversion;


  /* ---------------- Google Sheet webhook (shared by booking + contact forms) ---------------- */
  // Readable IST timestamp for the sheet, e.g. "29 Sep 2026, 12:43 PM".
  function formatTimestamp(date) {
    return new Intl.DateTimeFormat("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
      timeZone: "Asia/Kolkata",
    })
      .format(date)
      .replace(" at ", ", ");
  }

  // GET rather than POST: Apps Script relays POST bodies through a second
  // domain, which fails in browsers that block cross-site cookies.
  // Resolves on send, rejects on network failure (the no-cors response is opaque).
  function submitToSheet(data) {
    const url = DATA.contact && DATA.contact.sheetWebhookUrl;
    if (!url) return Promise.reject(new Error("Sheet webhook URL not configured"));
    return fetch(url + "?" + new URLSearchParams(data).toString(), { mode: "no-cors" });
  }
  window.formatTimestamp = formatTimestamp;
  window.submitToSheet = submitToSheet;

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

  /* ---------------- WhatsApp floating button ---------------- */
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
  }

  /* ---------------- Sticky offer bar (countdown + book button, every page) ---------------- */
  function initOfferBar() {
    if (document.querySelector(".offer-bar")) return;

    const DURATION_SECONDS = 5 * 60;
    const STORAGE_KEY = "offerBarExpiresAt";
    let expiresAt = 0;
    try {
      expiresAt = Number(sessionStorage.getItem(STORAGE_KEY));
    } catch (e) { }
    if (!expiresAt || expiresAt < Date.now()) {
      expiresAt = Date.now() + DURATION_SECONDS * 1000;
      try {
        sessionStorage.setItem(STORAGE_KEY, String(expiresAt));
      } catch (e) {
        /* sessionStorage unavailable (private mode, etc.) — timer just won't persist across pages */
      }
    }

    const bar = document.createElement("div");
    bar.className = "offer-bar";
    bar.innerHTML = `
      <div class="offer-copy">Offer Will Expire in
        <span class="offer-timer"><strong data-offer-min>05</strong> Minutes <strong data-offer-sec>00</strong> Seconds</span>
      </div>
      <a class="btn btn-primary" href="${window.SITE_BASE}book-consultation/" data-track="click_book_consultation">Book Your Consultation</a>
    `;
    document.body.appendChild(bar);

    const minEl = bar.querySelector("[data-offer-min]");
    const secEl = bar.querySelector("[data-offer-sec]");

    function tick() {
      let remaining = Math.round((expiresAt - Date.now()) / 1000);
      if (remaining <= 0) {
        expiresAt = Date.now() + DURATION_SECONDS * 1000;
        try {
          sessionStorage.setItem(STORAGE_KEY, String(expiresAt));
        } catch (e) { }
        remaining = DURATION_SECONDS;
      }
      minEl.textContent = String(Math.floor(remaining / 60)).padStart(2, "0");
      secEl.textContent = String(remaining % 60).padStart(2, "0");
    }

    tick();
    setInterval(tick, 1000);
  }

  /* ---------------- Generic CTA & Phone click tracking ---------------- */
  function initCtaTracking() {
    document.querySelectorAll("[data-track]").forEach((el) => {
      el.addEventListener("click", () => track(el.getAttribute("data-track")));
    });

    // Automatically track phone call clicks across the site
    document.querySelectorAll('a[href^="tel:"], [data-bind-href="contact.telLink"]').forEach((el) => {
      el.addEventListener("click", () => track("click_phone", { method: "phone" }));
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
  function parseRupee(str) {
    if (!str) return 0;
    if (/free/i.test(str)) return 0;
    return Number(String(str).replace(/[^\d]/g, "")) || 0;
  }

  function renderPlanSelector() {
    const grid = document.querySelector("[data-plan-grid]");
    if (!grid) return;

    grid.innerHTML = DATA.programs
      .map((p) => {
        const origAmount = parseRupee(p.originalPrice);
        const priceAmount = parseRupee(p.price);
        const savings = origAmount - priceAmount;
        const discountPct = p.originalPrice && origAmount > 0 && priceAmount > 0 ? Math.round((savings / origAmount) * 100) : null;
        return `
      <div class="plan-card" data-plan-id="${p.id}" data-price="${p.price}" data-name="${p.name}" data-savings="${savings}" tabindex="0" role="button" aria-pressed="false">
        ${p.recommended ? '<span class="badge">Recommended</span>' : ""}
        <span class="check" aria-hidden="true"></span>
        <div class="plan-card-top">
          <span class="duration">${p.duration}</span>
          ${discountPct ? `<span class="discount-badge">Save ${discountPct}%</span>` : ""}
        </div>
        <div class="price">${p.price}${p.originalPrice ? ` <span>${p.originalPrice}</span>` : ""}</div>
        <p class="tagline">${p.description}</p>
        <ul>${p.features.map((f) => `<li>${f}</li>`).join("")}</ul>
      </div>`;
      })
      .join("");

    const summaryValue = document.querySelector("[data-selection-value]");
    const summaryLabel = document.querySelector("[data-selection-name]");
    const summarySave = document.querySelector("[data-selection-save]");
    const continueBtn = document.querySelector("[data-plan-continue]");
    const goalSelect = document.querySelector("[data-goal-select]");

    function updateContinueHref() {
      if (!continueBtn) return;
      const planId = grid.querySelector(".plan-card.is-selected")?.dataset.planId;
      const params = new URLSearchParams();
      if (planId) params.set("program", planId);
      if (goalSelect && goalSelect.value) params.set("goal", goalSelect.value);
      continueBtn.href = `${window.SITE_BASE}book-consultation/?${params.toString()}`;
    }

    function selectPlan(card) {
      grid.querySelectorAll(".plan-card").forEach((c) => {
        c.classList.remove("is-selected");
        c.setAttribute("aria-pressed", "false");
      });
      card.classList.add("is-selected");
      card.setAttribute("aria-pressed", "true");
      if (summaryValue) summaryValue.textContent = card.dataset.price;
      if (summaryLabel) summaryLabel.textContent = card.dataset.name + " Program";
      if (summarySave) {
        const savings = Number(card.dataset.savings) || 0;
        summarySave.textContent = savings > 0 ? `You save ₹${savings.toLocaleString("en-IN")}` : "";
      }
      updateContinueHref();
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

    if (goalSelect) goalSelect.addEventListener("change", updateContinueHref);

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
    initOfferBar();
    initCtaTracking();
    initFaqAccordion();
    populateConsultationGoals();
    renderPlanSelector();
  });
})();
