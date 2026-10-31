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

*(the walker's table: scenario × build × engine, PASS / FAIL, the pictures opened)*

## Findings and dispositions

*(the host's)*

## The code read

*(a fresh, blind Opus reader — owed)*

`Walk:` *(the host writes it after the walk)*
