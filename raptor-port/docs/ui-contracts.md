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
· **Duties** (`.sb-panel.duty`) · **Sims** (`.simr`, AMT/OFT rows, its
planning note inside the panel) · **Ground Programme · scheduler** (`.grnd`)
· **Personal Inputs** (`.pinp`, with the accept controls) · **Unavailable**
(`.unav`). The duty/sim/ground panels (added Aug 26) share the `c6r` grid
(Item | Start | End | People | Rmks | ctl) and speak the ordinary grammar —
seats `d:di.wi.ri` / `s:di.kind.ri` / `g:di.ri` (+ `.xN`, fill `.+`), texts
`dl:/dr:/sr:/gr:` via `data-bfld` — so the board's generic arm/drag/change
handlers cover them with no extra wiring. Row mbtns: `dr*/sr*/gr*` cx
(CxDialog) / flag / del, `dwadd/dwdel/dradd`, `sradd`, `gradd` (board.ts).
Duty rows render in MODEL order, not `dutySort` — an editor whose rows jump
as a role is typed would be hostile. Ground rows render through
`groundOrder` (see the blocks section below). `.pinp` rows themselves are
read-only (aircrew-submitted inputs have no funnel keys; they are edited on
the Inputs page) — only the accept buttons act. Every control is pv-gated in
markup AND guarded at runtime (DPREV check) like the rest of the board.

## The day's three closing blocks, and who sees them

A day ends with three blocks, not the reference's five (owner request, Aug 26 —
`Available` and `Office` are gone entirely, and `Leave` + `Downchit` merged):

| block | view-only | edit week / board |
|---|---|---|
| `Ground Programme` — the scheduler's own rows | ✓ | ✓, titled `Ground Programme · scheduler` |
| `Personal Inputs` — what aircrew submitted | ✗ | ✓ |
| `Unavailable` — Detachment, Leave, Downchit | ✓ | ✓ |

(Owner casing, Aug 26: `Ground Programme` / `Personal Inputs`, everywhere they
are titled — both week surfaces, both board panels, and the Inputs page h1.)

**Ground Programme rows read in start-time order** (owner, Aug 26), via
`groundOrder` in `ui/html.ts`, used by the week AND the board panel. The sort
is RENDER-TIME ONLY: `ri` is the slot key (`g:di.ri` / `gr:di.ri`) and pending
marks, AL colouring and published amendments all address through it, so the
model array is never reordered — each rendered row keeps its model index for
every key it emits, which is why a delete or drag on a visually re-ordered row
still hits the right model row. Time-less rows (all-day accepts, fresh
`+ Item` blanks) sink to the bottom, which is also where the model appends
them. `parseHM` reads both the seed's `'1020'` and accept's `'10:20'` forms.
Version previews re-render through the same builders, so historical previews
sort too — render-time by design.

The split is decided in ONE place, `isPersonal` / `isUnavail` in
`engine/inputs.ts`; the week and the board both used to carry their own copy of
that regex and could drift. The Available-**crew** puck strip is a different
thing — computed from who is free, not from an input type — and stays
scheduler-side as before. Version previews build with ed=false and follow the
view page, intentionally.

`Unavailable` prints `Nil` when empty: it is read every day, so an empty answer
is still an answer.

## Accepting a personal input

A personal input is not part of the issued programme until a scheduler accepts
it, which is why the view page never shows that block — and why the validator
does not see it either (`inputFlags`, see `engine-rules.md`). `acceptInput()`
(in the mutation funnel, `engine/slots.ts`) promotes it into the day's ground
programme as an ordinary row — from then on it validates, drags, publishes and
prints for everyone. The row's title is the input's TYPE (`MEETING`), its
remarks travel to the row's own `rmks` cell, and `who` stores the CALLSIGN
like every other ground write (an id would render as free text for anyone
whose id ≠ lowercased callsign — Hao Wen, X-Ray). `Other` is the one type
whose destination is ambiguous, so it offers both `→ Ground` and `→ Unavail`;
everything else has a single `Accept`.

The accepted row STAYS in Personal Inputs, faded (`.pl-row.accd`), with an
`Undo` — so the scheduler can see what they have dealt with. The ground row
carries `src`, a content key back to the input, so `unacceptInput()` removes the
right row even after other rows shift around it; an index would rot.

The push goes through `noteChange()` on the new row's key, so it is marked
pending and reaches the next AL. Undo calls `markEdit()` with NO key — a delete
must not re-mark the address it just removed.

## Scheduler notes (edit week + board only)

Four free-text blocks — under Programme, Duties, Sims and Ground programme —
on keys `pn:` / `dtn:` / `sn:` / `gn:`. `blkNoteHTML` returns `''` whenever
`ed` is false, so a populated note still never reaches the issued programme;
writing additionally needs `canEditSched()`. The Duties and Ground sections
render on `|| ed` so an empty section still offers its box rather than
stranding text already in the model.

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

## Selection highlight (`ui/highlights.ts`)

Clicking a puck selects the **person**: every copy of that name lights blue
(`.sel`, matched on `id===SELID`), so you can see everywhere they are planted
(owner, Aug 26). A second click on the same person clears. `SELID` holds the
person; every non-matching puck dims (`focusActive`) so the name pops, and
opening that person's issue boxes (`PFOCUS`) rides along, person-scoped.

The "you" indicator (`ME`, purple) is **passive**: it marks your own view-as
puck only while nothing is actively focused. The moment a selection or a
highlight chip is active it yields — your puck dims with the rest instead of
staying lit (owner, Aug 26) — so selecting someone else never leaves your own
name glowing. Clicking blank space clears everything (`selDrop`).

## Line configs — the stores "+" picker

Under Remarks, each flying line carries an additive config set (owner, Aug 26):
**NAV · N/C · 2 TKS · 3 TKS · TPOD · CL**, replacing the old fixed three-toggle
strip. The set lives once in `STORE_CFG` (`ui/html.ts`), read by both the
read-only
(`storesView`) and edit builders so they never drift. Edit mode shows the
on-chips (click one to remove it) plus a `+` button (`data-stadd`) that opens a
body-level picker mirroring `board.ts`'s `waveMenu`; the picker offers only the
configs not yet on, and the `+` stays so more can be added. Each add/remove
flips a boolean on `aircraft.opts` and calls `markEdit('st:…')`, so it lands in
the next AL exactly as the old toggles did — configs are display + amendment
state only, invisible to validation. The separate bombs free-text chip is
unchanged. The `tk2`/`tpod` keys are reused, so demo rows already carrying them
render as **2 TKS** / **TPOD**.

## The Quals page's editable columns

`CALLSIGN` heads the table (it is what every puck prints) with `INITIALS`
beside it; Add person takes callsign / initials / pilot-WSO / cat, and the
callsign is the only required field — first and last name are gone (owner,
Aug 26; the seed roster never carried them).

In edit mode both columns become inputs, and both commit on **change**
(blur / Enter) rather than on input: the table is an innerHTML string that
`notify()` rebuilds, so a per-keystroke commit would tear the field out from
under the cursor. Initials are stored upper-cased. A callsign edit goes
through `renameCallsign` (see `engine-rules.md` §Who a row stores) which
rewrites the schedule's stored callsign strings so the pucks follow, then
re-runs `validate()` — warning text embeds the callsign, so skipping that
would leave the issue strips naming people by a name they no longer have. A
refused rename (blank / duplicate) puts the old value back in the box and
toasts why.

Seeded people have EMPTY initials on purpose — `engine/people.ts` carries
callsigns and never names, so there is nothing to derive them from. Do not
invent them.
