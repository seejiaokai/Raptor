# [HUMAN-RETEST] the absence record + [S4-HUNT-REST] — plan review and scenario-design brief (26 Sep 26)

Given, identically and blind to each other, to Fable 5.1 and to Astra (Codex), both at high effort. Bug-check order
§4 rank 1 (a model that did not build the thing designs the test scenarios, hunting for what is MISSING) and rank 3
(red-team the plan before the walk). Kept in the repo so the next re-test re-uses it.

---

You are reviewing the plan for a hands-on re-test of the **absence record** of this app — how leave, medicals,
courses and overseas duty are recorded ONCE (as the person's Input on the Inputs page) and read by the Leave War
(the squadron's yearly leave-bidding grid) and by the flying schedule — and you are designing the test scenarios
the walk must execute. You did not build it. **Read-only: edit nothing, run nothing.** Another agent will execute
your scenarios in the real running app (the production build, driven by a scripted real browser), at phone and
desktop width, as an admin, as a member and as a guest, and photograph each one. Your job is to decide what that
walk must cover — above all, what is MISSING from the plan.

## Why this re-test exists

`[HUMAN-RETEST]` in `OUTSTANDING.md`: every earlier bug check of the absence record was a code review plus unit
tests. On another feature that method passed two frontier-model reviews and ~5,300 tests, and the owner then found
three defects in minutes by opening the app. All three were MISSING lines, not wrong ones: a screen the feature was
never wired to, a gesture that did nothing on part of the screen, and one mark painted over another. Reading code
cannot find a line that is not there. The absence record's rules then changed many times in one day (20–21 Sep 26)
and **nobody has ever watched them on screen** (`raptor-port/docs/superpowers/specs/2026-09-20-CURRENT-STATE.md`
§8). Most of the ground Fable and Codex planned for the last hunt was never run: `[S4-HUNT-REST]` in
`OUTSTANDING.md`. Assume the absence record carries the missing-line class of defect, unfound.

## The plan you are reviewing — START HERE

`raptor-port/docs/superpowers/plans/2026-09-26-absence-retest-plan.md` — its scope, the eight questions, the rules
sweep, the roll-call (R1–R24), the door check, the everything-world fixture, how the walk is split (W1–W4 and the
host), and what closes it.

## Where the promise is written — read these

- **The rules, newest wins:** `raptor-port/docs/superpowers/specs/2026-09-20-CURRENT-STATE.md` (read it first — it
  overrides every other 20 Sep document, and its §5 lists the rules SET ASIDE, which are not to be tested as live);
  `…/specs/2026-09-20-one-absence-behaviour-register.md` (B1–B9, H1–H6, Q1–Q15, N1–N19);
  `…/specs/2026-09-20-arch-stack-4-clash-check.md`; `…/specs/2026-09-20-agreed-rules-plain.md` (the rules by screen).
- **The rulings files** (Codex: these do not load by themselves for you — read them by path):
  `.claude/rules/decisions/leave-war.md` (its §Architecture: the one-absence model and the four seams),
  `.claude/rules/decisions/oil.md` (D79–D82, D142), `.claude/rules/decisions/scheduler.md` (D174–D179, D183–D189 —
  what an input change does to a published day; D103; D149), `.claude/rules/decisions/how-we-work.md` (D166 accounts:
  the war follows the signed-in callsign; D204, D211, D213, D215 the guest and medical visibility; D148 undo; D56;
  D90), and `.claude/rules/raptor-executor.md`.
- **The earlier hunt's plan and what it did:** `raptor-port/docs/superpowers/plans/2026-09-20-s4-bughunt-plan.md`
  (the merged Fable+Codex scenario list, batches A–H; batch A ran), `…/plans/2026-09-20-arch-stack-4-test-coverage.md`
  (what was tested and what was not), `OUTSTANDING.md` `[S4-HUNT-REST]`, `[HUMAN-RETEST]`, `[PUB-UNAVAIL]`,
  `[LW-LOCKMARK]`, `[LW-COMMIT-MANNING]`, `[LW-WEEKDAY-WORK]`.
- **Reference docs:** `raptor-port/docs/engine-rules.md` (§Publishing — the input-details axis; §Auth / roles),
  `raptor-port/docs/ui-contracts.md` (its Leave War and Inputs sections), `raptor-port/docs/feature-impact.md`,
  `raptor-port/docs/data-schema.md` §World 2, `raptor-port/docs/data-model.md` §11 (permissions),
  `raptor-port/docs/leavewar/known-gaps.md`.
- **The code.** The one record and its doors: `raptor-port/src/leavewar/absences.ts`, `src/leavewar/inputgate.ts`
  (+ `src/state/inputgate-hook.ts`), `src/leavewar/sync.ts` (the absence door, `refreshAbsences`, `runOilPass`,
  `publishFlagsBids`, `leaveInputAt`), `src/leavewar/state/merge.ts`, `src/leavewar/state/store.ts`,
  `src/leavewar/engine/dayview.ts`, `engine/warrecs.ts`, `engine/charge.ts`, `engine/counters.ts`,
  `engine/availability.ts`, `engine/bids.ts`, `engine/oiltracker.ts`. The Inputs side: `src/engine/inputs.ts`,
  `src/engine/medical.ts`, `src/ui/InputsPage.tsx`, `src/ui/InputsCal.tsx`, `src/ui/caldrag.ts`,
  `src/ui/inputedit.tsx` (`normalizeInputDraft`), `src/ui/MedicalView.tsx`, `src/ui/MedClashConfirm.tsx`,
  `src/ui/UpchitConfirm.tsx`, `src/ui/OilConfirm.tsx`, `src/ui/DocConfirm.tsx`. The war's screens:
  `src/leavewar/ui/Matrix.tsx`, `DayList.tsx`, `BidPicker.tsx`, `SelectSheet.tsx`, `PersonSheet.tsx`,
  `CreditForm.tsx`, `BalanceBar.tsx`, `FiguresDrawer.tsx`, `ManningSheet.tsx`, `OilTracker.tsx`,
  `RemarksSheet.tsx`, `select.ts`. The schedule side: `src/ui/html.ts` (the Unavailable block, the issued face),
  `src/ui/board-html.ts`, `src/engine/events.ts`, `src/engine/validate.ts`, `src/engine/publish.ts` (the filing /
  input-details comparison), `src/state/perms.ts`, `src/ui/GuestApp.tsx`. Storage: `src/storage/`,
  `src/leavewar/state/storage.ts`.
- **What is already tested, so you can see what is NOT:** `src/leavewar/*.test.ts` (`scenarios-doors`,
  `scenarios-rules`, `scenarios-corners`, `scenarios-bughunt`, `review-fixes`, `inputgate`, `publishdoor`,
  `absences`, `sync`), `src/leavewar/ui/*.test.tsx`, `src/ui/inputscal.test.tsx`, `raptor-port/e2e/step4-leavewar.spec.ts`,
  `e2e/leavewar.spec.ts`, `e2e/medical.spec.ts`.

## The brief (bug-check order §4, verbatim)

> Do not merely review the changed code. Starting from the user promise and the applicable
> rulings, enumerate every qualifying object, renderer, visible door, writer, reader, downstream
> consumer, role, overlay and meaningful order of actions. **Assume every existing line may be
> correct and the defect may be a MISSING call site.** For each item, state where the visible sign
> and the working gesture should exist in the production app. Then rank concrete failure scenarios
> with setup, action, expected result, and the observation that would disprove correctness. Start
> with the least-shared or most specialised surface.

## What is NOT a finding (owner, D56, verbatim)

> This app is pre-promulgation and its entire stored world is DEMO DATA that will be CLEARED before
> the database step. **Do not report a problem whose harm exists only in data already stored when
> the code is already correct going forward** — no migration, no back-compat, no "an existing
> record would read wrongly". If the app would do it again to NEW data, report it: that is a real
> finding and this exclusion does not touch it.

Also out of scope (the plan §1 says why): "undo reverses only your own changes" (D148 — decided, not built; the
next re-test's); the Leave War links; the items the plan lists as filed and waiting (`[LW-WEEKDAY-WORK]`,
`[LW-COMMIT-MANNING]`, `[LEAVE-YEAR]`, `[LW-LOCKMARK]`, the OIL award-storage fix and its batch); the deliberate
behaviours (one undecided + one refused request may share a half; windows that only touch do not clash; OIL may go
negative); code style; speed, unless a person would feel it.

## What to hand back

1. **What the plan MISSES** — a surface the roll-call (R1–R24) does not name, a door the door check does not name, a
   role or a state it does not walk, an order it does not pair, a live rule its sweep (§3) left out or a set-aside
   rule it tests as live, a kind of record the everything-world (§5) does not carry, a walker's ground that is too
   big or split wrongly (§6). For each: what to add, and why it matters.
2. **The roll-call, checked** — for each R-row (and any you add), three columns: does it SHOW the thing, can the
   person ACT on it there, and what else is PAINTED on the same pixels — with where in the code the answer comes
   from. Mark any row you believe is MISSING a call site (the thing should show or act there and the code does not
   make it).
3. **Ranked failure scenarios** — at least 30, the top 15 in full: setup (through the app's own controls wherever
   possible), action, expected result, and the observation that would DISPROVE correctness. Include ORDERS — pairs of
   the record's own actions in both orders (file then bid, bid then file; approve then medical, medical then approve;
   publish then file, file then publish; award then work, work then award; Post out then file, file then Post out),
   on a published day and an unpublished one, each followed by undo, redo and reload; and the lifecycle boundaries —
   switch war, change week and come back, sign out and in as the other person (admin `ad`/Saber, member `us`/Ranger),
   the guest, phone ↔ desktop. **Walk the money:** after each, which balance, which figure, which manning count must
   read what.
4. **Explicit negatives** — "I checked X and found nothing", for each area you looked at and cleared.
5. **For every scenario you believe is a real defect:** say whether you CONFIRMED it by reading the code (name the
   file and line) or are PREDICTING it, and give the exact, step-by-step fix you would expect — not a direction.

Write plainly. Another model executes this list in the running app, and the owner reads its summary.
