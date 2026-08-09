# RAPTOR — project state

Companion to `raptor-port/CLAUDE.md` (the index and working rules) and
`raptor-port/docs/` (engine rules, UI contracts). This file holds what
those two don't: **what is still open**, and **where each file lives**.

The port from the original single-file app is complete; that history is in
`git log`. This is the live application now, under active development.

**Every gate is green at this commit**, run first-hand: `npm test` 819 tests
across 47 files, `node reference/tfin.js` 728/0, `npm run build` clean, `npm
run test:e2e` 50/50, and `npm run probes:adapted` 6/6 (not in CI). Re-state
these only after re-running them.
**`npm run perf` is the one gate that does NOT read the same way twice, and
it is not a fault in the code.** It is 7 assertions now, not 9 — the
Edit-mode toggle's own two went with the toggle, 9 Aug 26 — and six of the
seven are solidly green every run. The seventh, the one-day-edit per-node
budget, straddles its own 1.15 line on this container: nine readings of THIS
commit ranged 1.08×–1.23×, so it returns 7/0 on some runs and 6/1 on others.
The unchanged parent commit behaves the same way, and a paired
measurement (below) found no difference between them. The budget was
deliberately NOT raised to make it quiet — a budget loosened to cover
estimator noise stops catching a real regression.
**`probes:adapted` and `perf` do NOT serve themselves** — start
`npx vite preview --port 4173` first or both fail with
`ERR_CONNECTION_REFUSED`, which reads like a code fault and is not
(8 Aug 26). Playwright's own gate builds and serves itself.
**And that cuts the other way, which cost real time on 9 Aug 26: if a
preview is ALREADY running on 4173, `npm run test:e2e` reuses it and never
rebuilds** (`reuseExistingServer` in `playwright.config.ts`, off in CI only)
— so e2e silently measures whatever was built last, not your working tree. A
CSS change was proven "still passing" against a stale bundle that way, and a
deliberately-broken control case passed too, which is how it was caught.
**Kill the preview before trusting an e2e run after editing CSS or markup**,
or run the two in the other order: e2e first, then start the preview for the
probes.
(`npm run perf`'s one-day-edit budget was seen swinging 1.01×–1.28× across
runs on identical code on a busy container, 7 Aug 26 — rerun before
believing a single red. Re-measured 9 Aug 26 and the advice is now sharper.
Nine readings of ONE commit ranged 1.08×–1.23× per node against a 1.15
budget — it straddles the budget on this container, so a single red proves
nothing either way. **The only measurement that settles it is a PAIRED
one**: build the parent commit into a second directory, serve it on a second
port, and run `PORT_URL=… npm run perf` alternately against both in the same
window. Done that way, three alternating rounds gave per-node differences of
+0.07, −0.05 and +0.01 — i.e. none. Unpaired runs minutes apart are not
comparable here; the reference's own timing drifts as much as the port's.
`noop` is the useful cross-check while diagnosing: it repaints the same week
WITHOUT the edit, so a real week-render regression moves it too — it sat at
0.56×–0.57× per node throughout, on both builds.)

## Known issues / open work

- **DONE (9 Aug 26) — the Edit-mode toggle is gone.** The owner's reasoning:
  the board is reachable only as admin → Edit Schedule → board, so intent to
  edit is implied by being there at all, and **View-only Sched already IS the
  read-only mode** — the toggle was a second mechanism for the same job, and
  most of the read-only-board defects fixed on the reorder branch (a live
  board accepting typing, adds and deletes; a right-click that cleared a week
  puck; controls that looked live and did nothing) existed ONLY because that
  state could be entered at all. Removing it deletes the class rather than
  guarding it. Cost flagged and accepted before the build: the toggle doubled
  as an accidental-edit guard on a phone; View-only Sched covers that one tap
  away. Recorded in `CLAUDE.md` §Stable decisions so it is not re-proposed.
  `HOOKS.editMode()` is now `canEditSched() && CURPAGE==='editsched'`,
  `EDITON`/`setEditOn` are deleted from `state/view.ts`, `.editing` rides
  unconditionally with the edit page, and `Shell.tsx` lost `#editToggle` and
  its `Editing` label. Parity was never at risk — the toggle was Shell chrome,
  not part of the string-built day markup `parity.test.ts` compares, and the
  suite confirmed it.
  **What this changes for the next reader, and it is the one thing worth
  knowing:** a rendered read-only BOARD is now reachable only two ways — a
  published-version preview (`pv`), or a session that may not edit one (the
  role gate). Every read-only render path (`stoRO`/`mvRO`/`ro`, `sbGrip`'s
  `.ro` track, `applyDrop`'s mode check) is still live defence for exactly
  those two, and is still tested — but every test that used to reach that
  state by switching the toggle off was rewritten to reach it by role
  instead (`board.test.tsx`, `board-stores.test.tsx`, `e2e/geometry.spec.ts`),
  and one that became a pure duplicate of its neighbour was deleted.
  **One coverage claim was retired honestly rather than faked.** Round 3 of
  the ship review added a test for the ONE state only `Shell.tsx`'s
  `HOOKS.editMode()` line protected — a board open on Edit Schedule with the
  toggle off. That state no longer exists: `setPage` clears `SBDAY` on every
  exit from Edit Schedule, so `SBDAY != null` now IMPLIES
  `CURPAGE === 'editsched'`, which makes the old
  `HOOKS.editMode() || SBDAY != null` and plain `HOOKS.editMode()` provably
  equivalent for an admin. No test can distinguish them any more; don't write
  one that pretends to. The test was rewritten to pin the behaviour that IS
  still distinguishable (a session that may not edit cannot right-click-clear
  a seat, board open or not), and the page half of the gate — what breaks if
  the `editMode()` line is deleted outright — is pinned by
  `editweek.test.tsx`'s tfin #17, which now leaves Edit Schedule instead of
  flipping a switch.
  **`npm run perf` lost its block F** ("the Edit-mode toggle holds its
  place", two assertions), so the gate is 7/0, not 9/0. It measured the
  week's scroll across a whole-week repaint; nothing replaced it, because no
  other control repaints all seven days in one gesture. D still measures the
  same scroll-hold across an edit, which is the mechanism the budget
  protects. `e2e/geometry.spec.ts`'s scroll test lost its toggle half for the
  same reason.
  **A small dead-code sweep rode along, since the ask was to de-clutter.**
  `state/view.ts`'s `dayPreview()` accessor had no callers anywhere (the
  `DPREV` map is read directly); the reference's edit-footer rules
  (`.schedfoot`, `.sf-box`, `.sf-h`, `.sf-body`) and `.sb-hint` were deleted
  from `scheduler.css` — hand-written static markup in the original that this
  port never builds, verified absent from the BUILT bundle and not just the
  source. Stylesheet 100.8 KB → 100.1 KB. `.asub` is dead in two selector
  lists and was left — it sits inside rules that do other work.
  **The `.sbi-rmk` typo was raised as the owner's call and then closed by him
  the same day, and the ANSWER is the interesting part.** The wrap rule
  (`overflow-wrap:anywhere`) listed `.sbi-rmk` while the board's inputs-band
  remarks cell emits `.sbi-rm` — a typo carried over verbatim from the
  original page, so the rule matched nothing on either build for the whole
  life of both. Correcting the spelling was MEASURED before it was applied,
  and it does nothing: `.sbi-row .sbi-rm` is deliberately
  `white-space:nowrap` + `text-overflow:ellipsis`, which leaves no soft wrap
  opportunity for the property to act on. With an 80-character unbreakable
  remark, at 1500px and at 390px, the cell's width, height and scrollWidth
  and its row's width were identical with the property applied and without
  it. So the fix was to DELETE the dead name, not to correct it — shipping a
  rule that provably does nothing is the same clutter in a new disguise.
  That cell is a one-line truncated summary whose full text lives in its
  `title` tooltip, which is the design, not an accident. Pinned by "a long
  unbreakable remark stays one clipped line" in `e2e/geometry.spec.ts` — the
  test fails if the nowrap is ever lost or the property re-added — so this
  does not get re-argued from the stylesheet alone.
- **No shared data.** localStorage only — two devices never see each
  other's edits. The obvious next enhancement (needs a server or a sync
  backend; touches `engine/hooks.ts:storeBackend` and the mutation funnel).
- **Prototype auth.** Hard-coded accounts; the deployed site is public.
  Manage-users edits the in-memory list only. Real accounts = server work.
  **A member is no longer view-only (owner, 5 Aug 26):** they add, edit and
  delete their own Inputs, and they use `Enable editing` on Quals to tick the
  qualifications they hold. Still admin: accepting an input into the issued
  programme, `Add person`, `Edit quals`, the whole Edit Schedule page and the
  Logic editing. Table: `docs/engine-rules.md` §Auth / roles.
  **The role split is now enforced on the page, not just the nav (bug sweep,
  6 Aug 26).** `setSession` never cleared `CURPAGE`, so an admin who logged out
  of the Edit Schedule page handed the next member session a live editable page
  — the nav link was hidden, the page was not, and `HOOKS.editMode()` carried no
  role test, so the pucks came out `draggable` and the text fields
  `contenteditable`. `drag.ts` and `textedit.ts` had no role check at all. Three
  layers now: `editMode()` requires `canEditSched()`, one `resetSession()` in
  `state/store.ts` is the ONLY session-change path (every login and logout
  routes through it, clearing page, board day, selection, focus, highlights and
  previews), and `applyDrop`/`routeFocusOut` refuse to write for a non-admin.
  Pinned by `src/state/session.test.ts`.
- **One dataset.** The schedule is the demo week (Mon 13 – Sun 19 Jul 26, a
  full Monday-to-Sunday week; the weekend is non-flying, duty crew only). Week chips
  re-label but every week shows the same data (the original behaved the
  same way). "Throw pucks (auto)" is a stub, as in the original.
- **jsdom still cannot measure layout, but the geometry contracts are gated
  now.** `e2e/geometry.spec.ts` (`npm run test:e2e`) measures them in a real
  browser against a preview of the production build — puck exactly 74×15,
  free text wrapping rather than overflowing, one day box per pan click, the
  proxy scrollbar, scroll held across an edit, a programme hole rendering no
  element, descender ink inside the puck, and the warning-jump paths on every
  surface (both weeks, day-detail, the board small and large, a warning
  landing on its anchored line, and the lateral view held when the puck is
  already on screen), the three crew-rest strokes really rendering as three
  and the cross-day row sitting in the list at its neighbours' geometry,
  selection styling (blue fill only, warn ring surviving, the half-strength
  dim — the flag-chip test became this when the chip stopped navigating,
  7 Aug 26), a cut callsign fading rather than clipping, and the board's duty
  rows keeping a readable ITEM column on a phone, and the stores work of
  7–8 Aug 26 (the popup tracking its live `C` button across a multi-toggle
  visit, a rename not eating the next click, the board line staying
  single-row and nine grid items in `.sb-wide` at phone width, the
  popup opening against the BOARD's button rather than the week's, the
  popup centring inside the visual viewport under a pinch zoom, the
  board's crew cells stacking pucks in pairs on a phone, the phone
  board's one-window layout — warnings strip on top, AIRCREW drawer
  parked/sliding/arm-opened — and the board line's seats clear of every
  input plus a deleted pax's hole holding its place, 8 Aug 26) —
  seventeen contract families over 40 tests. It
  builds and serves itself, and it is the **fourth CI gate** in `deploy.yml`.
  Vitest still cannot see any of this: every rect it reports is 0×0. Wider
  visual work still wants the probe path (`npx vite preview --port 4173` +
  `probes/`).
- **The probe sweep has no leftovers** (`docs/probe-sweep.md`). The four that
  used to stop partway — `aar`, `audit`, `sa`, `sc2` — now run end to end as
  `probes/adapted/*-async.cjs`, six adapted files in all, run together by
  `npm run probes:adapted` and each exiting non-zero on a failed assertion.
  The set is green at this commit (6/6). Two of them assert MORE than their
  originals did: `aar`'s ladder check was vacuous on the reference (it never
  enabled qtbl editing, so every click was
  swallowed), and `sa`'s "no new warnings" step failed on the reference too,
  because its blind seat-stuffing eventually put a downchit man on an SC
  SPARE. One probe (`zdup`) still fails identically on both builds —
  environment-bound, not a port defect.
- **Clicking a warning jumps to the puck (owner, 5 Aug 26; the chip since
  UNIFIED away, 7 Aug 26 — see the chip-is-the-puck entry below).** The three
  LIST surfaces navigate: the week's issue rows, the day-detail panel and the
  board's `Live checks` list (which was completely inert — no attributes,
  no handler). The flag chip navigated from 5–7 Aug and now selects the person
  like the puck it sits on. Warning focus now lights board pucks
  too, not just the week's. Two defects on the old path went with it: a stale
  row scrolled to the *previously* focused warning, and `hsSync` was a dead
  `undefined` stub in `highlights.ts` so the proxy scrollbar never re-synced.
  A third went with it since (owner, 5 Aug 26): switching the **board's day
  tab** used to leave `WFOCUS` pointed at the day just left, so `warnOnBoard()`
  went false and the lit pucks and selected issue row vanished while the app
  still held a focus nothing on screen could clear — `setBoardDay` now drops
  it under those conditions, keeping it when the tab lands on the focused
  day itself and leaving a week-set focus alone when the board merely opens.
  `e2e/geometry.spec.ts` now also covers the edit week's far-day jump on both
  axes, the view week's day-detail panel and flag-chip jumps, and the board at
  a small (900×600) viewport scrolling to the deepest-nested warning's puck.
  Contract: `docs/ui-contracts.md` §Jumping from a warning to the puck that
  caused it.
  **Selecting a puck holds the screen still (owner, 7 Aug 26: "it should just
  turn blue. it should not pan the view at all").** The page never scrolled —
  the person's issue box opening ABOVE the schedule pushed the clicked puck
  ~220px down the screen, which reads as a pan. `interactions.ts:
  holdPuckStill` scrolls the page by the puck's own displacement, so it stays
  under the pointer; the boxes still open (the owner chose keeping them over
  dropping them when asked). **The correction runs in the render's own task
  (owner, same day: "the page jitters")** — the first version deferred it to a
  timeout, which races the next paint, and on a slow machine one frame showed
  the leap before the snap-back; `queueHold` in `highlights.ts` drains at the
  end of `refreshHighlights`, the same task as the day-markup swap, so the
  displaced frame can never be painted. The e2e test CPU-throttles (8×) and
  samples every frame — a fast box wins the race and measured the buggy code
  clean, which is how it shipped. jsdom sees a zero delta by construction;
  gated in `e2e/geometry.spec.ts`.
  **Every surface now marks its clicked row (owner, 7 Aug 26)** — the
  day-detail panel's rows and the cross-day crew-rest row were the two that
  emitted no `on` class, so a click lit pucks with nothing saying which row
  had done it; all four surfaces mark by the same WFOCUS test now (pinned in
  `warnjump.test.tsx`). In the same conversation the owner CONSIDERED AND
  DECLINED painting a clicked warning's first-named in selection blue — a
  clicked warning lights its whole crew in the warning colours and fades the
  rest; blue stays the puck-click selection only. Recorded in `CLAUDE.md`
  §Stable decisions so it is not re-proposed.
- **A warning now anchors on the LINE that caused it (owner, 6 Aug 26).**
  The jump above used to pick its destination by heuristic — the flagged
  person's first puck in document order — so "no time for the flight brief"
  could pan to the sim row that ate the brief instead of the flight line.
  Warnings now carry an optional `key`: the slot-key of the **first item the
  message names** (`add()`'s 5th argument in `validate.ts`; the event keys
  come off `collectEvents`). `warnTarget` prefers the flagged person's puck
  inside the anchored row on both the week and the board, segment-safe prefix
  matching (`anchorEl` in `highlights.ts`), and falls back to the old
  heuristic verbatim when the key is absent or stale. Day-spanning warnings
  (`DT_SUM`, `LONGDAY`, `DAYS_RUN`) carry no anchor by design. Parity holds
  by stripping `key` from both sides in `parity.test.ts` and pinning the keys
  positively in `validate.test.ts`; the jump itself is pinned in
  `warnjump.test.tsx` ("the anchored line wins") and one browser scenario in
  `e2e/geometry.spec.ts` (a SIM_BRIEF lands the sim row on screen). Pan only —
  the owner declined a row highlight on landing.
- **The jump HOLDS the lateral view when the puck is already on screen
  (owner, 6 Aug 26).** The horizontal move above used to run on every click,
  so a warning on a day you were already reading snapped that day hard to the
  left edge and threw the rest of the week off the side — for nothing, since
  the puck was in front of you before the click. `scrollToWarnFocus` measures
  the PUCK against the week viewport first and pans only when it is genuinely
  off screen; otherwise `scrollLeft` is untouched and the jump is vertical
  only. A zero-width week (jsdom, where every rect is 0×0) reads as "cannot
  tell" and takes the old unconditional pan, so the vitest suite still drives
  the shipped path — only `e2e/geometry.spec.ts` can see the hold, and it now
  gates both halves. Those tests click through `clickHere` (`e2e/app.ts`, new)
  rather than `page.click`: Playwright scrolls a target into view before
  pressing it, which would hand the app a week already panned onto the day.
  Contract: `docs/ui-contracts.md` §Jumping from a warning to the puck.
- **Three bugs found by sweeping the RUNNING app (owner ask, 6 Aug 26).** All
  three were invisible to the unit suite and visible within minutes in a
  browser, which is the argument the new live-view rule in `CLAUDE.md` rests
  on. Each is pinned in `e2e/geometry.spec.ts` or `interact.test.tsx`, verified
  failing against the old code first.
  **Touching the AREA strip counted as editing it.** `AREA` and `AREA TIME`
  are the only cells whose displayed value is DERIVED (codes off the aircraft,
  the window off the formation's TO–LD), so `f.area`/`f.atime` stay null while
  the cell already reads `1240-1405`. `textedit.ts` compared the text to the
  MODEL field, i.e. to `''`, so every focusout looked like a change: a stray
  click or a tab-through stored the derived value as a scheduler's own. The
  dashed hint is what gets noticed; the damage is that a stored value WINS over
  the derivation, so the airspace window then stops following the take-off. It
  compares against `areaText()`/`atimeText()` now — the same functions the
  builder renders with, so identical text is not a change, a real edit still
  commits and an emptied cell still stores the blank.
  **A long callsign was clipped mid-word.** `.puck .nm` carried
  `text-overflow:ellipsis` and never got one — the property has no effect on a
  flex container — so "Wrangler" rendered as "Wrangl", a plausible callsign
  that is not the man's. It is `display:block` with a line-height replacing the
  lost `align-items:center`, and a FADE rather than an ellipsis: `Wra…` throws
  away three legible characters out of a 74px box, while the fade keeps every
  character the width allows. Names that fit are pixel-identical to before.
  **The board's phone layout was out-specified.** `.sb-arow.c6r` is two classes
  where the phone override is one, and a media query adds no specificity, so
  the desktop six-column template won below 820px: at 390px the ITEM column —
  the only thing saying WHICH duty a row is — collapsed to a 14px stub while
  START and END stayed legible. The template is restated inside the query.
  Desktop was never wrong, which is why it survived.
- **The crew-pairing chip `CP` (owner, 5 Aug 26; renamed from `CC`, owner ask
  5 Aug 26).** The pairing rules (`CREW_SOLO`, `CO_APPROVAL`, `OCU_NO_IP`,
  `ILLEGAL_CREW`, `NO_IR`) used to ring a puck and caption nothing, which left
  them the one warning family with nothing to click. They now all chip:
  **two codes, one printed flag** — `CP` amber where the pairing needs
  approval, `CPH` red where it is not authorised — both printing `CP`. A ring
  with no chip is now a bug and a test asserts there are none. Ranking is an
  insertion, not a reshuffle (`CP` leads the advisories, `CPH` sits under
  `C`), so a man already carrying a conflict keeps the `C` flag. Adding any
  chip code means patching `refwin.ts:rematrix()` in the same breath —
  `RANK`, `CHIP_TEXT` **and** `CHIP_LABEL` — or the byte-exact
  reference-markup parity fails on the tooltip, not the rule.
  **The legend never learned about it (owner, from the deployed site, 7 Aug
  26).** The chip shipped on 5 Aug and `legendHTML()` was not touched, so for
  two days the squadron met a flag on a puck with nothing on the page saying
  what it meant — and it is the one flag they cannot guess, because `CP` is
  the only code whose COLOUR carries half the meaning. It takes **two** rows,
  amber `needs approval` and red `not authorised`, sitting adjacent so the
  distinction is visible rather than described. Port-only, so `html.test.ts`
  excises both from the byte comparison (`noCP`, the `noRunKey` idiom) and
  pins them positively. A new test walks `CHIP_LABEL` and fails on ANY chip
  with no legend row — this gap existed because nothing checked, and that is
  now the check.
  Rules: `docs/engine-rules.md` §The crew-pairing chip.
- **A turn chips but never rings (owner, 7 Aug 26).** `DT` and the same-day
  `TT` chipped a puck without ringing it while the overnight `TT` rang amber,
  so one glyph meant "ringed problem" in one place and "unringed note" in
  another. The owner's call: a turn is a note, so the ring goes and the chip
  stays. One line in `validate.ts` (the `CREW_TIGHT` branch); the warning
  itself is untouched — filed, counted and clickable exactly as before, and a
  man who trips a ringing rule as well keeps that rule's ring. This is a
  deliberate divergence from `reference/`, so `refwin.ts:rering()` patches the
  in-memory reference to match. **It fires nowhere on the seed week**, which
  is why it needs `engine/turnring.test.ts` to BUILD the case — every
  seed-driven assertion passes identically with the ring left in, so the
  change is invisible both on screen and to the parity suite. Rules:
  `docs/engine-rules.md` §validation.
- **The chip is the puck, and selection is blue-only (owner, from the deployed
  site, 7 Aug 26).** The flag chip used to jump to the person's worst warning
  while the puck body around it selected the person — two views a few pixels
  apart. The `.lchip` branch in `interactions.ts` is gone; every click on a
  puck selects, and the person view already answers the chip's question (his
  flagged days open narrowed to him, multi-person warnings kept whole with all
  names). The cross-day CR chip's jump folded into the same gesture: selecting
  the dotted man reveals the trace strip AND opens the breach day's box.
  Styling in the same breath: `.puck.sel` is the blue fill alone — the 2px
  `#BFE0FF` halo went, and with it the `!important` shadow that was BURYING
  the red/amber severity ring on any selected puck; the `.sel.box*`
  punch-through rules went too (`.me.*` halves stay). `.puck.dim` is `.5`,
  was `.18` (owner: "don't make it so faded"). Every copy of the person still
  lights (asked, kept). Pinned in `warnjump.test.tsx` (chip = puck, CP box
  carries both names, trace chip surfaces the strip) and a rewritten e2e case
  that measures what vitest cannot: blue `rgb(30,134,255)`, no `#BFE0FF` in
  the computed shadow, warn ring still drawn, dim at `0.5`, box still 74×15.
  Contract: `docs/ui-contracts.md` §Selection highlight and §Jumping.
- **`sbWide` state** is module-local and resets on reload (matches the
  original's session-scoped behaviour).
- **The phone board is ONE window (owner, 8 Aug 26 — comp approved before
  build).** The three stacked zones — panels, a bottom-pinned Live-checks +
  roster sheet, the B25 resize grip splitting them — became the edit week's
  shape: warnings strip at the top of the one scroller, the roster in a
  right-edge AIRCREW drawer (the week's `.eroster` tab, its `ros-open`
  accent flip and the delegated `.ros-tab` toggle reused verbatim; arming
  a slot pulls it open via `armSlot`'s existing `isPhone()` line, and
  `closeScheduler` parks it so an open drawer never leaks onto the week).
  The grip machine and its `--sbside` variable are DELETED, not hidden.
  Desktop and `.sb-wide` are untouched. In the same pass the board's crew
  cells stack pucks two-wide on a phone (the AMT BOX's eight pax read as
  four vertical pairs, the week's geometry). A second wave off the owner's
  first real use (same day): the flying line's seats got full-width strips —
  the full-width B cell had been breaking grid auto-flow, sliding the 74px
  seats into the 46px time tracks where the pucks painted over each other —
  a deleted sim pax now renders as a droppable hole holding its place (the
  engine always kept the index; the board drew nothing there, so the block
  collapsed and the replacement had nowhere to land — the WEEK still draws
  holes as nothing, reference-shaped, by choice), and both drawers' bodies
  scroll the iOS way (flex-bound height instead of a 100vh cap that never
  binds under Safari's toolbars, plus overscroll containment). A THIRD
  wave, from a brainstormed critique the same day (spec:
  `raptor-port/docs/superpowers/specs/2026-08-08-mobile-board-flaws-design.md`):
  the parked tab had been stealing taps — its full-height sliver covered
  ✕ Close and the Sun 19 chip, and a short-lived invisible 14px tap
  extension covered input ends — so parked is now a centred grab-handle
  (clamp(180px,55vh,440px), an honest 30px, week and board alike); a
  successful fill parks the drawer so the puck is seen landing (tap path
  in placeArmed, drag path via the ROS_REOPEN latch in applyDrop's
  done()); and Live checks folds to one tappable line (SBWOPEN in
  board.ts, collapsed afresh per visit, desktop/.sb-wide always open).
  Contracts: `docs/ui-contracts.md` §The board on a phone is ONE window
  and §The scheduler board's panels; pinned in `odds.test.tsx` and
  `board.test.tsx`, measured in `e2e/geometry.spec.ts`.
- **AL versioning is ROLLBACK semantics (owner decision, Aug 26).** "Restore
  this version" makes that version live immediately, discards the day's
  pending edits, needs no sign-off; new edits publish as `nextAL()`. Details:
  `docs/engine-rules.md` §Version snapshots / restore. Known limitation:
  previews freeze schedule content but personal-INPUTS and day-info read live
  data; snapshots are session-only.
- **Personal inputs need accepting (Aug 26).** Three day blocks (`Ground
  Programme`, scheduler-only `Personal Inputs`, `Unavailable`); a personal
  input reaches the issued programme only when a scheduler **accepts** it, and
  the validator only sees actioned inputs (`inputFlags` gate). Full rules:
  `docs/engine-rules.md` §Accepting a personal input and §validation.
- **`Fly` semantics changed from the original** (blocks once actioned; an
  actioned Fly is AWAY — off the crew strip, faded, barred whole-day). Rules
  in `docs/engine-rules.md`. Reference probes `audit2 #8` and `audit` (item 3)
  pin OLD rules and fail on the port by design — `docs/probe-sweep.md`.
- **Ground rows accepted before the Aug-26 callsign fix** keep the person-ID
  form in `who` and stay unresolved where id ≠ lowercased callsign (Hao Wen,
  X-Ray) — same visible behaviour as before, no migration.
- **Scheduler notes are edit/board only** — four boxes (`pn:` programme,
  `dtn:` duties, `sn:` sims, `gn:` ground). They never render on the view page,
  even when populated, and like every other edit here they do not survive a
  reload (only `rules` is persisted).
- **`probes/perf-port.cjs` is green (9/0) and its budget is now per node
  (owner, 5 Aug 26).** It used to trip a no-regression assertion in about 2
  runs in 5, at the same rate on unchanged code — the estimator, not the app;
  it now warms up, takes the minimum of per-trial medians, and keeps BOTH
  builds open measuring them round for round, so per-trial ratios cluster
  within ±0.05. The remaining red light (`board edit 1.19×` against a flat
  1.15) was feature growth, not a regression: the port's board carries **1.78×
  the nodes** of the reference's (699 vs 393). The flat ratio was replaced
  by `port ms/node ≤ reference ms/node × 1.15` — the board reads **about 0.7×
  per node**, while the raw ratio that budget replaced now sits near 1.24×,
  so the flat one would still be red — plus a machine-independent **DOM
  ceiling** (board ≤ 770, week ≤ 5530) so a DOM explosion can't hide behind a
  per-node average. The per-node figures move with the machine; re-measure,
  don't quote. Raising a ceiling is a deliberate edit in the PR that adds the
  nodes. Reasoning and numbers: `docs/probe-sweep.md` §The performance gate.
  Self-check:
  `PORT_URL="file://$PWD/reference/scheduler.html" npm run perf` measures the
  reference against itself (~1.00×). Still not in CI (too slow, and it needs
  the reference); judge it with `npm run perf`.
- **An OFT sim's remarks can name its own brief lead (owner, 5 Aug 26).**
  An EP profile briefs `VCONF.epBrief` (15 min) before the box unless its
  remarks say otherwise — "BRIEF 30 PRIOR", "brief 30", "30 mins prior" all
  read as 30, **for that line only** (`events.ts:briefLeadOf`; out-of-bound
  values fall back to the default). The AMT keeps its own BRIEF row as the
  hard line. The seed EP-4s say "BRIEF 30 PRIOR" on both builds, so
  `refwin.ts:relead()` patches the identical parse into the in-memory
  reference — one new seed advisory appeared (Bane's VL BFM eats his EP-4
  brief), on both engines. Rules: `docs/engine-rules.md` §validation.
- **NO_BRIEF, SIM_BRIEF and DT_SUM are amber (adv), not red** (owner, 4 Aug
  26); DOUBLE_BOOK stays red. Parity tests stay byte-exact via `retier()` in
  `src/testing/refwin.ts` (re-tiers the in-memory reference before boot; the
  reference file on disk is untouched).
- Other owner decisions of 4 Aug 26 (all-day Fly gate, `acceptInput` refusing
  Unavailable-typed inputs, unavailable guarding all tasking) are documented
  in `docs/engine-rules.md` §validation — this file no longer duplicates them.
- **CAT instructor rework (owner, 5 Aug 26).** The IP tick column is gone;
  the ladder is `OCU→D→C→B→A→IW→IP→IR→FI` (no generic `I`, no `ip` flag) and
  the new hard `NO_IR` rule wants an IR examiner on any IRT line. Bane went
  `A+IP → IP`, so he no longer counts as `isLead` (FL/SUP chips) — accepted
  when the letter was dropped. Rules and seat matrix:
  `docs/engine-rules.md` §validation.
- **The combination matrix (owner, 5 Aug 26).** F-15SG Table 1.5-2 grades
  every crewed aircraft (jet only, not the sim box): OCU pilot + CAT A–D WSO
  and OCU WSO + CAT A–D pilot are red (`ILLEGAL_CREW` — this superseded the
  old two-OCU hard rule), OCU + OCU is the `CREW_SOLO` advisory (syllabus
  sorties only), and D+C / C+D / D+D is the `CO_APPROVAL` advisory. An
  instructor in either seat clears it; the table's IR footnote on the
  OCU-pilot column is deliberately disregarded. The matrix fires on the seed
  week, so `src/testing/refwin.ts:rematrix()` patches the identical rule into
  the in-memory reference for parity. Rules: `docs/engine-rules.md`
  §validation.
- **Quals page reworked again (owner, 5 Aug 26).** Fixed column order (SANS,
  SXO, SCHEDULER, SC DAY, SC NIGHT, DAAR, NAAR, NVG, IMC, TF); `Downchit`
  dropped (nothing read it — a downchit is a dated INPUT); **TF** added,
  granted by hand and read by no rule. The Sort chips are gone: the headings
  sort, second click inverts, CAT by seniority and a qual column by who holds
  it. `View` is Pilots / WSOs / **All**, and the CSV follows the screen.
  FLIGHT is now editable in edit mode because the roster records none —
  same reason initials are: nothing to derive, do not invent. Contract:
  `docs/ui-contracts.md` §The Quals page's columns, sorting and View.
- **EDIT QUALS (owner, 5 Aug 26).** An admin-only mode inside edit mode:
  add a qualification, remove one, drag a heading to reorder. The six flags
  the engine reads (`sched` `scDay` `scNight` `daar` `naar` `sxo`) arm before
  they can be removed, and removal never touches `p.quals` — add the column
  back and the ticks return. The drag is the page's own pointer machine;
  `drag.ts` stays scoped to pucks. **Not persisted** — like the ticks,
  initials and flights beside it, a reload restores the default column set
  (`rules` is still the only thing written to storage). If the squadron wants
  their LoX to survive a reload, that is the same server/sync work as the
  first bullet. Contract: `docs/ui-contracts.md` §EDIT QUALS.
- **The 6 Aug 26 bug sweep** (four parallel read-only audits, then fixes).
  Besides the role enforcement above: **Insights counted what never flew** —
  `computeInsights()` walked every wave with no `cx` check and no standalone
  exclusion, while `dayCount()` and every other consumer filter both, so
  cancelled lines and SC/AVALON/BB crew inflated Sorties, Formations and top
  flyers and wrongly cleared people off `idle` (owner decision: standalone
  waves are excluded from the totals; pinned by the new
  `src/engine/insights.test.ts`). **`minus()` printed a negative clock** —
  it called `fromMin`, which does not wrap, so a brief lead off an early T/O
  read `-2:-20` on the board's B column and in the CSV; it routes through
  `hm24` now. **Both brief callers hard-coded 140** instead of
  `VCONF.briefLead`, so an edited rule left the engine and the printed time
  disagreeing. **Two unescaped strings** — `puck()`'s callsign (its own
  sentinel branch already escaped) and the read-only traffic list in
  `Modals.tsx`. Only the callsign is escaped inside the puck title:
  `CHIP_LABEL` legitimately holds `<`/`>` and escaping those breaks the
  byte-exact reference parity. The rulebook audit of every documented rule
  came back clean — no rule mismatches.
- **The brief time is the scheduler's now (owner, 6 Aug 26).** `B` is typed
  per formation (`f.br`, `ff:di.gi.li.br`) on the edit week and the board —
  which grew a B column for it. Blank offers the calculated time as a ghost
  above the box; clicking accepts it through the funnel, so it is pending,
  amendable and undoable, and a blank line is still checked against that same
  time. `VCONF.briefLead` is therefore a CONVENIENCE that works out the
  suggestion, **not a rule** — every brief-driven check follows the indicated
  B. Contract: `docs/ui-contracts.md` §The B box.
- **Crew rest rings three ways (owner, 6 Aug 26).** The anchor is the earlier of
  the in-time and the leg's own brief, and exactly `crewRest` stays legal. A
  `late show` / `show at brief` remark on an aircraft does NOT excuse the
  breach — still red, still counted — it draws it **dashed** while the man
  clears rest by the new editable **latest show** (`VCONF.showLead`, 60 min
  before T/O); past that line it is solid, because he cannot make the flight.
  Every CR warning carries `leaveBy` and `prevDi`.
  **The previous-day trace is a STANDING mark now (owner, 6 Aug 26).** It used
  to be painted only while the warning was focused, so you had to already know
  about the breach to be shown its cause. `validate()` files every breach a
  second time under the day that CAUSED it (`WARN.trace[prevDi][id]`, with
  `traceOf`/`traceLeads`/`traceIx`/`tracesOn`), and that day now draws it with
  nothing clicked: the puck rings **dotted** (a third stroke, additive — it
  stacks with a red box of his own), takes a `CR` chip captioned with the day
  broken and the leave-by where nothing louder outranks it, and the day's issue
  box grows a `.dwtrace` cross-day row. The chip and the row both carry the
  NEXT day's `(di, ix)`, so the ordinary warning jump navigates them.
  **The ROW is on demand now (owner, from the deployed site, 7 Aug 26); the
  puck marks still stand.** Several lines of tomorrow's prose sat on a day
  whose own issue list was still collapsed, so the day read as though it had a
  problem of its own while the count above it said otherwise. `dayTraceHTML`
  renders only when that day's list is open (`DWOPEN`) or a puck is clicked
  (`PFOCUS`) — gated INSIDE the builder, not at its three call sites, so a new
  caller cannot bring the standing box back by forgetting it. The dotted ring
  and the `CR` chip were deliberately KEPT (owner's choice when asked): on a
  day with no issue box there is no list to open, so the puck is the only way
  in, and without them nothing would say where to click.
  **And the row now sits IN the list, below the warnings and above the
  advisories, in the same row box as its neighbours (owner, 7 Aug 26)** — it
  used to render after the whole list in a narrower dotted container of its
  own. `.dwtrace` is `display:contents` inside the `.dwlist`; a day with no
  list of its own wraps the strip as `.dwlist.solo` (same box, top border
  back). Identity = dotted red bar + pink label, never a different box.
  Position pinned in `crewrest-ui.test.ts`, geometry measured in
  `e2e/geometry.spec.ts` (same width, left edge, border and padding as a
  sibling row).
  **And clicking the row now PANS to this day's late line, not tomorrow's
  flagged one (owner, from the deployed site, 7 Aug 26).** It used to throw the
  week over to the breach day and centre the leg that got flagged — which the
  row's own prose had already named — while the sortie that ran late, the only
  one a scheduler can still move, was left behind. The row still FOCUSES the
  real warning (the breach stays selected, his pucks there light, the
  `✕ Clear focus` is where it was); only the destination changed, and it is the
  one place in the app where the pan and the focus name different days.
  The engine had to learn which leg it was: rest is worked out from a minute
  count, so `validate()` threw the event away — it now keeps the winning event's
  slot-key as `WARN.trace[…].fromKey`, on the TRACE and not on the warning, so
  `parity.test.ts` (which compares every field of `WARN.byDay`) never sees it
  and `refwin.ts` needs no patch. The row carries it as `data-wpd`/`data-wpk`,
  `interactions.ts` hangs it on the focus as `panDi`/`panKey`, and
  `scrollToWarnFocus` prefers it. The landing mark is the existing dashed
  same-man-elsewhere stroke over the standing dotted ring — the owner declined
  a full warning highlight, which would make the causing day read as having a
  breach of its own. Pinned in `crewrest-ui.test.ts` (the key names the LATER
  leg where he flew twice — a heuristic would take his first), in
  `warnjump.test.tsx` (the focus and the pan assert separately), and measured in
  `e2e/geometry.spec.ts` on a phone, where one day box fills the screen so
  "the week did not move" is a real measurement: the old code threw it 378px.
  **The dashed ring was never dashed on screen (owner, from the deployed site,
  6 Aug 26).** `.puck.warn.hard` puts a solid 1.5px red ring on every hard flag
  and `.boxdash` only ADDED an outline on top of it, so the dashes were filled
  in from behind and a sanctioned late show rendered as a fat solid red box. It
  clears the shadow now. Two sizing decisions came out of looking at the three
  together: the dotted ring is 1.5px (at 2px, CSS `dotted` draws square dots
  almost identical to the dashed stroke) and sits at `outline-offset:2px` (any
  closer and it hides inside `.boxred`'s 2px spread on a puck wearing both).
  All three are now measured in `e2e/geometry.spec.ts` — vitest can only see
  which class was emitted, which is exactly why this shipped broken.
  One coupling falls out of it, and it is the only one: an edit on day N that
  changes its crew rest rewrites day N−1 too — `probes/perf-port.cjs`'s
  day-isolation assertion names that exemption and still fails on any other day.
  Rules: `docs/engine-rules.md` §validation; visuals: `ui-contracts.md`.
  **Known limitation, raised with the owner and deliberately not built
  (6 Aug 26):** because crew rest anchors on the brief, typing a B LATER than
  the real one makes a genuine breach disappear. With a `late show` remark
  that is deliberate and visible; a plain typo does it silently, and the
  bounded parse rejects nonsense values, not wrong ones. The cheap guards if
  it ever bites: show the rest margin beside the B box, or flag a B sitting
  more than some margin later than the suggestion. Neither is built.
- **Deploy**: GitHub Pages must stay enabled (Settings → Pages → Source:
  GitHub Actions). The workflow refuses to publish on any red test.
  **The deployed page can be opened and driven from the container now (owner
  opened the network policy, 7 Aug 26), and checking a shipped change against
  it is a standing instruction** — a green workflow is not evidence the page
  serves. Recipe and the three Chromium launch settings it needs (without
  them every host fails as `ERR_CONNECTION_RESET`, which looks like an outage
  and is not): `CLAUDE.md` §Build & verify. The four
  gates also run on every **pull request** into main (owner ask, 5 Aug 26),
  so a red PR is caught before merge; a PR run gates only — it uploads no
  artifact and never deploys. Publishing stays push-to-main.
  **The publish step has a ten-minute ceiling you cannot raise (6 Aug 26).**
  `actions/deploy-pages` polls until Pages serves the artifact and aborts at
  600000 ms, CANCELLING a deployment that is still reporting progress — so a
  green build publishes nothing. Passing a bigger `timeout:` does not work;
  the action clamps it and says so in the log. Pages normally takes about 8
  minutes for this repo (measured, 11:21 on 6 Aug), which leaves roughly two
  minutes of margin against a queue nobody here controls. Ruled out as causes
  before blaming the queue: the artifact is 0.15 MB over 5 files, the
  environment goes waiting→queued→in_progress in 1–3 s, and the repo sits at
  2 deployments/hour against a soft limit of 10. If the wait becomes
  permanently over ten minutes the fix is a different publish path — a
  `gh-pages` branch, which never waits on the rollout, or another host — not
  a re-run and not another timeout value. Reasoning is in the deploy step's
  own comment in `.github/workflows/deploy.yml`.
  **Three more deploy faults, all GitHub's, seen the same evening — know them
  before diagnosing a red publish (6 Aug 26).** They are separate from the
  ceiling above and from each other, and one of them makes retrying pointless:
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
  **The Actions status API reads 10–20 minutes STALE, and that is the single
  biggest time-waster in this pipeline (7 Aug 26).** Repeatedly it reported a
  step "in progress" that had finished half an hour earlier — a gate that took
  2m17s looked hung for 35 minutes, and the natural conclusion (something is
  wrong with my change) was wrong every time. Two things help, both measured:
  `list_workflow_jobs` refreshes sooner than `get_workflow_job` or the PR
  check-runs endpoint, and the ONLY trustworthy signal for a publish is the
  deployed page itself — poll `curl -sS https://seejiaokai.github.io/Raptor/`
  for the new bundle hash out of `dist/index.html` (Pages rolled over in
  90 s–3.5 min all day, nowhere near the ten-minute ceiling). Never conclude a
  run is hung from that API alone, and never re-run or dispatch on it.
  Two token traps, both measured, and the first is narrower than it first
  looked: a merge made with the **raw session token** (curl `PUT
  /pulls/{n}/merge`) produced NO push-deploy at all, while a merge through the
  **GitHub tooling** triggers one normally. So do not reflexively dispatch
  after merging — check for a push run first, or the dispatch supersedes a
  healthy run and cancels it (the concurrency group is `cancel-in-progress`).
  That mistake was made here twice, once in each direction.
  The second: the raw session token gets `403 Resource not accessible by
  integration` on `POST /actions/workflows/{id}/dispatches`, which returns an
  EMPTY body on success too — so a script cannot tell refusal from success and
  will cheerfully report runs it never started. Dispatch through the GitHub
  tooling, not curl.
- **Stores configuration shipped (owner, 7 Aug 26).** The squadron's stores
  list — NAV, N/C, 2 TKS, 3 TKS, TPOD, CL — was a fixed `const` in
  `ui/html.ts`; it is the squadron's own now (add, remove, rename, reorder),
  persisted to `localStorage` separately from `rules`. A `C` button replaces
  the week's old `+` and is newly added to the board; both surfaces share one
  body-level popup listing every store lit-or-unlit, and a pen (`✎`) inside
  that popup switches it into an editor for the list itself. View-only shows
  the chips and gets no `C`. Full contracts: `docs/ui-contracts.md` §Stores
  configuration (rendering/interaction) and `docs/engine-rules.md` §Stores
  configuration (storage, load validation). Ten things worth knowing before
  they are rediscovered as bugs:
  - **A customised list freezes against the standard set.** The whole list
    is stored the moment it deviates (`storesSave` — no per-entry diff makes
    sense for an ordered, renameable sequence), so a squadron that has
    customised its list will not pick up a store later added to
    `STORE_STD`. Telling "never seen this new default" apart from
    "deliberately deleted it" needs a tombstone list — machinery for a
    problem that does not exist yet, and deliberately not built.
  - **A frozen day preview renders with the CURRENT stores list**, not the
    list as it stood when that version was published — `rules` already
    behaves exactly this way, so this is consistent, not new.
  - **Persistence is per-browser**, the same `localStorage` limitation the
    first bullet on this list describes for `rules`.
  - **The board's DOM ceiling was raised 770 → 810**, measured 767 nodes
    (was 699 before this feature) — `probes/perf-port.cjs`'s `DOM_CEILING`,
    reasoning in `docs/probe-sweep.md` §The performance gate.
  - **Deleting every store silently reverts on reload.** `storesSave` writes
    `[]` when the list is emptied, and `storesLoad` falls back to the
    standard six whenever nothing valid survives (`out.length ? out :
    STORE_STD...`, made explicit in the 8 Aug final fix wave — see
    `docs/engine-rules.md` §Stores configuration) — an empty saved list is
    indistinguishable from "load found nothing" either way, so the standard
    six quietly return. No last-store guard exists; if a squadron ever wants
    a genuinely empty list to stick, this needs one.
  - **The popup's exits were reworked on the deployed site's feedback
    (owner, 8 Aug 26), closing the old "outlives a page navigation" issue.**
    Three changes in one pass: a click away now closes the box with the pen
    open too (what the old suspension protected survives as a press-origin
    guard — a press that starts inside the box and ends outside is swallowed,
    and a mid-rename commit still lands because change fires on blur, ahead
    of the click); any page change sweeps body-level popups in `setPage`
    (`state/view.ts`), unhooking the box's document listener so nothing
    leaks; and when the page is pinch-zoomed the box centres in the VISUAL
    viewport, capped to fit, instead of landing in the off-screen part of
    the layout viewport (`place()`'s zoom branch — the `.wavemenu` 250px
    min-width must stay inline-zeroed there or the cap is a no-op). The
    default ORDER also became the owner's: TPOD, 2 TKS, NAV, N/C, 3 TKS, CL
    (keys unmoved, so nothing saved was affected). Pinned in
    `stores-edit.test.tsx` (dismissal, page change) and
    `e2e/geometry.spec.ts` (the zoom placement, which jsdom cannot see).
  - **`PENDING_HOLD` in `highlights.ts` is a single overwrite slot**, now
    shared by two unrelated features — `holdPuckStill`'s scroll correction
    and this popup's `place()` re-anchor. No reachable path today calls
    `queueHold` twice in the same task, so nothing is lost yet, but a third
    consumer would make that true silently; the module comment flags it as
    a review question for whoever adds one.
  - **`export.ts`'s CSV row for a schedule line puts store labels in
    unescaped.** Not an HTML sink — `csvText` quotes for CSV, not for a
    browser — but a store renamed to start with `=` is a spreadsheet-formula
    injection vector once that CSV is opened in Excel/Sheets. Pre-existing
    risk surface, worse now that labels are user-renamable.
  - **Four residuals parked at the final review (8 Aug 26), none a
    data-integrity risk.** (a) **No migration for a list already damaged by
    the pre-fix key mismatch.** Until the 8 Aug wave, deleting `2 TKS` and
    retyping it minted a second entry keyed `2tks` while every jet kept
    `opts.tk2`; `storesLoad` still accepts such an entry, so a squadron that
    hit it sees two identically-labelled chips and keeps a stranded `tk2`
    until the stray is deleted by hand. Nothing makes it worse, and the
    feature has not shipped to anyone yet. (b) **A misleading refusal.**
    Rename `2 TKS` to something else, then type `2 TKS` as a new store, and
    it is refused with "2 TKS is already on the list" while the list shows
    the new label — the refusal is correct (the key is taken), only the
    wording is confusing. (c) **The label match that restores a standard
    key trims and upper-cases but does not normalise inner spacing or
    punctuation**, so `2  TKS` or `2-TKS` still derive `2tks` rather than
    recovering `tk2`. Retyping the name as printed works, which is the path
    the toast promises. (d) **`export.ts:30` still writes stores for a
    standalone line** if legacy `opts` survive there from before the SC /
    AVALON / BB gate went on both surfaces; the entry paths are closed now,
    the CSV read path is not.
  - **CLOSED (owner ask, 9 Aug 26 — was tracked here as an open gap and as
    "deliberately not fixed"; took two passes, the first of which introduced
    a NEW hole a reviewer caught before it shipped — recorded honestly
    below).** The Schedule Board used to stay open across a page change —
    at a phone width (≤820px), tab to `#burger` behind an open board, the
    drawer paints above it at `z-index:440`, and "View-only Sched" flips
    `CURPAGE` while the board itself stayed open with callsign, times,
    remarks, the CX/red-flag/add-aircraft/delete buttons and the FCP/RCP
    arm targets all still live and still writing to the model. A reviewer
    confirmed this in a real browser: a typed callsign committed, `+ Line`
    added a formation, a row's `✕` deleted a line. **Was believed not
    reachable by a normal user at the time — wrong, corrected in round 3
    below.** A desktop pointer click straight at the nav was confirmed
    blocked by the modal's own stacking context, which read as proof the
    whole gap needed a bypass to reach; it only checked one path in. At
    phone width the burger menu sits OUTSIDE the modal and stays
    keyboard-focusable behind it — Tab to it, open the drawer (which paints
    ABOVE the board), click a nav link normally. A real, ordinary phone
    gesture, no bypass. This was a live hole, not defence in depth, and the
    round-3 addendum below is what actually closes it (a page change now
    closes the board outright rather than leaving it open-but-hidden for a
    reachable UI path to land on).
    **Pass 1 (render + the flying line's own write paths) — closed the
    board's own controls, opened a different one.** `SchedBoard.tsx`'s
    `const open = SBDAY != null` became `SBDAY != null && CURPAGE ===
    'editsched'`, deliberately leaving `SBDAY` itself untouched ("a resume,
    not a leak"), and `board.ts`'s flying-line render/write paths were
    widened onto `stoRO`/`mvRO` (`pv OR not in edit mode`) the same way the
    stores chips, grip, nudge buttons and Sort all already were. **This
    reasoning was wrong**: `Shell.tsx`'s document-level right-click
    clear-a-seat handler carried `HOOKS.editMode() || SBDAY != null` — an
    escape hatch that existed BECAUSE the board used to paint over whatever
    page you were on, and so trusted "a board is open" as proof of safety
    on its own. Leaving `SBDAY` alive broke that assumption: the render
    stopped painting the board on the wrong page, but the escape hatch kept
    reading `SBDAY != null` as permission — so a real right-click on the
    WEEK puck now VISIBLE underneath (no longer covered by the board)
    cleared it straight through. Proven live by the reviewer with a real
    pointer, and proven to be a NEW regression, not pre-existing, by
    building the prior commit in a parallel worktree: before, the hit-test
    on that puck was covered by the board and a right-click timed out;
    after pass 1, it landed and deleted.
    **Pass 2 (the fix): `SBDAY` is cleared, not left alive.**
    `state/view.ts`'s `setPage` now clears the board outright the moment
    the page stops being `'editsched'` (`closeBoardState()` — `SBDAY` null,
    which disarms `ARM` for free since `setBoardDay`'s own disarm fires on
    any day change including to null, plus the aircrew drawer's `ros-open`
    body class parked), the same cleanup `closeScheduler`'s Done/Close
    buttons already ran, now shared rather than duplicated. Landing back on
    Edit Schedule does **not** silently resume a day any more — a
    scheduler opens one again, same as any other visit; the "resume"
    framing from pass 1 is gone. `Shell.tsx`'s handler lost the `SBDAY !=
    null` escape entirely — `HOOKS.editMode()` alone gates it now, which is
    the one condition already correct for every legitimate case (role,
    page, AND the edit toggle) and false for every one that isn't.
    `state/view.ts` staying DOM-free of `ui/board.ts` (the layering this
    file's own map describes) is why the shared cleanup lives in
    `state/view.ts` and `board.ts`'s `closeScheduler` calls into it, not
    the reverse.
    **The render widening also had a narrower boundary than the write
    surface it was meant to close.** Pass 1 widened only the flying line
    (what this entry named by name: callsign/mission/brief/take-off/
    land/remarks, its CX/flag/add-aircraft/delete cluster, its FCP/RCP
    seats). The SAME gap sat untouched in every other panel added Aug 26 —
    Overall notes, the overall programme, duty/sim/ground rows — still
    `pv`-only. Demonstrated live: a read-only board still let a name be
    dragged onto a duty row (`drag.ts`'s `applyDrop`, the ONE mutation path
    shared by mouse and touch, checked the role but never the mode — 36
    draggable seats and 59 draggable roster pucks on a read-only board),
    and typing into a day's Overall note left the wrong text sitting on
    screen **permanently** — `boardChange`'s first-attempt guard was an
    early `return` that skipped past the revert branch a rejected `txtSet`
    already had, so a blocked field kept whatever was typed into it on
    screen while the model held the old value underneath: worse than a
    dead control, because a scheduler sees their own words and reasonably
    believes it saved. Both fixed: six more call sites in `board-html.ts`
    (`sbRowCtl`, `sbTxt`, `sbNote`, `sbSeat`/`sbMore`, the `data-fill`
    cells, `sbInputsGroupPanel`'s accept control) plus the per-wave header
    block and the `.bsug` brief-suggestion ghost in `board.ts` now pass the
    same `ro` flag the flying line's `dis`/`stoRO` already used; `applyDrop`
    checks `HOOKS.editMode()` alongside the role; `boardChange` reverts a
    blocked field to the model's real value instead of merely refusing to
    commit it, mirroring the revert a rejected edit always had.
    `boardMbtn`'s consolidated guard (added in pass 1) is now
    **load-bearing for tests that predate it** — the nudge, per-section-sort
    and delete-line branches lost their own copy of the check when it moved
    to the top of the function, so narrowing that guard later without
    giving those three branches a check of their own back would silently
    reopen a gap even though their own tests would keep passing; flagged in
    a comment at the guard itself.
    **Nineteen new tests pin all of this** — `board.test.tsx` (the blocker,
    reproduced with a real `contextmenu` dispatch on a WEEK seat after a
    board was opened then navigated away from; the render/write-path
    widening for the other panels; two page-leave stale-state regressions,
    `ros-open` and `ARM`), `drag.test.tsx` (`applyDrop`'s mode check, using
    a stale-but-attached drag source/target the same way every other
    write-path test in this pass does — a version that re-rendered between
    capture and drop was tried first and passed for the wrong reason, the
    target having gone stale/detached, which is recorded in the test's own
    comment) — plus one rewritten and one added in `e2e/geometry.spec.ts`
    (the page-nav-close test now asserts `SBDAY` is actually cleared, not
    just hidden, since "resume" is gone; a new test drives the blocker with
    a REAL pointer right-click, confirming the same real-browser
    reproduction the reviewer used). `probe-bridge.ts` gained `w.setPage`
    (same bare-global idiom as `w.openScheduler`) so the squadron-member
    render-gate e2e test can force Edit Schedule with no click path there,
    proving the role gate rather than the page gate. Every test in both
    passes was run against the pre-fix code first and confirmed red —
    including, for pass 2, checking that pass 1's OWN tests didn't
    accidentally start passing for the wrong reason once SBDAY started
    clearing (two did, and were rewritten: `board-stores.test.tsx`'s
    stores-go-read-only test now reaches read-only via the edit toggle,
    since the page-nav route it used no longer leaves the board open to
    observe; the finding #1 row-register e2e test does the same).
    **Pass 3 (coordinator ship review, 9 Aug 26) — a verdict of "ship it"
    with two corrections and four small items.** First correction: pass 2's
    "not reachable by a normal user" framing above was **wrong**, not just
    imprecise. A desktop pointer click straight at the nav was blocked by
    the modal and read as proof the whole gap needed a bypass; it only
    checked one path in. At phone width the burger menu sits OUTSIDE the
    modal's stacking context and stays keyboard-focusable behind it — Tab
    to it, open the drawer (paints ABOVE the board), click a nav link with
    an ordinary pointer. The reviewer drove exactly that. It was a live
    hole, corrected here, not defence in depth. Second correction: pass 2's
    render/write-path widening (the "residual" above) was in fact complete
    — a stale instruction had told a fresh reviewer to judge it unfinished,
    based on an out-of-scope paragraph in this task's own report that was
    never struck through after pass 2 shipped and so still contradicted the
    code; that paragraph is now corrected in the report itself.
    Four items, all fixed the same day: **(1)** a zero-coverage gap on
    `Shell.tsx`'s context-menu fix — the full suite stayed green with the
    `HOOKS.editMode() || SBDAY != null` → `HOOKS.editMode()` line reverted,
    because the blocker test only exercised the `setPage`-clears-`SBDAY`
    half; a new test opens a board on Edit Schedule itself, switches the
    edit toggle off, and right-clicks an `#eWeek` seat — the one state only
    the `Shell.tsx` line protects, since `SBDAY` is genuinely non-null
    there. **(2)** `#sbAddLine`/`#sbAddGo` (`SchedBoard.tsx`) matched to
    `#sbSortAll`'s own gate three lines above them — `{open &&
    HOOKS.editMode() && <button…>}`, hidden rather than merely disabled, the
    last "looks live, does nothing" pair on the board. **(3)** the CX-with-
    a-reason dialog and Sort all's confirm dialog (`CXT`/`SORTALL`, module
    state in `ui/board.ts`) now drop when `closeBoardState()` runs, via a
    new `HOOKS.closeBoardDialogs` — the same injectable-callback doorway
    `HOOKS.editMode`/`HOOKS.renderScheduler` already use, wired once in
    `SchedBoard.tsx`, chosen over a circular import because `state/`
    importing `ui/board.ts` is exactly the layering violation
    `closeBoardState`'s own comment already declined; `cxCommit` gained the
    standard `!canEditSched() || !HOOKS.editMode()` guard it never had,
    pre-existing and (per the coordinator) genuinely unreachable today, but
    the last write path of this family with none. **(4)** this task's own
    report corrected — the stale "out of scope" section struck through
    rather than silently edited, and a dangling truncated sentence at the
    very end of the file (a leftover from an earlier append that didn't
    fully consume the text it was inserting after) removed. Six more new
    tests, each checked against the pre-fix line/code first. Gates:
    `npm test` 814+, `npm run build` clean, `node reference/tfin.js` 728/0,
    `npm run test:e2e` 50/50, `npm run probes:adapted` 6/6, `npm run perf`
    9/0 — exact counts in the task's own report, which this entry does not
    duplicate.
- **Board rows can be reordered (owner ask, 8 Aug 26): "drag lines up and
  down to adjust the sequence."** Every movable list on the board — flying
  lines (a formation, travelling as a block), jets inside a formation,
  Duties, Sims, Ground Programme, the overall programme, overall notes —
  gets a grip (`⠿`) at the far left on desktop and ▲/▼ buttons in its own
  control cluster below 820px; both are always in the markup, CSS decides
  which paints. A row moves only within its own list (a duty row cannot
  change block, an AMT row cannot become an OFT row); a flying row's grip
  carries the aircraft address, and the DROP decides whether it resequences
  the jet within its formation or carries the whole formation — dropping
  into another wave is refused. `engine/reorder.ts`'s movers reuse the
  exact key-space heads `engine/keys.ts`'s existing delete-time renumbering
  already proved correct, through a new bijective sibling
  (`permuteKeys`/`moveKeys`) that drops nothing and cannot collide two
  marks onto one address. A move marks the moved row at its own NEW
  address — the same idiom every add uses, and the reverse of a delete,
  which marks nothing. Contracts: `docs/engine-rules.md` §Reordering a
  board list, `docs/ui-contracts.md` §Reordering rows on the board.
  **Two behaviour changes a future reader must not mistake for bugs.**
  Ground Programme stops time-sorting itself on any day once a row is
  dragged there — the first move freezes the rendered order into the model
  and sets `d.gman`, which switches that day from `groundOrder`'s
  start-time sort to plain model order; the way back is Undo. Duty rows no
  longer print in a fixed role order (SDO → SXO → OPS-O → …) — they print
  in the order they are stored, on the week and the board alike, so a
  reorder sticks instead of being overridden on the next render.
  **Two controls followed at the owner's ask: Auto sort per section, Sort
  all for the whole day.** A `⇅ Auto sort` button sits in every section's
  own header — flying waves, Duties (per block), Sims (AMT and OFT each get
  their own), Ground Programme, the overall programme — and throws that
  section back into its own reading order: flying by take-off (the jets
  INSIDE a formation never move, because their order is a position in the
  formation, not a time), Duties by role, Sims/Ground/programme by start
  time. Overall notes get no button at all — prose in a chosen order has no
  natural key, and a sorter would silently invent one. `⇅ Sort all`, one
  button in the board's own top bar, runs every section's sort for the
  whole day at once; the owner asked for it after being advised against it,
  so it ships with the two guards that make it safe — it asks first, naming
  the day, in the board's own confirm-dialog shape rather than a browser
  `confirm()`, and the whole run holds `HIST.lock` so Undo takes the day
  back in ONE step, not six. Every sorter is stable (equal keys keep their
  order) and a no-op when the section is already sorted — no model change,
  no mark, no amendment — and every sorter remaps the amendment key space
  through the same `permuteKeys` primitive the movers above use, so a sort
  never mislabels an old amendment onto a different row. Ground's Auto sort
  also clears that day's manual flag (`d.gman`) and says so honestly when
  clearing the flag is the ONLY thing that happened — "back to time order"
  rather than a false "already in order". A new duty row still lands in
  role position, but only once the scheduler TYPES the role — a blank row
  has nothing to sort by yet, so the sort fires off the role field's own
  commit, not off the row being added. Contracts: `docs/engine-rules.md`
  §Sorting a board section, `docs/ui-contracts.md` §Reordering rows on the
  board. **The board's DOM ceiling was raised again, 810 → 860** (the grip,
  the two nudge buttons, one Auto sort button per section and the Sort all
  button all landed on a board that already carried them once for the
  reorder feature above), measured 859 nodes — `probes/perf-port.cjs`'s
  `DOM_CEILING`, reasoning in `docs/probe-sweep.md` §The performance gate.
- **A whole-branch review found five defects the per-task reviews could not
  see, because each one only shows up crossing a boundary no single task's
  diff crossed (9 Aug 26; fixed same day).** All five are now fixed, each
  pinned by a test that failed before the fix and passes after:
  1. **The read-only board lost its row register.** `sbGrip()` returned `''`
     for a read-only render, but every row template in `scheduler.css`
     unconditionally reserves the grip's leading 18px track — so a read-only
     board (reachable at the time by opening the board and clicking
     View-only Sched — the board used to stay open; today the two routes
     are a published-version preview and a session that may not edit)
     lost each row's FIRST grid item
     while the template still had ten tracks, and every field walked one
     track left of its own header. Fixed by emitting `<span class="sb-grip">`
     unconditionally and gating only a new `.ro` class, which
     `scheduler.css` turns into `visibility:hidden` — not `display:none`,
     which would drop the box from grid layout and reproduce the same bug.
     Pinned by a Playwright test (jsdom cannot see this at all).
  2. **`groundOrder(rows, man)`'s new `man` parameter never reached either
     render call site** (`ui/html.ts`, `ui/board-html.ts` both called it
     bare) — a scheduler's manual ground reorder (which sets `d.gman`) was
     silently undone by the very next redraw, while the model stayed
     permuted and a pending mark stayed set. Both call sites now pass
     `d.gman`.
  3. **A duty row's role-reposition fired on ANY role commit in the block**,
     not only a new row's — retyping a different row's role after a manual
     drag silently snapped the whole block back to role order. Now gated on
     the edited row's OLD role having been empty (read via `txtGet` before
     `txtSet` overwrites it) — the "+ Row" case the rule exists for.
  4. **`Sort all` gated on the role check alone**, at both its render gate
     and its write path, where every sibling control on the board (the
     grip, the nudge buttons, every per-section Auto sort) gates on
     `HOOKS.editMode()`. On the read-only board from #1, it stayed live and
     enabled while everything around it correctly disappeared. Now gated on
     `HOOKS.editMode()` in all three places (`SchedBoard.tsx`'s render,
     `askSortAll`, `sortAllCommit`).
  5. **The stale-arm guard checked only whether the armed address still
     EXISTS**, and a reorder never changes a list's length — arm a slot,
     drag that row elsewhere, tap a name, and it plants on whatever moved
     INTO that index, with a success toast and the amendment mark on the
     wrong key. `engine/reorder.ts` now exports `REORDERED_DI` (set by every
     mover/sorter that actually permutes a list, popped once by
     `afterSchedMutate`) and `state/view.ts` disarms whenever a reorder
     touched the armed slot's OWN DAY — the same day-scoped blanket reflex
     the undo path and the board's day-tab switch already use, not a
     finer per-list one.
     **Re-review same day found this still reproduced through "+ Row, then
     type the role":** `board.ts`'s `boardChange` called `afterSchedMutate()`
     — the function that reads and clears `REORDERED_DI` — BEFORE calling
     the auto-sort, so the sort's own flag-set always landed too late to be
     seen, and (worse) leaked to disarm an unrelated LATER edit instead.
     Fixed by moving the sort ahead of `afterSchedMutate()`, wrapped in
     `HIST.lock` so the text commit and the auto-sort it triggers stay ONE
     undo step (the `sortAllCommit` precedent) rather than two.
  Smaller items in the same pass: a stale comment claiming duty-row parity
  needs "no refwin patch" (it does — `testing/refwin.ts`'s `reduty()`);
  `dutySort` (dead code, no callers) removed from `ui/html.ts` — `DUTY_ORDER`
  stays, it moved to the engine; `reduty()`'s own comment corrected (the
  wave-count-mismatch throw is one-directional — only when the PORT has more
  duty blocks — and the guard that actually still holds duty order
  accountable is the reference's own `dutySort` re-sorting the pushed rows
  at render, not this function); the "squadron member gets no grip" e2e test
  rewritten to actually open the board (`window.openScheduler`, no role
  check of its own) instead of counting controls on a page where it was
  never opened; the row-overflow e2e test's zero-match guard changed from
  one aggregate count across five selectors to a per-selector presence
  check; `+ Line`/`+ Wave` gained the same in-function `canEditSched()`
  check every other board control has (`addLine`/`addWave`/`waveMenu`); and
  `board-html.ts`'s two `from './html'` imports merged into one.
  **Re-review same day: `addLine`/`addWave`/`waveMenu`, the nudge and
  per-section Auto sort handlers in `boardMbtn`, and the delete-line (✕)
  button — which had NO check at all — all gained `HOOKS.editMode()` on top
  of the role check, matching finding #4's own gate on Sort all; the
  reviewer had clicked a still-live ✕ on a read-only board and deleted a
  line.** `addLine`/`addWave`/`waveMenu`'s gate is scoped to
  `view.SBDAY != null` rather than a bare `editMode()` check — those three
  are also called directly off `window` by `probes/adapted/sa-async.cjs`
  with no board ever opened, and a bare gate broke that probe (caught by
  `npm run probes:adapted`, not by `npm test`).
  **Was deliberately not fixed here, because it predated this pass — closed
  9 Aug 26, see the (now resolved) "board stays open across a page change"
  entry above:** the read-only board's flying-line CX/flag/+ (add-aircraft)
  buttons and its callsign/times/remarks inputs used to stay fully live —
  only the controls named above were in scope for this pass.
- **The doc set was aligned to the finished port (5 Aug 26).** Both READMEs
  still described a three-gate, mid-port project — the root one also called a
  member view-only, which the 5 Aug roles decision had already undone.
  `START_HERE.md` (one-time cloud-onboarding for a repo that has existed for
  months, referenced by nothing) and a stray Word lock file were deleted;
  `PORTING.md` was kept but marked historical, because `probe-sweep.md` and
  `perf-port.cjs` still cite its decisions. `~$*` is now git-ignored.

## File map

### `raptor-port/src/engine/` — the rules engine (DOM-free)
| file | what it does |
|---|---|
| `data.ts` | The demo week: DAYS with waves/formations/aircraft, duties, sims, ground, programme rows. |
| `people.ts` | PEOPLE roster (quals, seat, categories), qual ladder (`OCU→D→C→B→A→IW→IP→IR→FI` — instructor-ness lives in CAT, no `ip` flag), `isScheduler`/`isLead`/`isInstr`/`isInstrPilot`/`isOcu`, `scShiftKind`, `sanStatus`, `aarNeed`. |
| `inputs.ts` | INPUTS list + taxonomy: `isLeave`, `isLocalLeave`, `isDownchit`, `isDetach`, **`isPersonal`/`isUnavail`** (the two day blocks), INPUT_TYPES, DATES. |
| `time.ts` | `parseHM`/`hhmm`/`minus`/`overlap` (half-open — abutting windows do not clash). |
| `events.ts` | `collectEvents()` — the per-day event build the validator consumes. |
| `validate.ts` | `validate()`, WARN/REST/EVD, WCODE/CHIP_LABEL/RANK, `wlbl`, `chipOf`, `dashOf`, the crew-rest trace (`traceOf`/`traceLeads`/`traceIx`/`tracesOn`). **The conflict engine.** |
| `avail.ts` | `slotRules`/`slotBar` eligibility, `dayOff`/`dayEngaged`, free-count ranking. |
| `slots.ts` | The mutation funnel: `slotVal`/`setSlotVal`/`fillSlot`/`txtGet`/`txtSet`, `whoArr`/`rowCrew`/`acRef`, `rollCx`, **`acceptInput`/`unacceptInput`/`inpKey`**. |
| `keys.ts` | `keyDay`, `shiftKeys` + `shiftAircraft`/`shiftFormation`/`shiftWave` renumbering (delete-time), and its bijective sibling `permuteKeys`/`moveKeys` for a reorder. |
| `order.ts` | `groundOrder(rows, man)` — Ground Programme's render-time start-time sort, pulled out of `ui/html.ts` (8 Aug 26) so `reorder.ts` can freeze a rendered order into the model without the engine importing from `ui/`. `man` (a day's `d.gman`) returns model order untouched. |
| `reorder.ts` | The board's row movers (owner, 8 Aug 26): one function per list (`moveFormation`/`moveAircraft`/`moveDutyRow`/`moveSimRow`/`moveGroundRow`/`moveProgRow`/`moveNote`) plus `applyMove`, the one entry point the UI calls — parses `mv:` addresses and resolves a flying row's two meanings (resequence vs. carry the formation) by what it was dropped on. |
| `waves.ts` | WEEKS/CURWEEK, standalone waves (SC/AVALON/BB): `isStandalone`, `makeStandalone`, `saExempt`. |
| `publish.ts` | SCHED, sign-offs (SIGN_ROLES), `setDayApproved`, `publishALDay`/`alIssue`/`unpublishAL`, `markEdit`, AL colours, per-day version snapshots (`daySnap`/`daySnapOf`/`dayVersions`), `dayCurVer` (the day-head chip). |
| `restore.ts` | `dayKeys` walker + `restoreDayVersion` — ROLL a day back to a published version (it becomes live at once). |
| `rules.ts` | VCONF/SHIFT_HARD editing, `ruleParse`/`ruleFmt`, `rulesSave`/`rulesLoad`/`rulesReset`. |
| `insights.ts` | `computeInsights()` for the Insights modal. |
| `stores.ts` | The squadron's stores list (owner, 7 Aug 26) — mutable `STORE_CFG`, frozen `STORE_STD`, `storeKey`, `addStore`/`delStore`/`renameStore`/`moveStore`, and `storesSave`/`storesLoad`/`storesReset` against its own `stores` key. Was a `const` in `ui/html.ts`; it is persisted state now, so it lives here. Nothing in `validate.ts` reads a store. |
| `hooks.ts` | HOOKS — injectable callbacks (toast, repaints, histPush, storage) so verbatim bodies stay DOM-free headless; `storeBackend` is the injected localStorage (`main.tsx` plugs the real one in, null headless). |
| `index.ts` | The barrel — re-exports every module above. UI and probes import from `../engine`, so a new engine file wants a line here. |

### `raptor-port/src/state/` — the store
| file | what it does |
|---|---|
| `store.ts` | `notify()`/subscribe/version; `wireStore()` maps HOOKS→notify (including the role-aware `editMode()`); **`resetSession()` — the ONE session-change path, used by every login and logout**; write helpers; `initStore()` boot (wires, **rulesLoad**, validate, history baseline). |
| `view.ts` | UI state the engine reads: CURPAGE, SBDAY, ROSDAY, ARM, selection (SELID/WFOCUS/PFOCUS/DWOPEN/HLSET/SEARCH — clicking a puck lights every copy of that person), `afterSchedMutate()`, `focusWarn`, setters. |
| `history.ts` | HIST snapshots, `histPush`/`histApply`, undo/redo bodies. |
| `auth.ts` | SESSION, `setSession` (resets LGEDIT), `canEditSched`, ME/`setMe`. |
| `users.ts` | The Manage-users prototype list. |

### `raptor-port/src/ui/` — components and builders
| file | what it does |
|---|---|
| `App.tsx` | Login vs Shell + board overlay (the board is a SIBLING of the shell so logout unmounts it). |
| `Shell.tsx` | Topbar, nav, both schedule pages' chrome, global listeners (click/change/contextmenu/focusout/keydown, drag, pan), banner, memoized sections. |
| `ViewWeek.tsx` / `EditWeek.tsx` | The week surfaces: build `dayHTML` per day, diff strings, swap only changed days, hold scroll; `EditRoster` palette. CURPAGE-gated. |
| `SchedBoard.tsx` | The full-screen day board: panels with per-panel string diff; grip resize; CxDialog (cancel-with-reason). |
| `board.ts` | Board HTML assembly + delegated handlers: line/wave and duty/sim/ground row add/delete (with key renumbering), the ▲/▼ nudge handler, CX flow, red-box flag, `waveMenu`, `openScheduler`/`closeScheduler`. |
| `rowdrag.ts` | The board row-reorder pointer machine (owner, 8 Aug 26) — its own small machine, deliberately not `drag.ts` (which stays scoped to pucks): pointer events so a finger works, releases implicit pointer capture on the way down, writes the lifted row and the drop bar straight onto the DOM, delegated on the board wrap so it survives every panel repaint. |
| `html.ts` | THE builder library: `dayHTML`, `puck`, `slotCell`, `signoffHTML`, day warnings, day-info panel, legend, cx/flag tags. |
| `board-html.ts` / `palette-html.ts` / `logic-html.ts` | Board panels (inputs bands, notes, programme, duties, sim rows, ground, personal-inputs group, sim notes), the aircrew palette, the Logic tab's rule text. |
| `interactions.ts` | `routeClick` — the delegated click router: select/arm/plant (a puck's flag chip falls through to selection — the chip is the puck, 7 Aug 26), publish/AL/sign-clear, day-info, warning boxes, the board's issue list (via `jumpToWarn`, which opens `DWOPEN` as the day-detail branch does), week chips, stores remove + the `+` config picker (`openStoresMenu`). |
| `drag.ts` | Mouse HTML5 DnD + the touch pointer machine; `applyDrop()` is the single drop path; `barDrop` qualification warning. |
| `pan.ts` | Week arrows (`panDays`), proxy scrollbar (`hsSet`/`hsSync`, echo-guarded), shift+wheel, palette day-follow, phone day dots. |
| `textedit.ts` | Inline text editing: Enter commits / Escape restores, heal-in-place, deferred commit, `editingText()`, plus the four fields outside the `data-txt` grammar. |
| `highlights.ts` | Post-render decoration: selection/search/warning-focus classes on every puck (the week AND the board's `.sb-boardwrap`, never the palettes or a `.pv-frozen` preview), `paintArm`, and `scrollToWarnFocus` — surface-aware, snap-safe, lateral-holding (it pans sideways only when the target is off screen), picking the puck whose row holds the most of the warning's crew, and honouring `WFOCUS.panDi`/`panKey` where the focus and the destination are different days (the cross-day crew-rest row, and only it). |
| `Modals.tsx` | DayPop (read-only day details), Insights, Manage-users, Airspace/traffic popup. |
| `InputsPage.tsx` / `QualsPage.tsx` / `LogicPage.tsx` | The three secondary pages (inputs CRUD + CSV, quals grid, rules doc + admin editing). The Inputs table carries a date window and heading sort, so **its DOM row order is not `INPUTS` order** — address a row by the model index its buttons carry (`data-edit`/`data-inx`/`data-save`), never by position. Contract: `docs/ui-contracts.md` §The Inputs table's view state. |
| `RangeCal.tsx` | The Inputs date picker (owner, Aug 26): ONE calendar taking a range in two clicks, Monday-first grid, `yyyy-mm-dd` strings so the add/edit paths are unchanged. Used by the add form and by the table's `#inRangeBtn` window. |
| `ALPanel.tsx` / `Drawer.tsx` / `Login.tsx` | Amendment panel, phone drawer, login. |
| `pops.ts` / `toast.ts` / `useStore.ts` / `export.ts` | Popup flags, the toast, the store hook, CSV export — `csvText` (UTF-8 BOM, so Excel stops mojibaking the en dash), `exportCSV` and `schedRows`. The ONE exporter: schedule, inputs and LoX all call it. |
| `scheduler.css` | The ported stylesheet — it carries MEASURED contracts, not preferences. |
| `../probe-bridge.ts` | Window bridge for the browser probes. Keep in sync when adding engine API. |

### Tooling
| file | what it does |
|---|---|
| `probes/run.cjs` | Runs any reference probe against the reference build or the port. |
| `probes/perf-port.cjs` | The perf gate (`npm run perf`) — measures BOTH builds at once, round for round, and asserts no regression. |
| `probes/adapted/` | Six probes re-expressed for this build (`wrap` `drop` `aar` `audit` `sa` `sc2`); `run-all.cjs` runs the set as `npm run probes:adapted`. |
| `src/testing/refwin.ts` | Boots the reference in jsdom for the parity tests; pushes the port's seed INPUTS into it, `retier()`s the three amber codes, `remap()`s the CAT-ladder rework (tables, isInstr, PEOPLE literals, legend), `rematrix()`es the combination matrix into the reference's validate, `relead()`s the remark-driven OFT brief lead into its simwin, `rebrief()`s the indicated B and the crew-rest anchor, and `rering()`s the amber ring off the tight-turn chip, so both engines compute from identical data. NOT a test file. |
| `docs/probe-sweep.md` | The full probe → reference → port results table. |
| `docs/session-state.md` | The last session's leftovers — **often absent, and absent is meaningful**: it exists only while something is genuinely pending, and the session that clears the last item deletes it. This file holds the durable state; that one holds what a session could not finish. Written by `.claude/skills/session-handoff`. |
| `docs/superpowers/specs/` + `plans/` | Design specs and task-by-task plans from brainstormed features (the vendored superpowers flow; first used 8 Aug 26 for the mobile-board critique fixes). Historical records of WHY a shipped shape was chosen — the living contracts stay in `engine-rules.md` / `ui-contracts.md`. |
| `PORTING.md` | **Historical** — the phase plan the port was built from. Nothing left to run; kept only because `probe-sweep.md` and `perf-port.cjs` cite its decisions (dropped probes, original timing budgets). |
| `reference/` | The original single-file app + its 728-assertion suite. **Read-only** — the spec for existing behaviour, and one of the four gates. |
| `index.html` + `public/favicon.svg` | The Vite entry page and the **only** thing in `public/` (Aug 26). The favicon is the talon from `Login.tsx`/`Shell.tsx`, copied because a browser fetches it standalone before any bundle runs — edit the claw path in all three or the tab and the page disagree. It differs from the components on purpose: a tile and a same-colour stroke, because a tab paints it at 16px where bare thin claws vanish. `href="/favicon.svg"` in the page is rewritten to `./favicon.svg` by `base:'./'`, which is what makes it resolve under the Pages sub-path. |
| `e2e/` | The geometry gate (`npm run test:e2e`): `geometry.spec.ts` measures the layout contracts in a real browser — including where a warning click leaves the week and the board, and where it deliberately does NOT — and `app.ts` holds login/nav/scroll-settle helpers (`settle` takes an axis, `settleBoth` waits for both) plus `clickHere`, a click that does not scroll the target into view first (`page.click` does, which would defeat any test that parks the week on purpose). `playwright.config.ts` builds and serves the port itself. |
| `.github/workflows/deploy.yml` | Test-gated GitHub Pages deploy on push to main; four gates, geometry included. The same gates run on PRs into main, in a per-PR concurrency group so a PR run cannot cancel a live deploy. |
| `.claude/skills/session-handoff/SKILL.md` | The `/session-handoff` skill — decides whether `docs/session-state.md` is warranted, writes or deletes it, and checks this file was kept true against the session's own diff. Repo-level, so it ships with the clone the next session gets. |
| `.claude/skills/` (14 more) | `obra/superpowers` v6.2.0, MIT, vendored 7 Aug 26 — a plugin install lives in `~/.claude/plugins` on a local machine and never reaches a web session's fresh container, while repo-level skills ship with the clone. Cross-references de-namespaced; the upstream SessionStart hook is vendored at `.claude/hooks/` but **not** wired in. Provenance and the update recipe: `.claude/skills/SUPERPOWERS-VENDORED.md`. |
