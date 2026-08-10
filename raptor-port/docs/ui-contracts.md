# UI contracts

Detail split out of `CLAUDE.md`. Read this before touching rendering,
drag & drop, or inline text editing. These are guarantees to PRESERVE —
several are measured and suite-enforced, not preferences.

## Rendering

- An edit on one day must not visibly disturb the other days (per-day string
  diff in ViewWeek/EditWeek; per-panel diff in SchedBoard).
- The week keeps its scroll through any edit; the palette keeps its scroll;
  wave blocks keep swipe offset.
- Only the page on screen re-renders (CURPAGE gates in the week effects);
  Shell chrome is memoized; no `validate()` during render — mutation paths
  validate. Perf gate: `probes/perf-port.cjs` (port ≤ reference × 1.15 on a
  4×-throttled phone).
- Never repaint under the caret: `editingText()` guard + deferred txtCommit.
- Layout is measured, suite-enforced: puck exactly 74×15px (grids derive
  from `--puck-w`); free text needs `overflow-wrap:anywhere` AND
  `min-width:0`; a hole in a programme row renders NO element; week pan =
  one day box per click; proxy scrollbar maps linearly (HS_EPS echo guard,
  `behavior:'instant'` writes). **Enforced by `e2e/geometry.spec.ts`
  (`npm run test:e2e`), not by Vitest** — jsdom has no layout engine, so
  every rect it reports is 0×0 and a broken grid passes it silently. That
  suite runs in CI as the fourth gate; `docs/probe-sweep.md` lists what it
  covers.
- **Two cells truncate rather than wrap, and both are deliberate.** A puck's
  callsign (`.puck .nm`) FADES at its right edge — a mask, not
  `text-overflow:ellipsis`, which has no effect on a flex container anyway
  and once rendered "Wrangler" as "Wrangl", a plausible callsign that is not
  the man's; the fade keeps every character the 74px box allows. The board's
  inputs-band remarks (`.sbi-row .sbi-rm`) is `white-space:nowrap` +
  `text-overflow:ellipsis` by design — a one-line summary whose full text
  lives in its `title` tooltip. Because that leaves no soft-wrap opportunity,
  an `overflow-wrap` on it is provably inert (measured at 1500px and at 390px
  with an 80-character unbreakable remark: width, height and scrollWidth
  identical either way), so do not add one back. Both pinned in
  `e2e/geometry.spec.ts`.

## The day carries across a page switch (owner, 9 Aug 26)

View-only Sched and Edit Schedule are **two separate horizontal scrollers** —
`#vWeek` and `#eWeek` — each holding its own `scrollLeft`. Reading Thursday on
one and switching to the other used to drop you back on Monday. It is the same
week, so it is now the same day, **in both directions**.

Nothing in the model knows where a week is parked, so the reading is geometry:
`state/view.ts`'s `weekLeftDay()` returns the leftmost day box still on screen,
with 8px of slack so a sliver does not count. `pan.ts`'s palette follow reads
through the same function — shared, not copied, so the two can never disagree
about which day you are on.

Three things make it work, and each is load-bearing:

- **The reading is taken in `setPage`, before `CURPAGE` moves.** One line later
  React swaps which `.page` carries `on`, and `.page{display:none}` takes the
  outgoing week's layout away — there is no second chance to measure it.
- **It is captured on leaving EITHER week page**, not only on a straight
  view↔edit hop, so a detour through Inputs still lands you back on your day.
  A page with no week never overwrites a pending carry.
- **`CARRYDAY` is consumed ONCE**, by whichever week paints next
  (`ViewWeek.tsx` / `EditWeek.tsx`, right after the `scrollLeft = sl` that
  holds scroll across an ordinary repaint). If it stuck, every later repaint
  would drag the week back — the B54 scroll-hold guarantee broken, visible as
  the week jumping while you type.

`state/store.ts`'s `resetSession` clears it **after** its own `setPage`, which
is why that line sits at the end of the function rather than beside the other
view resets: a session change must not let one user's day follow another's
login, and on a phone a stale carry would immediately undo `initPan`'s scroll
to today's column.

Gated in two places because neither is sufficient alone: `state/carryday.test.ts`
pins the plumbing (where the reading is taken, what returns null, the session
clear), and `e2e/geometry.spec.ts` measures where the week actually LANDS, at
desktop and phone — jsdom reports every rect as 0×0 and can prove only that a
reading happened. The browser half was checked against a deliberately broken
control (capture kept, landing removed): all four cases went red, so they are
not passing for the wrong reason.

## The Inputs table's view state (`ui/InputsPage.tsx`)

Owner, Aug 5. Three things, all view-only — none of them touches the model:

- **Window.** Opens on today → +`DEFAULT_SPAN_MONTHS` (2). Membership is
  **overlap**, not "starts inside": a span that began before today and has not
  ended is still live and must stay on screen. `#inRangeBtn` drops the same
  two-click `RangeCal` the add form uses; `#inRangeDef` restores the default
  and `#inRangeAll` clears the window entirely.
- **Sort.** Every `<th data-sort>` sorts; a repeat click inverts, and the first
  click on any column is always ascending. Default is `start` ascending.
  Start date is the tie-break on every other column.
- **DOM row order is therefore NOT `INPUTS` order.** Anything addressing a row
  must go through the model index its buttons carry (`data-edit` / `data-inx` /
  `data-save`), never a position. The row under edit is pinned into the list
  even when the window or sort would drop it, so an open editor cannot vanish
  mid-edit.

## Inline text editing (`ui/textedit.ts`)

Enter commits (everywhere, including sim notes), Escape restores the model
value, drift is healed in place from the model rather than by a rebuild.

Most strings commit through `[data-txt]` → `txtSet` (the funnel). FOUR
fields live outside that grammar and each need their own focusout branch —
all four were missed in the port at some point and silently discarded
edits, so check this list when a field "won't save":
`[data-intimes]` · `[data-bombs]` (stores text) · `[data-area]` ·
`[data-atime]`.

**AREA and AREA TIME are DERIVED, and must be compared against what was
rendered, not against the model.** They are the only cells whose displayed
value comes from elsewhere — the codes off the aircraft, the window off the
formation's TO–LD — so `f.area`/`f.atime` stay null while the cell already
reads `1240-1405`. Comparing the text to the model field means comparing it
to `''`, which makes every focusout look like a change: a stray click or a
tab-through then stores the derived value as a scheduler's own. That is not
cosmetic — a stored value WINS over the derivation, so the airspace window
stops following the take-off, and a no-op change lands in the next
amendment. Both branches compare against `areaText()`/`atimeText()`, the
same functions the builder renders with, so identical text is not a change,
a real edit still commits, and an emptied cell still stores the blank.

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

**A deleted sim pax leaves a droppable hole (owner, 8 Aug 26).** The engine
always held the index (`slots.ts`'s pax branch never splices), but `sbSeat`
rendered an empty id as nothing, so deleting one WSO from the AMT BOX
visually collapsed the block and left nowhere to drop the replacement. The
board now renders a held pax hole as `.sb-slot.empty.pax[data-slot]` —
puck-sized so the pair rows stay level, armable and droppable through the
board's ordinary paths with no new wiring. Previews still render holes as
nothing (a frozen day is not a planning surface), and the WEEK's builders
are untouched — they stay reference-shaped, so a hole there still renders
as nothing; the board is the planning surface this serves. Pinned in
`board.test.tsx`, measured in place in `e2e/geometry.spec.ts`.

**Leaving Edit Schedule CLOSES the board — it does not hide it.**
`state/view.ts`'s `setPage` calls `closeBoardState()` the moment the page
stops being `'editsched'`: `SBDAY` goes null (which disarms `ARM` for free,
since `setBoardDay` disarms on any day change including to null), the aircrew
drawer's `ros-open` body class is parked, and `HOOKS.closeBoardDialogs()`
drops the CX-with-a-reason and Sort-all dialogs. It is the same cleanup
`closeScheduler`'s Done/Close buttons run, shared rather than duplicated —
and `closeScheduler` calls into `state/view.ts` rather than the reverse,
because `state/` must stay free of `ui/board.ts` (that layering is why
`closeBoardDialogs` is an injectable hook instead of an import). Landing back
on Edit Schedule does NOT resume a day; a scheduler opens one again. A board
merely *hidden* is not equivalent: at phone width the burger menu sits
outside the modal's stacking context and stays keyboard-focusable behind it,
so a live-but-unpainted board was reachable with ordinary taps.

**A rendered read-only board has exactly two routes in**, and every
read-only path (`stoRO`/`mvRO`/`ro`, `sbGrip`'s `.ro` track, `applyDrop`'s
mode check) is live defence for them: a published-version preview (`pv`), or
a session that may not edit one (the role gate). `sbGrip` emits its
`<span class="sb-grip">` unconditionally and gates only the `.ro` class,
which is `visibility:hidden` — **not** `display:none`, which would drop the
box out of grid layout and walk every field one track left of its header.

The side panel's `Live checks` list (`.sb-warn .wln`) is a **navigation
surface** since 5 Aug 26: each line carries `data-wdi`/`data-wix` and jumps to
the offending puck (§Jumping from a warning to the puck that caused it). It
iterates `WARN.byDay[di].warns` **as stored** — `validate()` has already
ordered it by severity, and the local hard-first sort that used to re-order a
copy would now break the index the rows carry. The `.wln.ok` "no conflicts"
line is deliberately not addressable. The selected state (`.wln.on`) is
rendered **into the string**, not painted afterwards: `SchedBoard` diffs each
panel's html to decide whether to re-hang it, so a class added later is lost
on the next unrelated repaint.

## The board on a phone is ONE window (owner, 8 Aug 26)

Comp approved before build. Below 820px the board used to be three stacked
zones — the panels, then a bottom-pinned sheet holding `Live checks` and the
roster, split by a drag-grip (the B25 machine, now deleted). It matches the
edit week now:

- **The warnings ride at the top of the one scroller.** `.sb-side` is
  `display:contents` on a phone, so `.sb-warn` becomes a flex item of
  `.sb-main` and `order:-1` puts it above the panels; it scrolls away with
  the content, exactly as the week's issue strips do. `flex:0 0 auto` is
  load-bearing — an `overflow:auto` child's automatic minimum is 0, so a
  shrinkable strip collapses to its header line.
- **The roster is a right-edge AIRCREW drawer** (`.sb-ros`, carrying
  `.eroster` so the week's tab styling, its `ros-open` accent flip and
  interactions.ts's delegated `.ros-tab` toggle apply verbatim). Arming any
  slot pulls it open — that is `armSlot`'s existing `isPhone()` line, not
  new wiring — and `closeScheduler` parks it so an open drawer never leaks
  onto the week underneath. The drawer geometry is restated in the board's
  own 820px block because `.edit-board .eroster`'s rules are scoped to the
  week's page wrapper; its z-index (120) lives inside `.schedboard`'s own
  stacking context (400), so body-level popups at 480 still paint above
  the whole board.
- **Parked, the drawer is a centred grab-handle, and a fill parks it
  (owner critique, 8 Aug 26).** The first parked shape spanned
  `top:0;bottom:0`, which put the sliver over ✕ Close and the Sun 19 chip
  (elementFromPoint returned `.ros-tab` at both), and an invisible 14px
  hit extension sat over the ends of full-width inputs. Parked is now
  `top:50%`, `height:clamp(180px,55vh,440px)`, an honest 30px wide with
  NO hidden hit area — the board's panels take 4px extra right padding
  because the old tab cleared them by exactly 26 — and open restates full
  height as it slides out. The week's `.eroster` has the identical parked
  shape. A SUCCESSFUL fill parks the drawer so the puck is seen landing:
  the tap path in `placeArmed`'s success branch, the drag path by clearing
  `drag.ts`'s `ROS_REOPEN` latch inside `applyDrop`'s `done()` — refusals
  and aborted drags leave the drawer out. Spec:
  `docs/superpowers/specs/2026-08-08-mobile-board-flaws-design.md`.
- **Live checks folds to one line on the phone board (owner, 8 Aug 26).**
  The strip used to scroll inside the one board scroller. `boardWarnHTML`
  wraps everything in `.sbwrap[.open]` with the header carrying
  `data-sbwtog` and a caret; `SBWOPEN` (`board.ts`, module state like
  `SBWIDE`) starts false on every `openScheduler` and survives day-tab
  switches; the toggle branch in `routeClick` is `isPhone()`-gated. Open
  shows every row — no inner cap or scroll. Desktop and `.sb-wide` keep
  the always-open list (restated); a quiet day shows its ✓ line even
  collapsed; a day preview still replaces the strip with the read-only
  bar, which never folds.
- **Desktop (>820px) and `.sb-wide` are unchanged** — the side column
  restates `display:flex` and melts the drawer wrapper back to
  `display:contents`, tab hidden.
- **A flying line's seats are full-width strips, below the times (fix,
  8 Aug 26 — they used to overlap).** Grid auto-flow is sequential, so when
  the full-width B cell (child 3) broke to its own row, TO/LD slid into the
  name tracks and the two 74px seats into the 46px time tracks, pucks
  painting over each other. The B cell is pinned to `grid-row:2` (taking it
  out of the flow) and each `.sb-slot` spans the row — which is also a
  finger-sized drop target. The FCP/RCP header labels hide at phone width;
  `.sb-wide` restates all of it back.
- **The drawer body scrolls the iOS way**: `flex:1` + `min-height:0` rather
  than `max-height:100vh` (iOS's 100vh is the largest viewport — toolbars
  collapsed — so a 100vh cap never binds while the bars are up and the
  list's tail hides behind them), plus `overscroll-behavior:contain` so an
  end-of-list swipe cannot scroll the board underneath. The week's
  `.ros-body` got the same treatment. (The invisible 14px hit-area
  extension this bullet once described was itself a tap-stealer and is
  gone — see the grab-handle bullet above.)

Pinned in `odds.test.tsx` (tab, shared toggle, parks on close) and
`board.test.tsx` (park-after-fill, the fold's state machine), and measured
in `e2e/geometry.spec.ts` (strip above the first panel, the parked handle
a centred band whose taps never steal from Close / the day chips / input
ends, the fold opening and closing, the drawer parking on a fill, seats
clear of every input and of each other).

## The late-input mark on screen (owner, 9 Aug 26)

The rule and what counts as late — including the downchit exemption — are in
`docs/engine-rules.md` §The late-input mark. What this file owns is **where it is drawn**, and the ask
was "visible throughout, and it sticks with that input even though it's on
view schedule" — so the mark is gated on NOTHING. Not edit mode, not the
role, not `pv`. Every other badge on these rows answers to at least one of
those; this one deliberately does not.

`.latetag` — a small amber `LATE` badge, same shape as `.flagtag` so the two
read as one family, amber rather than red because it is an advisory about
paperwork sitting in rows that also carry red CX badges and crew-rest rings
it must not shout over. The full sentence (what changed, when, which deadline,
which week) rides in the `title`, never in the badge, so no row grows.

**It lives in the REMARKS cell on every surface** (owner, 9 Aug 26 — moved out
of the name and type cells the same day it shipped). Remarks is where a reader
already goes for "why is this man down", which is the question the mark
answers, and it leaves the name and type columns reading as pure identity.
Every surface that draws an input has a remarks cell, which is what lets the
mark sit in one column across all of them.

Where `lateTag()` is emitted:

- the week's **Personal Inputs** and **Unavailable** blocks, in the row's
  `.rmk` cell, on the edit page and the view-only page alike (`ui/html.ts`);
- the board's **inputs bands** and its **Personal Inputs panel**, in the
  `.sbi-rm` cell (`ui/board-html.ts`);
- the **Inputs page** table, in the Remarks column (`ui/InputsPage.tsx`).

Three things fall out of that cell rather than the badge, and each is pinned
by `ui/lateinput-ui.test.ts`:

- **The badge LEADS the cell.** Both remarks cells clip a long remark — the
  board's with an ellipsis, the week's by column width — and the mark is the
  part that has to survive the clip.
- **`.rmk.has-late` FLOATS the badge** (in a `flow-root` cell, so an empty
  remark still contains it). `.rmk .ntx` is `display:block` — it has to be, so
  the editable box fills the cell and is clickable — which means an
  inline-block badge in front of it takes a line of its own, and a flex track
  beside it costs the badge's width on every line of a wrapping remark. A
  float costs it on the first line only. Not free even so, and measured:
  the seed's longest remark is 39px unmarked, 53px marked at desktop width —
  one extra line, because 36px of a narrow column goes to the badge. That is
  inherent to a badge in a wrapping column; the block already has rows of
  unequal height, and it was accepted rather than designed away.
  The cost was then measured again at the scale the owner cares about — one
  day loaded to **eleven** personal inputs, the case he raised — and it is
  **zero on desktop** (666px block with the mark and without it) and **33px on
  a phone** (757 vs 724 over eleven rows), where the column is narrow enough
  that the badge also splits two long remarks mid-word. A compact dot measured
  724, i.e. free, and a phone-only dot was recommended; **the owner chose to
  keep the word** (9 Aug 26). Don't re-propose it. Two neighbouring ideas are
  measured dead ends: the badge trailing the remark costs 759, and disabling
  mid-word breaking costs 757 — the badge's WIDTH is the cost, not where in
  the cell it sits.
- **The board's em-dash placeholder gives way to the badge.** `.sbi-rm` prints
  `—` for "nothing written"; `LATE —` would read as a remark that says
  nothing, so `sbiRmk` drops it when the badge is there and keeps it
  everywhere else.

**A promoted ground row carries it too, and that is the load-bearing case.**
A personal input never reaches the view-only page on its own — accepting it
onto the ground programme is the only route there — so if the mark did not
survive the promotion it would vanish at exactly the surface the squadron
reads. `plRow` passes `lateTagOf(o)` into its `plRmk` cell, resolving the
row's `src` back to its input.

**The board's version of that row is a class, not a badge, and must stay
one — and it is the ONE surface where the mark is not in the remarks cell.**
`.sb-arow.c6r` is a seven-track template whose header reserves exactly
seven items, and every cell is a bare `<input>` — including its remarks cell,
which is why the move to remarks could not reach this row: there is nowhere to
nest a chip inside an `<input>`, and an eighth grid item would walk every
field one track left of its own heading, which is the register bug the
whole-branch review already found once. So it
wears `.lateinp` (an inset amber edge, the `.redbox` idiom) plus the note in
its tooltip. `e2e/geometry.spec.ts` counts the row's grid items against its
header's tracks so that "improving" it into a chip fails a gate rather than
silently breaking the register. The row's own INPUT still carries the full
badge in the Personal Inputs panel above it.

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
`groundOrder` (`engine/order.ts`, moved out of `ui/html.ts` 8 Aug 26 so
`engine/reorder.ts` can freeze a rendered order without the engine importing
from `ui/`), used by the week AND the board panel. The sort
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

## Reordering rows on the board

A grip (`⠿`, `board-html.ts`'s `sbGrip`) sits at the far left of every
movable board row on desktop; below 820px it is `display:none` and the
row's own control cluster (`.lctl`) shows ▲/▼ instead (`.mbtn.nudge`,
`sbNudge`). **Both are always emitted — CSS alone decides which paints.**
Rendering the grip or the buttons conditionally on viewport width would
make the panel's string-diff depend on window size, and would not survive
a resize: a board built at 900px and then resized to 700px would still be
carrying whichever markup it happened to be built with, not the one the
new width wants.

**The address lives on the ROW, never on the grip** —
`data-move="mv:…"` (`rowMove`) is an attribute of `.sb-line` / `.sb-arow` /
`.sb-nrow` itself, not of the `.sb-grip` span sitting inside it.
`rowdrag.ts`'s pointer machine depends on this directly: a `pointermove`
finds the row under the moving finger with `closest('[data-move]')`, and a
pointer spends far more of a drag hovering the row's middle than its 18px
handle. If the address lived on the grip instead, a drag could only ever
recognise a landing target the instant the pointer happened to be back over
a handle — which is not a drag at all.

**The grip's 18px track is a measured contract, and its phone treatment is
the single most breakage-prone part of this change.** `.sb-lcols/.sb-line`
and `.sb-acols/.sb-arow` both prepend one `18px` column for it on desktop.
Below 820px the grip is `display:none`, so it claims no grid track — but it
is *still a DOM child*, and every `:nth-child()` rule in the phone block,
and in its mirror `.schedboard.sb-wide` (the block that restates the
desktop layout at phone width), counts it whether or not it paints. Every
column index in both blocks shifted by one the moment the grip was added;
a future column change to either row template has to shift them again in
lockstep or a phone or `.sb-wide` layout silently picks up the wrong cell.

**`.sb-nrow` needed its own phone template when no other row did**, and
that gap was found live, not in review (fix round 1, 8 Aug 26). Every
other row already carried a phone override; with the grip hidden, the
notes row is down to three real grid children — `nx`, `nin`, `.lctl` — and
without a restated template it fell through to the unconditional desktop
grid (`18px 22px 1fr 62px`, four tracks): `nx` landed in the 18px track
(harmless — it is just "1."), `nin` — the note text itself — squeezed into
the 22px track meant for `nx`, and `.lctl` (▲, ▼, ✕) inflated its first
button to fill the `1fr` track meant for the note, the last 62px track
going unused. The phone override is `22px 1fr 74px`, the 74px measured
against the phone build for ▲ ▼ ✕ at `.mbtn.nudge`'s own size plus
`.lctl`'s gap, with a few px to spare.

**The landing mark is a border on the row being dropped onto, not an
inserted element** — `.rowdrop{box-shadow:inset 0 2px 0 0 var(--accent)}`.
Every board panel is an innerHTML string; inserting a node under a moving
pointer would change the very child indices the `nth-child` rules above
count, mid-drag. `.rowdrag` marks the row being carried (raised background,
accent outline, `cursor:grabbing`). Both classes are written straight onto
the DOM by `rowdrag.ts`, not through React state — a re-render mid-drag
would rebuild the panel out from under the pointer and drop the gesture —
so only the drop itself (`onUp`) calls `notify()`.

**▲/▼ target the neighbouring RENDERED row, never index ± 1.** `boardMbtn`
reads the row's actual DOM siblings that carry `data-move`
(`row.parentElement.children`, filtered to movable rows), not model-index
arithmetic, because one list — Ground — renders time-sorted
(`groundOrder`): "one place down" is a question about what the scheduler
can currently see, and `engine/reorder.ts` is what translates that screen
position back into model indices (the freeze described in
`engine-rules.md` §Reordering a board list). A grip drag resolves its
target the same way, off whichever row is currently marked `.rowdrop`, never
an index.

**Three guards, no exceptions** — the same shape the rest of the board's
write path already uses. Render: `HOOKS.editMode()` emits no grip and no
buttons at all for a non-scheduler, or for a board left open by role change
after a page nav. Gesture: `rowdrag.ts`'s `onDown` and the `▲/▼` branch in
`boardMbtn` both refuse unless `canEditSched()`, and both bail on
`view.DPREV.has(view.SBDAY)` — the same stale-markup guard every other
board mbtn already checks, so a version preview a scheduler is still
looking at cannot be dragged or nudged. Engine: every mover in
`engine/reorder.ts` no-ops on an out-of-range index or `from === to`, so a
stale or forged address reaching `applyMove` cannot corrupt the model.

**`⇅ Auto sort` sits in the section's own header, beside the button that
adds a row to it — never in a shared toolbar.** `sbSortBtn(addr, ro)`
(`board-html.ts`) is called once per section: inside each wave's `.gctl`
next to `+ Line`, inside each duty block's sub-header next to `+ Row`,
inside the AMT and OFT sim sub-headers each next to their own `+ Row`,
and in the Ground and overall-programme panel heads next to `+ Item`.
Overall notes' header carries only `+ Note` — no sort button — the same
`ro`-gated absence the grip and the nudge buttons use, so a preview or a
read-only board renders no live control there either. Which sorter answers
a click is decided by the address's own prefix (`w`/`d`/`s`/`g`/`p`),
dispatched in one place in `boardMbtn`, not by which panel the click
happened to land in — so adding a section's sort behaviour never means
teaching the click router a new location. The toast on a click that
changed nothing is "Already in order", not silence — a scheduler reaching
for the way-back control on a tidy section should hear that it IS tidy,
not wonder whether the click landed; Ground's version of that toast is
"Ground programme back to time order" instead, on the one path where
clearing the manual flag was the only thing that happened (see
`engine-rules.md` §Sorting a board section).

**`⇅ Sort all` is the one board control that is not per-row or
per-section — it lives in the board's own top bar (`.sb-actions`,
`SchedBoard.tsx`), beside `+ Line` / `+ Wave`, hidden outright for a
member (same `canEditSched()` gate as every Auto sort button) and disabled
while a published version is being previewed (`DPREV.has(SBDAY)`), the
same idiom `+ Line`/`+ Wave` already use.** Clicking it does not sort
anything by itself — `askSortAll(di)` only arms `SORTALL = di` (re-checking
`canEditSched()` and the preview guard a second time, so a stale button
left over from a role change or a preview armed after the click still
cannot open the dialog) and the confirmation is a modal in the board's own
idiom, not a browser `confirm()`: `SortAllDialog` reads the day straight
off `SORTALL` so it can never name the wrong day even if the board has
since switched tabs underneath it, and its body spells out that this
control — unlike every other one on the board — acts on the whole day at
once and that a single Undo reverses all of it together. Confirming calls
`sortAllCommit()`, which is the one place `HIST.lock` brackets a whole run
of sorters (`engine-rules.md` §Sorting a board section); cancelling or
clicking outside the box just drops `SORTALL` back to null. An already-tidy
day still gets a toast — "Already in order" — rather than the confirm
dialog closing silently.

## Flag colour IS the tier (owner, 10 Aug 26)

"7 should be red, its a warning. B, should be amber, they are advisories.
including the rings." Red means the rule is raised **hard**; amber means
**adv**; grey means **note**. Nothing else may decide it.

Four places had drifted apart and now have to agree — change one, change all:

- **the ring** — `.puck.warn` / `.warn.hard` / `.warn.note`, driven by
  `sevOf`. This was always right.
- **the red BOX** — `ui/html.ts`'s `boxred` list, driven by the PRINTED FLAG.
  It carried `NB`/`SB` (advisories), so an eaten brief wore a red box over an
  amber ring: the puck said warning, the checks list beside it said advisory.
  It omitted `RUN`, the one hard rule drawing no box. Now `C`, `CR`, `Q`, `RUN`.
- **the chip** — `scheduler.css` `.lchip.l-*`. `.l-nb` / `.l-sb` were red and
  are now amber. **`.l-run` did not exist at all**, so the `7` fell back to the
  base chip's dark text on no background — near invisible on a puck, and never
  noticed because the demo week never trips a break day.
- **the two legends** — `html.ts legendHTML()` (the week) and
  `logic-html.ts chipRow()` (the Logic tab), which each hardcode their own
  list. They disagreed with each other about the `7`: the week drew it red,
  the Logic tab amber.

`ui/html.test.ts` pins the swatch against the tier by name, so a new chip
whose colour contradicts its severity fails rather than shipping. The two
brief rows are excised from the legend byte-compare (`noBriefKey`) because the
reference drew them red — a deliberate divergence, and **not** a no-op on the
reference, which is why the positive pin carries the real assertion. Careful:
there is already a module-level `noBrief` for the brief-time CELL; shadowing
it silently breaks the day-parity tests on an unrelated `class=""`.

## Selection highlight (`ui/highlights.ts`)

**A click on blank schedule clears EVERYTHING that lights a puck** (owner,
10 Aug 26 — "every puck should be deselected"). Three separate mechanisms can
light one: the blue puck selection (`SELID`, plus `WFOCUS` / `PFOCUS` / the
open day boxes), the **HIGHLIGHT chips** (`HLSET`), and the **search**
(`SEARCH`). Only the first used to clear, so a scheduler could click the board
empty and still be looking at a lit week with nothing on screen explaining
what was holding it. All three now go together, in `interactions.ts`'s
blank-click branch.

The **search inputs are uncontrolled** (`#searchV` / `#searchE`, `onInput`
only, no `value` prop), so their DOM value is wiped by hand — clearing just
the state would leave a box reading "bane" with nothing lit, which is worse
than not clearing at all. The chips redraw themselves from `HLSET`.

The **exclusion list decides what counts as blank** and is the reference's,
verbatim: `.fchip` and every form control are on it, so clicking a chip or
into the search box is not a blank click and does not wipe what you just did.
Pinned in `ui/interact.test.tsx`, both against a control.

Clicking a puck — **anywhere on it, flag chip included** (owner, 7 Aug 26) —
selects the **person**: every copy of that name lights blue (`.sel`, matched
on `id===SELID`), so you can see everywhere they are planted (owner, Aug 26;
re-confirmed 7 Aug 26 when asked). A second click on the same person clears.
`SELID` holds the person; every non-matching puck dims (`focusActive`) so the
name pops, and opening that person's issue boxes (`PFOCUS`) rides along,
person-scoped — a multi-person warning stays whole there, both names printed.

**The screen holds still while the boxes open (owner, 7 Aug 26 — "it should
just turn blue. it should not pan the view at all").** The page never
scrolled, but a `.dwbox` opens ABOVE the schedule inside its day column, so
the very puck just clicked leapt ~220px down the screen — indistinguishable
from a pan. `interactions.ts:holdPuckStill` captures the puck's viewport
position at the click and scrolls the page by the puck's own displacement —
opening AND the toggle-off closing both. The correction runs **in the same
task as the day-markup swap** (`queueHold` in `highlights.ts`, drained at
the end of `refreshHighlights`), never on a timeout: a deferred correction
races the browser's next paint, and on a slow machine one frame showed the
leap before the snap-back — the owner's "the page jitters", 7 Aug 26. The
e2e test CPU-throttles and samples the puck's position on every frame,
because a fast box wins that race and measures the buggy code clean — which
is exactly how it shipped. The swap replaces the element, so the puck is
re-found by week, day, name and position, never by identity. Off the week
(board, palettes) the delta is zero and it is a no-op. jsdom reports every
rect 0×0, so vitest sees a zero delta by construction — the hold is gated in
`e2e/geometry.spec.ts` ("selecting a puck holds the screen still").

**Selection is the blue fill and nothing else (owner, 7 Aug 26).** `.puck.sel`
used to add a 2px `#BFE0FF` ring + glow with `!important`, which read as a
white halo AND buried the red/amber severity ring the selected puck was
carrying. It now sets background and text colour only: `warn`/`boxred`/
`boxdash`/`boxdot` keep their own strokes over the blue, and the compound
`.sel.box*` punch-through rules went with the halo (the `.me.*` halves stay).
The dim is `opacity:.5` — half-visible, not the near-invisible `.18` it was.

Warning focus outranks all of it, and since 5 Aug 26 it governs the board's
schedule panels (`.sb-boardwrap`) as well as the week — the board's issue list
became clickable, and navigation is useless if the destination is not lit.
Board pucks take `wfoc`/`advf`/`dim` but never `echo`: the board is one day, so
the cross-day echo has nothing to say there. The roster palettes still keep
their normal look (a palette puck is a drag source for a day you may not be
looking at, so dimming it would fight arm-and-plant), and `.pv-frozen` is
excluded — `WARN` is live and a version preview is a published snapshot.
See §Jumping from a warning to the puck that caused it.

The "you" indicator (`ME`, purple) is **passive**: it marks your own view-as
puck only while nothing is actively focused. The moment a selection or a
highlight chip is active it yields — your puck dims with the rest instead of
staying lit (owner, Aug 26) — so selecting someone else never leaves your own
name glowing. Clicking blank space clears everything (`selDrop`).

## Jumping from a warning to the puck that caused it

Four surfaces flag aircrew; the three LISTS navigate, and the chip — since
7 Aug 26 — selects like the puck it sits on (it navigated 5 Aug–7 Aug 26; the
owner unified the two views: a chip a few pixels wide giving a different
answer than the puck around it read as two features). A warning
carries `(di, who[])` and, since Aug 26, an optional **anchor** `key` — the
slot-key of the line that caused it (see below). The address every surface
passes is still `data-wdi`/`data-wix`, the day index and the index into
`WARN.byDay[di].warns`; the anchor rides along in `WFOCUS.key` when the
warning is focused:

- **The week's issue rows** (`.witem[data-wdi]`, inside an expanded `.dwbox`)
  go through `focusWarn`, which **toggles** — right for a list you are already
  looking at.
- **The day-detail panel** (`.witem[data-adv]`, `"di.ix"`) closes the modal
  first.
- **The board's issue list** (`.wln[data-wdi]`) — see below.

**The board list must open `DWOPEN` itself** (it mirrors the `[data-adv]`
branch, not the `.witem` one). `focusWarn` never touches `DWOPEN`, which is
correct on the week — a `.witem` only exists inside an already-open box — but
a focus set from the board with `DWOPEN` empty leaves lit pucks and no way to
clear them: `html.ts` renders `✕ Clear focus` only inside an open box.

**Every surface marks its clicked row (owner, 7 Aug 26).** The week's rows
and the board's Live checks always carried the `on` class while their warning
was the focus; the day-detail panel's rows and the cross-day crew-rest row
were the two that did not, so clicking one lit pucks with nothing on the page
saying which row had done it. All four emit `on` by the same test now —
`WFOCUS` against the address the row CARRIES, which for the cross-day row is
the next day's warning. The panel closes itself on the click (its own
contract), so its mark shows on reopen.

**The click's LIGHTING is deliberately the warning colours, not blue (owner,
7 Aug 26 — considered and declined).** A clicked warning lights every person
it names — all four of a double-turning crew — in `wfoc` red or amber and
fades the rest; painting the first-named in the selection blue was proposed,
built and rolled back the same day. Blue means one thing in this app: the
puck-click selection (which also narrows the lists to that person; the row
click never narrows). Do not re-propose it.

**The cross-day CR chip lost its jump with the rest** — the previous-day story
is still one selection away: clicking the dotted man reveals the on-demand
`.dwtrace` strip on the causing day AND opens the breach day's box (the breach
names him, so it is in `personWarnDays`); the strip's row is the affordance
that still leaves the day it was clicked on.

**Every ringed puck carries a chip** (owner, 5 Aug 26). The crew-pairing
family (`CREW_SOLO`, `CO_APPROVAL`, `OCU_NO_IP`, `ILLEGAL_CREW`, `NO_IR`) used
to ring and never chip, which left it the one family with nothing on the puck
to click; it now marks `CP`/`CPH` (renamed from `CC`/`CCH`, owner ask 5 Aug 26
— see `engine-rules.md` §The crew-pairing chip). A ring without a chip is now
a **bug**, and `validate.test.ts` asserts
there are none. The ring and the chip are both part of the puck, and the puck
selects the person (owner, Aug 26; the chip joined the ring 7 Aug 26). The
warning a chip stands for is in the selection's own box, alongside the rest
of that person's.

**The anchor: a warning knows the line that caused it.** `add()` in
`validate.ts` takes an optional 5th argument — the slot-key (or key prefix) of
the **first item the warning's message names**, which is the item that caused
the flagging (owner, 6 Aug 26): `NO_BRIEF` anchors on the flagged person's own
seat in the flight line (`di.gi.li.ai.p|w`), `SIM_BRIEF` on the sim row that
briefs (`s:di.kind.ri`), `DOUBLE_BOOK` on the first-named clashing event,
the crew-pairing family on the aircraft (`di.gi.li.ai`), formation-wide
warnings (`OCU_NO_IP`, `SC_QUAL`…) on the formation (`di.gi.li`).
Day-spanning warnings (`DT_SUM`, `LONGDAY`, `DAYS_RUN`) carry none. The keys
come off `collectEvents`, which stamps every event it emits with the key of
the row it came from (`fly`/`acs`/`forms`/`simwin`/duty/ground/programme all
carry `key`; flying `events` keep their original `slot` field — `avail.ts`
depends on that name). `add()`'s dedup string deliberately excludes the key:
first add wins and keeps the first item's anchor. `parity.test.ts` strips
`key` from BOTH sides of the reference comparison; the keys are pinned
positively in `validate.test.ts` ("warnings carry the causing line's
slot-key").

**Which puck wins.** The anchor first: `anchorEl` (exported from
`highlights.ts`) finds the element whose `data-slot`/`data-fill` equals the
key or extends it through a `.` — segment-safe, so `s:0.oft.1` can never
claim `s:0.oft.12.p` — then `closest('.acrow,.pl-row,.ah-row,.sb-line,.sb-arow')`
recovers the row and the flagged person's puck INSIDE that row is the
destination (the row element itself when the name is only free text there).
The board renders every section under the same keys, so anchors resolve there
too. Preview (`pv`) markup emits no `data-slot`, so an anchor never resolves
into a frozen version. When the anchor is missing or stale (WARN is rebuilt
wholesale; a held focus can outlive its line), the pre-anchor heuristic runs
verbatim: one named person is the first puck in document order. Two or more
is the crew-combination family, where `who` is the pilot AND the WSO of one
aircraft — there `scrollToWarnFocus` prefers the candidate whose nearest
ancestor holding two of the named people is shallowest, which finds `.acrow`
on the week and `.sb-line` on the board without naming either class. Where no
two of them share a row at all, it falls back to document order: only a REAL
co-location may score, or the winner is just whichever puck sits shallowest
in the page, which is not a fact about the schedule.

**`.availpuck` is never a destination.** The Available-crew block is a derived
list of who is FREE that hour, so no warning can originate there, and it is a
flat grid — under any depth-based rule it out-scores a puck nested inside a
flying line. It is excluded from the candidate set outright. Note it renders
on the **edit week only** (`if(ed)h+=availHTML(…)` in `html.ts`), so a test
that drives the view week cannot see this class of bug: the regression that
prompted the rule (owner, 5 Aug 26 — a crew-rest warning panning to the free
crew instead of the flight that caused it) was invisible to every view-week
test in the suite.

**One surface pans somewhere other than the warning's own day** — the
cross-day crew-rest row, and only it. `WFOCUS` may carry `panDi`/`panKey`,
set by that row alone; when it does, `scrollToWarnFocus` builds its root from
`panDi` and anchors on `panKey` instead of `WFOCUS.di`/`.key`, so the focus
stays on the breach while the view stays on the day that caused it. Off-board
only, and everything downstream — the snap placement, the lateral hold, the
target-picking rule — works off that root unchanged. Full reasoning in §The
previous-day trace.

**The scroll is two moves, and the order matters.** `.week` is
`scroll-snap-type:x mandatory` with `.day{scroll-snap-align:start}`, so
`inline:'center'` asks to rest between two snap points and the browser
re-snaps afterwards — on a 620px day box that can land a whole day past the
one clicked. So the day is placed by hand first, instantly, onto its snap
point (`hsSet`, then `hsSync` for the bar geometry), and only then does
`scrollIntoView({block:'center',inline:'nearest'})` do the vertical.
`inline:'nearest'` is load-bearing: the puck is already in view sideways, so
nothing fights the snap back. Gated by `e2e/geometry.spec.ts` — jsdom has no
layout and does not implement `scrollIntoView`, so `warnjump.test.tsx` can
only pin which element is aimed at, never where it lands.

**The lateral view is HELD when the target is already on screen** (owner,
6 Aug 26). The horizontal move above used to run on every click, so a warning
on a day you were already reading — the second day box, sitting mid-screen —
snapped that day hard to the left edge and threw the rest of the week off the
side. Nothing was gained: the puck was in front of you before the click. So
`scrollToWarnFocus` now measures first and pans only when the destination is
genuinely not in view; when it is, `scrollLeft` is not touched at all and the
jump is purely vertical. Three details carry it:

- The test is on the **puck**, not its day. Half a day box can hang past the
  right edge with the target perfectly readable, and panning then would be
  the same unasked-for lurch in a smaller size.
- A **zero-width week** means nothing is measurable — that is jsdom, which
  reports every rect as 0×0 — and the honest reading of "I cannot tell" is
  the old unconditional pan. So `warnjump.test.tsx` still exercises the
  shipped path and only a browser can see the hold.
- `inline:'nearest'` then does nothing horizontally by definition, since the
  branch only holds when the element is already in view inline.

Both halves are gated in `e2e/geometry.spec.ts`: an off-screen day still
lands on its snap point, and a day already on screen ends the click at
**exactly** the `scrollLeft` it started at. Those tests drive the click with
`clickHere` (`e2e/app.ts`) rather than `page.click`, because Playwright's
actionability scrolls a target into view before pressing it — which would
hand the app a week already panned onto the day and test nothing.

A stale row scrolls nowhere. `WARN` is reassigned wholesale by every
`validate()`, so a row rendered before an edit can outlive its warning;
`focusWarn` bails on the missing index, and the caller re-checks
`view.WFOCUS` against the clicked `di`/`ix` before scrolling — without that,
the week flies off to whatever was focused before.

**Switching the board's day tab clears a stale focus** (owner, 5 Aug 26).
`setBoardDay` already disarms a slot armed on another day; it now also drops
`WFOCUS` under the same conditions — the board was already open, the day is
really changing, and the focus belongs to neither the day being left nor the
day being entered. Left alone, `WFOCUS.di` kept pointing at the day just
left, `warnOnBoard()` (`WFOCUS.di===SBDAY`) went false, and `highlights.ts`
stopped lighting anything: the lit pucks and the selected issue row vanished
while the app still held a focus nothing on screen could clear. Two cases
stay untouched on purpose: switching the board tab **onto** the focused
warning's own day keeps it lit, and **opening** the board (`SBDAY` null →
`n`) never touches a week-set focus at all — that path is what lets a
week-wide warning survive the board opening on some other day.

## The B box, and the suggestion above it (owner, 6 Aug 26)

The brief time is typed per formation (`f.br`, key `ff:di.gi.li.br`) on the
edit week and the board — the board grew a **B column** for it, before TO. It
goes through `ted()` like the `.to` beside it, so `.br` in `TIME_TXT` is what
gives it HH:MM parsing, and `txtRef` resolves the key with no new branch.

While a line has no indicated B, the calculated time (`T/O − VCONF.briefLead`)
is offered as a ghost **above** the box, carrying `data-bacc` (the key) and
`data-bval` (the value); `interactions.ts` writes it through `txtSet` on click,
so accepting is an ordinary edit — pending mark, next AL, undoable. It is
never applied silently: the model stays blank until somebody decides, and a
blank line is still validated against that same suggested time. Standalone
waves have no B at all — they are shifts and brief nothing.

Two measured contracts moved with it: `.acrow`'s `min-height` grew to
`--puck-h + 20px` for the third line in the B/TO stack, and the board's
`.sb-lcols`/`.sb-line` template gained a fifth time column. The geometry gate
and the adapted `wrap` probe are what hold them.

## Three crew-rest rings, and the day that caused the breach (owner, 6 Aug 26)

One red, three strokes, in order of how directly the puck owns the problem:
**solid** is his own breach, **dashed** is his own breach that a human
sanctioned, **dotted** is not his breach at all — it is the day he causes
one. All three are the same colour at the same weight, because downgrading
the colour would read as "less of a problem".

- `.puck.boxred` — the solid box (`box-shadow`), the ordinary hard flag.
- `.puck.boxdash` — a crew-rest breach on a line whose aircraft remarks say
  `late show` / `show at brief`, while that crew still clears rest by the
  latest show. Past the latest show it goes back to solid — see
  `engine-rules.md` §validation. Published as `WARN.dash[di][id]` (`dashOf`).
- `.puck.boxdot` — **the previous-day trace**, below.

`boxdash` and `boxdot` are `outline`s rather than `box-shadow`s: a shadow can
neither dash nor dot, and an outline is drawn outside the border box so the
puck's measured 74×15 is untouched.

**Three things make the strokes actually distinguishable**, and all three are
measured by `e2e/geometry.spec.ts` — jsdom applies no stylesheet, so vitest can
only prove which CLASS was emitted, never what it draws:

- `.boxdash` carries `box-shadow:none!important`. Without it the puck keeps the
  solid 1.5px ring `.puck.warn.hard` gives every hard flag, the dashes are
  filled in from behind, and a sanctioned late show renders as a fat solid red
  box — reported by the owner from the deployed site. `!important` because
  `.puck.warn.hard` and the AL marks (`.seat[data-alc] .puck`) both out-specify
  a two-class selector; `.boxred` already carries one for the same reason, so
  the two rings keep the same precedence over everything they sit on.
- `.boxdot` is **1.5px**, not 2. CSS `dotted` at 2px draws square dots, which
  around a 74×15 puck is very nearly the dashed stroke — three meanings with
  two of them looking alike is worse than having two. Half a pixel rounds the
  dots and reads as the lightest of the three, which is what it means.
- `.boxdot` sits at **`outline-offset:2px`**, because `.boxred`'s shadow
  spreads 2px and dots any closer are drawn inside the solid band and vanish.
  Its total reach is still 3px, the same as the dashed ring's, so it clears the
  3px gap between the two pucks of a crew pair.

### The previous-day trace: a standing MARK, an on-demand STORY

A crew-rest breach is raised on the day the man is **told to report**. The
only day a scheduler can still change is the one **before** — so that day
carries the mark, from the moment the week renders, with nothing clicked. It
used to appear only while the warning was focused, which meant the reader had
to already know about the breach to be shown its cause (owner, 6 Aug 26).

The three marks then split on how loud they are (owner, from the deployed
site, 7 Aug 26). The two on the PUCK stand; the PROSE does not. Several lines
of tomorrow's warning used to sit on a day whose own issue list was still
collapsed, so the day read as though it had a problem of its own — and the
count above it disagreed. The row now needs an ask; the ring and chip still
say *there is something here, and here is where to click*, which is the whole
distance between this and the pre-6 Aug behaviour it superficially resembles.

All three are drawn off `WARN.trace` (`engine-rules.md` §validation), so no
surface re-derives a word of the breach and none of them can go stale against
a focus that was never set:

- **The dotted ring**, on every puck of that man on the causing day. It is
  additive: `boxdot` is an outline and `boxred` a box-shadow, so a man with a
  conflict of his own here AND tomorrow's rest to answer for wears both.
- **The `CR` chip**, when the trace *leads* — `traceLeads`, i.e. he carries no
  louder chip of his own that day (a `Q` still outranks it and keeps its own
  caption; the dotted ring shows either way). Its title, and the puck's, name
  the day broken and the leave-by rather than the generic threshold label:
  the puck has no crew-rest breach of its own to caption, and printing
  `CHIP_LABEL.CR` beside the trace's own sentence would say so twice.
- **The cross-day row** — `.dwtrace`, and the only one of the three that is
  **on demand**. It renders when that day's warning list is OPEN (`DWOPEN`)
  or when a puck is clicked (`PFOCUS`, which narrows it to that man);
  otherwise `dayTraceHTML` returns empty. The gate lives inside that builder,
  not at its call sites, so a new caller cannot reintroduce the standing box
  by forgetting it.
  **It sits INSIDE the day's issue list, below the warnings and above the
  advisories (owner, 7 Aug 26)** — red business, but tomorrow's, so it ranks
  under this day's own hard rows. The `.dwtrace` container is
  `display:contents`, so the rows take the list's own gap, width and row box:
  matching the neighbours is structural, not imitated, and the identity is
  carried by the dotted red bar and the pink label alone (the old dotted
  outer border and private margins are gone). On a day with no list of its
  own the strip wraps as `.dwlist.solo` — same box, top border restored —
  and the puck is the only way in, which is why the ring and chip had to
  stay standing for this to be reachable.
  It stays deliberately **outside** the `⚠ N issues` count: these are not the
  day's issues, they are its consequences, and counting tomorrow's breach
  here would have two days reporting the same warning.

**The row focuses TOMORROW's warning but the view STAYS HERE (owner, from the
deployed site, 7 Aug 26).** The chip stopped navigating on 7 Aug (§Jumping),
so the row is the only affordance left, and it now does two things at once.
It still carries the NEXT day's `(di, ix)` — `traceIx` resolves it — so the
ordinary `.witem` handler focuses the real breach: it is that warning that is
selected, his pucks over there that light, and the `✕ Clear focus` that
appears in the breach day's open box. A `-1` from `traceIx` (the warning moved
under an edit — `WARN` is rebuilt wholesale) drops the row entirely rather
than addressing something arbitrary.

But the **pan** lands on the causing day, on the line that caused it. It used
to throw the week over to the breach day and centre the flagged leg — which
the row's own prose had already named, so the move bought nothing and cost the
reader the one thing they came for: WHICH sortie ran late, the only one still
movable. The row carries that address alongside the warning's:
`data-wpd` (its own day, taken from the builder's `di` so it cannot disagree
with where the row is drawn) and `data-wpk`, the causing leg's slot-key, which
the engine now publishes as `WARN.trace[…].fromKey` (`engine-rules.md`
§validation). `interactions.ts` hangs them on the focus as `panDi`/`panKey`,
and `scrollToWarnFocus` prefers them over `WFOCUS.di`/`.key` when they are
there — the ONLY case where the pan and the focus name different days.

The landing mark falls out of the existing machinery and is deliberately not
new: `warnFocusMap()` puts the focus's ids in `echo`, so his puck here wears
the dashed same-man-a-different-day stroke over its standing `boxdot`, and the
rest of the day dims. The owner declined a full warning highlight — it would
make the causing day read as having a breach of its own, which is the exact
confusion the 7 Aug on-demand change was made to remove.

Three fallbacks, all safe and all landing on the right DAY, which is more than
the un-overridden path managed: no `fromKey` emits neither attribute and the
row behaves as it did; a stale `panKey` resolves nothing in `anchorEl` and
takes `warnTarget`'s document-order heuristic **within the causing day**; and
the override is read only off the board, since `dayTraceHTML` is a `html.ts`
builder the board never calls.

**One rendering coupling follows from this**, and it is the only one: an edit
on day N that changes its crew-rest picture rewrites day N−1 too. The
day-isolation assertion in `probes/perf-port.cjs` names that exemption
precisely — any OTHER day changing is still the bug that probe was written
for.

## Stores configuration (owner, 7 Aug 26)

Under Remarks, each flying line carries an additive config set — **NAV · N/C
· 2 TKS · 3 TKS · TPOD · CL** by default, but the list is now the squadron's
own to add to, remove from, rename and reorder, not a fixed six. `STORE_CFG`
moved out of `ui/html.ts` into `engine/stores.ts` because it is persisted
state with save/load/reset, the same shape `rules` has — see
`docs/engine-rules.md` §Stores configuration for the storage side. This
section is the rendering and interaction contract.

**The `C` button, on both surfaces.** The week's old `+` picker (which only
ever *added a config to this jet* from a fixed set) is gone; `C` replaces it
in `html.ts` and is newly added to the board's `.sb-rcell` in `board.ts`.
Both carry `data-stcfg="<di.gi.li.ai>"` — the aircraft's slot key — and both
route through the same handler, `interactions.ts`'s `openStoresMenu`, so the
week and the board can never drift into two behaviours for one button.
**View-only shows the on-chips and no `C` at all** — `storesView()` (`ui/html.ts`)
renders read-only chips with no `data-stcfg`, called from the view builder
directly and from the edit surfaces whenever `HOOKS.editMode()` is false (the
board's `stoRO` gate is the same one every other control on a read-only board
now follows — §The scheduler board's panels).

**The popup lists every store, lit or unlit, not just this jet's leftovers.**
It is a body-level box (`.stmenu`, styled off `board.ts`'s `waveMenu`) rather
than a React node, so it can anchor to either surface identically and outlive
a `notify()` repaint of the row underneath it. Every store in `STORE_CFG`
prints as a button, `on` when `a.opts[key]` is truthy; clicking one toggles
`a.opts[key]`, calls `markEdit('st:'+key)` and re-paints the same box in
place — **the popup stays open across a toggle**, so a scheduler configuring
several stores on one jet does not re-open it each time. It closes on an
outside click — pen open or not, since 8 Aug 26; see the pen bullet — and on
any page change (`setPage` in `state/view.ts` sweeps body-level popups,
unhooking the box's document listener on the way, so navigating away can
never leave it floating over a page with no `C` button on it).

**Pinch-zoomed placement (owner, from the deployed site, 8 Aug 26).** On a
phone the `C` button is small, so the natural gesture is zoom in and press
it — and the box used to place itself in layout-viewport coordinates,
usually off the visible slice, forcing a zoom-out-and-hunt. When a real
pinch is on (`visualViewport.scale` comfortably past 1), `place()` centres
the box in the **visual** viewport — the slice of page actually on screen —
capped to fit it (inline `min-width:0`, or `.wavemenu`'s 250px floor holds
the box wider than the visible slice; height capped with scroll). Un-zoomed
placement is untouched: anchored under the live button, clamped to the
window. Gated in `e2e/geometry.spec.ts` — jsdom reports every rect 0×0, so
`place()` bails before the zoom branch is ever reached there.

**The pen (`✎`) inside that popup edits the LIST itself**, not this jet's
selection — a settings change, not a schedule edit, so nothing in the pen
branch ever calls `markEdit`:

- **Rename changes the label and never the key.** An aircraft's config is
  stored as `opts.tk2`, `opts.nav`, etc. — the label is display text a
  scheduler can retype at will (`renameStore`, `STORE_CFG[i] = [key, lab]`);
  the key is the only thing every jet's `opts` object actually points at, so
  it never moves. Renaming "TPOD" to "Targeting pod" does not touch
  `opts.tpod` anywhere it is set.
- **Removal never touches `a.opts`.** `delStore` splices the entry out of
  `STORE_CFG` and nothing else — no jet's `opts[key]` is cleared. Its chip
  just stops having a label to render against, so it silently drops off
  every remarks cell. Re-adding a store by typing its name back in restores
  every chip that was carrying it, with no separate undo path needed —
  `addStore` resolves the label against `STORE_STD` first and reuses THAT
  key when it matches, falling back to the freshly derived `storeKey()`
  only when it doesn't. This is not the same thing for two of the six: `2
  TKS`/`3 TKS` are shipped keyed `tk2`/`tks3`, which is not what
  `storeKey()` derives from those labels (`2tks`/`3tks`) — a mismatch that
  predates `storeKey()`'s derivation rule. Deriving blind used to strand
  every jet's `opts.tk2`/`opts.tks3` on an unreachable key the moment either
  was deleted and retyped (fixed 8 Aug 26, `engine/stores.ts`'s `addStore`
  comment has the full account, `stores.test.ts`'s
  "re-adding a deleted standard store" block pins it).
- **A single ✕ removes — no arm-step.** EDIT QUALS arms its six engine-read
  flags before letting them go, because removing one changes what a rule
  sees. Nothing in `validate.ts` reads a store (the module comment in
  `engine/stores.ts` says so directly), so there is no rule to protect and
  one click is enough.
- **A click away closes the box, pen open or not (owner, 8 Aug 26).** The
  dismiss used to be suspended outright while the pen was open, which left
  the ✎ as the only way out of an edit. What that suspension protected is
  kept as a narrower guard: a press that **starts inside** the box and ends
  outside it — selecting a rename field's text and overshooting the edge —
  dispatches its click outside the box, and the box notes the press
  (pointerdown on itself) and swallows exactly that one click. An
  in-progress rename is not lost to the close: pressing outside blurs the
  field first, and `change` (the commit) fires on blur, ahead of the click.

Each add/remove/toggle on the CONFIG side still flows through the mutation
funnel exactly as the old toggles did (`markEdit('st:'+key)` → pending →
next AL) — only the pen's list edits (rename/reorder/add/remove of the
squadron's own list) bypass it, because they are not a schedule write.

**The `.sb-rcell` one-grid-item contract.** `.sb-line`'s grid template
(`scheduler.css`) is fixed at nine columns; the board's flying line must
render exactly nine grid children or every cell after the first mismatch
shifts one column over. Before this feature the remarks cell was a bare
`<input>` — one child, one column. Adding the stores chips and the `C`
button without changing that count meant wrapping, not appending: `.sb-rcell`
is a flex column (`display:flex;flex-direction:column`) holding the remarks
input AND the stores span as its own children, so from the grid's point of
view the cell is still exactly one item. `.sb-bcell` (the B/brief cell,
wrapping its optional suggestion ghost plus the time input) is the precedent
this copies — same reasoning, same shape, added earlier for the same kind of
optional extra content. Get this wrong and the phone override
(`.sb-line .sb-rcell{grid-column:1 / -1}` under the narrow-viewport query)
mis-targets the wrong cell instead.

**Standalone (SC/AVALON/BB) lines carry no stores on EITHER surface —
identically (fixed 8 Aug 26).** `html.ts`'s `sa?'':stores` is deliberate: a
standalone line isn't a real jet loadout, it's a duty roster row wearing the
flying-line template, so it renders no chips, no `C` and no bombs field.
`board.ts` now computes the same `isStandalone(w)` gate per wave and wraps
its `.sb-rcell` stores content identically — before this fix the board had
no such gate at all, so a store set from a standalone line's `C` button
(which existed only on the board) marked `st:` pending, reached the AL and
the CSV, and could never be seen or removed from the week its own spec
requires it to render identically on. Gating hides only the CELL'S
CONTENT, never the cell itself — `.sb-rcell` still renders (with the
remarks `<input>` inside it) on a standalone line, keeping the nine-grid-item
contract above intact regardless of which branch fires.

**A stores edit on the board carries the same "edited, not published" mark
the week does (fixed 8 Aug 26).** The week puts `alAttr('st:'+key)` on
`.rmkcell`; `.sb-rcell` now carries the identical attribute, and
`scheduler.css`'s AL rule sets (`[data-alc]`, `[data-alp]`, `[data-aln]`)
were extended to include `.sb-rcell` alongside `.rmkcell` so the dashed
"edited" hint, the solid published-AL outline and the dotted preview all
paint on whichever surface the edit was actually made from — a scheduler
working the board no longer has to switch to the week to see their own
pending edit.

## The Quals page's editable columns

`CALLSIGN` heads the table (it is what every puck prints) with `INITIALS`
beside it; Add person takes callsign / initials / pilot-WSO / cat, and the
callsign is the only required field — first and last name are gone (owner,
Aug 26; the seed roster never carried them).

In edit mode callsign, initials and **flight** become inputs, and all three
commit on **change**
(blur / Enter) rather than on input: the table is an innerHTML string that
`notify()` rebuilds, so a per-keystroke commit would tear the field out from
under the cursor. Initials and flight are stored upper-cased — flight
because the column exists to be GROUPED by, and `a` on one row against `A`
on another would read as two flights. A callsign edit goes
through `renameCallsign` (see `engine-rules.md` §Who a row stores) which
rewrites the schedule's stored callsign strings so the pucks follow, then
re-runs `validate()` — warning text embeds the callsign, so skipping that
would leave the issue strips naming people by a name they no longer have. A
refused rename (blank / duplicate) puts the old value back in the box and
toasts why.

Seeded people have EMPTY initials on purpose — `engine/people.ts` carries
callsigns and never names, so there is nothing to derive them from. Do not
invent them. The same goes for FLIGHT: the roster records none, which is why
the column became editable when the headings learned to group by it (owner,
5 Aug 26). Type them in; do not seed invented ones.

## The Quals page's columns, sorting and View (owner, 5 Aug 26)

The qualification columns run in a fixed order — **SANS, SXO, SCHEDULER, SC
DAY, SC NIGHT, DAAR, NAAR, NVG, IMC, TF** — currency and appointments first,
flying qualifications after. `Downchit` was dropped: it was the last tick
column nothing read, and a downchit is an INPUT with dates (`isDownchit`),
which is what DNIF_FLY and the faded pucks actually key off. `TF` (terrain
following) is new, derived from nothing, held by nobody until it is ticked,
and read by no rule — a record, not a gate.

**DAAR and NAAR carry a THIRD state (owner, 10 Aug 26).** With editing on, an
**instructor pilot's** AAR cell loops `blank → ✓ → I → blank`. `I` means
cleared to instruct that AAR from the back seat; the rule it feeds is in
`docs/engine-rules.md` §AAR, and who may teach it.

- **Which cells.** `qualI()` — the key is `daar`/`naar` **and**
  `p.seat === 'FCP' && isInstrPilot(p.q)`. `isInstrPilot` alone is not the
  test: a WSO FI passes it, and a WSO holds no AAR at all (his cells are
  already struck `na`). Scoped to the two AAR keys by name, because a third
  state on a column no rule reads is a mark that means nothing.
- **The `I` rung is OFFERED only where it is legal, never offered and then
  refused.** A NAAR promotion refused mid-cycle would strand the cell — the
  tick could not reach blank and the loop would stop being a loop. So while
  DAAR is a plain tick, the NAAR cell simply behaves as two-state, and a
  toast says why. Pinned by `ui/quals.test.tsx`.
- **Markup.** The class stays `.qchk` — five existing assertions select on it
  — with `.qi` added and the glyph `I` in place of `✓`, plus a title spelling
  the mark out. The `aar-on` colour family is unchanged: `'I'` is truthy, so
  every on-class still lights.
- **Truthy on purpose.** The sort reads `I` as held, the CSV writes `I` where
  a tick writes `Y`, and every engine reader that asks "does he hold this?"
  keeps the right answer.
- **Removing the column never touches `p.quals`** (the existing `WIRED`
  contract), so an `I` survives a remove/re-add exactly as a tick does.
- **A CAT change out of the instructor ranks demotes the mark** to a plain
  tick, in `deriveQuals`. Silent, matching every other CAT-change effect —
  but not optional: the page would render a stale `I` as an ordinary tick
  while the engine went on honouring it.
- **Not persisted**, like every other tick on this page — see the closing
  paragraph of §EDIT QUALS.

**EVERY roster edit on this page re-runs `validate()`** (owner, 10 Aug 26 —
reported as "I change the back seat to qualified to instruct, the warning is
still there"). A qual is an INPUT to the rules: `daar`/`naar` drive the AAR
warnings, `scDay`/`scNight` the SC ones, and a CAT change moves the seat
rules, the crew matrix and OCU-without-IP. `notify()` only repaints, and the
pucks are painted from `WARN` — so a tick that did not re-validate left the
board showing a warning the roster no longer justified, until some unrelated
schedule edit happened to run the validator. That is what made it look like
"only editing the remarks triggers the engine". The tick, the archive ✕ and
the CAT dropdown all validate now; the callsign path always did. Initials and
flight do not, and need not — no rule reads them. Pinned in
`ui/quals.test.tsx`, both against a control with the calls removed.

**The headings sort; the Sort chips are gone.** One click sorts a column, a
second inverts it, and the sorted heading carries `▲`/`▼` plus `aria-sort`,
the same idiom as the Inputs table (they share `.insort` / `.inarrow`).
Callsign, initials and flight sort alphabetically with the blanks last;
**CAT sorts by seniority** (`QORDER`, most senior first), not alphabetically;
a **qualification column sorts by who holds it**, ticked above unticked. A
struck-out AAR cell — a WSO, who holds no AAR at all — counts as not held and
stays with the unticked rather than being lifted with the ticks. Callsign
breaks every tie, so equal rows keep a stable order.

`View` beside Export chooses **Pilots / WSOs / All**; All lists both under an
`Assigned aircrew` group head. The CSV export follows the screen — same view,
same filter, same sort — and the All export alone carries a `Seat` column,
since mixed rows no longer say which is which.

**Every CSV opens as UTF-8 because `csvText()` writes a BOM** (owner, 5 Aug
26). Excel does not sniff a `.csv`: with no byte-order mark it decodes the
file in the machine's ANSI codepage and prints each byte of a multi-byte
character as its own glyph, which is why the en dash in the struck-out DAAR /
NAAR cells arrived as `â€“` down every WSO row. The charset in the blob's MIME
type is a transport header and never reaches the file on disk, so the BOM is
the thing doing the work. `exportCSV` and `csvText` live in `ui/export.ts` and
are the ONLY exporter — the Quals page carried a private copy of `exportCSV`
until this fix, which is exactly how it came to miss the encoding; all three
exports (schedule, inputs, LoX) now share one function. Pinned by
`ui/export.test.ts`, which asserts the bytes rather than the glyph.

## EDIT QUALS — reshaping the LoX (owner, 5 Aug 26)

A second mode **inside** edit mode, admin only: `#qEditQuals` renders only
when the session is admin AND editing is on, and every delegated handler
re-checks all three (`canEditQuals()`) rather than trusting that a button was
once rendered. `Enable editing` itself is NOT admin-only — a member ticks
their own qualifications (owner, 5 Aug 26; the full split is in
`engine-rules.md` §Auth / roles). `Add person` stays admin, like this mode:
neither is the table's contents. It starts OFF each time editing is switched on, and `Save
changes` closes both.

The button reads the way `Enable editing` does (owner, 5 Aug 26): **blue
while it is the thing to press**, then plain dark and labelled `✕ Edit
quals` once you are inside the mode. It shows the way OUT rather than
lighting up to say where you already are.

While it is on the heading stops being a sort button and becomes the column:
it carries `data-col` and **no `data-sort` at all**, so a drag can never land
as a click that re-sorts the table under the hand doing the dragging. Each
heading gains a grip, a `.qlbl` label element and a `✕`.

- **Add** — the name becomes a key through `qualKey()` (letters and digits,
  lower-cased), so `Night SC` and `night sc` cannot become two columns over
  one flag. Held by nobody until ticked. A duplicate or a nameless entry is
  refused with a toast.
- **Remove** — `✕`. The six flags the engine reads (`sched`, `scDay`,
  `scNight`, `daar`, `naar`, `sxo` — see `WIRED`) **arm first**: the first
  press names what reads the column, the second removes it. Removing a column
  never touches `p.quals`, so the rule still sees whoever held it and adding
  the column back brings the ticks with it. If the removed column was the one
  being sorted by, the sort falls back to callsign.
- **Reorder** — drag a heading. This is the page's OWN pointer machine, not
  `drag.ts` (which stays scoped to pucks): pointer events so a finger works as
  well as a mouse, the implicit touch capture **released** on `pointerdown` so
  `pointermove` can report a new heading, `touch-action:none` on the heading so
  the browser does not claim the gesture as a scroll, and the drop highlight
  written straight to the DOM — a re-render would rebuild the innerHTML table
  under the moving finger and drop the drag. Only the drop itself sets state.

None of it is persisted, exactly like the ticks, initials and flights beside
it: reload and the LoX is the default set again. `rules` is still the only
thing this app writes to storage.
