# The Leave War's names as the schedule's puck — evidence sheet (28 Oct 26)

`claude/leave-war-m5-handoff-3a6602` (pull request 585) · [LW-NAME-PUCKS] · his D1468 (names puck style, the chip merged
with the name), D1469 (OCU "O"), D1470 (ground personnel "G"), D1471 (the schedule's own puck, as Approvals draws it),
D1476 ("Follow the schedule": its colours). The approved drawing: `docs/img/handpass/2026-10-28-lw-name-pucks/*-puck2.png`
(his page https://claude.ai/artifact/EN9B2Ui3EydoTXjc66rUyN). The walk's pictures: `docs/img/handpass/2026-10-28-lw-name-pucks/walk/`.

## The eight answers and the tier

1 money NO (no figure changes) · 2 published record NO · 3 saved data NO (markup and styles only; nothing stored) · **4 shared
drawer YES** — the schedule's puck look now drawn in a second app, and the grid draws a name in two places (the row and the
phone's frozen copy) · 5 new gesture NO (the chip's tap and the name's tap are the ones it had) · 6 new surface NO · 7 roles
NO · 8 warning list NO. **Tier: WALK.**

## Roll-call — the thing: a person's name and chip on the Leave War

| Place | Draws the puck | The chip's tap / the name's tap | What else is painted there |
|---|---|---|---|
| The grid's row (`MatrixRows.tsx`) | YES — `NamePuck` | YES / YES (walked, phone and desktop) | the SANS tag after it (D283); the Rearrange grip before it (walked); the "you" ring on it (walked) |
| The phone's frozen copy of the row (`Matrix.tsx`, `.mxband`) | YES — the same `NamePuck` | YES / YES (the name tapped there on the phone) | the same; measured whole inside its column with the grid scrolled sideways |
| The OIL tracker's name list (`OilTracker.tsx`) | NO, because his ruling covers the grid (D1471, lesson 67's "other places, suggested and not changed") | its own, unchanged | — |
| Approvals (`sync.ts puckHtml`) | already the schedule's puck (the model D1471 names) | unchanged | — |
| The day panel, My leave, the person window's lists | NO, because they draw a leave row (`LeaveLine.tsx`), not the grid's name column | unchanged | — |
| The schedule's own pucks | unchanged — no style of the schedule was edited; every grid rule is under `.mx .who .whoedit` | — | the schedule's code reacts only to pucks that carry a person tag (`.puck[data-person]`); the grid's carry none, so selection, highlights and drag never reach them (read in `board.ts`, `highlights.ts`, `interactions.ts`, `drag.ts`) |

**Lesson 9 of the order's §7.11 (a page's own class colliding with the puck's):** the Leave War's styles searched for `.r`,
`.pers`, `.nm`, `.role`, `.puck` — the only hits are inside the OIL tracker's `.oil-grid`, never the grid; every KIND measured
(below).

## Sizing (§7.0)

1. Type E (layout and look) with D (drawn in two places). 2. Only a walk shows the puck whole inside a phone's frozen
column, its fills equal to the schedule's own, the chip's list opening by a real tap and hover, Rearrange's grip beside
it. 3. The ledger: type-E walks find their faults at the phone's width and in states beside the main one. 4. The host
alone, one assertion script (`scripts/handpass/lw-name-pucks-walk.mjs`), phone WebKit 402 x 874 at 3x and desktop
Chromium 1536 x 860 at 1.25, admin and member, about 20 minutes of walking. 5. The row below in `docs/walk-ledger.md`.
§7.11's lessons: 1 (states) — the chip with and without qualifications, open and closed, and Rearrange; 2 (speed) — no
drag or swipe added; 3 (feedback) — the list's opening pictured at once and settled; 4 (a window over the page) — none
added; 5 (a box brought into sight) — none; 6 and 7 (what only the phone draws, a modelled motion) — none, nothing handed
to the phone; 8 (the drawing) — compared below; 9 (class collision, every kind) — above and below; 10 (a page hidden and
shown) — nothing about showing the page changed.

## The walk — 35 checks, all PASS (`walk/results.json`)

- Every drawn name a puck holding its name and chip; no old bar or badge; every chip whole inside its puck; every puck
  inside its column — admin and member, phone and desktop, and the phone's frozen copy with the grid scrolled sideways.
- **Every kind measured** (pilot / WSO / ground, each CAT, OCU, instructors, SXO): a pilot's fill rgb(110,106,46) and a
  WSO's rgb(31,110,82), each **equal to the schedule's own puck on View-only Sched** (D1476); OCU's chip "O" in the OCU
  purple (D1469); ground personnel "G" on the personnel grey (D1470); SXOs keep the gold chip, instructors the purple,
  each CAT its colour (D1468 — "the chip keeps its colours").
- Phone: the chip tapped lists his qualifications (picture at once and settled), opens no window, a second tap closes
  it; desktop: hovered, the list opens, moved away, it closes. The name tapped (phone, on the frozen copy) or clicked
  (desktop) opens his window; Escape closes it.
- His own row (member, Ranger): the accent ring on his puck. Rearrange: a grip beside every whole puck.
- Names that fade on a phone: Sidewinder, Talisman, Wildcard (3, as drawn); none on a desktop.
- No page or console error.

**Beside the drawing (D1424):** row for row the same as `phone-puck2.png` and `desk-puck2.png` (pictures opened by the host:
`walk/phone-admin-iwso-ocu.png`, `walk/desk-admin-iwso-ocu.png`). One thing the drawing did not show and the build keeps
by D1468: the SXO group's chips stay gold.

## Speed (`docs/performance.md` §E — `scripts/handpass/lw-name-pucks-perf.mjs`, 4x CPU, three runs, before → after)

| | Grid nodes | Tab opened to names drawn |
|---|---|---|
| Desktop 1536 | 24,348 → 24,397 (+49, one a name) | 455 / 468 / 469 ms → 471 / 478 / 475 ms |
| Phone 402 | 11,178 → 11,276 (+98: the row and its frozen copy) | 1,063 / 1,057 / 1,557 → 1,122 / 1,080 / 1,471 ms |

One node a name, about 0.2% of the grid; the day cells untouched. The timings move by about their own run-to-run spread.

## Tests

`src/leavewar/ui/namepuck.test.tsx` (new, red first: 5 of 6 failed before the build — the sixth, the frozen copy, was
rewritten to draw it on a phone, so it is not vacuous), `frozencols.test.tsx` (reads the puck's name), the six stored row
pictures `src/leavewar/ui/__rows__/*.html` refreshed — their only change is the name's markup (counted: every changed line
is the name and chip). The Leave War's whole unit set: 3,685 passed; its only failures were the six stored row pictures, refreshed as above.
GitHub's run of pull request 585 is the full check (D1086).

## The code read — one fresh, blind Opus read, with this sheet (D790)

Five findings, all taken, each red first where it was a test of behaviour:
1. **A test elsewhere still read the removed "you" ring rule** (`src/ui/noglow-css.test.ts` — the scheduler's set, not the
   Leave War's, which this sheet's first run covered): now reads the puck's rule — and, with 5, its outline.
2. **A browser test read the removed name bar** (`e2e/leavewar.spec.ts`, a personnel row in Rearrange): reads the puck's name.
3. **A browser test went vacuous** (`e2e/leavewar.spec.ts`, the name column growing by the grip in Rearrange — its list of
   cut names read the old bar, so it was always empty): reads the puck's name, with a guard that more than ten names are found.
4. **A unit test's title claimed the name opens his window but checked nothing of it** (`namepuck.test.tsx`): asserts the
   window opens.
5. **His own row's ring was hidden on the chip's side** — an inset shadow paints under the chip's own fill: drawn as a 1px
   outline above it (`matrix.css`), the style test red first, the re-walk's picture showing the ring all the way round
   (`rewalk/phone-member-own-row.png`, Ranger).
Tidy, taken: an unused variable in `MatrixRows.tsx`; the quals list's dismissal no longer names the old badge.
**Why the roll-call missed 1–3:** its search for readers of the old classes was confined to the Leave War's own files and
patterns; a removed class is searched for across the whole app and every test folder, by each exact selector.
The fixes are one-line selector, assertion and style changes, so no narrow read of the fixes (§5, "a fix is new code").

**Re-walk** (the same script, `rewalk/`): 35 checks PASS after its ring check was re-expressed for the outline (the fix
consumed the old premise — §5).

Walk: phone WebKit 402 + desktop 1536 at 1.25, admin and member, 35 checks PASS (walk and re-walk), pictures in `walk/` and `rewalk/`, opened by the host.
