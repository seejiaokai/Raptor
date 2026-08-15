# RAPTOR — project state

Companion to `raptor-port/CLAUDE.md` (the index and working rules) and
`raptor-port/docs/` (engine rules, UI contracts). This file holds what
those two don't: **what is still open**, and **where each file lives**.

The port from the original single-file app is complete; that history is in
`git log`. This is the live application now, under active development.

**Closed work does not live here.** A bug that is fixed, a feature that has
shipped and a decision that is settled leave behind at most a contract —
which belongs in `docs/engine-rules.md` or `docs/ui-contracts.md`, next to
the rule it constrains — or a stable decision, which belongs in
`CLAUDE.md` §Stable decisions. The story of how it was found and fixed
belongs in `git log`. Keeping post-mortems here buries the open list.

## The gates, and how they lie

**All six gates were green first-hand for the audit sweep of 12 Aug 26, for
its five follow-up fixes, again for the guard-rail sweep, the new-year date
fix (13 Aug 26), the Personnel ground-crew category (13 Aug 26), again for
the BOARD REDESIGN of 13 Aug 26 — the cleanup + inline `+ Wave`, the AMT
FCP/RCP block with a debrief range, and the duty-template system — and again
for the CREW-FINDING build later the same day (the tap that plants with the
warning after, placeholder-arms-the-slot, the green eligibility rings, and
the Available-crew panel folded to one line with honest wave counts), once more for the WARNING-DISMISS HOLD (14 Aug 26 — a blank tap that closes a
warning box no longer flings the view up the outerHTML-swapped day it collapsed
above), again for the ARMED-PALETTE pass (14 Aug 26 — any armed slot now
switches the day-wide grey fade off, not just an SC shift, and the struck
entries' 74×74 grey slabs are back to 74×15 pucks: a flex-basis meant for row
containers was governing HEIGHT in the haswhy column, see
`docs/ui-contracts.md` §Drag / arm-and-plant), and once more for the
BOARD-PALETTE COLUMN fix (14 Aug 26 — on the phone SCHEDULER BOARD the aircrew
drawer's three columns overlapped, because its base `flex:1` shared the width
equally and squeezed each below the fixed 74px puck once the Personnel column
made it three; the board now pins columns to one puck like the edit week and
the drawer widened 64vw→78vw to fit them, see `docs/ui-contracts.md` §The board
on a phone is ONE window), and once more for the BOARD-FULL-EDITOR batch
(14 Aug 26 — the scheduler board now edits the in-time, area/area-time and
Traffic that had been week-only, its Live Checks panel sits BELOW the sign-off
and reads "N issues · N warning" coloured by severity like the week's,
empty People cells show a standing grey dotted "add here" box on both surfaces,
the board remarks reveal reads `R` not `+` and its box carries a faded
"Remarks" placeholder, FCP and RCP sit side by side on the phone board (a
`.sb-seatpair` wrapper — display:contents on desktop, a 2-col grid on a phone)
to save vertical space, and the Live Checks panel is its own #sbSign +
below-sign-off arrangement with the phone flattening the board column,
DESKTOP untouched — see `docs/ui-contracts.md` §The board edits everything the
week does, §Empty cells, and §The board on a phone is ONE window), and once
more for the OFT SEAT GRID (14 Aug 26 — an OFT crew row renders the AMT's
`.fcprcp` grid on the board: the two real seats with the seat-qual rules
anchored on `p`/`w` as ever, empty seats droppable now, and instructors/
observers riding `more[]` paired below with held, droppable holes; the ENGINE
is untouched — extras were already time-only commitments, the owner's stated
model — see `docs/ui-contracts.md` §A deleted sim pax / the OFT paragraph
under it), and once more for the SIM-REAR-SEAT rule change (14 Aug 26 — the
owner's "oft doesn't need an instructor to be in the RCP, likewise for amt":
a sim's rear seat now takes any pilot, in the engine's Q (sims) block and in
`slotBar` alike (a new `slotRules().sim` flag scopes the instructor bar to
the jet, whose IP/IR/FI rule stands untouched, as do every sim FRONT-seat
rule); the reference's copied rule is excised by `refwin.ts:resim()` — it
fires nowhere on the seed, every seeded sim rear seat holds an IP or a WSO,
so parity was byte-equal either way; rules in `docs/engine-rules.md`, the
CAT-ladder bullet), and once more for the AMT + BLOCK button (14 Aug 26 —
one tap on the AMT header mints the whole BRIEF / BOX / DEBRIEF trio, times
blank per the new-line rule, the BOX carrying `pax:[]` so its FCP/RCP grid
offers its first empty pair at once; board-only, three structural adds, the
OFT header untouched — contract in `docs/ui-contracts.md`, the `+ Block`
paragraph under §The OFT takes instructors), and once more for the JUST-ADDED
BLUE BOX (14 Aug 26 — "a blue box around the new thing added for around 6
seconds": every board add — row, line, note, wave, duty/AMT block — flashes
`.sb-fresh` (selection blue) for 6s. `markStructuralAdd` (`publish.ts`, the
one choke every add funnels through) fires `HOOKS.flashAdded`; `state/view.ts`
holds the key in `FRESHADD` on a 6s timer; `highlights.ts` `paintFreshAdds`
hangs the box post-render like `paintArm`, so an unrelated edit inside the
window cannot wipe it, and a STEADY static box-shadow — never an animation —
so the clear-and-re-add on every repaint does not flicker; only the dismissal
fades (`.sb-fresh-out`, a CSS animation for the last ~0.55s via a second timer
into `FRESHOUT`, dropped under `prefers-reduced-motion`). A wave boxes its
whole `.sb-go` and dedups its own inner line; a duty `+ Block` boxes its header
and sibling rows. Contract: `docs/ui-contracts.md`)**, run in
this container on the matching tree:
`npm test` 1476 tests across 92 files (the blue box added four to
`board.test.tsx` — a sim row boxes only itself, a wave boxes the whole wave
with no inner box, the AMT block boxes its three rows, the key clears after
the window; the AMT + Block added two to
`board.test.tsx` — the button sits on the AMT header alone, and one tap
mints the three blank rows with the BOX grid ready; the sim-rear-seat change added four —
the OFT/AMT rear seat raises no QUAL and clears `slotBar` while the jet rear
and sim front seats keep their rules; the board-full-editor batch added eight to
`board.test.tsx` — the new editable fields render and commit, the checks bar's
label and severity class, the sign/checks order, the seat pair and the Remarks
placeholder — and the OFT grid four more: the grid renders, an empty OFT seat
offers itself, extras append and hold their holes, a who-text row stays plain;
the crew-finding build added
`selrings.test.tsx` and re-pointed the arm-and-plant, darkened-name and
avail-grid tests at the new behaviour; the armed-palette pass pinned
no-fade-while-armed inside the arm-and-plant test), `node
reference/tfin.js` 728/0 (the reference file itself is read-only and
untouched; the sim-rear-seat divergence lives in the port and the refwin
patch),
`npm run build` clean, the full `npm run test:e2e`
geometry job 92/92 in Chromium (the crew-finding build added two — the ring
paints are distinct and move nothing, the folded panel opens and closes — the
dismiss-hold build a third, the focused puck holding still across a blank
tap that closes its warning box, the armed-palette pass two more, the
armed palette's pucks all measuring 74×15 at both widths, and the board-column
fix one more, the armed board columns never overlapping their neighbour;
the drawer-width test was re-pointed off the old 64vw two-column assumption),
`probes:adapted`
all six probes green (the armed-palette pass re-pointed `sc2` #5, which
pinned the fade the owner removed) and
`perf` 4/4 — **the week DOM ceiling was LOWERED 5530 → 4000** against a 3621
measure, because the folded panel's saving is real headroom and a slack
ceiling would have passed a change that silently re-expanded every panel
(the argued comment is in `probes/perf-port.cjs`). The guards were then driven on the
built bundle: `1290`, `9999` and `morning` all bounce off a take-off that
stays `12:40` while a real `0845` goes in, a freshly added blank line renders
no `NaN:NaN` anywhere, and the Inputs page holds zero sideways overflow. Two of those went red first and both were real: the new
empty-remarks e2e test waited for `.rmkin` to be VISIBLE, which is the one
thing the feature guarantees it is not (Playwright's default `state` — use
`attached` when asserting a thing is hidden); and `wrap-async` caught the
phone's name-column reallocation being applied up to 820px, where it gave a
TABLET so much name width that the probe's 61-character jam fit on one line.
Scoped to 480px, which is why that bound exists.
The built bundle was then driven at 390×844 and the fixes measured there:
a duty row 109px → 79px (and the whole board 7484px → 7084px), the programme
row's two times back on one line under their own headings, the week's name
column 97px → 111px against a 104px longest word, and the Inputs table opening
on `Aug 12 → Aug 26`. **That last one shipped twice in one morning** — first
anchoring to the loaded week, then, at the owner's word, reverted to a plain
today → +2 weeks; the open-work list below carries which of the two is
current and why. All four were re-checked on the DEPLOYED page.
The board's measured DOM went 897 → 911 on the 12 Aug sweep, then to 923 with
the board redesign (the inline `+ Wave` panel and the AMT FCP/RCP labels), then
DOWN to 829 with the 14 Aug board-full-editor batch — not because it got
lighter but because the sign-off moved out of the measured `#sbBoard` into its
own `#sbSign` element — against an unmoved 960 ceiling; the week measures 3621
under the 4000 ceiling
the crew-finding build set (the Available-crew panels boot folded now).
**SANS AVAILABILITY (14 Aug 26) — all six gates green first-hand on the
matching tree.** `npm test` 1476
across 92 files (`sansavail.test.ts` is new — `sansGate`'s five statuses,
`slotBar`'s grey-out on a flying/OFT/AMT seat and the duty/ground carve-out,
the `SANS_AVAIL` advisory firing only against a filed record, the parity-guard
pair; `slotrules.test.ts` pins `simKind`; `palette.test.ts` and
`inputs.test.tsx` cover the `.rall.rsans` band and the add form's sub-form).
`node reference/tfin.js` 728/0, `npm run build` clean, `npm run test:e2e`
94/94 (two new: the `.rall.rsans` section holds puck geometry with the badge
beside — not inside — the puck at both widths, and the armed-OFT strike prints
its SANS reasons without the 74×74 slab regression), `probes:adapted` 6/6,
`perf` 4/4 — both CEILINGS unmoved, but the board MEASURE is not: it went
829 → 835, because `sbSansPanel` draws its header and its "No SANS
availability filed for this day." empty state on EVERY day, while the week's
new group is a conditional `inGrp` that renders nothing when no record
exists, so the week measure holds at 3621. Six nodes out of the 960 ceiling's
margin, and the direction is the point: this build made the board heavier
while the seed gained no data at all. The
built bundle was then driven at 1500px: the record filed through the REAL add
form (calendar + checkboxes), the badge on the palette section and the week
group, ten record-less SANS struck with the printed reason while armed on an
OFT and the one with a covering offer left plannable, and planting him on an
AMT he did not offer raised exactly one amber "not offering AMT today"
Advisory — zero console errors. Deployed-page check happens at merge, as
ever.
**SANS ONE-WINDOW REWORK + FLY-WITH RENAME (14 Aug 26, same day as the
feature shipped) — all six gates green first-hand on the matching tree.**
The owner's phone feedback rebuilt the record: ONE window on the standard
All day / AM / PM / Custom template (the per-event time pairs could not be
cleared on a phone and are deleted), `sans` reduced to F/O/A flags, the
activity type `Fly` renamed `Fly with`, record-less SANS struck on the
palette BY DEFAULT (unarmed — armed was already `slotBar`'s job), the week
group and board panel replaced by ONE shared card grid (puck · letters ·
window · remarks, click opens the input-edit dialog, timed-by-start then
combo-grouped), and the Available-crew panel's SANS tail deleted (its
folded count now reads "N SANS offering"). `npm test` 1502 across 93 files
(`sanscards.test.tsx` new — 12 card-grid tests; `sansavail.test.ts`
rewritten to the new shape with a LEAK-GUARD block pinning that a timed
offer never reads as a timed absence; `palette.test.ts` +4 for the default
strike and remarks; `inputs.test.tsx` re-pointed at checkboxes + span
picker; six files re-pointed for the `Fly with` string). `node
reference/tfin.js` 728/0 — the rename needed NO new refwin patch: the
reference's own `^Fly$` offer regexes simply stop matching, which is the
commitment semantics both engines already share. `npm run build` clean,
`npm run test:e2e` 96/96 (the SANS geometry test re-pointed: a covering
offer now means the record's one window covers the slot, and it checks the
unarmed default strike; a card-grid geometry test added), `probes:adapted`
6/6, `perf` 4/4 — week 3621 under 4000, board 835 under 960, both
unmoved. The built bundle was driven at 390×844 and 1500px: a record filed
through the REAL form (calendar walked back to Jul 26, F+O ticked, Custom
08:00–12:00), the phone bug dead (one tap on All day clears the timing),
the non-SANS refusal toast, 10/11 record-less SANS struck with nothing
armed, the cards ordered vinci(08:00)→ipman(PM)→krait(all day) at 2
columns on the phone and 3 on desktop, a card click opening the dialog
with ticks + span picker, the board panel carrying the same three cards,
"Fly with" in the type dropdown — zero console/page/network errors.
Deployed-page check at merge, as ever.
**THE SIX-FEATURE BATCH (15 Aug 26 — board publish controls · Unavailable
editable down to the puck · whole-day master templates · per-day drafts ·
the demo SANS seed · the app-wide tap-feedback pass) — all six gates green
first-hand on the matching tree.** `npm test` 1600 across 99 files
(`daytpl.test.ts` 20, `drafts.test.ts` 16, `demosans.test.ts` 5,
`daytplui.test.tsx` 15, `draftsui.test.tsx` 18, `unavailedit.test.tsx` 16
are new; `inputs.test.tsx` re-pointed at the steady flash timing and the
sort fix, `accept.test.ts` at `markStructuralAdd`), `node reference/tfin.js`
728/0 (the SANS seed is boot-time in `state/demoseed.ts`, so every parity
fixture reads the INPUTS array pristine — divergence-free by construction),
`npm run build` clean, `npm run test:e2e` 96/96, `probes:adapted` 6/6,
`perf` 4/4 — **week DOM 3702 under the unmoved 4000 ceiling** (3621 → 3702:
the six seeded SANS cards and the day-head draft chip are the growth, and
the crew-finding headroom absorbs it), **board 855 under the unmoved 960**
(835 → 855: the publish strip and the Templates & drafts panel header).
The built bundle was then driven at 1500px and 390×844: desktop — the board's
publish strip live (sign, publish, version/pending chips), a day duplicated
into two drafts and switched with the toast, save-as-template opening the
manage modal pre-selected, 14 Unavailable person targets armed/droppable,
24 input-edit cards with the SANS seed visible; phone — the board opens with
Templates/Drafts/publish all present at 0px sideways overflow, an Add input
with no date picked refuses with its toast (feedback working as designed),
and with a date picked the new row lands FLASHING AND INSIDE THE VIEWPORT —
the owner's original complaint, proven on the real bundle. Zero console,
page or network errors across every drive. Deployed-page check at merge, as
ever.
**THE PUBLISH/DRAFTS CLARITY REWORK (15 Aug 26 — the owner's "I'm a bit
confused" message: the view page now defaults a PUBLISHED day to the frozen
ISSUED document with an issued/working picker, stored drafts are hidden from
viewers once a day is published, a draft preview never wears the ✓ Published
stamp, and the scheduler can switch/duplicate drafts ON a published day — the
switch rebases the day's pending set as the true diff against the issued
snapshot, so "publish Draft 2, then edit Draft 1 and publish it as AL1"
finally works) — all six gates green first-hand on the matching tree.**
`npm test` 1616 across 99 files (`drafts.test.ts` +10 — the rebase describe:
value diff, AL-tint reinstall, add identity, deletion tombstone, who-hole,
A→B→A clean round-trip, `inp:` preservation, issue/unpublish round-trip —
with the two old refusal tests re-pointed at the success path;
`draftsui.test.tsx` +5 — the published-day view describe: issued default
frozen against a live edit, the working toggle's banner/stamp, drafts hidden,
leftover `d:` preview ignored, a scheduler's switch carrying straight into
the viewer's working view; `html.test.ts` +1 — the draft-preview stamp and
the quiet issued render; `session.test.ts` pins `VWORK` clearing). `node
reference/tfin.js` 728/0 (the seed has no published days or drafts, so every
new branch is inert under the byte compare), `npm run build` clean,
`npm run test:e2e` 96/96, `probes:adapted` 6/6, `perf` 4/4 — **week 3702 and
board 855, both ceilings unmoved and both measures unmoved**: every new
control renders only on a published day, which the seed never has. The built
bundle was then driven at 1500px and 390×844 through the owner's own
scenario: Monday signed and published, the view page opening on
"Original — as issued" with the ✓ Published stamp and NO banner; a
note edited after publish invisible on that face and visible under
"Working draft — not issued" with the amber dashed banner + stamp; the
drafts menu on the published day carrying its new note and duplicating
without refusal; the switch to Draft 1 toasting "1 difference from Original
pending"; AL1 published and the viewer's issued face moving to
"AL1 — as issued" with the amended note in AL1 cyan; zero sideways overflow
at 390px on both faces — zero console, page or network errors throughout.
Deployed-page check at merge, as ever.
**TWO BUG-TEST SWEEPS (15 Aug 26, after the batches above) — all six gates
green first-hand.** The 15-Aug-batch sweep (PR #209 — the day-template
stale-tint fix, the reopen→re-publish `reissueReopened` fix, three hardening
fixes) and the SANS-Availability sweep (PR #210 — the midnight/overnight
window fix in `sansGate`/`sansWindow`, the LoX SANS tick wired to `p.san`, the
duplicate-record `sansOverlapRefusal`, the SANS `slotBar` spare carve-out).
`npm test` **1628** across 99 files (+12 over the 1616 above: `daytpl` +2,
`publish` +3, `unavailedit` +1, `html` +1 assertion, `sansavail` +4,
`quals` +1, `inputedit` +2 — all in EXISTING test files, no new file), `node
reference/tfin.js` 728/0, `npm run build` clean, `npm run test:e2e` 96/96,
`probes:adapted` 6/6, `perf` 4/4 — **week DOM 3702 and board 855, both
ceilings AND both measures unmoved**: every fix was logic (window math, a
role flag, a write-path refusal, a picker carve-out), none added DOM. Both
merged and verified on the deployed page.
`docs/probe-sweep.md` carries the live figures, and records that a shorter
board can still be a heavier one — and now that a heavier board can read
lighter when the measure's boundary moves.

Three earlier passes the same day were each green on the same six and each
checked on the DEPLOYED page (the standing instruction, owner 7 Aug 26): the
zoom/history/bubble batch (1141 tests, 84 geometry — the bubble that the old
`place()` parked at −192px clamps to the top edge and hides only while its
anchor is entirely off-screen, a five-times-edited seat shows three changes
plus `⌄ all 5 changes`, a deleted note logs its own words); the short-day-name
pass; and the day-navigation pass. The `probes:adapted` resolution failure
recorded here before 12 Aug 26 was a Windows-checkout problem with the adapted
runner's direct `playwright` import, not a code fault. Re-state any of these
only after re-running them.

- **`npm run perf` asserts FOUR things, not seven, since 10 Aug 26** — two
  DOM ceilings and two behavioural checks. The three per-node TIMING budgets
  were removed as assertions on the owner's decision, after he asked what
  they had ever caught: nothing, in the life of this repo, while the ceilings
  were right all four times they fired. The timings are still measured and
  printed, so a real slowdown is still visible; a wandering number just isn't
  a failure any more. **Do not re-add them, and do not "fix" one by widening
  it** — a bar loose enough to cover a 3×-swinging estimator would pass a
  genuine doubling too. Reasoning and the counted record:
  `docs/probe-sweep.md` §The three timing budgets stopped being assertions.
  If a printed timing ever looks wrong, the PAIRED recipe in the same file is
  still how to settle it: one reading proves nothing on this container (nine
  readings of one unchanged commit spread 1.08×–1.23×).
- **`probes:adapted` and `perf` do NOT serve themselves** — start
  `npx vite preview --port 4173` first or both fail with
  `ERR_CONNECTION_REFUSED`, which reads like a code fault and is not.
- **And that cuts the other way: if a preview is ALREADY running on 4173,
  `npm run test:e2e` reuses it and never rebuilds** (`reuseExistingServer` in
  `playwright.config.ts`, off in CI only) — so e2e silently measures whatever
  was built last, not your working tree. A CSS change was proven "still
  passing" against a stale bundle that way, and a deliberately-broken control
  case passed too, which is how it was caught. **Kill the preview before
  trusting an e2e run after editing CSS or markup**, or run the two in the
  other order: e2e first, then start the preview for the probes.
- **jsdom cannot measure layout** — every rect Vitest reports is 0×0, so it
  can prove which class was emitted and nothing about what was painted.
  Geometry contracts are gated by `e2e/geometry.spec.ts` (the fourth CI
  gate, 86 checks); wider visual work still wants the probe path
  (`npx vite preview --port 4173` + `probes/`).
- **jsdom cannot HIT-TEST either, and that is a separate trap** (12 Aug 26). A
  pointer bug on the board hid there for a day: dispatching a synthetic
  pointerdown straight at the element you mean is not what a finger does, and a
  gesture wired to the wrong element passes every such test. The board swipe's
  real fault was that mid-settle a finger landed on `.schedboard` (the live board
  was a screen away and the preview was `pointer-events:none`), so the press went
  to an element with no listener on it. **In a browser test, dispatch to
  `document.elementFromPoint(x, y)`, not to the element you have in hand.** The
  swipe itself was removed hours later, so the worked example is gone with it —
  the lesson is not, and it applies to the row-drag and puck-drag machines that
  are still there.

## Known issues / open work

- **THE PUBLISH/DRAFTS CLARITY REWORK shipped (15 Aug 26, second batch of
  the day)** — the view page's issued default (`dayIssuedHTML` + `VWORK` +
  `viewVerSelHTML`, contracts in `docs/ui-contracts.md` §the view-only
  week's picker), the published-day draft switch with the pending rebase
  (`engine/drafts.ts:rebaseDayPending`, rules in `docs/engine-rules.md`
  §Drafts), and the draft-preview/working stamps. Deliberately open, so
  none of it is read back as a bug:
  - **The issued face shows NO warnings list** — warnings are live-model
    state and a snapshot is never validated (the standing preview rule);
    the ⓘ panel stays the viewer's live route. A viewer comparing Monday
    (published, quiet) with Tuesday (live, warning box) is seeing design,
    not a fault.
  - **The week banner's "N unpublished edits" counts a divergent draft's
    rebased diff**, on the viewer-facing banner too — honest, but a big
    alternative can read alarming. Noted in ui-contracts; no damping built.
  - **Export-to-Excel exports the live model** — the working copy, not the
    issued document. Pre-existing semantics, newly reachable now a
    divergent draft can be live on a published day.
  - **`VWORK` is session view state** — a viewer's issued/working choice
    resets on login/logout like every other view choice; the issued
    default is the zero-state, which is the point.
  - **OPEN owner question — reword the "Restore this version" button?**
    (owner, 15 Aug 26, asked at the end of the clarity-rework session and NOT
    yet answered: "What does restore this version to original mean".) Restore
    DISCARDS the day's unpublished edits and returns to the issued copy, while
    the newly-allowed draft switch KEEPS the differences for the next AL — two
    opposite outcomes whose labels do not say which is which. Proposed but NOT
    built (do not build unasked — §Product bar): button "Make this the live
    schedule — discards unpublished edits" plus a matching banner line
    (`html.ts` `pvBar`, board mirror in `SchedBoard.tsx`), and its
    `ui-contracts.md` line. A small copy change if he wants it.
- **WHOLE-DAY TEMPLATES AND PER-DAY DRAFTS shipped (15 Aug 26)** —
  `engine/daytpl.ts` / `engine/drafts.ts`, `DayTplModal.tsx` /
  `DraftsModal.tsx`, one Templates/Drafts button pair reached from both the
  board's own content and the week's sign-off strip (`docs/engine-rules.md`
  §Day templates, §Drafts; `docs/ui-contracts.md` §Day templates and
  Drafts). What is deliberately left open:
  - **A template captures STRUCTURE, never crew** — `tplFromDay` blanks
    every person reference, the same precedent `blockFromTpl` (duty
    templates, 13 Aug 26) already set; a scheduler still crews the day by
    hand after applying one. A sim row's `pax` list blanks to EMPTY, not to
    a placeholder — there is no "still needs someone" marker on a sim seat
    the way a flying seat's placeholder gives one.
  - **Applying a template still refuses a published day, by design** —
    "Reopen the day first": a template apply has no rebase, so a whole-day
    swap under an issued document would diverge silently with no AL trail.
    **Drafts no longer share that refusal (15 Aug 26)** — switching a draft
    on a published day rebases the day's pending set as the diff against
    the issued snapshot (`rebaseDayPending`, `docs/engine-rules.md`
    §Drafts), which closes the very hole the refusal existed for. If the
    template flow is ever wanted on published days too, the rebase is the
    piece to reuse — do not just drop the guard.
  - **Applying a template on a REOPENED (previously-published) day no longer
    leaves stale AL tints (fixed, bug-test sweep 15 Aug 26).** `applyDayTpl`
    now clears the day's `SCHED.changes` slice alongside pending/added, the
    same three-slice wipe `restoreDayVersion` does — before this, a template
    swap (which marks nothing pending) left every AL colour the day wore
    before it was reopened stuck onto the template's brand-new rows. Rules:
    `docs/engine-rules.md` §Day templates; pinned in `daytpl.test.ts`.
  - **Re-publishing a REOPENED day now refreshes what viewers see (fixed,
    owner 15 Aug 26).** Before: reopen a published day, change it by ANY
    means (a hand edit or a template), sign, Publish day — `setDayApproved`
    re-approved but never refreshed the version's frozen snapshot, so the
    view page's issued default (`dayIssuedHTML` → `daySnapOf(dayCurVer)`)
    kept showing the pre-reopen document while the scheduler's live view had
    moved on, with no pending marker to flag the split (a plain note edit did
    it as much as a template swap). Now `setDayApproved`'s re-publish branch
    calls `reissueReopened`, which re-issues the CURRENT version in place —
    refreshing the snapshot `dayCurVer` resolves to, so the issued view
    catches up. The version LABEL is unchanged (no surprise AL number). This
    revises the old "first-publish-wins, never restamp the Original" rule for
    the reopen case only: a never-amended day re-issues its Original, an
    amended day re-issues its current AL; the ORDINARY amendment flow (edit a
    published day, Publish AL — no reopen) still freezes the Original the
    moment it is first issued. Rules: `docs/engine-rules.md` §Version
    snapshots / restore; pinned in `publish.test.ts`.
  - **Templates, drafts, and the SANS demo seed below are session /
    localStorage-only, like everything else this app persists that way** —
    see the "No shared data" bullet further down.
- **FEEDBACK: press states, snap-to-new-input, the steady flash shipped
  (15 Aug 26)** — one grouped `:active` rule covers every button class in
  `scheduler.css` (`docs/ui-contracts.md` §Feedback: every tap answers).
  **The press-state CSS itself is UNTESTABLE in jsdom** (no layout engine,
  no `:active` simulation worth trusting) and is gated only by eye on the
  live bundle plus `e2e/geometry.spec.ts`'s existing checks — there is no
  vitest assertion that a button actually darkens or settles on tap, and
  none is planned; do not read the green unit-test gate as proof of this
  feature. The Export-to-Excel button on the Shell topbar now toasts
  "CSV downloaded" on every export, matching the Inputs/Quals pages' own
  exports from the same batch.
- **SANS AVAILABILITY shipped (14 Aug 26) and was REWORKED the same day on
  the owner's phone feedback** — ONE window on the standard All day / AM /
  PM / Custom template (the per-event Fly/AMT/OFT time pairs are deleted;
  they could not be cleared on a phone), `sans` is flags-only, record-less
  SANS are struck on the palette by default, the week/board draw one shared
  card grid (click a card to edit in the dialog), and the Available-crew
  panel's SANS tail is gone — its folded count reads "N SANS offering"
  (`docs/engine-rules.md` §SANS availability, `docs/ui-contracts.md` §SANS
  Availability, on screen). Things worth restating so they are not read as
  bugs: the `SANS_AVAIL` advisory is DELIBERATELY silent when nothing is
  filed at all — the palette strike + toast still say so, but nothing
  persists in the day's warning list (the seed-parity reasoning is in
  `engine-rules.md`); a filed record is session-only, like every input in
  this app; filing one late earns the LATE badge like any leave input
  (downchits stay the only exemption); the restriction to SANS aircrew
  STAYS (owner reconfirmed at the rework: "only SANS can input the
  availability") and is enforced at every editor's commit (`sansRefusal`),
  not in the type dropdown; and the week card grid deliberately dropped the
  in-place time/remarks cells — they were DEAD for SANS under the old
  force-allday override anyway, and the dialog a card opens carries every
  field. The activity type `Fly` is `Fly with` now (owner, same batch) —
  `isFly`'s regex moved with it, and the reference needed no patch because
  its `^Fly$` regexes not matching IS the shared commitment semantics.
- **The CREW-FINDING build (13 Aug 26) shipped four pieces and left two
  REPORTED-NOT-BUILT options beside one deliberately dropped shape.** Shipped
  (contracts in `docs/ui-contracts.md` §Drag / arm-and-plant, §Selection
  highlight, §The Available-crew panel folds): a palette tap always plants
  with the reason toasted after (drag and tap agree now — the owner's
  "everything plants, warning after"); a placeholder-filled slot arms like an
  empty one; a selected person's takeable slots ring green (empty bright,
  filled dimmed — `slotBar` itself is the judge, see
  `docs/feature-impact.md`); and the Available-crew panel boots folded with
  honest wave counts. What was NOT built:
  - **The second-tap replace flow** (tap a selected person again on his seat
    to arm it) was designed, comped, and then DROPPED at the owner's own
    question ("is the 2nd tap excessive?") before build. The fallout flow is:
    delete the person and click the emptied seat, click a placeholder, or
    drag the replacement straight onto the seat. **Do not rebuild it
    unasked.**
  - **A "find replacement" button on a warning row** (e.g. LEAVE_FLY on a
    planned man, jumping straight to the armed picker) — reported as the
    future option if the owner ever wants a more visible entry point; it
    only covers seats that currently warn, which is why it was not the
    primary shape.
- **GUARD RAILS ON MALFORMED INPUT (owner, 12 Aug 26) — the line, and what is
  deliberately still open.** Four surveys swept every typed field. The rule
  applied: refuse MALFORMED data (not the kind of value the field holds, or
  outside the range that kind can take), warn about DECISIONS (a clash, an
  overnight absence, a late input). Refusals live at the WRITE path, where
  every caller already reverts its own cell on a false return; `parseHM` stays
  the loose shared reader and `hmOK` (`time.ts`) asks the range question
  beside it. Rules: `docs/engine-rules.md`, the brief and availability
  sections. What the sweep left ALONE, on purpose:
  - **Long free text on the WEEK's prose cells** (flight remarks, day notes,
    area) can still run a row to ~2000px. They are `contenteditable`, which
    ignores `maxlength`, so the only guards available are truncating a paste
    or refusing one — both worse than the disease. The board draws the same
    fields as `<input>`s and stays 50px, so a value can look fine there and
    tall on the week. Layout only; no gate is tripped.
  - **A wave label typed long on the week** becomes an `<option>` in the
    board's title `<select>` and can run past the panel (measured 2638px in a
    930px box). Recovery is picking any real title. Same class as above.
  - **Deleting the last in-time** removes the whole in-times block from the
    DOM with no control to add one back — undo restores it, which is the
    mitigation. The render is gated on `intimes.length`; ungating it is a
    render change with geometry consequences, so it was not done blind.
  - **`ruleParse` stays loose** — `6 monkeys` reads as 6, `0770` as 08:10 —
    because every accepted value is echoed back FORMATTED in the field and the
    toast, so the user sees exactly what was taken.

- **The phone week's programme NAME column is sized against its own longest
  word, and that is a measured number, not a preference** (12 Aug 26). NAME
  and PEOPLE were both `1fr` and split the row evenly at 97px, while the
  widest people cell in the whole week uses 76px of its 97 — so 21px sat idle
  beside a name column too narrow for its text, and `STANDARDISATION` (104px)
  broke as `STANDARDISATIO / N MEETING`, which reads as a typo. PEOPLE is
  pinned to one puck + 8px now and NAME takes the rest (111px measured).
  **A longer word than 104px would break mid-word again** — the guard is
  `hyphens:auto` (added the same day on the prose cells), which makes such a
  break carry a visible hyphen instead. **That guard is UNVERIFIED here and
  deliberately so**: this container's Chromium ships no hyphenation
  dictionaries — measured, `hyphens:auto` and `hyphens:none` give byte-identical
  heights — so it is a no-op in every local run and in CI, while iOS Safari and
  desktop Chrome do honour it. Do not "fix" it by widening the column further
  on the strength of a local screenshot; the local browser cannot show you the
  hyphen either way.
- **No shared data.** localStorage only — two devices never see each
  other's edits. The obvious next enhancement (needs a server or a sync
  backend; touches `engine/hooks.ts:storeBackend` and the mutation funnel).
  Everything else on this list that says "not persisted" or "per-browser" is
  the same missing piece wearing a different hat.
- **Prototype auth.** Hard-coded accounts; the deployed site is public.
  Manage-users edits the in-memory list only. Real accounts = server work.
  A member is not view-only: they add, edit and delete their own Inputs and
  tick the qualifications they hold. Roles table: `docs/engine-rules.md`
  §Auth / roles; the enforcement (page and write path, never the nav) is
  pinned by `src/state/session.test.ts`.
- **One dataset.** The schedule is the demo week (Mon 13 – Sun 19 Jul 26, a
  full Monday-to-Sunday week; the weekend is non-flying, duty crew only).
  Week chips re-label but every week shows the same data (the original
  behaved the same way). "Throw pucks (auto)" is a stub, as in the original.
- **Only `rules` and `stores` survive a reload.** Everything else a
  scheduler types is session-only: the whole schedule, the Quals page's
  ticks, initials and FLIGHT, **a personnel body added on the Quals page and
  its Remarks note** (the seeded three are in source and always there), and
  the EDIT QUALS column set (add a column back and its ticks return — removal
  never touches `p.quals`). If the squadron wants their LoX to survive a
  reload, that is the same server/sync work as the first bullet. `sbWide` is
  module-local and resets on reload too, matching the original's
  session-scoped behaviour.
- **Personnel (ground crew) shipped as a new category (owner, Aug 26).**
  Rules in `docs/engine-rules.md` §Personnel, screen contracts in
  `docs/ui-contracts.md` §The Quals page… What is deliberately left open:
  their inputs, remarks and any added body are session-only (the server/sync
  bullet above), and they are seeded but **kept out of the seed schedule** so
  reference parity stays byte-exact — the day the app carries a second week of
  real data, a squadron would plan its own ground crew and none of that
  applies. A `pers` body reads the same at every joint (`p.pers`): if a later
  change iterates aircrew, check whether ground crew belong in it
  (`docs/feature-impact.md` §drift-seams).
- **AL versioning is ROLLBACK semantics.** Known limitation: previews freeze
  schedule content but personal-INPUTS and day-info read live data, and
  snapshots are session-only. Rules: `docs/engine-rules.md` §Version
  snapshots / restore.
- **Ground rows accepted before the Aug-26 callsign fix** keep the person-ID
  form in `who` and stay unresolved where id ≠ lowercased callsign (Hao Wen,
  X-Ray) — same visible behaviour as before, no migration.
- **The AVALON rule and the general midnight tail are BUILT** (11 Aug 26 —
  the owner's 11 Aug spec, both halves in one change; rules in
  `docs/engine-rules.md` §Validation, "AVALON's one check" and "The midnight
  tail"). What remains open around them:
  - **BB is unspecified, and deliberately outside the AVALON check.** The
    owner named AVALON jet seats and duty roles; BB stays wholly `noconf`
    with no fixed hours and nothing on it is checked at all. Ask him before
    extending the bar to BB.
  - **The loaded week's LAST day has no next day**, so its overnight tail is
    unchecked (nothing to shift in). Fixes itself the day the app carries
    more than one week of data — same missing piece as the first bullet in
    this list. **The FIRST day is now the mirror of it**: the tail runs both
    ways since 11 Aug 26 (see below), so day 0 has no yesterday to shift in
    either, and a small-hours take-off on the Monday is unchecked against the
    Sunday before. Same fix, same day.
  - **Exempt-line pucks ring from their OWN red rules only** (owner, 11 Aug
    26 — asked and answered twice, settled the same day): an SC spare or an
    AVALON seat rings for the availability check, a spare also for SC
    currency, and a warning the man earned elsewhere never bleeds onto the
    exempt copy. Rules: `docs/engine-rules.md` §Validation, "AVALON's one
    check". Do not "simplify" this back to all-or-nothing in either
    direction — both ends were tried and rejected within one day.
- **The leave-types build left two things open** (shipped 10 Aug 26; rules in
  `docs/engine-rules.md` §INPUT_META and §Availability is time-aware).
  - **A half-day absentee is no longer counted in the day-info "off" tally.**
    Deliberate — `dayOff` means off for the WHOLE day, and it also drives the
    palette's struck-through rank, where a man available all afternoon must
    not read as gone. But it is a number on screen that moved, so it is
    written down rather than left to be rediscovered.
  - **A morning absence still bars a sortie that STEPS before noon.** The
    flying window is padded to the step time because that is what the
    validator judges against — Monday's first VL takes off 12:40 and steps at
    11:40. Correct, and the owner was told; expect it to be reported as a bug
    at least once. The levers are the AM boundary or the step padding, never a
    picker rule that disagrees with the warning list.
- **The picker's busy-at-this-hour bar is ADVISORY, and that is the whole
  design** (owner, 11 Aug 26). `slotBar` now names an overlapping commitment
  for every slot, not only a standalone SC shift, excluding the seat being
  planned into so a swap stays silent. Like every other bar here it does not
  refuse anything: the name still shows, `barDrop` toasts the reason and the
  drop goes through. Do not harden it into a refusal — the app's whole
  vocabulary is soft bars, and a scheduler double-books deliberately more often
  than by accident. Two existing tests were re-pointed at the reason they are
  actually about (ATT B, actioned-Fly) rather than at "no reason at all",
  because seeded men genuinely are busy at those hours; that is the confound to
  expect when adding a slot-hours test, not a sign the bar is wrong.
- **`Sort all` reorders the waves and duty blocks themselves now (11 Aug 26),
  and it does NOT renumber their labels.** A day built out of order and then
  sorted can read `WAVE 2` above `WAVE 1`, because the label is free text the
  scheduler may have replaced entirely and rewriting it would clobber every
  hand-chosen name to fix a cosmetic mismatch. The owner was told at the time.
  If it ever bites, the honest fix is renumbering ONLY labels still matching
  the `WAVE <n>` default `+ Wave` mints — not a blanket rewrite. Rules:
  `docs/engine-rules.md` §Sorting a board section.
- **A SECOND document-level scroll listener went on on 11 Aug 26**, and it is
  deliberately not the same shape as the one below. `histbubble.ts`'s
  re-anchor is registered on the document in capture — scroll events do not
  bubble but they do run capture listeners from the window down, which is the
  only way to see every scroller — and its first line is a boolean on a
  variable that is null unless a bubble is actually up. It moved there from
  the board wrap, which could only ever see the board PANELS' scrolls:
  `.sb-main` is the wrap's parent, so the phone's single scroller never
  reached it and a bubble would have been left behind by the very scroll that
  brought its cell into view. If a third consumer ever wants this event, share
  one listener rather than adding another.
- **The input↔schedule sweep of 11 Aug 26 found seven test gaps it did not
  close.** Ranked as it left them: no test drives `commitInputEdit`'s
  `keep`/"moved outside the programmed week" branch (grep finds that toast
  string only at its own definition); none constructs an input whose `endDate`
  runs past the last loaded `DATES` entry; none asserts, either way, that two
  overlapping inputs for one person raise nothing; none plants a genuine
  `half:'am'`/`'pm'` record against a sortie's brief window through
  `validate()`; none puts a TIMED tomorrow input inside a night sortie's
  debrief window (the tail is pinned for `LEAVE_FLY`/`DNIF_FLY` only); none
  reaches `halfOf`'s PM boundary through the in-place cells; and nothing guards
  an accepted input being reassigned to a different person. All are
  MISSING-TEST, not known-wrong-behaviour.
- **`DT_SUM` still counts a man double-BOOKED among those "double turning".**
  The summary lists everyone with 2+ sorties, which is true of a man planned
  into two seats at once as much as of a genuine double-turn. Harmless beside
  the hard conflict that now fires, and left alone rather than special-cased.
- **The activity types warn but do not bar.** Training, CSE, Meeting, Fly,
  Personal, Appointment and Other now reach the validator the moment they are
  typed, so planting a man through one raises a warning — but they are not in
  `isAway`, so the palette still offers him and no slot is struck through.
  That matches how an actioned personal input has always behaved and nobody
  asked to change it; the inconsistency is noted here rather than fixed.
- **Stores configuration — the residuals.** The feature shipped (owner,
  7–8 Aug 26; contracts in `docs/ui-contracts.md` §Stores configuration and
  `docs/engine-rules.md` §Stores configuration). What is still open:
  - **A customised list freezes against the standard set.** The whole list
    is stored the moment it deviates (no per-entry diff makes sense for an
    ordered, renameable sequence), so a squadron that has customised its
    list will not pick up a store later added to `STORE_STD`. Telling
    "never seen this new default" apart from "deliberately deleted it"
    needs a tombstone list — machinery for a problem that does not exist
    yet, and deliberately not built.
  - **A frozen day preview renders with the CURRENT stores list**, not the
    list as it stood when that version was published. `rules` already
    behaves exactly this way, so this is consistent, not new.
  - **Deleting every store silently reverts on reload.** An empty saved
    list is indistinguishable from "load found nothing", so the standard
    six quietly return. No last-store guard exists; a squadron that wants a
    genuinely empty list to stick needs one.
  - **No migration for a list damaged by the pre-fix key mismatch.** Until
    the 8 Aug wave, deleting `2 TKS` and retyping it minted a second entry
    keyed `2tks` while every jet kept `opts.tk2`; `storesLoad` still accepts
    such an entry, so an affected squadron sees two identically-labelled
    chips and keeps a stranded `tk2` until the stray is deleted by hand.
    Nothing makes it worse, and the feature has not shipped to anyone yet.
  - **A misleading refusal.** Rename `2 TKS` to something else, then type
    `2 TKS` as a new store, and it is refused with "2 TKS is already on the
    list" while the list shows the new label — the refusal is correct (the
    key is taken), only the wording is confusing.
  - **The label match that restores a standard key** trims and upper-cases
    but does not normalise inner spacing or punctuation, so `2  TKS` or
    `2-TKS` still derive `2tks` rather than recovering `tk2`. Retyping the
    name as printed works, which is the path the toast promises.
  - **A near-cap stores list will trip the board's DOM ceiling
    legitimately.** The margin was sized against six stores and the feature
    supports `MAX_STORES` (24) — roughly one `.stchip` per store per
    aircraft line. Not raised pre-emptively, because a margin sized against
    a number nobody has hit is a guess; the fix when it bites is the
    ordinary one (check the time, raise the ceiling in the PR that needs
    it). Reasoning: `docs/probe-sweep.md` §The performance gate.
- **Editing an input from the schedule shipped with three things left open**
  (build two of the leave-types work, 10 Aug 26; contract in
  `docs/ui-contracts.md` §Editing an input from the schedule). The times and
  the remarks are cells you type in on both surfaces; the type and delete sit
  behind the type label.
  - **The TYPE is still a dialog, not a cell.** It is the one field that is a
    choice from a list, and a `<select>` in the week's 96px name column was
    not attempted — the three measured attempts to fit a separate control into
    these rows are recorded in the contract, and all three cost row height. If
    it is ever wanted inline, the BOARD has the width for it before the week
    does.
  - **Person and dates are not in the dialog** — deliberate, and the footer
    says so: all four fields it does carry keep the row on the day it was
    opened from, while moving it to another man or another date makes it
    vanish from the surface being looked at. If the owner asks for them, they
    need the Inputs page's calendar, not another two fields.
  - **A member still cannot edit his own leave from the week**, only from the
    Inputs page. The control is gated on `HOOKS.editMode()`, which is
    admin-and-Edit-Schedule, so the schedule surfaces stay a scheduler's.
    Opening it wider means an OWNERSHIP check (his own inputs only), which
    nothing in the app has yet.
- **History on the board shipped with four things open** (11 Aug 26; contracts
  in `docs/ui-contracts.md` §History on the board and `docs/engine-rules.md`
  §The edit log). The owner was told the first one before it was built.
  - **It can only ever say "Admin" or "Squadron member".** `HOOKS.whoami()`
    reads the hard-coded prototype login, so the log names an ACCOUNT, not a
    person, and it never shows what another scheduler did on another device.
    That hook is the one seam a server has to fill — same missing piece as the
    first bullet in this list. Do not dress it up as an audit trail.
  - **It clears on reload and on logout**, because the schedule does. A log
    that outlived the schedule it describes would point at nothing, and one
    that survived a logout would show the incoming user someone else's work
    under their own board.
  - **A row moved by drag or by Auto sort logs nothing by value** — the
    reorder paths mark keys whose values never change, which is why Sort all
    manages one line instead of six. `applyMove` has no `logAction` of its
    own, so a hand-dragged row is currently invisible to the list. Cheap to
    add if it is ever missed; not added blind. It is now the LAST schedule
    write with no line in the list: accepting an input, cancelling with a
    reason and rolling a day back were the other three, and all three were
    closed on 11 Aug 26 (`docs/engine-rules.md` §The edit log). The narrow
    exception left beside them is an accepted input edited onto another person
    or date through the Inputs dialog, which unaccepts and re-accepts
    internally — deliberately silent rather than two contradictory lines.
  - **The bubble covers the cells that carry an address, not quite all of
    them.** Anything with `data-bfld`/`data-slot`/`data-txt` works, plus the
    five older attributes (`store`, `bombs`, `area`, `atime`, `intimes`) whose
    prefixes `histbubble.ts` puts back by hand, and the traffic field (`tr:`),
    which is written from a modal and has no cell to hang a bubble on, so it
    appears in the LIST only. A new text trigger wants a line in `keyOf` as
    well — **and a value passed to `markEdit`**: this bullet claimed all six
    worked from the day History shipped and none of them did, because every
    one of those write paths passed a key with no values and `logEdit` returns
    on that (fixed 11 Aug 26, rules in `docs/engine-rules.md` §The edit log).
    Only `data-area`/`data-atime`/`data-intimes` are still bubble-less, and
    for a different reason: those three cells render on the WEEK only, and the
    bubble is wired to the board wrap. They are in the LIST.
    **And they cannot be JUMPED to either, which is the residual worth
    knowing** (11 Aug 26). Those three plus `tr:` — and, since the 12 Aug 26
    audit, `wl:` (the board draws the wave title as a `<select>`, which the
    cell lookup cannot answer for) — are the five families the
    board never draws as a cell, so `histJumpable` (`histbubble.ts`) keeps their rows
    out of the clickable set — they list, they just do not offer a jump. That
    guard exists because the two halves of this feature shipped separately and
    combined into a wrong answer: one made the four log a value at all, the
    next made every keyed row a button, and clicking one then said "That
    detail is no longer on this day" about a detail sitting safely on the
    week. **A new key family that the board does not render wants a line in
    `NO_BOARD_CELL` as well as in `keyOf`.** The honest fix, if it is ever
    wanted, is for the jump to leave the board for the week — nothing today
    does that, and it was not built blind.
- **The iOS focus-zoom fix is unverified on a real iPhone, like the page lock
  below.** `index.html` appends `maximum-scale=1` to the viewport meta at
  runtime on Apple touch devices only — iOS honours it for the auto-zoom on a
  focused sub-16px input (the thing the owner asked to stop, 12 Aug 26) while
  ignoring it for pinch zoom, and Android is deliberately left alone because
  Chrome there WOULD lose pinch zoom. No iOS device is reachable from this
  container; the half that is gateable — Chromium's meta stays bare — is in
  `e2e/geometry.spec.ts` ("the viewport meta"). If the owner still sees the
  zoom, the fallback is `font-size:16px` on the focused cell via a
  transform-scale trick, which nobody has built. The `place()` half of the
  same complaint (the bubble placed in layout coordinates while the keyboard
  pans the visual viewport) is belt-and-braces fixed either way —
  `histbubble.ts` reads `window.visualViewport` now.
- **The board's page lock is unverified on a real iPhone.** `body.sb-lock` is
  `overflow:hidden`, which locks the viewport by propagation from `body` (the
  root sets no overflow of its own) and was measured holding at both widths in
  the container's Chromium — that is what `e2e/geometry.spec.ts` gates. iOS
  Safari is the known exception to that technique for TOUCH scrolling; the
  usual remedy is `position:fixed` on the body, which is why the scroll
  position is already captured and put back by hand. No iPhone is reachable
  from here, so this is a caveat, not a finding. If it does bite, the hole is
  narrow: `overscroll-behavior:contain` on `.sb-main` is the other half of the
  fix and does work there, so only a drag on the top bar would still reach the
  week. Contract: `docs/ui-contracts.md` §The page behind the board does not
  scroll.
- **A USER GUIDE is wanted, for users and admins** (owner, 10 Aug 26 — "I
  eventually want u to create a user guide for this app"). Not started, and
  not urgent. The half that cannot be worked out by looking at the screen is
  already collected in `docs/remarks-vocabulary.md` — every piece of text a
  scheduler can type that turns a rule on, written in the guide's voice so it
  can be lifted straight in. **Keep that file true as rules are added**; a
  trigger that is not in it is one nobody outside the code will ever find.
  Still to gather when the guide is written: the day/AL publishing flow, the
  roles split, what each warning means in practice, and the phone gestures.
- **The AAR instructor mark leaves two known gaps** (shipped 10 Aug 26;
  rules in `docs/engine-rules.md` §AAR, and who may teach it).
  - **The crew palette does not know about it.** `slotBar` folds a pilot away
    from a front seat when he is not AAR current, and it still does that even
    where an instructor in the back would legitimise him — so the palette is
    now slightly over-strict against a legal training crew. Deliberately not
    fixed: `slotBar` is per-person-per-slot, and a pair rule there would make
    the list depend on WHICH SEAT YOU FILLED FIRST, and would refuse drops
    through `drag.ts`. The combination matrix — the closest analogue, also a
    pair rule — is warning-only for the same reason. The bar is soft (the name
    still shows, with the reason against it), so nothing is unplannable.
  - **`CHIP_LABEL.Q` still reads "Qualification — illegal seat"** while four
    codes now wear that chip (`QUAL`, `SC_QUAL`, `AAR_QUAL`, `AAR_INSTR`).
    Mildly untrue for three of them. Not fixed here because `CHIP_LABEL` is in
    `refwin.ts`'s swap list: rewording it breaks the `html.test.ts` byte
    compare and needs a matching reference patch, which is a bigger change
    than the wording is worth today.
- **Nobody is on ATT B in the demo data**, so the one type that separates
  "cannot fly" from "cannot come to work" is never exercised on screen.
  Deliberate: seeding it would put a divergence in front of the reference
  parity gate, which has no such axis. Set it by hand on the Inputs page to
  see it. Same shape as the AAR-instructor gap below.
- **Nobody holds the AAR instructor mark in the demo data.** Deliberate — the
  seed's only AAR remark is `1A: NO AAR`, so no line asks for refuelling and
  neither AAR rule fires anywhere in the week regardless. The mark is set by
  hand on the Quals page in two clicks. If the demo week ever gains a real
  AAR line, seed a few `'I'`s with it or every such line will read as a fault.
- **The late-input mark has no off switch.** `VCONF.inputLead` is a day count;
  0 ("due by the Monday itself") is the most permissive setting there is, so a
  squadron that does not run an input deadline cannot silence the mark short
  of a rule change. Deliberate, and a small change if it ever bites.
  (Downchits ARE exempt — owner, 9 Aug 26 — so the commonest genuinely
  unavoidable late input is already covered. Leave and detachments are not.)
  Rules: `docs/engine-rules.md` §The late-input mark.
- **The Inputs page opens on TODAY → TWO WEEKS, and its empty table on the
  demo data is the owner's own choice** (owner, 12 Aug 26 — "it is ok to show
  any inputs from the today's date to 2 weeks down the road by default").
  **Do not re-fix this.** It opened on today → +2 months until that morning;
  because the one dataset is the week of 13 Jul 26, a clock past that week
  opened the table EMPTY and read as "my inputs have vanished". It was changed
  to anchor to the loaded week when today fell outside it, the owner saw that
  and asked for it reverted in favour of the simpler rule: the window is
  always relative to today. So with the container clock in Aug 26 the page
  opens empty again, ON PURPOSE — a squadron running this for real has inputs
  around today, and the empty state already names the way out ("Change the
  dates, or pick 'All dates'"). Pinned both ways in `inputs.test.tsx`,
  including a test asserting the window does NOT jump to the demo week.
- **`export.ts` CLOSED the formula-injection hole on 12 Aug 26.** A cell whose
  text begins `=` `+` `-` `@` (or a tab/CR) is written with a leading
  apostrophe, which spreadsheets read as "the rest is text" and do not print —
  so a store renamed to `=1+1` still READS as the squadron typed it and no
  longer evaluates when the CSV is opened in Excel or Sheets. Quoting never
  protected against this; both engines evaluate a quoted leading `=`. The
  guard is at the DESTINATION rather than the entry field on purpose: there is
  nothing malformed about naming something `-30`, and the same escape covers
  remarks, callsigns and every other free-text column at once. `export.ts:30` also still writes stores for a
  standalone line if legacy `opts` survive there from before the
  SC/AVALON/BB gate went on both surfaces; the entry paths are closed, the
  CSV read path is not.
- **`PENDING_HOLD` in `highlights.ts` is a single overwrite slot**, now
  shared by two unrelated features — `holdPuckStill`'s scroll correction and
  the stores popup's `place()` re-anchor. No reachable path today calls
  `queueHold` twice in the same task, so nothing is lost yet, but a third
  consumer would make that true silently; the module comment flags it as a
  review question for whoever adds one.
- **Crew rest can be defeated by a typo, and this was deliberately not
  built out.** Because rest anchors on the brief, typing a B LATER than the
  real one makes a genuine breach disappear. With a `late show` remark that
  is deliberate and visible; a plain typo does it silently, and the bounded
  parse rejects nonsense values, not wrong ones. The cheap guards if it ever
  bites: show the rest margin beside the B box, or flag a B sitting more
  than some margin later than the suggestion. Neither is built. Rules:
  `docs/engine-rules.md` §validation.
- **One cross-day coupling exists, and only one.** An edit on day N that
  changes its crew rest rewrites day N−1 too. `probes/perf-port.cjs`'s
  day-isolation assertion names that exemption by hand and still fails on
  any other day.
- **Escaping the puck title is asymmetric on purpose.** Only the callsign is
  escaped inside it — `CHIP_LABEL` legitimately holds `<`/`>`, and escaping
  those breaks the byte-exact reference parity. Two unescaped sinks were
  found on 6 Aug 26; assume more is possible.
- **The 12 Aug 26 audit raised five SUSPECTS beside its twelve bugs, and the
  owner closed ALL FIVE the same day** ("fix all"). None is open; each is
  listed here with what it now does, because the reasoning is what stops a
  later session undoing one as an over-guard. Every one is pinned by tests.
  - **CLOSED — the brief-time guard rails** (owner: "u can put guard rails to
    deny such inputs"). A brief typed after its own take-off inverted the
    brief window and silently disabled that line's `NO_BRIEF` check. `txtSet`
    now refuses that value, and clears a brief the take-off is moved past;
    the engine's own "a bad time stays visible" semantics are unchanged, so
    no UI path can produce the pair any more. Rules: `docs/engine-rules.md`
    §the brief, third bullet. Tests: `audit-c-briefguard.test.ts`.
  - **CLOSED — `RMKOPEN` rides the renumbering.** The empty-remarks reveal is
    a model-index path and a ground splice under it stranded the box on a
    neighbour row. `HOOKS.remapViewKeys` now carries it through
    `shiftKeys`/`permuteKeys` with the amendment book and the edit log — the
    hook exists for key-addressed VIEW state, so a second such value wires
    into the same place rather than growing a second mechanism.
  - **CLOSED — `inpWin` fails closed like `awayAllDay`.** A record with
    neither `allday` nor `s`/`e` used to read as away to the picker and as
    nothing at all to the validator, so the palette struck a man out while
    planting him raised no warning. `inpWin` returns `[0,1439]` for such a
    record now — 1439 wide, so `timedInput` reads it as all-day, which is
    what the picker had already decided. Still unreachable from both UI entry
    paths: this is the guard for a restore, an import or a probe. Tests:
    `audit-thinwin.test.ts`.
  - **CLOSED — the bubble is re-checked on every repaint.** `histBubRecheck()`
    (`histbubble.ts`) re-anchors a live bubble or takes it down, and
    `SchedBoard.tsx` calls it after the panel diff as well as on scroll and
    resize — a repaint is the other way an anchor vanishes, and a pinned
    bubble used to go on describing a deleted row until some later scroll
    noticed.
  - **CLOSED — the dot strip declines a scrub while a puck is held.**
    `drag.ts` exports `touchDragBusy()` and `wireDayDots` asks it: a day
    change repaints the panels, detaching the node the touch-drag machine
    carries, and the drop would then resolve against the new day's markup.
    True from the moment a finger lands on a draggable, not only once the
    hold has armed, because the repaint hazard covers both windows. The
    reverse direction needs no guard — a finger landing on a puck mid-scrub
    is non-primary, which `onPointerDown` already refuses. Tests:
    `audit-gesture-bubble.test.tsx`.
- **Two reference probes fail on the port by design.** `audit2 #8` and
  `audit` item 3 pin the OLD `Fly`/OFFER rules, which the owner changed in
  Aug 26. The probes still describe the reference correctly; they no longer
  describe the port, and their replacement assertions live in
  `src/engine/validate.test.ts`. One more (`zdup`) fails identically on both
  builds — environment-bound, not a port defect. All three:
  `docs/probe-sweep.md`.

## Deploy — the traps, all still live

GitHub Pages must stay enabled (Settings → Pages → Source: GitHub Actions).
The workflow refuses to publish on any red test. The four gates also run on
every **pull request** into main, so a red PR is caught before merge; a PR
run gates only — it uploads no artifact and never deploys. Publishing stays
push-to-main.

**Checking a shipped change against the deployed page is a standing
instruction** (owner opened the network policy, 7 Aug 26) — a green workflow
is not evidence the page serves. Recipe and the three Chromium launch
settings it needs (without them every host fails as `ERR_CONNECTION_RESET`,
which looks like an outage and is not): `CLAUDE.md` §Build & verify.

- **The publish step has a ten-minute ceiling you cannot raise.**
  `actions/deploy-pages` polls until Pages serves the artifact and aborts at
  600000 ms, CANCELLING a deployment that is still reporting progress — so a
  green build publishes nothing. Passing a bigger `timeout:` does not work;
  the action clamps it and says so in the log. Pages normally takes about 8
  minutes for this repo, which leaves roughly two minutes of margin against a
  queue nobody here controls. Ruled out as causes before blaming the queue:
  the artifact is 0.15 MB over 5 files, the environment goes
  waiting→queued→in_progress in 1–3 s, and the repo sits at 2 deployments/hour
  against a soft limit of 10. If the wait becomes permanently over ten
  minutes the fix is a different publish path — a `gh-pages` branch, which
  never waits on the rollout, or another host — not a re-run and not another
  timeout value. Reasoning is in the deploy step's own comment in
  `.github/workflows/deploy.yml`.
- **Three GitHub-side faults, separate from that ceiling and from each
  other**, and one of them makes retrying pointless:
  - `Failed to resolve action download info` · `Service Unavailable` /
    `Bad Gateway` — the runner could not fetch the action definitions. It
    never reached the repo. Re-run.
  - **`Invalid actions OIDC token ... No keys from key endpoint match` — the
    trap.** It appears when you RE-RUN an old failed job: that run's identity
    token has since rotated, so re-running a stale run can NEVER succeed
    however many times it is tried. Trigger a FRESH run instead
    (`workflow_dispatch` on `deploy.yml`, ref `main`), which mints a new one.
  - **No runner assigned at all** — job cancelled after ~15 min with an empty
    `runner_name` and zero steps recorded. Pure capacity. Re-run later.
- **The Actions status API reads 10–20 minutes STALE, and that is the single
  biggest time-waster in this pipeline.** Repeatedly it reported a step "in
  progress" that had finished half an hour earlier — a gate that took 2m17s
  looked hung for 35 minutes, and the natural conclusion (something is wrong
  with my change) was wrong every time.
  **`list_workflow_jobs` is NOT a reliable way round it** — that was the
  advice here until 10 Aug 26, when a PR gate that finished at 10:36:13 was
  still being reported step-by-step as "Geometry in progress" by that very
  endpoint more than thirty minutes later. It is sometimes fresher; it is not
  dependably fresher, so do not plan around it. On that run the PR
  **check-runs** endpoint was the one that eventually told the truth.
  What DOES work, both measured: for a PUBLISH, the deployed page itself is
  the only trustworthy signal — poll `curl -sS https://seejiaokai.github.io/Raptor/`
  for the new bundle hash out of `dist/index.html` (Pages rolled over in
  90 s–3.5 min all day, nowhere near the ten-minute ceiling). For a PR GATE
  there is no page, so there is no fast signal at all: budget for the answer
  arriving up to half an hour after the job really finished, poll on a long
  interval rather than a short one, and spend the wait on something else.
  Never conclude a run is hung from that API alone, and never re-run or
  dispatch on it.
- **Two token traps.** A merge made with the **raw session token** (curl
  `PUT /pulls/{n}/merge`) produces NO push-deploy at all, while a merge
  through the **GitHub tooling** triggers one normally — so do not reflexively
  dispatch after merging; check for a push run first, or the dispatch
  supersedes a healthy run and cancels it (the concurrency group is
  `cancel-in-progress`). That mistake was made here twice, once in each
  direction. And the raw session token gets `403 Resource not accessible by
  integration` on `POST /actions/workflows/{id}/dispatches`, which returns an
  EMPTY body on success too — so a script cannot tell refusal from success and
  will cheerfully report runs it never started. Dispatch through the GitHub
  tooling, not curl.

## File map

### `raptor-port/src/engine/` — the rules engine (DOM-free)
| file | what it does |
|---|---|
| `data.ts` | The demo week: DAYS with waves/formations/aircraft, duties, sims, ground, programme rows. |
| `people.ts` | PEOPLE roster (quals, seat, categories), qual ladder (`OCU→D→C→B→A→IW→IP→IR→FI` — instructor-ness lives in CAT, no `ip` flag), `isScheduler`/`isLead`/`isInstr`/`isInstrPilot`/`isOcu`, **`isPersonnel` + the `pers:true`/`seat:'GND'` ground-crew category** (Aug 26 — seeded `torque`/`spanner`/`gizmo`, no CAT; `deriveQuals` short-circuits them), `scShiftKind`, `sanStatus`, `aarNeed`. |
| `inputs.ts` | INPUTS list + **`INPUT_META`, the one table every input type is decided by** (10 Aug 26) — `INPUT_TYPES` is derived from its keys and every predicate is a lookup: `isLeave`, `isLocalLeave`, `isDownchit` (= the medical group), **`isPersonal`/`isUnavail`** (the two day blocks, presentational only), plus `canSpare`, `canWork`, `awayAllDay`, `TYPE_GROUPS`/`typeGroup`. `isDetach` is gone with the `Detachment` type. Also DATES and the late-input block. |
| `time.ts` | `parseHM`/`hhmm`/`minus`/`overlap` (half-open — abutting windows do not clash). |
| `events.ts` | `collectEvents()` — the per-day event build the validator consumes; appends tomorrow's inputs shifted +1440 (the midnight tail, marked `nx`) and collects AVALON crew (`day.sacrew`) for the one check the wave's `noconf` does not cover. |
| `validate.ts` | `validate()`, WARN/REST/EVD, WCODE/CHIP_LABEL/RANK, `wlbl`, `chipOf`, `dashOf`, the crew-rest trace (`traceOf`/`traceLeads`/`traceIx`/`tracesOn`). **The conflict engine.** |
| `avail.ts` | `slotRules`/`slotBar` eligibility, `dayOff`/`dayEngaged`, free-count ranking. |
| `slots.ts` | The mutation funnel: `slotVal`/`setSlotVal`/`fillSlot`/`txtGet`/`txtSet`, `whoArr`/`rowCrew`/`acRef`, `rollCx`, **`acceptInput`/`unacceptInput`/`inpKey`** (Ground removal and Unavailable filing use inert amendment keys, including every loaded day of a span). |
| `keys.ts` | `keyDay`, `shiftKeys` + `shiftAircraft`/`shiftFormation`/`shiftWave` renumbering (delete-time), and its bijective sibling `permuteKeys`/`moveKeys` for a reorder. |
| `order.ts` | `groundOrder(rows, man)` — Ground Programme's render-time start-time sort, pulled out of `ui/html.ts` so `reorder.ts` can freeze a rendered order into the model without the engine importing from `ui/`. `man` (a day's `d.gman`) returns model order untouched. Also holds `DUTY_ORDER`. |
| `reorder.ts` | The board's row movers: one function per list (`moveFormation`/`moveAircraft`/`moveDutyRow`/`moveSimRow`/`moveGroundRow`/`moveProgRow`/`moveNote`) plus `applyMove`, the one entry point the UI calls — parses `mv:` addresses and resolves a flying row's two meanings (resequence vs. carry the formation) by what it was dropped on. Also every AUTO SORT: `sortWave`/`sortDutyBlock`/`sortSims`/`sortGround`/`sortProg` (rows inside one block), **`sortWaves`/`sortDutyBlocks` (the blocks themselves, by the earliest time in each — 11 Aug 26, Sort all only)**, and `sortDay`, which composes the lot inside-out. Exports `REORDERED_DI`, the stale-arm signal `state/view.ts` pops. |
| `waves.ts` | WEEKS/CURWEEK, standalone waves (SC/AVALON/BB): `isStandalone`, `makeStandalone`, `saExempt`, plus the duty desk a wave brings — `waveDutyBlock` (the block `+ Block` fills in, one shape per wave kind), `DUTY_STD`/`DUTY_PICK` (the role vocabulary) and `saDutyIx` (every block a standalone wave owns, highest index first, for the delete path). |
| `publish.ts` | SCHED, sign-offs (SIGN_ROLES), `setDayApproved`, `publishALDay`/`alIssue`/`unpublishAL`, `markEdit`, inert structural-removal/input-action amendment keys, AL colours, per-day version snapshots (`daySnap`/`daySnapOf`/`dayVersions`), `dayCurVer` (the day-head chip). |
| `restore.ts` | `dayKeys` walker + `restoreDayVersion` — ROLL a day back to a published version (it becomes live at once). |
| `rules.ts` | VCONF/SHIFT_HARD editing, `ruleParse`/`ruleFmt`, `rulesSave`/`rulesLoad`/`rulesReset`. |
| `insights.ts` | `computeInsights()` for the Insights modal. |
| `stores.ts` | The squadron's stores list — mutable `STORE_CFG`, frozen `STORE_STD`, `storeKey`, `addStore`/`delStore`/`renameStore`/`moveStore`, and `storesSave`/`storesLoad`/`storesReset` against its own `stores` key. Persisted state, so it lives here. Nothing in `validate.ts` reads a store. |
| `dutytpl.ts` | The squadron's **duty-block templates** (13 Aug 26) — mutable `DUTYTPL_CFG`, frozen `DUTYTPL_STD` (Standard / SC Shift / AVALON), `addTpl`/`delTpl`/`renameTpl`/`moveTpl` and the per-row `addTplRow`/`delTplRow`/`setTplRow`/`moveTplRow`, `blockFromTpl` (mints a PLAIN `{label,rows}` duty block — no `sa`/`noconf`), and `dutyTplSave`/`dutyTplLoad`/`dutyTplReset` against its own `dutytpl` key. Persisted state, exactly like stores; nothing in `validate.ts` reads a template. Loaded at boot in `initStore`. This is what `+ Block` offers now — waves no longer create desks (§Stable decisions). |
| `daytpl.ts` | **Whole-day master templates** (15 Aug 26) — one level up from `dutytpl.ts`: mutable `DAYTPL_CFG`, frozen EMPTY `DAYTPL_STD` (unlike `dutytpl`'s three seeded desks — a whole day is too squadron-specific to guess at), `tplFromDay`/`addDayTpl`/`delDayTpl`/`renameDayTpl`/`moveDayTpl`, `applyDayTpl` (refuses a published day; direct-write shape mirroring `restoreDayVersion`, retiring the day's pending/added marks), `dayTplSave`/`dayTplLoad`/`dayTplReset` against its own `daytpl` key. A template's `d` blob (`DayTplBlob`) allowlists the day's STRUCTURE only — `notes`/`allhands`/`waves`/`sims`/`dutywaves`/`ground` + section notes, never `dow`/`dt`/`today`/`wc` — with every person reference blanked and every `cx`/`cxr`/`flag` mark stripped. Loaded at boot in `initStore`. Rules: `docs/engine-rules.md` §Day templates. |
| `drafts.ts` | **Per-day alternate drafts** (15 Aug 26) — state rides `SCHED.drafts`/`SCHED.curDraft` (`publish.ts`) rather than a module of its own, so it serialises with undo like the AL records. `dayDrafts`/`curDraftId`, `draftDup`/`draftSelect` (the live `DAYS[di]` IS the selected draft's working copy, and switching stows the outgoing entry first), `draftRename`/`draftDelete` (refuses the selected entry), `isDraftVer`/`draftVerLabel` — the `'d:<id>'` version-string shape `publish.ts`'s `daySnapOf` resolves for a draft preview, and **`rebaseDayPending`** (15 Aug 26 — both dup and switch WORK on a published day now; a switch there re-marks the day's whole pending set as the `dayKeys` diff against the issued snapshot, which is what retired the old "Reopen the day first" refusal — `applyDayTpl` keeps its own). Publishing needed no change: `setDayApproved` publishes whatever is live. Session-only, like the AL list. Rules: `docs/engine-rules.md` §Drafts. |
| `hooks.ts` | HOOKS — injectable callbacks (toast, repaints, histPush, storage, `closeBoardDialogs`, **`remapViewKeys`** — key-addressed VIEW state riding `keys.ts`'s renumbering, RMKOPEN today) so verbatim bodies stay DOM-free headless; `storeBackend` is the injected localStorage (`main.tsx` plugs the real one in, null headless). |
| `editlog.ts` | The EDIT LOG (11 Aug 26) — `ELOG` (a 400-row ring buffer of `{t,who,di,key,lbl,from,to}`), `logEdit`/`logAction`, `elogRows`/`elogFor`/`elogWhen`/`elogClear`, and `keyLabel`, which turns a slot key into plain words. Written from `noteChange`/`markEdit` and only when both values are handed over. Session-only, and deliberately NOT in `histSnap()`. Rules: `docs/engine-rules.md` §The edit log. |
| `index.ts` | The barrel — re-exports every module above. UI and probes import from `../engine`, so a new engine file wants a line here. |

### `raptor-port/src/state/` — the store
| file | what it does |
|---|---|
| `store.ts` | `notify()`/subscribe/version plus the narrow `notifyBoard()`/`subscribeBoard()` lane used by day-only board navigation, so a swipe does not wake the seven-day edit week; `wireStore()` maps HOOKS→global notify (including the role-aware `editMode()`); **`resetSession()` — the ONE session-change path, used by every login and logout**; write helpers; `initStore()` boot (wires, **rulesLoad**, validate, history baseline). |
| `demoseed.ts` | **Demo-only SANS Availability seed** (14 Aug 26) — `seedDemoSans()` pushes six records straight into `INPUTS`, called from `initStore()` at BOOT, deliberately NOT part of `engine/inputs.ts`'s seed array: every parity gate and the ~40 snapshot-reset tests read `INPUTS` pristine (none call `initStore()`), so they stay blind to these rows by construction while a real built app still sees them. Idempotent (guarded per person+date, `stores-boot.test.ts` boots twice). Rules: `docs/engine-rules.md` §SANS Availability. |
| `view.ts` | UI state the engine reads: CURPAGE, SBDAY, ROSDAY, ARM, selection (SELID/WFOCUS/PFOCUS/DWOPEN/HLSET/SEARCH — clicking a puck lights every copy of that person), `afterSchedMutate()`, `focusWarn`, `setPage` (which sweeps body-level popups, closes the board, and captures the day being left), setters. Also `DPREV`/`prunePreviews` (the edit surfaces' version previews) and **`VWORK`/`toggleViewWork`** (15 Aug 26 — which PUBLISHED days the VIEW page is showing the live working copy for instead of its frozen issued default; deliberately NOT DPREV, so the two pages' choices can never cross — `docs/ui-contracts.md`). Also `CARRYDAY`/`weekLeftDay`/`scrollWeekToDay` — the day carried between View-only and Edit Schedule; the two geometry helpers live here, not in `ui/pan.ts`, because `pan.ts` already imports this module and `setPage` is the one moment the outgoing week still has layout. Contract: `docs/ui-contracts.md` §The day carries across a page switch. |
| `history.ts` | HIST snapshots, `histPush`/`histApply`, undo/redo bodies. |
| `auth.ts` | SESSION, `setSession` (resets LGEDIT, the Logic tab's own edit mode), `canEditSched`, ME/`setMe`. |
| `users.ts` | The Manage-users prototype list. |

### `raptor-port/src/ui/` — components and builders
| file | what it does |
|---|---|
| `App.tsx` | Login vs Shell + board overlay (the board is a SIBLING of the shell so logout unmounts it). |
| `Shell.tsx` | Topbar, nav, both schedule pages' chrome, global listeners (click/change/contextmenu/focusout/keydown, drag, pan), banner, memoized sections. |
| `ViewWeek.tsx` / `EditWeek.tsx` | The week surfaces: build `dayHTML` per day, diff strings, swap only changed days, hold scroll; `EditRoster` palette. CURPAGE-gated. |
| `SchedBoard.tsx` | The full-screen day board: panels with per-panel string diff; subscribes to both the global store and the board-only view lane; CxDialog (cancel-with-reason) and the Sort-all confirm, both wired to `HOOKS.closeBoardDialogs`. |
| `board.ts` | Board HTML assembly + delegated handlers: line/wave and duty/sim/ground row add/delete (with key renumbering), the ▲/▼ nudge handler, per-section and whole-day sorts, CX flow, red-box flag, `waveMenu`, `openScheduler`/`closeScheduler`. `boardHTML` now renders the in-time block, per-formation area strip and Traffic button (14 Aug 26 — week-only before); `boardSignHTML` is the sign-off as its own `#sbSign` element (so the checks bar can sit below it); `boardWarnHTML` reads the "N issues · N warning" severity-coloured bar. Also `boardDayStep`, the day arrows' one call (12 Aug 26 — the swipe and its whole carousel are deleted; do not rebuild them, the tombstone comment in this file says why). |
| `rowdrag.ts` | The board row-reorder pointer machine — its own small machine, deliberately not `drag.ts` (which stays scoped to pucks): pointer events so a finger works, releases implicit pointer capture on the way down, writes the lifted row and the drop bar straight onto the DOM, delegated on the board wrap so it survives every panel repaint. |
| `html.ts` | THE builder library: `dayHTML`, `puck`, `slotCell`, `signoffHTML`, day warnings, day-info panel, legend, cx/flag tags, and the derived `areaText`/`atimeText`. |
| `board-html.ts` / `palette-html.ts` / `logic-html.ts` | Board panels (inputs bands, notes, programme, duties, sim rows, ground, personal-inputs group, sim notes), the aircrew palette, the Logic tab's rule text. |
| `interactions.ts` | `routeClick` — the delegated click router: select/arm/plant (a puck's flag chip falls through to selection — the chip is the puck), publish/AL/sign-clear, day-info, warning boxes, the board's issue list (via `jumpToWarn`), week chips, stores remove + the config picker (`openStoresMenu`). |
| `drag.ts` | Mouse HTML5 DnD + the touch pointer machine; `applyDrop()` is the single drop path (role AND mode checked); `barDrop` qualification warning. |
| `pan.ts` | Week arrows (`panDays`), proxy scrollbar (`hsSet`/`hsSync`, echo-guarded), shift+wheel, palette day-follow, phone day dots. |
| `textedit.ts` | Inline text editing: Enter commits / Escape restores, heal-in-place, deferred commit, `editingText()`, plus the four fields outside the `data-txt` grammar. |
| `highlights.ts` | Post-render decoration: selection/search/warning-focus classes on every puck (the week AND the board's `.sb-boardwrap`, never the palettes or a `.pv-frozen` preview), `paintArm`, and `scrollToWarnFocus` — surface-aware, snap-safe, lateral-holding (it pans sideways only when the target is off screen), picking the puck whose row holds the most of the warning's crew, and honouring `WFOCUS.panDi`/`panKey` where the focus and the destination are different days (the cross-day crew-rest row, and only it). |
| `histbubble.ts` | The History bubble — one body-level element, delegated on the board wrap in the CAPTURE phase (the board's arm handler stops propagation, and a phone tap must still arm). `pointer-events:none` is load-bearing, not styling. Re-anchors on scroll rather than hiding; parks the cell's own `title` while it is up. |
| `HistoryModal.tsx` | The changes list — every edit newest first, whole week with a filter for the open day, opened from the checks panel's `[data-histopen]` line. String-built body in the ordinary `.modal` idiom. |
| `Modals.tsx` | DayPop (read-only day details), Insights, Manage-users, Airspace/traffic popup. |
| `DutyTplModal.tsx` | The **duty-template editor** (13 Aug 26) — opened from the `+ Block` picker's pencil (`TPLEDIT` in `pops.ts`). Tabs per template + New, an editable title, rows with role (a `DUTY_PICK` datalist) / start / end / ▲▼ reorder / delete, + Add role, and Reset / Delete / Done. Mirrors `UserModal`; drives `engine/dutytpl.ts` and persists on every edit. |
| `DayTplModal.tsx` | The **day-template library editor** (15 Aug 26) — opened from the Templates picker's pencil, on either surface (`DAYTPLEDIT` in `pops.ts`, a `false\|true\|string` open-pre-selected flag). Tabs per template, an editable title, a read-only structure summary; deliberately no row editor (a day template's content is edited on the board/week themselves, which already own that surface) and no "+ New" (a template is always recaptured off a real day, never started blank). Reset / Delete / Done, all toasting. |
| `DraftsModal.tsx` | The **drafts manager** (15 Aug 26) — opened from the Drafts picker's pencils (`DRAFTSEDIT` in `pops.ts`, carrying the day since drafts are per-day), scoped to the one day whose menu opened it. Tabs per draft (selected one marked ●), a name field that commits on blur/Enter (`draftRename` refuses empty/duplicate names, and refusing mid-keystroke would fight the typist), Select (make it live) / Delete (disabled on the selected entry, with a title saying why) / Done. |
| `InputsPage.tsx` / `QualsPage.tsx` / `LogicPage.tsx` | The three secondary pages (inputs CRUD + CSV, quals grid, rules doc + admin editing). The Inputs table carries a date window and heading sort, so **its DOM row order is not `INPUTS` order** — address a row by the model index its buttons carry (`data-edit`/`data-inx`/`data-save`), never by position. Contract: `docs/ui-contracts.md` §The Inputs table's view state. |
| `inputedit.tsx` | Editing ONE personal input, shared by the Inputs page, the week and the board: the AM/PM halves (`HALF_AM`/`HALF_PM`), the span picker, the draft shape, `commitInputEdit` (including the accepted-row relink), `removeInput`, `setInpField` (one cell typed in place, and the clear-a-time-means-all-day rule) and `InputEditor` itself. Three editors over one list is how they drift apart. |
| `RangeCal.tsx` | The Inputs date picker: ONE calendar taking a range in two clicks, Monday-first grid, `yyyy-mm-dd` strings so the add/edit paths are unchanged. Used by the add form and by the table's `#inRangeBtn` window. |
| `ALPanel.tsx` / `Drawer.tsx` / `Login.tsx` | Amendment panel, phone drawer, login. |
| `pops.ts` / `toast.ts` / `useStore.ts` / `export.ts` | Popup flags, the toast, the store hook, CSV export — `csvText` (UTF-8 BOM, so Excel stops mojibaking the en dash), `exportCSV` and `schedRows`. The ONE exporter: schedule, inputs and LoX all call it. |
| `scheduler.css` | The ported stylesheet — it carries MEASURED contracts, not preferences. |
| `../probe-bridge.ts` | Window bridge for the browser probes. It deliberately mirrors the WHOLE engine API, not just what a probe uses today — keep it in sync when adding engine API. |

### Tooling
| file | what it does |
|---|---|
| `probes/run.cjs` | Runs any reference probe against the reference build or the port. |
| `probes/perf-port.cjs` | The perf gate (`npm run perf`) — measures BOTH builds at once, round for round. Asserts a DOM ceiling per surface plus two behavioural checks; PRINTS the per-node timings without asserting them (10 Aug 26 — see §The gates, and how they lie). |
| `probes/adapted/` | Six probes re-expressed for this build (`wrap` `drop` `aar` `audit` `sa` `sc2`); `run-all.cjs` runs the set as `npm run probes:adapted`. |
| `src/testing/refwin.ts` | Boots the reference in jsdom for the parity tests; pushes the port's seed INPUTS into it and patches the in-memory reference for every deliberate divergence (`retier`, `remap`, `resim`, `rematrix`, `reinput`, `redn`, `relead`, `rebrief`, `rering`, `reduty`) so both engines compute from identical data. Each patch is explained beside the rule it serves in `docs/engine-rules.md`. NOT a test file. |
| `docs/probe-sweep.md` | The full probe → reference → port results table, and the performance gate's reasoning. |
| `docs/feature-impact.md` | The surfaces any change can touch (warnings, layout, history, board, edit/view-only, desktop/mobile, quals, availability, publishing, export, roles), the generic FLOWS one edit travels, and the drift-seams where two copies of a rule fall out of step (owner, 12 Aug 26). Walk every non-trivial change against it, and keep it true in the same PR. |
| `docs/remarks-vocabulary.md` | Every piece of text a scheduler can TYPE that turns a rule on — the seat tags, AAR, late show, IRT, the sim brief lead — plus the things that look like text triggers and are not. Written in a user guide's voice, for the guide the owner wants (10 Aug 26). A new text trigger belongs here as well as in `engine-rules.md`. |
| `docs/session-state.md` | The last session's leftovers — **often absent, and absent is meaningful**: it exists only while something is genuinely pending, and the session that clears the last item deletes it. This file holds the durable state; that one holds what a session could not finish. Written by `.claude/skills/session-handoff`. |
| `docs/superpowers/specs/` + `plans/` | Design specs and task-by-task plans from brainstormed features (the vendored superpowers flow). Historical records of WHY a shipped shape was chosen — the living contracts stay in `engine-rules.md` / `ui-contracts.md`. |
| `PORTING.md` | **Historical** — the phase plan the port was built from. Nothing left to run; kept only because `probe-sweep.md` and `perf-port.cjs` cite its decisions (dropped probes, original timing budgets). |
| `reference/` | The original single-file app + its 728-assertion suite. **Read-only** — the spec for existing behaviour, and one of the four gates. |
| `index.html` + `public/favicon.svg` | The Vite entry page and the **only** thing in `public/`. The favicon is the talon from `Login.tsx`/`Shell.tsx`, copied because a browser fetches it standalone before any bundle runs — edit the claw path in all three or the tab and the page disagree. It differs from the components on purpose: a tile and a same-colour stroke, because a tab paints it at 16px where bare thin claws vanish. `href="/favicon.svg"` in the page is rewritten to `./favicon.svg` by `base:'./'`, which is what makes it resolve under the Pages sub-path. |
| `e2e/` | The geometry gate (`npm run test:e2e`): `geometry.spec.ts` measures the layout contracts in a real browser — including where a warning click leaves the week and the board, and where it deliberately does NOT — and `app.ts` holds login/nav/scroll-settle helpers (`settle` takes an axis, `settleBoth` waits for both) plus `clickHere`, a click that does not scroll the target into view first (`page.click` does, which would defeat any test that parks the week on purpose). `playwright.config.ts` builds and serves the port itself. |
| `.github/workflows/deploy.yml` | Test-gated GitHub Pages deploy on push to main; four gates, geometry included. The same gates run on PRs into main, in a per-PR concurrency group so a PR run cannot cancel a live deploy. |
| `src/ui/histlist.test.tsx` | The changes list's second pass (11 Aug 26) — the two entry points, a row jumping to its detail with the bubble pinned open, the grouped-by-detail view, and the phone's tap-to-expand control. The media-query split is in `e2e/geometry.spec.ts`, which is the only place it resolves (the day-carousel motion tests that used to sit beside it went with the swipe, 12 Aug 26). |
| `src/ui/boardrmk.test.tsx` | The empty remarks box and the `+` that reveals it (12 Aug 26) — which input carries `.empty`, that the reveal clears it for its OWN row only and focuses it, that typing one drops it unaided, and that asking for the box back writes NOTHING to the edit log or the pending set. jsdom cannot measure the 109px→79px row it buys; `e2e/geometry.spec.ts` does that. |
| `src/**/audit-*.test.ts(x)` | Three sweeps of 12 Aug 26, all keepers — they are the regression armour for corners nothing else tests. **The adversarial audit** over PRs 148–174, six agents (a=History/edit log, b=board nav, c=validation, d=sort/reorder, e=inputs): closed every gap this file listed and pinned twelve fixes (log keys remapped with the key space, day-aware accept deferral, `deletionWasIssued` under reorder, the relink's preserved extras and covered-day re-file, the scrub/handle button guards, the day-step commit, the carry-day fix, the numeric time sort). **The five suspects** it raised and the owner then closed: `audit-c-briefguard` (brief vs take-off, both directions), `audit-thinwin` (`inpWin` failing closed), `audit-gesture-bubble` (repaint re-check, drag-vs-scrub). **The guard-rail sweep**: `audit-guards` (`hmOK`, `minus`, the time cells, store renames, the rules load path) and `audit-guards-inputs` (input times, spans, the derived AM/PM label, and what stays allowed because it is a decision). |
| `src/ui/selrings.test.tsx` | The green eligibility rings (13 Aug 26) — the DOM agrees with `slotBar` on EVERY edit-week slot (the mirror test that keeps the rings from ever becoming a second copy of the rule), a mutation re-rings on the next paint (WARN-identity invalidation), rings clear with the selection, view-only and a selected placeholder never ring. The paints themselves (bright/dim/armed distinct, zero layout shift) are in `e2e/geometry.spec.ts`, because jsdom measures every rect 0×0. |
| `src/engine/personnel.test.ts` | The ground-crew category (Aug 26) — that a personnel derives empty quals and the boot grants nothing, `slotBar` bars a front seat and allows rear/duty/ground, and validate raises `QUAL` in a front seat, the `PAX_CREW`/`CP` advisory in a rear seat, and `DOUBLE_BOOK`/`LONGDAY`/`DAYS_RUN` while crew rest, turns, the matrix, AAR and the brief/debrief windows stay OFF. Plus the parity guards (`PAX_CREW` has a WCODE, and fires nowhere on the seed). |
| `src/engine/sansavail.test.ts` | SANS Availability (14 Aug 26; rewritten for the one-window rework the same day) — `sansGate`'s five statuses against the flags + standard-window shape, one window serving every ticked event, the AM/PM presets; `sansWindow`/`sansLetters`/`sansBadge`; `slotBar`'s grey-out on a flying/OFT/AMT seat and the duty/ground carve-out; the `SANS_AVAIL` advisory (fires on not-offered/window, silent on no-record); the LEAK GUARD (a timed offer never reads as a timed absence — `isAway`, `day.input`, no hard clash); the parity-guard pair. |
| `src/ui/sanscards.test.tsx` | The SANS card grid (14 Aug 26) — the shared builder renders the same cards on the week group and the board panel, the order (bounded windows by start, then the fixed F/O/A→…→A combo order), a card's `data-inpedit` address matching `inpKey`, read-only cards carrying none, the board's empty state, the view-only week rendering nothing. |
| `src/ui/editlog-writers.test.tsx` | The write paths the edit log used to miss (11 Aug 26) — the six fields that assign to the model themselves and call `markEdit` by hand, and the three whole actions that reach it with no key. Drives the real gestures on purpose: the bug was in what the callers passed, so a test calling `markEdit` with two values by hand would have passed throughout. Also pins that deletions carry what they held (12 Aug 26) — a note's words with the 60-char clip, a duty row's role and man, a line's callsign and crew — through the real delete buttons. |
| `src/ui/boardnav.test.tsx` | The phone board's one-row top bar and how a day is reached (renamed from `boardswipe.test.tsx`, 12 Aug 26, when the swipe was replaced by two arrows) — the arrows step and stop disabled at both ends, the marked dot follows, the dots still scrub, the parked aircrew handle still forwards its vertical drag without opening the drawer, and a sideways drag across the board does NOTHING, which is the removal itself. It also pins the SPLIT day name (12 Aug 26 — `Wed` + a hidden `nesday`, so the phone stops ellipsing the date off the bar); jsdom can only see that shape, so the two halves that MEASURE it are in `e2e/geometry.spec.ts`. `boardbackground.test.tsx` proves `boardTab` fires the board lane once and the global lane zero times. Geometry and the production-browser stress live in `e2e/geometry.spec.ts`, because jsdom measures every rect as 0. |
| `src/state/demosans.test.ts` | The demo SANS seed (14 Aug 26) — shape, idempotency (`initStore()` boots twice against the same `INPUTS` array), the zero-`SANS_AVAIL`-warning proof against every seed record's own padded commitment, and the rendered card grid. |
| `src/ui/unavailedit.test.tsx` | Unavailable rows fully editable from the schedule (14 Aug 26, 16 tests) — the shared dialog's Person select (`canEditSched` only), the `iu:<iid>` arm-then-tap and drag-to-reassign paths on the week and the board, `reassignInput`'s relink on `commitInputEdit`, `rosterOptions` shared by all three editors, plus the Inputs-page sort-tie regression guards the same audit found (the stable-sort no-op on a second heading click, the `s`/`e` minute-0 `??` fix). |
| `src/engine/daytpl.test.ts` | Whole-day master templates' engine half (15 Aug 26, 20 tests) — the allowlist blob, crew-blanking and cx/flag/src stripping, `applyDayTpl`'s refuse-on-published and its direct-write/pending-added-retirement shape, persistence and untrusted-load field-by-field sanitising. |
| `src/ui/daytplui.test.tsx` | Day templates' UI half (15 Aug 26, 15 tests) — the `dayTplMenu` picker reached from both the board's button and the week's sign-off strip, `DayTplModal.tsx`'s tabs/rename/delete/reset, and the published-day "Reopen the day first" refusal toast. |
| `src/engine/drafts.test.ts` | Per-day drafts' engine half (15 Aug 26, 16 tests) — the stow model (`draftDup`/`draftSelect`, the live day IS the selected draft), the refusal rules (published day, already-selected id, the selected entry on delete, empty/duplicate names on rename), and the `'d:<id>'` shape `daySnapOf` resolves. |
| `src/ui/draftsui.test.tsx` | Drafts' UI half (15 Aug 26, 18 tests) — the `draftsMenu` picker on both surfaces, `DraftsModal.tsx`'s blur/Enter-commit rename and delete/select gating, and the view-only week's drafts-only picker (rendered only when a day has drafts; AL/ORIG previews never reach it). |
| `.claude/skills/session-handoff/SKILL.md` | The `/session-handoff` skill — decides whether `docs/session-state.md` is warranted, writes or deletes it, and checks this file was kept true against the session's own diff. Repo-level, so it ships with the clone the next session gets. |
| `.claude/skills/` (14 more) | `obra/superpowers` v6.2.0, MIT, vendored 7 Aug 26 — a plugin install lives in `~/.claude/plugins` on a local machine and never reaches a web session's fresh container, while repo-level skills ship with the clone. Cross-references de-namespaced; the upstream SessionStart hook is vendored at `.claude/hooks/` but **not** wired in. Provenance and the update recipe: `.claude/skills/SUPERPOWERS-VENDORED.md`. |
