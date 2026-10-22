/* ==========================================================================
   BMI CALCULATOR — client-side, nothing is sent or stored.
   Categories use the WHO Asia-Pacific / Indian cut-offs:
   <18.5 underweight · 18.5–22.9 healthy · 23–24.9 overweight · ≥25 obese.
   ========================================================================== */

(function () {
  const root = document.getElementById("bmi-card");
  if (!root) return;
  const $ = (s) => root.querySelector(s);
  const $$ = (s) => Array.from(root.querySelectorAll(s));
  const base = window.SITE_BASE || "./";

  let unit = "metric";
  const el = {
    cm: $("#bmi-cm"), kg: $("#bmi-kg"), ft: $("#bmi-ft"), inch: $("#bmi-in"), lb: $("#bmi-lb"),
    err: $("#bmi-error"),
    value: $("#bmi-value"), cat: $("#bmi-cat"), marker: $("#bmi-marker"), msg: $("#bmi-msg"), cta: $("#bmi-cta-link"),
  };

  const CATS = [
    { max: 18.5, key: "under", label: "Underweight", msg: "Below the healthy range. A nutrition plan can help you reach a healthy weight." },
    { max: 23, key: "healthy", label: "Healthy range", msg: "You're in the healthy range. Keep up balanced meals, movement and sleep." },
    { max: 25, key: "over", label: "Overweight", msg: "Slightly above the healthy range. Small, steady changes make a real difference." },
    { max: Infinity, key: "obese", label: "Obese range", msg: "In the obese range, which can raise health risks. A personalised plan is a good next step." },
  ];

  function read() {
    const num = (i) => (i.value === "" ? NaN : parseFloat(i.value));
    if (unit === "metric") return { h: num(el.cm), w: num(el.kg) };
    const ft = num(el.ft), inch = el.inch.value === "" ? 0 : num(el.inch);
    return { h: (ft * 12 + inch) * 2.54, w: num(el.lb) * 0.45359237 };
  }

  function setInvalid(inputs, bad) { inputs.forEach((i) => i.setAttribute("aria-invalid", String(bad))); }

  const EMPTY_MSG = "Your BMI and category will appear here.";
  const setState = (s) => { root.dataset.state = s; };

  function update() {
    const { h, w } = read();
    const hIn = unit === "metric" ? [el.cm] : [el.ft, el.inch];
    const wIn = unit === "metric" ? [el.kg] : [el.lb];
    const touched = [...hIn, ...wIn].some((i) => i.value !== "");
    const filled = unit === "metric" ? el.cm.value !== "" && el.kg.value !== "" : el.ft.value !== "" && el.lb.value !== "";

    setInvalid([...hIn, ...wIn], false);
    el.err.textContent = "";
    el.value.textContent = "–";
    el.cat.textContent = "";
    el.msg.textContent = EMPTY_MSG;
    if (!filled) { setState("empty"); return; }

    const hOk = h >= 100 && h <= 250, wOk = w >= 20 && w <= 300;
    if (!hOk || !wOk) {
      if (!hOk) setInvalid(hIn, true);
      if (!wOk) setInvalid(wIn, true);
      el.err.textContent = !hOk ? "Height should be 100–250 cm (3'3\" – 8'2\")." : "Weight should be 20–300 kg (44 – 660 lb).";
      setState("empty");
      return;
    }

    // classify on the displayed (1-decimal) value so "25.0" is never labelled as below 25
    const bmi = Math.round((w / Math.pow(h / 100, 2)) * 10) / 10;
    const cat = CATS.find((c) => bmi < c.max);
    el.value.textContent = bmi.toFixed(1);
    el.cat.textContent = cat.label;
    el.cat.dataset.cat = cat.key;
    el.msg.textContent = cat.msg;
    // map BMI 15–35 linearly onto the bar (clamped); bar segments match the cut-offs
    el.marker.style.left = Math.min(100, Math.max(0, ((bmi - 15) / 20) * 100)) + "%";
    el.cta.href = base + "book-consultation/?treatment=" + encodeURIComponent("Weight Management Consultation");
    setState("ready");
    if (touched) debouncedTrack(bmi, cat.key);
  }

  let t;
  function debouncedTrack(bmi, key) {
    clearTimeout(t);
    t = setTimeout(() => { if (typeof window.gtag === "function") window.gtag("event", "bmi_calculated", { category: key }); }, 1500);
  }

  function setUnit(u) {
    unit = u;
    $$(".bmi-units button").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.unit === u)));
    $$("[data-for]").forEach((f) => (f.hidden = f.dataset.for !== u));
    update();
  }

  $$(".bmi-units button").forEach((b) => b.addEventListener("click", () => setUnit(b.dataset.unit)));
  $$("input").forEach((i) => i.addEventListener("input", update));
  setUnit("metric");
})();
