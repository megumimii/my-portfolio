# Update Logs

## 2026-11-02 — Initial Architecture & Full Portfolio + Custom Firebase CMS Implementation

## 2026-11-02 — Elimination of Pre-Load Animated Placeholders & Synchronized Entrance Animations

- Eliminated pulsing indicator animation from the hero top coordinate strip.
- Removed all placeholder images, silhouettes, and animated elements while the portrait image is loading.
- Synchronized all hero entrance animations and portrait reveals to trigger only after the portrait image is loaded and decoded in memory.

## 2026-11-02 — High-Tech Minimalist Entrance Gate, Hazard Strips & Pressurized Smoke Reveal

- Added [`useSitePreloader.js`](./my-react-app/src/hooks/useSitePreloader.js) to synchronize Firestore data, web fonts, and critical image decoding into a `000% → 100%` telemetry counter.
- Added [`EntranceGate.jsx`](./my-react-app/src/components/common/EntranceGate.jsx) and [`EntranceGate.module.css`](./my-react-app/src/components/common/EntranceGate.module.css) with responsive blast shutters (horizontal seam on desktop, vertical seam on mobile), monochrome diagonal hazard strips, pressurized `<canvas>` smoke dissipation, and complete DOM unmounting (`return null`) after opening to guarantee zero layout shift.

## 2026-11-02 — Complete Removal of Default Seed Data & Seeding Functions

- Deleted `defaultSeedData.js` and removed all mock starter datasets (`DEFAULT_PROJECTS`, `DEFAULT_INTERESTS`, `DEFAULT_TOOLS`, `DEFAULT_SITE_CONTENT`).
- Removed `seedInitialPortfolioDatabase()` and all seeding fallbacks across services, hooks, and presentation components. Empty database collections now cleanly render their authentic empty states.

## 2026-11-04 — Jargon Removal, Authentic Terminology & Personal Identity Integration

- Replaced self-describing meta and template boilerplate (`© 2026 // ART-DIRECTED DEVELOPER MONOGRAPH. ALL RIGHTS RESERVED.`) with the developer's verified name: `John Christian Isaac A. Gacosta`.
- Updated site `<title>` and `<meta name="description">` in `index.html` to reflect John Christian Isaac A. Gacosta.
- Replaced technical backend jargon ("Firebase", "CMS", "Telemetry", "Monograph", "Containment Protocol", "Cognitive Architecture", "Field Notes", "Technical Arsenal") across public portfolio components and admin pages with clean, grounded, authentic developer terminology ("Admin Panel", "Upload Image", "Secure Dispatch", "Engineering Approach", "Technologies & Tools", "Beyond Code", "Selected Projects", "View Details").
- Updated error and notification messages across forms and services to provide clear, user-focused messages without exposing underlying infrastructure names.

## 2026-11-04 — Minimalist Black & White Custom Favicon

- Replaced the template gradient favicon with a custom, flat monochrome SVG favicon ([`favicon.svg`](./my-react-app/public/favicon.svg)).
- Crafted an architectural `#0A0A0A` dark rounded tile with a subtle `#27272A` hairline border and stark white (`#FFFFFF`) geometric double-slash (`//`) glyph, perfectly aligned and optimized for high-contrast visibility across both dark and light browser tab bars.

## 2026-11-04 — Robust Navbar Scroll-Spy & Active Tab Transition Optimization

- Replaced the restrictive `IntersectionObserver` in [`Navbar.jsx`](./my-react-app/src/components/common/Navbar.jsx) with a high-performance `requestAnimationFrame` scroll-spy that accurately tracks the user's focal reading line across sections of any height (`rect.top <= focalLine && rect.bottom > focalLine`).
- Fixed skipping of `01 About`, `03 Stack`, and `04 Work`: tall sections (> 1500px) that previously failed the target-relative 25% intersection ratio now transition smoothly and reliably.
- Added `scroll-margin-top: calc(var(--navbar-height) + 4px)` in [`global.css`](./my-react-app/src/styles/global.css) and navbar offset handling to ensure clicked navigation tabs align section content cleanly below the sticky white navbar.
- Updated [`ToolsMarquee.jsx`](./my-react-app/src/components/portfolio/ToolsMarquee.jsx) to always maintain its container element and `#tools` ID in the DOM even if the stack collection is empty.
- Documented findings in [`lessons-learned.md`](./my-react-app/lessons-learned.md).

See [`my-react-app/update-logs.md`](./my-react-app/update-logs.md) for the complete detailed changelog of the Personalized Developer Portfolio & Custom Firebase CMS.

