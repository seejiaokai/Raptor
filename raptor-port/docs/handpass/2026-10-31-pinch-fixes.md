# Bug check — mid-pinch on the Leave War grid and Quals (31 Oct 26, `claude/pinch-fixes-1031`)

The overnight run of 31 Oct 26, job 4 (unattended). Two backlog items in one batch (D485), both found by the pinch walk of
30 Oct 26 (`docs/handpass/2026-10-30-scroll-pinned.md` §The pinch walk) and both seen only while the fingers are down:
`[LW-PINCH-IN-CORNER]` and `[QUALS-PINCH-MID]`. Pictures: `docs/img/handpass/2026-10-31-pinch-fixes/` (`before/` on
origin/main's build, `after/` on this branch's). **DRAFT** — written by the builder before the walk; the walker fills §The walk,
the host the findings, the code read and the closing lines.

## Questions waiting for him

None. Owed from him, after the walk: **his iPhone look** at both, mid-pinch (WebKit takes no touch input from outside the
page, so the walk shows what Safari's engine draws, not how his iPhone delivers the fingers — §7.11 lesson 6).

## The eight questions and the tier

1 Money — no (no OIL, no balance). 2 The published record — no. 3 Saved data — no (the zoom is view state; nothing stored
changes). 4 A shared drawer — **yes**: `src/ui/pinchzoom.ts` is the one pinch body of five surfaces (the Leave War grid, its
OIL tab, the Balances page, Quals, the board's desktop layout). 5 A new gesture or mode — no (the pinch exists; what it draws
while the fingers move changes). 6 A new surface — no. 7 Roles — no. 8 The warning list — no. **Tier: WALK.**

## The changes (commit 224a251dc)

1. **The Leave War grid's names copy follows the date row's foot** (`[LW-PINCH-IN-CORNER]`). On a phone the names are drawn
   as a frozen copy over the grid's left edge (`.mxband`), clipped while the fingers move so it is never drawn above the date
   row (D1287). That line was read ONCE as the pinch began; on a pinch in the date row and its corner grow down while held at
   their top, so the names' rows were drawn over the corner's lower part. Now `pinchzoom.ts` takes `floor` as a row —
   `{ top, foot }` — and works its foot out from the stretch on every move, exactly as the date row's cells are placed
   (held from rising, carried down with the page's own scroll, grown by the stretch): no measuring per frame (D991).
   `leavewar/ui/Matrix.tsx` hands the date row's top and foot.
2. **Quals' pinch keeps its heading row and name column pinned** (`[QUALS-PINCH-MID]`, D1110). `ui/QualsPage.tsx` gives its
   pinch the Leave War's answers (D1287, D1288): `edges` + `scrollPage` (the page scrolls with the pinch as far as the lift
   would, so part-way down no band opens under the pinned heading row; the picture never floats down or right of where the
   lift can bring it back); `pin` + `pinAt` (the name cells held at the table's left edge, growing about it; the heading
   row's cells never rising, its name heading held at the left); the pinned row's still name heading grows from its own
   corner (`alsoTL`, no longer carried with the days). While the fingers are down the pinned row's box clips sideways only
   (the headings grow down whole on a pinch in) and is see-through under a shrunken row (`05-quals.css`
   `.qfixed.q-pinching`, the Leave War's `.mxfixed.lw-pinching`).

**Red first, on the unfixed build** (Chrome, real fingers over CDP; the same tests green on the fixed build):
- `e2e/leavewar.spec.ts` — the D1287 test's new last step: *"part-way down, pinching in, the names are never drawn over the
  stretched corner or LVE heading"* — names hit at 160–193 over both cells (24 points).
- `e2e/pinchzoom.spec.ts` *"part-way down, a pinch out opens no band under the pinned heading row"* — bare from 59 to 215
  (the pinned row's own box to 71, then the table's wrap).
- `e2e/pinchzoom.spec.ts` *"part-way down, a pinch in keeps the name column at the left edge, under its heading"* — every
  name at −159 against the table's 20; the pinned name heading at −159 too.
- `src/ui/pinchzoom.test.ts` *"a floor that is a row's foot follows the row as it stretches"* — expected `inset(60px …)`,
  got none on the old body.

## The roll-call — every surface the pinch body draws

| Surface | What the change does there | Has it / must not, because… / MISSING | Proved by |
|---|---|---|---|
| Leave War grid, phone, two fingers | the names copy's floor is the date row as drawn | **has it** | e2e D1287 step; walk L1–L7 |
| Leave War grid, desktop, Ctrl+scroll | none — the names copy is the phone's only, so no floor is drawn | **must not change**: the desktop's names are sticky cells held by `pin` | e2e "on a desktop, a Ctrl+scroll holds the CAT headings…"; walk D1 |
| Leave War OIL tab | none — it passes no `floor` | **must not change** | e2e "while the fingers are down the OIL tab's names and headings stay pinned (D1287)", "the OIL tab opened over a scrolled page…"; walk R1 (`lw-oil`) |
| Balances page | none — no `floor` | **must not change** | e2e and `balances.test.tsx` (green); walk R1 (`lw-balances`) |
| Quals, phone | `edges`, `scrollPage`, `pin`, `pinAt`, `alsoTL`, `.q-pinching` | **has it** | e2e Quals pinch tests (3); walk Q1–Q8, T2 |
| Quals, desktop | none — no pinch on a desktop (D1110: `canStart` is the phone's; no `wheel`) | **must not** gain one | walk D2 |
| Quals, a browser without scroll-driven animations | the pinned row has no still name heading there; its scroller's own is still carried left on a pinch in | **MISSING — filed** `[QUALS-PINCH-NOSDA-HEAD]` (not seen; worked out from the code; Chrome and the walk take the other path) | — |
| The board's desktop layout on a phone | none — no `floor` | **must not change** | e2e `pinchzoom.spec.ts` board tests (green); walk R1 (`board-wide`) |
| The Tracker's chart | none — its own pinch, not this body | **must not change** | walk R1 (`tracker`) |
| The body's other readers (`scaleOf`, `scrollChain` — the drag, the keyboard lift, the day swap, the selection) | none — those two functions are unchanged | **must not change** | their unit files (green, 109 files) |

## The five sizing lines (§7.0, `docs/walk-ledger.md`)

1. **The type of change:** C (an existing gesture — what its frames draw) and E (the pinned row's box while pinching).
2. **What only a walk could find here:** what is DRAWN mid-pinch — paint order over the corner, a box that clips or shows
   through, Safari's engine's drawing, fingers drifting as a person's do, the moment after the lift; the tests read geometry
   in Chrome only, and one reading this job's own script showed a hit test can answer differently from the picture (the
   frozen row's contents grow past its box — the script's note).
3. **What the ledger says:** pinch walks of 21 Oct (board and Quals — SMALL, host alone), 23 Oct (the Leave War's pinch —
   SMALL; its re-walk found 4, among them a band part-way down) and 30 Oct (the sweep — these three, mid-pinch). Every pinch
   walk has found something, nearly always mid-gesture and part-way down (§7.11 lesson 13).
4. **The walk chosen:** ONE Sonnet 5.5 walker, scripted, the host opening every picture that decides. 15 phone scenarios
   (L1–L7, Q1–Q8 below), each at rest, mid-pinch and after the lift, on **both** builds (origin/main's for the before, this
   branch's for the after), in Chrome by real fingers and in WebKit by touches made inside the page; the taps T1–T2 (D1281)
   and the desktop D1–D2; the six-surface regression R1 (`pinned-pinch.mjs`) on the after build. Sizes: his iPhone's
   402 × 874 at 3x and his PC's 1536 × 730 at 1.25. Carried by tests: the floor's arithmetic (`pinchzoom.test.ts`, the body
   called directly); the other surfaces' own mid-pinch readings (their e2e tests, real fingers, green). About 25 minutes of
   running.
5. **After the walk:** its row in `docs/walk-ledger.md` — the walker's figures, the host's findings.

**§7.11's lessons, each against this change:** 1 (one state only) — at rest, mid-pinch and after the lift; top, part-way and
frozen; Manning open and folded; Pilots and All; scrolled sideways · 2 (one speed) — one pinch speed, about a person's quick
pinch (0.2 s, fingers drifting); each frame is worked out from that move alone, so a slower pinch draws more frames of the
same kind — carried, said here · 3 (feedback) — no press feedback changes; every tap pictured (T1–T2) · 4, 10, 12, 14, 16,
17 — no window, page return, keyboard box, typed figure or width control in this change · 5 (a box brought into sight) — the
lift's scroll brings the spot back under the fingers: every scenario reads after the lift · 6 (only the real phone draws) —
**his iPhone look**, mid-pinch, at both · 7 (a model of the phone's motion) — the stretch is the app's own transform, but
`scrollPage` scrolls the page mid-gesture on Quals now: his look is what proves Safari lets it · 8 (an approved drawing) —
none for this · 9 (alignment measured) — Quals' names, name heading and each pinned heading against its column are measured,
not looked at · 11 (how much is on screen) — the fingers' height is worked out from where the names start (L1) · 13 (part-way
down) — the core of the walk · 15 (what a pinned bar lets through) — Q7 reads through the see-through pinned row; R1's probe.

## The scenarios (numbered; each pictured at rest, mid-pinch and after the lift)

**The Leave War grid, phone** (`pinch1031-walk.mjs`, `lw`) — mid-pinch and after: nothing of the names' frozen copy over the
date row's corner or LVE heading; the names, the corner and the frozen corner at the grid's left edge.
- **L1** part-way down (the date row about 150 down), Manning folded, a pinch IN, fingers just below where the names start —
  *the fault: before FAIL, after PASS.*
- **L2** the same place, a pinch OUT.
- **L3** part-way down, Manning open, a pinch IN.
- **L4** at the top of the page, a pinch IN. **L5** the same, a pinch OUT.
- **L6** 45% down, the dates frozen under the top bar, a pinch IN. **L7** the same, a pinch OUT.

**Quals, phone** (`pinch1031-walk.mjs`, `quals`) — mid-pinch and after: no band under the pinned heading row (each point down
to the fingers a cell, a see-through box looked through); every name at the table's left edge; the pinned name heading at
the edge and as wide as the names; each pinned heading over its column.
- **Q1** part-way down (420), a pinch OUT — *the band: before FAIL, after PASS.*
- **Q2** part-way down, a pinch IN — *the names off the left: before FAIL, after PASS.*
- **Q3** at the top, a pinch IN (the table's own heading row held where it stood). **Q4** at the top, a pinch OUT.
- **Q5** part-way down, scrolled sideways 150, a pinch IN. **Q6** the same, a pinch OUT.
- **Q7** All, 60% down (the heading row stays frozen through a pinch out — the see-through row). **Q8** the same, a pinch IN.

**Taps, phone — a picture right after each, the finger where it pressed, and settled (D1281)** (`pinch1031-taps.mjs`,
`phone`): every pinned cell in sight solid after each.
- **T1** the Leave War: Manning open, Manning folded, SEP; pinched in, then MAR and Manning again.
- **T2** Quals: WSOs, Personnel, All, Pilots; part-way down a pinned heading (it sorts); pinched out, then WSOs and Pilots.

**Desktop, his PC's size** (`pinch1031-taps.mjs`, `desk`):
- **D1** the Leave War grid part-way down, a Ctrl+scroll read mid-burst: the corner and every name at the left edge.
- **D2** Quals part-way down, a Ctrl+scroll over the table: nothing stretches, the pinned row unmarked.

**The regression of every pinch surface** (`pinned-pinch.mjs`, the pinch walk of 30 Oct 26, unchanged):
- **R1** the Leave War grid, Balances, the OIL tab, Quals, the board's desktop layout and the Tracker, each part-way down,
  pinched out then in, the pinned-part probe mid-pinch and after the lift — on the after build. On 30 Oct 26 the grid and
  Quals were its only mid-pinch readings; after this change all six should read 0.

## How to run (the walker only runs these; nothing builds without the lock)

```
# the checkout: C:/Users/User/projects/Raptor/.claude/worktrees/week-drag-edge-pan-review-d26775
# 1. origin/main's build, in its own folder outside the repo, for the BEFORE
mkdir -p /c/Users/User/pm1031
git -C C:/Users/User/projects/Raptor/.claude/worktrees/week-drag-edge-pan-review-d26775 archive origin/main raptor-port | tar -x -C /c/Users/User/pm1031
cmd //c mklink /J "C:\Users\User\pm1031\raptor-port\node_modules" "C:\Users\User\projects\Raptor\.claude\worktrees\week-drag-edge-pan-review-d26775\raptor-port\node_modules"
cd /c/Users/User/pm1031/raptor-port && node C:/Users/User/projects/Raptor/.claude/worktrees/week-drag-edge-pan-review-d26775/raptor-port/scripts/gatelock.mjs exec "claude/pinch-fixes-1031 — before build" -- npm run build
# 2. this branch's build, for the AFTER
cd C:/Users/User/projects/Raptor/.claude/worktrees/week-drag-edge-pan-review-d26775/raptor-port && node scripts/gatelock.mjs exec "claude/pinch-fixes-1031 — after build" -- npm run build
# 3. the walk (no lock: a script on a build already made) — out-dirs outside the repo, the deciding pictures copied in after
cd C:/Users/User/projects/Raptor/.claude/worktrees/week-drag-edge-pan-review-d26775/raptor-port
node scripts/handpass/pinch1031-walk.mjs C:/Users/User/pm1031/raptor-port/dist C:/Users/User/pm1031-out/before
ENGINE=webkit node scripts/handpass/pinch1031-walk.mjs C:/Users/User/pm1031/raptor-port/dist C:/Users/User/pm1031-out/before
node scripts/handpass/pinch1031-walk.mjs dist C:/Users/User/pm1031-out/after
ENGINE=webkit node scripts/handpass/pinch1031-walk.mjs dist C:/Users/User/pm1031-out/after
node scripts/handpass/pinch1031-taps.mjs dist C:/Users/User/pm1031-out/after
ENGINE=webkit node scripts/handpass/pinch1031-taps.mjs dist C:/Users/User/pm1031-out/after phone
node scripts/handpass/pinned-pinch.mjs dist C:/Users/User/pm1031-out/after/six-surfaces
```
Each walk prints one PASS / FAIL line per check and `<n> of <m> checks pass`, and writes `results.json` beside its pictures
(`<id>-rest.png`, `<id>-mid.png`, `<id>-lift.png`; the taps `<id>-<label>-touched.png` and `-settled.png`). Expected: the
before fails L1, Q1 and Q2 (and probably the other Quals scenarios' names, which the same fault carries); the after passes
every check. Copy into `docs/img/handpass/2026-10-31-pinch-fixes/{before,after}/` every `*-mid.png`, the taps' `*-touched.png`
and each `results.json`. The builder's own run of both scripts on the after build (a check that they run, pictures not
judged): Chrome 78 + 127 and WebKit 205 checks, taps and desktop 31 — all pass, once the frozen row's hit-test reading was
taken out of the script (its first run).

## Cases carried by a test

| Claim | Test | Through the real controls? |
|---|---|---|
| the floor's foot from the stretch, a pinch in and out | `src/ui/pinchzoom.test.ts` "a floor that is a row's foot follows the row…" | no — the pinch body called with touch events in jsdom |
| the OIL tab, Balances and the board's layout pinch as before | their tests in `e2e/leavewar.spec.ts`, `e2e/pinchzoom.spec.ts` (42 passed, 14 skipped as the other size's) | yes — real fingers over CDP |

## What was not walked, and why

- His iPhone (lesson 6): WebKit in a test browser takes no outside touch input; his look carries it.
- A browser without scroll-driven animations for Quals: filed `[QUALS-PINCH-NOSDA-HEAD]`.

## Checks so far (the builder's, 31 Oct 26)

- Unit, the touched files (`src/ui/pinchzoom.test.ts`, `src/ui/quals.test.tsx`, `src/leavewar/ui/`): 109 files, 1726 passed,
  20 skipped.
- Browser, the touched tests (`e2e/pinchzoom.spec.ts`, and every pinch, Ctrl+scroll, Quals and D1281 test of
  `e2e/leavewar.spec.ts` and `e2e/geometry.spec.ts`, three projects): 42 passed, 14 skipped (the other size's).
- The build (`npm run build`, typecheck and bundle) ran green as the browser run's server, under the lock.
- GitHub's run of the pull request is the full gate set (D1086) — not yet opened.

## The walk

Walker: Sonnet 5.5, 31 Oct 26. Builds: the fixed build = this branch's head (`dist`, newer than every file under `src`); origin/main's
(`15b7b2f60`) built in `C:\Users\User\pm1031`. Pictures `docs/img/handpass/2026-10-31-pinch-fixes/`: `before/` (origin/main) and `after/`
(this branch), each `chromium/` and `webkit/` with every `<id>-mid.png` and `results.json`; `after/<engine>-taps/` the `*-touched.png`;
`after/six-surfaces/` R1's mids; `compare/` side-by-sides the walker cut. Every mid-pinch picture of both builds in Chrome was opened;
WebKit's L1, L2, L6, L7 (both builds), and the taps, D1 and R1's mids once. The rest-state and lift pictures were opened only where named.

**The script's result (checks passing), then what the PICTURE shows.** A script PASS with a picture fault is a FAIL here.

| Scenario | Before (origin/main) Chrome · WebKit, script | Before, picture | After Chrome · WebKit, script | After, picture (mid-pinch) |
|---|---|---|---|---|
| L1 part-way, Manning folded, pinch in | FAIL · FAIL | Chrome: FAULT — the SXO group row is drawn over the lower part of the corner (corner cut at about 250 of 290); WebKit: no overlap visible though the script says FAIL | PASS · PASS | PASS — corner whole, SXO row below it (`compare/L1-corner-…png`, `after/chromium/L1-mid.png`) |
| L2 part-way, Manning folded, pinch out | PASS · PASS | fine — names from SXO down | PASS · PASS | **FAIL — the names column is blank from the SXO row down to Saber (the group row and Reaper to Ranger) while the grid cells beside them stay; Chrome and WebKit** (`compare/L2-…png`, `after/*/L2-mid.png`); back after the lift |
| L3 part-way, Manning open, pinch in | PASS · PASS | fine | PASS · PASS | PASS — names, corner, left edge |
| L4 top, pinch in | FAIL · FAIL | Chrome: FAULT — the names' first rows over the corner's lower part | PASS · PASS | PASS — names cut at the corner's foot, corner whole |
| L5 top, pinch out | PASS · PASS | fine | PASS · PASS | PASS |
| L6 dates frozen, pinch in | PASS · PASS | fine | PASS · PASS | PASS — frozen date row whole and grown, first name row directly under it, no names over its corner, no gap, no see-through (`compare/L6-…png`) |
| L7 dates frozen (45% down), pinch out | PASS · PASS | fine | PASS · PASS | **FAIL — the names column is blank for the whole screenful, SXO down to Nomad; only the last few rows show at the bottom; Chrome and WebKit** (`compare/L7-…png`); back after the lift |
| Q1 part-way, pinch out | FAIL · FAIL | FAULT — a band of empty page under the heading row | PASS · PASS | PASS — table directly under the toolbar, no band |
| Q2 part-way, pinch in | FAIL · FAIL | FAULT — names off the left edge (−159) | PASS · PASS | PASS — names at the left edge under "CALLSIGN/NAME ▲" |
| Q3 top, pinch in | FAIL · FAIL | FAULT — band, names off | PASS · PASS | PASS |
| Q4 top, pinch out | FAIL · FAIL | FAULT — names off the left (+137) | PASS · PASS | PASS |
| Q5 part-way, scrolled sideways, pinch in | FAIL · FAIL | FAULT — names off the left | PASS · PASS | PASS |
| Q6 same, pinch out | FAIL · FAIL | FAULT — band and names off | PASS · PASS | PASS |
| Q7 All, 60%, pinch out | FAIL · FAIL | FAULT — band at the heading row's foot, names off (+101) | PASS · PASS | PASS |
| Q8 All, 60%, pinch in | FAIL · FAIL | FAULT — names off the left | PASS · PASS | PASS |

**Breaks (faults seen on origin/main's build in its pictures, Chrome): 10 of 15 scenarios** — L1, L4, Q1–Q8 (WebKit's own picture shows L1's overlap
not at all; its script still says FAIL, so WebKit gives 9 of 15 by picture). After: **13 of 15 scenarios clean by picture; L2 and L7 FAIL**
(names column missing mid-pinch, both engines) although the script passed them.

| Check | Chrome | WebKit | Pictures |
|---|---|---|---|
| Walk, after build: 205 checks | 205 / 205 | 205 / 205 | `after/<engine>/*-mid.png`; L2, L7 FAIL by picture |
| Walk, before build: 207 checks | 185 / 207 (L1, L4, Q1–Q8) | 185 / 207 (same ids) | `before/<engine>/*-mid.png` |
| T1 Leave War taps (D1281) | PASS — pinned cells solid after each tap, touched and settled | PASS | `after/<engine>-taps/T1-*-touched.png` — nothing see-through, nothing moved |
| T2 Quals taps | PASS | 18 of 20: T2 pinned-heading-sort FAIL (touched and settled) — the sorted heading's own faint tint (white at 4%) read as not solid; its picture shows a solid heading, same as Chrome → script false alarm | `T2-*-touched.png`; Chrome's `T2-pinched-out.png` |
| D1 desktop Leave War, Ctrl+scroll | PASS — corner and names at the left edge mid-burst | not run (desktop was Chrome only) | `D1-mid-burst.png` |
| D2 desktop Quals, Ctrl+scroll | PASS — nothing stretches | not run | `D2-after.png` |
| R1 six surfaces | all 24 readings 0 leak points | not run | `after/six-surfaces/*-mid.png` — the grid pinch out (`lw-grid-out-mid.png`) shows the same missing names as L2 |

Not run: the desktop taps in WebKit (the script's desktop half is Chrome-only in the sheet's own commands); two-finger taps in WebKit
(the script skips them: T1 and T2's zoomed taps are Chrome's). WebKit's lift pictures of L2 show the grid's names squeezed to two letters
in both builds alike (a WebKit zoom reading; not this change).

## Fix round 1 — the walk's L2 and L7 (the builder, 31 Oct 26)

**The fault (in this change):** part-way down the Leave War, and with the dates frozen, a pinch OUT left the names column blank
under the date row until the lift (L2: the SXO row down to Saber; L7: nearly the whole screen) — `compare/L2-names-missing-…png`.
**The cause:** a pinch out part-way down scrolls the page with the pinch (D1288, `scrollPage`), and the names copy sits in the
page, so that scroll carries it down as well as its own stretch. The names' cut-off line was worked back into the copy's own
units through its stretch only, not through that scroll, so it stood exactly the page's scroll too low. A pinch in scrolls
nothing, which is why L1, L3, L4 and L6 were right. The old fixed line had the same blind spot but stood high enough not to
show. **The fix:** `pinchzoom.ts` works the cut back through both (the picture's whole carry, `dy`, not only the box's own
translate). Still worked out from the stretch; nothing measured per frame.

**Red first, on the branch before the fix:**
- `src/ui/pinchzoom.test.ts` *"a floor that is a row's foot is cut where the row is drawn when the page scrolls with a pinch
  out"* — expected `inset(40px …)`, got `inset(180px …)`.
- `e2e/leavewar.spec.ts`, the D1287 test's two new steps: *"with the dates frozen, pinching OUT, the names are drawn all the
  way down to the fingers"* — day cells at 86–116 where names belong; *"part-way down, pinching OUT, …"* — group-row filler and
  closed-day cells at 277–367. (A first draft of the steps passed the frozen case wrongly: it ran after a pinch out that had
  left the grid at its smallest zoom, so its pinch out shrank nothing. The step now runs while the grid is zoomed in and checks
  that its pinch did shrink the grid.)

**Why the script missed it — a lesson for §7.11:** the walk's L2 and L7 checks asked only that nothing of the names was drawn
where it must NOT be (over the corner); none asked that the names were still drawn where they MUST be. A clip that moved too
low passes a one-sided check, and the picture shows the hole. **Lesson:** a clip, a cover or a cut-off line is read from both
sides — what must be hidden is hidden, AND what must show still shows, at several heights down to the fingers — and the walk
asks that of every picture whose script passed. Also met on the way: a "pinch out" that starts from the smallest zoom moves
nothing, so a step after one must check that its own pinch changed the zoom. (Put to the host to add to §7.11; not added to
the order by the builder.)

**The script fixed (v2):** `pinch1031-walk.mjs`'s Leave War reading now scans the names column from the date row's foot to the
fingers. Each point must be a name, a group heading or another pinned name cell; the frozen row's see-through box is looked
through. `pinch1031-taps.mjs` (v2) tells a pinned cell's faint tint laid on an opaque fill of its own pinned part (the hovered
sort heading of WebKit's T2, white at 4% over the pinned row's box) from a real see-through.

**Checks after the fix (under the lock):** the three earlier red-first browser tests and the new steps, in the touched set:
42 passed, 14 skipped (`e2e/pinchzoom.spec.ts`; every pinch, Ctrl+scroll, Quals and D128x test of `e2e/leavewar.spec.ts` and
`e2e/geometry.spec.ts`; three projects). The build (typecheck and bundle) ran green as that run's server. Unit, the touched
files: 109 files, 1727 passed, 20 skipped.

**The re-walk of the Leave War (the builder's run; the host opens the deciding pictures):** `after-fix1/chromium/` and
`after-fix1/webkit/` — every `L*-mid.png` and `results.json`. Chrome 99 of 99 checks; WebKit 99 of 99, three runs on a quiet
machine. **To open:** `after-fix1/chromium/L2-mid.png`, `after-fix1/chromium/L7-mid.png`, and their WebKit twins. **Met in
passing:** two WebKit runs made while the unit suite was running beside them failed L1, L2 and L4 mid-pinch (the corner read
39–71 left of the grid's edge, the names over it); the same build passed every check three times once the machine was quiet,
and Chrome passed under the same load. WebKit's touches are made inside the page, and the reading looks timing-bound. Not
chased; for the host to judge. **Not walked, worth one look:** after a tap on a Quals heading (an iPhone keeps it "hovered",
white at 4% with no fill of its own), a pinch out with the heading row frozen makes the pinned row's box see-through
(`.q-pinching`), so that one heading could show the rows faintly through it mid-pinch. This is worked out from the code, not seen.

## The code read and fix round 2 (the builder, 31 Oct 26)

**The read** — a fresh, blind Opus reader of the code to f416065b8, `docs/handpass/parts/pinch1031/read-opus.md`: everything
else checked sound (only the grid passes a floor; the cut correct for a box in the page; the floor the same arithmetic as
the date row's placement every frame; nothing measured per frame; every lift and cancel resets what it set; Ctrl+scroll,
the memo firewall and Quals' paint order untouched). Two findings, both fixed red first:

1. **A pinch that turns direction** (medium-low; in Quals by this change, in the Leave War since D1288). Part-way down a
   pinch out scrolls the page up with the pinch and the frozen heading row unpins; the fingers turning back to a pinch in
   scroll it down again and the row was pinned anew mid-gesture — at rest over the stretched table (the pinch stretches only
   the parts it read at its start), its column widths measured off stretched cells and kept after a lift at the zoom it
   began at. **Fix:** a pinching flag (`QualsPage.tsx` `qPinchingRef`, `Matrix.tsx` `pinchingRef`), set by the pinch's
   onStart and cleared by its onEnd; while it is set the row may unpin but is never pinned or measured anew, and onEnd
   measures it once (`qRepinRef` / `repinRef` — the stretch is already off then, the zoom not yet written; a new zoom measures
   it again as before). A stretched table is never measured, whoever asks (a guard on the table's transform). The widths
   are still read from the cells' boxes, now only ever at rest — not from `offsetWidth` as the reader suggested, because that
   rounds each column to a whole pixel and thirty columns would drift the headings off by up to 15 px.
   **Red first** (the branch at f416065b8, Chrome, real fingers; green after):
   - `e2e/pinchzoom.spec.ts` *"part-way down, a pinch out that turns back to a pinch in leaves the frozen heading row over its
     columns…"* — mid-gesture and after the lift every heading off: "1: 114/58 over 143/77" … (left/width of the frozen
     heading over the column's), the widths about 0.76 of the columns'.
   - `e2e/leavewar.spec.ts` *"with the dates frozen, a pinch out that turns back to a pinch in leaves the frozen date row over
     its columns…"* — 18 dates off mid-gesture and after the lift ("2: 91/17 over 107/21" …). At 700 down this test could not
     turn red: there a pinch out never brings the date row back into sight, so the row never unpins; it runs at 260 down,
     where the row is only just frozen (D1288's own test's place).
2. **The unit-test gap** (low). The reader's exact case — a box 40 tall held above a floor row `{top 40, foot 80}`, a pinch out
   with the page scrolling, the cut at 40 + S + k·40 — is added and passes, **but it does not turn red on the break the reader
   names** (dropping the scroll from the row's held top): with the row flush under the held box the picture's place and the
   held top carried by the scroll are the same line, so either gives 80. A second case with 20 between the box and the row
   (`{top 60, foot 100}`) does: `inset(100px …)` on the break, `inset(120px …)` as built. Both are in `src/ui/pinchzoom.test.ts`.

**The walk script, v3:** `pinch1031-walk.mjs` gains **L8** (the dates just frozen, 260 down, a pinch out that turns back to a
pinch in, lifted at its starting zoom) and **Q9** (Quals 420 down, the same turn), each read mid-gesture and after the lift,
with "lifted at the zoom it began at" and "frozen again" checks; the Leave War reading gains "the frozen date row over its
columns" (left and width of every frozen date heading in sight against the grid's), Quals' "every pinned heading over its
column" now width as well as left; Quals' band scan starts under the top bar (mid-turn the table's own heading row may stand
above the screen — the script's first v3 run read from −195).

**The re-walk after fix round 2** (the builder's run, nothing else running beside it; the host opens the deciding pictures):
`after-fix2/chromium/`, `after-fix2/webkit/` — every `*-mid.png`, `L8-lift.png`, `Q9-lift.png` and `results.json`. **Chrome
267 of 267 checks. WebKit 266 of 267**: L6 mid-pinch, the new line-up reading — each frozen date heading about 360 px right
of the grid's own for its day, mid-pinch in with the dates frozen; Chrome lines up; after the lift both line up; **origin/main's
build reads the same in WebKit** (`before-fix2-check`, not kept), so it is older than this job and the reading is new — filed
`[LW-PINCH-FROZEN-WEBKIT-OFF]`, its picture to be looked at first (it may be how WebKit reports a box under a paused
scroll-driven animation). **To open:** `after-fix2/chromium/L8-mid.png`, `L8-lift.png`, `Q9-mid.png`, `Q9-lift.png` and their
`webkit/` twins.

**After fix round 2 (under the lock):** the touched browser tests — `e2e/pinchzoom.spec.ts` and every pinch, Ctrl+scroll,
Quals, frozen-row and D128x test of `e2e/leavewar.spec.ts` and `e2e/geometry.spec.ts`, three projects: **65 passed, 21
skipped** (the other size's); the build (typecheck and bundle) green as that run's server; unit, the touched files: **109
files, 1729 passed, 20 skipped**.

**The rounds:** two fix rounds — round 1 the walk's (L2, L7), round 2 the read's (the turn; the test gap). The last round's
fixes are carried by their red-first tests and the re-walk above; a narrow read of the round-2 commit is the host's to order
(§5 "A fix is new code" — the pinching flag is new logic beside the mirror's pin, in two files).

**§7.11 — the lesson from round 1, put to the host for the order** (the walk found it, so it is not one of his finds that D1297
makes mandatory): *a clip, a cover or a cut-off line is read from both sides — what must be hidden is hidden, AND what must
show still shows, at several heights down to the fingers — and the walk asks that of every picture whose script passed; a step
that pinches after another pinch checks that its own pinch changed the zoom (from the smallest zoom a pinch out moves
nothing).* Round 2 adds a second for the same list: *a gesture whose page scrolls with it is walked turning direction
before the lift — what the scroll unpins on the way out must not come back mid-gesture on the way in.*

## Fix round 3 — the turned pinch left no date row (the host's look at round 2's pictures, 31 Oct 26)

**The fault (in round 2's fix):** `after-fix2/*/L8-mid.png` — the turned pinch with no frozen date row and no month buttons at the
top, the SXO group straight under the top bar, until the lift. Round 2's "may unpin, never pin anew" let the row go as the page
scrolled up and kept it gone as the page came back down: D1287's "the frozen date row under the month buttons" broken. Round 2's
L8 checks passed it — they read only that a frozen row, if any, was over its columns, never that a date row was there.

**Red first** (the branch at 81e84207b, Chrome, real fingers): the two turned-pinch tests, extended to read that a heading row IS
drawn under the top bar (the frozen row shown, or the table's / grid's own in sight below it) and never two —
`e2e/leavewar.spec.ts` *"…a pinch out that turns back to a pinch in…"*: "a date row is drawn under the top bar" — no frozen row,
the grid's own date row at −33 (the bar's foot at 49); `e2e/pinchzoom.spec.ts` the same for Quals — the table's own heading row
at −219.

**What was chosen:** while the fingers are down the frozen row is neither mounted, unmounted nor measured — a row frozen at the
pinch's start STAYS, stretched with the grid as the pinch read it at its start (D1287's normal case), and is only HIDDEN while the
grid's own date row (held from rising, so drawn at its place or lower) is in sight below the top bar, shown again the moment that
row would pass under it. So a date row always stands under the top bar, and never two (his D1288 picture: a frozen row at the top
and the grid's own lower down). A row not frozen at the start never needs one: the grid's date row, held from rising, never passes
under the top bar. The lift clears the hiding and settles the pinned state and widths once, from rest. Not chosen: freezing the
row shown for the whole gesture — on a pinch out part-way down the page scroll brings the grid's own date row into sight under it,
the second date row D1288 took away. (`Matrix.tsx` and `QualsPage.tsx` `pin`; the hiding follows the page's scroll events, so it
can trail the crossing by a frame.)

**Checks after round 3 (under the lock):** the touched browser tests — every pinch, Ctrl+scroll, Quals, frozen-row and D128x test
of the three files, which carry rounds 1–3's red-first tests: **65 passed, 21 skipped**; the build green as their server; unit,
the touched files: **109 files, 1729 passed, 20 skipped**. Two test readings corrected on the way: a frozen row kept but hidden
counts as absent (the Quals band reading had taken it as the heading row).

**The walk script, v4:** every Leave War and Quals reading, at rest, mid-pinch and after the lift, now also asks that a date row /
heading row IS drawn under the top bar and that there are never two; a hidden frozen row counts as absent.

**The re-walk after round 3** (the builder's, nothing else running beside it): `after-fix3/chromium/`, `after-fix3/webkit/` — every
`*-mid.png`, `L8-lift.png`, `Q9-lift.png`, `results.json`. **Chrome 372 of 372. WebKit 370 of 372:** L6 (the older reading,
`[LW-PINCH-FROZEN-WEBKIT-OFF]`) and Q5 (scrolled sideways, a pinch in: the frozen headings read 47 px right of their columns
mid-pinch) — Q5 passed in round 2's run and in two re-runs of WebKit's Quals walk just after (200 of 200 each), so it is
intermittent and of the same family as L6 (WebKit's reading of the frozen row's sideways follow, paused while pinching); noted
under that item, not chased. **To open:** `after-fix3/chromium/L8-mid.png`, `after-fix3/chromium/Q9-mid.png`, and their `webkit/`
twins (`L8-lift.png`, `Q9-lift.png` beside them).

**The lesson, again, and the rounds' cap:** round 3's miss is round 1's class — a check that read for what must not be drawn and
never for what must. The proposed §7.11 lesson above is widened: *every pinned part a walk reads mid-gesture is read for presence
as well as for place — is it there, in sight, the only one — not only "where it is, if it is there".* Three fix rounds reached
(the order's cap, §5): what carries the rest is the red-first tests of all three rounds, the re-walk above and his iPhone look.

## Findings and dispositions

| # | Finding | Found by | In this change? | Disposition |
|---|---|---|---|---|
| 1 | The names column blank mid-pinch out part-way down and with the dates frozen (L2, L7) | the walk's pictures (the script passed) | yes | fixed red first, round 1 (f416065b8) |
| 2 | A pinch that turns re-pins the frozen row over the stretched table, its widths measured off stretched cells | the code read | yes on Quals; older on the Leave War (D1288) | fixed red first, round 2 |
| 3 | The unit tests did not pin the floor row's held top | the code read | yes (test gap) | a case that turns red on the break added, round 2 |
| 4 | WebKit's T2: the sorted heading's 4% tint read as see-through | the walk (a script reading) | no — the script | the taps script tells it apart (v2) |
| 5 | WebKit's L1, L2, L4 failing only while the unit suite ran beside the walk | the builder's re-walk | — | timing-bound in WebKit's in-page touches; three quiet runs clean; noted |
| 6 | WebKit's frozen date row read ~360 px off its columns mid-pinch in (L6) | the round-2 re-walk's new reading | no — origin/main the same | filed `[LW-PINCH-FROZEN-WEBKIT-OFF]` |
| 7 | Quals' frozen name heading still carried left mid-pinch in, in a browser without scroll-driven animations | the builder, from the code | yes (the part this change leaves) | filed `[QUALS-PINCH-NOSDA-HEAD]`, with the read's tidiness note |
| 9 | Round 2's turned pinch left no date row (Leave War) or heading row (Quals) under the top bar until the lift | the host's look at round 2's pictures (the script passed) | yes (round 2) | fixed red first, round 3 |
| 10 | WebKit Q5 once: the frozen Quals headings read 47 px off mid-pinch in, scrolled sideways | the round-3 re-walk | — (did not repeat) | intermittent, noted with `[LW-PINCH-FROZEN-WEBKIT-OFF]` |
| 8 | After a tap on a Quals heading (kept "hovered" on an iPhone), a pinch out with the row frozen could show rows faintly through that heading | the builder, from the code | yes (the see-through box) | not seen; for the host's look |

## The code read

*(a fresh, blind Opus reader — owed)*

`Walk: docs/handpass/2026-10-31-pinch-fixes.md · 193 pictures · 7 surfaces (the Leave War grid and Quals on a phone; the grid and Quals at his PC's size; the OIL tab, Balances, the board's desktop layout and the Tracker in the six-surface pinch) · 4 orders (a pinch in, a pinch out, a pinch out turned back in, a tap then a pinch) · MISSING: 1 filed ([QUALS-PINCH-NOSDA-HEAD]) · fix rounds: 3 (the walk; the code read; the host's look), each red first, re-walked after-fix1–3`  — the picture count is every picture the job holds under `docs/img/handpass/2026-10-31-pinch-fixes/`, after-fix3 included.
