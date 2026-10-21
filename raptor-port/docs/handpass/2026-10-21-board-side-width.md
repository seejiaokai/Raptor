# The board's right panel and the crew list — evidence sheet (21 Oct 26, `claude/board-side-width`, pull request 562)

[BOARD-SIDE-WIDTH] — his rulings D1113, D1114, D1115, D1116, D1118, D1119, D1120 (D1121 is a later job, [CREW-REASON-TWICE]).
Pictures: `docs/img/handpass/2026-10-21-board-side-width/` — `walk/` (the first walk, with its find), `rewalk/` (after the
fix), `look/` (D1115's look, round 2), the round pages' pictures at the folder's top. Scripts: `scripts/handpass/bsw-*.mjs`.

## 1. The eight answers and the tier

| # | Question | Answer |
|---|---|---|
| 1 | Money (OIL) | NO — nothing earns or counts OIL; the crew list's look and order only |
| 2 | The published record | NO — the crew list is never drawn on a published face; nothing about publishing or amendments changes |
| 3 | Saved data | NO, with its reason: the panel's width is a view preference on one browser (`raptorLocal:sbSideW`, outside the shared store, never read by anything but the grip; lost, the panel shows 320) — written into `data-schema.md` |
| 4 | A shared drawer | YES — `rosterPuck` / `paletteHTML` draw the crew list on the board and on Edit Schedule, phone and desktop |
| 5 | A new gesture or mode | YES — the width grip (drag, double-click, keys) |
| 6 | A new surface | NO |
| 7 | Roles | NO |
| 8 | The warning list | NO — `dayEngaged` keeps its answer for every reader but the crew list (`standbyFree` is the crew list's alone); `validate` untouched |

**Tier: WALK.** The code read: one fresh, blind Opus read (D790).

## 2. The roll-call — every place the crew list is drawn

Columns: ATT B look (D1118) · standby not faded (D1120) · SANS order and count (D1119) · strike on the puck (D1118) · reasons
beside where 92 is free (D1118) · the grip (D1113) · the strip's dot (D1119) · heading in sight (D1116).

| Place | ATT B | Standby | SANS | Strike | Beside | Grip | Strip | Heading |
|---|---|---|---|---|---|---|---|---|
| Board, right panel, desktop | YES — walked (rewalk `pc-none-side`) | YES — walked, an AVALON man placed by the crew list | YES — walked | YES — walked, puck − 6 measured | YES — walked at 320 (under; SANS rows beside, they are full width), 614 and 410 | YES — walked: drag, reload, double-click, keys, window resize | YES — walked ("Planning FCP") | must not — the board has its own bar (`.sb-top`), no "AIRCREW" heading |
| Board, phone layout, crew drawer | YES — walked (`phone-drawer`) | YES — same builder; carried by `palette.test.ts` (D1120 block) | YES — walked | YES — walked, puck − 6 | must not, because the rule is desktop only (the drawer sizes to what it holds) — walked: 8 of 8 under | must not, because the column is the drawer — walked: hidden | YES — same title builder; carried by `palette.test.ts` | must not — as the board |
| Board, desktop layout on a phone (`.sb-wide`) | YES — same drawing as the drawer | YES | YES | YES | must not — ≤820 rules; side stays 320 | must not — walked: `display:none`, side 320 | YES | must not |
| Edit Schedule, crew panel, desktop | YES — walked, words UNDER (its columns are one puck wide) | YES — walked | YES — same builder | YES — same stylesheet rule | must not, because its columns are one puck wide (D1118 is the board's panel) — walked: under | must not, because D1113 is the board's panel — walked: none | YES — same title builder | YES — walked at 1536 and 1024, scrolled 900: heading under the bar, the day picker steps the day |
| Edit Schedule, phone drawer | YES — same builder (`.rpuck.grounded.haswhy` column rule, all widths) | YES | YES | YES | must not — no rule there | must not — no grip there | YES | must not change — the drawer has its own sticky heading inside its own scroll (03-week.css, untouched) |
| The ALL AVAIL window | must not — its own builder (`AvailWindow.tsx`), entries `.rpuck.clash` / `.flagged`, never `.no` | must not — its own count (`availByWave`), named for him under lesson 14, not changed | must not | must not — `.rpuck.no::after` cannot reach it (no `.no` there) | must not — its own rule (D40) | — | — | — |

No MISSING.

## 3. The five sizing lines (§7.0, `walk-ledger.md`)

1. **Type:** D (one crew list drawn on four surfaces by one builder, with two stylesheets), C (a new grip), E (layout: the
   reasons beside, the strike, the heading held under the bar).
2. **What only a walk could find here:** whether each surface draws the new looks (one builder, but two stylesheets and
   a phone media rule decide the layout); the grip's drag with a real mouse, in both orders with a picked seat; the
   width across a reload and a window resize; the heading's place under a bar whose height varies; the phone.
3. **What the ledger says:** type D — 10 walks, all 10 found a real fault (61), mostly "never wired up"; type C — 15
   walks, 8 found faults, both orders being where they hide.
4. **The walk chosen:** the host alone, one scripted walk of the built bundle, written as assertions (`bsw-walk.mjs`):
   1536 × 864 (his PC), 1024 × 768 (40% = 410, the top bar taller), 402 × 874 by touch; the board's panel and Edit
   Schedule's at both desktop sizes, the phone drawer and the desktop layout on a phone; both orders of "pick a seat /
   widen"; reload; resize. Carried by tests, not walked: the BB line (the same rule as AVALON — `palette.test.ts`
   "a man on a BB line…", which builds the wave with `makeStandalone` and reads the palette: it calls the builder, not
   the screen); a standby line that flies (B typed) → faded (`palette.test.ts`, sets the B in the data — the B box is
   older and untouched, the new part is the list's reading); an AVALON desk (`palette.test.ts`, a block written into
   the data: no screen route makes an AVALON desk except a template, older and untouched); a man on standby and a sim
   → faded (same file, data). The ATT B input is filed through `window.fileInput` (the Inputs' own write,
   `writeInputs`) — the filing is older and untouched; its look is what is walked.
5. **After the walk:** the ledger row is added (`walk-ledger.md`, 21 Oct 26, this job).

## 4. What the walk found, and each disposition

| # | Found | Cause | Disposition |
|---|---|---|---|
| W1 | **Widening the panel dropped the seat being planned** (and would drop a selection): pick a desk, drag the grip — the list went back to "nothing picked" (walk `pc-desk-wide-full`, first walk: `wide … 0 of 0 beside`) | the press begins on the grip and the button comes up over the day, so the browser sends the click to what holds both — the board reads it as a click on blank space (`interactions.ts`, the blank-click handler) | **fixed**: the click that ends a drag that moved is swallowed (`board.ts swallowNextClick`), and both grips are on the handler's list of controls. The issues / crew split's grip (older) had the same gap and gets the same fix. Red first: `e2e/boardside.spec.ts` asserts the desk is still picked after the drag; with the fix taken out it goes red (break test, §6). Re-walked: PASS |
| W2 | 2 walk FAILs were the script's own: (a) at 320 the SANS rows' reasons stand BESIDE their pucks — the SANS section is full width, so 92 is free; the rule is "beside where 92 is free", so the expectation was wrong, now asserted by the rule itself; (b) on a phone the desk's "+" is not where the script pressed, so it selected a man — the phone step now picks a blank line's front seat | the script | not faults; the script corrected (v2, v3) |
| G1 | **GitHub's run of the first push: one unit share red** — `css-invalidation.test.ts`: the drag's cursor rule `body.sbside-drag *` restyles every element (a speed rule) | my rule; my local run of the touched tests did not pick the stylesheet tests (they name no function, only the files) | **fixed**: the rule on the page body alone; the 34 test files that read the stylesheets run locally, green |
| W3 | the first walk's "wide: every reason beside" PASSED with 0 reasons (nothing was picked any more — W1) | a check over an empty list | the check now asserts more than five reasons, and that the seat is still picked |

Re-walk: **37 / 37 PASS** (`rewalk/walk.json`), errors in the browser: none.

## 5. The orders

| Order | Result | How |
|---|---|---|
| pick a desk at 320 → widen to 40% | the desk stays picked; reasons beside | walked (after W1's fix) |
| widen → pick a blank line's front seat | "Planning FCP"; Havoc struck, reason beside | walked |
| widen → close the board → open it | 614 kept | walked |
| widen → reload | 614 kept | walked |
| wide → window made 1024 → back to 1536 | 410, then 614 | walked |
| double-click → keys ← ← ← → End → Home | 320, 380, 614, 320 | walked |
| scrolled Edit Schedule → ‹ › | Monday → Tuesday, heading in sight | walked |
| ATT B, no seat → a front seat → a desk | full colour + words → struck with reason → free for the desk | walked (no seat; front seat; desk) |

## 6. The tests and the break tests

- Unit: `palette.test.ts` (29; the D1118, D1119, D1120 blocks), `sidegrip.test.ts` (7). The touched area's set: 204 files,
  5,288 tests, green.
- Browser: `e2e/boardside.spec.ts` (4) in the `raptor` project.
- Break tests — each wire broken once, its test red: the standby rule (2 red), the ATT B look (1), the SANS order (1 —
  first GREEN: the unit world's SANS men were all crossed out, so any order passed; the test now files two records so
  free men exist, then red), the strip's dot (1), the 40% clamp (2), the width remembered (1), the top bar's height (1),
  the drag's click (browser, 1).

## 7. Not walked, and why

- A passenger seat on a jet (none empty on the demo Monday) — the same list, the same rule as the seats walked.
- The BB line, a flying standby line, an AVALON desk — carried by tests (§3, line 4).
- Safari's own mouse and touch on his iPhone — the grip is desktop only; the phone's looks are his look.
- His PC at 125%: the walk ran at 1536 CSS pixels, his screen's width at 125%.

## 7a. The code read

One fresh, blind Opus read (Opus 5.5, a helper that wrote nothing here), given this sheet and the rulings: 4 findings, a
question and a risk, none false. Each fixed with a test that is red without it.

| # | Finding | Disposition |
|---|---|---|
| F1 (medium) | Edit Schedule's heading goes back under the bar when the "Not saved" band or the OIL bar shows: they grow the bar by its PADDING, which a watch on its content box never sees | fixed — the bar's border box watched, and a window resize re-measures (`topbarvar.ts`); `sidegrip.test.ts` (resize) |
| F2 (medium-low) | a SANS row's entry could shrink below its puck, a long remark lying over it | fixed — `min-width: var(--puck-w)` |
| F3 (low) | a SANS man on ATT B with no record, nothing picked: struck, but under "ATT B: no flying" | fixed — the ATT B look only where nothing strikes him (`gFree … && !why`); `palette.test.ts`, red without it |
| F4 (low) | the desktop layout on a window past 820 showed a grip that changed nothing | fixed — no grip in `.sb-wide`; `boardside.spec.ts` |
| Risk | Edit Schedule's crew panel wears the board's `.sb-roster` class, so the "board only" rules reached it | fixed — the rules written for `#sbRoster`; `boardside.spec.ts` ("its own layout"), red with the old selector |
| Question | a man on ATT B who is ONLY standing by: the ATT B look or the standby look? (neither ruling decides) | the agent's call, told to him: the ATT B look — "ATT B: no flying" is the fact that changes what he may be given, and standing by is already shown on the line he stands by on |
| Older | the strip keeps the title it had when the seat was picked (a callsign typed after does not show); a stale comment | filed [ARM-STRIP-STALE-TITLE]; the comment corrected |

Re-walk after the fixes: 37 / 37 (`final/`, sharp pictures); browser test 6 / 6; the touched tests green.

## 8. Gates

GitHub's run of pull request 562 is the gate set (D1086). Its result on the last pushed commit: see the closing report.

`Docs:` and `docsize:` lines — in the closing report, copied from `npm run docsize`.
