# Bug check — People and Quals, the night of 6 Nov 26 (job 3), branch `claude/people-quals-1106`

Three Quals faults from the backlog, each fixed red first, and React Doctor's findings on five People and Quals files, with
nothing a person sees changed by those. Pictures: `docs/img/handpass/2026-11-06-people-quals/` (`walk/` the walk,
`rewalk/` the re-walk after the code read's fix, the rest the host's probes). Helpers' reports: `docs/handpass/parts/pq1106/`.

## 1. The eight answers and the tier
1 money — no (no OIL, no leave). 2 published record — no. 3 saved data — no (nothing stored changes; `accounts.ts` gains a
comment only). 4 shared drawer — YES: the people picker is drawn by the one input window from every page; Quals' pinned heading
row now draws its still name heading in both paths. 5 gesture — YES: the heading drag by a finger now works. 6 new surface —
no. 7 roles — no (the sign-in's labels gain `htmlFor`; who may sign in is unchanged — the security read below). 8 warnings —
no. **Tier: WALK.** A security read added (D1411): `Login.tsx` changed beyond a comment.

## 2. Roll-call — every place the touched things are drawn
| Place | Has it / must not, because… |
|---|---|
| Quals' own heading row, Edit quals, a finger on a heading's words | HAS IT — the fix; `e2e/pinchzoom.spec.ts` + walk W1 (slow, quick, both ways, held at the edge, on the padding, the ✕) |
| …a mouse drag; a click that sorts (normal mode) | HAS IT, unchanged — walk W2 |
| Quals' pinned heading row (under the top bar) in Edit quals — its headings | MUST NOT start a drag: the press listener is the table's alone, as before (older; filed below, item a) — a drop may LAND on a pinned heading, by its column key (the security read: harmless) |
| Pinned row, scroll-driven path (Chrome, Safari 26+) — the still name heading | HAS IT, unchanged — walk W3.sda |
| Pinned row, no scroll-driven animations (iPhone before iOS 26) | HAS IT now — the fix; e2e test + walk W3.nosda |
| Name column's left edge, scrolled sideways, phone, a zoom between steps | HAS IT — the fix; e2e test + walk W4 (Chromium at 0.9, WebKit at 1) |
| …unscrolled: the table's thin left line | MUST stay — kept (the first try hid it, caught by the pixel comparison; picture `sliver-first-try-hid-the-left-line.png`); e2e asserts no cover unscrolled; walk W4.*.1 |
| …the name heading in the table's own heading row; in the pinned row; in the still copy | HAS IT (same rule) / clipped inside their own boxes — nothing to cover |
| Desktop Quals | MUST NOT change: the cover is a phone's only (≤ 820, where the zoom is) — pixel comparison identical |
| Sign-in card (labels) | Nothing drawn changes — pixel comparison identical; a click on "Password" puts the caret there (walk W5e) |
| Quals' "Add qualification", the filter box | Nothing drawn changes — identical |
| Outlined row after an Undo of a Quals tick, after "Check his quals" | Back to main's code after the read (finding 1); walk W5a, W5b, re-walk |
| The Holidays list (Leave War ⚙ → Calendar… → Holidays) and its form | Nothing drawn changes — identical; the notes go with a year change (walk W5c) |
| The input window's people picker — Inputs page, the schedule's rows, the SANS calendar (one component) | Nothing drawn changes — identical (Inputs page, one person and Several people); its helpers moved whole to `ui/peoplepick-model.ts`; walk W5d |

## 3. The walk's size (D607)
1. **Type:** C (a gesture fixed), E (the pinned row's drawing, the edge cover), plus code tidy-ups that must change nothing.
2. **What only a walk finds:** the finger drag at a person's speeds and directions, the pinch with the fingers down in both
   paths, the edge in the screen's pixels in both engines, and the plain-user round across every page the tidy-ups touch.
3. **The ledger:** the pinch walks of 30–31 Oct 26 (type E, C) each found faults only mid-gesture or in pixels (lessons 13, 15,
   22) — so readings with the fingers down and in pixels, not boxes.
4. **Chosen:** one Sonnet walker, one script (`scripts/handpass/pq1106-walk.mjs`), three set-ups: desktop Chromium 1536 (mouse),
   phone Chromium 402 by real fingers over CDP, phone WebKit 402 (taps; WebKit's in-page touches make no pointer events, so its
   drags and pinches are Chromium's — said in the table). Carried by tests: the three faults' e2e tests (each red on main);
   that nothing seen changed: `scripts/handpass/pq1106-same.mjs`, 22 screens × before/after, pixel for pixel.
5. **Row added** to `docs/walk-ledger.md`.
§7.11 lessons covered: 2 and 20 (the drag slow and quick, both ways, the pinch out then in at once), 13 (pinch part-way down),
15 and 22 (the edge read in pixels), 19 (the holiday window closed by ✕ and Escape), 10 and 12 not applicable (no page hidden
and shown; no window opened from several pages changed).

## 4. Results
- **The three faults, red first** (`e2e/pinchzoom.spec.ts`, each failing on main's build and passing after):
  - [QUALS-HEAD-FINGER-CAPTURE] real: a finger on the words moved no column (mid-drag nothing lit; `finger-drag-base-mid.png`).
  - [QUALS-PINCH-NOSDA-HEAD] real wherever a browser lacks scroll-driven animations: mid-pinch in the pinned name heading stood at
    -159 for an edge at 20 (`nosda-base-mid-pinch-in.png`). Playwright's WebKit (26.5) and Chromium both take the scroll-driven
    path; an iPhone on iOS 26 or later does too (scroll-driven animations came with Safari 26), so his phone likely does not
    show it — a member on an older iOS would. Cheap and safe (the Leave War's answer, D1287), so built.
  - [QUALS-ZOOM-EDGE-SLIVER] cause found: in a table of collapsed borders the name cell's left border is the table's to draw, and
    the sticky cell leaves that slot see-through; scrolled sideways, the cells under it show (16 and 17 of 124 readings in
    Chromium and WebKit; 0 after). Before / after, both engines: `sliver-edge-before-after.png`.
- **React Doctor**, the five files: 36 warnings (0 errors) → 0. Fixed 16: the Holidays list's year reset (3), the people picker's
  three helper exports (moved), its five list lookups, the sign-in's two labels and its two placeholder-only boxes (the labels
  now name them), Quals' "Add qualification" box. Kept with reasons 20: complexity / size (Quals 2, the picker, the holiday form), the holiday form's Save
  carried out by the wait (9 lines, one block), the sign-in's caret in its first box, the picker's drag-swallowing capture, Quals'
  pinned row (2), its search box (D1127), the outlined row's state (after the read), a seat's CATs. `npm run lint:changed`: no
  new finding.
- **Nothing seen changed:** `pq1106-same.mjs` — 22 of 22 screens identical before and after (the build twice first, identical).
- **The walk:** 77 steps — 68 pass, 0 fail, 9 not walked (each a size the step does not apply to, or no second prompt to press
  "Later" on); no page or console error. **The re-walk** (W5, after the read's fix): 39 pass, 0 fail.
- **The code read** (fresh, blind Opus, `parts/pq1106/read-opus.md`): finding 1 (low) — the outlined row made a ref could be
  seen on the old All table before the seat view's redraw, so an Undo could move the page twice. Not reproduced in one desktop
  try (one move on both builds, the probe `undojump`); put back to main's code (state), the rule kept off with its reason.
  Older, met in passing: the outline effect runs after every paint (item b below); the file map (done); a lost space (put back).
- **The security read** (fresh Opus, `parts/pq1106/read-security.md`): no hole found.
- **Gates:** the touched unit tests (quals, accounts, the picker, holidays and every test rendering the input window: 49 files,
  1,230 tests) and the Quals browser tests (20) pass; GitHub's run is the full check (D1086).

## 5. Not walked, and why
"Later" on a second "is back" prompt (one man enabled); Escape and the "Password" click on the phones (desktop keys); a finger
across the picker's pucks on WebKit (no pointer events from its in-page touches). Only his iPhone can show whether its own
Safari takes the scroll-driven path and whether a finger's hold there behaves as Chromium's — both fixes work either way.

## 6. Filed, not fixed (older, met in passing)
- (a) In Edit quals, with the page scrolled down, a heading in the pinned row under the top bar cannot be pressed to drag
  (the press listener is the table's alone); scrolling up to the table's own row works.
- (b) Quals' outline effect has no dependency list: after "Check his quals" or an Undo, a later repaint with that row off screen
  may scroll it back into view (the code read; not walked).

Walk: docs/handpass/2026-11-06-people-quals.md · 105 pictures (65 walk + 40 re-walk) · 11 surfaces · 21 orders · MISSING: 0 (two older gaps filed)
