# UI contracts

Detail split out of `CLAUDE.md`. Read this before touching rendering,
drag & drop, or inline text editing. These are guarantees to PRESERVE —
several are measured and suite-enforced, not preferences.

## Rendering

- An edit on one day must not visibly disturb the other days (per-day string
  diff in ViewWeek/EditWeek; per-panel diff in SchedBoard).
- The week keeps its scroll through any edit and through an Edit-mode
  toggle; the palette keeps its scroll; wave blocks keep swipe offset.
- Only the page on screen re-renders (CURPAGE gates in the week effects);
  Shell chrome is memoized; no `validate()` during render — mutation paths
  validate. Perf gate: `probes/perf-port.cjs` (port ≤ reference × 1.15 on a
  4×-throttled phone).
- Never repaint under the caret: `editingText()` guard + deferred txtCommit.
- Layout is measured, suite-enforced: puck exactly 74×15px (grids derive
  from `--puck-w`); free text needs `overflow-wrap:anywhere` AND
  `min-width:0`; a hole in a programme row renders NO element; week pan =
  one day box per click; proxy scrollbar maps linearly (HS_EPS echo guard,
  `behavior:'instant'` writes).

## Inline text editing (`ui/textedit.ts`)

Enter commits (everywhere, including sim notes), Escape restores the model
value, drift is healed in place from the model rather than by a rebuild.

Most strings commit through `[data-txt]` → `txtSet` (the funnel). FOUR
fields live outside that grammar and each need their own focusout branch —
all four were missed in the port at some point and silently discarded
edits, so check this list when a field "won't save":
`[data-intimes]` · `[data-bombs]` (stores text) · `[data-area]` ·
`[data-atime]`.

## Amendment marks on screen

`alAttr(key)` emits `data-alc="n"` (published in AL n) or `data-alp="1"`
(pending); pending on a PUBLISHED day also carries `data-aln="n"` — the
`nextAL()` it will go out as. Pucks and the area/time/rmk/in-times cells
get outlines and an ALn tag; every other inline-edited string gets an
AL-coloured underline + tag once published. Pending marks split by
surface (owner request, Aug 26): on `#eWeek` and `#schedBoard`,
`data-aln` items are painted DOTTED in the upcoming AL's colour (solid
means issued, dotted means coming); the view-only page and draft-day
edits keep the neutral dashed hint and no text-level mark. `data-aln`
resolves its colour through the same `--alc` palette rules as `data-alc`.

## Version preview (edit week + board only)

The day-head `<select data-dver>` (emitted only when `dayHTML` gets its
`vsel` param — EditWeek passes it, ViewWeek never does) and the board's
React `.dver` select set `DPREV` (state/view.ts, di → `'orig'`|AL n).
`withDaySnap(di, ver, fn)` (ui/html.ts) is the ONE place the snapshot may
stand in for the live model: it swaps `DAYS[di]`/`SCHED.changes`/
`SCHED.pending`, sets the PV flag, and restores everything in `finally` —
a throw mid-build must never leave the snapshot installed as the real
schedule. Under PV: no WARN reads (a snapshot is never validated), no
sev/chip rings, no `data-slot`/`data-fill`/`draggable` (those keys address
the LIVE model), pucks keep `data-person` so selection works, and the
frozen `data-alc` marks come from the snapshot's own changes slice. The
board renders `boardHTML(di, pv)` read-only (disabled fields, no mbtn/arm
targets, no sign-off bar) inside `.pv-frozen`, and its live-checks panel
becomes the preview banner. Belt-and-braces gates on stale markup:
`armSlot`, `boardChange`/`boardMbtn`/`boardArmClick`, `dragFrom`
(`.preview`/`.pv-frozen`), Shell's contextmenu clear. Previews are pruned
lazily (EditWeek/SchedBoard), on `histApply`, and on week switch. The
`data-restore` button routes through `routeClick` → `restoreDayVersion` —
a ROLLBACK: the version becomes live at once, discarding the day's pending
edits (see engine-rules.md). Restoring the version the day is already at
with nothing pending is a no-op toast, no history step. Under a preview
the day-head chip still names the LIVE current version while the banner
names the previewed one — deliberate ("live is at AL2, you're viewing
AL1").
Known limitation: personal-INPUTS sections and the day-info pop show LIVE
data inside a preview — inputs are not part of the issued document.

## The day-head version chip

One `.dal` chip per day = `dayCurVer(di)`, everywhere (view page, edit
week; the board has no chips). `data-alc` tints it; `ORIG` is `.dal.orig`,
grey by design — the bare `.dal` fallback colour is `--accent`, which is
AL1's cyan, and ORIG must never read as AL1. No chip on a published day no
AL ever touched. The full "which ALs amended this day" history lives only
in the ⓘ day-info panel.

## Sign-off pills (iOS tap contract)

Each `.sgn` pill = `.k` role label + `.v` visible value + a `<select
data-sign>` stretched invisibly over the whole pill (absolute inset:0,
opacity:0, font-size 16px so iOS never zooms on focus). iPhone Safari does
not open a select from a tap on its wrapping label, so the select itself
must cover every tappable pixel — do not shrink it back. `.v` mirrors the
old select's text metrics so pill geometry and the 820px wrap are
unchanged; it re-renders on reflow, which is what updates the shown name
after a change. This is the ONE deliberate markup divergence from the
reference; `html.test.ts` excises the strip from the edit-mode byte-parity
assertion and pins the pill structure separately.

## The scheduler board's panels

`boardHTML(di, pv)` renders, in order: sign-off strip (first child — pinned
by a test; pv-suppressed) · overall notes · overall programme · flying waves
· **Duties** (`.sb-panel.duty`) · **Sims** (`.simr`, AMT/OFT rows) ·
**Ground programme · scheduler** (`.grnd`) · **Ground programme · personal
inputs** (`.pinp`) · sim planning notes. The duty/sim/ground panels (added
Aug 26) share the `c6r` grid (Item | Start | End | People | Rmks | ctl) and
speak the ordinary grammar — seats `d:di.wi.ri` / `s:di.kind.ri` / `g:di.ri`
(+ `.xN`, fill `.+`), texts `dl:/dr:/sr:/gr:` via `data-bfld` — so the
board's generic arm/drag/change handlers cover them with no extra wiring.
Row mbtns: `dr*/sr*/gr*` cx (CxDialog) / flag / del, `dwadd/dwdel/dradd`,
`sradd`, `gradd` (board.ts). Duty rows render in MODEL order, not
`dutySort` — an editor whose rows jump as a role is typed would be hostile.
`.pinp` is read-only always: aircrew-submitted inputs have no funnel keys;
they are edited on the Inputs page. Every control is pv-gated in markup AND
guarded at runtime (DPREV check) like the rest of the board.

## View-only page: no Available / Office

The view page (and version previews, which build with ed=false) drops the
Available inputs group, the Office inputs group and the Available-crew puck
strip — scheduling tools, not part of the issued programme (owner request,
Aug 26). Edit week keeps all three. The view-parity test excises these
blocks from the reference string (anchored on the always-rendered Leave
group) and pins the divergence explicitly.

## Drag / arm-and-plant (hard-won — test on touch)

`applyDrop()` is the ONE drop path for mouse and touch.

- The `body.dnd` decoration is added one tick AFTER dragstart (guarded on
  the drag still being alive), never synchronously: Chromium aborts a
  native drag whose dragstart handler reflows the page before the drag
  image is captured, which killed every desktop mouse drag. The touch
  machine keeps its synchronous `dndOn` — no native capture there.
- Touch drag: 8px slop restarts the 180ms hold, >26px cancels; ghost
  follows finger; click-eater dies on next pointerdown.
- Toast is `pointer-events:none`.
- A PALETTE drop anywhere on a list row resolves to that row.
- A SEAT puck only lands on a seat (swap) or a crew cell (move). Dropped
  anywhere else — row title/timings/remarks, jet-row dead space, blank
  space, roster, chrome — it comes off the seat. (Post-port enhancement;
  the reference only unassigned on the roster panel.)
- A drop outside the window never deletes. Self-drop says "Already in that
  seat".
- Arm-and-plant: empty slot arms, palette tap plants, darkened names refuse
  with a toast, changing board day disarms.
