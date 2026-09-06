# Leave War — bulk balance entry from the figures (design, 6 Sep 26)

Owner-approved in the 6 Sep 26 session, section by section, after two rounds of mockups drawn on the real bundle. Companion to `2026-09-06-leavewar-figures-drawer-design.md` (the drawer this builds on).

## Context

The figures drawer shows every pool's balance for everyone. The admin now wants to CHANGE balances from the same place: drag down a run of people in one pool, key one amount, and have it added to (or subtracted from) each of their balances — "7 shows, I type 3, it reads 10; I type −3, it reads 4" — with OIL also taking the date, reason and "given by" the OIL tracker asks for.

Settled with the owner: **a reason is asked only for OIL** (the other pools take just the number); **one pool per drag** (a run down one column, never a block); **hold-and-drag on the phone, plain drag on a computer** (no Shift — the same gesture the days already use); **`2` and `+2` both add, only `-2` subtracts; halves only**; **the bar is a docked panel at the foot of the screen with a solid blue ring and glow** ("look A" of the mockups). Session-only persistence is the app as it stands and is out of scope.

What already exists and decides the shape: the store keeps a dated, reasoned, attributed **ledger entry** (`LedgerEntry`) for EVERY counter and `balanceOf` already adds `grantedTo(ledger, …)` into every pool's balance — only OIL writes it today (`grantOil`: bulk, one undo step, admin-gated; a negative amount is a correction). The grid's drag-select core (`ui/select.ts wireGesture`) is a generic pointer machine already generalised once to a second surface (the OIL tracker's `wireRowSelect`), and the tracker's docked `CreditForm` is the proven "selection → bar → one batch write" shape.

## The design

### 1. Selecting

- **Admin only.** The gesture's `enabled()` is `role === 'admin' && !arranging` (mirrors the grid's guard); a member's boxes behave exactly as today (tap = breakdown). No inert controls.
- **Where it works:** the closed single column (the real `td.bal.figbox` cells and the phone band's copy of them) and every column of the open drawer. One gesture, bound to `.mx-outer` (the common parent of `.mx-wrap`, `.mxband` and `.mxdrawer`), so all three copies of a box are reached by one listener; the three copies get the same addressing (`data-person` + `data-fig`).
- **Feel — the core's constants unchanged:** mouse arms at a 4px move (`MOUSE_SLOP`); a finger arms after a 180 ms hold (`HOLD`) or a slow drag past 140 ms (`SLOWARM`); a slide past 26 px before that cedes to the native scroll (`GIVEUP`); pointer capture in `arm()`, never on down; the click that follows a committed drag is swallowed. The page auto-scrolls vertically at the edges (the core's `vscroll`); no horizontal auto-scroll (`.mx-outer` does not scroll).
- **One pool per drag.** The anchor's `data-fig` fixes the pool; the focus is the person under the pointer (`elementFromPoint().closest('.figbox[data-person]')`); the run is the roster-order slice between anchor and focus persons, people only. Crossing a group heading / CAT sub-heading / event row holds the last focus (the core's `lastFocus` pattern).
- **What refuses to start:** a total (`lvetot`, `medtot` — no `Figure.counter`), a title/header cell (`th.fig`, `th.bal`, the corner switch), a hidden figure (not drawn anyway). One predicate — `selectableFigure(f) = !!f.counter` — read from the catalogue, never a literal list.
- **Highlight:** the `.selcell` recipe (accent wash + inset ring; brighter while `.figselecting` is on the outer) applied to the box via a **data attribute** (`data-figsel`) written by the gesture during the drag — a class would be wiped by the box's own React re-render (its `className` is rebuilt from `wide`/`flash` on every store change, i.e. exactly at Save). On release the selection becomes React state (`figSel: { fig, ids }`) and the boxes render `data-figsel` themselves; the gesture's `reset` clears its own marks.
- **Persisting selection:** a second drag in the same pool adds to it; a drag in another pool replaces it; a tap anywhere outside the bar and the boxes clears it (capture-phase `pointerdown` with two escapes — the bar and `.figbox`, the tracker's pattern); so do Escape, Undo/Redo (`histEpoch`), a stage or war change, and putting the drawer away / opening it.
- **The swipe stands down.** The closed column's swipe-to-cycle (`onTouchEnd` on `.mx-wrap`, 40 px) ignores a touch during which the figure gesture ARMED (a ref set in `arm()`, cleared on the next `touchstart`). A quick flick still cycles (it never arms); a slow hold-and-drag selects and does not cycle.
- **Phone band rule:** with the figures open, only the band's NAME cells take the pointer (`.mx-outer.mx-figures .mxband { pointer-events: none } … td.who { pointer-events: auto }`), so a press on the drawer's first column is answered by the drawer even after the grid has scrolled sideways (the band is z-index 6 over the drawer's 5).
- **Core fixes (benefit the day grid too):** (a) the click swallow is armed on ANY armed teardown, `pointercancel` included — an iOS system gesture interrupting a hold no longer lets the trailing click open a breakdown; (b) `GestureSpec` gains optional `nodes(id): Element[]` (paint every copy of a box) and `mark(el, on)` (attribute instead of class) — defaults keep today's callers byte-identical.

### 2. The bar

- Appears the moment a drag commits (and stays while the selection lives): a docked panel `position: fixed; left: 12px; bottom: 14px; width: min(880px, 100vw − 24px); z-index: 60` (the move banner's slot), raised background `#1d232b`, `1.5px solid var(--accent)` ring, glow `0 0 0 4px rgba(59,198,232,.16), 0 18px 44px rgba(0,0,0,.7)`, radius 14, slides up ~160 ms on entry (none under `prefers-reduced-motion`). The **move-mode banner (`.mv-banner`) takes the same recipe** so the two match — one shared rule.
- **Not a `Sheet`** — a Sheet's touch shield would swallow presses on the very boxes being selected and its popup family dismisses on scroll; the bar has no scrim, does not close on scroll, and re-anchors above the on-screen keyboard (`useKeyboardInset`, exported from Sheet.tsx).
- **Contents, plain pool:** `5 people · +CCL` (count + the figure's title in accent) · amount box (`step 0.5`, autofocus on a computer, Enter saves) · **Save** (right) · **✕**.
- **Contents, OIL:** the tracker's own `CreditForm`, generalised with a `counter` prop: amount · date chip (today, tap to change) · reason · given by (optional) · Save · ✕. One form component serves the tracker and the grid; on a phone it wraps to three lines with Save/✕ on the last.
- **Amount rule (one function, shared by the tracker):** `2` / `+2` add, `-2` subtracts, halves allowed, `0`, blank, non-numbers and quarter-days refused with a one-line message under the bar; a refusal keeps the selection and the draft. **The bar's amount box starts EMPTY** (missing input fails closed — nothing is added by an idle Enter); the tracker keeps its own `1` default (unchanged behaviour), so the generalised form takes the initial amount as a prop.
- Copy is production-grade (no "session-only" notes on screen); the bar carries an `aria-label` naming the pool and count.

### 3. The record and the store rule

- **One writer:** `grantTo(personIds, counter, amount, date, reason, givenBy): string | null` in `state/store.ts`, shaped exactly like `grantOil` (dedupe ids, one entry per person via `ledgerSeq()`, ONE `state = withCurrent(...)`, one `persist()`, one `notify()` → one undo step). `grantOil(ids, …)` becomes `grantTo(ids, 'oil', …)` so the tracker is unchanged.
- **Rules (`ledgerProblem`, counter-aware, the single body):** admin only; every id must exist; `amount` finite, non-zero, a multiple of 0.5 (NEW — tightens the tracker too, owner-approved); `date` `YYYY-MM-DD` required (the bar supplies today); `reason` required for `oil` only (≤ 120), optional (may be blank) for `annual/ccl/fcl/cl/pl` (≤ 120); `givenBy` optional (≤ 40); `approvedBy` stamped from `approverName()`. `el` has no figure and is out of scope.
- **Reads:** nothing changes in `balanceOf` — `grantedTo` already sums the ledger for every counter. The person/breakdown sheet **itemises** each pool's entries under "granted" (`+2 · 6 Sep · by <admin>`, plus the reason when present) the way the tracker lists OIL credits; the "granted" part total is unchanged. **Set** on the person sheet still moves the opening figure; +/− are entries on top of it.
- `readLedger` already validates the shape on load; a blank reason must pass for non-OIL counters (update the reader's rule beside the writer's — one predicate).

### 4. After Save

The bar closes, the selection clears, each changed box flashes once (the existing flash on a `lines.top` change — free confirmation), one Undo reverses the whole batch. The closed column does not switch figures (the drag was made on the shown one).

### 5. Untouched

Bidding, decisions, the day cells' own drag-select, the OIL tracker's behaviour and math (FIFO, expiry, policy), the drawer's layout and the corner switch, the figure picker and hide/show, the manning rows, the month strip, the window engine, the frozen-names mechanics, the top control row, the quick-flick swipe, everything a member sees.

## For the build

**Reuse.** `ui/select.ts` (`wireGesture`, `GestureSpec`, the constants, `lastFocus` pattern, `wireRowSelect` as the worked second caller); `ui/OilTracker.tsx` (`CreditForm`, `DayChip`, the docked `oil-bar` + outside-tap clear); `state/store.ts` (`grantOil`, `ledgerProblem`, `ledgerSeq`, `approverName`, the single-write batch doctrine); `engine/counters.ts` (`FIGURES`, `Figure.counter`, `grantedTo`, `balParts`); `ui/CounterSheet.tsx` (the breakdown/person sheets' parts list, the Set input's validation shape); `ui/Matrix.tsx` (`selCtxRef` live-callback pattern, `histEpoch` clear, the swipe handlers, `drawerRef`/`mxOuterRef`, `figureCtx`); `ui/FigureCell.tsx` (`dataFig`/`dataPerson`); `ui/FiguresDrawer.tsx` (`figClass`, `arranging` stand-down); `matrix.css` (`.selcell`, `.mv-banner`, the band rules); `ui/Sheet.tsx` (`useKeyboardInset`); e2e helpers (`openDrawer`, `putDrawerAway`, `dragSelect`, `swipe`, the CDP touch fling recipe).

**Mechanics to respect (the watch-list — each a build constraint with its pin).**
1. Bind to `.mx-outer`, not `.mx-wrap`/`.mxdrawer` (the drawer is a sibling of the scroller); `hit` = `.figbox[data-person][data-fig]` whose figure is selectable; headers excluded.
2. The core's `touchAction='none'` on `.mx-outer` plus its non-passive `touchmove` is what stops the PAGE scrolling under an armed drag — assert it in a phone e2e.
3. Never paint a class onto `.figbox` — attribute during the drag, React state after release. Pin: a store write during a live selection keeps the highlight.
4. The Save flash re-renders every drawer row — the selection is already React-owned by then.
5. Band above drawer on a phone — the pointer rule above; pin in lw-phone with the grid scrolled.
6. A press while the drawer is `visibility:hidden` (first frame) starts nothing — fine.
7. `enabled()` mirrors `!arranging`; pin (a roster drag never starts a figure selection).
8. Swipe stand-down as designed; pin (a slow hold-drag down the closed column does not cycle; a quick flick still does).
9. Hit by `.figbox` + data attrs, never `.bal` (manning/event blanks, `th.bal`, `th.fig`).
10. All three copies addressed alike; `nodes()` paints every copy.
11. Runs cross headings by `lastFocus`; the pool comes from the anchor.
12. Totals/hidden refuse via `selectableFigure`; the breakdown's `settable` predicate is not reused (it excludes OIL for Set; selection includes OIL).
13. Every write through `grantTo`; the bar never touches `openings`.
14. Not a `Sheet`; the bar's outside-tap clear names its escapes.
15. No scroll/resize dismissal on the bar; it is viewport-docked.
16. Swallow on any armed teardown; pin in `select.test.ts` (pointercancel after arm → the next click is swallowed once).
17. No absolutely-positioned selection overlay — nothing to remeasure.
18. jsdom cannot hit-test: unit tests stub `elementFromPoint`; browser truth lives in e2e; a phone hold is attempted with CDP `Input.dispatchTouchEvent` and, if headless Chromium will not arm it, the live drive + the owner's iPhone carry it and the docs say so.

Also: DOM ceilings unchanged (attributes only; the bar is ~12 nodes; the drawer subtree stays 958); the `sync.ts` passes read no ledger entry for non-OIL counters (verify once); persisted keys unchanged (the ledger already persists); `historySnap` already carries `ledger`.

**Verification.** `npm test` (both projects), `npm run build`, `node reference/tfin.js` 728/0, `npm run test:e2e` (raptor, lw-phone, lw-desktop) with the new tests: drag down the drawer's CCL column → bar → `2` → Save → each balance +2, boxes flashed once, one Undo reverts all; the same on the closed column; `-1.5` subtracts; `0`/`abc`/`1.25` refused and the selection kept; OIL run → full form → the tracker lists the credit; a member's drag does nothing and a tap opens the breakdown; a drag on a total does nothing; a run across a group heading keeps both sides; the bar survives a sideways grid scroll; a tap outside clears; putting the drawer away clears; lw-phone: the hold arms and the page does not scroll under it, the band press with the drawer open and the grid scrolled, the swipe stand-down. `probes:adapted` + `perf` against the preview; the impeccable detector over the touched UI files; a live drive screenshotting the bar on phone and desktop, plain and OIL; then the Vercel link and the owner's iPhone.

**Process.** Owner's call: build on the current session branch, stacked on the drawer — the one open PR accumulates both; nothing merges until he says "merge live". HEAVY path (persisted records + the shared drag engine): this spec → a task plan → subagent-driven development with a review on each task and one whole-branch review at the end.
