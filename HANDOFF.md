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

**All six gates were green first-hand for the day-navigation pass of 12 Aug 26**,
run in this container on the matching tree: `npm test` 1134 tests across 60 files,
`node reference/tfin.js` 728/0, `npm run build` clean, and the full
`npm run test:e2e` geometry job 79/79 in Chromium. The built bundle was then
driven at 390×780 and at 1440px: the two day arrows step the week and stop
disabled at both ends, the bar measures 75px on one line plus the day strip, a
sideways drag across the board does nothing at all, and no console errors or 4xx
appeared. **The DEPLOYED page was then driven the same way** (the standing
instruction, owner 7 Aug 26) and behaved identically — six taps Monday to Sunday,
both arrows disabling at the ends, the board really redrawing each day, no arrows
at 1440px. `probes:adapted` (36 checks) and `perf`
(4) were re-run first-hand in a Linux container on 12 Aug 26 and both passed;
the resolution failure recorded here before that was a Windows-checkout problem
with the adapted runner's direct `playwright` import, not a code fault. Re-state
any of these only after re-running them.

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
  gate, 79 checks); wider visual work still wants the probe path
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
  ticks, initials and FLIGHT, and the EDIT QUALS column set (add a column
  back and its ticks return — removal never touches `p.quals`). If the
  squadron wants their LoX to survive a reload, that is the same server/sync
  work as the first bullet. `sbWide` is module-local and resets on reload
  too, matching the original's session-scoped behaviour.
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
    knowing** (11 Aug 26). Those three plus `tr:` are the four families the
    board never draws, so `histJumpable` (`histbubble.ts`) keeps their rows
    out of the clickable set — they list, they just do not offer a jump. That
    guard exists because the two halves of this feature shipped separately and
    combined into a wrong answer: one made the four log a value at all, the
    next made every keyed row a button, and clicking one then said "That
    detail is no longer on this day" about a detail sitting safely on the
    week. **A new key family that the board does not render wants a line in
    `NO_BOARD_CELL` as well as in `keyOf`.** The honest fix, if it is ever
    wanted, is for the jump to leave the board for the week — nothing today
    does that, and it was not built blind.
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
- **The Inputs page opens on a window that no longer contains the demo data.**
  It defaults to today → +2 months, and the one dataset is the week of
  13 Jul 26 — so with the container clock past that week the table opens
  EMPTY until you clear the window (the date button → its "all" option). Not
  caused by the late-input work but surfaced by it, since that page is where
  the mark is most legible. It fixes itself the day the app carries more than
  one week of data; until then it reads as "my inputs have vanished".
- **`export.ts` writes store labels into the CSV unescaped.** Not an HTML
  sink — `csvText` quotes for CSV, not for a browser — but a store renamed
  to start with `=` is a spreadsheet-formula injection vector once that CSV
  is opened in Excel/Sheets. Pre-existing risk surface, worse now that
  labels are user-renamable. `export.ts:30` also still writes stores for a
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
| `people.ts` | PEOPLE roster (quals, seat, categories), qual ladder (`OCU→D→C→B→A→IW→IP→IR→FI` — instructor-ness lives in CAT, no `ip` flag), `isScheduler`/`isLead`/`isInstr`/`isInstrPilot`/`isOcu`, `scShiftKind`, `sanStatus`, `aarNeed`. |
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
| `hooks.ts` | HOOKS — injectable callbacks (toast, repaints, histPush, storage, `closeBoardDialogs`) so verbatim bodies stay DOM-free headless; `storeBackend` is the injected localStorage (`main.tsx` plugs the real one in, null headless). |
| `editlog.ts` | The EDIT LOG (11 Aug 26) — `ELOG` (a 400-row ring buffer of `{t,who,di,key,lbl,from,to}`), `logEdit`/`logAction`, `elogRows`/`elogFor`/`elogWhen`/`elogClear`, and `keyLabel`, which turns a slot key into plain words. Written from `noteChange`/`markEdit` and only when both values are handed over. Session-only, and deliberately NOT in `histSnap()`. Rules: `docs/engine-rules.md` §The edit log. |
| `index.ts` | The barrel — re-exports every module above. UI and probes import from `../engine`, so a new engine file wants a line here. |

### `raptor-port/src/state/` — the store
| file | what it does |
|---|---|
| `store.ts` | `notify()`/subscribe/version plus the narrow `notifyBoard()`/`subscribeBoard()` lane used by day-only board navigation, so a swipe does not wake the seven-day edit week; `wireStore()` maps HOOKS→global notify (including the role-aware `editMode()`); **`resetSession()` — the ONE session-change path, used by every login and logout**; write helpers; `initStore()` boot (wires, **rulesLoad**, validate, history baseline). |
| `view.ts` | UI state the engine reads: CURPAGE, SBDAY, ROSDAY, ARM, selection (SELID/WFOCUS/PFOCUS/DWOPEN/HLSET/SEARCH — clicking a puck lights every copy of that person), `afterSchedMutate()`, `focusWarn`, `setPage` (which sweeps body-level popups, closes the board, and captures the day being left), setters. Also `CARRYDAY`/`weekLeftDay`/`scrollWeekToDay` — the day carried between View-only and Edit Schedule; the two geometry helpers live here, not in `ui/pan.ts`, because `pan.ts` already imports this module and `setPage` is the one moment the outgoing week still has layout. Contract: `docs/ui-contracts.md` §The day carries across a page switch. |
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
| `board.ts` | Board HTML assembly + delegated handlers: line/wave and duty/sim/ground row add/delete (with key renumbering), the ▲/▼ nudge handler, per-section and whole-day sorts, CX flow, red-box flag, `waveMenu`, `openScheduler`/`closeScheduler`. Also `boardDayStep`, the day arrows' one call (12 Aug 26 — the swipe and its whole carousel are deleted; do not rebuild them, the tombstone comment in this file says why). |
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
| `src/testing/refwin.ts` | Boots the reference in jsdom for the parity tests; pushes the port's seed INPUTS into it and patches the in-memory reference for every deliberate divergence (`retier`, `remap`, `rematrix`, `reinput`, `redn`, `relead`, `rebrief`, `rering`, `reduty`) so both engines compute from identical data. Each patch is explained beside the rule it serves in `docs/engine-rules.md`. NOT a test file. |
| `docs/probe-sweep.md` | The full probe → reference → port results table, and the performance gate's reasoning. |
| `docs/remarks-vocabulary.md` | Every piece of text a scheduler can TYPE that turns a rule on — the seat tags, AAR, late show, IRT, the sim brief lead — plus the things that look like text triggers and are not. Written in a user guide's voice, for the guide the owner wants (10 Aug 26). A new text trigger belongs here as well as in `engine-rules.md`. |
| `docs/session-state.md` | The last session's leftovers — **often absent, and absent is meaningful**: it exists only while something is genuinely pending, and the session that clears the last item deletes it. This file holds the durable state; that one holds what a session could not finish. Written by `.claude/skills/session-handoff`. |
| `docs/superpowers/specs/` + `plans/` | Design specs and task-by-task plans from brainstormed features (the vendored superpowers flow). Historical records of WHY a shipped shape was chosen — the living contracts stay in `engine-rules.md` / `ui-contracts.md`. |
| `PORTING.md` | **Historical** — the phase plan the port was built from. Nothing left to run; kept only because `probe-sweep.md` and `perf-port.cjs` cite its decisions (dropped probes, original timing budgets). |
| `reference/` | The original single-file app + its 728-assertion suite. **Read-only** — the spec for existing behaviour, and one of the four gates. |
| `index.html` + `public/favicon.svg` | The Vite entry page and the **only** thing in `public/`. The favicon is the talon from `Login.tsx`/`Shell.tsx`, copied because a browser fetches it standalone before any bundle runs — edit the claw path in all three or the tab and the page disagree. It differs from the components on purpose: a tile and a same-colour stroke, because a tab paints it at 16px where bare thin claws vanish. `href="/favicon.svg"` in the page is rewritten to `./favicon.svg` by `base:'./'`, which is what makes it resolve under the Pages sub-path. |
| `e2e/` | The geometry gate (`npm run test:e2e`): `geometry.spec.ts` measures the layout contracts in a real browser — including where a warning click leaves the week and the board, and where it deliberately does NOT — and `app.ts` holds login/nav/scroll-settle helpers (`settle` takes an axis, `settleBoth` waits for both) plus `clickHere`, a click that does not scroll the target into view first (`page.click` does, which would defeat any test that parks the week on purpose). `playwright.config.ts` builds and serves the port itself. |
| `.github/workflows/deploy.yml` | Test-gated GitHub Pages deploy on push to main; four gates, geometry included. The same gates run on PRs into main, in a per-PR concurrency group so a PR run cannot cancel a live deploy. |
| `src/ui/histlist.test.tsx` | The changes list's second pass (11 Aug 26) — the two entry points, a row jumping to its detail with the bubble pinned open, the grouped-by-detail view, and the phone's tap-to-expand control. The media-query split is in `e2e/geometry.spec.ts`, which is the only place it resolves (the day-carousel motion tests that used to sit beside it went with the swipe, 12 Aug 26). |
| `src/ui/editlog-writers.test.tsx` | The write paths the edit log used to miss (11 Aug 26) — the six fields that assign to the model themselves and call `markEdit` by hand, and the three whole actions that reach it with no key. Drives the real gestures on purpose: the bug was in what the callers passed, so a test calling `markEdit` with two values by hand would have passed throughout. |
| `src/ui/boardnav.test.tsx` | The phone board's one-row top bar and how a day is reached (renamed from `boardswipe.test.tsx`, 12 Aug 26, when the swipe was replaced by two arrows) — the arrows step and stop disabled at both ends, the marked dot follows, the dots still scrub, the parked aircrew handle still forwards its vertical drag without opening the drawer, and a sideways drag across the board does NOTHING, which is the removal itself. `boardbackground.test.tsx` proves `boardTab` fires the board lane once and the global lane zero times. Geometry and the production-browser stress live in `e2e/geometry.spec.ts`, because jsdom measures every rect as 0. |
| `.claude/skills/session-handoff/SKILL.md` | The `/session-handoff` skill — decides whether `docs/session-state.md` is warranted, writes or deletes it, and checks this file was kept true against the session's own diff. Repo-level, so it ships with the clone the next session gets. |
| `.claude/skills/` (14 more) | `obra/superpowers` v6.2.0, MIT, vendored 7 Aug 26 — a plugin install lives in `~/.claude/plugins` on a local machine and never reaches a web session's fresh container, while repo-level skills ship with the clone. Cross-references de-namespaced; the upstream SessionStart hook is vendored at `.claude/hooks/` but **not** wired in. Provenance and the update recipe: `.claude/skills/SUPERPOWERS-VENDORED.md`. |
