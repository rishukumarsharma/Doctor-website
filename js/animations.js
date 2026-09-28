/* ==========================================================================
   ANIMATIONS — scroll reveal, timeline step activation, counters
   Uses IntersectionObserver only. No animation libraries.
   ========================================================================== */

(function () {
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function initReveal() {
    const items = document.querySelectorAll(".reveal");
    if (!items.length) return;
    if (prefersReducedMotion) {
      items.forEach((el) => el.classList.add("is-visible"));
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -60px 0px" }
    );
    items.forEach((el) => observer.observe(el));
  }

  function initTimeline() {
    const steps = document.querySelectorAll(".timeline-step");
    if (!steps.length) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) entry.target.classList.add("is-active");
        });
      },
      { threshold: 0.5, rootMargin: "0px 0px -20% 0px" }
    );
    steps.forEach((el) => observer.observe(el));
  }

  function initCounters() {
    const counters = document.querySelectorAll("[data-counter]");
    if (!counters.length) return;
    const animate = (el) => {
      const target = parseFloat(el.dataset.counter);
      if (Number.isNaN(target) || prefersReducedMotion) {
        el.textContent = el.dataset.counter;
        return;
      }
      const duration = 1200;
      const start = performance.now();
      const suffix = el.dataset.counterSuffix || "";
      function tick(now) {
        const progress = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        el.textContent = Math.round(target * eased) + suffix;
        if (progress < 1) requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
    };
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animate(entry.target);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.6 });
    counters.forEach((el) => observer.observe(el));
  }

  document.addEventListener("DOMContentLoaded", () => {
    initReveal();
    initTimeline();
    initCounters();
  });
})();
