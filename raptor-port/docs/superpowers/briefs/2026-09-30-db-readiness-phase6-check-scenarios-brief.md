# Scenario brief — `[DB-READINESS]` group A phase 6, built steps (a), (b), (d): design what the FULL walk must cover, 30 Sep 26

You are an independent designer of TEST SCENARIOS for code you did not write (Opus 5.5 wrote it today). **Read-only: do
not edit any file except your report, do not run git commands that change anything, and do NOT run tests, builds or the
app.** Reading and searching only. The repository is `C:\Users\User\projects\Raptor`, app in `raptor-port/`, branch
`claude/db-readiness-table-shaping-4094f6`. **Phase 6's code change alone:** `git diff 0d1a5e18..HEAD -- raptor-port/src`
(26 files; ignore `src/state/p6c-requestonread.test.ts` — step (c), not built, its tests committed skipped). One model
only designs these scenarios (the owner's D353); after the walk, two models will read the finished code separately —
that is not your job here.

## Your job

Ask **what is MISSING**, not whether the code is right. The builder will walk the RUNNING production build with a scripted
real browser (Playwright, desktop 1440×900 and phone 390×844), reloading and reading the browser's storage after each step,
and your list is what that walk must cover. The builder's own tests share the builder's blind spots; yours should not.

> Do not merely review the changed code. Starting from the user promise and the applicable rulings, enumerate every
> qualifying object, renderer, visible door, writer, reader, downstream consumer, role, overlay and meaningful order of
> actions. **Assume every existing line may be correct and the defect may be a MISSING call site.** For each item, state
> where the visible sign and the working gesture should exist in the production app. Then rank concrete failure
> scenarios with setup, action, expected result, and the observation that would disprove correctness. Start with the
> least-shared or most specialised surface.

## What was built — the user promise

In the database a day may be written only by the scheduler holding it (the day lock, D450). Three actions used to write
days nobody asked them to; each now writes only its own record, and every day SHOWS the effect because it is worked out
when the day is read. **Nothing on screen is meant to change.**

- **(a) Handing a request to another man** (an admin changes the person on the Inputs page, or on the week's / board's
  request editor). Before: it cleared the old holder's OIL refusal (the OIL Earn mode's per-man switch about that request)
  off every loaded day AND every saved week. Now: the request counts its holdings (`Input.hand`, +1 per change of
  person) and records when it left each man (`Input.leftAt[pid]`); every per-man OIL decision about a request records the
  holding it was made under (`oild.pa`); the one door every OIL reader uses (`engine/oilev.ts oilEvidence` →
  `pruneHandedOverDecisions`) ignores a decision about a man the request has LEFT since it was made. The A → B → A case
  (a refusal made under A's first holding must not come back when the request returns to A) and the extra case (D18 — a
  man the scheduler put on the request's row as an extra keeps his refusal when the request is handed TO him) are the
  two the design turns on. OIL is earned leave, time off banked (D25) — a wrong answer is owed just the same.
  **Not in (a):** the hand-over still re-writes the request's LANDED ROW on its day (the "relink" in
  `ui/inputedit.tsx commitInputEdit`) — that is step (c)'s job, not built; do not report it.
- **(b) Filing a request under Unavailable** (the → Unavail button on a request's row, its undo, and Accept adopting a
  standing row). Before: it wrote an `inp:<day>.<id>` pending mark into the book of every loaded day the request
  covered. Now: nothing is written on any day; a published day's count, its pending list and its four sign-offs come
  from the filing itself (`engine/publish.ts filingDelta` against the issued version's `fil`), as they already did;
  Unpublish no longer re-opens `inp:` keys.
- **(d) Deleting a man** (Admin → Users → Delete, asked twice; or the posting-out pass on its date, the "Delete"
  outcome — `leavewar/sync.ts runPoOutcomes`, which can run inside a Leave War command). Before: it rewrote the loaded
  week through the funnel and every saved week from his cutoff on. Now: it writes his records only (`deletedFrom` = the
  cutoff: the later of the delete's date and today, D304); a new read-time overlay (`engine/overlay.ts
  overlayDeletedWeek`) takes him off every WORKING day on or after the cutoff wherever a week's days come into memory —
  the loaded week (`state/store.ts applyWeekModel`, and the boot's seed path in `initStore`), a saved week
  (`engine/weekstash.ts stashDays`, so the cross-week checks, the next-week peek and the row finder share it), a week
  never saved (`engine/weekctx.ts bundle`'s seed branch, `ui/peek.ts`'s seed fallback) — and on the week on screen AFTER
  the delete's command (a deferred effect, with the command layer's baseline moved on, so it is nobody's change and is
  saved only when the day's holder next changes that day). The delete still writes one change-history line per seat he
  held on the week on screen (D337). A landed request row goes with its request's CURRENT holder. The version-load belt
  (`state/person-delete.ts stripDeletedFromDay`, used by `engine/drafts.ts liveDay` — a version loaded onto the working
  copy, a saved plan switched in) is unchanged except that rule. Issued (published) versions are never overlaid (D299).

**Read, whole:** the plan `raptor-port/docs/superpowers/plans/2026-09-30-db-readiness-phase6-plan.md` (§0–§3 (a), (b),
(d), §5, §9 — the build log's "found on the way" lines are where a missing call site could hide); the round-1
dispositions `raptor-port/docs/superpowers/briefs/2026-09-30-db-readiness-phase6-dispositions-r1.md`; the design of
record `raptor-port/docs/data-model.md` §9 rule 9 and §11; `raptor-port/docs/undo-contract.md` §0 (a derived change is
made after its command); `raptor-port/docs/engine-rules.md` on the delete. The round-2 dispositions (`…-dispositions-r2.md`)
are about (c) only — context, not scope.

## What the walk can and cannot do (so your scenarios are walkable)

- It runs the production bundle (`vite preview`) on the **Browser backend** (localStorage, keys `raptor:<collection>/<id>`
  — a week is one row per day plus its book since group A), signs in `ad` / `a` (admin, Saber) or `us` / `us` (member,
  Ranger), and can read storage before and after each step (`page.evaluate`) — so "this act wrote exactly these rows, and
  no day row" is observable. The localhost probe bridge exposes `window.DAYS`, `window.INPUTS`, `window.PEOPLE`,
  `window.SCHED` and more for reading.
- **The clock can be fixed** (Playwright `context.clock.setFixedTime`). This matters for (d): the real date is 30 Sep 26
  and the demo weeks are Mon 13 – Sun 19 Jul 26 and Mon 20 – Sun 26 Jul 26, so with the real date a delete's cutoff lies
  after every demo day. Say what date each delete scenario needs (e.g. today = Wed 15 Jul 26: Mon–Tue kept, Wed–Sun and
  the second week cut).
- **Two people** = two tabs over one storage. The app does not re-read storage while open, so a RELOAD is the second
  client; say which of your scenarios a reload proves and which only a unit model of two clients can.
- The demo world: the first week has a weekend published or publishable, both weeks carry requests of every kind; a
  walk builds its state through the app's own controls (Edit Schedule, the scheduler board, the Inputs page, the OIL
  Earn mode and the ALL AVAIL window's OIL tab, Admin → Users, the Leave War's posting sheet).

## The rulings (a later one wins — D90)

Codex: nothing under `.claude/rules/` loads by itself for you — open them. Each area file holds one short line per ruling;
open a ruling's full row before relying on its detail (`grep -h '^| D297 |' .claude/decisions-full/*.md` in a shell).
- `.claude/rules/decisions/how-we-work.md` — **D467** (this check), **D465/D466**, **D453**, **D353**, **D148** undo is your
  own changes, **D350** what the one Undo does not take back (a delete, a posting), **D56**, **D54**.
- `.claude/rules/decisions/scheduler.md` — **D450** the day lock; **D44, D45, D103** (a published day: a change reads
  pending and its four sign-offs fall); **D177, D178, D179, D189** (a request change after publication is pending); **D174,
  D176, D114**; **D98**; **D363, D175** (a version load / plan switch); **D337** (the delete's history lines); **D338**;
  **D271**; the settled "Weeks remember their edits" and "Pristine weeks are deliberately NOT stashed" notes.
- `.claude/rules/decisions/oil.md` — **D25, D2, D142, D18, D43, D46, D48, D400**.
- `.claude/rules/decisions/people-accounts.md` — **D287, D290, D297, D299, D304, D321, D327, D229**.
- `.claude/rules/decisions/leave-war.md` — its §Architecture (the posting sheet, the posting pass).
- `.claude/rules/raptor-executor.md` — the implementation policy (never bypass the independent reviewer).

## Weigh especially

1. **The overlay's doors — a roll-call of every place a week's days come into memory or are read.** The builder names
   five doors (above). Hunt for a sixth: any reader of a day's seats, sign-offs, saved plans or OIL switches that reads
   a WORKING day of a week without going through one of them — e.g. the planning calendar, the Leave War's OIL / manning
   reads, the OIL tracker, the changes window's before/after, Admin → Data's export, a saved plan's 👁 preview, the
   week picker's markers, the validator's cross-week look-back (DAYS_RUN walks days before Monday; REST[0] reads last
   Sunday), anything that parses a saved week's rows itself instead of calling `stashDays`. For each: sees him gone /
   must not, because… / MISSING.
2. **Caches keyed on stored bytes** — a memo that serves a week read before a delete (`stashGroundBySrc`, the next-week
   peek's cache, `weekctx.ts bundleCache`, the OIL read pass, any render cache). Name each and whether its key moves with
   a delete.
3. **Every reader of an OIL per-man decision** — anything that reads `oild.people` without going through `oilEvidence`
   (the OIL Earn mode's pucks and their on/off state, the ALL AVAIL window's OIL tab, the OIL tracker, the Leave War's
   earned OIL, the publish freeze `d.oilev`, the pending axis `oilDelta`, `dayDiscardCount`'s raw compare, a saved plan, a
   version preview). After a hand-over, every one must agree with the money.
4. **Every reader of the old `inp:` marks** — the day head's count, the pending list and the changes window, the four
   sign-offs, "Discard marks", Publish / Unpublish / reissue, the AL tag or dot on the Unavailable panel, the history gold
   dot, Load onto working copy's "Discard N edits". Which of them silently depended on a mark that is no longer written?
5. **Orders.** Each act then Undo, Redo, reload; on a published day and a never-published one; A → B → A across weeks with
   the refusal on a week not on screen; a decision made AFTER a hand-over; extra → holder → away → back; a hand-over of a
   request covering a published day whose issued OIL block holds the refusal. For (d): the man on EVERY kind of seat (a
   flying seat, a desk holder and its extras, a sim seat / passenger / extra, a ground row's name and extras, a Common
   Programme name and extras, an OIL switch, a sign-off, a saved plan's day) on a published day to come, an unpublished
   day, a saved week not on screen, a week never saved, next week in the peek; the delete then an Undo of an EARLIER
   schedule edit (made before the delete — does the Undo put him back on a day to come?); the delete then Redo; the
   delete then a version load / a plan switch / a template; the delete then the day's holder edits that day, then reload;
   the posting pass's delete on its date (the clock moved past the posting date) joining a Leave War command; a request of
   his that SPANS the cutoff (ended the day before — its landed row on the days kept).
6. **Roles** — who may do each act, and that each act saves only rows that role may write (`data-model.md` §11; the
   ownership test in the state suites).
7. **What a reload proves** — the overlay and the in-memory result must agree: every "right after" check repeated after a
   reload, and a reload must write nothing (a load's overlay is never saved).

**What is NOT a finding (owner, D56):** this app is pre-promulgation and its entire stored world is DEMO DATA that will be
CLEARED before the database step. **Do not report a problem whose harm exists only in data already stored when the code
is already correct going forward** — no migration, no back-compat, no "an existing record would read wrongly". If the app
would do it again to NEW data, report it: that is a real finding and this exclusion does not touch it. Also out of scope:
step (c) (a request's row on its day worked out on read — not built; the relink, `removeInput`'s row drop and
`commitNewInput`'s landing still write a day, by design until (c)), group B (the lock, the 30-second check), phase 7, and
a difference from `main` the plan asked for.

## How to report

Write your report to `raptor-port/docs/superpowers/briefs/2026-09-30-db-readiness-phase6-check-scenarios-astra.md`
(the run also captures your final message there).

1. **A roll-call**: (i) every place a week's days come into memory or are read (the overlay's doors and any you find
   missing); (ii) every reader of an OIL per-man decision; (iii) every reader of the old filing marks — each with
   *has it* / *must not, because…* / *MISSING*, naming the file and function. No blank cells.
2. **A numbered list of walk scenarios**, ranked by how likely each is to find a defect, each with: **start state** (and
   the fixed date, for a delete), **the gestures in order** (in the app's words), **what the screen must show right after
   AND after the reload**, **what storage must hold** (which rows change, which must not — above all, no day row for a
   hand-over, a filing or a delete), and **what would prove it wrong**. A few lines each. Mark which need two tabs.
3. **Where you are sure a line is missing already** (from reading), the file and function, and **exact, step-by-step fix
   instructions** — not a direction.
4. **Explicit negatives**: what you checked and found nothing in.
5. **Questions only the owner can answer** (a product choice the code cannot settle), each with your recommendation.
