# Lessons Learned

This file tracks engineering lessons, root causes, and preventive measures across the project lifecycle in accordance with `AGENTS.md`.

---

## 2026-11-04 — Navbar Scroll-Spy Active Tab Transition Failures on Tall Sections
- **Problem**: Navbar navigation active tabs failed to transition for sections `01 About`, `03 Stack`, and `04 Work`, only transitioning on `02 Process`, `05 Beyond Code`, and `06 Let's Talk`.
- **Root Cause**: `IntersectionObserver` was configured with `threshold: 0.25` within an inset `rootMargin: '-15% 0px -45% 0px'` window. For tall editorial sections (like `01 About` and `04 Work` whose heights exceed 1500px–2500px), 25% of the target's total height exceeded the entire 40% observation window, making `intersectionRatio >= 0.25` mathematically impossible to reach. Additionally, the Tools marquee returned `null` when the collection was empty, preventing its ID from being observed, and `scrollIntoView` lacked sticky navbar offset compensation.
- **Prevention**: For single-page navigation across sections of wildly differing heights (from 180px marquees to 3000px grids), do not rely on high target-relative `threshold` IntersectionObservers. Instead, implement a high-performance `requestAnimationFrame` scroll-spy checking bounding rects against a focal reading line situated just beneath the sticky navbar (`rect.top <= focalLine && rect.bottom > focalLine`), paired with `scroll-margin-top` CSS rules and persistent container IDs.

