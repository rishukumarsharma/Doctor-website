# Assets

## Currently in use

- `images/doctor.JPG` — doctor portrait (home "Meet the Doctor" section, About page, `js/data.js`). File names are case-sensitive on GitHub Pages, so always reference it as `doctor.JPG`.
- `images/herosection.png` — home hero image
- `images/Refined.png` — facial aesthetics imagery
- `images/og-image.jpg` — social-share (Open Graph) image
- `services/facial-aesthetics-hero.jpg` — facial aesthetics service page hero
- `brand/` — favicon and apple-touch icons (`favicon.svg` sits in `assets/`)

## Still placeholders

Add real, licensed/owned photography before launch:

- `doctor/doctor-clinic.jpg` — doctor in clinic / consultation setting
- `services/body-slimming.jpg`, `services/facial-aesthetics.jpg` — specialization cards on the homepage
- `services/diet-fruits.jpg` — full-bleed photo hero on body-slimming.html (referenced as a CSS background-image; keep the subject on the left, since the text panel sits over the right/negative space)
- `icons/` — any custom SVG icons beyond the inline ones already in the markup
- `results/` — genuine, consented before/after photography for results.html

`doctor/` is currently empty; the old `doctor/doctor-portrait.jpg` reference was replaced by `images/doctor.JPG`.

Every `<img>` tag on the site fails gracefully via `onerror` (the image is removed and a solid neutral background shows), so a wrong path or missing file won't show a broken-image icon — it just silently disappears. If a photo isn't showing, check the path and filename case first.
