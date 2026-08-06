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
  `behavior:'instant'` writes). **Enforced by `e2e/geometry.spec.ts`
  (`npm run test:e2e`), not by Vitest** — jsdom has no layout engine, so
  every rect it reports is 0×0 and a broken grid passes it silently. That
  suite runs in CI as the fourth gate; `docs/probe-sweep.md` lists what it
  covers.

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

Four surfaces flag aircrew, and all four navigate (owner, 5 Aug 26). A warning
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
- **The flag chip on a puck** (`.puck .lchip`) resolves to that person's worst
  issue that day via `personWarns(di,id)[0]`. That is `[0]` and not a search
  because `personWarns` preserves `WARN`'s order, which `validate()` has
  already sorted by severity. It cannot go through `chipOf`: that collapses by
  `RANK` and is not invertible.

**The board list and the chip must open `DWOPEN` themselves** (both mirror the
`[data-adv]` branch, not the `.witem` one). `focusWarn` never touches
`DWOPEN`, which is correct on the week — a `.witem` only exists inside an
already-open box — but a focus set from the board or a chip with `DWOPEN`
empty leaves lit pucks and no way to clear them: `html.ts` renders
`✕ Clear focus` only inside an open box.

**Every ringed puck carries a chip** (owner, 5 Aug 26). The crew-pairing
family (`CREW_SOLO`, `CO_APPROVAL`, `OCU_NO_IP`, `ILLEGAL_CREW`, `NO_IR`) used
to ring and never chip, which left it the one family with nothing on the puck
to click; it now marks `CP`/`CPH` (renamed from `CC`/`CCH`, owner ask 5 Aug 26
— see `engine-rules.md` §The crew-pairing chip). A ring without a chip is now
a **bug**, and `validate.test.ts` asserts
there are none. What is still deliberate: the ring itself is never a click
target — it is part of the puck, and the puck selects the person (owner,
Aug 26).

A chip resolves to the person's **worst** issue that day, not necessarily the
one that set the chip. Those coincide except where a lower-ranked chip wins on
severity — a man carrying both a conflict and a pairing problem shows `C` and
lands on whichever the engine emitted first of the two hard warnings. Both are
one click away in the day's issue list either way.

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
