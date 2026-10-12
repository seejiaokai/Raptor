# The brief — Fable's read of the FINISHED CODE of the one-rule job (`[ALL-AVAIL-AS-MEMBER]`) — 12 Oct 26

**Asked on the owner's word (D758, D764):** Fable is this job's independent reviewer — it read the plan (11 Oct 26) and
reads the finished code. Opus 5.5 planned and built it; you did not write any of it. **Read-only: change no file, run
no build, no gate, no browser, no git command that changes anything.** (You may run `git diff`, `git show`, `git log`,
`grep` and read files. You may run ONE unit-test file at a time with `npx vitest run <file>` from
`C:/Users/User/projects/Raptor/raptor-port` if a claim needs proving — never the whole suite, never Playwright.)

## What to read
1. **The plan, whole:** `raptor-port/docs/superpowers/plans/2026-10-11-one-rule-plan.md` — §1 (his rulings), §4 (the
   design), §6 (the tests it carries), §7 (the roll-call), §8 (the readings told to him, R1–R18), and **§10 — what each
   step actually built and where it left the plan's letter** (R19–R37 are there). Your own read of version 1:
   `raptor-port/docs/superpowers/briefs/2026-10-11-reads/one-rule-plan-fable.md` (F1–F16 — check each was really built
   as taken).
2. **The check's sheet so far:** `raptor-port/docs/handpass/2026-10-12-one-rule.md` §§1–6 — the eight answers, the
   rulings, **the roll-call of 44 places (§3)** and the door check (§4). The walk of the running app is under way as
   you read; you are NOT shown what it finds, and you must not open `raptor-port/docs/handpass/parts/or-*` or
   `raptor-port/docs/img/handpass/2026-10-12-one-rule/`.
3. **The code:** the branch `claude/all-avail-as-member` at `41752a24` against the commit it was cut from —
   `git diff 7c1fcdc0 41752a24 --stat -- raptor-port/src` (191 files), then the live files themselves, whole where
   they matter: `engine/inputs.ts`, `engine/inputown.ts`, `engine/overlay.ts`, `engine/oilev.ts`, `engine/publish.ts`,
   `engine/canonical.ts`, `engine/slots.ts`, `engine/grouprows.ts`, `engine/events.ts`, `engine/avail.ts`,
   `engine/weekctx.ts`, `engine/medical.ts`, `engine/keys.ts`, `state/perms.ts`, `state/store.ts`,
   `state/sched-commit.ts`, `state/notices.ts`, `state/noticeseen.ts`, `state/person-delete.ts`, `state/changelines.ts`,
   `state/view.ts`, `state/undo-wire.ts`, `undo/timeline.ts`, `undo/derive.ts`, `leavewar/sync.ts`,
   `leavewar/inputgate.ts`, `ui/inputedit.tsx`, `ui/reqdoor.ts`, `ui/board.ts`, `ui/drag.ts`, `ui/interactions.ts`,
   `ui/html.ts`, `ui/board-html.ts`, `ui/peek.ts`, `ui/topbits.tsx`, `ui/pendlist.ts`, `ui/oilmode.ts`,
   `ui/InputsPage.tsx`, `ui/InputsCal.tsx`, `ui/inputscal-model.ts`, `ui/inputcard-model.ts`, `ui/InputCard.tsx`,
   `ui/PeoplePick.tsx`, `ui/histbubble.ts`, `ui/changesmodel.ts`, `ui/sanscal-model.ts`, `ui/SansDay.tsx`. The guard
   test `engine/inputs-readers.test.ts` is the builder's own map of what reads what — attack the map itself.
4. **The rulings:** `.claude/rules/decisions/scheduler.md`, `oil.md`, `people-accounts.md`, `how-we-work.md` (one line
   each); a ruling's full row before you lean on its detail — `grep -h '^| D755 |' .claude/decisions-full/*.md` (the
   shell's grep). The reference documents where a contract is stated: `raptor-port/docs/engine-rules.md`,
   `ui-contracts.md`, `undo-contract.md`, `data-model.md` §11, `feature-impact.md` (search them; do not read them whole).

## What is asked — the finder's question, word for word (the checking guide's §4)
> Do not merely review the changed code. Starting from the user promise and the applicable rulings, enumerate every
> qualifying object, renderer, visible door, writer, reader, downstream consumer, role, overlay and meaningful order
> of actions. **Assume every existing line may be correct and the defect may be a MISSING call site.** For each item,
> state where the visible sign and the working gesture should exist in the production app. Then rank concrete failure
> scenarios with setup, action, expected result, and the observation that would disprove correctness. Start with the
> least-shared or most specialised surface.

> This app is pre-promulgation and its entire stored world is DEMO DATA that will be CLEARED before the database
> step. **Do not report a problem whose harm exists only in data already stored when the code is already correct
> going forward** — no migration, no back-compat, no "an existing record would read wrongly". If the app would do it
> again to NEW data, report it: that is a real finding and this exclusion does not touch it.

**And read for WRONG lines where a wrong answer is owed or lasting** — these are the places a silent fault would cost
most, attack them first:
1. **OIL:** one claim an input; who earns (every named person, every crowd man not named, on the one answer; the
   scheduler's three-state switch over it); a switch-off that must END (a person leaves; the placeholder is taken off
   and put back; the swap) and one that must SURVIVE (a named person leaves beside ALL AVAIL); the swap's void; a
   cancelled or information-only input earning nobody on every day it covers; the legacy reader of a block frozen
   before the build; the evidence key (does anything read pending for ever, or never?).
2. **The published day:** the people step of the count (each KIND of change is one, a swap one, a same-day move one,
   a cancel-and-back none, a split two with its cause, a several-day input on every published day it covers); "never
   zero while the delta is not"; what `daySnap` freezes and what an issued face reads; a load re-making rows from the
   live input; "Discard N edits".
3. **Saved data and Undo:** the record's invariants at every write (the door, the gate, Undo's restore, a replay);
   both stored shapes read everywhere (`peopleOf`); a notice made inside its command and gone with its Undo; the read
   record never an Undo step and never blocking another person's Undo; anything written OUTSIDE a command (it is not
   saved — `raptor-port/CLAUDE.md` §The persistence funnel); a nested command telling twice or not at all.
4. **Who may:** `perms.ts` against `docs/data-model.md` §11 row by row for `Input`, `Notice`, `NoticeSeen`; the
   member's commit gate (a forged `by`, another person's entry, a mark, an OIL answer); `ownPart`; the only-named-man
   rule with and without a placeholder beside him (D770); the filer's right ending and passing (`byAfterLeaving`);
   every hand on a row behind `canEditSched()`.
5. **The readers:** any body that asks about ONE MAN'S day and still reads the record (it would see an input and not
   its people — silently), on the working copy AND on an issued face; any writer that could be handed a frozen line.

## Not findings — do not spend time on them
- Harm that lives only in stored demo data (the quoted rule above; D56).
- **D773 (ruled during this check): the Inputs List's "Export to Excel" button and the file it writes are being
  REMOVED** — do not review `ui/export.ts`'s input lines or the button.
- Step 8's second pass is still owed and known: source comments that still name removed code (`commitGroup`,
  `oilSummaryOf`, the four deleted files), and behaviour-register ids for the new behaviours.
- The readings R1–R37 are told to the owner as built; report one only if the CODE does not do what the reading says.
- Two different devices never see each other's changes in this build (no shared data yet).

## How to report
- **A claim is a finding only with a concrete failure, its cause and its exact fix** (D489): the steps a person takes
  in the app (or the exact call), what happens, what should; the file and function; **step-by-step fix instructions
  precise enough to build from** — never a direction. Rank most serious first; say for each whether a wrong answer is
  SILENT.
- **Compare against the base (`7c1fcdc0`) before calling anything newly introduced**, and say which it is — new,
  older and now reachable, or older and unchanged.
- **Explicit negatives:** for each of the five areas above and each of F1–F16, write "I traced X and found it sound",
  naming what you traced. An area you did not open: say so.
- **The roll-call:** for each of the 44 rows of the sheet's §3, one of: the source wires it (name the call) / the
  source does NOT wire it (a finding) / not opened. And name any place the app draws, counts or writes an input that
  the 44 rows MISS.
- **Missing scenarios:** what a walker must still drive in the running app that the brief
  `raptor-port/docs/superpowers/briefs/2026-10-12-one-rule-walk-brief.md` does not (you may read that brief — it holds
  no results), each as a person would do it, with what must be seen.
- End with a verdict: CLEAN / CLEAN WITH THESE EXACT CHANGES / NOT CLEAN — and what, if anything, must be fixed
  before the owner's "merge live". Return the whole report as your final message; the host saves it, unedited.
