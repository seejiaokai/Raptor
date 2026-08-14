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

Four things make it work, and each is load-bearing:

- **The reading is taken in `setPage`, before `CURPAGE` moves.** One line later
  React swaps which `.page` carries `on`, and `.page{display:none}` takes the
  outgoing week's layout away — there is no second chance to measure it.
- **It is captured on leaving EITHER week page**, not only on a straight
  view↔edit hop, so a detour through Inputs still lands you back on your day.
  A page with no week never overwrites a pending carry.
- **Closing the SCHEDULER BOARD writes the carry too** (owner, 10 Aug 26).
  `closeBoardState` sets `CARRYDAY` from `SBDAY` before clearing it, so
  tabbing to Thursday on the board and closing it leaves the week on Thursday
  rather than wherever it was parked. It is the same one mechanism, not a
  second one — a board close is just another producer. Guarded on
  `SBDAY!=null`: `closeBoardState` also runs on logout and on leaving Edit
  Schedule, where a write would scroll the next week somewhere nobody asked
  for, and would clobber a carry a page hop had just set.
  **And when `setPage` itself closes the board, the board's write WINS**
  (audit, 12 Aug 26): the leave-a-week-page capture below it used to
  overwrite the just-written carry with wherever the week UNDER the board
  was parked — the surface the user was not looking at. `setPage` now skips
  the geometry capture on exactly the switch that closed a board.
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

## The Inputs add form (`ui/InputsPage.tsx`, owner 10 Aug 26)

The form is a CSS grid, `.ingrid`: column 1 is a fixed 212px track owned
entirely by the calendar (`grid-row:1/span 3`), and the remaining eight fields
auto-flow into four `1fr` tracks as two tidy rows of four. **Anything added
here costs a grid cell and reflows those rows**, which is why neither of the
two 10 Aug additions took one:

- **The type legend** hangs off the Type `<label>`, not the grid. A `?` button
  opening `.tylegend-pop`, an anchored popover using the same pattern as the
  date-window picker (`.inrange`): local state, mousedown-outside close, Esc,
  `aria-expanded`, and a `position:static` phone fallback so it cannot hang
  off the edge. Its content is GENERATED from `INPUT_META`, so it cannot
  describe a rule the engine does not apply.
  **`.ifield label` sets `overflow:hidden` and `white-space:nowrap`** for its
  own 10px caps, and both are inherited straight into the popover — the first
  clipped it to a 10px strip, the second ran every line off the right edge.
  `label.withhelp` opts out of the clip; the popover resets the wrap. Neither
  is reachable from `npm test` (jsdom has no layout) — a screenshot found both.
- **The AM/PM span picker** REPLACES the all-day tick in the same cell rather
  than sitting beside it: `.ifield.span` where `.ifield.chk` used to be, four
  36px buttons so the row keeps its line. It is shown only for types whose
  table entry has `half` (leave and medical); everything else keeps the tick.
  The row editor mirrors it on the `.ined-ad` line.
  It writes only the two time fields the form already had, plus a `half`
  label — **no new engine input**.

All three type dropdowns (add form, filter, row editor) carry the same three
`<optgroup>`s, from `TYPE_GROUPS`/`typeGroup`. Twenty flat options is not a
list anyone can pick from.

## The Inputs table's view state (`ui/InputsPage.tsx`)

Owner, Aug 5. Three things, all view-only — none of them touches the model:

- **Window.** Opens on today → +`DEFAULT_SPAN_DAYS` (14) — the owner's 12 Aug
  26 rule; the `#inRangeDef` chip still restores the older, wider
  today → +`DEFAULT_SPAN_MONTHS` (2) window it is labelled after. Membership is
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

A removed row has no cell left to outline. It therefore appears in the
Amendments panel as an inert pending item, with the panel also stating how
many pending or issued items are removals. It never paints the row that moved
up into the deleted address. Schedule CSV export contains the resulting live
schedule, so the removed row is absent rather than exported as a phantom line.

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
(Item | Start | End | People | Rmks | ctl — **Duties says ROLE** where the
other two say Item, its own `C6_DUTY` header, owner 10 Aug 26: a duty row
names a job) and speak the ordinary grammar —
seats `d:di.wi.ri` / `s:di.kind.ri` / `g:di.ri` (+ `.xN`, fill `.+`), texts
`dl:/dr:/sr:/gr:` via `data-bfld` — so the board's generic arm/drag/change
handlers cover them with no extra wiring. Row mbtns: `dr*/sr*/gr*` cx
(CxDialog) / flag / del, `dwadd/dwdel/dradd`, `sradd`, `gradd` (board.ts).
Duty rows render in MODEL order, not `dutySort` — an editor whose rows jump
as a role is typed would be hostile. **Nothing re-orders a duty block on its
own** (owner, 10 Aug 26): typing a role into a blank cell used to reposition
the whole block, and that is gone. Auto sort / Sort all are the only movers,
and they order by START TIME, not role rank. `dwadd` opens a picker (which
wave is this block for) rather than pushing a bare block, and the ROLE cell
offers `DUTY_PICK` on click via `data-rolepick`. Ground rows render through
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
- **The top bar is ONE row, and the day is reached by SWIPING** (owner,
  11 Aug 26 — comp approved before build). It used to be four stacked rows
  and 166px of a 780px screen: the title, the seven Mon–Sun chips, then six
  buttons that `flex-wrap` folded onto two lines. It measures 70px now, and
  each move below is one of the owner's own asks:
  - **The chips became DOTS, and the strip is a SCRUB BAR** (the dots
    themselves 11 Aug 26; the drag the same day, owner: "the dots should
    allow me to drag to select the pages, like a drag bar"). Same seven
    `.sbday` elements and the same delegated `[data-sbtab]` handler, emptied
    with `font-size:0` — no node added or removed, so the board's DOM ceiling
    is untouched. A TAP still jumps straight to that day; a PRESS AND SLIDE
    runs through the week live under the finger (`wireDayDots`, `board.ts`).
    Three things that machine gets right and are easy to get wrong:
    **every day owns the same 16px footprint** and only the mark inside it
    changes (`::after`) — the obvious build, a 6px dot growing to a 16px
    pill, re-lays the strip out mid-scrub and shoves its neighbours up to
    10px sideways while the finger is tracking them, which on a 7-dot strip
    is more than a whole dot; **the strip is 21px tall, not 9** (`touch-
    action:none` as well, or the browser claims the horizontal drag for its
    own scrolling and the moves stop arriving halfway along) — that 12px is
    the whole reason the bar is 70px rather than 58; and **pointer capture is
    taken on the first real MOVE, never on pointerdown**, because capture
    retargets the following click onto the strip, so capturing up front left
    a plain tap arriving with no `[data-sbtab]` under it and doing nothing at
    all. It also eats the click after a scrub, which would otherwise re-apply
    whichever day the finger went DOWN on and undo the drag.
    Nearest-CENTRE, not a proportional map of the strip's width, so the same
    code works unchanged on desktop where these are still `Mon 13` chips of
    differing widths.
  - **`+ Line` left the bar for good.** It was the only control here that
    duplicated one inside the section it acts on — every wave header
    carries its own — and the top-bar copy had to guess which wave it
    meant (`addLine` appends to the day's LAST wave, a coin flip on a
    two-wave day). `addLine` itself stays: it is the probe bridge's
    `window.addLine`, which `sa-async.cjs` calls before any UI exists.
  - **`+ Wave` ALSO left the bar (13 Aug 26).** For the same reason `+ Line`
    did — a top-bar control belongs beside the section it acts on. It is now a
    section-level add button INSIDE the board, between Common Programme and the
    flying waves (`board.ts`'s `data-wvadd`, opening the same `waveMenu` kind
    picker), matching the `+ Block` / `+ Item` / `+ Row` idiom. The desktop
    edit-week page's `+ Add wave` (`#addGo`, `Shell.tsx`) went with it — the
    board is where a wave is created now, and it is reachable on desktop too.
    Withheld on `mvRO` (a frozen preview or a read-only board), which is what
    the old top-bar button's `disabled={DPREV.has(SBDAY)}` did. `addWave` itself
    stays as `window.addWave` for the probe bridge.
  - **Undo and redo joined it.** The board is a full-screen modal over the
    shell, so the shell's own pair is unreachable while it is open; every
    board edit had to be undone after closing it. Same two calls and the
    same disabled tests as `Shell.tsx`'s pair.
  - **Every label is hidden, not removed** (`.sb-top .bl{display:none}`),
    so desktop is untouched and each button keeps its accessible name.
    Scoped to `.sb-top` rather than `.sb-actions` deliberately: the title's
    own `· scheduler board` tail is a `.bl` too, and while it still painted
    it made the title ~140px wider than its box and pushed the button group
    onto a second row. `min-width:0` on the buttons matters for the same
    reason — `.abtn.hbtn` carries `min-width:76px` for the shell toolbar,
    and a min-width beats a width whichever rule wins the cascade.
  - **`today` is a dot, not a word** — it cost 46px of a 125px title and
    ellipsised the DATE, the one thing the owner asked the bar to keep.
  - **The DAY NAME is cut to three letters, by splitting the word rather than
    shortening it** (owner, 12 Aug 26 — "Seems like the Wednesday blocked off
    the date. Maybe use short form days"). The dot above bought the date back
    on Monday and lost it again on the long names: `.sb-title` is
    `white-space:nowrap; overflow:hidden; text-overflow:ellipsis`, so
    `Wednesday Jul 15` came out as `Wednesday Jul…`. `#sbDay` renders
    `dow.slice(0,3)` plus a `.bl` holding the rest, which means the SAME class
    every control on this bar hides by, one markup path, and a desktop that
    still reads `Wednesday` — the fix is in CSS that already existed, not in a
    second render. Three letters because that is what the day strip's dots and
    `dowShort` already use, so the bar and the strip cannot disagree. Sat and
    Sun collide at three letters, which is precisely why the date has to
    survive beside them. Pinned twice: `boardnav.test.tsx` has the DOM shape
    (jsdom paints nothing, and `textContent` reads the hidden tail, so a test
    written against it passes either way — assert `firstChild`), and
    `e2e/geometry.spec.ts` measures that nothing in the title is clipped at
    390px and that the whole word comes back at 1500px.
  - Measured by `e2e/geometry.spec.ts`, which counts ROWS as well as
    overflow: both regressions above fitted the width perfectly and simply
    used a second line.
- **AN EMPTY REMARKS BOX IS NOT DRAWN, AND THE ROW'S OWN "+" ASKS FOR IT
  BACK** (owner, 12 Aug 26 — UI sweep, "easy to view, spacious"). A c6r row
  (duty / sim / ground) ran 109px in FOUR stacked lines on a phone — role and
  times, people, remarks, control strip — and 13 of the 25 such rows on Monday
  carried nothing in the remarks line: ~30px apiece, 27% of the row, for an
  empty box. Measured after: 79px a row, and 400px off the whole board.
  - **`sbRmk` marks the box, CSS takes it away, and neither asks the
    viewport.** The builder adds `.empty` when the value is blank; only
    `scheduler.css` under 820px turns that into `display:none`. Rendering by
    `HOOKS.isPhone()` instead would make the panel's string diff depend on
    window size and not survive a resize — the same rule the grip and the ▲▼
    nudges already follow (`board-html.ts`'s opening comment). `.sb-wide`
    restates it back, because the desktop-layout-at-phone-width keeps every
    column.
  - **The reveal rides the control strip the row already has**, so an empty
    row LOSES 30px and gains nothing. A sixth button on an existing line is
    the cheap half of that trade; a fifth LINE would not have been.
  - **`RMKOPEN` lives in `state/view.ts`, not on the DOM.** Every panel is
    re-hung by a string diff, so a class the click handler set by hand would
    be wiped by the next repaint — the box would close under the finger that
    opened it. One key at a time, cleared on a real day change.
  - **Revealing it is NOT a schedule write.** No `afterSchedMutate`, no
    `markEdit`, nothing pending, no line in the changes list — a click that
    planted nothing and moved nothing must not appear in the day's history.
    `boardrmk.test.tsx` pins that explicitly, and the focus is deferred a
    macrotask because it has to land after the repaint that reveals the box.
- **The day is stepped by TWO ARROWS on the bar, and there is no swipe**
  (owner, 12 Aug 26 — "remove the swipe for the mobile scheduler board too. Just
  put arrows at the edges of the bar at the top to navigate left and right
  between days"). `#sbPrevDay` / `#sbNextDay` call `boardDayStep(±1)`, which is
  `boardTab` with the week's ends clipped.
  **They are DISABLED at the ends of the loaded week**, not toasting at a finger
  that has nowhere to go — the same shape as this bar's undo/redo pair, and
  something the swipe could never do: a gesture has no way to show it is
  refusing, so it needed a toast to explain itself.
  **They flank the DAY STRIP, not the bar's first line, and that is the one
  liberty taken with the ask.** Line one is the title plus eight 30px buttons
  with 6px of slack at 390px, so a pair of arrows there could only come out of
  the day name — which is down to ~107px and is the thing the bar exists to keep
  (the 11 Aug rule: nothing joins this bar without something leaving it). The day
  strip is the row that is ABOUT picking a day, it is 21px of mostly empty width,
  and its two ends ARE the screen's edges, which is what was asked for.
  `.sb-nav` is the wrapper that holds the full-width second line
  (`flex:0 0 100%; order:2`, taken over from `.sb-days`) and
  `justify-content:space-between` pins one arrow to each edge with the dots
  centred between them. `.sb-nav .sb-days` must reset `order:0`: `.sb-days`
  carries `order:2` for the days when it was itself the wrapped line, and inside
  `.sb-nav` that same property sorted the dots after BOTH arrows (measured as
  ‹ › then the dots).
  **Cost: the bar went 70px → 75px**, measured at 390px, from a 26px control on a
  21px row. Nothing was taken off the first line. The geometry gate's bound moved
  70/78 → 75/82 and still blocks the regression it was written for — a second row
  of 30px buttons, which would put the bar past 100.
  **Above 820px the arrows are not drawn at all** and `.sb-nav` is
  `display:contents`, so `.sb-days` stays a direct flex item of `.sb-top` and the
  desktop bar is byte-for-byte what it was: it carries all seven days as chips,
  which is why it never needed a swipe or an arrow. `.sb-wide` (the desktop
  layout AT phone width) keeps the arrows but groups them around the dots instead
  of pinning them to the row's ends, because `.schedboard.sb-wide>*` is 1180px
  wide and pans — "the edges of the bar" there would put the two arrows most of a
  screen apart.
  **The dots stay, and they are still a scrub bar.** They are the only thing that
  says WHICH of the seven days is open, which is the one job a pair of arrows
  cannot do. A tap still jumps straight to a day; press and slide still runs
  through the week.
  **A scrub never starts under a finger already holding a puck** (audit,
  12 Aug 26). A day change repaints the panels, which detaches the node
  `drag.ts`'s touch machine is carrying, and its drop would then resolve
  through `elementFromPoint` against the NEW day's markup — a plant on a day
  nobody aimed at. `wireDayDots` asks `touchDragBusy()` and declines the
  gesture; the drag keeps it. The reverse needs no guard, because a finger
  landing on a puck mid-scrub is non-primary and `onPointerDown` already
  refuses those.
  **A scrub needs a button down** (audit, 12 Aug 26). Capture is deferred to
  the first real move, so a mouse press that slipped off the strip early
  could release where the strip's up listener never hears it — `live` stayed
  armed and a bare HOVER then scrubbed the week. `wireDayDots`'s move
  handler (and `wireParkedRosScroll`'s, the same hole on the drawer handle)
  now drops the gesture the moment a mouse moves with no primary button
  down. Touch is untouched — implicit capture already delivers its up.
  **A day change commits and closes what belongs to the day being left**
  (audit, 12 Aug 26; `boardTab`). A focused `data-bfld`/`data-ifld` input is
  blurred — and its `change` said by hand where the engine does not fire it
  on teardown (jsdom, historically WebKit) — so a half-typed value lands on
  the day it was typed on instead of nowhere; the stores popup and a pinned
  History bubble are taken down rather than left describing the old day
  (the Sort-all confirm deliberately survives — it names its day).
- **THE SWIPE IS GONE — do not rebuild it** (12 Aug 26). It was an owner ask on
  11 Aug and it went through three shapes in a day and a half: a jump when a
  distance threshold was crossed; then a carousel where the live board tracked
  the finger behind a preview pane, settling on distance or velocity; then that
  carousel again with its hit-testing, its interruptible settle, its
  distance-scaled animation and a phone-only gate. Each round fixed what the
  previous one cost, and the owner replaced the lot with two buttons. Everything
  it needed went with it, and the removals are the contract now: no
  `wireBoardSwipe`, no `.sb-pane`/`.sb-peek` preview, and **no `touch-action` of
  its own on `.sb-main`** — the scroller is back to the browser's default, where
  `overflow-x:hidden` means there is no horizontal axis to hand over and
  pinch-to-zoom is not a property this rule has to remember to name.
  `wireParkedRosScroll` went back to `.sb-main` and to judging travel on the
  vertical axis alone, both of which it had only grown in order to share a finger
  with the carousel. What the swipe leaves behind that is worth keeping is
  written down where it applies: the hit-testing trap is in `../HANDOFF.md`
  §The gates, and the day-only notification lane it shares with the arrows is
  the next bullet.
- **A DAY-ONLY NAVIGATION DOES NO SCHEDULE WORK** (`boardTab`, unchanged since
  the carousel and now the arrows' one call). It changes view state and uses a
  board-only notification lane; it does not run the full-week rules engine and it
  does not wake EditWeek or EditRoster behind the board, whose existing DOM stays
  available to the stale-markup safety paths. Every actual schedule mutation
  still uses the global lane, validates normally and repaints both the mounted
  week and the board. Pinned by `src/ui/boardbackground.test.tsx` (the board lane
  fires once, the global lane not at all) and by `boardnav.test.tsx`.
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
  shape.
  **Parked, it must not swallow a vertical scroll** (owner, 11 Aug 26 — a
  screenshot of a drag down the right-hand edge that moved nothing). The
  sliver is 30px wide over a band 429px tall on a 780px screen, right where
  a thumb rests, and a drag starting on it scrolled NOTHING: measured at 0px
  against the 264px the same drag gets two finger-widths to the left. The
  cause is not this app's — a `position:fixed` element hands its touch scroll
  to the VIEWPORT rather than to the overflow ancestor it sits inside, and
  the viewport cannot scroll here because `.schedboard` is `fixed; inset:0`.
  Both CSS levers were tried against the real build and neither moves it:
  `touch-action:pan-y` (the browser is willing to pan, but there is nothing
  to pan) and `position:absolute` against `.schedboard` (stays pinned,
  chains no better). So `wireParkedRosScroll` (`board.ts`) drives
  `.sb-main.scrollTop` from the drag by hand, and the handle takes
  `touch-action:none` **while parked only** so the browser leaves it the
  whole pointer stream — with `pan-y` the browser claims the gesture and
  fires `pointercancel` after one move, which stops the forwarder dead at
  18px of 264. Open, the drawer must NOT be `none`: the crew list owns its
  own scrolling then. Both halves are asserted in the geometry gate, because
  either alone silently breaks the other. What the forwarder does not
  reproduce is momentum — the board stops when the finger stops. A tap
  travels ~0px, so it scrolls nothing and still toggles the drawer.
  **And a scroll must not OPEN it** (owner, 11 Aug 26 — "after I move the bar
  at the top and tried to scroll vertically I can't"). That was the reported
  fault and it is a two-step trap: the browser's tap slop is generous —
  measured on the real build, a drag of up to 15px still fired a click — so
  starting a scroll on the handle opened the drawer, which then covers 58% of
  the width over a crew list with all of 39px to scroll, so the NEXT drag
  moved nothing. It reads as the board having seized rather than as a panel
  having opened over it. The forwarder already knows the finger travelled, so
  a gesture that scrolled anything eats the click the browser fires
  afterwards; under 6px is left alone, because a deliberate tap wobbles and
  that is still a tap.
  **The top bar is a sibling of the scroller, so no drag anywhere on it
  scrolls the board** — the dots included. That is ordinary fixed-header
  behaviour, not a fault, and it is why `.sb-days` can take
  `touch-action:none` for its scrub without costing a scroll. **Open, it now starts BELOW the top bar and is thinner** (owner,
  11 Aug 26): it used to be `top:0`, painting over the day, the undo pair
  and ✕ Close — the controls a scheduler reaches for while the palette is
  open — and `max-width` came down from 78vw to 64vw, which still clears the
  165px two puck columns need and gives the board back 55px. The offset is
  `--sb-topH`, published by a ResizeObserver on the bar in `SchedBoard.tsx`.
  Two simpler answers are wrong and were both measured: anchoring the drawer
  to `.sb-main` with `position:absolute` looks right (it IS the box below
  the bar) but `.sb-main` is the phone board's SCROLLER, so the drawer
  scrolled away with the day and `bottom:0` stretched it to the full 7.8k px
  scroll height, breaking the plant-from-the-drawer path outright; and
  reading the bar once in a render effect landed 5px short, because the
  effect runs before the bar's final reflow. Both were caught by the
  geometry gate, not by eye. A SUCCESSFUL fill parks the drawer so the puck is seen landing:
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
| `Unavailable` — leave, medical (HL/OML/ATT B/ATT C), OD | ✓ | ✓ |

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
pending and reaches the next AL. Undoing a Ground promotion uses an inert
deletion key rather than re-marking the address now occupied by a shifted row.
Filing under Unavailable has no row key, so it uses one inert input-action key
for every loaded day the input spans; unfiling does the same. These keys count
and publish in the Amendments panel but paint no unrelated cell.

## Editing an input from the schedule (owner, 10 Aug 26)

Build two of the leave-types work: times, type, remarks and delete, reachable
from Edit Schedule and from the schedule board, writing back to the Inputs
page. The commit is the Inputs page's own — both call `commitInputEdit` /
`removeInput` in `ui/inputedit.tsx`, so the accepted-row relink, the
validation and the single undo step cannot drift between the two surfaces.

Two audit fixes on the relink itself (12 Aug 26): **re-filing falls back to
any covered loaded day** — an Unavailable-filed input whose span STARTS
before the loaded week has no loaded start date, and the relink used to read
that as "moved outside the programmed week" and silently unfile it on a mere
remark edit; it now re-files onto the first loaded day the span still covers
(mirroring `markInputDays`). And **what a scheduler added to the promoted
ground row by hand — extra crew in `more`, the red flag, a CX — survives the
relink**: the row is still regenerated from the input, but those three are
captured before the unaccept and put back after the re-accept, instead of
being silently discarded by any edit, including a member retouching their
own remark.

**The times and the remarks are ORDINARY CELLS** (owner, 10 Aug 26 — "edit the
input directly like changing the start and end time... no need to open a new
window... in the same modality as ground programme"). On the week they are
`contenteditable` cells beside the ground rows' own; on a live board the two
input panels draw their rows as `sb-arow c6r` — literally the ground
programme's row, same seven tracks under the same header, including the
leading GRIP track, which an input row keeps even though it cannot be dragged
(the phone rule hides `.sb-grip` specifically, so a bare `<span>` standing in
for it ate the phone's 1fr ITEM column and shunted every field one track
left). A read-only board keeps the compact `.sbi-row`.

They carry `data-inp` (week) and `data-ifld` (board), NOT `data-txt` /
`data-bfld`: an input is not schedule data, has no funnel key, and commits
through `setInpField` -> `commitInputEdit` -> `writeInputsBatch` rather than
`txtSet` / `markEdit`. A refusal heals the cell from the model, exactly as a
rejected `txtSet` does.

**Clearing a time means all day.** That is what `awayAllDay` already believes,
so the cell and the rule agree without a third control. It is deliberately
asymmetric with filling one in — TYPING a time defaults the other end to the
edge of the day, because an all-day row has nothing in either cell and without
that default typing a start would do nothing. The symmetric "clear both" rule
was built first and was unusable: the first clear defaulted the other end, so
the pair was never blank at once and all-day was a one-way trip. The AM/PM
label is DERIVED on commit — a window that lands exactly on a half gets it,
anything else drops it — so a printed "(AM)" can never describe a window that
is no longer a half.

**Every input carries `iid`**, minted at creation (`mintInpIds` at boot,
`add()` on the Inputs page) and never changed. The cells cannot be addressed
by position — `add()` unshifts, so raising one input renumbers every other —
nor by `inpKey`, which is built from the very fields they edit. Minting it
lazily at render was the first cut and was wrong: a snapshot taken between
creation and first paint held no id, so an undo back to it handed back a row
that then minted a different one.

**What is left behind the TYPE LABEL** — still a `<button>` via `inpEditLabel`
— is the type and delete: the two that cannot be a text cell in these rows.
That it is the label and not a button beside it is a layout decision as much as
a UX one: all three shapes that put a separate button in the row cost the row
height at one width or the other (an extra grid child wraps onto its own line;
an absolute button with the remark padded clear of it, and a 20px track of its
own, both make a remark one word off the boundary wrap — measured at 27px to
39px on "Medically down till 17 Jul").

`e2e/geometry.spec.ts` §editing an input from the schedule holds both halves:
the Unavailable rows on the edit week against the same rows on View-only (a
row may cost a few pixels for a tappable cell — measured identical on desktop,
+3px on a phone — but never a LINE), and an input row's first four tracks
against a ground row's, at both widths.

Each block says what is typeable once — `times and remarks type in place ·
clear a time for all day · press the type to change it` — rather than every
row carrying a hint it has no room for; half the squadron is on a phone, where
nothing is discoverable by hover.

**Who gets it:** `ed`, i.e. `HOOKS.editMode()` — a scheduler on Edit Schedule,
and a board that is neither a preview nor read-only. View-only Sched draws the
Unavailable block too and stays inert. The handler in `routeClick` re-checks
`canEditSched()`, because the gate is the write path and not the markup.

**The dialog** (`InputEditor`) is a sibling of the shell and the board in
`App.tsx`, where `CxDialog` sits, so it paints above whichever surface opened
it. It holds the input OBJECT, never an index or its content key: undo stays
live underneath it and renumbers `INPUTS`, and the key is built from the very
fields the dialog exists to change. A refusal (bad window) keeps it open with
the typing in it; the one exception is a row that has gone from under it,
where there is nothing left to hold the typing for.

**The two time boxes are 130px, and that is measured, not chosen.** Chromium
renders `<input type=time>` in the BROWSER's locale, which on en-US is a
12-hour field — at 110px it drew `12:00 A` with the marker cut off, found on
the deployed page after every gate was green. Nothing else can catch it: the
truncation happens inside the field's own shadow DOM, so `scrollWidth` reads
108 against a 110px box and reports no overflow. The width is pinned in
`e2e/geometry.spec.ts`. (The Inputs page's own pair get away with 78px
because they stretch to the form column; this dialog sizes its own.)

**Person and dates are NOT in it**, and the footer says so. The four fields
the owner asked for all keep the row on the day it was opened from; moving it
to another man or another date makes it vanish from the surface being looked
at, which is the Inputs page's job.

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
- Arm-and-plant (rewritten 13 Aug 26, owner): an empty OR PLACEHOLDER-FILLED
  slot arms — a placeholder means "someone still needed here", so its puck
  goes straight to finding them, while a real person's puck still selects.
  A palette tap ALWAYS plants: a darkened name plants too, its reason toasted
  after, mirroring drag ("everything plants, warning after") — the one
  refusal left is the seat's own occupant ("Already in that seat"). Changing
  board day disarms. While armed, a darkened name PRINTS its reason on the
  list itself, because a phone has no hover and the owner's rule is that the
  scheduler sees the problem BEFORE the tap: under the name (`.rwhy`), or
  ONCE under a column header when every barred name in that column shares
  one reason (a front-seat arm bars every WSO identically, and fifteen
  copies of one sentence tripled the drawer).

## The Available-crew panel folds (owner, 13 Aug 26)

The edit week's per-day Available-crew block boots COLLAPSED to its header
line — "Available crew · N all day · +N night · N SANS ⌄" — and the header
(`data-avtog`) toggles it per day (`AVOPEN` in `state/view.ts`, session view
state in the DWOPEN pattern, cleared on a session change). Expanded, the
grouping is unchanged but a wave line counts EVERYONE who can fly that wave —
its own partially-free leftovers PLUS the all-day crew — because the old
leftovers-only count printed "— none free —" over a wave 22 people could fly,
which the owner read as a bug (the panel was lying, not the engine). The
collapsed root keeps `.availpuck`, so drop-to-unassign still works closed.
The default week render fell 5099 → 3621 nodes with the fold, and the perf
gate's week ceiling was LOWERED to 4000 to pin the win (`probes/perf-port.cjs`
carries the argued comment). Gated in `e2e/geometry.spec.ts` ("the
Available-crew panel folds") and `ui/editweek.test.tsx`.

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
once and that a single Undo reverses all of it together. **Its body also
has to say that whole waves and duty blocks MOVE** (owner, 11 Aug 26): the
per-section buttons only ever tidy rows inside one block, so a scheduler
who has learned what `⇅ Auto sort` does would not otherwise expect the
flying panel to reorder itself. That outer reordering has no `⇅` of its
own anywhere — there is no one section to hang it on — so this dialog is
the only place the behaviour is announced before it happens. Confirming calls
`sortAllCommit()`, which is the one place `HIST.lock` brackets a whole run
of sorters (`engine-rules.md` §Sorting a board section); cancelling or
clicking outside the box just drops `SORTALL` back to null. An already-tidy
day still gets a toast — "Already in order" — rather than the confirm
dialog closing silently.

## Flag colour IS the tier (owner, 10 Aug 26)

"7 should be red, its a warning. B, should be amber, they are advisories.
including the rings." Red means the rule is raised **hard**; amber means
**adv**; grey means **note**. Nothing else may decide it.

**And GREEN is none of them (13 Aug 26):** a green ring on a SLOT is
eligibility — "the selected person can be planned here" (`.oktake` /
`.oktake-f`, §Selection highlight) — never a tier. No severity may ever
paint green, and the eligibility rings may never borrow red, amber or grey.

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

**Selection also rings where the man could GO (owner, 13 Aug 26).** In edit
mode, `paintSelRings` (`highlights.ts`) rings every slot the selected person
could take, judged by `slotBar` — the palette's and the drop warning's own
oracle, so the three cannot disagree: solid bright green with a glow
(`.oktake`) on an empty slot, dimmed green with a tint (`.oktake-f`) where he
would take over from someone, nothing where a reason bars him, and his own
seats stay bare. Green is eligibility, never a severity (§Flag colour IS the
tier), and SOLID on purpose — dashed stays the armed ring's identity, and an
armed element keeps its own ring. Answers are memoised per selection against
WARN's identity (every mutation revalidates, so the memo cannot go stale);
the rings are outline-only — no nodes, no layout, so the hold-still contract
below is untouched — and the paint is edit-mode only: view-only never rings,
and neither does a selected placeholder (nothing bars a placeholder, so its
rings would mean nothing). Pinned in `ui/selrings.test.tsx` (the DOM agrees
with slotBar on every slot) and `e2e/geometry.spec.ts` (the paints are
distinct and move nothing).

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

## Duty templates (owner, 13 Aug 26)

`+ Block` under Duties opens the TEMPLATE picker — a `.wavemenu` popup listing
the saved templates (`DUTYTPL_CFG`), an "Empty block", and a ✎ that opens the
editor. No wave is consulted (that coupling is gone); picking a template copies
its rows onto the day as a plain block (`board.ts`'s `blockMenu`, minting
through `blockFromTpl`). The editor is `ui/DutyTplModal.tsx` — a `.modal`
opened by `TPLEDIT` (`pops.ts`), mirroring `UserModal`: tabs per template + New,
an editable title, and one `.trow` per role with a `DUTY_PICK` datalist,
start/end, ▲▼ reorder and delete; Reset / Delete / Done in the foot. Every edit
runs the matching `engine/dutytpl.ts` mutator → `dutyTplSave()` → `notify()`,
so it persists per-device like the stores list. The library is never left
empty — deleting the last template re-seeds one. Storage and the plain-block
rule: `docs/engine-rules.md` §the duty block. This surface replaced the old
wave-driven desk.

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

`View` beside Export chooses **Pilots / WSOs / Personnel / All**; All lists
them all under an `Assigned aircrew` group head. The CSV export follows the
screen — same view, same filter, same sort — and the All export alone carries a
`Seat` column, since mixed rows no longer say which is which (personnel read
`Personnel` there).

**Personnel (ground crew) get their own table (owner, Aug 26).** Under the
`Personnel` view — and, keyed on `p.pers`, in any view they appear in — a
personnel row draws its callsign, initials and flight exactly as an aircrew row
does, then leaves **every column from CAT rightward blank** (no CAT chip, no
qualification ticks: they hold none), and its **Remarks cell is an editable
free-text `<input>`** bound to `PEOPLE[id].remarks` — the one place person-level
remarks exist. It commits on change (blur/Enter), like the initials and flight
beside it, and no rule reads it, so it only re-renders. `Add person` offers a
**Personnel (ground crew)** seat option; picking it hides the CAT select and
mints a `pers:true, q:''` record. The group head reads `Personnel (ground
crew)`. Pinned by `ui/quals.test.tsx`.

**The palette carries a third column, `Personnel`, shown only when the squadron
has some** (`palette-html.ts`) — a squadron with no ground crew never sees an
empty column. A personnel puck is **white** (`.puck.pers`) with no CAT chip. It
is struck the moment a FRONT seat is armed (via `slotBar`) and offered for a
rear seat, a duty desk, a ground row or a sim. Rules: `docs/engine-rules.md`
§Personnel.

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

## History on the board (owner, 11 Aug 26)

A view mode on the scheduler board: with it on, a detail says who changed it,
when, and what it was. Rules and the log itself: `docs/engine-rules.md` §The
edit log.

**One button on the top bar (`#sbHist`), and no editMode() gate.** Unlike
Sort all and `+ Wave` it is a READ, so it stays on a read-only board — a
scheduler looking at someone else's day has more reason to ask who changed
something than the person who changed it. `HISTMODE` lives in `state/view.ts`
(session-scoped, not persisted, cleared by `resetSession`), and the board wrap
gains `.hist-on`, which puts `cursor:help` on the amendment marks already
there. No new per-cell markup: the cells that carry history are exactly the
cells `alAttr` already marks, and a second badge would be a node each against
the board's DOM ceiling to say the same thing twice.

**That equivalence is a promise, and it was broken for the first day.** The
`cursor:help` follows the amendment mark, so a cell that was edited says
"ask me" whether or not anything ever reached the log — and six fields marked
themselves without logging a value, so a stores chip invited a hover and then
said nothing. Fixed at the writers (`docs/engine-rules.md` §The edit log, "the
five fields that write their own model"). **A new cell that marks itself must
log a value too, or it re-opens exactly this hole.**

**Two gestures, on purpose.** Desktop hovers; a phone TAPS, and the tap still
does its ordinary job. `histbubble.ts` registers on `.sb-boardwrap` in the
**capture** phase — `boardArmClick` calls `stopPropagation()` the moment it
arms a slot, so a bubbling listener never sees the one tap most worth
explaining. It calls neither `preventDefault` nor `stopPropagation` itself,
and the bubble is `pointer-events:none`; those two together are the whole
guarantee that History never turns the board read-only. Both are pinned —
the arm in `histbubble.test.tsx`, the CSS value in `e2e/geometry.spec.ts`,
which is the only place a computed style can be read back.

**One bubble, at body level.** Not one per cell (the DOM ceiling counts every
node under `#sbBoard`) and not inside a panel (the string diffs re-hang those
mid-hover). It is anchored above its cell where there is room and below where
there is not — a phone tap opens the keyboard too. On scroll it **re-anchors
rather than hides**: hiding was the first version and it broke the desktop
hover outright, because bringing a cell into view scrolls the panel and that
scroll lands after the mouseover it caused.

**Clamped into the VISIBLE viewport, not just the layout one, on both
edges.** `place()` reads `window.visualViewport` where the browser has one,
because a phone keyboard shrinks and pans that viewport while
`position:fixed` still means LAYOUT coordinates — without this the bubble
could be correctly placed by CSS and still sit above the strip of page the
keyboard has left visible. Both the top and the bottom are clamped: the
re-anchor-on-scroll path above only ever clamped the bottom, so an anchor
scrolled above the top of the screen sent the bubble off the top of it, with
nothing to stop it — exactly the path a pinned jump from the changes list
reaches, since it scrolls the cell in after the bubble is already up.

**Hidden, not torn down, while its anchor is entirely off-screen.** An
anchor with no part inside the viewport has nowhere truthful to point from,
so `place()` sets `visibility:hidden` rather than leaving stale coordinates
on screen. Every scroll re-runs `place()`, so the bubble comes back on its
own the instant the anchor does — no new gesture needed, and nothing has to
notice and re-raise it. Tearing it down instead would have broken the case
that reaches this path directly.

**It stacks UNDER every box that can open over the board** — `z-index:430`,
above `.schedboard` (400, the only surface it anchors to) and below `.drawer`
(440), `.airpop` (460), `.modal` (470) and the wave/stores/role menus (480).
It shipped at 500, above the lot, and on a phone it stays up for several
seconds after the tap that raised it — so tapping a detail and then opening any dialog
left the bubble sitting on top of that dialog. That was found once, with the
changes list, and patched at that one call site with an explicit
`hideHistBub()`; the other seven boxes still had it. **Fix the stacking, not
the call sites** — a list of hide calls drifts the moment someone adds a box,
and `pointer-events:none` means being underneath costs the bubble nothing,
since it is never a click target. The explicit hide before the changes list
stays as tidiness (a bubble hanging over the board behind an open list is
clutter), not as the thing that stops it covering anything. Held by
`e2e/geometry.spec.ts`, which is the only place a computed z-index can be read
back.

**The cell's own tooltip is parked while the bubble is up** and handed back on
the way out. `alAttr` puts `title="Edited — not published yet"` on precisely
these cells, and the browser would pop it over the top a second later saying
less. Parked in JS rather than suppressed in `alAttr`, which is in
`refwin.ts`'s byte-compare path.

**The changes list is NOT a second bar button, and that is measured.** Two new
controls took the phone bar from 70px to 92px — the day name wrapped onto a
line of its own, exactly the failure CLAUDE.md's "do not add a control back to
this bar without taking one off" describes. It opens instead from a line under
the day's checks panel (`[data-histopen]`, `boardWarnHTML`), which shows only
while History is on — the owner's own phrasing was "when I enable history,
there is ALSO an option to view the history of all edits". It sits OUTSIDE
`.sbwrap`: that wrapper folds shut by default on a phone and hides every
`.wln`, so an entry inside it would be invisible until you opened a panel
about something else.

**One control did have to change to fit the eighth button**, and it is the one
the phone bar's own comment already promised: `.sb-title` was `flex:0 1 auto`,
whose auto basis makes the title's base size its full text width, so `.sb-top`
wrapped it instead of shrinking it. `flex:1 1 0` takes it out of the wrap
decision, and the day name ellipsises as that comment says it should. Bar
measured back at 70px with eight buttons. Desktop is untouched — the rule is
inside the 820px block.

**The list** (`HistoryModal.tsx`) is the ordinary `.modal` idiom, string-built
body, newest first, whole week by default with a filter for the open day.
Its footer states plainly that it is per-browser and per-session; that
limitation is on the surface rather than in a document nobody opens.

### The second pass (owner, 11 Aug 26)

Five changes, after he used the first version.

**The way in is TWO buttons and CSS picks one.** `.histln-top` rides at the
head of `#sbBoard`, above the sign-off bar, and is the desktop one;
`.histln` stays on the day's checks panel and is the phone one, because that
bar has no room and the checks panel is already first in that scroller. Both
are always rendered and a media query hides one — a builder asking
`HOOKS.isPhone()` would be stuck on the wrong answer after a resize until
something else triggered a repaint, and the panels are string-diffed, so
nothing does until an edit lands. One extra node against 63 of headroom is
the cheaper side of that trade. Which one is visible, and that the top one
really is above the sign-off bar, is measured in `e2e/geometry.spec.ts`.

**A row jumps to the detail it names** (`jumpToChange`, beside `jumpToWarn`,
which is the same shape). The list closes first — on a desktop it is a
centred modal over the board, so a jump behind it would move something the
user cannot see. Then the day changes if it has to, the cell is scrolled to
the middle, and its bubble opens **expanded and pinned**. A structural entry
carries no key and no cell, so it renders as a plain row rather than as a
button that would do nothing, and a key whose row has since been deleted
toasts rather than failing silently.

**A row is a button only where the board can SHOW that detail** — `histJumpable`
(`histbubble.ts`). Five families are edited somewhere the board cannot answer
for: `ar:`/`at:` (the area and area-time strip) and `it:` (in-times) render on
the week only, `tr:` (traffic) is typed into a modal with no cell anywhere,
and `wl:` (the wave label — audit, 12 Aug 26) IS on the board but as the
title of a `[data-wsel]` `<select>`, which is none of the cell attributes
`findHistCell` reads, so its jump could only ever toast an untruth.
They still LIST; they just offer no jump. This is deliberately a different
question from `findHistCell` returning null, and the two must stay apart: a
missing key means either "the row was deleted since" (worth saying) or "never
drawable here" (where "no longer on this day" is simply untrue). A new key
family the board does not render wants a line in `NO_BOARD_CELL`.

**A bubble never outlives the row it describes.** `histBubRecheck()` re-anchors
it where its cell still exists and takes it down where the cell has gone. It
runs on every scroll and resize — the board moves under a fixed bubble — and,
since 12 Aug 26 (audit), on every panel REPAINT, called from `SchedBoard.tsx`
after the string diff: a repaint replaces a panel's markup wholesale, so a row
deleted from another surface used to leave a pinned bubble telling a deleted
row's story from stale coordinates until some later scroll noticed.

**PINNED beats every rule that would take the bubble away** — the desktop
mouseout, the phone timeout. It goes on the next click anywhere that is not
the bubble. Without this the jump would have been undone by the pointer
leaving the cell it had just arrived at.

**Grouped by detail is a VIEW, not a filter**, so it sits beside the day
buttons rather than inside them. One row per detail, newest-touched first,
unfolding to every change to it **oldest-first** — the flat list is
newest-first and deliberately the opposite, because the two answer different
questions ("what just happened" against "how did this end up like this"). A
detail changed once is a plain row, not a fold that reveals the line already
on screen. Both the grouping and the day filter reset when the list closes.

**Collapsed is the last THREE changes, not one — chronological, oldest
first, the same order the expanded list keeps.** A collapsed bubble that
only ever showed the newest edit hid the ones right before it; three is
enough of the story to be useful without becoming the same 290px sheet the
chevron exists to avoid. The collapsed slice is the TAIL of the story, not a
re-sorted feed: the last line shown is always what the detail says now, and
expanding prepends older lines above it rather than reordering under a
reader's thumb. Desktop skips the collapsed view entirely — a pointer
already resting on the cell has committed to reading it, so hovering shows
the whole story straight away, under the same `.hb-all` scroll
(`max-height:40vh`) a long history gets once expanded.

**The phone expands the bubble with a control inside it** (`.hb-more`,
`[data-histmore]`). The bubble itself stays `pointer-events:none` — that is
the contract that keeps History from turning the board read-only, and it is
still pinned by the geometry gate. The control is a CHILD with
`pointer-events:auto`, so the thing that takes a tap is a 24px button you aim
at rather than a 290px sheet lying over the board. Phone only, and only PAST
THREE changes: with three already showing there is nothing hidden yet, and a
desktop pointer already has the whole story from hovering, so a chevron
there would be asking for a click to get what it already gives. Its click is
handled on the DOCUMENT in capture (`histbubble.ts`), because the bubble is
body-level and the board wrap's own listeners can never see it.

**The clock carries the date** — `11/8 14:32`, always, not just once "today"
has stopped being true. The rows are about SCHEDULE days, so a bare `14:32`
beside `Monday` invites being read as a time on the Monday being planned.

## The page behind the board does not scroll (owner-reported, 11 Aug 26)

"I could scroll and see the edit schedule board leaking into it, and in the
end I was controlling the edit schedule board view at the bottom."

The board is `position:fixed; inset:0; z-index:400`, but the shell behind it
stayed a live scrolling document — on Edit Schedule that is ~3600px of week.
Two separate holes let a finger reach it, and both are closed:

- **`.sb-main` had no `overscroll-behavior`.** It is the phone board's ONE
  scroller, so a swipe that reached its end CHAINED to the page. The aircrew
  drawer's list has carried containment since 8 Aug 26; the main scroller
  never did.
- **The top bar is in no scroller at all**, so a drag there went straight to
  the document whatever `.sb-main` does. `body.sb-lock{overflow:hidden}`, set
  from `SchedBoard.tsx` while the board is open, is what covers that — and it
  covers the desktop too, where a wheel over the bar did the same thing.

Measured before the fix at 390px: **2400px of page scrolled away under an open
board** — and identically on the build before History shipped, so this is an
old fault that heavy phone scrolling surfaced, not a new one.

**The scroll position is captured and restored by hand** when the lock comes
off. `overflow:hidden` happens to preserve it in Chrome and Safari today, but
it is not guaranteed to, and dropping the scheduler back at the top of the
week after every visit to the board would be a worse bug than the one being
fixed. Restoring a value that never moved costs nothing.

Held by `e2e/geometry.spec.ts` §the board holds the page still underneath it,
at both widths — jsdom has no scrolling, no chaining and no computed
`overscroll-behavior`, so this is not reachable from `npm test`. The
containment assertion is skipped where `.sb-main` does not scroll (the desktop
layout), because pinning a value that does nothing there would be theatre.

**Not to be confused with the week's COLUMN moving.** Closing the board leaves
the week on the board's day, so a week parked on Wednesday and a board opened
on Monday comes back to Monday. That is the day-carry behaviour, it predates
this, and it is unchanged — measured on both builds.
