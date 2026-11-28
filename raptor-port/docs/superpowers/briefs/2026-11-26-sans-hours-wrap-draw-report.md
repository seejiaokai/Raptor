# D2750's drawing — the helper's report, condensed by the host (chat 186, 26 Nov 26)

Brief: `2026-11-26-sans-hours-wrap-draw-brief.md`. Drawn on the frozen build `D:/raptor-work/c185-build`
(`index-SXKkjfaJ.js`, port 4880), scene `col` of `raptor-port/docs/mock/2026-11-25-sans-d2588/draw.mjs`, desktop 1536
and phone 402; every assertion passed at both sizes, no page or console errors.

- **New pictures:** `img/col-nopick-desktop.png` (622x486, 2x), `img/col-wrap-desktop.png` (622x500, 2x),
  `img/col-nopick-phone.png` (738x729, 3x), `img/col-wrap-phone.png` (738x1092, 3x — his iPhone's scale, as the other
  phone pictures). Page round 3 published at https://claude.ai/artifact/Q3k5bdWvukRPDqSrvkc8Qz (pictures 20, 21; the
  question also in the page's top list, added by the host).
- **Asserted:** no place picked — no reason line, Jester's "A · 08:00–10:00" whole; place picked, proposed — "A" over
  "08:00–10:00" inside the badge, left edges within 0.5px, the badge's own font (8.5px), no badge cut (scrollWidth <=
  clientWidth on all five), other rows' heights unchanged, the "New" tag covering nothing.
- **Found, for the build:** (1) on the desktop the hours fit their second line with only 3px to spare (badge ends at
  1521, section at 1524) — his iPhone's font draws wider, so the build lets the hours line wrap again rather than trust
  the PC's 3px, and his look is on his iPhone; (2) on the desktop Jester's row grows 7px (15 → 22) and the rows below
  move down; on the phone nothing grows (the reason already sits under the puck); (3) with no place picked the list
  differs in more than the reasons — "SANS Avail · 5 free", the five who filed unstruck and listed first, the six with
  nothing filed struck without a reason (D2420); (4) the kit's "New" tag gained an `edge` position (its default covered
  Bolt's "F").
- **Not done:** no fresh Fable read of the page's few new sentences (D2393 is on his call); the helper did not open the
  built page in a browser.
