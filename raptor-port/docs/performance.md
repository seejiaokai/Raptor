# Performance — the speed ledger and the guardrails

**Why this file exists.** RAPTOR was made fast on purpose, one measured round at
a time. That work is easy to erode: a later change to layout, interface, design
or a rule can quietly undo an invariant a speed round established, and the app
slides back into lag one innocent commit at a time. This file is the single
place that (1) records every speed improvement and the one rule each one must
never lose, and (2) states the guardrails any new change follows so the fast
structure holds.

**How to use it.** This is an INDEX and a CHARTER, not a fourth copy of the
rules. Each guardrail states the rule crisply and points to where it already
lives and is enforced (`probes/perf-port.cjs`, the e2e specs, `CLAUDE.md`
§Stable decisions, `docs/ui-contracts.md`, the `HANDOFF.md` round entries). When
the rule and the code disagree, the enforced code and its own comment win — fix
this index, don't fork it.

> **Before you change layout, interface, design, or any rule that touches
> rendering: read Part 1.** Then run the change through the checklist at the end
> of Part 1. Part 2 is the record of why each rule exists.

---

# Part 1 — The guardrails

## The one law: measure first, on the built bundle, at throttle

Every speed decision here was made on a fresh measurement, never a remembered
number. The discipline (owner + observations 54–59, `HANDOFF.md`):

- **Measure the built bundle**, not the dev server: `npm run build && npx vite
  preview`, driven in real Chromium.
- **Throttle the CPU.** 4× ≈ the owner's slow office laptop ("SIS"); 8× is the
  stress floor. A change that helps only at 1× has not helped the machine that
  matters.
- **Paired A/B runs.** A single reading is noise — nine reads of one unchanged
  commit spread 1.08×–1.23×. Compare before/after, several trials.
- **Time and attribute in SEPARATE runs.** Instrumentation that explains a cost
  changes it: the CPU profiler's fine sampling, the CDP `LayerTree` domain
  (inflates paint ~4×), and the `invalidationTracking`/`blink.invalidation`
  trace categories (inflate style 4–8×, emit nothing useful in this Chromium)
  all distort the number. Quote durations only from a plain
  `devtools.timeline` run; use the attributing run only to find *which*
  function, then confirm by an isolated single-toggle experiment. (obs 54)
- **Phase-split before choosing a fix.** Break the interaction into engine vs
  parse vs style-recalc vs layout vs paint vs composite, as a table. The
  scary-looking half (the one that could be *wrong*) and the expensive half are
  rarely the same half — this is what keeps a fix on the redraw side and leaves
  the rules engine untouched (parity 728/0). (obs 55, 57)
- **After-measure every interaction, not the headline.** Optimisation relocates
  cost as often as it removes it (a faster first-open that made month-jumps
  slower). Run a fixed list — open, tap, close, jump, return, scroll, drag,
  drop — before and after, and explain every row that did not move. (obs 56)
- **Attribute by experiment, not by stack frame** — minified/bundled stacks map
  to the wrong source lines. Toggle one thing, re-measure.

## The perf gate — the enforced budget

`npm run perf` (→ `node probes/perf-port.cjs`) boots the reference and the port
side by side at **4× CPU on a 390 px phone viewport** and asserts **four
things** (since 10 Aug 26):

1. **Board DOM ceiling — `#sbBoard` ≤ 1150 nodes.**
2. **Edit-week DOM ceiling — `#eWeek` ≤ 5450 nodes.**
   Both literals live in `DOM_CEILING` at `probes/perf-port.cjs` (~line 307).
   Node counts are the machine-independent half of the budget — the same integer
   everywhere — so they are checked against a recorded number.
3. **Check B — a day-1 edit rewrites ONLY day 1** (and the one day its crew-rest
   breach traces to; that is the single named exemption).
4. **Check D — the week keeps its scroll across an edit** (no jump back to
   Monday).

Three per-node *timing* comparisons are still measured and printed but **no
longer fail the run** — they caught nothing over the repo's life and went red on
unchanged code (times swing ~3× on the VM). Read them as a prompt; do not re-add
them as assertions and do not "fix" a wandering one by widening it.

**Complying with the gate:**
- A change that **adds DOM or changes a measured size** re-measures the ceiling
  and **raises it as a deliberate, argued edit in the SAME PR**, with the reading
  and reason in the `perf-port.cjs` comment. Never trim a real surface to fit an
  old ceiling; never pre-emptively raise one. A 2-node move that stays under is
  data, not a reason to re-cut.
- Geometry/paint correctness is a **separate** gate: `e2e/geometry.spec.ts` (a CI
  gate). jsdom reports every rect as 0×0, so `npm test` proves *which class* was
  emitted, nothing about what was *painted*. Any measured-size or geometry change
  adds/adjusts a geometry check in the same PR, **checking both desktop and phone
  — they are different CSS code paths.**
- The **Leave War year grid (~28k nodes) is OUTSIDE the perf gate** — it has its
  own e2e DOM band (raised to 29000, measured-first).

## The invariants — do not regress these

Grouped by area. Each is the short rule; the source has the full story.

### A. Rendering — the density surfaces
- **React owns chrome, strings own density.** Week, board and palette are built
  by verbatim HTML-string builders and swapped by innerHTML string-diff.
  **Do not convert the dense surfaces to per-cell React components** — that blows
  the phone per-node reconciliation budget and loses scroll/caret. (CLAUDE.md
  §Architecture rules)
- **Only the page on screen re-renders.** CURPAGE gates the week effects; Shell
  chrome is memoized; no `validate()` during render. (ui-contracts.md §Rendering)
- **One `validate()` per mutation.** The drop's epilogue (`afterSchedMutate`)
  is the pass; anything that wants a post-write answer (barDrop, the drop
  delta, placeArmed's reason) reads AFTER it, never revalidates first.
  Pinned `ui/dropvalidate.test.tsx`. (ledger 21)
- **An edit on one day must not disturb the other days** — per-day string diff
  (gate check B). If you add a new cross-day trace, extend B's named exemption
  *precisely*; never loosen it to "some other days may change." Two named
  exemptions today: the day the edited day's crew rest traces to (6 Aug 26),
  and every day carrying the EDITED MAN's run trace (5 Sep 26 — a seat filled
  on one day can join a run, and each earlier day of it then points at the
  day it breaks).
- **A changed day rewrites only its changed BLOCKS** (`ui/dayswap.ts`). Diff each
  block's *canonical* markup (a freshly parsed node, never the live decorated
  one); any shape mismatch falls back to whole-node replace. Do not diff by live
  `outerHTML`; do not match blocks by index across a count mismatch.
- **DOM output stays byte-identical** across every memoization/windowing
  refactor — that is what keeps reference parity 728/0 and lets jsdom draw the
  whole thing.
- **Never repaint under the caret** — the `editingText()` guard + deferred
  txtCommit.
- **Post-render decoration is hung AFTER the diff, never baked into the builder
  string** — selection/search/warning classes, the armed ring, eligibility
  rings (outline-only: no nodes, no layout), the ~6 s fresh-add box. A new
  decoration adds a paint function in `highlights.ts`, never a class in the
  markup. (feature-impact.md)

### B. Scroll and motion
- **Never write `scrollLeft` mid-fling** — it kills native touch momentum. Defer
  any `scrollLeft`-writing reflow to scroll REST.
- **The frozen header/columns follow one-way, off a rAF loop** — never write the
  mirror's position back onto the grid; compositor-driven where supported, rAF
  fallback where not; stop the pump when idle. (obs 9; ui-contracts.md §frozen
  date bar — the reusable recipe)
- **Day-column headers are `position:static`, NOT sticky** — a blanket sticky on
  ~365 headers made the scroll engine re-evaluate all of them every frame
  (median frame ~283 ms → ~17 ms at 6× when made static). Do not restore sticky.
- **B54 scroll-hold** — the week/palette/wave-offsets keep their scroll through
  any edit (gate check D). Any new whole-week/whole-day writer preserves scroll
  and consumes carry state once.
- **Single-writer during a glide** — while a `scroll-behavior:smooth` arrow glide
  is in flight, the proxy scrollbar and any repaint are pure followers; the glide
  owns the week's scrollLeft. (ui-contracts.md §desktop arrow glide)
- **A repeatedly-tapped control must not move under the user** — reserve the
  space or anchor growth away from the control (e.g. RangePicker pads to a
  constant six rows).

### C. Style and layout cost
- **Never toggle an inherited CSS property on `body`/root as an interaction
  marker.** `body.tdrag{touch-action;user-select}` re-styled ~8,952 elements per
  arm/drop for zero real effect. Body-level state classes carry NO declarations
  — they are JS markers only. (guard `ui/css-invalidation.test.ts`)
- **Never write a CSS custom property on an ancestor of the grid from JS** — the
  browser re-styles every element under it (~7,000 here, ~0.4–0.8 s on the slow
  laptop). Placeholder widths are inline on the cells; `--lwx-max` lives on the
  frozen bar's own box, not `.mx-outer`.
- **Memoise on the store `version`, never on a mutable domain object** — store
  writes mutate in place, so the version is the one signal that never lies.
- **Give a frequently-single-changed grid its per-row paint layers** —
  `.mx tbody tr { position: relative }`: a single-cell change repaints one row
  (~8 ms) instead of the whole grid (~230 ms). Keep it.

### D. Drag and drop
- **The ghost rides its own transform layer** — `will-change:transform`, left/top
  pinned at 0, moved only by `translate()`. Never return it to left/top (that
  relayouts and repaints the whole page every move).
- **Hover highlights off during a drag** (`body:not(.tdrag)`) — a hover flip
  under the ghost repaints the page. Don't re-enable them under a drag.
- **On pointer-up, read before you write** — hit-test under the point (ghost
  still up, excluded from the stack) and measure the target FIRST, then take the
  ghost down and clear the body markers. Interleaving reads and writes forces an
  extra layout. (obs 59)
- **Nothing on the page is natively `draggable`** — every drag rides the pointer
  machine in `drag.ts`; `body.dnd` is added one tick after dragstart, never
  synchronously.
- **The hover reason is asked on TARGET CHANGE, never per move** (`drag.ts
  hoverWhy`, 5 Sep 26), and printed as a child of the ghost so it rides the
  ghost's one transform — no second moving layer. slotBar's cross-day probe
  (`restIfPlaced`) clones one leg and re-runs the crew-rest body for one man;
  keep it that shape — never a buildDay or a validate() per hover or per ring.

- **No `filter` on a palette puck, no `opacity` on a preview day, and the
  roster aside stacks above the week's z-indexed pucks** (`z-index:5`) — the
  three rules that hold the desktop edit week at ~105 compositor layers instead
  of 261 (5 Sep 26, ledger 22). A filtered element and a translucent group can
  never share a layer with what they overlap, and everything painted above a
  sticky aside is assumed to overlap its whole scroll range. Pinned
  `ui/layers.test.ts`.
- **Every hover boundary crossed on the week repaints and re-layerises the page
  (~17 ms at 4×)** — `.form:hover`'s tint and the seat hover outline. A new
  hover affordance on the dense surfaces is a per-crossing cost; measure it.

### E. Leave War (the heavy grid — ~28k nodes)
- **Kept alive between visits, not unmounted** — leaving hides it with
  `content-visibility:hidden` (re-shows in 1–2 ms vs a 411–863 ms relayout from
  display:none). Only Leave War gets this.
- **Memo firewall** (`LeaveWarPage.tsx LwBody`, memo, no props) — a Raptor notify
  must not re-walk the hidden 28k-node tree. Don't hand `LwBody` props and don't
  render Raptor module state inside it; every fact crosses the seam through the
  LW store's own notify.
- **Draw a WINDOW of whole months over year-wide PLACEHOLDER cells** — one
  draw-toward-a-target engine (`colwindow.ts stepToward`): phone rolls a small
  window ahead of the finger and prunes only at REST; desktop-on-screen fills the
  whole year; desktop-off-screen caps at `HIDDEN_MONTHS` and draws only while the
  user is idle (`state/idle.ts msSinceInput > 2s`). Undrawn months are one
  placeholder cell per side, real month width, so the scroller is year-wide from
  first paint.
- **The on-screen signal is a listener set (`leavewar/state/screen.ts`), NOT the
  store** — a store write would repaint the whole grid.
- **Shrink on leave, rebuild on return** (desktop) — don't keep the full year
  parked; reveal a small grid (~0.4 s vs ~1.9 s restyle).
- **Pre-warm is idle-gated** — mounting the tab hidden after login must never
  slow login-to-week.
- **Every row (header included) carries the SAME cell structure** — WebKit
  reconciles rows of differing cell counts differently from Blink; a mismatch was
  the iPhone column-misalignment bug. This container ships no WebKit, so the
  owner's iPhone is the gate.
- **Day cells stay one memoised `PersonMonth` per month** — inline rendering
  re-reconciled all ~21,000 cells on every month draw.

## The device gate
This container runs Blink (Chromium) only — **no WebKit binary**. Anything whose
correctness depends on WebKit's table/sticky/contenteditable behaviour (grid
column reconciliation, contenteditable editing, touch fling) is **verified on the
owner's iPhone against the Vercel preview**, not here. A green suite here is
necessary, not sufficient, for those.

## The change-checklist
Run a layout / interface / design / rendering-touching change through this before
calling it done:

1. **Did I measure?** Built bundle, 4× (and 8× if it's a heavy path), paired
   runs, phase-split table. No number quoted from memory.
2. **Did I check every interaction, not just the one I improved?** Open, tap,
   close, jump, return, scroll, drag, drop — any row that got slower is called
   out and explained.
3. **Does it grow the DOM or change a measured size?** Re-measure the ceiling and
   raise it deliberately in this PR; add/adjust the `e2e/geometry.spec.ts` check;
   check desktop AND phone.
4. **Does it touch any invariant in the list above?** If so, it must preserve it
   — or, if the invariant is genuinely being revised, say so explicitly, with the
   measurement that justifies the revision, and update the source + this index.
5. **Did I keep the DOM byte-identical** where a builder/diff/memo path expects
   it (parity 728/0, jsdom whole-render)?
6. **Is it a WebKit-sensitive change?** Then it's owner-iPhone-gated before
   "done", and the revert is one commit.
7. **Did I record any measured-and-rejected idea** as a dead end (below + a
   comment at the code site), so the next session doesn't re-chase it?

## Dead ends — measured worse, DO NOT retry without new measurement
- **Table-column virtualisation of the Leave War roster** — passed every gate,
  dx=0 in Chromium, then misaligned ~1 column on the owner's iPhone (WebKit
  reconciles rows of differing cell counts differently, and there's no WebKit
  here to catch it). Reverted. The 5 Sep placeholder design (every row identical
  cell structure) is the sanctioned alternative shape — still iPhone-gated.
- **Drag-ghost variants** — `translateZ(0)`/translate3d/`contain:strict`/
  `backface-visibility`/no-decorations/non-hit-testable ghost/`position:absolute`
  all equal or worse; toggling ghost `pointer-events` around one hit-test 22 ms
  worse. A "translateZ unlocked the fast path" claim was a broken-experiment
  artefact — retracted. The ~230-layer residual was cut to 105 on 5 Sep by
  three local rules, not a page-wide change (ledger 22); the drop itself turned
  out JS-bound, not paint-bound.
- **More layers, not fewer** (5 Sep, layer census by switching one suspect off
  in the live page): `will-change:transform` on every `.day`, on the week
  strip, or on the roster — 261 → 537 (every descendant overlapping a
  composited sibling then needs a layer of its own); `position:static` on the
  roster aside — 442. **No change at all:** `backdrop-filter` off the week-nav
  and hscroll (−0), the top bar static (−2), the roster's inner scroller
  `overflow:visible`, `contain:paint` / `isolation:isolate` on the preview
  or the roster, `overflow:visible` on the preview or the days, `.rpuck`
  static. The three that worked are ledger 22. Per-move cost with the pointer
  unable to reach the week: layerize 9 ms/20 moves vs 200 — the hover
  boundary, not the layer count, is what plain mouse movement pays for.
- **Paint-isolation on the edit week** — `.day`/`.dsec`/`.day>*` as
  `position:relative`, `contain:paint`, `contain:layout paint`,
  `isolation:isolate`, `will-change:transform`, week-as-own-layer — all equal or
  worse (off-screen days already culled; the repaint is the two visible days).
- **`refreshHighlights` "quiet path"** (one selector list + attribute query vs
  the ~660-puck loop) — 2× slower (a seven-selector list matches all ~17k
  elements). The loop stays.
- **Month-draw**: flat backgrounds vs hatch gradients (paint unchanged);
  `will-change:transform` on the scroller/table (unchanged); a CSSOM rule for
  placeholder width (61 ms vs 5 ms inline); batching the measure chain (already
  2 objects).
- **Parking primitives** — `visibility`/`pointer-events`/`inert` each cost a
  ~6.4k-element recalc to flip (they inherit); `content-visibility:hidden` skips
  the warm's layout so the first show pays it anyway. `visibility:hidden` kept
  for correct semantics; `position:absolute` rejected (wrong width).
- **"Batch the geometry reads"** — dropped; the trace showed layout was never the
  cost (~90 ms).
- **A per-day HTML cache for the seven day strings** — not done: what invalidates
  a day is global state, so a cache is a correctness risk for a modest gain.
- **An external Google-Fonts `<link>`** — never reintroduce; unreachable behind
  the agent proxy, hangs the page load event, times out e2e login.

---

# Part 2 — The speed ledger

Every shipped speed round, newest last. Each: what it does (plain) · the
mechanism · the invariant it must not lose · measured result · files. Full story
is in the dated `HANDOFF.md` entry.

**The measurement stance for all of them:** built bundle, real Chromium, CPU
throttled 4×/8×, devtools-timeline for the style/layout/paint split, CPU profile
through sourcemaps for the JS split, paired A/B runs.

1. **Narrow board-notify lane.** A board day-swipe doesn't stall the seven-day
   week. · `store.ts` `notifyBoard()`/`subscribeBoard()` lane, separate from the
   global `notify()`. · *Invariant:* day-only board nav never triggers the global
   notify. · `state/store.ts`.

2. **Month-windowed roster** (18 Aug). Rows whose person isn't in the visible
   months disappear. · `Matrix` hides a row missing every on-screen month; fires
   only on a visible-row-set signature change, month granularity. · *Invariant:*
   row-set changes fire on signature change only, never mid-month; jsdom shows
   all. · `Matrix.tsx` (`anchorRef` restores the sideways position a removed
   row's columns would otherwise yank).

3. **Row-window deferred to scroll rest** (19 Aug). A fling keeps its momentum. ·
   Strip readout runs live; the roster reflow (which writes scrollLeft) is
   debounced to rest. · *Invariant:* anything that writes scrollLeft runs at rest,
   never mid-fling. · `Matrix.tsx`, `leavewar.spec.ts`.

4. **rAF pump for the frozen-header mirror** (19 Aug). The header tracks smoothly
   instead of chasing. · A rAF loop re-syncs the mirror every frame while
   scrolling, stops ~200 ms after rest. · *Invariant:* mirror tracks on rAF, not
   the scroll event; stops when idle. · `Matrix.tsx`. (obs 9)

5. **Month readout is a ref, not React state** (20 Aug). Scrolling stops
   re-rendering the whole ~25k-node grid to move one highlight. · Readout is a
   ref painted onto the buttons by hand; strip geometry cached in content space. ·
   *Invariant:* a per-scroll display update never goes through React state on a
   whole-grid component. · Blocking 1573→680 ms, worst frame 129→69 ms.
   · `Matrix.tsx`.

6. **Frozen columns drawn once in an out-of-scroller overlay** (20 Aug). Sideways
   drag stops re-solving ~160 sticky pins per frame. · Callsign+counter columns
   drawn a second time in a `.mxband` overlay parked outside the scroller; real
   columns unstuck. · *Invariant:* frozen columns painted once out of the
   scroller; nothing sticky re-solves per frame; `bandTop` never set on scroll. ·
   `Matrix.tsx`, `matrix.css`, `frozencols.test.tsx`.

7. **Overlay rows copy measured heights** (20 Aug). Frozen names stay aligned with
   their balances down the whole roster. · `syncBandHeights` copies each real
   row's measured height onto its overlay twin. · *Invariant:* overlay heights are
   measured off real rows, never assumed uniform; every band key resolves to one
   real row. *(Gate lesson: walk the whole list for a cumulative error, don't
   sample one.)*

8. **Header-mirror follows one-way** (20 Aug). The frozen header stops halting a
   fling. · Removed the mirror→grid write-back; mirror only follows; keep it
   `overflow-x:auto` (hidden makes WebKit clamp scrollLeft to 0). · *Invariant:*
   the mirror follows one-way; never write its position back onto the grid. ·
   `Matrix.tsx`, `matrix.css`.

9. **Date-label parsing memoised** (25 Aug). Switching weeks with a year of inputs
   stops being slow. · Memoised the parse; scans stay O(N) deliberately. ·
   *Invariant:* cache only what data changes can never affect. · engine-rules.md.

10. **Leave War keep-alive** (1 Sep). Returning to the tab is near-instant. · Kept
    mounted once visited, hidden with `content-visibility:hidden`; `active` prop +
    `LwBody` memo firewall stops every Raptor notify re-walking the hidden 28k
    tree. · *Invariant:* only the on-screen page walks on a notify; a hidden heavy
    page is content-visibility, not display:none, not unmounted. · return ~0.1–0.2 s
    vs ~1 s. · `Shell.tsx`, `scheduler.css`, `lwkeepalive.test.tsx`.

11. **The Slow-Computer Cut** (3 Sep, five changes, one PR). Edit opens and drops
    land faster; smaller first download. · (a) body drag-marker classes carry no
    declarations; (b) edit week + palette warm once in idle after admin login;
    (c) WeekCal stops re-measuring seven day boxes per tick with the calendar
    closed; (d) Leave War is a lazy chunk (~38 KB gz JS + ~11 KB gz CSS off first
    load); (e) edit page parked in-flow `visibility:hidden`, not display:none, so
    the warm's layout is reused. · *Invariants:* no inherited property toggled on
    body as a marker; edit page parked in-flow, never display:none/absolute. ·
    Open Edit 1.95→1.37 s @4×; one drop 0.94→0.64 s @4× (style recalc
    325→76 ms). · `scheduler.css`, `EditWeek.tsx`, `css-invalidation.test.ts`,
    `editwarm.test.tsx`, `Shell.tsx`.

12. **Leave War Speed Phase 1** (3 Sep, display-side memoization). Opening/tapping
    stops rebuilding all 18k cells repeatedly. · Header lookups scoped to the
    header tbody; memoise `evKind`/`lockedCols`/`figureCtx`/quals on the store
    *version*; roster row is a memoised `PersonRow` (callbacks through one ref);
    `toUTC`/`heldQuals` caches. · *Invariant:* memoise on the store version, never
    a mutable domain object; `PersonRow` stays memoised, no fresh function prop
    reaches it; DOM byte-identical. · `Matrix.tsx`, `period.ts`, `availability.ts`.

13. **Leave War Speed Phase 2 — the Column Window** (3 Sep). The grid draws a
    window of months, not the whole 365-column year. · `colwindow.ts` (pure) +
    Matrix; whole months at real widths; grows at rest toward a runway, prunes
    with hysteresis; left side grows only at the left bound on a coarse pointer
    (a left column change writes scrollLeft, fatal to a fling). · *Invariant:* only
    drawn months exist; every consumer reads `drawnDays`/`drawnDates`/
    `drawnMonths`; jsdom draws the whole year. · First open 10.5→3.8 s @4×; come
    back to tab 4.0→0.4 s. · `ui/colwindow.ts`, `Matrix.tsx`, `colwindow.test.ts`.

14. **Desktop background fill + year-wide scrubber** (4 Sep). Scrolling far months
    is smooth; the scrollbar is a stable year-proportional scrubber. · Scrubber
    spacer is the whole war at an estimated width; desktop fills the whole year one
    month per idle beat, pausing under active scroll, grow-only. · *Invariant:*
    scrubber is the whole year at a stable estimate; desktop fill is grow-only and
    pauses under scroll; phone keeps the windowed runway. · 0/24 rests freeze
    >100 ms. · `colwindow.ts`, `Matrix.tsx`.

15. **Shrink-on-leave + rolling prefetch + pre-warm** (5 Sep, one `stepToward`
    engine). Coming back is fast; the phone flick stops sticking; desktop first
    open is instant. · Leaving shrinks the desktop grid to a few months (reveal
    re-styles a small grid, not a parked full year); on-screen signal is a listener
    set, not the store; idle-gated pre-warm after login; phone rolls a window ahead
    of the finger. · *Invariant:* don't keep the year parked — shrink it; on-screen
    signal is a listener set, never the store; pre-warm is idle-gated. · come-back
    4.0→0.4 s @4×; first open pre-warmed 2.8→0.5 s. · `leavewar/state/screen.ts`,
    `state/idle.ts`, `colwindow.ts`, `Shell.tsx`.

16. **Placeholders + draw-while-moving** (5 Sep). The scroller is year-wide from
    first paint; months draw in place while scroll still moves. · Undrawn months
    are one placeholder cell per side, real width; the fill draws in motion (right
    always; left only over an already-measured width; estimated-width left grow and
    prunes wait for rest). · *Invariant:* every row (header included) has identical
    cell structure (WebKit); never draw an estimated-width month left of view
    mid-scroll. · `colwindow.ts`.

17. **The cost of drawing one month, halved** (6 Sep). Each drawn month costs about
    half; fill and scroll are smoother. · (a) placeholder widths moved from a
    custom property on `.mx-outer` (any write there re-styled ~7,000 elements) to
    inline styles on the cells; (b) day cells memoised per-month (`PersonMonth`);
    (c) `.mx tbody tr { position: relative }` gives each row its own paint layer. ·
    *Invariants:* no custom-property write on a grid ancestor; per-month cell
    memo; per-row paint layer. · late-year month 1.9→~0.95 s @4×; year fill
    ~18→~10 s. · `Matrix.tsx`, `matrix.css`.

18. **Puck drag: ghost on its own transform layer** (6 Sep). Dragging a puck is
    smoother — the ghost no longer relayouts/repaints the page each move. · Ghost
    carries `will-change:transform`, left/top pinned at 0, moved by one
    `translate()`; hover rules scoped `body:not(.tdrag)`. · *Invariant:* the ghost
    rides its own transform layer; hover suppressed during a drag. · ~168→~120 ms
    /move @4×. *Honest floor:* the page's ~230 compositor layers; cutting them is
    the only further lever (proposed not done). · `drag.ts`, `scheduler.css`,
    `drag.test.tsx`.

19. **The Drop: a changed day rewrites only its changed blocks** (6 Sep). Dropping
    a puck lands faster. · `ui/dayswap.ts` — per-block canonical-markup diff inside
    the day, whole-node fallback on any shape mismatch; pointer-up hit-tests with
    the ghost still up, removes it after, leaves body markers to `tdClear()`. ·
    *Invariant:* a changed day rewrites only its changed blocks; read (hit-test)
    before write (teardown). · drop task ~600→~400–490 ms @4×; the rules engine
    (~45 ms) left byte-for-byte unchanged, parity 728/0. · `ui/dayswap.ts`,
    `EditWeek.tsx`, `ViewWeek.tsx`, `drag.ts`, `dayswap.test.ts`.
    *(Captured as task-observer obs 57–59.)*

21. **One validate() per drop; the drop delta** (5 Sep). A drop no longer runs
    the rules engine twice (three times for a swap): `barDrop` used to
    revalidate before asking slotBar, on top of the pass in `afterSchedMutate`.
    It now asks AFTER that pass, and the drop's voice is the DELTA of WARN
    before vs after (`state/dropflag.ts`) — the validator's own words, for
    every rule, on whichever day the breach landed. · *Invariant:* exactly one
    `validate()` per drop (pinned `ui/dropvalidate.test.tsx`); the delta is a
    list diff, never a second copy of a rule; the pulse is opacity-only. ·
    Derived, not re-traced: the 6 Sep drop trace put the two passes at ~45 ms
    @4× together, so one pass is ~22 ms off the drop task — re-trace before
    quoting a number. · `drag.ts`, `state/view.ts`, `state/dropflag.ts`,
    `highlights.ts`, `scheduler.css`, `toast.ts`.

20. **(Infra) Merge-to-live parallelised** (3 Sep). CI-to-live ~17 min → the
    slowest gate. · `deploy.yml` runs the four gates as six parallel jobs; the
    Leave War unit leg sharded 2×. No app code. · 17m26s → 8m28s. · `deploy.yml`,
    `playwright.config.ts`.

22. **Fewer compositor layers on the desktop edit week** (5 Sep). Dragging a
    puck on the desktop is smoother: the page re-layerises on every move, and
    it now has 105 layers to decide instead of 261 (the phone's 9 untouched;
    21 is the drop-delta round, PR #359). · Three CSS rules, each found by
    switching one suspect off in the live page and re-counting (a `LayerTree`
    census — an attributing run, never timed): the palette's faded pucks
    desaturate with a translucent grey in `background-blend-mode:saturation`
    instead of `filter:saturate()` — a filtered element can never be squashed
    into a shared layer (59 layers); the next-week preview is dimmed by a
    page-background `::after` veil instead of `opacity:.5` — a translucent
    group cannot share a layer either (47); the roster aside gets `z-index:5`
    so the week's z-indexed pucks paint below it instead of being assumed to
    overlap its sticky scroll range (44). · *Invariant:* no `filter` on a
    palette puck, no `opacity` on a preview day, the aside above the strip's
    z-indexed pucks (`ui/layers.test.ts`). · Armed drag at 4×, 7 paired
    trials, category sums from a plain `devtools.timeline` run (a paired
    index, not wall-clock): drag per-move 68.4 → 51.9 ms median (Layerize
    30.5 → 15.8 ms a move; raw runs 58–81 vs 46–55); the drop 836 → 820 ms —
    unchanged, it is JS-bound (~210 ms of handler inside the pointer-up, then
    ~40 style, ~45 layout, ~66 paint, ~72 raster, ~56 layerize); plain hover
    per-move 17.3 → 17.7 — unchanged, that is the hover-boundary cost
    (bisected by nesting depth: cheap until the pointer can reach `.form`).
    Visual delta: the faded pucks' letter chips a touch more vivid (the filter
    washed them too); the preview ≤0.1% of pixels. · `scheduler.css` (three
    commented rules), `ui/layers.test.ts`.

---

# Where the rules live (pointer map)

- **The enforced budget:** `probes/perf-port.cjs` (`DOM_CEILING`, checks B & D) ·
  `e2e/geometry.spec.ts` (paint/geometry) · the Leave War e2e DOM band.
- **The stable decisions:** `raptor-port/CLAUDE.md` §Stable decisions (board
  ceiling 1150) and the dated end bullets (window engine, ghost/compositor,
  per-block swap).
- **The rendering contracts:** `raptor-port/docs/ui-contracts.md` §Rendering,
  §Drag, §The frozen date bar (the reusable recipe), §The Leave War tab is kept
  alive, §The Leave War grid draws a window of months.
- **The change process:** `raptor-port/docs/feature-impact.md` §checklist
  "Layout" (re-measure + geometry check, both platforms).
- **The measurement methodology:** `.claude/skill-observations/log.md`
  observations 9, 41, 54–59; the `HANDOFF.md` round entries.
