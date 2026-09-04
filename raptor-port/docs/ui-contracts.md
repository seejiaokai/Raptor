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
  **One exception, deliberate (owner, 3 Sep 26 — "faster on a slow
  computer"): the EDIT week and crew palette are built ONCE in browser idle
  time after a scheduler-admin login, while the View page is showing**
  (`EditWeek.tsx` `idleOnce`/`canWarm`). Opening Edit Schedule used to build
  both from nothing on a cold JIT — 2.4s at 4x throttle, 7.8s at 8x — so the
  first click now finds the week standing and the per-day diff writes only
  what changed since. It is a single build, never a repaint-while-hidden: the
  gate above still holds for every store tick. The warm builds with
  `HOOKS.editMode()` answering as the edit page will (`asIfEditOpen`), so its
  strings are byte-identical to the live paint's and nothing is thrown away
  on open; it skips scroll landing, peek nodes and highlights (the live open
  does those on a visible week). Gated on `requestIdleCallback` existing —
  jsdom and the parity harness have none, so they never warm. Members never
  warm (no Edit tab). Pinned in `ui/editwarm.test.tsx`.
  **And the edit page is PARKED, not display:none, while another page is
  on** (`#page-editsched:not(.on)`: in flow, height 0, clipped, visibility
  hidden) — a display:none subtree has no layout, so the warmed week would
  still pay its whole first layout on the click; parked, it is laid out at
  its real width during the idle build and the click reuses it. Every other
  page stays display:none. visibility (not pointer-events/inert) is the
  hidden state: unfocusable, no hit-test, out of the accessibility tree.
  Pinned in `e2e/geometry.spec.ts` ("warmed and parked laid-out").
- **A store tick with the week calendar CLOSED measures nothing** (same
  cut). `WeekCal` used to compute its opening month on every render, which
  read all seven day boxes' rects per tick — a forced layout of the dense
  week on every drop for a value nothing used. The seed is read once in the
  state initialiser and again only when the calendar opens. Pinned in
  `ui/editwarm.test.tsx` ("measures no day box").
- **The Leave War screen is its own download** (same cut): `Shell.tsx` loads
  `LeaveWarPage` with `React.lazy`, so a Raptor visit ships ~38 KB gz of JS
  and ~11 KB gz of CSS less, fetched on the first click of the tab. Only the
  screen — the store, demo world and sync wires still boot in `main.tsx`, so
  every cross-app sync is untouched. Pinned in `e2e/geometry.spec.ts`
  ("not downloaded until its tab is opened").
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
- **Motion is THREE entrances and nothing else** (owner, 25 Aug 26 —
  critique follow-up, approved scope "only do the motion"): pages fade in
  (`pagein`, opacity ONLY — an animated transform on `.page` would make it
  a containing block for `position:fixed` descendants for 150ms), the
  scheduler board slides up (`boardup`, keyed on `:not([hidden])` so
  `sb-wide` toggles never replay it), and the toast fades via an inline
  `transition:opacity` plus a WAAPI rise (`toast.ts` — the keyframes carry
  the base `translateX(-50%)`, and the call is guarded by the InputsCal
  idiom: `typeof animate === 'function'` + reduced-motion matchMedia,
  try/caught so motion can never eat a toast). The single off-switch for
  the CSS half is the blanket
  `@media (prefers-reduced-motion:reduce){*{animation/transition:none!important}}`
  — its `!important` beats even the toast's inline transition; only WAAPI
  needs the JS guard. Do not add scattered hovers/entrances beyond these
  three without an owner ask. Pinned in `e2e/geometry.spec.ts` ("the motion
  set") — including that reduced motion really computes `none`.
- **The phone day-head is TWO FIXED ROWS on every day** (owner, 25 Aug 26 —
  "Because of the word today, the layout is not the same … keep it
  similar"): row one is the title + date (+"· Today") with the turn-pattern
  badge at the right edge; row two is Templates/Drafts left and the
  status/publish cluster right, pinned by `order` + a full-width
  `.day-head::before` break in scheduler.css's `max-width:820px` block (the
  view page, with no Templates span, keeps the same shape). Before this,
  the wrap point followed the title's width, so the Today day shuffled its
  controls onto different rows than every other day. Desktop keeps one
  row. Pinned in `e2e/geometry.spec.ts` — an e2e pin on purpose: the fix
  first landed in the WRONG media block and no jsdom test can see a media
  query.

## The day carries across a page switch (owner, 9 Aug 26)

View-only Sched and Edit Schedule are **two separate horizontal scrollers** —
`#vWeek` and `#eWeek` — each holding its own `scrollLeft`. Reading Thursday on
one and switching to the other used to drop you back on Monday. It is the same
week, so it is now the same day, **in both directions**.

Nothing in the model knows where a week is parked, so the reading is geometry:
`state/view.ts`'s `weekLeftDay()` returns the day whose LEFT edge sits nearest
the view's own left edge — the exact inverse of `scrollWeekToDay`, which parks
a day's left edge there. (Until 22 Aug 26 it named the first day with any
sliver still past the edge — the day mostly scrolled OFF — which is why the
aircrew panel showed Wednesday while the scheduler looked at Thursday; the flip
between two days is at their midpoint now.) `pan.ts`'s palette follow reads
through the same function — shared, not copied, so the two can never disagree
about which day you are on.

## The aircrew panel's day is pickable, not only scrolled to

The aircrew panel (`EditRoster`) shows ONE day's crew — `paletteDay()` =
`ARM.di` when a slot is armed, else `ROSDAY`. `ROSDAY` follows the scroll
through `rosDayFollow` (the `weekLeftDay` reading above). But **the left-most
day is not always reachable**: on a wide screen several day boxes share the
viewport, and the last days of the week can never be scrolled to the left edge
— Sunday is the final day and clamps the scroll, so a slice of an earlier day
stays pinned to the left and the panel follows THAT day, not the ones being
looked at. So the day is also PICKABLE (owner, 15 Aug 26):

- **The day NAME is a crew-day button** (`html.ts`, edit week only —
  `.dow.crewday[data-crewday]`; the DATE `.dt` keeps `sb-open`/`data-sbday` and
  still opens the scheduler board). Clicking it points the panel at that day.
  This is a deliberate divergence from the reference, whose whole day-head
  opened the board; `html.test.ts`'s `normDow` maps the port's `.dow` back to
  the reference's before the byte-compare, and the split is pinned positively
  beside it.
- **The panel header carries ‹ › arrows** (`palette-html.ts`,
  `.er-daynav[data-crewstep]`), disabled at the week's two ends, so a day the
  week cannot scroll to is still reachable. Drawn only when NOT armed (an armed
  slot pins the panel to its own day). Absent on the board, which passes
  `{head:false}` — the header, and so the arrows, render on the edit week alone.
- **An explicit pick WINS over the scroll-follow** (`pan.ts:pickRosDay`). Both
  the click and the arrows route through it: it cancels any queued follow and
  suppresses a new one for ~0.5s, so the scroll the pick settles into cannot
  drag the panel back to the edge. After the window lapses an ordinary scroll
  takes over again — scrolling still sets the day, a pick just outlasts the
  settle.
- **The edge hint is retired** (23 Aug 26 — was `pan.ts:maybeCrewHint`,
  `.crew-hint`). It taught the day-name/arrow controls because the last day
  could never sit at the front of a wide screen; the next-week preview's real
  columns removed that limitation, so the hint's firing condition (jammed at
  the end with a later day off the front) became unreachable and the
  machinery was deleted. The controls it pointed at are unchanged.
- **The desktop week ends on a WHOLE day, not a sliver** (owner, 23 Aug 26 — the
  arrows "totally skip Saturday and Sunday … Friday should be nicely aligned on
  the left … it jumps to Monday immediately"). A wide screen shows 3–4 columns,
  so the week's own width clamped with a MIDDLE day pinned left as a fraction and
  the › arrow crossed weeks off that broken edge. `pan.ts:setWeekTail` measures
  the live day step and viewport and sizes a trailing spacer (`.week::after`,
  `--week-tail`, desktop only) so the end rounds UP to the last whole-day view
  (Fri | Sat | Sun, earliest flush left, no sliver and no empty void); the ›
  then walks one clean day per click and only rolls into the next week PAST that
  stop. Since the next-week preview (23 Aug 26) the spacer measures the FULL
  column strip — live plus preview — so the far end of the free scroll is a
  whole column too, and the very last live day CAN now sit at the front
  (which is why the edge hint above is retired). The "day a–b of n" read-out
  (`pan.ts:dayRangeText`) counts from the day step, never `scrollWidth ÷ n`,
  because the spacer is part of `scrollWidth`. Gated in `e2e/geometry.spec.ts`.
- **The desktop arrow glide cannot be cancelled mid-day** (owner, 23-24 Aug 26 —
  the recurring "arrows don't go day by day … stuck halfway then zoom past", and
  its 25 Aug follow-up "make sure it's not just an easy fix"). `panDays` fires a
  `scroll-behavior:smooth` glide; TWO other paths could write the week's
  scrollLeft while it was in flight and an instant write CANCELS a smooth scroll,
  freezing the strip between two days — and the next arrow, counting from the
  commanded target, then skipped one. Measured on the built app the two together
  swallowed about one arrow press in seven under load. Both are now closed by a
  short glide window `pan.ts` arms on every arrow press (`glideEnd`, cleared the
  instant the glide lands or on any manual pan/scrollbar grab): (1) the proxy
  scrollbar's `onTrackScroll` is a pure FOLLOWER during that window and never
  drives the week — the older position-only `trkEcho` guard could not survive a
  `scroll` event the browser coalesced or deferred under load; and (2) a
  within-week repaint that fires mid-glide (a debounced palette-follow `notify`)
  holds the glide's DESTINATION, not the captured mid-glide position — `panHold`
  in `EditWeek`/`ViewWeek`. Pinned in `pan.test.tsx` (a track scroll cannot drive
  the week mid-glide; `panHold` returns the target during a glide and the live
  value otherwise). The `e2e/geometry.spec.ts` stepping check reads with the
  animation neutralised — under headless the smooth scroll itself can fail to
  start or stall, which is a harness artifact, so the browser test isolates the
  stepping LOGIC and the glide robustness is the unit-test's job.
- **The desktop crew panel keeps its day + column headings in view** (owner,
  23 Aug 26 — "when I scroll down the top of the day is hidden"). Inside the
  `.edit-board .eroster` scroll box the "Aircrew · <day>" line and the
  "Pilots/WSOs/Personnel · N free" column labels are `position:sticky` (day line
  at top, columns 27px under it — the day line's measured height), so a
  scheduler deep in a long pilot list keeps both which day and which column.
  Desktop only; the phone palette is a short pull-out drawer. Gated in
  `e2e/geometry.spec.ts` (jsdom has no sticky positioning).
  The stuck day line paints an opaque cap 10px ABOVE itself
  (`box-shadow:0 -10px 0 0 var(--panel)`, owner 26 Aug 26 — "this bleeding of the
  pucks behind the day … opaque it"): the panel's 8px top padding used to leave a
  sliver there where the first pucks showed through as the list scrolled. A shadow
  keeps the header's box height fixed, so the 27px column-label offset stays exact;
  the panel's `overflow` clips the cap to its rounded top edge.
- **The desktop aircrew column can be HIDDEN, sliding off to the right** (owner,
  26 Aug 26 — "hide the placeholders list on the right of edit scheduler and it
  just animates to the right side"). A fixed rail at the viewport's right edge
  (`.ros-rail`, in `Shell.tsx`'s `.edit-board`, `data-roshide`) toggles a bare
  `body.ros-collapsed` class — the same session-only, repaint-surviving idiom as
  the phone drawer's `ros-open` (`interactions.ts:routeClick`). Collapsed, the
  `.edit-board .eroster` leaves the flow (`position:absolute` inside a
  `position:relative` `.edit-board`) and slides off past the right edge on a
  `.24s` transform transition, and the week (`flex:1`) reclaims the freed ~250px.
  **`position:absolute` with `top:auto`, not `fixed`** — that keeps the column at
  its STATIC vertical position so only the horizontal transform animates. An
  earlier `position:fixed;top:8px` yanked it ~300px UP to the viewport top before
  sliding, and back DOWN on expand: the "flying above then below" the owner
  flagged (26 Aug 26). **And the `[data-roshide]` handler pins the column's
  on-screen Y as an inline `top` at the moment of collapse** (cleared on expand):
  the resting column is `position:sticky`, so mid-scroll its pinned top sits
  hundreds of px from its static position, and `top:auto` alone teleported it up
  off-screen before the slide (measured top 8 → −888 at scrollY 1200; found in
  the 26 Aug bug pass). With the pin, the slide plays exactly where the eye last
  saw the panel at any scroll; expand clears the inline top so sticky takes back
  over. The rail is a slim BLUE vertical `CREW` tab styled
  off the phone drawer's accent tab and sat HIGH on the right edge (owner, 26 Aug
  26 — "make it like a blue side panel similar to the mobile one, labeled as crew
  … put it higher"); it rides the reserved right lane (`.edit-board` keeps a
  `padding-right` for it) so it never overlaps a day column's controls, and its
  chevron flips `›`→`‹`. The rail is
  `position:fixed` so it never rides the roster's own vertical scroll, and it
  lives inside `#page-editsched`, so it is absent on every other page and on the
  phone (`display:none` under 820px — there the palette is already a pull-out
  drawer). Edit scheduler only: View schedule has no roster, and the board's own
  roster is a separate `.sb-side` panel. Pinned in `editweek.test.tsx` (the class
  toggle) and `e2e/geometry.spec.ts` (the real slide + width reclaim).

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
- **The All day tick opens OFF for a "Duty & other commitments" type, ON for
  everything else** (owner, 22 Aug 26). A brand-new input re-seeds its All day
  state from `defaultAllday(type)` on every type change: the timed group
  (Training, CSE, Meeting, Fly with, Personal, Appointment, Duty, OD, Other)
  starts UNTICKED with the 06:00–18:00 window live, because those are
  commitments the aircrew states real hours for; leave, medical and **SANS
  Availability** keep All day ON. It is a default only — a user is free to
  re-tick it, and an existing record's saved `allday` is never touched. Same
  default drives the board's + Inputs / + Add seed (`interactions.ts`) and its
  dialog's type dropdown (new adds only), so the two entry points agree.

All three type dropdowns (add form, filter, row editor) carry the same three
`<optgroup>`s, from `TYPE_GROUPS`/`typeGroup`. Twenty flat options is not a
list anyone can pick from.

- **A member's Person is a value, not a choice (owner, 22 Aug 26).** The
  full-roster `#inPerson` select renders for a scheduler only; a member sees
  the view-as callsign printed plainly (`#inPersonFixed`, `.inper-fixed` —
  on the same 36px control line, deliberately not boxed, so it cannot read
  as a dead control; a one-entry dropdown would only pretend to be one, the
  SANS fixed-type precedent). It follows the topbar's View-as LIVE, and so
  does the commit — `add()` reads `ME` at write time (`filedFor`), never
  the mounted state. The row editor draws the same line: a member's open
  row prints its person as text where a scheduler gets the select. The
  rule and its write-path backstops: `engine-rules.md` §Auth / roles.

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

## The Inputs page speaks one day-first date voice (owner, 21 Aug 26)

"Standardise the way the inputs are shown … change the modified date to show
day month year." The page reads dates DAY-FIRST everywhere now, and every row
card is the same compact shape.

- **Two display helpers, in `ui/inputedit.tsx`.** `fmtDay(iso)` → a day-first
  label ('2026-07-13' → '13 Jul'), this year's year left implicit and any other
  kept ('2027-01-03' → '3 Jan 2027'), the same rule `fmt` follows. `fmtDMY(iso)`
  → the Last-modified stamp, day-month-two-digit-year ('2026-07-06' → '6 Jul
  26'), matching the app's own week voice ('13 Jul 26'); `'now'` (this session's
  edits) and a blank pass through. **Display only** — the model still stores the
  month-first `'Jul 13'` labels `fmt`/`unfmt` round-trip, so `unfmt`, the stored
  `date`/`endDate`, dateOrd and inputCoversDate are all untouched. The one
  storage caller (`fmt(start)` when Add writes a row) is deliberately left
  month-first.
- **The row's date/time is de-duplicated.** A same-day TIMED input carries its
  whole span in the Start cell — '13 Jul 10:00–11:00' — and an EMPTY End the
  card hides (the `data-same` marker now fires on an empty End, not a repeated
  one), so the date reads once. An all-day one-day input reads just '13 Jul'; a
  span (all-day range, or a timed input crossing midnight) keeps Start and End
  as two cells joined by the '→', and the desktop table's two columns with it.
- **The phone card is a GRID of aligned columns (owner, 22 Aug 26 — "align
  the reason, then the date… below the callsign u can put the remarks").**
  `scheduler.css`'s ≤820px block lays each read row out on
  `grid-template-areas` over three fixed-start tracks — callsign 70px (sized
  to "Sidewinder", the roster's longest), type chip 90px (sized to
  APPOINTMENT once SANS wears its short form), date the rest — so every chip
  and every date starts at the same x on every card, which the old flex-wrap
  (each card's own chip width pushing its date around) never did. A
  multi-day End sits UNDER the Start in the same date column; remarks (LATE
  chip leading) are their own full-width line below the callsign;
  the modified stamp closes the card (the Recurring column left with the
  repeat-weeks feature, owner, 22 Aug 26). The DOM keeps the desktop
  table's column order — tests address Name and Start by td position — the
  grid areas do all the visual reordering. The desktop table gained
  per-column `th` widths in the same pass (identity/metadata narrow, Start
  wide enough for a one-line timed span, Remarks takes the slack) — fixed
  layout dealt equal columns before.
- **The SANS chip has a phone short form.** 'SANS Availability' is the one
  type label too wide for the aligned chip column, so its chip is split the
  board day-name way — `SANS Avail` + a `.bl` tail (`ability`) hidden under
  820px — one markup path, the chip reads SANS AVAIL on a phone and the DOM
  text stays the raw type string every test and the export read.
- **The row actions are PINNED top-right.** On a phone the `✎ ✕` pair is
  `position:absolute` in the card's corner with an 88px right reserve, so a long
  timed date can no longer shove them onto a second line — the owner re-blessed
  the pair and the modified stamp on 22 Aug 26 ("the icons… are aligned").
- **What is deliberately unchanged.** The schedule and board still show their
  own '`Jul 13`' day labels (reference-locked, a different kind of date — the
  week-grid column, not a record's stamp). The CSV export keeps the raw stored
  values (machine-friendly for a spreadsheet). The History list's own
  day/month + time stamp (`elogWhen`) was already day-first.
- **Pinned in** `src/ui/inputsfmt.test.tsx` (the two helpers, a rendered row
  of each shape — same-day timed, all-day one-day, span — the modified stamp,
  and the SANS chip's `.bl` split) and `e2e/geometry.spec.ts` ("the phone
  Inputs cards align their type and date columns" — the page's first e2e:
  chip and date columns line up across cards, remarks sit below the callsign,
  the SANS tail is display:none at 390px). jsdom paints 0×0, so the grid
  itself is only provable there and by eye on the live bundle.

## The board's text boxes wrap and grow (owner, 20 Aug 26)

Every FREE-TEXT field on the board is a `<textarea rows="1">`, minted by the
one builder `board-html.ts:boxHTML`. An `<input>` cannot wrap its value at any
width — the overflow scrolls out of sight inside the box — so the element had
to change, not just the CSS. `field-sizing:content` does the growing (the
`.sb-nbox` precedent since 13 Aug 26, degrading to a one-line box where it is
unsupported, never to a broken tall one); `overflow-wrap:anywhere` breaks a
single long unbroken word instead of letting it run out of the row.

**TIME cells stay `<input>`.** `0715` has nothing to wrap and the guard rails
already refuse anything that is not a time. `boxHTML` decides by CLASS
(`atm`/`tm`), so a caller keeps passing the class it always did. Pinned in
`boardwrap.test.tsx` and in the geometry suite — this exclusion is the thing a
later "consistency" pass is most likely to remove.

**Enter still COMMITS, and Escape now restores.** An `<input>` fired `change`
on Enter by itself; a `<textarea>` inserts a line break instead, so
`routeKeyDown` carries a `[data-bfld],[data-ifld]` branch that blurs on Enter
(the blur fires the same `change` the board has always written on) and puts the
model value back on Escape. Shift+Enter is deliberately left alone. So a line
break can only ever arrive by PASTE — which is why `boxHTML` emits a leading
newline: an HTML parser discards exactly one newline after `<textarea>`, and
without it a pasted value starting with a blank line would lose it on every
repaint.

**`line-height:12px` is a measured number, not a preference.** An `<input>` at
font-size 11px lays its content box out at exactly 12px, so only that leading
keeps a one-line box at the old 24px. At the browser default every box on the
board stood 2px taller and the day grew 115px of scroll, bought for rows that
are not wrapping at all — which is most of them.

## The board's remarks boxes align with the flying line (owner, 20 Aug 26)

A duty/sim/ground (`c6r`) row's Rmks box starts at the same x as the flying
line's, and is the same width — 154px, right-aligned, at every phone width,
because the flying line's own cell is three fixed 46px time tracks plus two
8px gaps. The phone `c6r` grid carries a fourth 50px track for it and spans
the Role/Item cell across the first PAIR, which is what leaves row 1
(Role | Start | End) pixel-identical.

**Common Programme rides the same `c6r` grid** (owner, 22 Aug 26 — reversed the
earlier "all except common programme"): its old Detail/location column was
dropped and the row collapsed onto `c6r`, so on a phone its remarks box aligns
with the flying line exactly like the duty/sim/ground rows. There is no longer a
`.cprog` shape — every board list is `c6r`. Pinned by e2e.

That span is applied BY POSITION (`:nth-child(2)`), not by class: every c6r row
reserves a leading grip track, so child 2 is always the name cell — but a
duty row puts a `.ain` role box there while a personal-input row puts its type
LABEL there. Selecting `.ain` misses the input rows and leaves their Start box
in the spacer track, misaligned with the ground programme rows above them.

## Inline text editing (`ui/textedit.ts`)

Enter commits (everywhere, including sim notes), Escape restores the model
value, drift is healed in place from the model rather than by a rebuild.
The BOARD's own boxes get the same two keys — see the wrapping contract
above; before 20 Aug 26 they had Enter only, and only because they were
`<input>`s.

Most strings commit through `[data-txt]` → `txtSet` (the funnel). FOUR
fields live outside that grammar and each need their own focusout branch —
all four were missed in the port at some point and silently discarded
edits, so check this list when a field "won't save":
`[data-intimes]` · `[data-bombs]` (stores text) · `[data-area]` ·
`[data-atime]`.

**The stores free-text box confirms its save** (owner, 26 Aug 26 — "no
indication or feedback that when I type in free text on config that it's
accepting my input… idk if it's saved or not. But it's actually saved").
A commit that CHANGED the load pulses the box green for a beat
(`.stsaved`, a 1.2s ease-out to transparent); an untouched tab-through
saved nothing and shows nothing. The flash has to survive the commit's own
deferred repaint, which rebuilds the span: `textedit.ts` flashes the live
node AND records the address in `STSAVED` (`state/view.ts`, self-expiring),
and both builders — `html.ts`'s week and `board.ts` — re-add the class
while that window is open. Reduced motion falls under the global
`animation:none` rule and simply shows the settled box. Pinned in
`stsaved.test.tsx`. The other three out-of-grammar fields deliberately do
NOT flash: they are ordinary-looking table cells whose text visibly sticks
in place, where this box is a dashed chip that looks least like a field —
the one the owner couldn't tell had saved.

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

## In-time lines: added and removed per wave (owner, 21 Aug 26)

"Allow me to input lines at the top of each wave where I can reflect the in
time likewise to be able to edit or delete it." Before this, the in-time
block could only be TYPED IN: deleting the last line dropped the whole box
out of the DOM with no control to bring it back (undo was the only way
home), and there was no way to add a line at all — Enter commits, so a new
span could never be minted from inside the contenteditable.

- **"+ In time" renders on every non-standalone wave, in edit mode only,
  whether or not the wave currently has lines** — the always-there add
  control IS the vanishing-box fix. Week: an `.airbtn` in the wave tab
  beside Traffic (`html.ts`). Board: an `.mbtn add` in the wave header's
  control cluster (`board.ts`). Standalone waves (SC/AVALON/BB) are
  excluded on both surfaces AND re-checked in the handler: they are shifts,
  not sorties, and a typed in-time there would silently move
  `waveWindows`.
- **Each line is its OWN contenteditable span (`data-itline`), with an
  ordinary ✕ button (`data-itdel`) beside it — outside any editable region**
  (reworked the same day on the owner's iPhone: the first cut put the ✕
  inside one shared contenteditable block, where iOS would not reliably tap
  it, and typing in the shared block let WebKit clone a span so the
  span-scrape committed the same text twice — the owner's duplicate-line
  report). `textedit.ts` commits ONE line at a time off `data-itline`
  (empty → the line is deleted and its DOM pair removed at once, so the
  remaining ✕ positions stay true until the deferred repaint), which makes
  any stray span WebKit mints invisible to the commit. Enter commits,
  Escape restores the model's line. The wrapper keeps `data-intimes` (the
  history bubble anchors on it) but is not editable itself; the `.iedit`
  grid pairs each line with its ✕. The ✕ handler resolves its index by DOM
  POSITION within the block, falling back to the minted attribute only for
  an element with no block around it.
- **Both writers ride the existing `it:` key** (`routeClick` in
  `interactions.ts`, guarded `canEditSched() && HOOKS.editMode()` like every
  model-writing branch): `markEdit('it:di.gi', was, now)` — so the AL diff,
  the changes list, undo and the issued-mark reconcile read exactly as a
  typed edit does. The engine needed no wiring: `intimeMap`/`waveInTime`
  parse the `w.intimes` strings themselves, so a line is registered the
  moment it carries a time.
- **The minted line is engine-neutral**: it seeds with the wave's own
  derived in-time (`waveInTime` — earliest line, else earliest T/O, its
  exact fallback) as `HHMMH: IN TIME + WX/NOTAMS`, so the stated number is
  the one the engine already assumes; a wave with no derivable time seeds
  the bare phrase, which parses as nothing until a time is typed. NO
  callsign, deliberately: `<CS> IN TIME` is the phrase that sets a
  formation's report time (`intimeMap`), and the button must not pick a
  jet nobody chose. After the repaint the caret lands at the end of the
  new line (the LogicPage deferred-focus idiom), scoped to the surface the
  button was tapped on.
- Deleting a line by clearing its text still works (the focusout scrape
  drops empties — unchanged); the ✕ is the phone-first path. The ✕ toasts
  what went; the add answers with the focused caret instead of a toast.

Pinned in `intimesadd.test.tsx`; the reference-parity divergence is lifted
by `noItCtl` in `html.test.ts` (all three additions are edit-mode-only, so
the read-only compare needed nothing).

## Amendment marks on screen

**An amendment mark is a PUBLISHED-day thing — a draft day shows none** (owner,
25 Aug 26 — "if I have not published the schedule yet, don't show all the orange
dotted lines … only once published does an AL-coloured mark make sense"). A mark
says "this differs from the issued document"; before a day is published nothing
has been issued, so a pending edit is ordinary draft work and marking it as an
amendment misleads. So `alAttr(key)` emits `data-alc="n"` (published in AL n) for
an issued change, and for a PENDING edit emits `data-alp="1" data-aln="n"` ONLY
when the day is published (`dayApproved`) — the `nextAL()` it will go out as; a
pending edit on a still-DRAFT day emits **nothing at all**. The edit is still
TRACKED in `SCHED.pending` (the day-head "N pending" count, the publish flow and
History are unchanged — History finds a cell by its own key + the edit log, not
by this attribute), it just carries no visual mark until the day is published.
Pucks and the area/time/rmk/in-times cells get outlines and an ALn tag; every
other inline-edited string gets an AL-coloured underline + tag once published.
Pending marks split by surface (owner request, Aug 26): on `#eWeek` and
`#schedBoard`, `data-aln` items are painted DOTTED in the upcoming AL's colour
(solid means issued, dotted means coming); the view-only page keeps the neutral
dashed hint for a published day's pending edit (no text-level mark). `data-aln`
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
sev/chip rings, no `data-slot`/`data-fill`/`data-drag`/`draggable` (those keys address
the LIVE model), pucks keep `data-person` so selection works, and the
frozen `data-alc` marks come from the snapshot's own changes slice. The
board renders `boardHTML(di, pv)` read-only (disabled fields, no mbtn/arm
targets, no sign-off bar) inside `.pv-frozen`, and its live-checks panel
becomes the preview banner. Belt-and-braces gates on stale markup:
`armSlot`, `boardChange`/`boardMbtn`/`boardArmClick`, `dragFrom`
(`.preview`/`.pv-frozen`), Shell's contextmenu clear. Previews are pruned
lazily (EditWeek/SchedBoard), on `histApply`, and on week switch.
**The version cluster (redesigned, owner 16 Aug 26 — "I feel confused").**
`verSelHTML` (edit week) and the board's React `.dver` both split the one
dropdown into two `<optgroup>`s — **Your plans** (the live entry + the other
drafts) and **Issued · read-only** (Original/ALn) — so a plan is never read as
a document already issued. A persistent **Live-copy** control leads the
cluster: a static green `.livebtn.on` "you are here" on the working copy, an
active `.livebtn.back` **← Back to live copy** while previewing (`data-golive`
→ `setDayPreview(di,null)`, pure view state, no gate). The board carries the
same home button inside its preview banner (`.dprev-back`) rather than on its
one-row phone bar. The reworded banner: an **issued** preview offers **"Load
onto working copy"** (`data-restore`, was "Restore this version"); a **draft**
preview offers **"Switch to this plan"** (`data-draftgo` → `draftSelect`,
edit-surface-only — gated on `vsel`, since a preview always renders `ed=false`).
The `data-restore` button routes through `routeClick` →
`loadVersionToWorkingCopy` (`engine/drafts.ts`) — **NOT a rollback** (owner, 16
Aug 26 — "the view only schedule should still see AL1, it shouldn't go to
Original without me publishing"). It installs the version's content on the
working copy and rebases the pending set as the diff vs the still-issued
document, **without touching `SCHED.cur`** — so `dayIssuedHTML`/the view page
keep showing the issued AL until a new AL is published; the loaded-then-edited
copy becomes that AL. Same shape as `draftSelect`'s published-day path.
`restoreDayVersion` (the old instant rollback that DID set `SCHED.cur`) stays in
`engine/restore.ts` for probe-bridge only — nothing in the app calls it now.
Because loading replaces the working-copy edits, **with unpublished edits on the
day it takes a confirming second tap**: the first arms `RESTARM` (state/view.ts),
the button becomes amber "Discard N edits — confirm" beside a "Keep editing"
cancel (`data-restcancel`), and any navigation clears the arm (the clear lives in
`setDayPreview`). This is the one deliberate confirm in the app. Loading the
version the day is already issued at with nothing pending is a no-op toast, no
history step. Under an ORIG/AL
preview the day-head chip still names the LIVE current version while the
banner names the previewed one — deliberate ("live is at AL2, you're Under an ORIG/AL
preview the day-head chip still names the LIVE current version while the
banner names the previewed one — deliberate ("live is at AL2, you're
viewing AL1"). **A `d:` DRAFT preview is the exception (owner, 15 Aug 26 —
"when I toggle to draft 1, it shouldn't say published"): its day head
suppresses the AL chip and swaps the ✓ Published stamp for a plain `Draft`
stamp** (title "A stored draft — not the issued schedule") — a stored
alternative must never wear the issued document's clothes, on any surface.
Known limitation: personal-INPUTS sections and the day-info pop show LIVE
data inside a preview — inputs are not part of the issued document.

## The day-head version chip — now INSIDE the published stamp

One `.dal` chip per day = `dayCurVer(di)`, everywhere (view page, edit week,
and — since `dayStatHTML` became the board's own publish-strip builder too,
14 Aug 26 — the board's sign-off panel). `data-alc` tints it; `ORIG` is
`.dal.orig`, grey by design — the bare `.dal` fallback colour is `--accent`,
which is AL1's cyan, and ORIG must never read as AL1.
**Since 16 Aug 26 the tag rides INSIDE the ✓ Published stamp** — "✓ Published ·
AL1" / "· ORIG" (`.dbeak .dal`) — and it shows on EVERY published day, ORIG
included (owner: "published… what? Original Published makes sense"). This
replaced the old standalone chip, which hid ORIG on a day no AL ever touched;
that "clean look" was the very thing that read as "published nothing". The
full "which ALs amended this day" history still lives only in the ⓘ day-info
panel.

**A pending mark means "differs from the issued document", not "was touched".**
`noteChange` raises the mark on every edit (it runs before the value lands, so
it cannot tell), and `reconcileIssuedMarks` (`engine/drafts.ts`, called from
`afterSchedMutate` after the write) drops any pending FIELD key whose live value
again equals the issued snapshot's, restoring the AL tint that field carried
when issued. So editing 08:30→08:35 dots the cell and 08:35→08:30 clears it. It
only ever REMOVES a stale mark (never adds one, so it cannot hide a real
change); `del:`/`inp:` marks are left alone by name. Three refinements (16 Aug
26, the owner's "swap the pucks and swap it back… it shouldn't register"):
a pending field key present in NEITHER the live nor the issued walk is dropped
too — a drop onto an occupied row parks a man at an overflow/append address
the issued day never had, and dragging him back off trims it from both
documents, which used to leave a phantom mark that minted an AL over a net
no-op (a key in live only, a genuine add, keeps its mark); and `dayKeys`
compares PERSON cells canonically (`nameToId(v) || v` — the seed holds ids
where an app write stores callsigns) and TIME cells canonically
(`parseHM → hhmm` — the seed holds `0700` where `txtSet` writes `07:00`), so
putting back the very value the issued document displays clears the mark in
every spelling. Unparsable text passes through raw.

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
planning note inside the panel) · **Ground Programme** (`.grnd`; the `· scheduler` qualifier was dropped 22 Aug 26)
· **Personal Inputs** (`.pinp`, with the accept controls) · **Unavailable**
(`.unav`). **Every time reads hh:mm** (`08:00` — owner, 30 Aug 26, reversing
the short-lived 16/29 Aug 4-digit passes: "most of the timing format is 08:00 …
make sure everything follows that format consistently"). hh:mm is the app's
native form (the read-only reference gate pins `fmtT`/`fmtTxt`/`hhmm` to it;
`txtSet` commits through `hhmm`; the week/warnings/CSV never left it) — the
mixed look came from compact-minted legacy data (duty templates minted `0700`).
Every board time cell wraps its stored string in `engine/time.ts fmtHM` (the
ONE display fold — either form in, hh:mm out, non-time → blank): the flying
`.tm` br/to/ld + the brief-suggestion ghost (`board.ts`), the
duty/sim/ground/programme `.atm` str-end (the `boxHTML` atm/tm branch + the
`ap:` inline cells, `board-html.ts`), the wave in-time note and the input rows
(`inpTimeText`, already colon). The WEEK folds identically through `fmtT`
(`ted`/`plRow`). The compact MINTERS are gone too: `dutytpl.tplTime`,
`DUTYTPL_STD`, `engine/waves.ts waveDutyBlock` and the "+ In time" line all
mint `07:00` now (old stored templates refold on load), and a committed IN
TIME line folds just its recognised time tokens via `events.ts intimeFold`
(commit-time only — stored/seed lines are never rewritten at render, which is
what keeps parity at 728/0). Typing accepts `800`/`0800`/`8:00`/`08:00`
(`parseHM`/`hmOK`) and the colon appears on commit — nobody types `:`. The one
deliberate 4-digit survivor is the AREA window token (`0800-0900`,
`atimeText`) — the reference app prints it compact and `tfin.js` pins that.
Don't add a second display formatter — `fmtHM` is the one.
**The day-step commit compares the box to the model's DISPLAY** (owner
adversarial pass, 30 Aug 26): `board.ts boardTab` commits a still-focused time
box when you navigate away, and it used to synthesise that `change` whenever the
field text differed from the raw model. A folded box shows `09:00` over a legacy
compact `0900`, so an *untouched* box then looked changed and minted a phantom
History row on a step. It now compares the field to `fmtHM(model)` for a
`TIME_TXT` cell, so an untouched legacy value stays silent while a real typed
value still commits. The `data-ifld` (personal-input) branch needs no fold —
`inpTimeText` reads colon off stored minutes already. Pinned in
`audit-b-daystep.test.tsx` §Scenario 8.
The duty/sim/ground panels (added Aug 26) share the `c6r` grid
(Item | Start | End | People | Rmks | ctl — **Duties says ROLE** where the
other two say Item, its own `C6_DUTY` header, owner 10 Aug 26: a duty row
names a job) and speak the ordinary grammar —
seats `d:di.wi.ri` / `s:di.kind.ri` / `g:di.ri` (+ `.xN`, fill `.+`), texts
`dl:/dr:/sr:/gr:` via `data-bfld` — so the board's generic arm/drag/change
handlers cover them with no extra wiring.
**Every append-capable people cell carries a trailing drop zone** (owner,
26 Aug 26 — a full row swapped a seated puck instead of taking a new one, because
a packed `.ppl` cell has no empty area, so the drop resolved to a `.seat` instead
of the cell's `.+` fill). The zone is `html.ts`'s one `ADDZ` body, reused by
every board `.ppl[data-fill]` cell (`board-html.ts`) — the same drop target the
week always had. On the DENSE board it is `.schedboard`-scoped to a PERMANENT,
STEADY-HEIGHT trailing zone (`flex:1 1 var(--puck-w)`): it grows into the row's
leftover width and wraps to its own `var(--puck-h)` line only once the pucks pack
the row, so the pucks never reach the cell's right edge (there is always a bare
patch to drop onto) and a full row shows a fresh empty line below. Its height
NEVER depends on drag state — an earlier revision opened it from `height:0` on
`body.dnd`/`body.arming`, which grew every people cell at once and jumped the
whole board out from under the finger (owner, 26 Aug 26 — "can the screen be
stable when I try to add in more pucks … the puck will not fill up the entire
width"). The "+ add" text stays hidden throughout; only a dashed edge marks it,
faint while a drag/arm is live and bright on the hovered cell. The seat grid
(`.fcprcp`, sims + flying pairs) auto-adds rows and never packs edge-to-edge, so
its zone is `display:none`. The week keeps its own always-present full-width
strip. Pinned in `board.test.tsx` (presence) and `e2e/geometry.spec.ts` (the
steady height + trailing gap). Row mbtns: `dr*/sr*/gr*` cx
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

**The OFT takes instructors and observers on the same grid (owner, 14 Aug
26 — "the OFT can only sit 2 people… anything additional are the instructors
instructing that session or observers. So it doesn't really affect the
rules").** An OFT (or any non-AMT sim) crew row now renders the AMT's
`.fcprcp` seat grid on the board: the two REAL seats first — `p`/`w`, where
the FRONT seat-qual rules stay anchored (the sim rear seat needs no
instructor since 14 Aug 26 — `engine-rules.md`, the CAT-ladder bullet), an
empty one a droppable `+` (it used to
render as nothing, leaving no way to see or tap it) — and any extras from
`more[]` paired below, padded to an even count. A removed extra HOLDS its
index (`slots.ts` writes `''` and trims trailing blanks only) and renders as
a droppable hole in place, so the others never reshuffle — the AMT's own
contract, which extras used to break by collapsing (`sbMore` skips empty
ids). The ENGINE is untouched: extras were already collected as time-only
commitments (`events.ts` concats `s.more`), which is exactly the owner's
model — seat rules for the two seats, clash/rest checks alone for the rest.
A who-text row ("SIMS (149)") keeps its plain text and never gets the grid.
The WEEK stays reference-shaped as above. Pinned in `board.test.tsx`.

**`+ Block` on the AMT header mints the whole three-row shape in one tap
(owner, 14 Aug 26 — "add an AMT block that shows what it shows now. Like
brief box and debrief. All 3 together").** It sits beside the AMT's own
`+ Row` (`data-sblkadd`, board only — the week has no sim add controls) and
appends BRIEF, BOX and DEBRIEF together: BRIEF and DEBRIEF as time-only
rows (their labels are what `board-html.ts` keys the seatless rendering
on), the BOX with `pax:[]` so the FCP/RCP grid renders its first empty
droppable pair at once. Times come up BLANK — the new-line rule, a
plausible wrong time reads as filled in. Three structural adds, so the AL
and the edit log treat it exactly like three `+ Row` taps; the OFT header
is unchanged. Pinned in `board.test.tsx`.

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
**And it works the OTHER way too** (owner, 26 Aug 26 — "click a puck that has any
flagging … the top right warning column will snap to that puck and show what
triggered that flagging"): clicking a board puck selects the person (`SELID`,
blue — unchanged), and every `Live checks` row whose crew includes them renders
`.pksel` (a stronger accent ring than `.on`, board.ts), so the panel points at
what they triggered. `interactions.ts:scrollBoardWarnToSel` then scrolls the
panel to the first such row a task after the notify that repainted it.
`selectPerson` clears `WFOCUS`, so `.pksel` and `.on` never mark the same row —
this stays additive to the 7 Aug rule (a puck still SELECTS, it does not jump the
board), it just makes the checks list answer the selection.

## The board on a phone is ONE window (owner, 8 Aug 26)

Comp approved before build. Below 820px the board used to be three stacked
zones — the panels, then a bottom-pinned sheet holding `Live checks` and the
roster, split by a drag-grip (the B25 machine, now deleted). It matches the
edit week now:

- **Sign-off, then the Live Checks bar directly below it, then the panels**
  (owner, 14 Aug 26 — "put it right below sign off section"; before this the
  warnings rode at the very top, above the sign-off). The sign-off is its own
  `#sbSign` element (`boardSignHTML`) heading the board column; on a phone
  `.sb-boardwrap` is `display:contents`, so `#sbSign`, `#sbWarn` and `#sbBoard`
  flatten into the one scroller and `order:-2`/`order:-1` drop the sign-off and
  the checks bar above the panels. `.sb-warn` still `flex:0 0 auto` (an
  `overflow:auto` child's automatic minimum is 0, so a shrinkable strip
  collapses to its header). **A 30px right gutter keeps the parked aircrew tab
  off the board** (owner, 16 Aug 26): the tab is a 30px sliver pinned over the
  right edge in a ~55vh band, and the old 18px gutter only cleared the input
  tap-zone, so panel headers, the `+Note`/`+Item` buttons and the sign-off
  summary's tail still slid under it. The gutter goes on all THREE flattened
  scroller children — `#sbBoard`, `#sbSign` and `#sbWarn` — because the sign-off
  and the checks bar are their own boxes now (padding `#sbBoard` alone left
  their full-width rows reaching under the tab). **On DESKTOP nothing moves**:
  `.sb-warn` stays in the
  320px side column beside the board, so the always-open list never pushes the
  flying block down — only `#sbSign` is new there, heading the board column.
- **The Live Checks header is an "issues" bar coloured by worst severity**
  (owner, 14 Aug 26 — "title it issues instead of live and have colours on the
  bar depending on warning or advisory"). `boardWarnHTML` reads
  "⚠ N issues · N warning · tap to review" and the `.wh` bar wears `hard`/`adv`/
  `note`/`ok`, the same palette as the week's `.daywarn`.
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
    **AMENDED 23 Aug 26 (owner): the dots left the phone bar.** The dot
    styling and the phone scrub affordances above are gone from the CSS;
    `.sb-nav .sb-days` is `display:none` under 820px, so the seven elements,
    `dayTabsHTML`, `wireDayDots` and every jsdom test survive untouched while
    the phone paints none of it. The desktop chips stay, and the scrub still
    works there. What the row carries instead is under §The day is stepped by
    TWO ARROWS below.
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
- **EVERY REMARKS BOX RIDES THE PUCKS' ROW, AT ALL TIMES** (owner, 16 Aug 26 —
  "beside the pucks on the right, same row, aligned with the B"). This SUPERSEDES
  the 12 Aug "empty box is not drawn, the row's own + asks for it back" contract:
  the `.empty` hide, its `data-rmkadd` "+" reveal, and the `RMKOPEN` view state
  are all GONE. On a phone the pucks pack into the left (Role/Item) track and the
  remarks box fills the two time tracks on its RIGHT, on the SAME grid row —
  aligned under Start, the flying line's shape (`.sb-line .sb-rcell`). It is the
  row the reveal used to save: a box that shares the pucks' line costs no extra
  height, so hiding it bought nothing worth the "+".
  - **Applies to every board section that carries remarks** — duties, sims
    (AMT / OFT), ground, Common Programme and the promoted Personal-Inputs /
    Unavailable input rows. All of them are `.sb-arow.c6r` now (Common Programme
    dropped its Detail column and its own `cprog` grid on 22 Aug 26).
    `board-html.ts`'s `sbRmk` always emits a plain `.rmkin` with a faded
    `Remarks` placeholder — no `.empty`, no per-row state.
  - **The phone TEMPLATE must be restated for the two-class row modifier.**
    `.sb-arow.c6r` outranks the one-class phone base
    grid, and a media query adds no specificity, so the desktop template wins at
    390px and crushes the row unless the phone block restates the three-track
    grid AND places `.ppl` at `grid-column:1/2`, `.rmkin` at `2/-1`. `.sb-wide`
    (desktop-at-phone-width) resets both back to `auto` so every column stands on
    its own there. Missing either restatement reproduces the old c6r register bug.
  - **Common Programme grew a persisted `rmks` field.** It writes through the
    ordinary `ap:di.ri.rmks` funnel key (generic in `slots.ts`), is snapshotted
    for the AL in `restore.ts` (the one enumerated add — reorder globs it for
    free), and shows in the week view too (`.ah-row` grew a fifth `Rmks` cell via
    `plRmk`). **On a phone the Common Programme now reads exactly like the
    duties/sims/ground lists** (owner, 22 Aug 26 — "make the common programme
    layout similar" to them): the two time columns STACK into one TIME column,
    which frees the room for RMKS to sit BESIDE the pucks instead of dropping to
    a full-width strip below the row, so the phone row is `NAME | TIME | PEOPLE |
    RMKS` on the wide-NAME/one-puck `.plist.one` proportions. Done purely in the
    phone `@media` by POSITION (`nth-child`), NOT by adding classes — the
    `.ah-cols` markup is byte-compared against the reference (`html.test.ts`
    `noAhRmk`), so the row stays `.nm, start-.t, end-.t, .ppl, .rmk` and the
    header stays Name/Start/End/People/Rmks. Desktop is unchanged (both sections
    already share the 5-column layout). Export is flying-only and untouched.
    Pinned in `board.test.tsx`, `boardrmk.test.tsx`, `restore.test.ts` and
    `e2e/geometry.spec.ts`.
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
  `justify-content:space-between` pins one arrow to each edge. **The dots sat
  between them until 23 Aug 26 (owner): the phone day strip is gone**
  (`.sb-nav .sb-days{display:none}` — the old `order:0` reset went with it)
  **and the freed middle carries `#sbHl` + `#searchB`**: the highlighter
  toggle at the arrows' 26px height, then the search box growing into the
  row's slack (`min-width:0` so it can also shrink instead of tripping the
  gate's overflow assertion). The arrows plus the bar's own day title are
  what say "which day" on a phone now.
  **The chips strip `.sb-hl` (`#sbHlStrip`) is the bar's LAST line** — the
  same `HlChips` the week pages render, INSIDE `.sb-top` deliberately so the
  bar's ResizeObserver republishes `--sb-topH` when it opens. Desktop: always
  open, no gate — nothing pins the desktop bar's height to a session flag; since
  26 Aug 26 it no longer takes a FULL-WIDTH line of its own but rides the action
  row at the LEFT (`.sb-hl{order:5}`, the actions `order:6` keeping
  `margin-left:auto` at the right — owner, "share the same row as the undo
  buttons, on the left … more usable space"). Phone: `display:none` until `#sbHl`
  flips `HLOPEN` (`.open`, the filters-row sideways-scroller recipe, `order:3` so
  it lands under the day row) — the phone fold is untouched by the desktop move,
  both scoped by `@media`.
  **`#searchB` is the `#searchV` idiom exactly** — uncontrolled, wiped by the
  blank-click clear — which includes the week-cross idiom: crossing a week
  with the arrows leaves the box's TEXT standing while the filter keeps
  applying, exactly as `#searchE` behaves across a week load; the blank-click
  wipe (`interactions.ts`) is what empties it.
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
  **The desktop chrome was TIGHTENED for working space (owner, 26 Aug 26 — a run
  of "the buttons are too big / give me more room" asks), all in `scheduler.css`
  under `@media (min-width:821px)`, phone untouched.** (1) The action buttons
  match the shell topbar's ~28px: `.sb-actions` is a flex row that STRETCHES to
  its tallest child, and an icon button (History's `<HistIcon>` is a block
  `.btnglyph`) stacked its icon over its label — 44px; `inline-flex` lays each
  icon beside its label. Scoped to `.sb-actions .abtn:not(.sb-widebtn)` + the
  calendar, NOT `.sb-top .abtn`, so the desktop `display:none` on the ‹ › day
  arrows and the wide button survives. (2) The CAT/Type/Quals strip shares the
  action row (see the strip note above). (3) The SIGN-OFF scrolls AWAY with the
  board: `.schedboard:not(.sb-wide) .sb-boardwrap` is the scroller (`overflow-y:
  auto`) and `#sbBoard` is `flex:none;overflow:visible`, so `#sbSign` heads the
  column and scrolls off the top the way the phone's already does; wide mode
  keeps its own inner `.sb-board` scroller. `jumpToChange` / warning-jump use
  `scrollIntoView` (scroller-agnostic), so both still land a puck in view — the
  geometry pin reads `.sb-boardwrap` now. All four are jsdom-invisible geometry,
  pinned in `e2e/geometry.spec.ts` ("the scheduler-board chrome is tight").
  **The dots are gone from the phone bar (owner, 23 Aug 26 — a reversal of the
  11 Aug dots build).** The day strip and the blue current-day square paint
  nothing under 820px; the arrows and the bar's day title carry "which day".
  On DESKTOP the seven chips stay, a tap still jumps straight to a day, and
  press-and-slide still scrubs the week — the removal is `display:none` only,
  so the machinery is one CSS rule from either state. `.sb-wide` (the desktop
  layout at phone width) restates `display:flex` and keeps the chips, since
  that mode IS the desktop bar.
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
  `touch-action:none` for its scrub without costing a scroll. **Open, it now starts BELOW the top bar** (owner,
  11 Aug 26): it used to be `top:0`, painting over the day, the undo pair
  and ✕ Close — the controls a scheduler reaches for while the palette is
  open. The offset is
  `--sb-topH`, published by a ResizeObserver on the bar in `SchedBoard.tsx`.
  **Its columns are pinned to one puck wide and the drawer sizes to fit them**
  (owner, 14 Aug 26 — "the alignment overlaps each other" on the board while the
  edit week was fine). The board's base `.sb-roster .rcol{flex:1}` shares the
  drawer width equally, which on a phone squeezed each column below the fixed
  74px puck, so every puck and every struck-name reason line overhung its
  column — visible once the Personnel ground-crew column (Aug 26) made it three.
  The phone board now uses `.sb-roster .rcol{flex:0 0 var(--puck-w)}` like the
  edit week, and `width:max-content` with `max-width:78vw` (was 64vw, which fit
  only two columns): the drawer is as thin as the columns present — ~54vw for
  two, ~76vw for three — never wider than the cap, always on screen. Desktop
  keeps `flex:1` so its 320px side has no gutter.
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
- **A phone flying line is three strips: `CS | MSN | B | TO | LD`, then
  `[FCP RCP] [remarks]`, then the controls** (seats-strip fix 8 Aug 26; brief
  folded onto row 1 and the remarks lifted beside the pucks, owner 16 Aug 26 —
  "arrange the board like the edit schedule: brief then TO then LD"; "the 2
  pucks side by side and the remarks row will go up to the right of the
  pucks"). Row 1 is five tracks `48px minmax(0,1fr) 46px 46px 46px` — MSN the
  only flexible one (a mission is ~5 chars, so it yields the width the brief
  and the three fixed, equal time tracks need). Row 2: the seat pair spans the
  two left tracks as a fixed `74px 74px` pair (a puck is 74px, so the two pack
  tight and stop wasting the ~180px of empty right half they used to), and the
  `.sb-rcell` remarks+stores cell takes the three time tracks on the right;
  both are placed by grid-column span with NO explicit grid-row, so auto-flow
  lands them on one row and `.sb-wide`'s `display:contents` (seat pair) and
  `grid-column:auto` (rcell) resets fully undo it on a tablet. Every cell's
  DOM order already matches its visual order, so no `order` hack is needed.
  The FCP/RCP header labels hide at phone width; `.sb-wide` restates the wide
  desktop grid back. **Row 1's five boxes share ONE bottom baseline** (owner,
  16 Aug 26 — "make the boxes aligned … every box lowers to cater for the brief
  blue timing"). The B cell stacks the blue suggested brief time above its
  input, and with the seat pucks on their own row it is the tallest thing on
  row 1, so a centred row floated the plain `CS/MSN/TO/LD` boxes half a line
  above the brief box. `align-self:end` on the five boxes — scoped to
  `.schedboard:not(.sb-wide)` so the tablet/desktop layout, where the pucks
  share this row, keeps its centred alignment — drops them onto one line and
  leaves the blue time in the space directly above the brief box. Pinned by the
  geometry test "the flying line keeps its five boxes on one baseline on a
  phone".
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
in `e2e/geometry.spec.ts` (the checks bar below the sign-off and above the
first panel, the parked handle a centred band whose taps never steal from
Close / the day chips / input ends, the fold opening and closing, the drawer
parking on a fill, seats clear of every input and of each other).

## The board edits everything the week does (owner, 14 Aug 26)

"The scheduler board mode should be the most editable platform." The board
already drew and edited most fields; these were week-only and are now on the
board too, reusing the week's own markup and the global handlers that already
reach the board (`routeFocusOut` commits its contenteditable, `routeClick`
routes `data-air`):

- **In-time** — the wave's IN TIME + WX/NOTAMS lines are an editable
  `.intimes` block (`data-intimes`, key `it:`) under the wave header, exactly
  as on the week (`intimesInner`). The board still prints the derived in-time
  number in the header beside it.
- **Area + area-time** — a `.sb-area` strip after each formation's aircraft,
  two contenteditable cells (`data-area` key `ar:`, `data-atime` key `at:`).
  Both render `areaText(f)`/`atimeText(f)` — the derived value, NOT `''` — so a
  click-through does not freeze the cell (the same trap `textedit.ts` documents
  for the week). `.sb-area` is not a `.sb-line[data-move]`, so the row-drag
  machine steps over it.
- **Traffic** — a `data-air` button in the wave header for non-standalone
  waves; the existing `setAirKey → AirPop` modal is surface-independent.
- **Remarks are always drawn beside the pucks** — the `data-rmkadd` "R" reveal
  is gone (owner, 16 Aug 26; see the "every remarks box rides the pucks' row"
  contract above). `sbRmk` emits a plain `.rmkin` with a faded `Remarks`
  placeholder on every c6r / input row, empty or not. **The flying line's
  own always-visible remarks box (`.nts` in `board.ts`) carries the same faded
  `Remarks` placeholder** (owner,
  16 Aug 26) — so an empty one reads the same way. A STANDALONE line shows a
  solid MAIN/SPARE badge above its remarks box instead — `html.ts:saRoleHTML`,
  a flip BUTTON in edit mode, the same chip read-only elsewhere (owner, 24 Aug
  26; supersedes the 10 Aug ghost-text placeholder, which vanished the moment
  a remark was typed and could never be changed — the Stable decision in
  `CLAUDE.md` carries the full story). Its remarks box now carries the same
  plain faded `Remarks` as every other line.
  **The edit week's flying line matches** (`html.ts`'s `ted` call,
  same day): its remarks box shows the faded `Remarks` too — but EDIT MODE ONLY,
  since a read-only view page has nothing to type into it, and it is registered
  as a deliberate divergence in `html.test.ts` (`noRmkPh`) so the reference
  byte-parity guard still holds.
- **FCP and RCP sit side by side on the phone board** (owner, 14 Aug 26 — "FCP
  on the left RCP on the right in 1 row" to save vertical space). The two seats
  wrap in `.sb-seatpair`, which is `display:contents` on desktop (the seats stay
  their own FCP/RCP grid columns, unchanged, and `.schedboard.sb-wide` restates
  that so a desktop board at a phone width keeps its columns too) and a
  full-width 2-column grid inside the `max-width:820px` block, so a phone lays
  them on one row instead of stacking each full-width. The line is one DOM child
  shorter (nine, not ten) but the grid still counts ten items — pinned in
  `board-stores.test.tsx` and `e2e/geometry.spec.ts`.
- **The sign-off names sit two-up, like the edit-schedule strip** (owner, 22 Aug
  26 — "make the board sign-off similar to the one in edit schedule"). `.board-sign`
  shares the compact `.day-sign` inner CSS (`Sign-off` header and `X to sign` state
  each on their own full-width row; the four name pills flex-grow between). Its
  own container is untouched (`#sbSignBar` margin, `position:static`, the `.sb-pub`
  publish strip below). On a phone the pills are pinned to a 50% flex-basis inside
  the `max-width:820px` block, so `CUR CK · SKED CK` / `PLANNED BY · APPROVED BY`
  land two-per-row regardless of the board panel's slightly narrower width;
  desktop keeps the content-width row the edit week also shows. CSS-only — the
  `signoffHTML` markup is one shared builder and is byte-unchanged.
- **The publish strip** — version chip, pending count, ⓘ, Publish day, Publish
  AL (14 Aug 26, "the board's sign-off panel now carries the same… controls the
  week day head does"). `html.ts`'s `dayStatHTML(di, ed)` is the ONE builder
  both surfaces call — the week's `dayHTML` (inside its `.dstat` span) and
  `board.ts`'s `boardSignHTML` (its own `.sb-pub` row, right after the sign-off
  names, inside `#sbSignBar`) — so "same as edit schedule" means literally the
  same markup, never a second copy that can drift; `html.test.ts` pins the
  week's own emitted markup byte-unchanged. Gated on `HOOKS.editMode()` alone
  on the board (`pv` is already ruled out by `boardSignHTML`'s own early
  return) — `dayStatHTML` itself draws the read-only stamp instead of a button
  when `ed` is false, the same as the week's view-only page. The frozen
  version preview renders no publish controls on either surface. `.sb-pub` is
  its own flex row (`flex:0 0 100%`) under the sign-off names rather than
  folded into `.signoff` itself, so a long Publish-AL button on a narrow board
  never crowds the last sign-off pill onto half a line.

## Empty cells show a standing "add here" box (owner, 14 Aug 26)

An empty People cell (`[data-fill]` with no crew) shows a grey dotted rounded
box even without a drag in progress, so a scheduler sees where to tap or drop —
matching the empty flying seats. Both the week AND the board people cells now
carry the `.addz` trailing zone, so on both an empty People cell is bordered
standing through that zone when it holds no puck
(`.ppl[data-fill]:not(:has(.puck)):not(:has(.itxt)) .addz`, scoped to
`.page.editing` and `.schedboard`). Other empty `[data-fill]` cells that carry no
addz still fall to the `[data-fill]:empty` "+ tap or drop" box.
Edit surfaces only (`.page.editing` / `.schedboard`, never a `.pv-frozen`
preview). The accent drag affordance still takes over the moment a drag starts.

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
- the board's **Personal Inputs panel**, in its remarks cell
  (`ui/board-html.ts`; the read-only "Inputs · <day>" summary band that also
  carried it was removed 22 Aug 26 — the live panels are the one surface);
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
  everywhere else. (The summary band that rendered `.sbi-rm` left the board
  22 Aug 26; `sbInputsHTML` survives as a probe-bridge builder, so the rule
  still holds where it renders.)

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
| `Ground Programme` — the scheduler's own rows | ✓ | ✓ (titled the same on both sides since 22 Aug 26) |
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

**Accepting is now the DEFAULT for an activity input (owner, Aug 26 — "by
default all inputs are accepted").** An activity input (Meeting, Appointment,
Training, Fly with, Duty, Personal, Other) drops onto the ground programme the
moment it is filed, through the one gate `engine/slots.ts:autoAcceptInput`:
isPersonal + an EDITABLE (not-yet-published) day → `acceptInput(di,row,'g')`.
Every creation path calls it — the two board `+ Add` dialogs (via
`commitNewInput`'s non-`toGround` branch), the Inputs page's own `add()`, and
the boot/week-load pass (`autoAcceptSeedInputs`, `initStore`/`loadWeek`). Leave,
medical, SANS and a PUBLISHED day are silent no-ops: a late input on an issued
day stays under Personal Inputs (no surprise amendment), and the crew picker's
input-aware busy-check still warns about it either way (`engine-rules.md`
§Personal input clash). The manual `Accept`/`Undo` controls and the round-trip
are unchanged — removing an auto-landed row returns the input to Personal
Inputs, and it can be re-added.

**An input-derived ground row is tinted.** `rowCls` adds `.gr-frominput` to a
ground row carrying a `src` back-link (set only by `acceptInput`), on the week
(`plRow`) and the board (`sb-arow`) alike — a faint accent rail
(`scheduler.css`), ordered before `.cx` so a cancelled one still reads
cancelled. It tells an input-derived row apart from a hand-authored programme
item.

**Personal Inputs folds to a one-line summary by default.** Now that activity
inputs auto-land, the block is the faded audit echo rather than the primary
surface, so it collapses to a summary by default: `PIOPEN`/`togglePInputs`
(`state/view.ts`), the header the toggle (`data-pitog`, routed in
`interactions.ts` on `canEditSched()` so it works on the edit week AND the
board). The summary counts the rows and how many are on the programme. When
expanded it also carries a housekeeping reminder — "A removed input flags
nothing until accepted again — delete it here if it should go entirely"
(owner, Aug 26; reworded 26 Aug 26 with the dormancy rule; `.pl-inpnote` on the
week, `.sb-pinote` on the board) — a scheduler deletes one by pressing its type
to open the editor and Delete. **A dormant (removed, acc `'r'`) row reads
visibly parked** (26 Aug 26 bug pass — it flags nothing, yet printed identical
to a fresh counting row beside it): `dormRowCls`/`dormRowTitle` (`html.ts`, one
body for the week's `.pl-row` and the board's `inprow`/`sbi-row`) fade it to
`.5` — fainter than an accepted row's `.62` — add "· removed" after the type on
the week, and title it "Removed from the day — flags nothing until accepted
again". Pinned in `inputedit.test.tsx`.
Unavailable is deliberately left OPEN — it is a live plant/drop target and the
day's must-read.

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
leading MARKER track, which an input row keeps for register even though it
cannot be dragged — its grip is `sbGrip(true)` → `.sb-grip.ro`
(`visibility:hidden`), so it holds the track but paints nothing while the
reorderable rows' grips paint (§Dense row reorder). A read-only board keeps
the compact `.sbi-row`.

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

**Dates are still NOT in it**, and the footer says so — moving the span
makes the row vanish from the surface being looked at, which is the Inputs
page's job. **Person now IS, for a scheduler** (owner, 14 Aug 26 — "allow
Unavailable to be editable too… even down to changing the puck"): a
`canEditSched()`-gated `<select>` sits above the Type field, offering
`rosterOptions()` — the same sorted-by-callsign roster list the Inputs
page's add form and row editor now call too, so all three can never
disagree on who is offered or in what order. Reassigning changes WHOSE row
this is, not which day it sits on, so it stays inside what the dialog
already keeps in view, unlike a date move — the row you are looking at is
still the row you are looking at afterwards, just under a different name.
The footer reads "The dates are changed on the Inputs page" for a
scheduler, and the old two-field sentence for anyone else.

**The Unavailable row's person cell is a plant/drop target too, on the week
and the board** — `iu:<iid>` (the input's own id, no day component, since
one input can cover several loaded days and none of them is more "its" day
than another). Tap it to arm, then tap a roster name; or drag a name — from
the palette, or off another seat — straight onto it. Both routes end at
the one `reassignInput(iid, personId)` (`inputedit.tsx`), built on
`commitInputEdit`'s own relink, never a second write path. That one write
path carries its OWN `canEditSched()` backstop (not only the arm/drop/select
gates that reach it), so reassigning WHOSE day this is stays a scheduler
action even if a future caller forgets to gate first — distinct from
`commitInputEdit`, which a member may reach to edit their own input's
times/remarks. An `iu:` seat
always offers to arm, unlike a flying seat (which only arms once its own
puck is gone or is a placeholder): the row is ALWAYS occupied, so waiting
for it to empty would mean it could never arm at all. No eligibility bar
either — this is a data edit to who is unavailable, not a seat assignment,
so any roster member, including one already unavailable elsewhere or
flying, is a legal target, and a name dragged onto it stays wherever else
it was planted too (the two facts are independent). Reassigning does not
call `afterSchedMutate()` a second time — `reassignInput`'s own
`commitInputEdit` already ran the input funnel's full epilogue (validate,
notify, one history step); the drop/tap handlers only disarm and repaint.

## Adding an input from the board (owner, Aug 26; context-bound rework 19 Aug 26)

THREE add buttons on a LIVE board (`.sb-addinp`, `data-inpadd`; absent on a
preview or view-only board, the same `ro`/`pv` gate the panels' editable rows
use), each bound to the panel it sits on — the kind rides the dialog seed as
`_ctx`, which narrows the type dropdown (`typeOptions(TYPE_ALLOW[ctx])`,
`ui/inputedit.tsx` — an emptied optgroup is skipped, not left as a bare
heading). The Personal Inputs panel carries NO add any more; its old + Add
moved to the Ground Programme (owner, 19 Aug 26).

- **Ground Programme → "+ Inputs"** (`data-inpadd="di.g"`, beside the bare-row
  "+ Item"). Types: the activity set only (`isPersonal` — Meeting, CSE,
  Training…), because those are what the programme can carry. Save ACCEPTS the
  new row straight onto the open day's ground programme (`commitNewInput`'s
  `toGround` — `acceptInput(di,row,'g')` inside the same `writeInputsBatch`,
  so add-plus-accept is ONE undo step): the button puts the item where the
  button is. The one refusal left is a duplicate content key (an identical
  person|date|type|start already promoted) — the input still lands, unaccepted,
  and the toast says so. Single day, the open day.
- **Unavailable → "+ Add"** (`data-inpadd="di.u"`). Types: leave, medical and
  OD only (`isUnavail && !isSansAvail`). The dialog carries a **date RANGE** —
  the same two-click `RangeCal` the Inputs page uses — and owns the remarks'
  till-date token the same way (`withRemarksTail`, single-day reads
  "till <that day>"; the typist's own words around the token survive
  re-picks). The seed is a COMPLETED one-day range on the open day
  (`endDate = date`) so the first calendar click begins a fresh range rather
  than silently completing a span from the open day; the same-day end
  collapses off in `normalizeInputDraft`. A leave span crosses to Leave War
  and the Inputs page exactly as one filed there — same record, same notify.
- **SANS Availability → "+ Add"** (`data-inpadd="di.s"`). The type is FIXED
  (no dropdown — a one-entry select would pretend it was a choice; a plain
  value, `#inpEditTypeFixed`), the Person list offers SANS aircrew only
  (`sansRefusal` would refuse anyone else at commit), and the Fly/AMT/OFT
  ticks are up with an empty payload. SANS Availability appears in NEITHER
  other list — it is an offer, not an absence, and not programme material.

In `_new` mode the dialog reads **"New input"**, drops the Delete button, and
the primary button reads **Add**; the hint names each context's behaviour.
Save runs `commitNewInput` (`ui/inputedit.tsx`), which shares ALL of an edit's
refusals and derivations through the extracted `normalizeInputDraft` — so no
add path can disagree with the editor about a malformed window, an overnight
range, or a span's year — then unshifts the row exactly as the Inputs page's
own `add()` does: one write through `writeInputsBatch` with a minted `iid`.
It is therefore the ordinary INPUTS record every other surface reads back.
An ordinary EDIT keeps the full type list — retyping a row across groups is a
real move the app already handles. The handler in `routeClick` re-checks
`canEditSched()` (the gate is the write path, not the markup). Pinned in
`boardaddinput.test.tsx`.

## Scheduler notes, and making one public (owner, Aug 26)

Four free-text blocks — under Programme, Duties, Sims and Ground programme —
on keys `pn:` / `dtn:` / `sn:` / `gn:`. Scheduler-side by default: `blkNoteHTML`
returns `''` when `ed` is false, so a populated note stays off the issued
programme; writing needs `canEditSched()`. The Duties and Ground sections render
on `|| ed` so an empty section still offers its box rather than stranding text.

A scheduler can now MAKE ONE PUBLIC (owner, Aug 26 — "Scheduler notes can toggle
to show in view only schedule … it will show as Public notes in edit schedule
and scheduler board but in view only schedule it shows Notes"). A per-note flag,
`view.NOTEPUB`, keyed by the note's own funnel key (`pn:0` …) so ONE flag governs
all three surfaces:

- **Off (default):** header "Scheduler notes"; nothing on the view-only week.
- **On:** the edit-week and board header read "Public notes" and carry the
  toggle chip (`.notepub`, `data-notepub`, admin-gated in `routeClick`); the
  view-only week renders the note under the header "Notes", read-only, and ONLY
  when it has text (an empty box is nothing to issue). A public note whose
  SECTION has no rows on the view-only week is not drawn, because the empty
  section itself is not — an accepted edge; the note still reads on the edit side.

The flag is a display choice, not schedule data: session-only on the LATEOFF
precedent (`view.NOTEPUB`), admin-gated, cleared on a session/week change, never
persisted and never in a history snapshot. The toggle builder is `notePubTog`
(`html.ts`), shared by the week and board so the label cannot drift.

## Drag / arm-and-plant (hard-won — test on touch)

`applyDrop()` is the ONE drop path for mouse and touch.

- The `body.dnd` decoration is added one tick AFTER dragstart (guarded on
  the drag still being alive), never synchronously: Chromium aborts a
  native drag whose dragstart handler reflows the page before the drag
  image is captured, which killed every desktop mouse drag. The touch
  machine keeps its synchronous `dndOn` — no native capture there.
- NOTHING ON THE PAGE IS `draggable`, AND THE MOUSE NEVER STARTS A NATIVE
  DRAG — pucks carry `data-drag="1"` (edit mode only, exactly where
  `draggable="true"` used to be: `html.ts` slotCell/lSeat/the available
  puck, `board-html.ts` sbSeat/sbSlot/the programme seat, `palette-html.ts`)
  and every drag, mouse or finger, rides the pointer machine in `drag.ts`
  (owner, 3 Sep 26, four cuts in one day: "a white box follows the puck" on
  Edge inside the MINDEF secured browser survived an off-screen clone for
  `setDragImage` (#351), a blank pixel plus a page-drawn ghost (#353), and
  the mouse on the pointer machine with the native dragstart
  `preventDefault`ed (#354) — and #354 also killed the DROP there. That
  browser starts its own drag of any `draggable="true"` element without
  asking the page: the page's `preventDefault` never reaches whatever draws
  the box, and once that drag owns the pointer the machine gets a
  `pointercancel` and nothing holds `DRAG` at the release. A drag the page
  cannot refuse must never be offered.) In `drag.ts`: a primary-button
  `pointerdown` on a `[data-drag]` puck — and ONLY what `dragFrom`
  recognises, so Leave War's and the calendar's own machines are untouched —
  claims it (`TD.mouse`), a 3px move arms it (no hold; the native drag's own
  threshold), and the release drops through `applyDrop` off
  `elementFromPoint` exactly as a finger does. The ghost is a `.dragimg` clone of the PUCK alone
  (not the `.seat` shell a grid cell can stretch) — fixed, `pointer-events:
  none`, z-index 520, the `.tdghost` recipe — pinned where the press landed
  inside the puck (`TD.ox/oy`, clamped to the puck) rather than centred, and
  the ghost itself carries the grabbing cursor (no OS drag cursor exists —
  there is no OS drag): `.dragimg` is HIT-TESTABLE with `cursor:grabbing`,
  and `tdOver`'s dragover hit-test takes the first element under the pointer
  that is not the ghost (`elementsFromPoint`). **`body.tdrag` and `body.mdrag`
  are JS state markers with NO declarations of their own** (the slow-computer
  cut, 3 Sep 26): measured by toggling each alone on the built app,
  `body.tdrag{touch-action;user-select}` restyled every element on the page
  (8,952 — a quarter-second at 4x throttle) at arm AND at drop, and
  `body.mdrag{cursor}` half of it — an inherited property on body is
  re-resolved down the whole tree, wildcard or not — and neither declaration
  did any work (html{} already refuses user-select and the touch callout;
  `onTouchMove` preventDefaults while armed). A class nothing matches costs
  nothing to toggle. Guarded by `ui/css-invalidation.test.ts`. Edge auto-scroll comes free with
  the machine. A window `blur` mid-drag clears the ghost and drops nothing. A
  press-and-release without a 3px move is a click; a secondary button is
  left alone. The NATIVE handlers (`dragstart`/`dragover`/`drop`/`dragend`)
  remain, reachable only by synthetic events (the suites' `dnd()` helper,
  probes), with their blank-pixel `setDragImage` + `dragover`-driven ghost;
  no real browser can reach them because nothing is draggable. The
  read-only render gate is unchanged: view mode, previews, peeks and a
  non-editing session emit no `data-drag`, exactly as they emitted no
  `draggable`. Pinned in `ui/drag.test.tsx` ("nothing on any surface is
  draggable": the whole document carries no `draggable="true"` with the edit
  page up, the board included) and in a real browser (`e2e/geometry.spec.ts`
  "a mouse drag of a puck runs on the pointer machine"): no element carries
  `draggable`, zero native drag events fire, the ghost sits at
  cursor-minus-grab-offset, the drop lands, no ghost survives it.
- TWO BELTS reinforce it, both inert on a normal browser (nothing is
  draggable so neither ever fires there): (1) `onDragStart`'s FIRST line is
  `if (e.isTrusted) { e.preventDefault(); return }` — a document-level
  backstop refusing EVERY real, browser-started drag whatever began it (a
  draggable element missed by the sweep, an `<img>`/`<a>`, a text-selection
  drag, or a secured browser starting one unbidden); synthetic drags are
  `isTrusted:false`, so the fallback path and its tests still run. It also
  closes a real gap: a native drag begun with NO preceding `pointerdown`
  (`TD` null) used to fall through `dragFrom` and return WITHOUT
  `preventDefault`. (2) `scheduler.css` sets `-webkit-user-drag:none` on
  `.puck`/`.rpuck`/`[data-drag]`/their children/the ghosts and on `img,a` —
  Blink reads that at drag INITIATION from computed style, before any JS
  event, so it holds where `setDragImage` and a `dragstart` `preventDefault`
  are ignored. Keep `html{user-select:none}` (it closes the text-selection
  drag) — do not narrow it.
- OPTIONAL DRAG READOUT (`ui/dragdbg.ts`) for diagnosing a drag on a
  devtools-less secured browser: OFF by default, attaches NOTHING unless
  `?dragdbg=1`/`#dragdbg` is in the URL or the top-left corner is tapped five
  times (a real, `isTrusted` gesture — synthetic taps never arm it, so the
  suites are unaffected). A `pointer-events:none` fixed panel (it must never
  eat the gesture it measures) LATCHES each drag's counters — pointerdown,
  move, arm, native-dragstart (trusted only, the SIS detector), pointercancel,
  window-blur, pointerup + coords, `elementFromPoint` target, drop outcome —
  and holds them until the next press so a photo names the failure mode. The
  `DBG.*` hooks sit at points that already exist in `drag.ts` and are no-ops
  until armed. Pinned inert in `ui/dragdbg.test.tsx`. The board DOM ceiling is
  unaffected (nothing renders when off).
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
- While armed there is NO day-wide fade (owner, 14 Aug 26 — "no grey out
  when I click on an event to be filled"): `paletteHTML` empties the
  engaged/standby sets for any armed slot, so a name is either normal
  (plannable here) or struck through with its reason, and the column's
  "N free" counts everyone plannable. Born SC-only on 12 Aug for the same
  misreading; the owner's ask generalised it. Unarmed keeps its fades.
  A struck entry with its reason printed (`.rpuck.no.haswhy`) is a COLUMN
  flex container, so the shared `flex:0 0 var(--puck-w)` basis would govern
  its puck's HEIGHT — the haswhy rule re-pins the basis to `--puck-h` or
  every struck entry draws as a 74×74 slab (found on a real phone, 14 Aug
  26; gated in `e2e/geometry.spec.ts`, jsdom cannot see it).

## SANS Availability, on screen (owner, 14 Aug 26; reworked the same day)

The surfaces read the same engine functions (`sansGate`/`sansAvailOn`/
`sansWindow`/`sansLetters`/`sansBadge`, `avail.ts`/`inputs.ts`) — see
`docs/feature-impact.md` for the drift-seam note. The same-day rework
(owner, on the phone): one window on the standard template, a compact card
grid for 26 SANS, record-less SANS struck by DEFAULT, and remarks readable
beside every badge.

- **The editors: three plain checkboxes ABOVE the standard timing controls.**
  `SansPicker` (`inputedit.tsx`) is the Fly/AMT/OFT tick row and nothing
  else; the one window is the SAME All day / AM / PM / Custom SpanPicker +
  time fields every half-capable type uses (`half:true` in `INPUT_META`).
  This IS the phone-bug fix: clearing a timing is one tap on All day, not a
  fight with a native time input's segments. All three editors (add form,
  in-table row, dialog) keep the shared shape; `sansFlags` normalises the
  payload so none of them can write the old per-event `{s,e}` values.
- **The palette section — `.rall.rsans` (`palette-html.ts`, `sansAvailHTML`).**
  One full-width band below the three seat columns, callsign-sorted, every
  SANS member pilot or WSO. Row = puck + badge + remarks:
  **the badge (`F/O · 08:00–12:00`, `.rsans-b`) and the remarks (`.rsans-r`,
  ellipsized, title-carried) are SIBLINGS of the puck (`.rpuck`), never
  nested inside it** — nesting would fall into the flex-basis trap the
  arm-and-plant section above documents: a struck `.rpuck.no.haswhy` is
  itself a flex CONTAINER whose basis governs its own puck's height. Each
  row prints its OWN reason (`hideWhy` left off, unlike the seat columns'
  shared `colWhy`).
- **Record-less SANS are struck BY DEFAULT (owner bug report, 14 Aug 26).**
  With nothing armed, `rosterPuck` itself asks `sansAvailOn`: a SANS with no
  record for the day gets the plain `.rpuck.no` strike an unarmed off person
  gets — reason in the title only, no printed `.rwhy` (that stays an
  armed-only affordance). A real absence outranks it (the off/grounded check
  comes first). "Only if they indicate they are available … then u can show
  that they are available" is the owner's rule verbatim.
- **Armed grey-out is `slotBar`, and only `slotBar`.** Arming a
  flying/OFT/AMT slot greys a record-less or under-offering SANS entry with
  its own printed reason (`.no.haswhy` + `.rwhy`); arming a
  duty/ground/programme slot leaves every SANS entry ungreyed (`slotBar`'s
  domain read returns `null` there — §Availability is time-aware in
  `engine-rules.md`). Pinned in `ui/palette.test.ts` and the e2e SANS
  geometry test.
- **ONE card grid on the week AND the board (`html.ts` `sansCardsHTML`,
  wrapped by `sansSectionHTML` for the week and `sbSansPanel` for the
  board).** A card is puck · F/O/A letters (`.sanscard-l`, the `--san`
  purple) · the window as text (`all day`/`AM`/`PM`/`HH:MM–HH:MM`) ·
  ellipsized remarks. The whole card is a `<button data-inpedit>` carrying
  the same `inpKey` address `inpEditLabel` builds, so the delegated click
  router opens the SAME input-edit dialog with no new wiring; `ro` renders a
  plain div instead. Order: bounded windows first by start (`sansWindow`),
  then all-day records in fixed combo order F/O/A → F/O → F/A → O/A → F → O
  → A — no group headers, the letters on each card are the label. Grid is
  `auto-fill minmax(148px,1fr)`: two cards per row on a 390px phone, three
  or more on desktop and in the week's 620px day box. The week section keeps
  `sec-sans` (purple left bar), renders only on edit and only when records
  exist; the board panel always draws, with its empty state. The old
  in-place time/remarks cells are gone with the rows — they were DEAD for
  SANS anyway (the force-allday override silently discarded anything typed),
  and the dialog the card opens carries every field including delete.
  Inside a card the puck sits in a row-direction `.sanscard-top` span, never
  as a direct child of the card's column flex — the 74×74 flex-basis trap
  again. Pinned in `ui/sanscards.test.tsx` + the e2e card-grid test.
- **The Available-crew panel lost its SANS tail (owner: "isn't really
  helpful").** The expanded `SANS available` grid answered the wrong
  question — generic not-tasked availability, never what a SANS actually
  OFFERED — and duplicated the palette band and the card grid. Gone
  entirely; the folded header's figure is now `N SANS offering` (SANS with a
  filed record that day), a pointer to the card grid rather than a second
  listing. `sbUnavailPanel`/`sbInputsGroupPanel` still carry the explicit
  `!isSansAvail(...)` guards so a SANS row never draws in their blocks;
  `sbInputsHTML`'s bands view keeps its `ty-sn` chip colour (a probe-bridge
  builder only since 22 Aug 26 — the board no longer renders the band).

## The Available-crew panel folds (owner, Aug 26 — OPEN by default)

The edit week's per-day Available-crew block boots OPEN now (owner, Aug 26 —
"all available crew section will open by default in edit schedule"), reversing
the 13 Aug 26 collapse-by-default. The fold set is `AVSHUT` in `state/view.ts`
(session view state in the DWOPEN pattern, cleared on a session change): it names
the days a scheduler has COLLAPSED — a day in the set shows only its header line
("Available crew · N all day · +N night · N SANS offering ⌄"), a day absent is
expanded. The header (`data-avtog`) toggles it per day. Expanded, the grouping is
unchanged but a wave line counts EVERYONE who can fly that wave — its own
partially-free leftovers PLUS the all-day crew — because the old leftovers-only
count printed "— none free —" over a wave 22 people could fly, which the owner
read as a bug (the panel was lying, not the engine). The collapsed root keeps
`.availpuck`, so drop-to-unassign still works closed. The open default raised the
week render to 4940 nodes, so the perf gate's week ceiling was RAISED 4000 →
5450 (`probes/perf-port.cjs` carries the argued comment — it now guards growth
ABOVE the open default). Gated in `e2e/geometry.spec.ts` ("the Available-crew
panel folds") and `ui/editweek.test.tsx`.

**On the board it wears the neutral panel chrome, not its green card** (owner,
25 Aug 26 — "design it to match the scheduler board … make it blend in"). The
same `.availpuck` markup renders in two surfaces: the edit week (between the
tinted `.plist.sec` Personal-Inputs and SANS groups) and the board's aircrew
column (between the neutral `.sb-panel` Personal-Inputs and SANS panels). CSS
scoped to `#schedBoard .availpuck` (in `scheduler.css`) drops the green-tinted
fill, the green heading and the 10px indent and adopts the `.sb-panel` / `.sb-ph`
look — a neutral card, a neutral `--ink` uppercase header on `--panel-2`, and a
JetBrains-Mono `.n` sub — keeping ONLY the 3px green left tab, the same
category-colour tab every sibling board panel carries, so it lines up as one
more section. The WEEK copy is deliberately left tinted: there its neighbours
are tinted too, so the green card matches. Markup is unchanged, so the fold and
drop-to-unassign contracts above are untouched.

## Reordering rows on the board (§Dense row reorder)

A dotted grip (`⠿`, `board-html.ts`'s `sbGrip`) sits at the start of every movable
board row and reorders it by DRAG at ALL widths (owner, 31 Aug 26 — "remove up and
down arrow and add a drag marker to those lines"). This REPLACED the 8 Aug split where
the phone hid `.sb-grip` and showed a ▲▼ nudge (`.mbtn.nudge`, `sbNudge`) instead:
`sbNudge` now returns '' (no ▲▼ renders at any width — and ~2 nodes/row come off the
board DOM budget), and the grip paints everywhere. The grip is still ALWAYS emitted
(`.ro` alone hides it on a read-only board), never conditionally on viewport width, so
the panel's string-diff stays width-independent and survives a resize.

**The address lives on the ROW, never on the grip** — `data-move="mv:…"` (`rowMove`)
is an attribute of `.sb-line` / `.sb-arow` / `.sb-nrow` itself, not the `.sb-grip` span
inside it. `rowdrag.ts`'s pointer machine finds the row under the moving finger with
`closest('[data-move]')`, and a pointer spends far more of a drag over the row's body
than its ~13px handle; if the address lived on the grip a drop could only land while the
pointer was back over the handle, which is not a drag. The grip carries
`touch-action:none`, so a thumb-drag reorders instead of scrolling the page.

**The phone grid gains a 20px LEADING MARKER TRACK, and the header shifts with it.**
`.sb-lcols/.sb-line` (flying line), `.sb-acols/.sb-arow.c6r` (duty / sim / ground /
Common Programme) and `.sb-nrow` (notes) each prepend a marker column on the phone; the
header's leading placeholder (`.sb-lcols/.sb-acols > :nth-child(1)`) is un-hidden so the
column TITLES shift right by the same track — every box stays UNDER its own heading
(owner, 31 Aug 26 — "the box must align with the title"). The first (name / callsign) box
shortens by the track; the right-hand tracks are untouched, so the c6r remarks box stays
154px right-anchored and still lines up with the flying line's. The track was widened
13px → 20px in the same-week follow-up (owner — "the text box just starts right of the
drag marker … not inside the text box"), and the row glyph is left-aligned in its lane
(`.schedboard:not(.sb-wide) .sb-grip{justify-content:flex-start}`), so the handle sits in
its own lane clear of the first box — MEASURED handle-to-box gap 8px → 17px. Widening the
track does not affect puck fit (see below), and the row grip still lines up horizontally
with the section / wave grips (all within a 2px band — the owner's "align with GO 1").
The grip was ALWAYS a DOM child (display:none before, shown now), so every `:nth-child`
index in the phone block and its `.sb-wide` mirror already counted it; the c6r cell spans
are name `2/4`, rmkin `3/-1`, and the flying line's rcell `4/-1`. A future column change
to either template must shift these together or a phone / `.sb-wide` layout silently
picks up the wrong cell.

**The two-puck rows shift FLUSH-LEFT — the puck container reclaims the marker lane on its
own line** (owner, 31 Aug 26 follow-up — "the pucks can shift it back to the left so that
it holds 2 pucks not blocked"; "all the pucks were further towards the left … make sure
the rest are placed back to the same area"). A flying line's FCP+RCP seatpair and every
c6r crew cell (single-puck duty / ground AND the AMT/sim two-wide `fcprcp` box) carry
fixed 74px pucks (never resized — "pucks never wrap" + the AMT droppable-hole geometry
spec). Two 74px pucks + the 6px gap need 154px, and with the 154px right-anchored remarks
box that is a tight fit; the leading marker track pushed them 17–20px right and the
SECOND puck's flag clipped under the remarks. Because the row grip bottom-aligns to the
FIRST line, the marker lane is empty on the SECOND line where the pucks sit, so the puck
container spans from track 1, not 2 — `.sb-line .sb-seatpair{grid-column:1/4}` and
`.sb-arow.c6r>.ppl{grid-column:1/3}`. MEASURED: every puck moves from 17–20px right of the
marker to flush with it (delta 0 — the old layout's position), and the clip fully clears
at 390px+ (the sub-~383px residual is the accepted-tight zone — the puck pair + 154px
remarks simply exceeds the row there). No puck is resized, so the droppable-hole spec is
untouched; puck clearance depends only on row width, so the marker-track width is free.
The `.sb-wide` desktop layout resets these spans (display:contents / grid-column:auto),
so it is unaffected.

**Grip vertical alignment is a MEASURED contract — grip-centre = box-centre, delta 0**
(owner, 31 Aug 26 — "align it vertically with the rest of the text boxes … make sure all
the alignment is considered for all drag markers … I don't want to keep repeating this").
The flying line's first-row boxes bottom-align under the tall B cell (which stacks the
blue brief time above their line), so its grip bottom-aligns too at the box height
(`.sb-line>.sb-grip{align-self:end;height:24px}`); the c6r and notes rows sit in a
box-height first grid row, so their grip centres there with no override; the section /
wave / crew grips are box-centred in their headers. All were verified delta 0 with a
browser measurement pass. Don't move a grip's placement without re-measuring it to delta
0 against its neighbour box.

`.sb-nrow` still needs its own phone template — the note row is grip + `nx` ("1.") +
`nin` + `.lctl`, so its phone grid is `20px 22px 1fr 74px` (marker, number, note,
controls). The `boardMbtn` `mv:up/dn` handler is kept as an inert guard for a stale
element; nothing emits its address now.

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
inside the AMT and OFT sim sub-headers each next to their own `+ Row`
(the AMT's also carries `+ Block` — the three-row mint, see §The OFT takes
instructors / the `+ Block` paragraph under it),
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

## The legend collapses, and its flags read by severity (owner, 15 Aug 26)

The key at the top of each week (`html.ts legendHTML()`, rendered in
`Shell.tsx` as `#vLegendBox` / `#eLegendBox`) is a native `<details>`,
**closed by default** — on a phone the ~20-row key used to render before the
first day's schedule. The summary is one `.legend-sum` chip; no JS, so the
toggle stays keyboard-operable. Note `.legend{display:flex}` overrides the UA
rule that hides a closed `<details>`'s body, so `.legendbox:not([open]) .legend`
must hide it explicitly — without that line the collapse is inert.

The FLAGS inside now read top-down by **severity** — red (hard) first, then
amber (adv), then grey (note) — instead of the reference's order; the LEVELS
stay in the CAT ladder (`OCU→D→C→B→A→IW→IP→IR→FI`). This is a deliberate
divergence, so the legend is no longer byte- or order-identical to the
reference: `html.test.ts` compares the **multiset of leaf texts**
(order-independent) to prove nothing was dropped/added/recoloured, and a
separate test pins the severity order. The colour-per-tier and
every-chip-has-a-row tests (above) still carry correctness. A new flag row
slots into its severity group and needs no test change beyond those.

## The Quals callsign column is frozen (owner, 15 Aug 26)

On a phone the Quals table is wider than the screen (`min-width:1050px`) and
scrolls sideways inside `.qwrap`; the CALLSIGN column is `position:sticky;
left:0` (the `td.qname` and the `th[data-sort="cs"]` corner), so the identity
column stays put while the currencies scroll under it — otherwise a phone user
read rows of unlabelled ticks. Two things it depends on: the 20px page gutter
is a **margin** on `.qwrap`, not padding, or the frozen cell sticks at the
padding edge and scrolled cells show through the gap to its left; and a
right-edge `box-shadow` marks the freeze boundary so a half-scrolled column
reads as content passing under a pinned column, not a stray fragment. Gated in
`e2e/geometry.spec.ts` (jsdom has no sticky), not jsdom.

## The Quals HEADER freezes on scroll (owner, 29 Aug 26)

The column headings (CALLSIGN … REMARKS) and the group row (`Assigned pilots ·
N`) stay put when the page scrolls down — "freeze like the leave war top bar …
desktop and mobile … same mechanism". It IS the Leave War mechanism
(`src/leavewar/ui/Matrix.tsx` `.mxfixed`, and its `.mx-wrap` preamble spells out
why): `.qwrap` scrolls the table sideways so it owns the horizontal axis, the
PAGE owns the vertical, and no `position:sticky` can freeze a header against the
page while its own scrollport owns the other axis (the `thead` already carries a
`top:0` sticky that pins nothing for exactly this reason). So `QualsPage` mounts
a **fixed mirror** (`.qfixed`/`.qfixed-scroll`, `data-testid="qsticky-head"`) of
the heading + group row the instant the real header's top passes the app top
bar's lower edge, pinned there, and unmounts it when the header comes back. The
mirror reuses `qualsHead`/`qualsGrpRow` (one source for the markup — no drift
seam), sizes its columns from a colgroup of the live-measured header widths
(`table-layout:fixed`) so they land over the grid's, and is its own thin
horizontal scroller kept in lockstep with `.qwrap` (one-way grid → mirror, the
Leave War fling lesson) so the frozen callsign column's own sticky-left works
inside it. `z-index:55` sits under the top bar's 60. A click on a heading in the
bar still sorts. Browser-only — jsdom has no layout, so the mirror never mounts
there (`quals.test.tsx` pins its absence); the freeze is verified on the live
view at desktop and phone widths.

## Dragging sections and waves (owner, 29 Aug 26; in-place drag 30 Aug 26)

A scheduler drags the big section panels — **Overall Notes · Common Programme ·
Flying waves · Duties · Sims · Ground Programme** (Overall Notes and Common Programme
are one combined block on the edit week) — and the flying WAVES within a day into whatever order
they want, on both Edit Schedule and the Scheduler Board, and a saved **whole-day
template** remembers it. This REPLACED the per-day `⇅ Arrange` sheet (deleted 30 Aug
26): the owner asked for handles on the blocks themselves, not a modal.

**The handles.** Every reorderable section is wrapped in a draggable unit carrying a
dotted grip inline in its own header — `.sb-sec[data-secmove="di.key"]` on the board,
`.dsec` (edit mode only) on the week — and every wave block carries a grip in its header
(`.wvgrip`) plus `data-move="mv:w.di.gi"` on the block (`.sb-go` / `.go`). The dense
board ROW grip (`.sb-grip`) is shown at every width too since 31 Aug 26 (the ▲▼ nudge it
used to defer to on a phone is gone — §Dense row reorder); a section or a wave is an even
bigger target, so these grips
**stay draggable at every width** (the "drag, no arrows" design). The machine is
`ui/rowdrag.ts`, wired on both the board wrap and the edit-week root; it tells the
three draggables apart by the grip pressed, walks up to the enclosing wave block for
a wave drag (so a wave drops onto another wave, not a line inside it), and validates
the drop against `applyMove`'s own same-container rule so only a legal target
highlights. Grips are **edit-mode only** on the week, so the view week — and the
reference byte-compare — carry none (parity stays 728/0; pinned in `html.test.ts`).

**A held drag auto-scrolls at the screen edges (owner, 31 Aug 26).** A day is far
taller than a phone, and the grips carry `touch-action:none` (so the finger holding
a drag never scrolls the page itself) — which left a section far above or below out
of reach. So while a drag is live and the finger sits in the top/bottom 72px margin,
`rowdrag.ts` scrolls the surface under it at a distance-ramped speed (up to 22px a
frame) via `requestAnimationFrame`, and after each step re-reads what is now under
the still finger (`elementFromPoint`) so the drop target keeps updating without a
pointer move. The surface it scrolls is found by walking up from the carried element
to the nearest thing that actually overflows — the board's `.sb-board` / `.sb-main`,
or the **window** for the edit week — so it is right on either page. For this to
track to the very edge, `pointermove` is bound to the **document, not the surface**
(the same reason `pointerup` already was): the drag releases pointer capture so the
target follows the finger, so once the finger leaves the surface — off the bottom, or
up over the app header — a container-bound handler would stop firing and the velocity
would freeze; on the document it keeps tracking, and the loop stops the instant the
drag ends. Both wirings' handlers early-return until their own instance owns a live
drag, so board and week don't collide.

**The frozen-preview guard is per dragged DAY, not per board day (bug-hunt fix,
1 Sep 26).** `onDown` used to refuse a pickup whenever the BOARD's selected day
was previewing (`DPREV.has(SBDAY)`) — but the machine is wired on the edit week
too, where seven days render live and editable at once, so a preview left open
on the board silently killed every drag on the week. The guard now reads the day
off the grip's own address (`mv:<kind>.di…` / `secmove "di.key"`), the same
per-day reading `armSlot` uses. A previewing day emits no grips at all
(`dayPreviewHTML` renders with `ed=false`), so the guard only catches a stale
element from the pre-preview render. Pinned three ways in `rowdrag.test.tsx`.

**Every handle is the same dotted `⠿`, inline in the section's own header (owner,
31 Aug 26).** This REVERSED the 30 Aug drawn-rail: the owner asked that "the drag
markers should all follow the old design in which it's dotted" and be reachable on a
phone. So the section grip (`.secgrip`) is now the same inline `⠿` the row (`.sb-grip`)
and wave (`.wvgrip`) grips carry, placed as the FIRST child of the panel's own header
— board `.sb-ph`, week `.ah-h` / `.sub-h` / `.wv-sech` — not as an overlay rail in
the gutter. Inline, it **lines up with the wave grip's column** (the owner's "align
with GO 1"), **pushes its title clear of itself**, and **centres on the title line**
(`align-items:center` on the header). On the board the header's flex `gap` is tightened
to 6px (`.sb-sec .sb-ph`) so the added grip borrows from the header's own spacing, not
from the sub-text or the right-side buttons — measured on a 390px phone, a 16px gap to
the buttons remains, nothing overlaps (owner — "make sure any text or buttons on the
right aren't too close or overlapping"). The headers set `user-select:none` so a thumb
holding the grip never paints the title blue (owner — "as you hold on the track marker
it tends to select the text beside it"). The week's Flying-waves section still gets its
edit-only `.wv-sech` "Flying waves" header so the inline grip has a header to sit in;
edit-only, so the view week and the reference stay byte-identical (stripped in
`html.test.ts`'s compare). Don't return the section grip to a rail/overlay, drop the
no-select, or drop the `.wv-sech` header.

**Overall Notes and Common Programme are two separate sections on the board (owner,
31 Aug 26 — "split them apart").** Each is its own `.sb-sec[data-secmove]` card with
its own dotted handle, independently draggable — the board flagged Common Programme as
"missing" its handle because the old combined 'prog' unit carried a single handle that
sat up on the Overall Notes panel. On the EDIT WEEK the day notes still print as lines
inside the Common Programme block (they never had a card of their own there), so the
week keeps them in the 'prog' slice and its 'notes' slice is empty and skipped — which
is what keeps the view week and reference byte-identical (the empty slice adds nothing).

**The four crew working-aid panels join the board's one draggable list (owner, 31 Aug
26 — "one list, drag anywhere").** Personal Inputs, Available crew, SANS availability
and Unavailable are ordinary section keys now
(`SECTIONS=['notes','prog','waves','duty','sims','ground','inputs','avail','sans','unav']`),
each wrapped in its own `.sb-sec[data-secmove]` card with the same dotted grip — so on
the Scheduler Board any card can be dragged to any position (Available crew up next to
the flying waves, say), not only among the crew group. **They drag on the EDIT SCHEDULER
too since 31 Aug 26** (owner — "drag markers on edit scheduler … follow the same
formatting as the rest of the sections"): in EDIT mode `ui/html.ts dayHTML` emits all
ten sections — the crew four included — through the SAME `secOrder` loop as the board,
each wrapped in a `.dsec[data-secmove]` with a grip, so a drag on either surface drives
the ONE per-day order (no second copy to drift). It is a scheduler WORKSPACE arrangement,
not a published property: the **VIEW week is untouched and parity-locked** — there the
four are not draggable and only Unavailable prints, appended in its fixed tail exactly as
before, so the whole change is gated on `ed` and `dayHTML(view)` (with the reference)
stays byte-identical, 728/0 (pinned: the parity gate and `ui/html.test.ts`). The grip is
injected on the board by a loose `sb-ph`|`ap-h` header match in `board.ts wrapSec`, and
on the edit week by a first-header regex (`ah-h`|`sub-h`|`ap-h`) in `dayHTML`'s `gripIn`;
Available crew's header is `.ap-h` (re-laid to flex-start with `.n` floated right so the
grip rides with its title — `.sb-sec .ap-h` on the board, `.dsec .ap-h` on the week);
Personal Inputs' foldable header centres the grip; and a grip-tap on the two foldable
headers (`data-pitog`, `data-avtog`) is guarded in `interactions.ts` so it starts a drag,
not a fold. Don't fold the crew panels back into a fixed tail, and don't let their order
reach the VIEW week (the edit week now shares the board's, gated on `ed`).

**A section move is display order only.** The order lives on the day as `d.secOrder`
(absent ⇒ the default order), resolved by `engine/order.ts secOrder(d)`. It never
enters a slot key, `SCHED.*`, or an AL: re-arranging a panel moves no row inside any
array, so every `di.gi.li.ai` / `d:` / `s:` / `g:` / `a:` key is unchanged and
`validate()`/publish/history read exactly what they did — the owner's "don't corrupt
the rules" requirement (pinned in `engine/secorder.test.ts`). Both builders emit
sections through `secOrder`: `ui/board.ts boardHTML` assembles a `{notes,prog,waves,
duty,sims,ground,inputs,avail,sans,unav}` map (notes and programme are separate cards
there, and the last four are the crew working-aid panels), `ui/html.ts
dayHTML` slices its accumulator at the boundary marks and re-emits — the **default
order is byte-identical** to before, and the week's empty `notes` slice is skipped so
it adds nothing. The drop routes through `state/store.ts moveSectionTo` →
`engine/order.ts reorderSectionTo` (a drop can span several positions, so it moves
fromKey→toKey, not ±1), `histPush` + `notify`, **no `markEdit`**: one undo step, not an
amendment. Admin + edit-surface gated at the write path. `notes` is Overall Notes and
`prog` the Common Programme — two draggable cards on the board; on the week the day
notes print as lines inside the Common Programme block, so the week's `notes` slice is
empty.

**After a section drag, the admin is offered a house default.** `ui/SecDefaultSnackbar.tsx`
(state `SECDEFOFFER` in `pops.ts`) — an actionable bar (the plain `toast()` can't
carry a button) reading *"Use this section order as the default for every day?"*.
"Set as default" writes that day's order through `engine/order.ts setSecDefault` +
`secDefaultSave` — the SAME default the Admin → Squadron config panel edits, so the
two never drift — making every un-arranged day follow it henceforth. This replaced
the old sheet's one-week "Apply to all days" (dropped: the henceforth default
supersedes it). No prompt after a WAVE drag — the wave house default is a separate,
new-schedules-only, kind-based thing (below).

**Unlike a section move, a wave move IS a real model reorder and an amendment.** The
drop routes through `applyMove('mv:w.di.gi', 'mv:w.di.gj')` → `engine/reorder.ts
moveWave` → `afterSchedMutate` + `notify` — unchanged from before. `moveWave` is the
manual sibling of Auto sort's `sortWaves`: it splices `d.waves` and remaps the SAME
nine key-space heads (`wl: ff: fr: st: ar: at: it: tr:` and the bare seat head), so
the wave carries its whole key space and every crew name stays attached (pinned in
`engine/reorder.test.ts`). Reordering a wave on a **published** day records an AL row
(correct — moving a flying wave is a schedule change), silent on a draft day (25 Aug
amendment-marks rule). The **day template remembers wave order for free** — wave
order IS the `d.waves` array order, deep-cloned by `daytpl.ts mintBlob` (pinned in
`engine/daytpl.test.ts`).

## The Default arrangement (Admin → Squadron config)

The per-day drag above sets ONE day's order (and its snackbar can promote that to
the house default); the **Default arrangement**
panel (owner, 29 Aug 26 pt.2 — "allow the default arrangement of a schedule to be
configured in admin … even to the arrangement of the waves under display") sets the
GLOBAL house order once. It is `ui/AdminPage.tsx ArrangeDefaults`, at the top of the
Squadron-config pane, reusing the sheet's `.arrsec` rows and `.tnudge` ▲▼ so it
reads the same. Admin + `canEditSched()` gated at every nudge (write path, not only
the UI). Two lists:
- **Section order** — the ten panels (six schedule + four crew), `engine/order.ts
  secDefault`/`moveSecDefault`. It is the fallback every un-arranged day renders in;
  the six schedule sections apply on both Edit Schedule and the Scheduler Board, the
  four crew lists (Personal Inputs, Available crew, SANS, Unavailable) reorder on the
  Scheduler Board only (a hand-arranged day keeps its own order). Display-only; a
  **Reset to standard order** button returns it to canonical. `#admSecDefault`.
- **Flying-wave order** — the built-in kinds (Flying wave / SC / AVALON / BB),
  `engine/reorder.ts waveDefaultView`/`moveWaveDefault`. It starts **off** (the panel
  shows the canonical kinds as a starting point); once set, a NEW wave added to a
  not-signed-off day lands in this order (SC on top, etc.) and never re-orders a
  planned or published day (`board.ts placeAddedWave`). A **Turn off wave order**
  button clears it back to append-at-bottom. `#admWaveDefault`.

Each nudge persists immediately (`secDefaultSave` / `waveDefaultSave`, both writing
`null` at the un-customised baseline). Pinned in `ui/admin.test.tsx`,
`engine/arrdefaults.test.ts`, `ui/wavedefault-add.test.tsx`.

## Selection highlight (`ui/highlights.ts`)

**A click on blank schedule clears EVERYTHING that lights a puck** (owner,
10 Aug 26 — "every puck should be deselected"). Three separate mechanisms can
light one: the blue puck selection (`SELID`, plus `WFOCUS` / `PFOCUS` / the
open day boxes), the **HIGHLIGHT chips** (`HLSET`), and the **search**
(`SEARCH`). Only the first used to clear, so a scheduler could click the board
empty and still be looking at a lit week with nothing on screen explaining
what was holding it. All three now go together, in `interactions.ts`'s
blank-click branch.

The **search inputs are uncontrolled** (`#searchV` / `#searchE` / the board
bar's `#searchB`, `onInput` only, no `value` prop), so their DOM value is
wiped by hand — clearing just the state would leave a box reading "bane" with
nothing lit, which is worse than not clearing at all. The chips redraw
themselves from `HLSET`.

**Search and the Highlight chips are reachable on all THREE schedule
surfaces since 23 Aug 26** — the view week, the edit week and the board bar —
one `HLSET`/`SEARCH` pair and one chip definition (`ui/hlchips.tsx`) behind
all of them, so a chip lit anywhere is lit everywhere and this clear rule
covers the lot.

**The scope is the whole app shell, not just the page bodies** (owner, 15 Aug
26 — a blank click "beside the edit schedule date or above" left the pucks
lit). The reference scoped the clear to `#page-viewsched,#page-editsched,#schedBoard`,
so a click on the topbar, the title row's gutters or the shell's own margins
fell outside it and the selection survived. It is `#shell,#schedBoard` now
(`#shell` wraps the topbar and every page; the board is its own overlay
sibling), so any blank area clears.

The **exclusion list decides what counts as blank** — the reference's, plus
`.modal` / `.drawer` for the overlays that now sit inside the widened scope, so
a click inside a dialog or the phone drawer does not reach through and clear.
`.fchip` and every form control are on it, so clicking a chip or into the
search box is not a blank click and does not wipe what you just did. Pinned in
`ui/interact.test.tsx`: a topbar and a shell-gutter click clear, a modal click
does not, and the search/chip controls stay excluded.

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

**A freshly added row / line / wave / block wears a blue box for ~6s (owner,
14 Aug 26 — "everytime I add a new row block or wave there will be a blue box
around the new thing added for around 6 seconds").** Every board add funnels
through `markStructuralAdd` (`publish.ts`), which fires `HOOKS.flashAdded`;
`state/view.ts` holds the add's own funnel key in `FRESHADD` on a 6s timer
(one per flash, so a second add does not cut the first short), and
`paintFreshAdds` (`highlights.ts`) hangs `.sb-fresh` after every board render —
NOT baked into the builder string, for the same reason `paintArm` is not: the
board diffs each panel to decide whether to re-hang it, so a class in the
markup would force a re-hang on every keystroke and an unrelated edit would
drop the box. The STEADY box is a static box-shadow in `#1E86FF` (the selection
blue), never an animation, because the pass clears and re-adds the class on
every repaint and an animated hold would replay and flicker; only the
DISMISSAL fades — `.sb-fresh-out` is added for the last `FRESH_FADE_MS` (a
second timer in `view.ts` moves the key into `FRESHOUT`), so the one window a
repaint could restart the fade is that ~0.55s tail, where a re-fade is
invisible, and `prefers-reduced-motion` drops it to a plain hold-then-remove.
A row/line/note
matches on its `data-bfld` key climbed to its container (`.sb-arow` /
`.sb-line` / `.sb-nrow`); a wave has no `data-bfld` on the board, so its
`data-wsel` header stands in and the whole `.sb-go` boxes, with the inner
first line deduped out (an outer target always beats one it contains); a duty
`+ Block` records only its `dl:` header key, so its loose sibling rows are
boxed by hand up to the next block. Board-only (adds happen there), off a
frozen preview, inset + soft glow so it never shifts a neighbour or is clipped.
A key renumbered by a delete inside the window just stops matching and the box
drops a beat early — cosmetic, so it is deliberately NOT wired through
`remapViewKeys` (which is a no-op now that `RMKOPEN`, its one-time only client,
is retired — see the "every remarks box rides the pucks' row" contract). Pinned
in `ui/board.test.tsx`; the paint
itself is left to the eye on the live bundle (jsdom measures every rect 0×0).

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

## Feedback: every tap answers (owner, 15 Aug 26)

The owner's phone complaint: "when I click add input the button doesn't
flash… I'm not looking at the line that appeared below." Root cause was
app-wide, not local to one control — every button in `scheduler.css` had a
`:hover` rule and no `:active`, and hover never fires on a touch tap, so a
phone got no feedback for any press at all.

**Press states are ONE grouped rule, not one per button class.**
`:root{--press-scale:.97}` (dropped to `1` under
`prefers-reduced-motion:reduce`, which is how the rule sheds the shrink and
keeps the darken) feeds a single selector list —
`.abtn,.fchip,.pillbtn,.rok,.rmx,.inact .red,.mbtn,.dbeak,.wm,.dinfobtn,
.so-clear,.nav a,.login .go,.sb-slot.empty` — each `:active`ing to
`filter:brightness(.88);transform:scale(var(--press-scale))`. Defined once
so it reads as one app-wide behaviour rather than a pile of per-button
rules, and `transform:scale()` on purpose: it never reflows, so no measured
layout contract in this file moves when a button is pressed.

**The just-added row's flash is now the SAME steady shape everywhere it
appears — the board's `.sb-fresh` box (see §Selection highlight above) and
the Inputs table's `.innew` are ONE timing, not two.** The old `.innew`
keyframe faded across its whole 1.5s lifetime, which read as half-gone by
the time a phone user looked up from the form below the fold; it is now a
steady `box-shadow` inset in the selection blue (`#1E86FF`) that HOLDS for
90.83% of a 6000ms run (5450ms — the exact split `FRESH_MS`/`FRESH_FADE_MS`
in `state/view.ts` use for `.sb-fresh`) and fades only in the last 550ms.
The Inputs page's own `FLASH_MS` was raised to match (1500 → 6000) for the
same reason. It animates on the `<td>` cells, not the `<tr>`, because a
row's own box-shadow sits under its cells' and would be clipped by them.

**Adding an input snaps the view to it** (owner — "once an input is made,
the view will snap to the input u just made"). The row already pinned to
the top and flashed, but on a phone the user is still looking at the form,
below the fold, not at the table. `add()` sets a `justAddedIid` state; an
effect keyed on it runs `scrollIntoView({block:'nearest',
behavior:'smooth'})` on the `[data-iid]` match once React has painted the
new `<tr>` — it can only be scheduled, not run inline, because the row
commits to the DOM after the triggering render. Guarded exactly like
`interactions.ts`'s own `scrollIntoView` calls: jsdom implements no
scrolling at all, so the call is simply absent on its elements, and an
unguarded call throws out of the effect where no test assertion sees it.

**An accepted Personal Input's new ground row now flashes too.**
`acceptInput` marks it through `markStructuralAdd` rather than the bare
`trackStructuralAdd`+`noteChange` pair every other structural add left
behind on 15 Aug 26 — see `docs/engine-rules.md` §Accepting a personal
input for the key change (`g:di.ri` → `gr:di.ri.prog`) this needed.

**Silent actions now toast.** A tap that changes something and says nothing
back reads as "did it register?" — closed on the Inputs page (save, delete,
CSV export), the Quals page (add-person, CSV export), the schedule export
(`#exportSched` on the Edit page's `.filters` row — an Excel-file icon since
23 Aug 26, not a text label, with a `#exportPdf` sibling that prints the
week through the browser's print pipeline, "Save as PDF" in the dialog;
that printable layout is deliberately basic for now — `ui/printpdf.ts`),
and the template/draft editors'
destructive actions (`DayTplModal`/`DraftsModal` — Reset, Delete). A phone
browser often shows nothing at all when a CSV download lands — no bar, no
tray notification the user is looking at — which is what makes the export
toasts load-bearing rather than decorative.

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

**Dismissing a warning box HOLDS the view where it snapped** (owner, 14 Aug
26 — "when I click on an empty space… my view snaps to some random area. hold
my view steady"). Clicking a warning snaps the view DOWN to the guilty puck,
which leaves the day's expanded warning box off the top of the screen. A
blank-space tap collapses that box (`selDrop` clears `DWOPEN`), and because a
day repaints by an `outerHTML` swap the browser's own scroll anchoring cannot
survive the replaced node — so the height removed above the viewport used to
fling the whole page up (measured −1103px on a phone, the puck clean off the
top). `interactions.ts`'s blank-clear now queues `holdViewStill` before the
collapse, the same `queueHold` machinery that holds a puck still on selection:
it anchors on a puck the reader is looking at and undoes the shift at the end
of the render's highlight pass, in the same task as the swap, before the
browser paints. Two details are load-bearing:

- The anchor is drawn only from the **days actually collapsing** (`DWOPEN` at
  capture time — a person-selection fills it with that person's flagged days
  too) and only from pucks **fully on screen** (both axes). A puck in a day
  scrolled off to the SIDE has a valid vertical top but never moves when THIS
  day shortens, so anchoring it would measure a zero shift and leave the real
  jump uncorrected — which is exactly how the phone first failed.
- The board is excluded: its warning list scrolls inside its own capped
  panel, so nothing above the viewport moves, and holding the week behind the
  overlay would scroll it out from under the board.

Gated in `e2e/geometry.spec.ts` (the puck the warning focused stays put across
the dismiss); jsdom reports every rect 0×0, so the delta is zero there by
construction and only a browser can see the hold.

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
blank line is still validated against that same suggested time.

**SC is the exception (owner, 24 Aug 26).** On the week an SC line has no B
column (it shows SHIFT / START / END). On the board it keeps its B input — but
that box is an **in-time**, not a brief: no blue suggested-brief ghost is
offered on an SC line, and typing one is read by the engine as the crew's
report time (`docs/engine-rules.md`, the SC B rule). The board also drops the
SC wave header's "in-time · N ac" note. AVALON/BB are unchanged — the owner
named SC. Note the seam this leaves: an SC in-time is entered and shown only on
the board, not on the desktop week's shift row; "we will hardly have a brief
time," so it is rare, but a value typed on the board is not surfaced on the
week.

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
  `late show` / `show at brief`, while that crew still clears rest by step
  (`VCONF.step`). Past step it goes back to solid — see
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

### The forward trace across the week edge — a phantom row (owner, 23 Aug 26)

The three marks above stop at the loaded week's own edges: a within-week
breach traces backward onto the day before it, but a late Sunday busting
NEXT week's Monday had nothing to draw, because Monday belongs to a week
that is not on screen. Fixed the same day the owner asked for it, from the
deployed site — "If I plan someone who bust crew rest the day prior it
should also flag out just like what u see for outlaw" — by writing the
SAME `.dwtrace` row onto Sunday's own card, sourced from a phantom pass of
the engine's crew-rest computation against next week's seeded Monday
(`engine-rules.md` §validation has the mechanism).

On screen it reads as an ordinary trace row with two differences, both
because it addresses a warning this week's DOM cannot reach:

- **No `data-wdi`/`data-wix`.** Every other trace row carries the next
  day's warning address so `interactions.ts`'s `.witem[data-wdi]` branch can
  focus it; this row's `t.di` is `null` (the engine's own phantom-day
  marker), so `dayTraceHTML` omits both attributes entirely rather than
  emitting an address nothing can resolve. `interactions.ts`'s handler
  simply never matches it — a tap on this row does nothing, by construction,
  not by a guard that could be forgotten.
- **The title says where the breach actually lives.** In place of "Jump to
  the line on this day that caused it" (the within-week row's title, which
  still applies to `fromKey`), this row carries **"Next week's Monday — load
  it to see the breach itself"** — telling the reader there IS a real,
  clickable warning, just not one this screen can open.

It still reads text-identically to the within-week case otherwise — "Breaks
Monday", the man's name, his leave-by time, the same message — and sits in
the exact same place in the day's issue list (inside `.dwtrace`, ranked
under this day's own hard rows, on-demand behind the same `DWOPEN`/`PFOCUS`
gate). A reader should not have to learn a second shape to understand it;
the row LOOKS the same because it means the same thing — a red consequence
tomorrow, not a problem today — the only thing that changed is what tapping
it can do. Filtering happens once, in `dayTraceHTML`: a row keeps only when
its warning resolves to a real index OR `t.di==null` (the forward case),
so a stale forward trace whose underlying breach has since been edited away
drops out exactly like a stale within-week one does.

## Duty templates (owner, 13 Aug 26)

`+ Block` under Duties opens the TEMPLATE picker — a `.wavemenu` popup listing
the saved templates (`DUTYTPL_CFG`), an "Empty block", and a ✎ that opens the
editor. No wave is consulted (that coupling is gone); picking a template copies
its rows onto the day as a plain block (`board.ts`'s `blockMenu`, minting
through `blockFromTpl`). The editor is `ui/DutyTplModal.tsx` — a `.modal`
opened by `TPLEDIT` (`pops.ts`; since 23 Aug 26 the Admin page's
`#admDutyTpl` sets the same flag as a second front door): tabs per template + New,
an editable title, and one `.trow` per role with a `DUTY_PICK` datalist,
start/end, ▲▼ reorder and delete; Reset / Delete / Done in the foot. Every edit
runs the matching `engine/dutytpl.ts` mutator → `dutyTplSave()` → `notify()`,
so it persists per-device like the stores list. The library is never left
empty — deleting the last template re-seeds one. Storage and the plain-block
rule: `docs/engine-rules.md` §the duty block. This surface replaced the old
wave-driven desk.

## Day templates and Drafts — the whole-day controls (owner, 15 Aug 26)

Both live in the SAME two places on both surfaces, for the same reason: a
whole-day master template is a level up from the duty desk above, and a
draft is an alternative to the whole day, so neither belongs squeezed into
an already-crowded control bar.

**On the board**, a labelled `.sb-panel` — "Templates & drafts", two
buttons — sits at the VERY TOP of the board's own content, ahead of every
section, not on the top bar's first line (`CLAUDE.md` §Stable decisions:
that line is frozen — nothing joins it without something else leaving). A
control that can replace the WHOLE day belongs at the top of the day's own
content, the same reasoning the section-level `+ Wave`/`+ Block` controls
already follow, rather than squeezed onto an already-full 30px bar.
Withheld on `mvRO` like every other write control on this board.

**On the week**, both buttons ride inside the day's own sign-off strip
(`<div class="signoff day-sign" data-signbar="${di}">`) — and that placement
is deliberate, not incidental: that strip is ALREADY excised wholesale from
`html.test.ts`'s edit-mode byte-parity assertion (the same excision the
sign-off pills themselves rely on, §Sign-off pills above), so adding a bare
`<button>` inside it costs nothing against the reference comparison and
keeps that gate honest rather than weakening it to make room. A control
placed anywhere else on the day-head would have needed the byte-compare
loosened for real markup, which is the one thing that gate exists to catch.

**One picker per feature, reached from either door.** `board.ts`'s
`dayTplMenu`/`draftsMenu` are the SINGLE builders; the board's own buttons
(`data-daytpladd`/`data-draftsadd`, routed through `boardMbtn`) and the
week's strip buttons (`data-daytplopen`/`data-draftsopen`, routed through
`interactions.ts`'s `routeClick`) both open the identical popup — different
data attributes only because the two handlers are scoped differently
(`boardMbtn` requires `.mbtn` inside `#sbBoard`; `routeClick` is global), so
a shared attribute name would risk one click opening the menu twice. Neither
menu renders unless `canEditSched() && HOOKS.editMode()`.

**Day templates**: the picker lists the saved library (tap = apply, with the
day's read-only structure summary — waves/duty blocks/ground rows/sims
counts — under each name), "+ Save this day as a template", then a ✎ into
`DayTplModal.tsx`. Applying a template on a published day toasts "Reopen the
day first" rather than silently refusing; applying elsewhere is one whole-day
swap logged as one sentence — there is no single funnel key for a whole-day
replace to hang the usual blue box on, so a named toast carries the news
instead (`docs/engine-rules.md` §Day templates). `DayTplModal.tsx` manages
the library only — rename, delete, Reset — never a row editor: a day
template's content is a whole day's worth of waves, duties, sims and ground
rows, which already has its own editor (the board / the week themselves), so
a second, narrower copy of those surfaces here would only drift from them.

**Drafts**: the picker lists the day's drafts (tap a non-selected one to
switch, the selected one marked ●), "+ Duplicate this day → new draft", then
a ✎ per row into `DraftsModal.tsx` (scoped to the one day whose menu opened
it, unlike the template library's global one). `DraftsModal.tsx`'s name
field commits on blur/Enter, not per keystroke — `draftRename` refuses empty
and duplicate names, and refusing mid-keystroke would fight the typist — and
its Delete/Select buttons disable on the selected draft with a title
explaining why. Duplicating and switching both toast a named sentence for
the same no-single-key reason templates do.

**The day-head strip names which draft is live** (edit surfaces only —
`.ddraft`, next to the version chip, own colour so the "one version chip"
pin does not count it): once a day has drafts, `dayStatHTML` says "`<name>`
is the live one, and is what publishes" — the view page's own picker below
already names the selected one, so this chip is `ed`-only.

**Drafts on a published day (owner, 15 Aug 26 — the reopen-first refusal
is gone).** The menu's rows and Duplicate all WORK on a published day now:
`switchDraft` lets `draftSelect`'s rebase re-mark the day's pending set as
the true diff against the issued document (engine-rules §Drafts), and its
toast reports what that came to — "Switched to "X" — this is now the live
Wed · 2 differences from AL1 pending" / "· matches AL1 — nothing pending".
The menu carries a one-line note on a published day ("This day is published
— the issued ALs don't change. Switching drafts marks the differences as
pending."), the selected row's sublabel reads "live now — differences from
`<verLabel>` go out as AL`<next>`" instead of "this is what publishes", and
`DraftsModal.tsx`'s note switches register the same way. `applyDayTpl`'s
"Reopen the day first" refusal stays — templates have no rebase.

**The view-only week's picker** (`viewVerSelHTML`) branches on publish
state, and that test lives in it AND in ViewWeek's render branch — a
drift-seam, see `docs/feature-impact.md`:

- **Unpublished day: the drafts-only picker**, unchanged — "on view
  schedule mode, you can also view the different drafts". It lists ONLY the
  day's drafts, and renders ONLY when the day has any (reusing `data-dver`
  so Shell's one change listener routes it with no new wiring). The
  selected draft prints with a trailing ● and reads as value `'live'` (the
  live day IS it); every other entry rides the same `'d:<id>'` frozen
  preview — read-only banner, no Restore button — the edit surfaces use.
- **Published day: the issued/working picker** (owner, 15 Aug 26 — "the
  user can choose to see the published version, which doesn't change if
  there's edit from the scheduler … but it needs to state clearly what
  they are viewing"). Exactly two options under its own `data-vwork`
  attribute: "`<verLabel>` — as issued" (the default) and "Working draft —
  not issued". The choice is `VWORK` view state (state/view.ts, a Set of
  day indices, cleared by `resetSession`) — deliberately NOT `DPREV`, so
  an edit-page preview can never bleed into the view page or vice versa.
  Stored alternative drafts are HIDDEN from viewers once a day is
  published: the drafts-only picker never renders there, and a leftover
  `d:` DPREV entry on an approved day is ignored (not deleted — the edit
  page may own it).

**The view page's issued DEFAULT** renders through `dayIssuedHTML` — the
same `withDaySnap` freeze in QUIET mode (`PVQ`): no `.dprev-bar`, no
Restore button (never a write control on the view page), section class
`issued` instead of `preview` (no preview outline or dimming — this is the
page's normal answer, not a preview the viewer chose). The day head's own
✓ Published stamp + version chip + picker are the labelling. No warnings
list renders on the issued face — warnings are live-model state and a
snapshot is never validated, the standing preview rule; the ⓘ panel stays
the live route. No `data-alp` pending paints either — the swap empties
pending, so the scheduler's in-progress edits are invisible here until the
next AL is published. **The working choice** renders the LIVE day (warnings
and all) under `.dprev-bar.work` ("Viewing **Working draft** — not issued ·
the issued schedule is `<verLabel>`") with the ✓ Published stamp swapped
for a dashed amber `Working draft` stamp (`.dbeak.ro.work` — the pending
marks' own colour family, the "not the issued document" grammar) and the AL
chip suppressed. **That working stamp is scoped to the view page**
(`CURPAGE==='viewsched'`) inside the shared `dayStatHTML`/`dayHTML`
builders: `VWORK` is a view-page choice, so a read-only render on any OTHER
surface — the board's sign strip shares `dayStatHTML` — must never inherit
it. The bare "read-only render" (`!ed`) is not the same as "the view page",
which is why the check is explicit. Because the live `DAYS[di]` IS the
selected draft's
working copy, a scheduler's draft switch shows up in the working view at
once with no extra wiring — only the issued default holds still.
Honest consequence, accepted: the week banner's "N unpublished edits" count
includes a divergent draft's rebased diff, and Export-to-Excel exports the
live model — the working copy, not the issued document — as it always has.

On the edit week and the board, the day's other (non-selected)
drafts join the ordinary version `<select>` the same way, listed beside
`'Live · <name>'` rather than a bare `'Live'` once a draft is selected.

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

## Cancel-reason templates (owner, Aug 26)

The CX-with-a-reason dialog (`ui/SchedBoard.tsx:CxDialog`) offers quick-fill
chips — "WX", "U/S AIRCRAFT", … — so cancelling a line is a tap, not a retype.
That list used to be a frozen `CX_QUICK` const; it is squadron-editable now, the
same footing as the stores list (`engine/cxreasons.ts`, `CXR_CFG` persisted under
`cxreasons`). An admin taps the `✎ Edit` chip beside the presets to flip the
dialog into an inline editor: rename a reason in place (blur/Enter commits;
duplicate or empty is refused with a toast and the field snaps back), `▲▼` to
reorder, `✕` to remove, an add box, and a two-tap "Reset to standard".

Three things stay decided:
- **A reason is FREE TEXT, not a key.** `cxCommit` copies the chosen (or typed)
  string straight onto the row as `cxr`. So editing or deleting a template never
  disturbs a line already cancelled with it, and the list is addressed by
  POSITION, not a stable id (unlike stores, whose key a jet carries). Managing the
  templates and cancelling a line are independent — the reason box still accepts
  any one-off text the presets don't cover.
- **Admin only, at the write path** (`canEditSched`), like every other config
  editor; a member sees the chips but not the `✎ Edit`.
- **Parity-neutral.** Nothing in the reference/parity harness reads the list and
  the seed week has no cancellations, so it is safe to change freely — the same
  standing as stores. Do NOT change the RENDERED shape of a cancelled row
  (`cxText` → "CX DUE <reason>", the `.cx`/`.cxtag` markup): that markup IS in
  the parity-compared path even though the seed never triggers it.
- **A cancelled row is faded by OPACITY, not by grayscale on the row** (owner,
  1 Sep 26 — "can I still see pilot and wso colours of the pucks?"). The
  `filter:grayscale` used to sit on the row container and washed the olive FCP
  and green RCP pucks into one grey; it now lives only on the store pills
  (`.cx .stchip` et al.), so the crew pucks keep their seat colour through the
  `.55` fade while the red rail + struck words still read cancelled. The
  parity check `cancelled rows greyed` (`tfin.js`) matches the pills' own
  `opacity:.X;filter:grayscale`, so 728/0 holds — but don't move the grayscale
  back onto the row (`.form.cx`/`.sb-line.cx`): it re-greys the pucks.

## The top bar carries the bell and, while editing, undo/redo (owner, Aug 26)

Two additions to the sticky top bar (`ui/Shell.tsx`), both desktop-and-phone
except where noted:
- **A notification bell** (`#notifyBell`) sits by Insights on every page and both
  widths. It GLOWS when the current page + view-as person has an alert
  (`bellLit()`, `state/view.ts`, keyed `page|person`) — a per-person indicator,
  deliberately NOT the removed week-wide count pills — OR when an ADMIN has
  unseen bug reports (`bugAlert()`, `state/reports.ts` — the owner's first
  wired trigger, 25 Aug 26; `markBell(page, who)` stays the seam for the
  rest), OR when the view-as person has an unanswered weekend/PH OIL
  question (`oilPendingFor(ME)` — the third wired trigger, 28 Aug 26; §The
  bell's OIL trigger carries its contract). A tap with a bug alert live
  toasts the count and goes straight to
  the Help page, whose admin view is the acknowledgement (§The Help page);
  with an OIL question pending it lands the Inputs page on the exact input,
  sheet up; otherwise the tap acknowledges the current view's alert as
  before. The
  per-view registry is session-only, wiped on login/logout; the bug-report
  glow derives from the reports themselves, which SURVIVE a login switch,
  and the OIL glow is derived live from `INPUTS` + the war's calendar.
- **Undo / redo / Edit history** (`.tb-hist`, `#undoBtn`/`#redoBtn`/`#histBtn`)
  moved OUT of the edit page's scroll-away `.filters` row INTO the sticky bar,
  shown only on the edit page, so they stay in view while the page scrolls
  (owner: "always see it when I'm editing"). BOTH widths since 23 Aug 26 (it
  was desktop-only before): under 820px the trio goes icon-only (the board's
  `.bi`/`.bl` split) and is PINNED at the right edge of the sideways-scrolling
  phone bar — the mirror of the burger + mark's left pin, painting the bar's
  own `--topbar-a/b` gradient vars so the `.editing` blue tint rides along.
  `#histBtn` opens the Edit-history list (`setHistList('all')` — the renamed
  changes list, see §History on the board) without needing the board or
  History mode. Same `undo()/redo()/HIST` wiring, no new stack; the topbar
  memo's deps carry `HIST.ix`/`HIST.stack.length` so the disabled state stays
  live.

## Muting a check, and resizing the checks panel (owner, Aug 26)

Both are board-side, admin-only, session-only, and DESKTOP-scoped for the resize.
- **Mute a specific check — on the board AND the edit week, in sync.** Each
  `.wln` row in the board's checks panel (`board.ts:boardWarnHTML`) and each
  `.witem` row in the edit week's day-issue list (`html.ts:dayWarnHTML`) carries
  a `✕` (`data-woff`). Tapping it hides that check; the muted ones gather under a
  "N hidden" line (`data-wmtog`, `WMOPEN`) that reveals them dimmed with a `↺` to
  restore. The mute is keyed by the warning's CONTENT — `warnMuteKey` =
  day|code|people|message, the identity the validator itself dedups on — so it
  AUTO-RE-ARMS: a check that persists unchanged stays hidden (the scheduler
  acknowledged it), but the moment the situation changes and `validate()`
  rebuilds a different warning the key no longer matches and it shows again
  (owner: "if things change that warning will appear again").
  The day's HEADER keeps its true count and colour — muting declutters the list,
  it does not change what the day IS. Admin-gated at the write path
  (`view.toggleWarnOff`), cleared on login/logout — the LATEOFF precedent.
  **The board and the edit week are one control, not two** (owner, 29 Aug 26 —
  "the hide warning option should be available on edit schedule too … and both
  are in sync"): the two surfaces read and write the SAME `view.WARNOFF` set,
  so a check hidden on either is hidden on both with no extra wiring, and undo
  (which snapshots `WARNOFF`) walks over the mute the same way from either. The
  edit week gates the `✕`/`↺` and the reveal on `editMode()` (exactly the board's
  `canEditSched()`), so the **View-only week shows no controls and the full,
  honest list** — its markup is byte-identical to before, and the read-only
  record is never quietly trimmed. The day-info popup (`dip-list`, `data-adv`)
  is a separate readout and deliberately keeps the whole list too.
- **Resize the checks panel.** On desktop a grip (`.sb-wsplit`) sits on the
  border between the checks panel and the roster below it; dragging it sets an
  explicit height on `.sb-warn` (`wireWarnSplit`, a CSS var + `.sb-warn-sized`
  class written straight to the persistent `.sb-side`). It is a NO-OP until
  actually dragged — the default is unchanged (content-sized up to 38%), so the
  board's geometry is identical until the grip is used — and it is absent on a
  phone, whose board is one scroller with no split to move. Session-only.

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

**The palette's Placeholders strip carries TWO sentinel pucks since 28 Aug 26
— ALL beside ALL AVAIL** (`people.ts` `all`, cs 'ALL'; drawn by
`specialRowHTML`, `palette-html.ts`). Byte-for-byte the ALL AVAIL semantics:
`special:true` + `archived:true`, so it is never validated, raises no warning
anywhere, and plants like any placeholder. What the new one MEANS is wire
4's: on a ground or Common-Programme row on a weekend/PH, ALL or ALL AVAIL
expands (sync-side `availableFor`) to everyone available for the event's
window — regular aircrew only: no SANS, no ground-crew Personnel, no
sentinels or archived bodies, minus anyone an away input (`isAway`) overlaps
— and each of them earns the row's OIL. Spec:
`docs/superpowers/specs/leavewar-sync.md` §The 28 Aug 26 rework.

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

**The surface is named "Edit history" now, not "Changes" (owner, 23 Aug 26).**
The rename is on the SURFACES only — the modal head reads
`Edit history · newest first / by detail`, the board's `[data-histopen]` line
reads `☰ Edit history · N change(s)`, and the shell's `#histBtn` opener says
the same words — while the internals keep their names (`HISTLIST`, `elog*`,
`histLineHTML`, the `hl-*` classes), because a vocabulary change is not a
reason to churn every identifier and test hook. The count keeps the exact
`N change(s)` / `No changes yet` wording the tests pin.

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

## The top bar and the filters strip are OPAQUE (owner, 20 Aug 26)

"The top bar on view only schedule has some leak to the left. U should make it
opaque."

Both strips are **horizontal scrollers on a phone with something pinned inside
them**, which is the shape that leaks:

- `.topbar` — one nowrap row that scrolls sideways, with the burger and the
  mark `position: sticky; left: 0` over it.
- `#page-viewsched .filters` — the highlight chips, with the HIGHLIGHT label
  pinned left and (since the same day) the search box pinned right.

Three ways they leaked, all now closed, and all three are the checklist for
**any new pin over a scroller**:

1. **The pin's background was not opaque.** The bar painted a translucent
   gradient over an 18px backdrop blur, and the mark's own background was a
   gradient that FADED TO TRANSPARENT on its right — a soft edge by design that
   reads as a bleed the moment a control passes under it. The bar now paints
   `--topbar-a` → `--topbar-b`, the old translucent pair composited over
   `--bg`, so it looks the same where it always sat and stops showing what
   passes behind. The sticky lead paints the same two stops, from the same
   variables, so the pin and the bar cannot drift apart.
2. **The pin was not as TALL as the row.** The HIGHLIGHT label was opaque and
   eleven pixels high — its own line box — inside a ~30px row, so chips showed
   above and below the word. `align-self: stretch` plus `display:flex;
   align-items:center`.
3. **Nothing painted the gutter the pin sits against.** A pin at `left: 0`
   stops at the scroller's padding edge, and content scrolls through the
   padding beside it (12px on the top bar and the filters strip; 5px between
   the burger and the mark's 41px offset). Painted by a flat left box-shadow in
   the strip's colour — flat rather than the gradient because a 6–12px slice of
   a ramp spanning six RGB points cannot show a seam, and a pseudo-element per
   pin is two more nodes on the phone's tightest bars.

## A small search on the phone's view-only schedule (owner, 20 Aug 26)

"We should have a small search bar too in view schedule at the top."

`#searchV` was always in the markup; `#page-viewsched .filters .right` was
`display: none` under the breakpoint, so on a phone the one control that
answers "where is this man flying this week" could not be reached at all.

It is the SAME box, not a new one, and it does **not** get its own row — a row
of chrome is 40px of schedule on a device that has none to spare. It sits at the
right end of the one icon row (`margin-left: auto`), 96px of input.

**The one-row standardisation (owner, 26 Aug 26).** Both week pages' phone
filter bars now read identically: a SINGLE row — the calendar opener (an in-row
`.filt-cal`, phone-only, replacing the old standalone `.wknav-m` row that Edit
put above the icons and View put below), then the page's icons, then the search
pinned right. The bar **wraps** rather than scrolling sideways, so when the
highlighter is tapped (`.hl-open`) the CAT / Type / Quals chips drop to their
OWN row below (`.hlrow`, `flex: 0 0 100%; order: 10`, wrapping its own chips)
instead of cramming onto the icons' line. The sticky left/right pins the old
sideways-scroller needed are gone with it. On the phone `.filt-cal` is the
calendar and `.hlrow` its own row; on the desktop `.filt-cal` is hidden and
`.hlrow` is `display: contents`, so the chips flow inline in the one desktop row.

**The desktop edit bar is one row too (owner, 26 Aug 26).** The edit page's week
window used to be a separate `.seg` row above the filter row; it now rides inside
the filter row as `.wkseg` (id kept `weekSegE`), so the desktop edit bar is one
line like the view page. The order is deliberate: the week dates, then the Excel
and PDF export icons right after them, then the highlighter — the highlighter is
the LAST fixed icon, so expanding its CAT / Type / Quals sub-menu only pushes the
chips to its right and never nudges the exports (the owner's explicit ask).
Pinned in `editweek.test.tsx` (the phone calendar opener now lives at
`#page-editsched .filters .filt-cal`).

## No warning / advisory / note counts in the top bar (owner, 20 Aug 26)

"What's the point of having warning, advisory and note at the top. Just remove
it."

The three `pillbtn` counts are gone. Every day already leads with its own
"N issues · N warning · tap to review" bar, which is the number a reader can
act on, next to the day it belongs to; the pills restated the week's sum and
gave a second, blunter route into the same lists.

`openWarns` (`state/view.ts`) is deliberately KEPT with no caller: it is
mirrored on the probe bridge, it is reference behaviour (tfin: blocking pill
expands days), and it is the call any future "expand everything" control would
make. `interact.test.tsx` drives it directly now, and `app.test.tsx` pins that
the buttons are absent — so a later "the top bar looks empty" pass does not put
the sum back.

## The LATE marks can be dropped per input (owner, 21 Aug 26)

"Show a late tag beside the applicable inputs … when I click on the late orange
icon beside the line, it will remove the late icon, if I click the same area
again it will show."

This REPLACED the 20 Aug global "Hide LATE marks" header button (removed at the
owner's ask). Each late input now carries its OWN control on the board.

- **The chip rides the ITEM cell of a live board input row**, on BOTH the
  Personal Inputs and the Unavailable panels — the two surfaces the owner named
  — drawn by `lateChip` (`ui/html.ts`) whenever `isLateInput`. It sits beside
  the type label, wrapped in `.itemcell` so it does not add an eighth track to
  the seven-track c6r grid (the register trap this file documents under the
  board panels). A non-late row is byte-identical to before.
- **Tap to drop, tap the same spot to restore.** The chip is always present on
  a late row: solid amber while the mark shows, a dim hollow ghost (`.off`,
  `aria-pressed="true"`) once dropped, keeping the exact footprint so it stays
  tappable. This is the "way back" the 20 Aug entry worried a per-badge delete
  would lack — it is built in.
- **Dropping one hides only that input, everywhere it is READ** — the board's
  passive badge, the edit week, the view-only week — because those funnel
  through `lateShown` (`state/view.ts`, the `LATEOFF` id set). Every OTHER late
  input is untouched. The live board rows keep drawing the ghost chip so the
  drop is reversible.
- **The Inputs page keeps its own mark.** That page is the paperwork record and
  reads `isLateInput` straight, ungated.
- **Admin only**, at the write path (`toggleLateOff` refuses a member;
  `routeClick` re-checks and toast-refuses a hand-made chip), and session-scoped
  like the board's History mode — `resetSession` clears `LATEOFF` so the next
  user does not inherit a board with marks quietly dropped.
- **Pinned in** `src/ui/latemark.test.tsx` (the per-input shape, the one-not-all
  scoping, the reversibility, the member refusal, the session reset); the chip
  drawing and the drop are eye-verified on the live bundle (jsdom paints 0×0).

## Week Insights: work hours (owner, 20 Aug 26)

"Perhaps have a section to show everyone's work hours in the insights for the
week."

A bar per person, longest first, directly under the flying load — the two
answer the same question from opposite ends, and the man flying the most
sorties is regularly not the man at work the longest (a duty stander flies
nothing and is there all day).

- **The heading states the definition** — "report to debrief" — because "work
  hours" otherwise reads as hours airborne. It is report (the published in-time
  when the wave has one, else T/O − reportLead) through last landing + the
  debrief pad for a flying day, and start → end for everything else.
- **Everyone with a scheduled hour, not a top 12.** The ask was everyone's, the
  number that matters may be at the bottom, and the modal already scrolls.
- **The same span the long-work-day note uses** — `validate.ts:workSpan`. One
  definition, two readers (`docs/feature-impact.md` §drift-seams).
- **The bars actually draw now.** `.ibar .fill` is a `<span>` carrying
  `height:100%` and an inline width percentage, and a span is `display:inline`
  — where neither applies. It measured 0×0: the flying-load bars had been an
  empty track since they shipped. jsdom cannot see this (every rect is 0×0
  there), so it is gated in `e2e/geometry.spec.ts`, which also pins that no
  value is clipped by its own cell — `.v` went 22px to 42px, because "25h35"
  needs 33.

## The Inputs month calendar (owner, 22 Aug 26)

A full-screen, Google-Calendar-style view of the personal inputs, toggled
from the Inputs page's filter bar (`#inCalBtn` ↔ `#icClose`, view state
`INPVIEW` in `state/view.ts` — a view of the SAME page, not a page, so it
survives a hop to another page and back). The table stays mounted
underneath; closing the calendar is a free round trip, scroll position
included. `ui/InputsCal.tsx` — a React component on purpose (a new, small
surface; the string-builder discipline is for the dense parity-bound ones).

**The month grid.** Monday-first, seven equal columns on BOTH phone and
desktop (the owner picked the grid over a phone day-list). Opens on the
month of the table's own window (`CALMONTH`, seeded once, then carried for
the session); `‹ ›` step months, `Today` jumps home. The close control
(`#icClose`) is a bare **✕** — no "List" label — with an `aria-label`/`title`
of "Back to list" (owner, 1 Sep 26 — "put just a cross in the same row"). On a
phone `.ic-head` no longer wraps (`flex-wrap:nowrap`, gap 4px), and the month
label shrinks to 15px and ellipses only on a truly narrow screen, so the
`‹ month › Today ✕` controls stay on ONE row (the cross beside Today, never on
its own second line) and the touch targets keep their 44px. The Medical view's
`.ic-head` close (`#medClose`) is the same bare ✕ for consistency. Each day cell is
`[data-icday="yyyy-mm-dd"]`.

**The cell's priority order (owner, 22 Aug 26 — "if it fills up the whole
day box, so be it; the inputs showing is lesser priority").** Top to bottom:
the day **TITLE** (`.ic-rmk` — bold, wraps, both widths; sized to match the
popover's date number since 23 Aug 26), then the **sections** in their
arranged order (a note as plain muted text — **no box** since 23 Aug 26, a
muted bar on the phone where its text can't fit; a pucks row as tiny
**standard-olive** person chips `.ic-pks`/`.ic-pk` — the CATEGORY a colour
line on the RIGHT and a SANS person a purple line on the LEFT, 23 Aug 26 — all
drawn in FULL), then
the **inputs** as side-by-side mini chips (`.ic-inrow`) reading callsign +
type — no times (the popover has them) — with a SANS record reading its
**F/O/A letters on the purple chip, never the words** (`sansLetters`; the
colour is the label).

**The body scrolls when a day is packed (owner report, 29 Aug 26 — "calendar
filled with many data I cannot scroll down to view").** Because the sections
draw in FULL, a day can outgrow its cell; the month must then be reachable, not
clipped. Each WEEK is its own flex row (`.ic-week`), and the grid
(`.ic-grid`) is a scrolling flex column of them. A week is held at ≥ one
viewport share tall (`min-height`, dividing the body's own height by `--ic-rows`,
the live week count handed in from the JSX) so a normal month fills the screen
exactly; a week carrying a packed day GROWS to its content and the body scrolls
to reach it, its cells stretching square so the gridlines hold. The flex row is
load-bearing over the old flat 7-column grid: a grid track measures a
wrapping-flex cell at infinite width (one line), so it could never size the
packed cell and its pucks spilled over the weeks below — a flex row resolves the
seven widths first, then takes its height from the tallest cell's real wrapped
content. `flex-shrink:0` on the week is what stops the column squeezing a packed
week back to fit. Input chips stay capped at `MAX_CHIPS` + `+N more` regardless
— this reaches the FULL-drawn sections, it does not uncap the inputs.

**Chips and tones.** Every input covering a day draws a chip in that day's
cell — multi-day spans chip on every covered day. The colour code is decided
in ONE place, `inputTone` (`ui/inputedit.tsx`): red `--hard` = an absence
(leave, medical, OD), amber `--adv` = a local commitment, purple `--san` =
SANS availability. The same helper feeds the Inputs TABLE's row stripes, so
the two surfaces cannot drift. The calendar respects the page's
person/type/search filters (a header pill names any active filter, so an
emptied month explains itself). At most `MAX_CHIPS` (6 — INPUT chips only
since the 22 Aug 26 redesign; the title and sections always draw whole)
draw per cell — a COUNT rule, not a height rule, deliberately: one rule on
every screen size and one jsdom can pin — the rest fold into `+N more`.
Under 820px chips drop their text and become compact colour bars, side by
side; the title stays visible one size down.

**Gestures.** Decided at pointerdown by target:
- *Tap a chip* → the shared input-edit dialog (`setInpEdit`, the global
  modal). *Hold a chip (180ms) and drag* → move it to another day.
  `ui/caldrag.ts` is the calendar's OWN pointer machine — `drag.ts` stays
  scoped to board pucks (stable decision) — copying its feel (180/8/26,
  wobble-restart, the click-eater). The drop applies a DAY-DELTA from the
  grabbed cell, so a span grabbed by its middle SLIDES whole rather than
  re-anchoring; `commitInputEdit` does the write (accepted-row relink and
  Leave-War retraction included). A member may move their OWN input only.
- *Tap an empty cell* → the day popover. *Hold it (`HOLD_ADD`, 450ms —
  longer than the chip hold because an empty cell has a tap meaning too)* →
  the add dialog seeded for that date, person = ME, everyone allowed (page
  parity; the dialog hides Person for members so the seed sticks).
- *Swipe the grid sideways* (past `SWIPE_MIN`, 50px, and more horizontal than
  vertical) → page the month, **left → next / right → previous**, the same
  `step()` the `‹ ›` arrows call (owner, 22 Aug 26). A DISCRETE step decided
  on release from the total travel, not a finger-tracking carousel — the grid
  is a fixed layout, not a native scroller, so the board/Leave-War
  fling-vs-`scrollLeft` hazards do not apply. Shares the empty-cell machine: a
  still release is still a tap, a hold still adds, a vertical drag still
  scrolls. `move`/`up`/`cancel` listen on `window` so a swipe ending past the
  grid edge still completes. This is the calendar's OWN surface — the board's
  removed swipe (a stable decision) does not govern it, and the owner asked
  for this one explicitly.
- *The page SLIDES* (owner, 22 Aug 26 — "I want swipe animation when I swipe
  left and right"). A `useLayoutEffect` keyed on `[cur.y, cur.m]` runs the new
  grid in from the side the page turned (next from the right, previous from the
  left) with the Web Animations API — `grid.animate([...])` on the SAME element,
  never a re-key or a second panel, so the gesture listeners (their deps-`[]`
  effect) and the layout are untouched. `slideDirRef` carries the direction from
  `step()` / `goToday()` and is consumed each run, so only a real page slides —
  the first open and the seed-month jump (dir 0) don't. No-op under
  `prefers-reduced-motion` and where `animate` is absent (jsdom). `.inpcal` is
  `overflow:hidden` so the ±28px entry never shows a scrollbar; the day popover
  is its own `position:fixed` layer and escapes that clip.

**The day popover** (`.ic-pop`, bottom sheet ≤820px / centred card above).
Restructured 22 Aug 26 to the owner's layout, top to bottom:

- **The day TITLE beside the date in the head** (`#icRmkEdit` — schedulers
  type free text in place, committed on Enter/blur; members read it as plain
  text). It is what the cell shows as its heading, and it is the same
  per-day store the old "Day remark" field wrote (`DAYRMK`), promoted.
- **`+ Note` / `+ Pucks`, two small buttons** (schedulers only). `+ Note`
  opens a full-width free-text block; `+ Pucks` opens the **multi-select puck
  picker** (owner, 23 Aug 26 — "select a few pucks at 1 go … then press ok").
  Both are SECTIONS (`state/plan.ts` `PLANPUCKS` — a note is `kind` absent, a
  pucks row `kind:'pucks'` with `ids`), drawn full-width in their stored order,
  and a scheduler **drags the ⠿ handle to rearrange them** (the board
  row-drag's half rule: the lower half of a hovered section means "after it";
  `movePlanSection` is same-day only).
- **The multi-select puck picker** (`.ic-pick`, `renderPicker` in InputsCal;
  owner, 23 Aug 26). A sheet over the popover (z 450, fullscreen on a phone):
  the app's own pucks in a wrap, each a toggle; **category highlight buttons**
  (`HL_CATS`, shared with the highlight chips via `personMatchesCat` in
  `state/view.ts` — ONE predicate, no second copy) light up everyone in a
  category at once, toggling the whole group; a footer **✓ Add N** commits.
  `+ Pucks` opens it with no target (`pickFor=''`) → **OK makes a NEW row**
  from the picks (`addPuckRow(iso, ids)`); a row's **`+ add`** opens it for
  that row (`pickFor=<id>`) → **OK tops the row up** (`addPuckPeople`, adds
  only the not-yet-seated). Both mutators DEDUPE. People already on the target
  row show ticked-and-locked so a re-pick can't double them. Escape peels the
  picker first, then the popover, then the calendar.
- **Removing a seated puck — three ways**: its **✕** (always there), a
  **right-click** on the desktop (`onContextMenu` → `togglePuckPerson`), or a
  **drag off its row** on phone or desktop (`startPkDrag` — a small drift arms
  it, the chip follows the finger, releasing OUTSIDE its own row drops the
  person and back inside keeps it, the "off its seat = gone" feel drag.ts gives
  a board puck). A plain tap that never drifts does nothing destructive.
- **The inputs at the BOTTOM**, led top-left by a small **`+ Input`**
  (everyone — page parity with the table's own + Add). Each `.ic-poprow`
  reads its callsign, type and (timed only) window on one identity line,
  with the input's **remark** on an aligned second line under it
  (`.ic-poprow-rmk`; a remark-less row stays one tidy line). Tap a row →
  the same edit dialog. `+N more` opens the same popover.

**Escape peels one layer per press**: input dialog → puck picker → popover →
calendar. The z-ladder, documented here because the overlays stack: calendar
350 < board 400 < day popover 420 < drawer 440 < **puck picker 450** < airpop
460 < modal 470 (the picker sits above the popover it opens from and below the
input-edit dialog that can open on top of a row).

**Storage semantics.** Day titles (`DAYRMK`) and the note/pucks sections
(`PLANPUCKS`) live in `state/plan.ts`: SESSION-ONLY by the owner's explicit
choice (scratch-pad, like INPUTS itself — a reload starts clean), gated to
schedulers at the write path, cleared on login/logout, and riding the undo
snapshot (`pp`/`dm` in histSnap) so Ctrl+Z walks a planning session back
step by step.

(The old known edge here — a recurring input chipping its first span only —
is gone WITH its feature: the owner had the repeat-weeks field removed
outright, 22 Aug 26. See CLAUDE.md §Stable decisions.)

## The Admin page (owner, 23 Aug 26)

The seventh tab, and it is ALWAYS LAST in both navs — the tools tab after
the work tabs (`ui/AdminPage.tsx`; the topnav entry in `Shell.tsx`, the
drawer item in `Drawer.tsx`, both admin-hidden like the Edit tab). The nav
hides it from a member, but **the PAGE is the gate, not the nav** (the
standing role doctrine — checks live at the page and the write path): a
member forced onto the page renders `#admDeny`, a plain denial with no
tools behind it, and the write handlers still ask `canEditSched()`
themselves. Pinned non-vacuously in `ui/admin.test.tsx` — the page really
mounts for the forced member, and what mounts is the denial.

**The layout is a settings console (owner, 25 Aug 26 — "the smaller left
side has the categories and the right side is the pages for settings").** A
category rail (`.adm-rail`, the `CATS` array in `AdminPage.tsx`) indexes the
page and a single content pane (`.adm-pane`) shows the active category. On a
wide screen (≥821px) the rail and pane sit side by side and both stay
visible; below 821px the shell is one column and it DRILLS — the rail is the
whole screen, tapping a category flips `drilled` and swaps in the pane with a
`‹` back arrow (`.adm-back`, phone-only), the iOS-settings list→detail move
that lets a two-pane layout fit a phone. **Every category panel stays mounted
and only the active one shows** (`.adm-panel.on`), so `#admDutyTpl`,
`#admDayTpl` and the user tools keep their stable ids whichever category is
live — which is also why `admin.test.tsx` can click the template openers
without first selecting their category. A new settings category is one `CATS`
entry plus its `.adm-panel` section; the owner is filling this in over time.
The three category panels:

- **`#admUsers` Manage users** — the old `#userModal` body moved here WHOLE
  (same ids and classes: `#newName`, `#newRole`, `#userAdd`, `#userList`,
  `.urow`/`.ub`, `[data-deluser]`; same `USERS` store and mutations in
  `state/users.ts`). The topbar `#manageUsers` button, the modal, and its
  `USERM`/`setUserModal` flag in `pops.ts` are gone — logout no longer has
  a modal to close, because `resetSession` lands the next session on
  viewsched and the page unmounts with it. The card ends with the honesty
  note: this list drives the demo login only, no server behind it yet.
- **`#admConfig` Squadron configuration** — `#admDutyTpl` / `#admDayTpl`
  open the duty-template and day-template editors by setting the SAME
  `pops.ts` flags the picker pencils set (`setTplEdit` / `setDayTplEdit`).
  Front doors, not new surfaces: the modals stay App-level siblings and
  paint over this page like any other. `#admWaveTpl` still opens the wave
  CONTENT editor here, but the wave **show/hide list was removed** (29 Aug 26
  pt.3): managing a wave's visibility — and deleting a saved template — moved
  to the `+ Wave` menu's own **Manage** sheet (`ui/WaveManageSheet.tsx`,
  `WAVEMANAGE`), reached by its ⚙ button or its "N hidden · Manage" line. An
  EYE per built-in kind / template toggles `setWaveHidden` (the flag the
  picker filters on); a TRASH deletes a template behind a confirm; a built-in
  can be hidden but never deleted. Same admin-only gate as the old list. On a
  phone every `.modal` (this sheet included) now slides up as a **bottom
  sheet** rather than a centred card — the reachable-one-thumb pattern
  `.ic-pop` already uses.
- **`#admData` Data** — the storage-and-cleanup panel. **The screen reads
  PRODUCTION (owner, 25 Aug 26)**: the old session-only/no-server honesty
  paragraphs are gone from the UI and live as code comments in
  `AdminPage.tsx` (and HANDOFF) for the database migration — CLAUDE.md
  §Product bar carries the standing wording rule. Two controls, both
  rendered by ONE shared `ClearControl` component so their behaviour
  cannot drift, and both speaking the same **period grammar** (owner,
  25 Aug 26 — "an option for data range selected, specific date and option
  for anything older than this date"): a `Period` select (`#admWipeMode` /
  `#admLogMode`) offering *Anything older than a date* (open-ended into
  the past, exclusive of the date), *A specific date*, or *A date range*
  (inclusive of both ends; the two pickers `…Date`/`…Date2` sit on one
  `adm-2col` row, and a reversed pair is swapped, not refused). Native
  date fields (`color-scheme: dark` on `html` keeps the pickers dark) and
  a TWO-TAP button each: the first tap dry-counts and arms it red with
  "Tap again to clear N records/entries" (a zero count toasts instead of
  arming — no no-op confirms; changing the mode or any date disarms), the
  second tap acts. Both funnels live in `ui/inputedit.tsx`, share one
  `clearWindow` period resolver, and gate on `canEditSched` at the write
  path.
  - **Clear old data** (`#admWipe` → `clearHistoryData`; the original
    `clearHistoryBefore(iso)` survives as the one-argument 'before'
    spelling) sweeps inputs / calendar pucks / day titles wholly inside
    the period in ONE `writeInputsBatch` (one undo step) and drops
    stashed weeks whose whole Mon–Sun span sits inside (`stashDrop`, gen
    BUMPED never reset — `peek.ts` caches on it). Deletion FAILS CLOSED:
    an unparseable date is kept, a span touching or crossing the period's
    edge is kept whole, and each doomed input goes through the same
    `dropInputRow` body a single delete uses (Leave-War retract +
    unaccept + splice — one body, no drift). Leave synced from the Leave
    War tab is withdrawn from the war for real and does NOT come back
    with Undo (the war has no shared undo — same as deleting such a row
    by hand).
  - **Clear edit history** (`#admLog` → `clearEditHistory` →
    `elogSweep`, `engine/editlog.ts`) clears ELOG rows by the LOCAL
    calendar date the edit was MADE (the date the History list prints),
    never touching the schedule. Permanent for real — the edit log was
    never in the undo snapshot — and the clear is itself logged AFTER
    the sweep, so the record that history was cleared survives even when
    the period covers today.

  The on-screen notes are the database-era wording — they call both
  sweeps permanent (the two-tap confirm is the safety; a DB wipe won't
  ride session undo) and stay silent about today's undo nuances, which
  live in the code comments beside them. Pins: `ui/wipe.test.tsx`.

## The Help page (owner, 25 Aug 26)

The EIGHTH tab (`#page-help`, `ui/HelpPage.tsx`), for EVERYONE — "allows
anyone to type in Bug reports. In which admin can view them". It sits after
the work tabs and before Admin in BOTH navs (Admin stays last, always). One
centred column, two cards:

- **`#bugFile` Report a problem** — a category select (`#bugCat`, the
  `BUG_CATS` list in `state/reports.ts`: one per surface plus the
  cross-cutting three; adding a category is one string there), a
  description box (`#bugText`) and `#bugSend`. Filing requires a category
  and a non-blank description — a blank Send TOASTS instead of silently
  doing nothing (the 12 Aug 26 audit rule). `who` is stamped from
  `HOOKS.whoami()`, the edit log's identity seam, so reports start naming
  real people the day accounts do. A MEMBER also sees their own filed
  reports under the form (`#bugMine`) as the receipt — never anyone
  else's.
- **`#bugAdmin` Bug reports** (admins only) — every report NEWEST FIRST
  (`reportRows()` sorts a copy by `t` desc), each row carrying its
  category chip (`.bugcat`, hue derived from the category's index — no
  hand-kept colour map), the filed date (`elogWhen`, the edit log's own
  date format) and the text. OPENING this view is the acknowledgement:
  the rows that were unseen keep a `NEW` badge for that visit (captured
  into local state BEFORE `markReportsSeen()` runs), and the top-bar bell
  goes out on the same tick.

**The bell contract** (§The top bar carries the bell): `bugAlert()` lights
`#notifyBell` for an ADMIN with unseen reports on every page; a tap goes
straight here rather than clearing anything — the alert can never be
acknowledged without the reports on screen. A member's bell never lights
for their own filing.

**The store** (`state/reports.ts`): a flat `REPORTS` array — DATA, not view
state. Deliberately NOT cleared by `resetSession` (a member files, logs
out; the next admin login still finds the report and a lit bell) and not in
the undo snapshot (filing is not a schedule edit). DB-era: the array
becomes a table, `fileReport` an insert pushed realtime, the bell a
subscription — the row shape is already what a backend would sync.
Pins: `ui/help.test.tsx`.

## The next-week preview (owner ask — desktop continuous week display, 23 Aug 26)

Above 820px the week strip used to leave a fixed-width dead zone past
Sunday (a JS-sized `--week-tail` spacer, `pan.ts:setWeekTail`, sized to
round the scroll out to a whole trailing day). That space is filled now by
an INERT preview of next week's planned programme — the void becomes a
look-ahead instead — built by `ui/peek.ts` and mounted as trailing
`.day.peek` sections after the live week's own day nodes.

**The inert contract**, load-bearing because the preview shares the live
week's `.week` scroll container and CSS, and every existing delegated
handler runs off attribute selectors:

- **No `data-day`.** Preview days carry `data-peek-day` instead — every
  `.day[data-day]` query (`state/view.ts`'s `weekLeftDay`/
  `scrollWeekToDay`, `highlights.ts`, `interactions.ts`'s other branches)
  already excludes a peek node by construction, with no per-site exclusion
  to remember or forget.
- **No `data-slot`, `data-fill`, `data-person`, `data-acc`, `contenteditable`
  or `data-drag`/`draggable`.** Nothing a click/drag/highlight delegate keys on
  (`routeClick`'s slot/puck branches, `highlights.ts`'s
  `.puck[data-person]` sweep, `drag.ts`) is ever emitted — a preview day is
  never validated and carries no warnings to ring, no slots to fill, no
  amendment marks to paint.
- **Class `day peek`** on the section itself — `day` so it inherits the
  live day's box/spacing/border rules for free (a preview card looks like a
  day because it shares the day's CSS, not a copy of it), `peek` as the one
  hook everything above excludes it BY, and every internal width/scroll
  calculation that must not count it (`pan.ts`'s scrollbar sync, week-end
  clamping) selects `.day:not(.peek)`.
- **Appears only above 820px.** `peek.ts:peekKey()` returns `''` at
  `window.innerWidth <= 820`, which every caller treats as "no preview" —
  the phone week is untouched, never renders a `.peek` node, and the
  removed `--week-tail` spacer logic still applies there unchanged.

**Click-to-land.** `interactions.ts`'s `routeClick` checks `.day.peek`
FIRST, ahead of every other branch — a peek day carries none of the
attributes those branches key on, so without running first a click would
fall through all of them into the empty-space clear at the bottom. A click
records the day's screen `x` and its 0–6 index (`view.setPeekLand`), then
calls the ordinary `loadWeek(shiftWeek(CURWEEK,1))` — not a special preview
load, the same week switch every other entry point uses (`feature-impact.md`
Flow E). ViewWeek/EditWeek read `PEEKLAND` on their next repaint (the same
priority chain as `WEEKJUMP`/`CARRYDAY`/`DPREV`) and land the now-live day
at the exact x it was clicked, so the day "becomes real" in place rather
than the week jumping and resettling.

**What it shows.** Next week AS THE APP REMEMBERS IT, not necessarily the
pure seed — `peekWeekHTML` reads the per-week session stash
(`stashDays`, `engine/weekstash.ts`) first and falls back to `weekBundle`'s
pure seed only for a week nobody has edited, the same source the cross-week
flag reads use (`engine-rules.md` §validation). It is the PLANNED PROGRAMME
only: no inputs band, no warnings, no publish/AL state, no amendment marks
— a scheduler previewing next week sees what is on it, not whether it has
been signed off or who last touched it. Cached per (desktop-ness ×
`CURWEEK` × next week's stash generation) and rebuilt only when that key
changes, never on an ordinary repaint of the loaded week.

## The Medical view, the upload control and the document viewer (owner, 27 Aug 26)

**The Medical button** sits on the Personal Inputs TITLE ROW beside the
Calendar-view button (`#inMedBtn`, `MedIcon` + "Medical"), carrying TWO
count badges in the sections' own colours (owner, 27 Aug 26 — "show the
amber count as well"): red (`.medcount`) = down now, amber
(`.medcount.pend`, dark ink — white on `--adv` fails contrast) = owing an
upchit, both as of the notional today and each hidden at zero. The button
SIGNALS instead of the page restructuring itself — the owner's "the page
transforms when medical inputs exist" is answered by badges that read quiet
at zero, not by a control that appears and disappears. It flips `INPVIEW`
to `'med'`. Its content is `justify-content:center` so the phone's
full-width form (where `.calview` stretches) centres the icon + word +
badges like the Calendar button above it, instead of jamming them left.

**The Medical view** (`ui/MedicalView.tsx`, `#medView`) rides the Inputs
calendar's full-screen chassis (`.inpcal`) and deliberately IGNORES the
table's filter bar — it is the squadron's medical state, not a filtered
list. Three sections, each a `.medcard` grid on the `.sanscard` contract
(puck inside the row-direction `.medcard-top`; texts are SIBLINGS — the
74×74 column-flex trap): **Medically Down** (`--hard` red, "till <date>"),
**Pending Upchit** (`--adv` amber, "was down till <end>"), **Upchit
Complete** (`--ok` green, "upchitted <date>", trailing 30 days newest
first). Every section has a real empty state. Cards SIZE TO CONTENT and
pack from the left — **a wrapping flex row, not a grid** (`.medcards`;
owner, 27 Aug 26: a stretch-to-fill column wasted the right half of every
box, then 28 Aug 26: "the box around the puck doesn't look compact
enough"). The first cut expressed that intent as `repeat(auto-fill,
minmax(176px, 200px))`, but a grid TRACK is one width for the whole column,
so every card was still drawn at the 200px cap however short its contents —
measured on the seeded data, 99–117px of ink in a 200px box, 65–83px of
dead air apiece. Wrapping flex items size to their own content, so a card
now ends where its longest line ends and the phone fits two chits per row
where it fitted one. The 200px cap survives as `max-width` (a long remark
wraps rather than running away), `flex:0 1 auto` + `min-width:0` keeps a
single over-wide card inside the section, and the default
`align-items:stretch` levels each row's card heights so the rows still read
as rows. Pinned in `e2e/medical.spec.ts`, which measures the slack past a
card's last word — LINE BY LINE off the text run (`Range.getClientRects`),
because a span inside a column flex is stretched to the card's full width
and its own box proves nothing. And a card's remark line draws only when it
says MORE than the derived date line (`MedicalView.tsx:remarkNote` strips
dates and medical boilerplate; the auto "till …" tail was doubling the
status line on every card). The header's as-of control (`#medCalBtn`)
opens a FLOATING rounded dropdown month grid hanging off the header
(`.med-cal`, `position:absolute` + a transparent `.med-cal-scrim` that
closes it on an outside tap — it overlays the sections rather than pushing
them down; owner, 27 Aug 26) writing `MEDASOF` (`state/view.ts`, null =
the notional today, reset by the Today chip and on session change).

**A LABELLED ICON BUTTON DECLARES ITS OWN GAP — the space in the JSX is
not the space on screen** (owner, 28 Aug 26 — "there's no spacing between
the calendar and the word 'as'"). `.ic-head .abtn` is `inline-flex`, and a
flex container drops the whitespace either side of an anonymous text item,
so `<CalIcon /> as of {date}` painted as `[cal]as of 13 Jul` until the rule
carried `gap:6px`. The same rule gives the glyph `color:currentColor`, so
it reads at the label's brightness (and turns accent with it when the
button is `.on`) instead of `.btnglyph`'s own `--ink-2`, which is the
default for a BARE icon button. Both halves are pinned in
`e2e/medical.spec.ts` — measured off the text run with a Range, because
jsdom reports every rect as 0×0 and cannot see either fault.

**The named drift-seam this exposes**: that pairing — 6px and
`currentColor` — is the app-wide convention for an icon-plus-label button,
but it is restated per surface rather than declared once: `.docbtn`,
`#inMedBtn`, `.sb-actions .abtn`/`.sb-calbtn`, `.filters .abtn .btnglyph`,
and now `.ic-head .abtn`. A NEW labelled icon button in a header that has
never had one inherits neither, and the fault is invisible to every gate
but the browser. Either add the two properties with the button, or fold
the five into one selector list the next time this area is touched.

**A card tap opens the DOCUMENT VIEWER** (`ui/DocViewer.tsx`,
`#docViewPop`, airpop chassis, `DOCVIEW` in `ui/pops.ts` holding the input
OBJECT + an `up` flag): image inline, PDF in a frame, "No document on file
for this entry" otherwise; object URLs are minted on open and revoked on
close. Viewing is UNGATED — every account sees every document. The FOOTER
carries the gated actions: **Edit input** (own puck or admin → the shared
`InputEditor`), and on a Pending card, **Upchit** — the shared editor in
ctx `'up'` (person and type fixed as VALUES, a single plain date defaulting
to today, the mandatory `DocField`). Both upchit paths — the pending card
and typing an Upchit on the Inputs form — are one write path.

**Overlapping documents show together — the episode card + the viewer pager**
(owner, 1 Sep 26 — "see the documents together if they overlap in terms of the
dates"). A person's medical status evolves — an ATT C that changes or extends
to ATT B / HL / OML, each entry with its own document — and the card shows
whoever's status holds ON THE AS-OF DATE, so the earlier document was only
reachable by scrubbing the date back. Now `engine/medical.ts:medEpisode(row)`
gathers, at READ TIME, the person's medical rows whose date ranges OVERLAP OR
TOUCH one evolving episode (touching counts, because the clash sheet usually
leaves the winner and loser ADJACENT, not overlapping; the closing upchit is
folded in), and `MedicalView.tsx` counts the documented ones per card. When a
card's episode has more than one document it wears a small **"N documents"**
pill (`.medcard-docn`, the section's own colour) and, on tap, hands the viewer
the WHOLE episode instead of the one row. `DOCVIEW` grows an optional
`{ rows, idx }` beside its `{ row, up }` — purely additive, so every single-row
caller (a puck tap, a Pending card) is unchanged — and `DocViewer` draws a
**‹ 1 of N ›** pager (`.docview-nav`, `#docViewPrev`/`#docViewNext`) that steps
the documents in place, the title, remark and footer following the current
page; the `[doc]` object-URL effect re-mints one file at a time as you page.
This is DISPLAY only: no rule changed, no state added, the "which status holds
true" clash sheet untouched, parity intact. Pinned in `medical.test.ts`
(`medEpisode`), `medicalview.test.tsx` (the pill + the episode hand-off) and
`docviewer.test.tsx` (the pager steps; a lone document keeps no nav bar).

**One entry holds SEVERAL files** (owner, 1 Sep 26 — "upload several files
into a single entry and delete or reupload"). The record shape:
`state/docs.ts:docFields(ids)` mints `docId` = the FIRST file (unchanged, so
the Leave-War retain, demoseed, the Inputs-page paperclip and every legacy
reader keep working) plus `docIds` = the full list only when >1, and
`rowDocIds(r)` is the ONE reader of the pair (rows and drafts alike — it
falls back to the bare `docId` old callers still hand in). **No other code
writes either field** — that is what keeps them from drifting. `DocField`
(`ui/inputedit.tsx`, all three editor homes) draws one **chip per file**
(`.docchip`, name + its own ✕ `.docdel`) and an **Add** button (`multiple`
file input; each pick stores at once, refusals toast per file); the ✕ edits
the DRAFT only, so Cancel stays a real cancel and the append-only store
keeps every file for undo. The write path (`normalizeInputDraft` + both
commits) refuses a NEW/retyped medical entry with no file as before, and
now also refuses saving an entry that HAD files with none — "Keep at least
one document" — while pre-feature bare rows stay freely editable. The
VIEWER expands whatever it is handed — episode rows or a single-row puck
tap — into one page per FILE (`DocViewer`'s `els`; the caller's `idx` still
counts ROWS, seated at that row's first page), the "N documents" pill
counts FILES (`episodeDocN`), and a multi-file entry shows the current
file's name beside the sub line (`.docview-fname`) so two scans of one
certificate are tellable apart. Pinned in `docs.test.ts` (the shape pair),
`medwrite.test.ts` (first-on-docId, fold-back to single, last-file
refusal), `medclash.test.tsx` (the chips through the real editor) and
`docviewer.test.tsx`/`medicalview.test.tsx` (file-counted pager + badge).

**The upchit save-time summary sheet** (`ui/UpchitConfirm.tsx`, owner,
27 Aug 26). Saving an upchit from ANY form — the Inputs add form, the
in-table row editor, or the shared `InputEditor` (where it paints one layer
above the dialog, `.upconf-pop` z 470 over airpop's 460) — opens this sheet
before anything is written. Top section: what the save will do, one boxed
line per trim ("ATT B … → now ends 13 Jul") or removal, then the green "Fit
for full duty from <date>". Below, every LATER-dated medical entry renders
with a **Keep / Remove** pair that has NO resting state — Save is disabled
and the footer says "Choose Keep or Remove for each entry above" until all
are answered; Keep lights accent, Remove lights the warning red. Cancel (or
Escape, or the scrim) closes just the sheet — the form under it keeps
everything typed. Escape inside `InputEditor` peels one layer: the sheet
first, the dialog second.

**The medical clash sheet** (`ui/MedClashConfirm.tsx`, owner, 27 Aug 26)
is its sibling, same recipe and layer (`.upconf-*` classes). It opens when a
saved medical entry overlaps a different-type one, from the same three form
paths. **Its rows are FLAT, not boxed** (owner, 28 Aug 26 — "remove the box
around the buttons. It looks unclean"): the `.medclash-row`/`.medclash-tail`
overrides strip the shared card fill/border, each clash a plain wrapping line
— "ATT C Jul 10 – Jul 15 · both cover **Jul 13 – Jul 15**" — with its pills
right-aligned (the upchit sheet keeps its boxes). The two choice buttons read
"**<new type> replaces**" / "**Keep <old type> till <its end date>**" (owner's
wording, 28 Aug 26; plain "Keep <type>" for a single-day row). Both light
accent when picked (peers, neither destructive); no resting state, Save
disabled until every clash is answered, footer hint "Choose for each clash
above" — EXCEPT the forced case: **a clash whose row covers the WHOLE new
entry draws no keep button** (owner, 28 Aug 26 — keeping it whole would
swallow the entry, the old "nothing left to file" dead end), just the pre-lit
"replaces" pill, and that clash never blocks Save — the leftover row below is
its real decision. A body note says the outcome plainly: every day holds one
status, and the new entry is filed around whatever is kept.
Cancel/Escape/scrim close only the sheet.

**The leftover row** (owner, 28 Aug 26). When "<new> replaces" is the live
choice (picked, or forced) on a clash whose existing row runs PAST the new
entry's end (`medTailBeyond`), a second line hangs off that clash — indented
and a step quieter (`.medclash-tail`) so it reads as a follow-up, not a new
clash: "Left over after it: **ATT C Jul 14 – Jul 15** — will be removed" with
**Remove those days** / **Keep them**. Unlike the who-holds-them choice, this
one has a DEFAULT — Remove, shown in the red `.on-rem` seg, the note flipping
to "kept on file" when Keep is picked — so a straight Save cuts those days,
plainly and never silently. Where the keep button exists, switching to it
takes the leftover row away (the old status stays whole). Save is NOT gated
on it; the answer rides `keepTail` into the write.

**The OIL ask** (`ui/OilConfirm.tsx`, owner, 28 Aug 26 — "it will ask the
user if the duty and commitment deserves an applicable OIL") is the third
sibling in this recipe — same `.upconf-*` layer classes plus `.oilconf-pop`.
Saving a duty-&-commitments input (`oilAsks` — exactly the `restsInput`
eight: Training, CSE, Meeting, Fly with, Appointment, Duty, OD, Other;
Personal and SANS Availability excluded) whose span covers a weekend or
public holiday opens it from all three form paths — `InputEditor.save()`,
`InputsPage.add()` and `InputsPage.saveEdit()` — through ONE gate body,
`inputedit.tsx:oilGate`, which runs the shared refusals first (a bad draft
toasts at once) and asks only when the plan is unanswered or went stale.
Nothing is written before the answer, there is NO resting default (the
UpchitConfirm doctrine — the decision is real), Save stays disabled until a
choice is made, and Cancel/Escape/scrim close only the sheet with the
form's typing intact. A single applicable day asks **Yes / No OIL**, the
sheet naming the worth — 'HO — half a day' or 'FO — a full day', from
`inputOilAmt` (all-day = FO, the owner's pick; timed ≤6h = HO, >6h = FO). A
multi-day span asks **All days / Only some days… / No OIL**; 'some' opens a
month grid (the RangeCal arithmetic, testid `oilcal`) where ONLY the
applicable days are tappable — tap to select, tap again to deselect (the
owner's exact ask), then Save — and every other day is inert. The offered
days come from `leavewar/sync.ts:oilAskPlan`, which reads the exported
`isNonWorkingISO` — the same applicability answer the credit pass uses, so
what is asked and what is credited cannot disagree. Save stamps the
decisions into `row.oil` (`{iso: amount}`, 0 = an explicit decline) INSIDE
the same `writeInputsBatch` as the save itself — ONE undo step, the answer
and the input it answers never separating in history. Pinned in
`ui/oilconfirm.test.tsx`.

**The revise-OIL affordance** (owner, 29 Aug 26 — a mistaken "No OIL" used
to be revisable only by nudging the input's times; he chose a revise button
over dedicated undo/redo, the global undo stack covering immediate regret).
Where a decision EXISTS to change — `inputedit.tsx:oilAnswered(row)`: an
ask-set, non-dormant row with at least one applicable day answered (a 0
counts; unanswered-only stays the bell's business) — two surfaces draw it,
both re-opening the same OilConfirm over EVERY applicable day with the
standing answers pre-loaded, Save replacing the answer set wholesale:
- the **InputEditor form** grows an `OIL` row — the standing in words
  (`oilSummary`: "credited on 2 of 3 non-working days" / "no OIL on its
  non-working day") beside a **Change…** button (testid `oil-revise`). It
  prices off the CURRENT draft (`oilGate(draft, row, force)` — the same
  normalize, toast and plan as a save, so a revise can never price a day
  differently than the save that follows), and the sheet's Save runs the
  ordinary gated `doSave` — commit + decisions, one batch.
- the **Inputs-page row** wears a cyan `OIL` chip (`.roil`, the FO/HO
  family's colour) in its actions cell, same right as editing the row.
  `reviseOil` opens the sheet off the SAVED row's own fields and its Save
  rewrites `row.oil` alone inside one `writeInputsBatch` — no field edit
  rides along; the toast says 'OIL decision updated'.
Visibility reads the raw row, never `normalizeInputDraft` (which toasts —
this runs per render). Pinned in `ui/oilconfirm.test.tsx` §the revise
button.

**The bell's OIL trigger** (owner, 28 Aug 26 — "it will notify the
applicable user based on the notification tab to review if the input
deserves an applicable HO or FO"). `#notifyBell` also glows when the
VIEW-AS person has an unanswered OIL question —
`leavewar/sync.ts:oilPendingFor(ME)`, a DERIVED predicate (the `bugAlert`
shape, never a stored flag): that person's duty-&-commitments inputs with
an applicable covered day missing from `row.oil` (an explicit 0 counts as
answered; dormant `acc:'r'` rows never ring — the scheduler removed that
commitment). Derived means it self-heals: answer the days, move the input,
or retype it, and the glow goes out with no clearing discipline. The tap
toasts 'Weekend/PH work — confirm your OIL', lands on the Inputs page and
opens `InputEditor` on the exact input (iid via `inpById` — never the row
object, undo re-mints rows) with the OIL sheet already up (`pops.OILASK`, a
one-shot consumed as `InputEditor` reads it). And a PH marked in Leave War
AFTER the input exists lights the bell at once: the lwSubscribe lane in
`wireLeaveWarSync` fires ONE signature-guarded raptor notify when the
pending picture changes — this closed a confirmed missing-repaint gap,
since nothing on the Raptor side repaints on a Leave War write otherwise.
No acknowledgment = no credit, structurally.

**The upload control** (`DocField` in `ui/inputedit.tsx`: `UploadIcon`
button + hidden file input + filename chip, `.docbtn.has` turning the ok
green once attached) renders in all three editors — the Inputs add form,
the in-table row editor, the board/modal editor — exactly when
`needsDoc(type)` says the commit will demand it (one body, no drift). A
documented row wears a paperclip (`.rclip`, `ClipIcon`) in the Inputs
table's action cell, ungated, opening the viewer.

## The role badge is the admin's view toggle (owner, 27 Aug 26)

The far-right Admin/Member chip (`#roleBadge`, `.rolechip`) is a BUTTON for
a real admin login and stays an inert `<span>` for a member — same id and
look either way, plus `.tgl` (pointer cursor + hover) only on the button.
Clicking it runs `store.ts:toggleRole` (see `engine-rules.md` §Auth /
roles): the whole app — nav tabs, edit gates, the Leave War — flips to the
member view, and the same click flips back; `LOGINROLE` in `auth.ts` is the
ceiling that keeps a member's chip inert and the admin's way back alive.
The chip is hidden on the phone bar (as ever), so the DRAWER's Account row
carries the phone toggle (`#drawerRole`, "View as member" / "Back to
admin"), rendered only for a real admin. Flipping to member off an
admin-only page lands on View-only Sched. Pinned in `roletoggle.test.tsx`.

The LEAVE WAR change of the same day (engine-rules §Auth / roles): moving
the cycle forward is admin-only, so the stage-advance chip
(`data-testid="stage-advance"`, "→ BIDDING CLOSED" / "→ PUBLISHED" /
"→ END OF CYCLE") is ABSENT for a member — the same absent-not-disabled
idiom the stage-back chip already used. That is the ONLY member-facing
change: a member still bids while the war is open, the bid-window chip and
the out-of-window dim are unchanged, and a member's cell tap behaves exactly
as before.

## Selecting on the Leave War grid (owner, 27 Aug 26)

Press-and-drag across day-cells to select a rectangle — one row or many
people's rows — then act on the whole block at once. It is built AROUND the
BidPicker's look and vocabulary, not instead of it.

- **A member's reach is their OWN row; an admin's is every row** (owner,
  27 Aug 26 — "if I am viewing as a member and I view as ranger on the leave
  war, I shouldn't be able to input on other people's row except mine"). The
  "own" row is the person the session is viewing as (`viewer`, mirrored from
  Raptor's "View as"). For a member the drag's row list is that one row, so the
  rectangle only ever covers their own row — a date RANGE along it still selects
  freely — and a single tap opens the editing sheet only on their own row
  (`Matrix.tsx` `openable` / the drag `order`). An admin's selection spans
  everyone. This is not just an affordance: `canEditRow` (engine/stages.ts)
  refuses another row at the WRITE path too (`setCell`, the batch writers, move
  and shift), so nothing — not a batch, not a keyboard path — can put one
  member's leave on another man's row. It is still not a security boundary while
  the app is client-side and a console can forge the role — see
  `docs/leavewar/known-gaps.md` §The role is an affordance.
- **The gesture** (`ui/select.ts`, `wireSelect`) is ONE delegated
  `pointerdown` on `.mx-wrap` — never per-cell (the grid is ~28k nodes) —
  hit-testing with `elementFromPoint().closest('[data-testid^="cell-"]')`. It
  ARMS before it claims anything, so the grid's sideways scroll is never
  stolen: a mouse arms at a 4px move; a finger arms two ways — a HOLD of 180ms
  still, OR a SLOW drag once the finger has been down past SLOWARM(140ms), a
  slide past 26px then reads as a deliberate select rather than a scroll and
  arms (owner, 27 Aug 26 — "when I hold then drag … I can't select a date
  range, I'm stuck with just adding 1 input", on rows other than his own: a
  phone user rarely pauses a clean beat before dragging, and a drag begun a
  touch early crossed the slop before the still-hold and was thrown away as a
  scroll). A QUICK flick still crosses the slop long before 140ms, so the
  grid's sacred sideways scroll wins it — cede. The highlight (`.selcell`) is
  written straight onto the cells, never through React state; the instant the
  drag arms, the wrap wears `.selecting` (a brighter wash + thicker ring in
  `matrix.css`) and Android fires a short haptic, so a phone user SEES the grab
  land before dragging (iOS has no web haptic — the brightening carries it). An un-armed press is an ordinary click and opens the
  single-cell sheet exactly as before — **pointer capture is taken in `arm()`,
  NOT on pointerdown** (owner, 27 Aug 26 — "if i just click 1 area to input …
  it should also allow me to input"): capturing on the down retargets the
  click that follows a captured pointerup to `.mx-wrap` in Chromium, so the
  cell's own onClick — the single-cell input sheet — never fired on a real
  device. The window-level move/up listeners track a drag without the capture;
  it is belt-and-braces for a fast touch drag only. **An armed drag auto-scrolls
  at the edges** (owner, 30 Aug 26 — "auto scroll to the edge to continue
  selecting more grids" → "up down scroller too"): sideways it moves `.mx-wrap`,
  up/down the nearest vertical scroller (the page, for the grid); a mouse steps
  a constant 18px/frame inside a 36px band, a finger ramps 0→15px/frame across a
  48px band so it throttles the speed by how far it pushes. **A band the press
  STARTED in never scrolls until the pointer has left it** (2 Sep 26): a row at
  the foot of the screen is already inside the bottom band when the drag arms,
  and a sideways drag along it used to run the page downward every frame — the
  rows slid up under a still pointer, the selection ballooned onto other
  people, and when a heading was what slid under the release point the last
  day was dropped (the e2e "drag-selecting a row" flake). Only the band(s) the
  press sat in are held; the opposite edge scrolls as before. Geometry and the
  edge rules are unit-tested (`select.test.ts`); the gesture itself is e2e
  (`leavewar.spec.ts`, which also pins that the page stays put on that drag).
- **The sheet** (`ui/SelectSheet.tsx`, `data-testid="select-sheet"`) is the
  BidPicker's sibling on the same `Sheet` chassis. Sections are contextual to
  role and stage: everyone Fills while the war is OPEN (portion + leave chips;
  admin adds the Medical row); Decide (Pending / Approve / Refuse) is the
  admin's once bidding is CLOSED **or PUBLISHED** (owner, 27 Aug 26 — the admin
  still runs a published war); Delete (second-tap confirm — no undo here)
  and Move act on the editable bids the selection holds, and **show only when it
  holds one** (`movableCells(sel.cells).length`, owner 27 Aug 26 — a loose box
  of empty cells is Fill-only, so Move never opens on nothing to move);
  Post-out shows only
  for a single-person selection. Partial writes report in the `sel-note` voice
  and keep the sheet up. The per-person negative-balance confirm the single
  sheet shows is deliberately NOT carried here (it would ask a block-spanning
  question per person).
- **Move mode** (`wireMove`) moves the inputs PRESENT in the box and ignores
  the empty cells swept up around them (owner, 27 Aug 26 — "move items … that
  are present … if I select more area than required it registers as nothing"):
  `Matrix.tsx` filters the rectangle through `movableCells` first, so a loose
  box no longer refuses as "nothing". The block ANCHORS on its earliest input
  (`earliestDate(movers)`), and that input lands on the day picked — the leading
  empty margin is dropped, the gaps between multiple inputs ride along
  (`daysBetween(anchor, target)` is the one delta every cell shifts by). Owner's
  call, asked 27 Aug 26: *drop the leave on the tapped day*, not preserve a
  leading gap.
  - **Landing preview** (`.mvland`, a warm-amber wash + ring — deliberately NOT
    the accent-blue of the selection or the viewer's own row, so it reads as
    "will land here" over whatever it covers). Painted straight onto the cells
    (`paintLanding`/`clearLanding`, no React state). **It paints only what the
    commit would accept** (27 Aug 26 overnight pass): `Matrix.previewAt` asks
    `moveProblem` — the validation half of `moveCells` itself, one body — and a
    refused hover/stage clears the paint and puts the reason in the banner
    (on the phone a refused tap stages NO Confirm; the reason stands where the
    button would be). The first cut painted the in-range half of an off-grid
    landing, a legal-looking partial drop the click then wholly refused. Hover
    re-fires only when the hovered DAY changes (`wireMove` keeps the last
    date), never per mousemove — the 28k-node grid's per-frame law. The ghost
    chip exists only where hover does (`(hover: none)` suppresses it — a
    phone's compatibility mousemove used to strand it at the tap point).
  - **Desktop:** a faded ghost follows the mouse and the landing highlights live
    under it; a CLICK lands the block (the hover WAS the preview). **A RIGHT-CLICK
    cancels** the move (owner, 27 Aug 26 — the mouse equivalent of Escape;
    `wireMove` swallows the context menu and drops the block).
  - **Phone:** no hover, and no undo — so it is TWO steps (owner, 27 Aug 26 —
    *show a preview, then Confirm*): a TAP stages the landing (highlighted) and
    the banner shows **Confirm / Cancel**; Confirm commits, a fresh tap
    re-stages, Cancel exits. A SWIPE scrolls and never stages (only a clean tap
    fires). `movePreview` holds the staged day; the banner counts `movers`, not
    the raw rectangle.
  - The move itself is `moveCells(movers, delta)`, atomic — an occupied / Raptor
    / out-of-window landing refuses the whole move and says why in the banner.
  The `moved` dotted-orange edge marks the landed cells via
  the `shiftedFrom` state — but **only for a move made once bidding has CLOSED**
  (owner, 27 Aug 26): while a war is still OPEN people shuffle their own bids
  freely, so such a move is ordinary tidying, not a management shift. This is
  gated in TWO places behind one `biddingClosed(stage)` body (engine/stages.ts,
  `stage === 'closed' || 'published'`): the store RECORDS `shiftedFrom` only on a
  closed/published move (`moveCells`/`shiftBid`) — an open-bidding move stores a
  clean `{state:'pending', source:'bid'}` and clears any stale trail — and
  `Matrix.tsx`'s `movedShown` gates the DISPLAY. The earlier build gated only the
  display, so a bid shuffled while open sprouted the stripe the moment the war
  closed (the reported bug); recording it only when closed fixes that at the
  source. Pinned in `store.test.ts` (open move → no trail, closed move → trail)
  and `deciding.test.tsx` (a seeded trail: hidden at open, shown at closed,
  hidden again on reopen).
- **Dragging an EVENT row** (owner, 27 Aug 26 — "drag and select grids in the
  events column to input events. Just like what we recently implemented"). The
  same `wireSelect` gesture also claims the `event-<line>-<date>` day cells (not
  the band / blocked / row testids that share the prefix). Events live one row
  each, so a drag never crosses lines — the anchor's line wins and only the date
  span matters (`eventRange`, and the focus supplies only the column, so a finger
  straying onto another row still extends the span). On release the event sheet
  opens pre-set to that span: scope **A range**, from → to filled on its
  calendar, ready for the word + off/no-leave/work tag + merge-or-repeat. A
  one-cell drag opens on the single day, exactly like a tap. Admin only
  (`eventsEnabled` — the store refuses a member event write anyway). Pins:
  `parseEventCell` / `eventRange` in `select.test.ts`; the sheet seed reads
  `EventSheet`'s new optional `to` prop.
## The page stays fully usable behind an open sheet — scroll both ways, movable, compact (owner, 28 Aug 26)

Every Leave War decision opens in a `Sheet` over a full-page `.sheetscrim`
(`ui/Sheet.tsx`). Over two owner asks (28 Aug 26) the sheet went from a modal
that froze everything behind it to a panel you can read the grid around:

- **ESCAPE CLOSES IT** (bug sweep, 28 Aug 26). Not one Leave War sheet answered
  Escape — its ✕ and a scrim tap were the only ways out — while the input editor
  peels its layers on Escape and the Medical as-of picker closes on it, so the
  tab read as broken on a keyboard and left anyone there shut inside a
  `role="dialog"`. The handler lives in the WRAPPER, for the same reason the
  scrim does: a sheet cannot then be written without it. It listens in capture
  (a field's own Escape must not swallow it) and only the TOPMOST `.bidsheet`
  acts — a guard that never fires today, since Leave War sheets REPLACE one
  another rather than stacking, but that keeps one press peeling one layer if two
  are ever mounted at once. The Legend and the under-manned list use their own
  overlay rather than `Sheet`, so `Chrome.tsx` restates the rule for the pair
  (Legend first when both are open). Pinned in `scrim.test.tsx` over the same
  eight-sheet table the scrim uses — a per-sheet test would pass while a ninth
  sheet shipped without it — and in `chrome.test.tsx` for the Legend.

- **LEFT-RIGHT** ("I want to be able to still scroll left and right … on the
  grids … while the page is still up"). The scrim has to keep SWALLOWING
  gestures on the grid — a tap dismisses, and a bare grid tap behind an open
  sheet would otherwise open a second cell sheet or start a drag-select under
  the one already up — so it cannot simply become `pointer-events: none`.
  Instead it keeps capturing and FORWARDS the sideways ones by hand
  (`useGridPan`): a horizontal drag moves the grid's one horizontal scroller
  (`.mx-wrap`) 1:1, and a horizontal (or shift-) wheel does the same.
  Everything the frozen date bar tracks is driven off `.mx-wrap.scrollLeft`,
  so the mirror follows for free.
- **UP-DOWN** ("enable me to still scroll up and down when this window is
  opened"). This REVERSES the 17 Aug "one-scroll" body lock. The page used to
  be frozen (`body.lw-sheet-lock { overflow:hidden }`) so a swipe could never
  jump the grid under a reader; the owner now wants exactly that jump — to read
  the grid behind the panel. The lock is GONE. The scrim carries
  `touch-action: pan-y`, so the browser pans the page vertically from a finger
  on it; a vertical wheel is left un-prevented, so it scrolls the page too.
  Pointer capture is taken LAZILY (only once a drag commits to the horizontal
  axis), or it would stop the browser's own vertical pan. The panel is
  `position: fixed`, so only the grid behind it moves; the sheet's own inner
  list keeps `overscroll-behavior: contain` so scrolling to the end of the list
  still does not chain into the page — that was never the complaint.
- **DESKTOP SCROLLBARS** ("on the desktop if i decide to use the horizontal bar
  or vertical bar to scroll, this is allowed as well"). The page's native
  vertical bar works the moment the body lock is gone. The grid's pinned
  horizontal proxy (`.mx-hbar`, `Matrix.tsx`) was z-index 50, UNDER the scrim
  (79), so the scrim covered and killed it; it now sits at z-index 81, over the
  scrim, grabbable while a panel is open. It is a 15px strip at the very foot of
  the viewport and the panels anchor 14px up, so it never paints over one.
- **MOVABLE** ("make this window movable, so that it doesnt block my view").
  The title strip (`.bidsheet-hd`, on every sheet) is a drag handle
  (`useSheetDrag`): pressing anywhere on it but a button and dragging slides the
  whole panel via a `--lw-dx`/`--lw-dy` translate offset, clamped so at least
  48px of the handle stays on screen (never lost behind the top bar or an edge).
  A `⠿` grip + `move` cursor say it is draggable. The offset lives in CSS custom
  properties so a pointer frame does not re-render the sheet, and resets to zero
  on remount (a fresh open lands where it always did, then you move it).
- **SMALLER** ("make all the window smaller … theres alot of empty space"). The
  read-only info panels (a figure's breakdown, `narrow` prop on `Sheet`) pull in
  to `min(360px, …)` and drop the action sheets' 44px tap rows — those rows are
  read, not tapped. The action sheets (bid, decision, counter picker, person
  editor) keep their 44px targets, which the geometry gate holds.

A gesture that never crossed the ~6px threshold is a tap and still dismisses (a
drag's trailing click is swallowed via `movedRef` so a scroll never closes the
sheet). My CALL, flagged to the owner: a tap on the empty area still CLOSES the
panel, so the grid behind scrolls but is not clickable — if he wants it clickable
too, drop the tap-to-close. Verified live at 1440px and 402px, sheet up: page
scrolls both ways with the panel fixed, the panel drags anywhere, the desktop
proxy bar sits above the scrim, zero console errors. The small legend / manning
pop-outs use a different, lighter overlay (`.umscrim`, `ui/Chrome.tsx`) and are
OUT of scope. Pinned in `scrim.test.tsx` (drag-forward, no lock, movable) and
`e2e/leavewar.spec.ts` ("the page scrolls behind an open sheet, and the panel
stays put").

## The event sheet on a phone keyboard (owner, 31 Aug 26)

The event sheet autofocused its name field, so a phone raised the on-screen
keyboard and — because the panel is `position:fixed; bottom:14px` (LAYOUT
coordinates) while the keyboard shrinks and pans the VISUAL viewport — its lower
half (the range calendar, Save/Delete) sat behind the keys. Owner: "I want to
see the full window … the calendar can be smaller." A phone cannot show the
keyboard AND a whole month calendar at once, but the keyboard is only ever
needed to type the NAME, never to pick dates. Three parts, together:

- **Opens showing the full window.** `EventSheet.tsx` autofocuses the name field
  only for a fresh single-day tap (`!(band || dragged)`) — a short sheet the
  lift below keeps clear of the keys. A sheet that opens already ranged (an
  existing band, or a drag-swept span — the tall case) opens with NO keyboard,
  so the whole window shows. Tapping "A range" is a button, which drops the
  keyboard on its own, so switching a day to a range reveals the full window too.
- **A smaller calendar, event-sheet only.** `RangePicker` takes a `compact`
  prop → `.rpick.compact` (`rangepicker.css`): 30px day cells (vs 36), tighter
  gaps and smaller month arrows — still at the ≥30px calendar tap-target floor
  the geometry gate holds. The event sheet passes it; the bid, war and
  bidding-window pickers stay full size. Measured live: the compact range sheet
  fits a 390×844 phone with no scroll and Save on screen.
- **Lifts above the keyboard while typing.** `Sheet.tsx:useKeyboardInset` mirrors
  `ui/histbubble.ts:place()` — when the on-screen keyboard shrinks the
  `visualViewport` (a signal `dvh` does NOT track and that fires only on
  `visualViewport`, not a document scroll/resize), the panel re-anchors to the
  top of the visible slice (below the top bar) and caps its height to it, then
  clears back to the CSS bottom-anchor when the keyboard drops. It is a strict
  no-op with no keyboard, so the `.bidsheet` bottom-anchor and every geometry
  spec (all keyboard-less) are untouched; `useSheetDrag`'s clamp now reads the
  visual viewport too (an `innerHeight` fallback keeps jsdom identical). Guarded
  `if (!window.visualViewport)` (jsdom has none). Pinned in
  `sheet-keyboard.test.tsx` (a `visualViewport` stub, since a headless browser
  can't raise an iOS keyboard) and the autofocus split in the same file.

## Leave War Rearrange + the counter picker (owner, 28 Aug 26)

Four asks from the same sitting, all on the Leave War grid:

- **The counter picker is COMPACT** ("much smaller and compress the data"). It
  takes the `Sheet` `narrow` variant (min 360px), and each row lost the caption
  that merely restated the top `USED = days taken · BAL = balance left` key —
  only the AGGREGATES keep a caption, because theirs is the composition
  (`= ATT C + HL + OML`) the owner asked for. The per-row ", yours" is gone too:
  the header says whose numbers these are, once, instead of twelve times. The
  real height floor turned out to be the ▲▼ figure-reorder arrows (two stacked
  20px buttons pinned every row at ~42px however tight the text), so those are
  shrunk in narrow mode. Rows now measure 30px and the sheet 587px (was 701).
  The e2e floor moved 44 → 28 deliberately: these are the viewer's own figures,
  a list you SCAN, not the action sheets' tap rows (those keep their 44px).
- **Whose view it is, said out loud** ("make it obvious that im viewing as for
  example RANGER"). The whole grid — the lit row, the counter column, the figure
  sheets — answers for the viewing person (Raptor's "View as", mirrored in), and
  nothing said so. Now: a persistent accent chip in the Leave War topbar
  (`lw-viewing`, `ui/Chrome.tsx`) and the picker header leads with **VIEWING AS
  &lt;callsign&gt;**. Both are ABSENT when nobody in the roster is being viewed —
  there is no "you" to name, mirroring the picker's existing dash rule.
- **No personnel label editor** ("i can edit personnel, dont need to show that,
  just leave it as the callsign/name"). In Rearrange a ground-crew row used to
  turn its name column into a "Maint / Line" edit box; `PersLabel` is deleted, so
  the row shows the same callsign + chip as every other row in BOTH modes. The
  stored labels and the store's `personLabel`/`setPersLabel` seam are untouched
  (`roster.test.ts` still covers them) — only the on-grid editor is gone.
- **Manning rows reorder by DRAG, and the ▲▼ arrows are gone** ("the rearrange
  could u do drag and drop … remove the arrow function … the drag and drop rows
  function is already designed on other areas of the app"). Rather than a second
  drag machine, `Matrix.tsx`'s `startRowDrag` is now driven by a `RowDragCfg`
  (`sel` / `idOf` / `move`) and serves BOTH row kinds: `ROSTER_DRAG` (people) and
  `MANNING_DRAG` (counts). The count rows carry `data-mrow` for the hit-test
  rather than a `data-testid` prefix — their day cells are `count-<id>-<date>`
  and a prefix `closest()` would catch a CELL, not the row. The commit is
  `store.ts:moveManningRowTo(id, beforeId)`, mirroring `moveRosterRow` (same
  before-itself guard, same splice-then-reinsert). The step-wise
  `moveManningRow(id, ±1)` stays as a tested store primitive with no UI caller.
  The hide (eye) control is unchanged.

Verified live at 1440px: picker rows 30px, the viewer chip reads "Viewing as
Ranger", a ground-crew row shows "Cotter" with no edit box, and a count-row drag
moved a row from first to third with the arrows absent — zero console errors.
Pinned in `counters.test.tsx`, `chrome.test.tsx`, `counts.test.tsx`,
`roster.test.ts`, and e2e ("a personnel row shows its callsign, with no edit box,
in Rearrange").

## Leave War roster groups: minimise, and the admin group editor (owner, 28 Aug 26)

**Minimising a category.** Every group heading is a fold control — the sticky
`td.grphd` is the target (NOT `.grphd-in`, which is deliberately `width: 0` so it
adds no min-width to the frozen callsign column; a zero-width control cannot be
tapped). Folding keeps the heading — it is the way back — and drops its rows; the
`· N` count is built from the UNFILTERED roster, so a folded group still says how
many it is hiding. The filter lives in `rosterSequence()` (`Matrix.tsx`), the one
sequence BOTH the real grid and the frozen overlay read, and the inline `<tbody>`
render applies the identical skip — the two must never fold out of step, which is
what `frozencols.test.tsx` and the e2e overlay test catch. Session-only and open
to EITHER role, the same doctrine as the manning-block collapse: it hides nothing
anyone is entitled to see. Nothing is folded by default. `folded` rides the two
measuring effects' deps and the frozen-header mirror's, because removing rows lets
auto-layout re-narrow columns exactly as a row-window change does.

**The group editor** (`ui/GroupSheet.tsx`, opened from the ⚙ button in the corner
cell above CS/Name — the empty space the owner circled; admin only). The seven
built-in groups were a closed union (`Group`), a fixed `GROUP_ORDER` and a
`GROUP_LABEL` record; they are now the DEFAULT value of an admin-owned list
(`engine/groups.ts`). A group is `{kind:'cat', g}` or `{kind:'qual', k}`, and a
built-in's id IS its old `Group` string — so every stored order, `group-SXO`
testid and `g-sxo` CSS class is untouched, and an untouched squadron groups
exactly as before (pinned: the default list reproduces `groupOf` for every kind
of person).

- **The qualification list grows on its own.** Quals already crossed the Leave War
  seam — `raptorRoster.ts` projects `xq` (every held key) and `qualCatalogue()`
  unions every key any live body carries, refreshed by `reprojectRoster` on every
  notify. `heldQuals(p)` (`availability.ts`) is the membership predicate, the same
  one the counter filters use, so "qualified" means one thing in this app.
- **TWO orders, deliberately** (the owner's choice when asked): `groupDefs` is the
  top-to-bottom display order he drags, and `groupPriority` is a SEPARATE list
  deciding who claims a person matching several. Tying them would make reordering
  the page silently re-home people.
- **"Shows up once" is not bolted on**: `assignGroup` walks the priority order and
  takes the first match — the same shape `groupOf` always had. Ranking a
  qualification above a CAT group is all it takes to get the owner's "if theres a
  cat c column, but there is also a SC D column. They should always show up in the
  qualifications column instead of CAT".
- **"Everyone else" is always last and cannot be removed** — an admin whose list is
  all qualifications would otherwise strand people with no row at all.
- **ADDING a group ranks it above the CATEGORIES** (`store.ts:addGroup`; bug
  sweep, 28 Aug 26). This is not cosmetic — without it the control did nothing at
  all. `orderedGroupIds` sorts an unranked id to the BOTTOM of the priority walk,
  and `groupOf` is total (every person matches one of the seven built-ins), so a
  newly added qualification was reached only after someone had already been
  claimed: the grid did not change by one row, while the editor beside it
  reported 44 people in the group. `addGroup` inserts the new id just before the
  first `cat` group in the priority order — ABOVE the categories, which is the
  owner's own rule, but NOT flatly at the front, so add order survives (front
  insertion would make each addition demote the one before it, and adding SC Day
  then SC Night would silently take SC Day's people). It writes the priority ONCE,
  at the moment of adding; every later change is the admin's drag. Consequence
  worth knowing: adding a near-universal qualification empties most category
  headings at a stroke — reversible with ✕, Reset, or a drag down the who-wins
  list. Pinned in `roster.test.ts` (claims its people unaided · add order kept ·
  admin-gated).
- **Tap a group to see who is in it** (owner: "allow me to click to highlight the
  applicable pucks … so I can see like who's qualified"). Two lists, not one, and
  a count that matches the grid: `groupIdOf` (who the group actually DRAWS) is the
  headline number and the first list; `matchesGroup` (who merely QUALIFIES) fills
  a second, quieter list headed "Also fit it, but shown higher up", with the way
  to change it. The row previously showed the qualifying count alone, which read
  as a promise about the grid that a group ranked below an exhaustive category
  could keep for nobody.
- **Untrusted load + a live prune**: stored entries are read structurally and
  de-duped, and `pruneGroups` runs on load AND whenever the catalogue moves
  (`setQualCatalog`) — a group pinned to a Quals column the squadron later deletes
  would otherwise draw an empty heading nobody could remove.
- **Manning counts do NOT follow the grouping** (owner's explicit answer, and
  verified: `countsFor` never calls `groupOf`). Grouping is display only. NAMED
  DRIFT-SEAM: the group editor and the manning count rows are two independent
  admin configurations over overlapping vocabulary — changing one does not move
  the other, by design.
- CAT sub-headings are emitted for the two built-in OPS groups only; a person drawn
  under a qualification is not "in CAT B" for display purposes.

Verified live at 1440px: the editor offers all ten real qualifications with true
member counts, tapping IP lights its eight people, ranking Scheduler top moves all
fifteen schedulers into it (SXO's heading disappears — its people were claimed),
and the roster still holds all 50 people with zero duplicates. Pinned in
`engine/groups.test.ts`, `roster.test.ts` and `matrix.test.tsx`.

## The Inputs date window is a squadron setting (owner, 28 Aug 26)

"Can i set the default duration how many weeks to look ahead by default … weeks,
or weeks plus till that week's sunday … create an edit icon for admin users … i am
able to change the button function to show the set duration i can click by default
by everyone."

`engine/lookahead.ts`, on the STD → CFG → save/load/reset idiom (`engine/stores.ts`
is the template; boot-loaded in `initStore` beside `storesLoad()`). Two shapes,
both asked for: plain `N` weeks, or `N` weeks then run on to that week's SUNDAY so
the window always ends on a week boundary. **`LOOK_STD` is 2 weeks / no Sunday =
exactly the old hard-coded today+14**, so the page opens on the same window it
always did until an admin changes it.

The page's opening range (`initialRange`) and the popover's quick button
(`#inRangeDef`) now BOTH derive from the one setting, so what the page opens on and
what the button offers cannot disagree — the button also SAYS the setting ("Next 4
weeks, to Sunday"). The admin's pencil (`#inRangeEdit`) sits under the two quick
buttons: a bounded weeks field and the Sunday toggle, saved immediately, and a
refused value is put back to the live one on screen rather than left looking saved
(the standing rule for every edited threshold). Storage is untrusted on load and
nothing is written at all while the squadron is on the standard, so a later change
to that standard is picked up rather than frozen in a browser.

`#inRangeDef` used to be a fixed "Next 2 months"; `DEFAULT_SPAN_MONTHS` and
`plusMonths` remain (exported and read elsewhere). The inputs test that named
"+2 months" was renamed to name the default window instead — its assertions were
already about what falls inside, and they still hold.

Verified live: default 28 Aug → 11 Sep with "Next 2 weeks"; set to 4 weeks + Sunday
gives "Next 4 weeks, to Sunday" and 28 Aug → Sun 27 Sep; survives a reload. Pinned
in `engine/lookahead.test.ts` (both modes, month/year rollover, bounds, untrusted
storage).

## The frozen date bar — the reusable recipe (owner, 28 Aug 26 — "make sure u remember how to create such a frozen top bar in the future. This is the expectation")

This is the pattern the owner signed off on the preview and asked kept for
reuse. It works IDENTICALLY on desktop and phone (verified live at 1440px and
402px, 28 Aug 26 — same freeze point, the bar tracks the grid with zero drift
across the whole scroll range). The dated entries below are the fix-by-fix
history; THIS block is the recipe to copy. Six pieces, in order:

1. **Why sticky can't do it.** The PAGE owns the one vertical scroll (the
   owner's standing "one vertical scroll" rule); the grid's own wrapper
   (`.mx-wrap`) scrolls HORIZONTALLY only. So `position: sticky; top: 0` on the
   header has no vertical scroller of its OWN to pin against — it never
   freezes. Every piece below exists because of this one constraint. If a
   future surface DOES give the header its own vertical scroll box, plain
   sticky is simpler — use it. This recipe is for the one-vertical-scroll case.

2. **The freeze is a JS-driven MIRROR, not the real header.** A `position:
   fixed` copy of the date row (`.mxfixed`, z-index below the app top bar) is
   rendered only once the real header scrolls up under the top bar (`stuck`
   state, flipped by an IntersectionObserver / scroll measure). It pins just
   below the app top bar's lower edge. The real header stays in the grid; the
   mirror is a throwaway overlay that appears on freeze and unmounts on
   scroll-back up.

3. **The horizontal follow is COMPOSITOR-driven where the browser can, JS
   where it can't** — feature-gated, so nothing regresses on old browsers or in
   jsdom. Detect once (`sdaActive` = `CSS.supports('scroll-timeline: --x x')` &&
   `CSS.supports('timeline-scope: --x')`) and branch:
   - **Modern path (`.lw-sda`).** The scroller names its horizontal scroll as a
     timeline (`.mx-wrap { scroll-timeline: --lwx x }`); an ancestor that is NOT
     the scroller hoists that name into scope (`.mx-outer { timeline-scope:
     --lwx }`, because the fixed bar is not a descendant of the scroller); the
     mirror's day columns are TRANSLATED from 0 to the grid's max scrollLeft
     across the grid's whole range (`animation: lwx-follow linear both;
     animation-timeline: --lwx`), so `grid.scrollLeft ↦ translateX(−scrollLeft)`
     runs ON THE COMPOSITOR — glued, nothing to catch up. `--lwx-max` (the max
     scroll distance) is set from JS on LAYOUT changes only, never per frame.
   - **Fallback path.** A rAF pump copies `grid.scrollLeft` onto the mirror's
     own scrollLeft each frame (main thread, a frame behind a fling). GPU it
     (`transform: translateZ(0)` on the bar, `will-change: scroll-position` on
     the scroll layer) so the per-frame write recomposites instead of
     repainting — that alone cut the dropped frames that read as "lag."

4. **A translated table can't keep `position: sticky`, so the frozen LEFT
   columns become a static clipped COPY in the modern path.** In the fallback
   path the mirror reuses the grid's own left-sticky columns. In the `.lw-sda`
   path the whole day table is translated, which kills sticky — so the frozen
   name/counter columns are drawn as a separate static, opaque, clipped overlay
   pinned over the left (`.mxfixed-frozen`), and IT carries any interactive
   control (the counter picker); the translated layer under it is
   `pointer-events:none` + aria-hidden so the accessible/clickable set stays
   single.

5. **The `@keyframes` must live at the FILE'S TOP LEVEL.** This file wraps
   everything in a `#page-leavewar { … }` native-nesting block; a `@keyframes`
   at-rule is invalid inside CSS nesting and the minifier (lightningcss) rejects
   the whole build. Keyframe names are global, so a top-level `@keyframes
   lwx-follow` still binds from inside the nested rule. Don't move it in.

6. **The day-column headers are `position: static`, NOT sticky — perf.** A
   blanket `sticky` on every one of the ~365 day headers makes the scroll engine
   re-evaluate all of them every frame, for a `top: 0` that pins NOTHING (no
   vertical scroll to stick over). Overriding the day cells to `static` cut the
   scroller's sticky-element count ~425→~60 and, under a 6× CPU throttle, the
   median scroll frame ~283ms→~17ms. Only the day headers change; the frozen
   LEFT columns keep their own left-sticky. Do NOT restore sticky on the day
   headers.

The whole thing is gated so the fallback runs unchanged where the feature is
missing, and header↔body column alignment stays pixel-exact (`dx = 0`, verified
at 402px and 1300px). The alternative — a real inner scroll box that CSS sticky
pins for free — was declined by the owner (it reintroduces the nested-scroller
feel he rejected on 10 Aug 26). The fix-by-fix history follows.

- **The date header FREEZES on desktop too** (owner, 27 Aug 26 — "freeze top
  panel for leave war on desktop … when I scroll down the top bar that has the
  dates goes out of view, the top bar will freeze just like how the mobile does
  it"). The phone's fixed header MIRROR (`.mxfixed` / `sticky-head`, an overlay
  because the page owns the one vertical scroll so CSS sticky cannot pin against
  it) now activates at ANY width — the `max-width:700px` gate is gone. It freezes
  just below the app top bar (its sticky lower edge, `.topbar` bottom, z-index
  60 over the mirror's 55), tracks the grid's horizontal scroll one-way via the
  rAF pump, and reuses the same `.who`/`.bal` sticky-left CSS to keep its lead
  columns frozen. Desktop keeps its own real-`sticky` frozen-left columns
  untouched; only the header path widened. **The mirror is GPU-composited**
  (owner, 28 Aug 26 — "the lag on the frozen bar … 0 latency … when u scroll
  horizontally"): `.mxfixed` carries `transform: translateZ(0)` and
  `.mxfixed-scroll` carries `will-change: scroll-position`, so a per-frame
  `scrollLeft` write recomposites a layer instead of repainting the header. The
  residual lag was dropped frames (the mirror repaint missing a busy frame the
  compositor already slid the grid on); the layer makes that repaint cheap
  enough to land every frame. This is a paint-cost change only — the JS sync,
  the one-way follow, and the sticky lead columns are all unchanged. True zero
  latency is not reached (a JS-followed element cannot be frame-locked to a
  compositor fling on every device); the honest gain is far fewer dropped
  frames. The alternative — a real inner scroll box that CSS `sticky` could pin
  for free — was declined by the owner (it reintroduces the nested-scroller feel
  he rejected on 10 Aug).
- **On browsers with CSS scroll-driven animations, the bar's horizontal follow
  is COMPOSITOR-driven, not JS** (owner, 28 Aug 26 — a screenshot showing the
  date bar trailing the grid mid-fling: "the top bar not catching up … glue it,
  keep the feel"). This supersedes the "true zero latency is not reached" caveat
  above FOR THOSE BROWSERS: the JS mirror only *follows* the grid (main thread,
  a frame behind the compositor fling — which is the trailing he saw at rest in
  a caught frame, ~2 columns, snapping back on stop). Instead `.mx-wrap` names
  its horizontal scroll as a `scroll-timeline` (`--lwx`), `.mx-outer` hoists that
  name into scope with `timeline-scope` (the fixed bar is not a descendant of
  the scroller), and the bar's day columns are TRANSLATED from 0 to the grid's
  max scrollLeft (`--lwx-max`, set from JS on layout changes only) across the
  grid's whole scroll range — so grid.scrollLeft ↦ translateX(−scrollLeft) on
  the compositor, glued with nothing to catch up (measured drift 0→~3px across a
  ~10,000px range, the same sub-pixel rounding the JS path has at rest). A
  translated table can't keep `position: sticky`, so in this path the frozen
  callsign+counter columns are a static, opaque, clipped COPY pinned over the
  left (`.mxfixed-frozen`); the scrolling layer's own who/bal are
  `pointer-events:none` so the copy carries the (still-working) counter picker,
  and the copy is aria-hidden so the scrolling layer stays the one accessible
  set. Gated by `.lw-sda` (JS `sdaActive` feature-detects `scroll-timeline` +
  `timeline-scope`); when absent — older browsers, and jsdom — the JS mirror
  above is used UNCHANGED, so nothing regresses where the feature is missing.
  `@keyframes lwx-follow` lives at the file's TOP LEVEL (a keyframes at-rule is
  invalid inside this file's `#page-leavewar { … }` nesting wrapper; the minifier
  rejects it — keyframe names are global, so the binding still resolves).
- **The day-column headers are `position: static`, NOT sticky** (owner, 28 Aug
  26 — a second recording, "seems pretty laggy still": the sideways swipe felt
  janky). Diagnosis: the recording was NOT the frozen mirror at all — the whole
  roster fits on his phone, so the header never slides under the top bar and the
  mirror never activates; what lagged was the ordinary horizontal scroll of the
  grid. The header and body are one `<table>` inside `.mx-wrap`, so they cannot
  drift apart — but the blanket `.mx .mxhead th { position: sticky; top: 0 }`
  rule made every one of the ~365 day headers a sticky element, and the engine
  re-evaluated all of them on every scroll frame. That `top: 0` pins NOTHING
  (`.mx-wrap` has no vertical scroll for it to stick over — the very reason the
  JS mirror exists), so it was pure per-frame cost. Overriding the day cells to
  `position: static` (in `matrix.css`, right under the blanket rule) cut the
  scroller's sticky-element count from ~425 to ~60 and, under a 6× CPU throttle,
  took the median scroll frame from ~283 ms to ~17 ms (a clean 60 fps). Nothing
  that actually freezes is touched: the frozen LEFT columns keep their own
  `.who`/`.bal` left-sticky, the month labels keep `.brakl`, the mirror still
  tracks in lockstep, and header↔body column alignment is pixel-exact
  (`dx = 0`, verified live at 402 px and 1300 px). Do NOT restore `sticky` on
  the day headers — it re-adds the jank for a freeze that sticky can't do.
- **The colour/mark pop-out is labelled "Legend"** (owner, 27 Aug 26 — renamed
  from "Key"; `Chrome.tsx`, testid `legend-open` unchanged). **It also keys the
  LETTERS, not just the colours** (owner, 28 Aug 26 — "include what FS HS etc
  mean … things that reflect only on the leave war. Because it's not stated on
  inputs"; the codes he named were renamed FO/HO later that same day). Below
  the state/edge/asterisk sections, `Chrome.tsx` renders
  `CODE_GLOSSARY` from `engine/codes.ts` — a plain-English key to every grid
  code, grouped: **"Shown here only — not on the Inputs page"** (FO = full day
  OIL, earned by more than 6 hours worked on a weekend/PH; HO = half day OIL,
  6 hours or less — credited automatically from the published schedule or
  confirmed on a Duty & commitments input, never typed here, so the
  accent-tinted
  `.leg-sec-here` heading marks them out), then Medical (the grid's `B`/`C`
  shorthand + HL/OML), Leave (LL…EL, CL — the catalogue's eight since 3 Sep 26;
  OFF left it 2 Sep 26) and Other duty (CSE/OD). The glossary is
  built straight from the catalogue's own label tables (one source, no drift),
  and each swatch takes the grid's own colour by the SAME rule the cell does
  (`isDuty` → `sc`, non-bid marker → `info`, leave → plain — mirrored into
  `.leg-sw.sc`/`.leg-sw.info`), so it doubles as a key to the two colours the
  state section doesn't cover. **The `sc` chip and its swatch are CYAN since
  28 Aug 26** (`rgba(59,198,232,…)`, Raptor's `--q-c` family — matrix.css
  `.c.sc` mirrored into `.leg-sw.sc`), not the old amber: the OIL-credit
  marker reads as its own family, apart from every bid state.
- **The word "Acknowledge" became "Pending"** on the decision controls
  (single and batch) — the same word the colour legend already gives the
  purple state. The stored token stays `'acknowledged'`; only the label moved.
- **The batch writers** live in `state/store.ts` (`setCells` / `clearCells` /
  `setBidStates` / `moveCells`) and carry the SAME per-cell guards as their
  single-cell parents under the `quiet` suppression, so a batch can never
  write where one cell could not; details in `docs/engine-rules.md`
  §Auth / roles. `movableCells` factors those same guards into "which cells of a
  selection hold a movable bid" — the ONE body the sheet (offer Move?), the
  anchor (first input), and the mover all read, so "what moves" can't drift.
  Since the 27 Aug overnight pass the counting is honest too: an empty cell
  swept into a delete-box counts as neither written nor skipped (the sheet's
  "N deleted" names real deletions, and an all-empty clear neither persists
  nor notifies), and a PARTIAL write keeps the sheet OPEN so its "N written,
  M skipped" note is actually read (`onDone`'s `keepOpen`; closing on the
  same tap killed the note it had just set). The single-cell writers carry
  the batch writers' whole law now as well: `setBidState` checks `canDecide`
  exactly as `setBidStates` does, `shiftBid` checks the stage/window/war-day/
  in-squadron law exactly as `moveCells` does (a typed off-war date used to
  make a bid vanish from every screen while still draining the balance), a
  medical code is refused from a member at `setCell` itself, and a chain of
  closed-war moves keeps the ORIGINAL origin in `shiftedFrom` — the trail
  answers "when did he bid this", not "where was it last hop".
  Pinned in `store.test.ts`, `selectsheet.test.tsx`.

### Published-stage remarks editing (owner, 27 Aug 26)

Once a war is PUBLISHED, a single tap on an approved leave opens a note editor
(`ui/RemarksSheet.tsx`, testid `remarks-sheet`) — the run's OWN person (a
member editing their own leave) or an admin (anyone). It takes precedence in
`Matrix.tsx` over the read-only Raptor sheet and the bid/decision sheets
(`canRemark`), and exists only at `published`; a member still cannot DRAG there
(a block of runs has no one note). The note lives on the Raptor INPUT the cell
derives from — a leave FILED on Inputs (Raptor-owned) or BID in the war (the
lw-tagged row `runOutbound` mints at publish), both found by
`sync.ts:leaveInputAt` — which since the 27 Aug overnight pass is handed the
CELL'S OWN code, so under a leave clash (two inputs covering one day) it opens
the record that actually derives the tapped cell: same leave type, exact
portion preferred, the lw-tagged (war-minted) row outranking a plain one, and
a non-leave code (an FO/HO credit) matching nothing. The save runs through
Raptor's one commit path
(`inputedit.ts:setLeaveRemarks → commitInputEdit`): a remarks-only edit leaves
the leave's `rowSig` unchanged, so the lw tag and the war cells do not move —
only the note the Inputs page reads is rewritten, and the member-own /
scheduler-any gate comes free from `commitInputEdit`. To make the cell tappable
at published for a member's own war-bid leave, `openable` gains a CHEAP branch
— since the overnight pass it is the viewer's own APPROVED biddable cell (code
+ state truthiness only; an admin's cells are already openable via
`canEditCell`): a refused or pending bid at published opens NOTHING for a
member, and the first cut still painted it tappable — a dead tap exactly where
the stakes are highest. The precise "is there a backing leave" test stays in
`canRemark`, run once per opened cell, never per drawn cell. Exactly ONE sheet
renders per opened cell — the decision sheet and the post-out sheet carry the
same exclusion terms the others always did (a posted-out day holding a bid
used to stack both). Pinned in `remarks.test.tsx` (own → editor, admin → any,
member-other → the read-only Raptor sheet, not-published → neither) and the
scrim table; e2e drives the admin round trip in a real browser.

## A member edits only their own personal inputs (owner, 27 Aug 26)

On the Inputs page a member lands on THEIR OWN inputs — the person filter
defaults to `ME` for a member, `all` (Everyone) for a scheduler — with
Everyone one pick away in the same filter. On every other person's row the
edit ✎ and delete ✕ are simply not rendered (`canEditSched() || r.person ===
ME`); the row is view-only. The document paperclip is the exception and stays
on every row — anyone may VIEW any attachment, gated nowhere. The write-path
backstop behind the hidden controls lives in `commitInputEdit` / `removeInput`
and is in `docs/engine-rules.md` §Auth / roles. Pinned in
`audit-guards-inputs.test.ts`.

## The ⓘ info-only switch on programme items (owner, 1 Sep 26)

A Ground / Common Programme item can be flipped **info only**: printed on the
programme, never checked against the rules (the engine seams are in
`docs/engine-rules.md`). On screen:

- **The switch** is a fourth `mbtn` in the board row's control cluster —
  CX · ⓘ · ■ · ✕ — on both `sbProgPanel` and `sbGroundPanel` (`data-pinfo` /
  `data-grinfo`; the shared `sbRowCtl` grows an `fyi` param that ONLY the
  ground rows pass, so duty/sim rows never draw it). Lit state is accent on
  accent (`.mbtn.nfo.on`), the glyph bumped to 11px so ⓘ stays legible.
- **The row look** is the `fyi` class from `rowCls` (board `.sb-arow`, week
  `.ah-row`/`.pl-row`): opacity .75 — quieter than live, clearly livelier
  than cancelled (.cx .55, which wins when both are set) — and NO
  strikethrough, which is cancel's language. Crew pucks keep their seat
  colours (the 1 Sep 26 rule: greyed states keep colour).
- **Read-only surfaces** (view week, read-only board) show a static accent
  `ⓘ` instead of the button. On the week and the peek it rides in the
  REMARKS cell (owner, 1 Sep 26 — moved out of the name column so the ⓘ
  shares the one column the late mark already uses): `plRmk` emits `fyiTag`
  as a leading badge, floated left via `.rmk.has-late` so a remark wraps
  beside it, and the peek's own remarks spans do the same. On the read-only
  board it stays in the row's control track (`sbRowCtl`/`sbProgPanel` emit a
  bare `.fyitag` beside where CX/flag sit), because that row's remarks is a
  bare `<input>` with nowhere to nest a chip — the same exception the late
  mark carries. Everything emits '' when the flag is unset, so the seed
  week's view markup — and the reference compare — stays byte-identical.
- The crew picker raises no reasons while an info row's people cell is armed
  (see engine-rules) — by design, not an omission.

Pinned in `ui/board.test.tsx` (toggle + read-only mark) and
`engine/infoflag.test.ts`.

## The Leave War tab is kept alive between visits (owner, 1 Sep 26)

"The leave war tab is slow to open" → keep-alive chosen over rebuild-and-memoise
(the grid's cost is the DRAWING — ~28k nodes — not the maths). The contract:

- **Built once per session.** The first visit builds the grid exactly as
  before; leaving the tab HIDES the section (`Shell.tsx lwEverRef` → the
  `.doze` class), never unmounts it. Only Leave War gets this — every other
  page is a cheap rebuild and stays one.
- **`.page.doze` = `display:block` + `content-visibility:hidden`**
  (`scheduler.css`, @supports-guarded; a browser without it falls back to the
  base `.page` display:none — correct, just slower to re-show). Measured on
  the built bundle: re-showing from display:none relays the whole grid out,
  411–863ms at 1280px / ~260ms at 390px; the content-visibility layout cache
  re-shows in 1–2ms. A dozing section sizes as EMPTY (height 0), so it
  never adds scroll height under the active page, and its descendants
  measure 0×0 — the same zeros every Matrix measurement guard already
  handles for display:none/jsdom.
- **The memo firewall** (`LeaveWarPage.tsx LwBody`, memo, no props): a Raptor
  notify re-renders the Shell, and without the firewall React would re-walk
  the hidden 28k-node tree on every board keystroke. Topbar/StageBar/Matrix
  each subscribe to the LW store themselves, and every rendered fact crosses
  the seam THROUGH that store (roster reprojection, role, viewer — all end in
  a LW notify), so the firewall can never hide a real change. Don't hand
  LwBody props, and don't render Raptor module state inside it — either
  reopens the wall or the staleness it guards against.
- **Show side**: the `active` effect restores the window scroll (tracked live
  while the tab is up — reading scrollY on the way out sees the clamp the
  hide already caused) and dispatches ONE window `resize`, which is the one
  wiring every Matrix measurement already listens on (frozen header/columns,
  month strip, strip height, bottom scrollbar). The grid's own sideways
  scroll and zoom survive because the DOM never went away — a return lands
  on the same month, same spot.
- **Hide side**: the effect cleanup dispatches the same `resize`; measured
  at 0×0 it unmounts the FIXED bottom proxy scrollbar (`.mx-hbar` is React
  state fed by a rect), which keeps the geometry gate's "nothing leaks onto
  the Raptor pages" pin byte-true with the grid still in the DOM.
- **Global listeners must check they're the page showing** (bug-hunt fix,
  1 Sep 26). A document/window listener owned by a Leave War overlay now
  SURVIVES a tab switch — `Sheet.tsx`'s and `Chrome.tsx`'s capture-phase
  Escape handlers used to swallow the Escape Raptor's cell editing restores
  on, and close the hidden sheet unseen. Any such listener must bail unless
  `#page-leavewar` carries `.on` (no wrapper — the standalone app — means
  always act). The Matrix's scroll/resize measurers are exempt only because
  they already bail on the 0-width rects a hidden section measures.
- **First open is unchanged by design.** Making THAT faster means
  virtualising the grid — only if the owner still feels it.

Pinned in `ui/lwkeepalive.test.tsx` (mount once / doze / same-DOM return /
scroll restore / resize kick) and the `e2e/leavewar.spec.ts` keep-alive spec
(real-browser: sideways position survives the round trip, a month jump still
works after the hidden spell, no page error).

## The open-bidding box on the Leave War grid (owner, 1 Sep 26)

"Can u make the border of the dates open for bidding green … the exterior box
of the entire period" → refined to a glowing, deeper, more faded green border,
no label. It marks which columns the squadron may bid on. The contract:

- **When.** Only while `period.stage === 'open'`. A draft / closed / published
  war shows no box — the box means "open for bidding RIGHT NOW", the same thing
  the OPEN FOR BIDDING stage chip says. It re-measures on stage change, so
  advancing or reopening bidding shows/hides it at once.
- **Where.** Around the columns in the bidding window — the period's
  `bidFrom..bidTo` (`inBidWindow`). Null bounds (the whole war open, the state
  a war starts in) wrap every day column. The box runs from the month-bracket
  row (the `.mxhead` top) down to the foot of the roster.
- **How it's drawn.** ONE absolutely-positioned overlay, `.lw-bidbox`, inside
  `.mx-wrap` (which is now `position: relative`), sized in JS by
  `Matrix.tsx measureBidBox`. NOT per-cell borders: a single element gives the
  continuous glow, and — being part of the scroller's content — it tracks the
  horizontal scroll with no handler and none of the fling-killing scrollLeft
  writes the rest of Matrix guards against. Measured in the same layout signals
  as the month strip (period/stage/window, zoom, row-window, counts fold,
  resize) — PLUS the store `version` (bug-hunt fix, 1 Sep 26): the box's height
  is the whole table's, so any commit that adds or removes a row (a counter
  built/deleted, a member joining via the Quals sync, a CAT sub-heading
  appearing) must re-measure or the box reads a row short until the next
  zoom/resize. Four identity-guarded rect reads per commit — noise next to the
  repaint that commit already paid for. jsdom leaves it null, so geometry-free
  tests are unaffected.
- **Layering.** `z-index: 1` — above the day cells, BELOW the frozen
  callsign/counter columns (z 2/3) and the scrolled-in band overlay (z 4). So
  when the year scrolls under the frozen columns the box's left edge hides
  behind them exactly as a day cell does; it never floats over the frozen
  column. `pointer-events: none`, so it never intercepts a bid tap or a
  drag-select.
- **Colour.** `rgba(74,140,100,.80)` border with a low-opacity green halo
  (`box-shadow` outer + faint inset) — the owner's final pick, the lighter of
  two faded greens compared live (the deeper `rgba(56,104,76,.78)` was the
  other). Still darker and more desaturated than the app's bright `--ok`, and
  chosen over a brighter glow across two earlier rounds of comps. Don't swap it
  to `--ok` or brighten the halo without asking.
- **Known trade-off, deliberate.** Outline only, no fill (the owner did not
  take the faint-wash option): scrolled into the MIDDLE of a long open window
  both edges are off-screen and nothing marks it until you reach an edge. The
  faint green wash is the layer to add if he ever wants it obvious everywhere;
  the wash variant was built and shown, so it is a one-line add, not a redesign.

Pinned in `e2e/leavewar.spec.ts` (real-browser: the box frames 1 Jan – 31 Mar
with its left edge on the Jan 1 column, and clears when bidding closes).

## The Leave War grid draws a window of months (3 Sep 26)

The year grid draws WHOLE MONTHS at their REAL widths, never the whole year
at once (`src/leavewar/ui/colwindow.ts`; the measuring in `Matrix.tsx`).
The contract, in the order a reader meets it:

- **First open draws January–February**; the fill engine (below) adds the
  runway a beat later, off the paint. A month-strip button draws that month
  and the one after it and lands the month's first column at the frozen edge
  in the same commit that draws it. A war shorter than five months is drawn
  whole.
- **The undrawn months are PLACEHOLDERS, so the scroller is year-wide from
  the first paint** (owner, 5 Sep 26 — "do the placeholders + moving", picked
  off a mockup of four scrolling styles). One empty cell before the first
  drawn day and one after the last, in EVERY row (header, brackets, fills,
  counts, events, roster), each exactly as wide as the undrawn months it
  stands in for (`.lwph`, width written as an INLINE style on each cell —
  `applyPlaceholders`, plus a mount hook so a cell that appears later takes
  the current width — never React state, and since 6 Sep 26 never a CSS
  variable on `.mx-outer`: a custom property changing on the grid's ancestor
  re-styled all ~7,000 elements under it on every month draw). A faint diagonal
  hatch marks a placeholder for the beat before its month lands. A month's
  width is MEASURED once it has been drawn and kept by war+zoom
  (`monthPxRef`), so a pruned month's placeholder is exactly its width and
  re-drawing it moves nothing; a month never yet drawn takes an estimate (the
  average day width × its days, `avgDayWRef`). Why this is safe where the 3
  Sep "no spacers" rule (22 distinct day-column widths) said it wasn't: an
  estimate's error only matters LEFT of the view, and such a month is never
  drawn there mid-scroll (next bullet). Every row carries the SAME cells as
  the header — the 20 Aug column virtualisation that misaligned on iOS gave
  some rows colSpan spacers over full header columns; no row here differs.
  This container has no WebKit, so the owner's iPhone is the gate for that.
- **Months are drawn IN PLACE while the scroll is still moving** — growth
  only (`colwindow.ts stepAllowedInMotion`): to the RIGHT of the view always
  (nothing on screen moves), to the LEFT only over a month whose width is
  already measured (the swap is width-for-width, so nothing hops); a prune,
  and a left grow over an estimated width, wait for scroll REST (the 120 ms
  idle), where the anchor correction (`anchorRef`) hides the shift. On a
  touch screen the in-motion left grow skips the anchor altogether — the
  `scrollLeft` write that would fix a stray pixel is what kills a fling. A
  view parked nowhere near the drawn window (a scrubber drag, a long fling
  over placeholders) REPLACES the window with the visible months first, then
  the runway grows outward from there.
- **Every row spans exactly the drawn columns plus the placeholders** — the
  header, the brackets, the fills, the roster rows, the count rows and the
  event rows (a band that began before the window is emitted from the first
  drawn day). Pinned in the e2e as "no row's colSpan sum differs from 2 + the
  drawn day count + the header's placeholder cells".
- **The open-bidding box clips at the seam**: a bound outside the drawn
  months cuts that side (`.lw-bidbox.cut-l` / `.cut-r`, a clip-path so the
  halo cannot ghost a false edge), the other sides keep their glow.
- **What is NOT windowed**: the manning verdicts (all 365 days), the lock
  set, a sheet's date span, the "N days" caption — those are about the war.
- **jsdom draws the whole year** (its rects are 0×0, so the window's lazy
  initialiser sees no layout); the arithmetic is unit-tested and the
  measuring is proved in the browser gate on both projects.
- **One draw-toward-a-target engine, per mode** (owner, 4–5 Sep 26 — "fill in the
  background", then "load the next months as I approach the edge", then, once
  measurement showed the browser spends ~1.4s RE-STYLING the full-year grid on
  every reveal, "shrink when I leave, rebuild on return", then "do the
  placeholders + moving"). A single loop widens or trims the drawn window ONE
  MONTH PER BEAT toward a target that depends on the mode (`colwindow.ts
  stepToward`): a short timeout while the scroll is moving (an idle callback is
  starved by an active scroll), an idle callback at rest so a beat never competes
  with a paint. It is woken by every scroll event (the view moved), by scroll
  rest (the held-back prune / left-grow steps — the rest kick itself lands inside
  the moving window, so a held-back step re-arms its own retry), and by the tab
  being shown:
  - **PHONE → a ROLLING window a few months AHEAD of the visible ones**
    (`rollingTarget`, one month behind / three ahead), the trailing side pruned AT
    REST so the DOM stays light. A flick meets already-drawn columns instead of
    the stuck edge the old grow-2-at-rest lump left. This is what fixed
    "scrolling to the end of the block sticks, I have to flick again".
  - **DESKTOP, tab ON screen → the WHOLE year**, so scrolling runs end to end and
    the bottom scrollbar SLIDES (below). The posted-out row-window crossing is the
    only rest-time repaint left (rare, ~0 in a realistic sweep).
  - **DESKTOP, tab OFF screen → capped at a few months** (`HIDDEN_MONTHS`), and
    drawn only while the user is IDLE (`state/idle.ts msSinceInput` > 2 s), so a
    background draw never lands under a keystroke or a puck drag on another page.
- **Shrink on leave, rebuild on return** (owner, 5 Sep 26). Keeping the whole year
  drawn while the tab was hidden meant the browser re-styled ~25k cells (~1.4 s on
  a slow laptop) every time the tab was shown. So on leaving the tab the desktop
  grid SHRINKS to a few months around the last view (the next reveal wakes a small
  grid — measured ~0.4 s to visible, was ~1.9 s), and the fill REBUILDS the year
  on return. The dropped months become placeholders of their MEASURED width, so
  nothing moves and the sideways scroll position is exactly where the reader left
  it (pinned in the e2e for both devices). This REVERSES the 4 Sep "desktop keeps
  the whole year / never prune" contract; the reveal cost is the reason. The
  on-screen signal is `leavewar/state/screen.ts` — a plain listener set, NOT the
  store, so flipping it never re-renders the grid.
- **The desktop PRE-WARMS after login** (owner, 5 Sep 26 — "load it while I type
  my password so there's no wait"). Once the user pauses after login, `Shell.tsx`
  mounts the tab HIDDEN (desktop only): that pulls its separate download and draws
  its first few months off the critical path, so the first click opens an
  already-built grid (~0.5 s to visible, was ~2.4 s). It is idle-gated, so it never
  lands under the login keystrokes and never slows login-to-week; the phone is left
  alone (its first open is already quick). Pinned in the e2e as "the Leave War
  screen is a separate chunk, pre-warmed after login".
- **The desktop bottom scrollbar is a YEAR-WIDE SCRUBBER** (owner, 4 Sep 26 —
  "the scroll bar at the bottom keeps adjusting … make it linear … halfway I'm
  already at the edge"). Because the grid only drew ~2 months, the proxy bar
  (`.mx-hbar`) whose spacer matched the drawn content spanned only those: its
  thumb filled the bar, "halfway" was the edge, and it RESIZED every time the
  window grew. On 4 Sep the spacer became the whole war at an ESTIMATED width
  and a drag JUMPED the grid to the dragged-to day on release while months were
  still filling in. Since the PLACEHOLDERS (5 Sep 26) the grid's own scroller is
  year-wide, so the bar is a plain proxy of it again: its spacer is the grid's
  `scrollWidth` (the thumb is year-proportional and only shifts by the few
  pixels an estimated month gains or loses when drawn), a drag SLIDES the grid
  at any time (the grid's own scroll handler lights the strip and wakes the
  fill, which draws the months under the moving view in place), and the bar
  follows the grid by copying its `scrollLeft` (`syncHbar`, suppressed for
  250 ms after a drag so a slide does not yank the thumb from under the finger).
  Desktop only — the phone finger-scrolls the grid and shows no proxy bar.
  Pinned in the e2e as "a year-wide scrubber; the desktop grid fills the whole
  year and the bar then slides it".
