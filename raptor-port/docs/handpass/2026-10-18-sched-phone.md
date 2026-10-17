# The scheduling pages on a phone — D994's small fixes, first batch (18 Oct 26)

Branch `claude/scheduling-phone-fixes-6d4adf`, cut level with `main` plus the handoff notes of pull request 532. His word
(D994): the small fixes that need no answer or look from him, batched by area with one check each, the scheduling pages on
a phone first — `[PHONE-WIDE-BOARD-BLANK]`, `[SCHED-INPUT-WINDOW-PHONE]` and the small finds beside them. His questions wait
until he says so.

## What the batch is

| Item | What a person met | What was wrong | The fix |
|---|---|---|---|
| `[PHONE-WIDE-BOARD-BLANK]` | (29 Sep 26) the board's ⋯ → Desktop layout on a phone showed nothing below the sign-off | already FIXED 4 Oct 26 (D548, `063806c7d`), read and walked in the Codex stack's check of 5 Oct 26 (`2026-10-05-codex-stack-check.md`, D548's row: PASS), live since 6 Oct 26; the item was left open for that read | none — measured on today's build: all ten sections 816 wide at 390 × 844 (`img/handpass/2026-10-18-sched-phone/before/w01-*`, `w02-*`); pinned by `e2e/geometry.spec.ts` (D548's test). CLOSED |
| `[SCHED-INPUT-WINDOW-PHONE]` (1) | the window an input's line opens on Edit Schedule and the Scheduler Board, on a phone: a centred box capped at 80% of the screen, while the same input's window on the Inputs page runs as tall as it needs (D706) and stands at the foot (D537) | the schedule's window is the older blocking dialog (`.airpop`), which kept its family's `80vh` cap and had no phone rule | `14-input-editors.css`: at 620 wide and under, `.airpop#inpEditPop` stands 12px from the edges, as tall as what is in it up to the visible screen less 24px (`dvh`); first built at the foot (the Inputs page window's place), then — his D995, the same day — in the middle of the screen; wider, unchanged |
| `[SCHED-INPUT-WINDOW-PHONE]` (2) | a finger moving on that window scrolled the week behind it (D686) | the Inputs windows' touch guard lived inside `FloatWindow.tsx`; the dialog had none | the guard's body moved whole to `floatwin.ts holdPageScroll`, called by `FloatWindow.tsx` (unchanged behaviour) and by the dialog on its whole overlay (`inputedit.tsx`) |
| `[SCHED-INPUT-WINDOW-PHONE]` (3) | a phone on its side (844 × 390): Inputs → List → "+ Input" opened half off the screen, Add and ✕ out of reach | the list's fixed columns need 875px of table; the rule letting it scroll in its own box applied only up to 820px, so between 821 and about 940 the table widened the PAGE to 907 and the window, placed from the right edge, followed it | `06-inputs.css`: `.inwrap{overflow-x:auto}` at every width (a table that fits draws no bar) |
| `[OIL-NOTIFY-SEEN]` (5) | on a phone, after an Unavailable row was handed to another man by an armed tap, the crew drawer stayed open and covered the top bar — a finger on Undo met the drawer | the Unavailable row's door (`interactions.ts`) never parked the drawer, where every other planting tap does (`state/view.ts placeArmed` — owner, 8 Aug 26) | a MADE hand-over parks it, at once or when its OIL answer makes it; a refusal leaves it up, as a refused plant does |

**Left out, each with its reason:** `[WEEK-ADD-TAP-PHONE]` (filed "make the week's cell arm as the board's does or leave it
by his word" — his choice, so not in a no-answer batch); `[OIL-NOTIFY-SEEN]` (6) (a drag near the sideways board's edge —
filed "for his iPhone look"); `[VH-SHEETS-IPHONE]` and `[SHELL-SIDEWAYS-BAR]` (each "looked at on his phone" / "a picture
first"); `[BUBBLE-SMALL-SEEN]` (its first half needs his words; not phone-only).

## The eight questions and the tier

1 Money: NO — no OIL, no count. 2 Published record: NO. 3 Saved data: NO — nothing stored changes. **4 A shared drawer:
YES** — the touch guard is now one body for every window of the shell and the schedule's dialog. 5 A new gesture or mode:
NO new one (the guard is D686's, applied to one more window). 6 A new surface: NO. 7 Roles: NO. 8 The warning list: NO.
**Tier: WALK.**

## Roll-call — every place these are drawn

| Place | Window shape on a phone | A finger on it | What else is on the pixels | Walked |
|---|---|---|---|---|
| Edit Schedule week — a Personal Inputs / SANS line's door (`data-inpedit`) | HAS IT (P1, S1) | HAS IT (e2e; the week's page scrolled before) | the OIL question over it — HAS IT on top (Q1) | P1, P1f, S1 |
| Edit Schedule week — an Unavailable row's door | HAS IT (P2) | HAS IT (same overlay) | — | P2 |
| Scheduler Board — a Personal Inputs line | HAS IT (P3) | HAS IT (P3b; the board held it before too) | — | P3 |
| Scheduler Board — Ground Programme "+ Inputs" | HAS IT (P4) | same overlay | the OIL question on a weekend Duty (Q1, Q2) | P4, Q1, Q2 |
| Scheduler Board — Unavailable "+ Add" | HAS IT — tall: up to the strip, scrolls inside (P5, S2–S5) | HAS IT (S3–S5) | — | P5, S2–S5 |
| Scheduler Board — SANS "+ Add" | HAS IT (P6) | same overlay | — | P6 |
| View-only Sched — a member's own input | MUST NOT — no door: the window opens from Edit Schedule, the board and the Inputs page (M1) | — | — | M1 (looked for) |
| The same window wider than 620 (sideways phone 844, tablet 700, desktop 1440) | MUST NOT change — the centred dialog as before (L4, T1, K1) | — | — | L4, T1, K1 |
| The Inputs page's windows (shell `FloatWin`: the input editor, a day, SANS day, the settings, Calendar, Every weekday, Holidays, OIL list) — the shared guard | unchanged | HAS IT — the body moved, not changed: F1 (a day), F2 ("+ Input"), `ui/floatwindow.test.tsx`, `e2e/inputs-calendar.spec.ts` D686 | — | F1, F2 |
| The Inputs list | — | the table pans in its own box (L2) | "+ Input" placed from the right edge (L3) | L1–L3 at 844 × 390; T2 at 700; K2 at 1440 (no bar drawn) |
| The crew drawer after an Unavailable hand-over — week and board | — | — | the top bar's Undo under it — a finger meets Undo (D4) | D1–D5, week and board |

## Sizing the walk (D607, D608)

1. **Type:** E (layout on a phone) with C (the touch guard on one more window) and D (one shared guard body).
2. **What only a walk could find here:** a door that opens the dialog and was not reached by the CSS (each door walked), the
   dialog's sheets over it (the OIL question), the sizes at which it must NOT change, the list's sideways pan by a finger,
   and the drawer against the top bar.
3. **The ledger:** type E — 10 walks, 4 found a real fault, 6 faults; all host-run.
4. **The walk chosen:** the host alone, one scripted run (`scripts/handpass/spf-walk.mjs`), 47 checks: phone 390 × 844 and
   390 × 568 by touch (every door), a phone on its side 844 × 390, a tablet 700 × 1000, a desktop 1440 × 900 by mouse; the
   drawer on the week and the board. Carried by tests and not driven again: the guard's arithmetic in every shell window
   (`ui/floatwindow.test.tsx` — the shared body, directly); the dialog's shape at 844 and 568 on two doors
   (`e2e/sched-phone.spec.ts`, through the real doors by touch).
5. **After:** its row is in `docs/walk-ledger.md`.

## Tests, red first

- `src/ui/unavailedit.test.tsx` "on a phone a hand-over parks the crew drawer — at once, or when its OIL answer makes it":
  failed before the fix ("a made hand-over parks the drawer"), passes after.
- `e2e/sched-phone.spec.ts`, 7 tests, run against the build BEFORE the fix (served on 4174): 6 failed for the fault
  (height 454 of 568 where 542 fits; the window not at the foot; the week scrolled 3109 → 3385 under a swipe on the window;
  the page 907 wide), and the board's swipe test passed there — the board already held the page; it is kept as a guard.
  All 7 pass after.

## Break tests

`scripts/handpass/breaks/2026-10-18-sched-phone.json` (`node scripts/handpass/breaks.mjs …`): **4 of 4 caught** — the drawer
at once (1), the drawer after the OIL answer (2), the shell no longer calling the shared guard (3), the guard letting a swipe
through (4). The three browser-only wires (the dialog's guard, its phone shape, the list's own scroll) were proved red by the
seven browser tests on the build before the fix.

## The walk

`node scripts/handpass/spf-walk.mjs` (SPF_URL = the built app on 4174), pictures in `img/handpass/2026-10-18-sched-phone/walk/`:
**45 PASS · 0 FAIL · 2 NOT WALKED** (P1b — the schedule's window has no "Several people" switch, the tall case is S2; M1 — no
door for a member on View-only Sched), 24 pictures, no browser error. Two earlier runs failed on the script's own steps (the
OIL question's Add not pressed after "No OIL"; the board's Undo read from the page's hidden bar) — both fixed in the script,
neither in the app. Opened by the host: P1, S2, D3 (week), L3, Q1, and the "before" pictures.

**Seen in passing, older, not changed:** after a REFUSED hand-over the row's arm is put down while the drawer stays up over
the row, so a second try needs the drawer put away first (D2/D2b) — as before this batch; at 844 × 390 "+ Input" still
opens over the two-line top bar's second row (`[FLOATWIN-TWO-LINE-BAR]`, filed).

## Not done, and why

- **No code read by a model** — a WALK change (§5: the reads belong to FULL); the shared guard was moved whole, and the
  break tests prove each wire.
- **His iPhone:** the browser here has no address bar, so the dialog's top strip under Safari's bars (the `dvh` limit) is
  proved only on his phone — on his look card.

## Gates

The whole set under the PC lock in one run (`gatelock.mjs run`, E2E_PORT 4239), on `bf989c303` (the code of this batch;
the commits after it are documents only): build clean · tfin 728 / 0 · unit 11654 / 11654 · e2e 853 passed, 0 failed, 59 skipped · smoke 453 / 0 · rulecheck OK · docsize OK. The e2e count rose by 9 (this batch's 7 browser tests, and
`main`'s since the last baseline); the unit count by the drawer's test and `main`'s since.

## His correction, D995 — the window in the middle (18 Oct 26)

His words, on the preview: *"Can we make those windows that u put at the bottom of the screen to be at the middle of the
screen instead?"* — recorded as D995 (scheduler), narrowing D537 for this window; lesson 6 in the design guide's §9.
The change: `align-items:center` in place of `flex-end` on the phone rule (`14-input-editors.css`); nothing else moved.
**Red first:** the four shape tests of `e2e/sched-phone.spec.ts`, rewritten to ask for the middle, failed on the build
before it ("14px above it, 12px below"; "290px above it, 12px below") and pass after (7 / 7). **Re-walk:** the same script,
v4 (its shape check asks for the middle), `SPF_OUT=…/rewalk-d995`: 45 PASS · 0 FAIL · 2 with no door, no browser error;
pictures in `img/handpass/2026-10-18-sched-phone/rewalk-d995/`, opened by the host: P1 (151 above, 151 below), P6. The
first walk's pictures stay in `walk/` as they were. Tests run before the push (D902 — a follow-up on a pull request whose
whole set passed): the browser file above; GitHub's run of the pull request is the full check.

## His look at D995, and D996 (18 Oct 26)

*"1. Good 2. Yes standardise to middle"* — his look at the preview with the window in the middle: good. D996 (inputs): the
same input's window on the Inputs page stands in the middle on a phone too; a picture first, and whether the phone's other
windows follow is put to him.

## His look card

1. On your iPhone, Edit Schedule → tap an input's line under Personal Inputs: the window should sit in the middle of the
   screen, as tall as it needs (D995), and a long one (the board's Unavailable "+ Add") should fill the screen to a thin
   strip at the top and the foot.
2. Swipe on that window: only the window moves, never the schedule behind it.
3. Turn the phone on its side, Inputs → List → "+ Input": the whole window is on the screen, Add and ✕ reachable.
4. Hand an Unavailable row to someone by tapping its puck, then a name: the crew drawer goes away and Undo is reachable.

Walk: docs/handpass/2026-10-18-sched-phone.md · 24 pictures · 11 surfaces · 6 orders · MISSING: none
