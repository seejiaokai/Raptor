# The board by the keys, and the glide over two pages — the bug check (the night of 7–8 Nov 26, job 1)

Branch `claude/board-keys`. The sizing plan's job 2 (`docs/superpowers/plans/2026-11-05-backlog-sizing.md`):
`[BOARD-KEYS-LEFT]` (1)–(5), `[WINDOWS-KEEP-KEYS]`' three leftovers, `[WEEK-GLIDE-TWO-PAGES]`. Run unattended; nothing put to
him during the night — what needs his eye is parked in §11.

**What was found already live.** The roll-call of 7 Nov 26 found `[BOARD-KEYS-LEFT]` (1)–(5) and `[WINDOWS-KEEP-KEYS]`' three
leftovers built and live with pull request 636 (the keyboard and windows batch, 5 Nov 26 — `docs/handpass/2026-11-05-keys-windows.md`),
their backlog items never closed. Two board menus that batch did not reach, both drawn only at a phone's width (a narrow window at a
desk, a tablet with a keyboard): **the ⋯ beside the highlighter** (Insights, Sort all, the layout switch) and **the day bar's
Templates**. Built tonight: those two, `[WEEK-GLIDE-TWO-PAGES]`, and the fixes of the two blind reads.

Commits: `24549f120` (the build), `07bb71b2d` (the walk script, the read's brief), `7c2c8926e` (the reads' fixes, both reports).

## 1. The eight answers and the tier

1 OIL: NO — nothing earns or is counted. 2 The published record: NO — no publish, sign or amendment path is touched. 3 Saved data:
NO — nothing stored changes (keys and a slide's styles only). 4 A shared drawer: YES — `sheetfocus.ts` (`pressedByKeys`,
`menuKeys`) serves every string-drawn board menu, and `weekglide.ts` serves both week pages. 5 A new gesture or mode: YES — new key
routes (the ⋯ menu, ↓ on the day bar's Templates, ↓ from one menu button to another). 6 A new surface: NO. 7 Roles: NO — the board
and its menus are Edit Schedule's, an admin's, as before; nothing opened to anyone. 8 The warning list: NO.
**Tier: WALK** (4 and 5). Told to him in this sheet, not at the start — he was asleep (the night's brief).

**The rulings that apply** (each checked on the running build, §4 and §10): **D1646** (the board's small menus by the keys, a menu
opened by Enter or ↓ on its first item, the arrows through it) — PASS; **D1652** (the cyan ring on the board menus' small buttons
stays as built) — PASS, untouched; **D1625** (anything new a person sees is drawn and shown first) — the ⋯ item's look under the
keys is parked, §11 Q1, nothing restyled; **D487** (button sizes) — nothing resized; **D1577** (the cross between weeks stays as
built) — the slide unchanged, only what is put back after a burst; **D349 / D481** (Sort all, the layout switch and Insights behind
⋯ on a phone) — PASS, the finger's use unchanged (B4); **a click-open popup closes on a click outside it** (4 Sep 26) — PASS (B1.14,
B5.1 — ↓ on ⋯ is now a press of it, so another menu closes as a click outside it); the design guide §2 (Escape closes what opened
last; the keys back on the button that opened it) — PASS; **D1557** (the plain-user round) — B3 and B4; **D1281** (a picture right
after each tap on a phone) — B4's `-q` pictures.

## 2. The roll-call (§6)

Each row: **has it** / **must not, because…** / **MISSING** — and how it was seen. "Walk" = `scripts/handpass/bk-walk.mjs`
(pictures `docs/img/handpass/2026-11-08-board-keys/walk/`, WebKit `walk-webkit/` and `walk-webkit-b3/`); "kw" = the 5 Nov walk's board
menus re-run on this build (`kw/`); unit = `ui/boardmenukeys.test.tsx` unless named.

### The board's ⋯ menu (drawn at ≤ 820 only)

| Where · how | Opens by the keys on its first item | ↑ ↓ round, skipping what cannot be pressed | Escape / a pick / Tab out: keys back on ⋯ (or on the board) | Another menu up | Mouse and finger as before | Seen |
|---|---|---|---|---|---|---|
| Narrow desktop window (800), phone layout | has it (Enter, Space, ↓) | has it (Sort all disabled on a previewed day: unit) | has it — Insights and the Sort all box give the keys back to ⋯ as they close | has it (↓ on ⋯ closes + Block's menu — B5.1, after Astra 1) | has it (B1.6, B1.14) | Walk B1, B5 (Chromium, WebKit) |
| Narrow window, the board's Desktop layout | has it (B1.8: the layout switched by the keys and back, ⋯ still drawn) | has it | has it | has it | has it | Walk B1.8 |
| Widened past 820 with the menu up | must not stay up — closes with its ⋯ (Opus Q3) | — | the next Escape is the board's | — | — | Walk B5.7–8; unit |
| His iPhone (402), by the finger | must not change — a phone has no keys | — | — | — | has it: opens, Insights, layout switch and back, ✓ Done (B4, a picture after each tap) | Walk B4 (Chromium, WebKit) |
| Above 820 | must not — the ⋯ is not drawn there (Sort all and Insights stand on the bar) | — | — | — | — | Walk B5.7 picture |
| The week's own ⋯ (Edit Schedule, View-only Sched at a phone's width) | must not change — `ScheduleInsightsMenu.tsx` untouched; it is the pattern this one follows | — | — | — | — | not walked: untouched code |

### ↓ on a board menu's button (`routeMenuKey`) — every button it serves

| Button | ↓ opens its own menu on its first pick | Its menu up (by the mouse): ↓ goes into it | Another menu up: ↓ opens its own, never goes into the other | A held Enter picks nothing | Seen |
|---|---|---|---|---|---|
| + Block | has it | has it | has it (the change is in one shared place — `menuKeys` records each menu's button) | has it (B5.5 — before tonight a held Enter added a block) | kw S5; Walk B5.5; unit |
| Templates on the board's bar (`#sbTpl`, desktop) | has it | has it | has it | has it (shared) | kw S5 |
| The day bar's Templates (phone width) — NEW | has it (B2.1; before tonight ↓ did nothing) | has it | has it (B5.3 — Astra 2 / Opus 2) | has it (shared) | Walk B2, B5.3–4; unit |
| The week's Templates (Edit Schedule) | has it | has it | has it | has it (shared) | unit (same `popMenu`, its button the anchor) |
| The plans selector | has it | has it | has it | has it (shared) | kw S5; Walk B3 |
| A jet's stores (C) | has it | has it (the stores menu, drawn again, keeps its button) | has it | has it (shared) | kw S5 |
| + Wave | has it | has it | has it | has it (shared) | kw S5 |
| The duty role box | has it | has it | has it | has it (shared) | unit |

### The glide over two pages (phone only, ≤ 820)

| Order | Each week takes touches and scrolls after | The page not clipped after | No copy left on screen | The week crossed last on its landing; an earlier one on its own day | Seen |
|---|---|---|---|---|---|
| G1: a cross on Edit Schedule, a switch to View-only Sched, a cross there inside the first slide | has it | has it | has it | has it (Opus 1) | Walk G1 — reached on its second try tonight (22 frames with both weeks covered) |
| G2: the same, View-only Sched first | has it | has it | has it | has it | Walk G2 (20 frames with both covered) |
| G3: one cross alone | has it | has it | has it | has it | Walk G3 |
| A later slide finishing first; a switch back to the first page inside the burst | has it | has it | has it | has it | unit (`weekglide.test.ts`, the two burst cases) — a finger cannot time these |
| On a desktop | must not — the glide is phone-only, landings instant | — | — | — | untouched |

## 3. The five sizing lines (§7.0)

1. **Type:** C (new key routes on the board's menus) and A-like in the glide (one shared module, both week pages its readers).
2. **What only a walk could find:** whether a real keyboard's Enter, Space, ↓ and a HELD Enter do on screen what the tests say
   (a browser presses a button on Enter's key-down, on Space's key-up); whether the ⋯ at a narrow window and on the board's
   Desktop layout is the one the keys reach; how the item under the keys is DRAWN (a question for him, §11); whether a real
   finger can make the two-page burst, and the weeks after it scroll. The tests carry the orders a finger cannot time.
3. **The ledger:** the 5 Nov keyboard batch (type C, D, H, E): one Sonnet walker, 152 checks, 0 faults in the walk, the reads 9
   (all fixed). Keyboard walks find little the scripted assertions miss; the reads find the gaps.
4. **The walk chosen:** the host's own script (`bk-walk.mjs`), run by the host — B1 (⋯, 15 checks), B2 (the day bar's Templates,
   3), B5 (the reads' fixes, 8), B3 (a plain user's round at 1536 by the keys, 7), B4 (the ⋯ on his iPhone by the finger, 4), G1–G3
   (the glide by a real finger, Chromium's touch); at 800 × 760 (narrow, ≤ 820), 1536 × 864 (his PC) and 402 × 874 (his iPhone);
   WebKit for B1–B5 (lessons 10 and 19). Calibrated on `main`'s build first: it FAILS there (§4). The 5 Nov walk's board menus
   (kw S5, S6) re-run on this build as the regression check of the shared `menuKeys` change. The cases a finger cannot time —
   finishes out of order, a switch back inside a burst — carried by `weekglide.test.ts`, which changes the weeks' scroll directly
   and so proves the module's restore, never the gesture (the gesture is G1–G3).
5. **After the walk:** the ledger's row added (`docs/walk-ledger.md`, 2026-11-08).

**The lessons (§7.11), each against a scenario:** 1 (one state only) — the ⋯ read with its menu shut and open, opened by the mouse
then the keys and the other way (B1.6–7); 2 (one speed) — a HELD Enter (B5.5–6) besides a press; the glide's flick is fast by
script; 3 (feedback never looked for) — every check asserts where the keys are and the ring drawn; 4 (a press on the page behind) —
B5.1, B5.3 (one menu at a time); 6, 7, 20, 21 (the real phone, the test browser's touch) — the glide's FEEL is his iPhone's to judge,
the walk proves only that nothing is left covered; 10 (a way back) — the board left by ✓ Done and the keys found on the week's date
that opened it (B3.3); 12 (a window from one page only) — the ⋯ on the phone layout and on the Desktop layout; 14 (boxes left off a
keyboard walk) — every item of ⋯ pressed by the keys, every board menu button in the table above; 17 (a width change at rest only)
— the window WIDENED with the menu up (B5.7); 19 (a window over a window never closed) — Insights and the Sort all box opened from
⋯ and closed by Escape (B1.9–12). The others do not apply: no list's alignment, pinch, pinned bar, warning, print, loading or tap
window is touched.

## 4. The walk

`scripts/handpass/bk-walk.mjs` (v8) on this branch's build after the reads' fixes (`dist-fix`, `index-Dwb6BDtu.js`), served
frozen inside the test browser. Every step presses the app's own controls with real keys, the mouse or a finger; the probe bridge
is only read.

| Run | Where | Result |
|---|---|---|
| Chromium, all parts | `walk/` (42 pictures) | **49 PASS · 0 FAIL · 0 NOT WALKED · 0 browser errors** |
| WebKit, B1 B2 B5 B3 B4 | `walk-webkit/` (28) | 34 PASS; B3 stopped at a picture's clip ("outside the resulting image") with its two checks passed — the script's own trap, not the app's |
| WebKit, B3 again alone | `walk-webkit-b3/` (5) | **7 PASS · 0 FAIL** — the picture taken this time; the clip now notes a refusal instead of stopping |
| kw S5, S6 (the 5 Nov board menus, the red note) | `kw/` (19) | **45 PASS · 0 FAIL** |
| Calibration on `main` (v3, 7 Nov) | `calibration-main/results-bk-walk-v3.txt` | B1, B2 FAIL (⋯ and the day bar's Templates not reached by the keys); G2 FAIL — the second page's week left unscrollable ("from 2340 to 2340"), G3 failing after it; G1 not reached in three tries |
| Calibration of B5 on `main` (v8) | `calibration-main/results-bk-walk-v8-b5.txt` | 6 FAIL of 8 — among them a held Enter on + Block ADDED a block (b0 1 → 2), and the ⋯ menu stayed up after a widening |

The plain-user round (D1557): B3 — at his PC's size, by the keys alone: Enter on Wednesday's date opens its board; + Block → Empty
block adds a block, the keys back on + Block; Templates and the plans selector looked into and left by Escape; ✓ Done by Enter —
the board closes and the keys are back on the week's date that opened it; the block on the week's Wednesday; Undo by Enter takes it
off. B4 — on his iPhone's size by the finger: ⋯, Insights, the layout switch and back, ✓ Done, a picture right after each tap.

The deciding pictures, opened by the host: `walk/014-narrow-b5-more-over-block.png` (one menu, ⋯'s, the keys on Insights),
`015-…-templates-over-block.png` (one menu, Templates', the keys on its first pick), `016-…-block-held-enter.png`, `018-…-widened.png`
(above 820, no menu left), `033-phone-G1-after-viewsched.png` beside `041-phone-g3-after-cross.png` (after the two-page burst the
week stands as after one cross), `002-narrow-q1-as-built.png` and `003-narrow-q1-proposed.png`, `021-desktop-q2-block-button-under-keys.png`.

## 5. Cases carried by a test (§7.0)

| Case | Test | What it proves |
|---|---|---|
| Sort all disabled (a previewed day): ↑ ↓ step over it | `boardmenukeys.test.tsx` "the arrows step over an item that cannot be pressed" | the arrows skip a disabled item both ways |
| Space on ⋯ opens it on its first item | "Space on ⋯ opens it on its first item" | Space is a keys' press |
| A pick by the mouse does not move the keys onto ⋯ | "a pick by the mouse does not move the keys onto ⋯" | the ring is for the keys only |
| Sort all picked by the keys, closed by Escape, the keys on ⋯ | "Sort all picked by the keys" | the box gives the keys back to ⋯ |
| A window widened past a phone's width | "a window widened past a phone's width…" (the width's change stubbed) | the menu closes; walked too (B5.7) |
| A later slide of a two-page burst finishing first | `weekglide.test.ts` "…whose later slide ends first" | nothing put back until the last one ends |
| A switch back to the first page inside a burst | `weekglide.test.ts` "…lands only the week crossed last" | the week switched back to keeps its day (Opus 1) |
| The week's Templates and the duty role box: ↓ | `boardmenukeys.test.tsx` (their own cases) | ↓ opens them on their first pick |

## 6. Break tests

`scripts/handpass/breaks/bk1108.json` — twelve rules broken one at a time, the tests run, each put back
(`docs/img/handpass/2026-11-08-board-keys/breaks-bk1108.txt`): **12 of 12 caught** — the ⋯ opened by the keys, a pick by the keys,
Escape, Astra 1, the held Enter (⋯ and the string-drawn menus), the widening, a string-drawn menu by the keys, Astra 2 / Opus 2, the
day bar's Templates, the glide's per-week styles, Opus 1.

## 7. Errors seen

None from the app in any run (0 browser errors). The script's own: WebKit's picture clip refused once under load (above); the
earlier versions' traps (a finger below a short day card, the View-only week not yet drawn, a hovered row lit, Safari not focusing a
clicked button) each fixed in the script and named in its comments.

## 8. Gate counts

On his PC (D1086 — GitHub's run of the pull request is the full check, opened by the night's host):
`npx vitest run` of `boardmenukeys.test.tsx` (42) and `weekglide.test.ts` (18), and the 24 neighbouring files that reach the
changed menus or the glide — **26 files, 629 tests, all passed**; `npm run lint:changed` — no new finding (8 files); the build (for
the walk) — passed, with its type check; the browser tests that pin these, `e2e/keys-windows.spec.ts` and `e2e/weekswipe.spec.ts`,
under the lock on port 4396 — **21 passed**.
Not run here: the whole unit set, the original's 728, the other browser tests, the Tracker's — GitHub's run.

## 9. What the reads found, and each disposition

Both blind to each other and to this sheet, one brief (`docs/superpowers/briefs/2026-11-08-board-keys-read-brief.md`, with the D56
exclusion); reports kept whole beside it (`…-read-opus.md`, `…-read-astra.md`). Astra called under his D1743.

| # | Reader | Finding | Disposition |
|---|---|---|---|
| A1 | Astra, medium | ↓ on a closed ⋯ with + Block's menu up opened ⋯ without a press: both menus up, one Escape closed both | **Fixed** red first — ↓ presses ⋯ (`SchedBoard.tsx`); walked B5.1–2 |
| A2 / O2 | Astra medium, Opus low (before this change) | ↓ on Templates (or any board menu button) with another menu up went into the OTHER menu | **Fixed** red first — each menu records its button, ↓ goes in only from it (`sheetfocus.ts`, `interactions.ts`); walked B5.3–4, kw S5 |
| O1 | Opus, low | a two-page burst landed every week again: a week switched back to inside the burst was dragged off the day it was given | **Fixed** red first — only the week crossed last is landed again (`weekglide.ts`) |
| O-Q2 | Opus, question | a held Enter opens a menu and its repeat presses the first pick | **Fixed** red first — a repeated Enter is ignored in the board's menus and ⋯; walked B5.5–6 (on `main` it added a block) |
| O-Q3 | Opus, question (before this change) | widened past 820 with ⋯'s menu up, the hidden menu ate the next Escape | **Fixed** red first — the menu closes when the width passes 820; walked B5.7–8 |
| O3 | Opus, test gaps | Sort all by the keys, a disabled item, Space, a pick by the mouse, a later slide finishing first | **Written** — §5 |
| O4 | Opus, tidiness (filed, not fixed — D489) | the stale "one baseline" comment; a loop name shadowing the clone's height; the ⋯'s list of items repeats `menuItems` | the first two **fixed** with O1 (comments only); the third **filed** (§11) |
| O-Q1 / A-Q | both, question | Tab out of the menus behaves two ways | **Parked for him** — §11 Q3 |
| A-Q2 | Astra, question (before this change) | Shift+Tab from the menu's first item back onto ⋯ leaves the menu open (⋯ is inside the menu's own wrapper) | **Left as built, with Q3** — the menu stays in view under ⋯, the keys on ⋯ in sight; Escape, Enter or a click outside closes it. Not walked by a step of its own: read in the code |
| — | Astra | 23 orders of glides tried in isolation passed; its unit runner could not run in its read-only sandbox | noted |

## 10. The re-walk

After the fixes (`7c2c8926e`): the whole walk again on the rebuilt app, both browsers, and kw S5–S6 — §4's table is that re-walk.
Every fix touched the board's menus or the glide, and every part of both was walked again. The two browser tests that pin these
(`e2e/keys-windows.spec.ts`, `e2e/weekswipe.spec.ts`) run on his PC under the lock after the fixes: 21 passed.

## 11. Parked for him — not built tonight (D1625), each with a recommendation

**His answers, 8 Nov 26 ("Ok all as recommended"): D1771 (Q1 and Q2 — the cyan ring), D1772 (Q3 — leave as built).** Q1
and Q2 are one small job of their own, filed under `[BOARD-KEYS-LOOKS]`.

Filed in the backlog as `[BOARD-KEYS-LOOKS]`; the three items this job closed (`[BOARD-KEYS-LEFT]`, `[WINDOWS-KEEP-KEYS]`,
`[WEEK-GLIDE-TWO-PAGES]`) left for the archive.


- **Q1 — how an item of the ⋯ menu looks under the keys.** As built it takes the ⋯ menu's own raised row plus the browser's own ring;
  the board's other menus draw the app's cyan ring (D1646, D1652). Pictures: `walk/002-narrow-q1-as-built.png` (as built),
  `walk/003-narrow-q1-proposed.png` (the cyan ring, laid on for the picture only), `walk/013-narrow-q1-templates-menu.png` (another
  board menu, for comparison). **Recommended:** the cyan ring, on the board's ⋯ and the week's ⋯ alike, so every menu under the keys
  looks the same.
- **Q2 — how a button that opens a board menu looks under the keys** (+ Block, the day bar's Templates; as on `main`, not changed
  tonight): the browser's own white ring, where the board's small buttons wear the cyan one. Picture:
  `walk/021-desktop-q2-block-button-under-keys.png`. **Recommended:** the cyan ring, as D1646 reads ("with the app's cyan focus ring").
- **Q3 — Tab out of a menu, two ways.** The board's string-drawn menus close on a Tab past their end and give the keys back to their
  button; the ⋯ menu lets Tab move on to the next control (the search box) and closes, as the week's ⋯ does; and Shift+Tab from its
  first item back onto ⋯ leaves it open under ⋯ (Astra's question). **Recommended:** leave as built — each matches its own kind, and
  none leaves the keys anywhere unseen.
- **Tidiness (low, the agent's):** the ⋯ menu's list of its items repeats the shared menus' own list-maker; one could serve both.

## Walk line

Walk: docs/handpass/2026-11-08-board-keys.md · 103 pictures (42 Chromium, 33 WebKit, 19 the 5 Nov board menus, 9 calibration on main) · 14 surfaces · 135 checks walked (49 Chromium, 41 WebKit, 45 kw) · MISSING: 0 (2 reads' findings and 2 questions fixed; 3 looks parked for him; 1 tidiness filed)

Docs: OUTSTANDING 156 items (+1 −3, −3 all in ARCHIVE) · DECISIONS D1–D1744 · homes OK
docsize: OK
