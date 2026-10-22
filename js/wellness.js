/* ==========================================================================
   WELLNESS — client-side filtering for the Wellness Explorer and the
   "Find Your Wellness Plan" quiz. Data lives in data/wellness.json.
   Content maps to the clinic's two services: Body Slimming and
   Facial Aesthetics.
   ========================================================================== */

(function () {
  const base = window.SITE_BASE || "./";
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const track = (name, p) => { if (typeof window.gtag === "function") window.gtag("event", name, p || {}); };
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  const FILTERS = {
    goal: { label: "I'm interested in", all: "Everything", options: ["Body Slimming", "Facial Aesthetics"] },
    type: { label: "Type", all: "All types", options: ["Movement", "Nutrition", "Lifestyle", "Skin & Face"] },
    level: { label: "Difficulty", all: "All levels", options: ["Beginner", "Intermediate"] },
    time: { label: "Time needed", all: "Any time", options: [["short", "Under 10 min"], ["mid", "10–20 min"], ["long", "20+ min"]] },
    setup: { label: "What you need", all: "Anything", options: [["None", "Nothing at all"], ["Simple items", "Simple household items"]] },
  };
  const state = { goal: "all", type: "all", level: "all", time: "all", setup: "all" };
  let DATA = null;
  let lastFocus = null;

  /* Banner art per type: gradient + line icon. Used when an item has no `image`. */
  const ART = {
    "Movement": { a: "#3F5B4E", b: "#7FA08D", svg: '<circle cx="12" cy="5" r="2.5"/><path d="M12 8v6m-5-4 5 2 5-2M9 21l3-7 3 7"/>' },
    "Nutrition": { a: "#B5643F", b: "#E0A07F", svg: '<path d="M12 6c-3-3-8-1-8 4 0 5 4 10 8 10s8-5 8-10c0-5-5-7-8-4Z"/><path d="M12 6c0-2 1-3 3-4"/>' },
    "Lifestyle": { a: "#5C7C6C", b: "#B9CDBF", svg: '<path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5Z"/>' },
    "Skin & Face": { a: "#9A5B6B", b: "#E0B4BE", svg: '<path d="m12 3 2.6 5.4 5.9.9-4.3 4.2 1 5.9-5.2-2.8-5.2 2.8 1-5.9L3.5 9.3l5.9-.9Z"/>' },
  };
  function banner(it, cls) {
    if (it.image) return `<img class="${cls}" src="${base}${esc(it.image)}" alt="${esc(it.name)}" loading="lazy">`;
    const a = ART[it.type] || ART["Movement"];
    return `<div class="${cls} ${cls}--art" style="background:linear-gradient(135deg,${a.a},${a.b})" aria-hidden="true">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round">${a.svg}</svg></div>`;
  }

  /* ---------------- Explorer ---------------- */
  const TYPE_ICON = {
    "Movement": ART["Movement"].svg, "Nutrition": ART["Nutrition"].svg,
    "Lifestyle": ART["Lifestyle"].svg, "Skin & Face": ART["Skin & Face"].svg,
  };
  const icon = (path) => `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${path}</svg>`;
  const pair = (o) => (Array.isArray(o) ? o : [o, o]);

  function buildFilters() {
    const g = FILTERS.goal, t = FILTERS.type;
    const goalBtns = [["all", g.all], ...g.options.map(pair)]
      .map(([v, l]) => `<button type="button" class="seg-btn" data-filter="goal" data-value="${esc(v)}" aria-pressed="false">${esc(l)}</button>`).join("");
    const typeBtns = [["all", t.all], ...t.options.map(pair)]
      .map(([v, l]) => `<button type="button" class="type-pill" data-filter="type" data-value="${esc(v)}" aria-pressed="false">${TYPE_ICON[v] ? icon(TYPE_ICON[v]) : ""}${esc(l)}</button>`).join("");
    const selects = ["level", "time", "setup"].map((key) => {
      const f = FILTERS[key];
      return `<label class="sel"><span>${f.label}</span><select data-filter="${key}">${
        [["all", f.all], ...f.options.map(pair)].map(([v, l]) => `<option value="${esc(v)}">${esc(l)}</option>`).join("")
      }</select></label>`;
    }).join("");

    $("#filters").innerHTML = `
      <div class="filter-top">
        <span class="filter-label" id="goal-label">${g.label}</span>
        <div class="seg" role="group" aria-labelledby="goal-label">${goalBtns}</div>
      </div>
      <div class="filter-types" role="group" aria-label="${t.label}">${typeBtns}</div>
      <div class="filter-bottom">
        <div class="sels">${selects}</div>
        <div class="filter-status">
          <span class="count" id="result-count" aria-live="polite"></span>
          <button type="button" class="link-btn" id="reset-filters" hidden>Reset all</button>
        </div>
      </div>`;

    $("#filters").addEventListener("click", (e) => {
      const b = e.target.closest("button[data-filter]");
      if (!b) return;
      state[b.dataset.filter] = b.dataset.value;
      render();
      track("wellness_filter", { filter: b.dataset.filter, value: b.dataset.value });
    });
    $("#filters").addEventListener("change", (e) => {
      const sel = e.target.closest("select[data-filter]");
      if (!sel) return;
      state[sel.dataset.filter] = sel.value;
      render();
      track("wellness_filter", { filter: sel.dataset.filter, value: sel.value });
    });
    $("#reset-filters").addEventListener("click", () => { Object.keys(state).forEach((k) => (state[k] = "all")); render(); });
  }

  function matches(it) {
    if (state.goal !== "all" && !it.goal.includes(state.goal)) return false;
    if (state.type !== "all" && it.type !== state.type) return false;
    if (state.level !== "all" && it.level !== state.level) return false;
    if (state.setup !== "all" && it.setup !== state.setup) return false;
    if (state.time === "short" && it.duration >= 10) return false;
    if (state.time === "mid" && (it.duration < 10 || it.duration > 20)) return false;
    if (state.time === "long" && it.duration <= 20) return false;
    return true;
  }

  function render() {
    $$("button[data-filter]").forEach((c) => c.setAttribute("aria-pressed", String(state[c.dataset.filter] === c.dataset.value)));
    $$("select[data-filter]").forEach((c) => { c.value = state[c.dataset.filter]; c.classList.toggle("is-set", c.value !== "all"); });
    const list = DATA.items.filter(matches);
    $("#result-count").textContent = `${list.length} guide${list.length === 1 ? "" : "s"} found`;
    $("#reset-filters").hidden = Object.values(state).every((v) => v === "all");
    $("#ex-grid").innerHTML = list.length
      ? list.map((it) => `
        <button type="button" class="card ex-card" data-id="${it.id}" aria-haspopup="dialog">
          ${banner(it, "ex-media")}
          <div class="tag-row"><span class="tag tag--level-${it.level}">${it.level}</span><span class="tag">${esc(it.type)}</span></div>
          <h3>${esc(it.name)}</h3>
          <p>${esc(it.summary)}</p>
          <div class="ex-meta"><span>⏱ ${it.duration} min</span><span>${esc(it.goal.join(" · "))}</span></div>
        </button>`).join("")
      : `<div class="empty-state" style="grid-column:1/-1"><h3>Nothing matches those filters</h3><p>Try removing a filter — for example, set “What you need” back to “Anything”.</p></div>`;
    syncUrl();
  }

  function syncUrl() {
    const p = new URLSearchParams();
    Object.entries(state).forEach(([k, v]) => v !== "all" && p.set(k, v));
    const qs = p.toString();
    try { history.replaceState(null, "", location.pathname + (qs ? "?" + qs : "") + location.hash); } catch (e) {}
  }

  function readUrl() {
    const p = new URLSearchParams(location.search);
    Object.keys(state).forEach((k) => { if (p.has(k)) state[k] = p.get(k); });
  }

  function openDetail(id) {
    const it = DATA.items.find((e) => e.id === id);
    if (!it) return;
    const dlg = $("#ex-dialog");
    const isFace = it.goal.length === 1 && it.goal[0] === "Facial Aesthetics";
    const bookHref = `${base}book-consultation/` + (it.service ? `?treatment=${encodeURIComponent(it.service)}` : "");
    $("#ex-dialog-body").innerHTML = `
      ${banner(it, "ex-hero")}
      <div class="tag-row" style="margin-top:var(--space-3)"><span class="tag tag--level-${it.level}">${it.level}</span><span class="tag">${esc(it.type)}</span><span class="tag">${esc(it.goal.join(" · "))}</span></div>
      <h2 id="ex-dialog-title">${esc(it.name)}</h2>
      <p class="text-muted">${esc(it.summary)}</p>
      <p style="margin-top:var(--space-3)"><span class="rx">${esc(it.frequency)}</span> <span class="text-muted" style="font-size:var(--fs-small)">· about ${it.duration} min</span></p>
      <h4>How to do it</h4>
      <ol>${it.steps.map((s) => `<li>${esc(s)}</li>`).join("")}</ol>
      ${it.tips && it.tips.length ? `<h4>Helpful tips</h4><ul>${it.tips.map((t) => `<li>${esc(t)}</li>`).join("")}</ul>` : ""}
      ${it.note ? `<p class="care-note"><strong>Good to know:</strong> ${esc(it.note)}</p>` : ""}
      <div class="dialog-actions">
        <a class="btn btn-primary" href="${bookHref}" data-track="click_book_consultation">${it.service ? "Book: " + esc(it.service) : "Book a consultation"}</a>
        <a class="btn btn-secondary" href="${base}${isFace ? "facial-aesthetics/" : "body-slimming/"}">Learn about ${isFace ? "Facial Aesthetics" : "Body Slimming"}</a>
      </div>`;
    lastFocus = document.activeElement;
    if (typeof dlg.showModal === "function") dlg.showModal(); else dlg.setAttribute("open", "");
    $(".dialog-close", dlg).focus();
    track("wellness_guide_view", { guide: it.name });
  }

  function initExplorer() {
    buildFilters();
    readUrl();
    render();
    $("#ex-grid").addEventListener("click", (e) => {
      const c = e.target.closest(".ex-card");
      if (c) openDetail(c.dataset.id);
    });
    const dlg = $("#ex-dialog");
    const close = () => { dlg.close ? dlg.close() : dlg.removeAttribute("open"); if (lastFocus) lastFocus.focus(); };
    $(".dialog-close", dlg).addEventListener("click", close);
    dlg.addEventListener("click", (e) => { if (e.target === dlg) close(); });
  }

  /* ---------------- Quiz ---------------- */
  const quiz = { i: 0, answers: [] };

  function renderQuiz() {
    const Q = DATA.quiz.questions;
    const box = $("#quiz-body");
    if (quiz.i >= Q.length) return renderResult();
    const q = Q[quiz.i];
    $("#quiz-bar").style.width = (quiz.i / Q.length) * 100 + "%";
    box.innerHTML = `
      <div class="quiz-step">Question ${quiz.i + 1} of ${Q.length}</div>
      <h2 class="quiz-q" id="quiz-q">${esc(q.text)}</h2>
      <div class="quiz-options" role="radiogroup" aria-labelledby="quiz-q">
        ${q.options.map((o, n) => `<button type="button" class="quiz-option" role="radio" aria-checked="${quiz.answers[quiz.i] === n}" data-n="${n}">${esc(o.label)}</button>`).join("")}
      </div>
      <div class="quiz-nav">
        <button type="button" class="btn btn-secondary" id="quiz-back" ${quiz.i === 0 ? "disabled style='visibility:hidden'" : ""}>← Back</button>
      </div>`;
    $$(".quiz-option", box).forEach((b) => b.addEventListener("click", () => {
      quiz.answers[quiz.i] = Number(b.dataset.n);
      quiz.i++;
      renderQuiz();
      const heading = $("#quiz-q") || $("#quiz-result-title");
      heading.setAttribute("tabindex", "-1");
      heading.focus({ preventScroll: true });
    }));
    const back = $("#quiz-back");
    if (back) back.addEventListener("click", () => { quiz.i--; renderQuiz(); });
  }

  function renderResult() {
    const Q = DATA.quiz.questions;
    const score = {};
    quiz.answers.forEach((n, i) => {
      Object.entries(Q[i].options[n].scores).forEach(([k, v]) => (score[k] = (score[k] || 0) + v));
    });
    // Ties resolve in results-definition order.
    const order = Object.keys(DATA.quiz.results);
    const key = order.reduce((best, k) => ((score[k] || 0) > (score[best] || 0) ? k : best), order[0]);
    const r = DATA.quiz.results[key];
    const qs = new URLSearchParams(r.filters).toString();
    const bookHref = `${base}book-consultation/?treatment=${encodeURIComponent(r.service)}`;
    $("#quiz-bar").style.width = "100%";
    $("#quiz-body").innerHTML = `
      <div class="quiz-result">
        <span class="eyebrow">Your wellness plan</span>
        <h2 id="quiz-result-title" tabindex="-1">${esc(r.title)}</h2>
        <p class="text-muted" style="max-width:52ch;margin-inline:auto">${esc(r.blurb)}</p>
        <ul class="plan">${r.plan.map((p) => `<li>${esc(p)}</li>`).join("")}</ul>
        <div class="actions">
          <a class="btn btn-primary" href="${bookHref}" data-track="click_book_consultation">${esc(r.cta)}</a>
          <a class="btn btn-secondary" href="?${qs}#explorer" id="see-guides">See matching guides →</a>
          <button type="button" class="btn btn-secondary" id="quiz-retake">Retake quiz</button>
        </div>
        <p class="text-muted" style="font-size:var(--fs-caption);margin-top:var(--space-3)">Suggested service: <a href="${base}${r.serviceHref}">${esc(r.service)}</a></p>
      </div>`;
    track("wellness_quiz_complete", { result: r.title });
    $("#quiz-retake").addEventListener("click", () => { quiz.i = 0; quiz.answers = []; renderQuiz(); });
    $("#see-guides").addEventListener("click", (e) => {
      e.preventDefault();
      Object.keys(state).forEach((k) => (state[k] = r.filters[k] || "all"));
      showTab("explorer");
      render();
    });
  }

  /* ---------------- Tabs ---------------- */
  function showTab(name) {
    $$(".fit-tab").forEach((t) => t.setAttribute("aria-selected", String(t.dataset.tab === name)));
    $$(".fit-panel").forEach((p) => (p.hidden = p.id !== name));
    try { history.replaceState(null, "", location.pathname + location.search + "#" + name); } catch (e) {}
    $("#" + name).scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function initTabs() {
    $$(".fit-tab").forEach((t) => t.addEventListener("click", () => showTab(t.dataset.tab)));
    if (location.hash === "#quiz") {
      $$(".fit-tab").forEach((t) => t.setAttribute("aria-selected", String(t.dataset.tab === "quiz")));
      $$(".fit-panel").forEach((p) => (p.hidden = p.id !== "quiz"));
    }
  }

  fetch(base + "data/wellness.json")
    .then((r) => { if (!r.ok) throw new Error(r.status); return r.json(); })
    .then((d) => { DATA = d; initTabs(); initExplorer(); renderQuiz(); })
    .catch(() => { $("#wellness-error").hidden = false; });
})();
