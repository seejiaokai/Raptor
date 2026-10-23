# Leave War M2 ("how it looks") — the fresh, blind Opus code read, 23 Oct 26

Reader: a fresh Opus 5.5 that wrote none of this code (D790, D903 — no Fable). Read-only; this file is its only write.
Scope: `git diff 4a827bb11..HEAD -- raptor-port/src` on `claude/lw-m2-looks` (head `4fb39a17a` — no source change since
`a7bb4968f`), with the code around each hunk; the Leave War and OIL rulings (full rows of D1164, D1167, D1146, D1185,
D1227, D1243, D1245, D1254, D1256–D1258), the build plan (M2 = batches 2, 3, 4, G1, G2, G4), `performance.md` §E,
`perms.ts` with `data-model.md` §11, the scenario design `2026-10-23-lw-m2-scenarios.md` and the walkers' tables.
Excluded by D56: harm living only in stored demo data when the code is right going forward.

## Summary

| Severity | Count | Ids |
|---|---|---|
| High | 1 | F1 |
| Medium | 1 | F2 |
| Low | 4 | F3, F4, F5, F6 |

Checked and found right (no finding): Ack's removal end to end (`readRecBody` maps a stored `acknowledged` request and
notice to pending; no writer can mint it — the type, `BidPicker`, `SelectSheet`, `DayList`, `inputgate.ts`); the HO's
half — `readLedger` keeps it only on an OIL 0.5, an old HO with none reads AM (`awardHalf`), `updateLedgerEntry` /
`setDayAward` / `grantTo` / `editAward` keep, default and drop it consistently with every chip that shows it (BidPicker,
CreditForm, DayList editor, OIL tracker editor — the lit chip is always what saves); the auto HO's `win` is the half
while every clash, charge and OIL-hours reader goes through `wins` / `creditWins` (`forbiddenPair`, `inputgate.ts`,
`oiltracker.ts`; `counters.ts` skips credits; `dayView.away` never counts a credit); the Available points — reader,
writer (`cleanAvailRule` stores "+ 0" as no points, so old and reset rows read alike), one command `lw.availrow`, the
FlyRows memo signature carrying the verdict class, `warFactsVersion` moving on `requirements`; the Required names —
`reqnames` row (`rows.ts CONFIG_KEYS`), `lwDecompose` / `applyLwRecord` (an old config record reads `{}`), the legacy
history snapshot, `warFactsVersion`, admin gate at the store and the name button; `perms.ts` `lw.availrow` /
`lw.reqname` as `Setting U`, matched word for word in `data-model.md` §11 and §1093; Undo words in `undo/describe.ts`;
the two-entry box placement (`pairPlaces`) against D1146 / D1167 for every pair the ladder can produce; the Manning
memory key read at use (M10's fix); the bubble only on a worsening (M6's fix) and its listeners removed on cleanup;
the open-bidding outline still spanning header → table foot with `countsOpen` / `arranging` among its deps.

---

## F1 — HIGH — the grid's bar now re-evaluates the whole period on every grid render, scrolling included

**Failure.** On a phone, swipe the Leave War grid across the months (or, on a desktop, let the year fill in, or drag a
row in Rearrange). Every month the window engine draws while the finger is still moving now also runs a full-period
manning evaluation (365 days × every Manning rule × every person) plus twelve months of the flying plan's answers and
730 Available-row look-ups — inside the scroll's own frames. Nothing on screen is wrong; the swipe gets heavier on every
step, on the phones the grid's whole design (§E: "drawn IN PLACE while the scroll is still moving") exists to keep
smooth (D991). The M2 speed sheet measured nodes, open and tap only — no scroll or fling — so it could not see this.

**Cause.** `ui/Chrome.tsx StageBar` used to be a sibling of the grid inside the memo firewall (`LeaveWarPage.tsx LwFull`)
and rendered only on a store change. M2 moved it INSIDE `ui/Matrix.tsx` (`<StageBar manningOpen=… onManning={toggleManning}
extra={<>…</>} />`, ~line 3448). `StageBar` is a plain function component, and Matrix hands it a fresh function and a
fresh JSX `extra` every render, so it re-renders on EVERY Matrix render — every `setColWin` beat of `stepToward`
(Matrix ~2504, ~2543, ~2586), every `setVisWindow` on scroll (~2342), every `setDragOver` of a row drag (~436), every
sheet open/close and the `setOilUp` ping. Each StageBar render runs, unmemoised:
`evaluatePeriod(people, grid, states, requirements, dates, views)` (Chrome ~285) — the very call Matrix memoises at its
line 167 with the comment that paying it "on every VIEW-state render … is waste" — and `sync.ts manningRedDays`, which
calls `flyMonth` (unmemoised: `monthAnswers` → `planFor` per day) for each of the period's months.

**Fix.** (1) Hand StageBar Matrix's memoised `verdicts` as a prop and drop its own `evaluatePeriod`; (2) in StageBar,
`const planV = usePlanVersion(), warV = useWarFacts()` and `const redList = useMemo(() => manningRedDays(dates, verdicts),
[verdicts, planV, warV])` (both versions are what `manningRedDays` reads; `dates` is the period's, keyed by `period`);
(3) make the element stable: `export const StageBar = memo(function StageBar …)`, `toggleManning` in a `useCallback`,
and `extra` replaced by primitive props (`arranging`, `zoom`, `onZoom`, `onDone`, each callback `useCallback`ed) — or
build the bar once with `useMemo(() => <StageBar …/>, [countsOpen, arranging, role, zoom, verdicts])`. StageBar's own
`useVersion()` still repaints it on a store change. Pin: a test that renders Matrix, bumps `colWin` (or a drag-over
state) and asserts `evaluatePeriod` / `manningRedDays` are not called again (spy on the module); re-measure a phone
fling on the built bundle at CPU 4× before and after (performance.md §E).

---

## F2 — MEDIUM — D1245 not met: the grid still offers every balance beside the names, and jumps to OIL after a write

**Failure.** D1245: "on the grid each name keeps only its LVE figure beside it." On the built M2 grid: (a) the column
heading beside CS/Name is still the figure picker — tap it (or swipe across the column) and the column shows OIL, CCL,
MED TOT or any other figure, its dots counting them all; (b) an admin gives OIL from a day's +OIL panel → the column
beside every name switches to OIL by itself; a bid of CCL switches it to CCL (`onWrote` → `showFigure`); (c) the Legend
still teaches "The figures — each column", one line per balance column the grid is no longer meant to carry. The
Balances fold (the drawer) is gone as ruled, but the second way of showing every balance on the grid stayed. The host's
own "fix before the walk" list item (2) said "the figures section to say only the LVE column" — not done (Chrome
~536–546 unchanged), and scenario R12 checked only the fold.

**Cause.** `ui/Matrix.tsx headerRow` still draws `button.cpick` (`data-testid="counter-pick"`, the dots), the column
swipe on `.mx-wrap` still cycles `shownId`, `showFigure(...)` is still called from the +OIL panel (~4353), the OIL
tracker's `onGranted` (~4206) and the bid sheet's `onWrote` (~4374, ~4385); `ui/Chrome.tsx` StageBar's Legend keeps
`data-testid="legend-figures"` with `FIGURES.map(...)`.

**Fix.** Fix the column to LVE: `shownId` constant `'lve'` (or `shown = figures.find(f => f.id === 'lve') ?? figures[0]`),
the heading a plain label (no `cpick` button, no dots, no tap hint), the column swipe removed, the three `showFigure`
calls removed; the Legend's figures block cut to the LVE column's two lines (balance left in white, below zero red).
The person window (a tap on the name) still shows every figure, so nothing is lost (Matrix's own comment: "Until M5 a
person's every figure is a tap on his name"). If the build meant to keep the picker until M5's Balances tab, that is a
reading of D1245 that must be put to him with a picture (D853), not left silent — D1245's full row reads the LVE
figure as staying "as it is today (its two small lines)", not the picker. Update the walkers' R12 and the tests that
drive `counter-pick` with the ruling named.

---

## F3 — LOW — the red list's "of N" reads Required, not the point the row fell under

**Failure.** Admin sets Available P's red point to "+ 2". A day with Required 24 and 25 pilots available is red (25 <
24 + 2), and the Manning button's list reads "Available P 25 of 24" — more than required, yet listed as breaking a
rule. With the default "+ 0" it reads right ("23 of 24", as drawn r19c).

**Cause.** `engine/availrows.ts availRedLines` sets `need: d.required!`; `Chrome.tsx` prints `` `${r.label} ${r.have} of ${r.need}` ``.

**Fix.** Carry the point it broke: `need: d.required! + availPointsOf(rules[s]).red` (so "25 of 26"), or keep Required
and add the point only when it is not 0 ("25 of 24 + 2"). The first matches what "red" means; the drawing only showed
the default. Pin in `redcount.test.tsx` with a non-zero red point.

---

## F4 — LOW — two old-look places the host's own fix list named, still drawn the old way (D1175)

**Failure.** (a) The Legend's "The corner" rows still draw the old amber-outlined `.leg-sw appr` "LL" swatch, not the
grid's own box, under a Legend whose every other swatch is the grid's box. (b) The day's list (a day holding several
records) still edges an approved line green and a refused one red (`bidpicker.css .dl-line.appr` /`.ref`), beside a
grid where approved LL is filled amber and refused is grey struck. Both were items (2) and (8) of the host's "fix
BEFORE the walk" list (HANDOFF) and are unchanged.

**Cause.** `ui/Chrome.tsx` ~531–533 (`leg-sw appr legmk`); `ui/bidpicker.css` ~1231–1232 with `DayList.tsx` `cls`
`'appr'` / `'ref'`.

**Fix.** (a) Draw each corner row as `<span className="leg-box"><span className="c k-ll s-a whole">LL</span><i className="mk more">+1</i></span>`
(the grid's own `.mk` classes, as the cell draws them); (b) edge the day's-list line by kind and fill from
`kindOf` / `entryFill` (or, if the day panel's look is M3's, write that as a deliberate deferral in the evidence sheet
so it is not lost).

---

## F5 — LOW — the bubble's before/after reads walk the whole drawn year on every sheet open and close

**Failure.** On a desktop with the year drawn, tapping a cell to open the bid window and closing it each run
`flaggedNow()`: every Manning verdict of the period plus `availVerdictAt` for every drawn date × 2 seats — 730 calls,
each defaulting `a = flyAnswer(iso)` (one `planFor` each, no month cache) — inside an effect on the tap-to-open path.
Measured open/tap stayed inside M1's spread, so this is a cost, not yet a visible fault.

**Cause.** `ui/Matrix.tsx flaggedNow` (~1290) calls `availVerdictAt(d, seat)` without the day's answer.

**Fix.** Read the answers a month at a time, as `manningRedDays` does (one `flyMonth` per month, passed as
`availVerdictAt(d, seat, monthAnswers[d])`), or limit the Available half to the dates the open window can change (the
sheet's own date or range ± nothing). Same result, a fraction of the work.

---

## F6 — LOW — the Manning fold does not follow a change of width after the page opens (D1258)

**Failure.** Open the Leave War in a desktop window 1200 wide (Manning open, as ruled), narrow the window below 700 (the
app's "phone"), or turn a phone from landscape (>700, "desktop") to portrait: the rows stay as they opened, and a tap
on Manning there is remembered only if the page was a phone when it read `phoneNow` at that moment. The reverse — a
phone opened folded, then widened — stays folded on what is now the desktop layout. D1258: folded on a phone,
"on a desktop they open as today".

**Cause.** `ui/Matrix.tsx` decides `countsOpen` once in `useState` from `phoneNow`; the only later re-read is the
`[viewerNow]` effect, which returns early `if (!phoneNow)`.

**Fix.** Re-run the same read when the width class changes: `useEffect(() => { if (!phoneNow) { setCountsOpen(true); return } try { const k = manningKey(); setCountsOpen(!!k && localStorage.getItem(k) === 'open') } catch { setCountsOpen(false) } }, [phoneNow])`
(skipping the first run). Rare on a real phone; listed so it is decided, not found later.

---

## Not findings (recorded so they are not re-raised)

- D1227's bubble on a desktop, after a Move / drag, and the phone's Rearrange "Done" in words — parked for him (Q1–Q3).
- An HO on the same half as a half-day leave drawing one box and "+1" — the host's written "leave" (M3).
- The bid windows' arrows ("<LL"), "How many / How much" words and look F buttons — M3 (batch 5), by the plan.
- The zoom pair on the bar — kept until [LW-PHONE-PINCH-ZOOM] (D1228), by the plan.
- Comments still naming `acknowledged` (bids.ts table, store.ts 3307 / 3323, perms.ts 681 / 696, changelines) — no
  writer can mint the state; harmless reads.
