# Assets

Replace these placeholders with real, licensed/owned photography before launch:

- `doctor/doctor-portrait.jpg` — primary hero portrait of the doctor
- `doctor/doctor-clinic.jpg` — doctor in clinic / consultation setting
- `services/body-slimming.jpg`, `services/facial-aesthetics.jpg` — specialization cards on the homepage
- `services/diet-fruits.jpg` — full-bleed photo hero on body-slimming.html (currently referenced as a CSS background-image; save the fruit/smoothie photo here — subject-heavy side should stay on the left, since the text panel sits over the right/negative space)
- `services/facial-aesthetics-hero.jpg` — facial aesthetics service page hero
- `icons/` — any custom SVG icons beyond the inline ones already in the markup
- `results/` — genuine, consented before/after photography for results.html
- `brand/` — logo files, favicon source

Until real files are added, every `<img>` tag on the site fails gracefully via `onerror` and falls back to a solid neutral background — nothing will show as a broken image icon.
