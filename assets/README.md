# Assets

Organized by purpose, not by page:

```
assets/
  brand/     favicons + app icons
  photos/    real photography used across pages
  social/    the Open Graph / social-share image
  icons/     custom SVG icons beyond the inline ones already in markup (currently empty)
  results/   genuine, consented before/after photography for results.html (currently empty)
```

## In use

- `brand/favicon.png`, `brand/favicon-512.png`, `brand/apple-touch-icon.png` — site favicon and home-screen icon (referenced in every page's `<head>`)
- `brand/favicon.svg` — vector source for the favicon; not currently linked from any page, kept for regenerating the PNGs at new sizes
- `photos/doctor-portrait.jpg` — doctor portrait (home "Meet the Doctor" section, About page, `js/data.js`)
- `photos/hero-patient-care.png` — main hero photo, reused on the homepage and the Body Slimming page
- `photos/facial-aesthetics-card.png` — Facial Aesthetics specialization card image on the homepage
- `photos/facial-aesthetics-hero.jpg` — Facial Aesthetics service page hero
- `social/og-image.jpg` — Open Graph / Twitter card image used by every page's `<head>`

## Still placeholders

Add real, licensed/owned photography before launch:

- `icons/` — any custom SVG icons beyond the inline ones already in the markup
- `results/` — genuine, consented before/after photography for results.html

Every `<img>` tag on the site fails gracefully via `onerror` (the image is removed and a solid neutral background shows), so a wrong path or missing file won't show a broken-image icon — it just silently disappears. If a photo isn't showing, check the path first.
