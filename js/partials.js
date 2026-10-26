/* ==========================================================================
   PARTIALS — shared header/nav and footer markup, built from SITE_DATA.
   Pure template functions, no auto-execution. Each page calls these once,
   right where the header/footer used to sit as static HTML, so there is a
   single source of truth for the markup instead of 11 copies.
   ========================================================================== */

function renderHeaderNav() {
  const base = window.SITE_BASE || "./";
  const navItems = SITE_DATA.nav.map((n) => `<li><a href="${base}${n.href}">${n.label}</a></li>`).join("");

  return `
    <header class="site-header">
      <div class="container">
        <a href="${base}" class="brand">Dr. Amulya.S.M.<span>Slimming &amp; Aesthetics</span></a>
        <nav class="main-nav" aria-label="Primary">
          <ul id="nav-links">${navItems}</ul>
          <a href="${base}book-consultation/" class="btn btn-primary nav-cta" data-track="click_book_consultation">Book Now</a>
        </nav>
        <button class="nav-toggle" aria-label="Open menu" aria-expanded="false"><span></span><span></span><span></span></button>
      </div>
    </header>
    <div class="mobile-nav-panel">
      <ul id="mobile-nav-links">${navItems}</ul>
      <a href="${base}book-consultation/" class="btn btn-primary" data-track="click_book_consultation">Book Now</a>
    </div>
  `;
}

function renderFooter() {
  const base = window.SITE_BASE || "./";
  const navItems = SITE_DATA.nav.map((n) => `<li><a href="${base}${n.href}">${n.label}</a></li>`).join("");

  return `
    <footer class="site-footer">
      <div class="container">
        <div class="grid footer-grid">
          <div>
            <a href="${base}" class="brand">Dr. Amulya.S.M.<span>Slimming &amp; Aesthetics</span></a>
            <p style="margin-top:var(--space-3); color:rgba(248,245,238,0.7); font-size:var(--fs-small); max-width:32ch;">Personalized body slimming and facial aesthetics consultations.</p>
          </div>
          <div><h4>Explore</h4><ul class="footer-links">${navItems}</ul></div>
          <div><h4>Services</h4><ul class="footer-links">
            <li><a href="${base}body-slimming/">Body Slimming</a></li>
            <li><a href="${base}facial-aesthetics/">Facial Aesthetics</a></li>
            <li><a href="${base}pricing/">Pricing</a></li>
          </ul></div>
          <div><h4>Contact</h4><ul class="footer-links">
            <li><a href="#" data-bind-href="contact.telLink" data-bind="contact.phone"></a></li>
            <li><a href="#" data-bind-href="contact.mailLink" data-bind="contact.email"></a></li>
            <li data-bind="contact.timings"></li>
            <li><a href="https://www.instagram.com/nourishand_tone/" target="_blank" rel="noopener" aria-label="Instagram" style="display:inline-flex; align-items:center; gap:0.5rem;"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/></svg>Instagram</a></li>
            <li><a href="https://www.facebook.com/people/Nourishandtone-Nourishandtone/pfbid0TXY39F8ziTNoXzQcJfU3oSUTf6sqh8DSZnLoY71QDe2tgUaVwjquBmnXGHzeCdPDl/" target="_blank" rel="noopener" aria-label="Facebook" style="display:inline-flex; align-items:center; gap:0.5rem;"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>Facebook</a></li>
          </ul></div>
        </div>
        <div class="footer-bottom">
          <span>© <span id="year">${new Date().getFullYear()}</span> Dr. Amulya.S.M. All rights reserved.</span>
          <div class="footer-legal-links" style="display:flex; flex-wrap:wrap; gap:var(--space-4); font-size:var(--fs-small);">
            <a href="${base}faq/#disclaimer">Medical Disclaimer</a>
            <a href="${base}faq/#privacy">Privacy Policy</a>
            <a href="${base}faq/#terms">Terms</a>
            <a href="${base}faq/#cancellation">Cancellation &amp; Rescheduling</a>
          </div>
        </div>
      </div>
    </footer>
  `;
}
