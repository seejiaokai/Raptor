# Code read — his answers to the five-flags look card (D270, D271, D272, D275) — Fable 5.1, 27 Sep 26

Branch `claude/five-flags-batch-continue-2cfa70` at `f81bb395`, read against `a0a164a3` and `main`. Read-only; nothing
run. Brief: `docs/superpowers/briefs/2026-09-27-five-flags-answers-read-brief.md`. I designed the scenarios for this
change earlier (`…/2026-09-27-five-flags-builds-scenarios-fable.md`); this read starts from the four promises and hunts
for what is MISSING, using the evidence sheet's roll-calls (§3), break tests (§4), walk (§5) and not-walked list (§6).
D56 applied: nothing below is about data already stored. (The working copy carried an uncommitted comment-only edit to
`flagglow-css.test.ts` from another chat while I read; I assessed the committed text.)

**The short of it: I found no defect against any of the four rulings.** Every door onto a row is judged before its
write by one body; every ring a "you" puck can wear is resolved to the same winner as another man's; the arrow room is
gone without a trace; the relink fix (my F1) is right and complete. Two low items below, one a test that claims more
than it checks, one an observation for the look card.

## Findings, ranked

### 1. LOW — the door test says "no history step" but only reads the edit log (new with this branch)
**Where:** `raptor-port/src/ui/rowtwice-refusal.test.tsx`, `untouched()` (~line 62): `expect(elogRows(0).length, 'and no
history step').toBe(0)`.
**Why it matters:** an Undo step is a push onto the history stack (`state/history.ts HIST`), not an edit-log line. A
write reaching `afterSchedMutate()` with no key pushes history and logs nothing, so this line stays green if a door ever
slips through to `done()` without a named edit. The walk (W3 f7) is today's only proof of "no Undo step".
**Setup → action → screen:** none — a test's claim, not a behaviour; the app is right (every refusal returns before
`done()`, checked in `drag.ts applyDrop` and `view.ts placeArmed`).
**Fix, step by step:**
1. In `rowtwice-refusal.test.tsx` add `import { HIST } from '../state/history'`.
2. Give `untouched` a second parameter: `const untouched = (row: string, ix: number) => { …; expect(HIST.ix, 'and no
   Undo step').toBe(ix) }` — keep the edit-log line too (it proves no named edit).
3. In each test that calls `untouched`, capture `const ix = HIST.ix` on the line before the refused `dropOn` /
   `placeArmed`, after any legitimate placement the test made first, and pass it: `untouched(row, ix)`.
4. Break test: in `applyDrop`'s cell branch move the `rowTwice` block below `fillSlot(...)` and watch the new line go red.

### 2. LOW — observation for the look card, not a defect: the green "where can he go" rings say no on his own crowd (on the batch, `a0a164a3`; not `main`)
**Where:** `raptor-port/src/ui/highlights.ts paintSelRings` (~line 241): `slotBar(id, raw)` with no `from`.
**Setup → action → screen:** Edit Schedule, Monday, FLIGHT SAFETY [Ranger, Comet]. Click Ranger's puck (blue on every
seat, green rings on the places he could go). His own crowd's "+ add" and Comet's place show NO green ring (`rowTwice`
answers "already on FLIGHT SAFETY … not added twice" — it does not know which place he would leave). Then drag
Ranger's crowd puck onto that "+ add": it lands (a move to the end, allowed). The ring said no; the drop said yes.
**Why not a defect:** the selection is a PERSON, not a seat, so the rings answer "add him from the list here?" — and
that IS refused. On `main` the "+ add" wore a green ring only because its busy check missed his own row. Nothing to fix
without his word; one line on the look card.

### 3. Hardening, not a finding (D56): the relink filter compares raw values
**Where:** `raptor-port/src/ui/inputedit.tsx` ~1150, `extras.more.some((v) => v === r.person)`. `rowPlaces` resolves
`more[]` through `whoId(v)`; a legacy callsign string there would slip this filter. Only stored data could carry one
(`putAt` writes ids), so D56 keeps it out. If touched anyway: `whoId(v) === r.person` in the `some` and the `map`.

## My F1 fix (the relink) — right and complete?
Yes. `r.person` is already the NEW person when the branch runs; the branch sits inside the success path only;
`acceptInput` lands only on the Ground Programme, so `wasAcc === 'g'` is the one kind that carries extras; both doors (the
Inputs page Person field and the `iu:` reassign) reach it through `commitInputEdit`. The extra place is blanked and
trailing blanks trimmed, as a removed extra is held elsewhere; the next-tick toast survives the caller's success line
(walked, f9); the test went red first. Going forward the holder can never be in `more[]` (the `fillSlot` belt refuses
him), so a time-only edit never enters the branch.

## Explicit negatives — what I checked and found nothing wrong with

**1. The rings (D270, D272).** The purple ring rule's `:not()` list names every ring class `html.ts puck()` can emit —
`warn` (with `hard`/`note` riding on it), `boxred`, `boxdash`, `boxdot`, `oilglow` (and `half`); `oildim` is left in
on purpose (Q-B, look card). Classes the highlights pass hangs (`sel`, `hl`, `dim`, `wfoc`, `advf`, `echo`) never
co-occur with `me`: `me` is added only when nothing is focused, and under a clicked warning the week/board loop returns
before it, while the palette never gets `wfoc`. No `@media` rule, no board / palette / preview / ALL-AVAIL / print
rule selects `.puck.me` (grep: only lines 1371–1383 and two comments). Removing `!important` from flagged "you" pucks
opens no asymmetry: `.puck.hl`/`.puck.sel` cannot be on his puck while `me` is; `.dragimg.lift` beats `.puck.warn` and
loses to `boxred`/`boxdash` for every man alike ([GHOST-FLAG-SHADOW] is anyone's); the palette's standby/busy inset
beats a plain severity ring for anyone. The one rule left that differs is `.puck.me{z-index:2;position:relative}` —
stacking only; every ring's reach (≤3.5px) fits the puck gap.
`flagglow-css.test.ts`'s cascade is right: `!important` first, then specificity with `:not(.x)` counted as one class
(the spec's rule), then source order with later winning; the `background` shorthand is counted beside `background-color`;
its 96-set cross-product is exactly severity × box × trace × OIL, and it guards itself against reading nothing.

**2. Every door (D271).** One body, `avail.ts rowTwice`, asked before the write at: `applyDrop`'s seat branch (roster,
and BOTH ends of a swap), its cell branch (before the source is cleared — a refused move never half-happens), and
`placeArmed` (the key as armed, `.+` kept). Mouse and finger share `applyDrop` (its only two callers); every surface's
pucks and lists enter it as `roster`/`slot` kinds.
The belt in `fillSlot` covers any caller nobody guarded (`writeFill` included; `writeSlot` has no app caller). Keys:
`seatRow` (the `selfKey` alias) trims `.+`, `.xN`, `.pax.N`, `.p/.w`, `a:di.ri.N` — a desk's or ground row's bare key
is its primary place, extras are `.xN`, a sim's seats, pax and D50 spare seat are places. The sim `.*` and `.pax.+`
keys are emitted by NO surface (only `${base}.+`), so their odd trims reach no door and the belt still matches by id.
An ⓘ row is judged before the FYI exit; an accepted request's row is an ordinary `g:` row; `iu:` is routed to
`reassignInput` before `placeArmed`; templates blank `more[]`; duplicated waves are flying seats; plans/undo/redo are
whole-day snapshots; no text field writes a row's `who`. The reverse holds:
a swap inside one crowd and a move to his own crowd's end pass (`from` excluded), his own place is not "elsewhere", a
placeholder is left out, a man on a different overlapping row is only warned, a jet line's two seats are not held
(Q-A, on his card).

**3. The refusal leaves the app whole.** Each refusal returns before `done()`: nothing written, no `markEdit` (no
pending mark, edit-log line or history push), no landing flash, the arm untouched, the phone drawer comes back
(`ROS_REOPEN` untouched), `DRAG` cleared. The caption (`hoverWhy` → `slotBar`), the crew list's struck line
(`palette-html` → `slotBar`), the "N free" head (`rank` → `slotBar`) and the toast (`rowTwice`) read one string, and
`slotBar` returns it ahead of every other reason. After a write, `barDrop` and `placeArmed` ask of the landed place
(`lastFilled`), so a plain add never reads as a copy.

**4. The arrow revert (D275).** `pan.ts`, `highlights.ts`, `e2e/geometry.spec.ts` are byte-identical to `main`;
`view.ts` differs from `main` only by D271 and the batch's `lastFilled`/`landed` lines (kept, rightly); `scheduler.css`
differs from `main` only by the D270 block and the ghost comment. No `weekInset`, `scroll-padding` or 54px room remains
in `src`, `e2e`, `probes` or the live docs; the two "no scroll-padding" comments (`pan.ts`, `swipeweeks.test.tsx`) are
true again; `weekinset.test.ts` is gone and off the file map; `scripts/handpass/ff-w4.mjs` still asserts the room but
carries a RETIRED header; `feature-impact.md`'s "§3d" pointer is the 26 Sep sheet's §3d, which exists.

**5. The tests.** Every wired place has a break test (§4 of the sheet), each re-derived from the code. No vacuous pass
found: `untouched`'s "nothing reads pending" is real (`markEdit` writes `SCHED.pending` on every edit, published or
not); the ⓘ-row test sets the field the engine reads (`r.info`); the F1 test asserts once-and-holder and the toast's
order. The one soft spot is finding 1.

**Walk dispositions I agree with:** the phone drawer drag, a real iPhone, the OIL half ring, Q-A / Q-B / Q-C / S-28
on the look card.

**Rulings:** none this read.
