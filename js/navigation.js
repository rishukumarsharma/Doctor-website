/* ==========================================================================
   NAVIGATION — sticky header state, mobile nav panel, active link
   ========================================================================== */

(function () {
  function initHeaderScroll() {
    const header = document.querySelector(".site-header");
    if (!header) return;
    const onScroll = () => {
      header.classList.toggle("is-scrolled", window.scrollY > 12);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  function initMobileNav() {
    const toggle = document.querySelector(".nav-toggle");
    const panel = document.querySelector(".mobile-nav-panel");
    if (!toggle || !panel) return;

    const close = () => {
      panel.classList.remove("is-open");
      toggle.setAttribute("aria-expanded", "false");
      document.body.style.overflow = "";
    };
    const open = () => {
      panel.classList.add("is-open");
      toggle.setAttribute("aria-expanded", "true");
      document.body.style.overflow = "hidden";
    };

    toggle.addEventListener("click", () => {
      panel.classList.contains("is-open") ? close() : open();
    });
    panel.querySelectorAll("a").forEach((a) => a.addEventListener("click", close));
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") close();
    });
  }

  function markActiveLink() {
    const path = window.location.pathname.split("/").pop() || "index.html";
    document.querySelectorAll(".main-nav a, .mobile-nav-panel a").forEach((a) => {
      const href = a.getAttribute("href");
      if (href === path) a.classList.add("is-active");
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    initHeaderScroll();
    initMobileNav();
    markActiveLink();
  });
})();
