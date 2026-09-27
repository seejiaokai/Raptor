# The absence-record re-test — the final code read (26 Sep 26)

For Fable 5.1 and Astra (Codex), each reading ALONE — never shown the other's report. Bug-check order §4 rank 2
(both providers, independently: this work touches saved data, published records, permissions and what a man is owed).
The walk went first (§4a); you get the finished code AND the evidence sheet.

## What you are reading

Branch `claude/absence-record-d147-af6a50`, the diff `main...HEAD` under `raptor-port/src` (cut from `main` at
`e27e15fe`). It is a re-test, not a feature: the absence record (one absence = one Inputs row; the Leave War derives its
cells from it) was walked end to end by a host and five walkers at phone and desktop width, and every defect found was
fixed, each with a test that failed first. Read, in this order:

1. `raptor-port/docs/handpass/2026-09-26-absence.md` — the evidence sheet: §3 lists every finding (AB1–AB10, W1-F…,
   W3-F…, W4-…, W5-F…) with what was done. The walkers' own sheets are `raptor-port/docs/handpass/parts/2026-09-26-absence-w{1..5}.md`.
2. `raptor-port/docs/superpowers/specs/2026-09-20-one-absence-behaviour-register.md` — the rules (N1–N19, B1–B9, §7,
   §8), §11 (rulings since, D166–D215) and §12 (the absence record as it now behaves, finding by finding).
3. The rulings of the areas this touches: `.claude/rules/decisions/leave-war.md`, `.claude/rules/decisions/scheduler.md`
   (D177–D179, D185, D189), `.claude/rules/decisions/oil.md` (N19, D79–D82), and `.claude/rules/decisions/how-we-work.md`
   (D148, D166, D211–D215). Newest wins (D90).
4. The code: `git diff main...HEAD -- raptor-port/src`. The files that carry the fixes: `leavewar/sync.ts`
   (`sliceInput`, `undoPostOut`), `leavewar/state/store.ts` (`postingProblem`, `restoreBlocker`, `clearRequestsAt`,
   `setBidStates`' `already`, `editManualCredit`'s code, `cellProblem`'s hours), `undo/timeline.ts` +
   `state/undo-wire.ts` (the `restoreRefusal` hook), `leavewar/ui/{Matrix,BidPicker,SelectSheet,Sheet,DayList}.tsx`,
   `leavewar/ui/select.ts`, `leavewar/engine/dayview.ts`, `ui/{inputedit,InputsPage,MedMoveConfirm,App}.tsx`,
   `ui/caldrag.ts`, `ui/export.ts`, `ui/pops.ts`, `ui/scheduler.css`, `engine/inputs.ts`.

## The brief (bug-check order §4, verbatim)

> Do not merely review the changed code. Starting from the user promise and the applicable
> rulings, enumerate every qualifying object, renderer, visible door, writer, reader, downstream
> consumer, role, overlay and meaningful order of actions. **Assume every existing line may be
> correct and the defect may be a MISSING call site.** For each item, state where the visible sign
> and the working gesture should exist in the production app. Then rank concrete failure scenarios
> with setup, action, expected result, and the observation that would disprove correctness. Start
> with the least-shared or most specialised surface.

> This app is pre-promulgation and its entire stored world is DEMO DATA that will be CLEARED before
> the database step. **Do not report a problem whose harm exists only in data already stored when
> the code is already correct going forward** — no migration, no back-compat, no "an existing
> record would read wrongly". If the app would do it again to NEW data, report it: that is a real
> finding and this exclusion does not touch it.

## The questions that matter most here

Each fix closed ONE door the walk found. The defect this kind of fix leaves behind is the SAME defect at a door the walk
did not reach. For each fix, list every other door that does the same job and say whether it now behaves the same:

- **"till" on a cut (AB3):** every path that shortens, splits, moves or trims a leave or a medical — does each surviving
  piece carry its own last day? (`sliceInput` is said to be the one body; is it?)
- **A medical moved asks its questions (AB4):** every door that moves or re-dates a medical or an upchit — the calendar's
  drag, the schedule's reassign, the edit window, the Inputs table, anything else.
- **A posting that closes before it opens (AB5, W3-F4) / the posting sheet pinned (W3-F5) / Undo post out (W5-F1):**
  every door that sets, moves or clears a post-in or post-out date, and every door that archives or restores a person.
- **Restore obeys the bid rule (W3-F8):** every restore path — the top bar's Undo / Redo, the war's own, a restore of a
  whole group, the Inputs page's — and every record a restore can put back over an absence (requests; anything else?).
  Is a legitimate undo ever refused? Is the check read against the right war?
- **A war switch closes the open cell; sheets hold the keyboard (W5-F3, W3-F7):** every sheet or popup on the Leave War
  that acts on a war's day, and every road to a war switch.
- **Bulk (AB7, W3-F3):** every bulk action over a dragged block — Fill, Approve, Refuse, Ack, Delete, Move, Post out —
  and whether each reaches the war's own requests beneath a filed absence and counts truthfully.
- **An award's code follows its days (W3-F6):** every door that changes an award's days.
- **Read only for a member (W1-F3):** every door into an input's edit (the calendar, the table, the schedule, the
  document viewer's Edit / Upchit, the Medical view) — a member opening another man's input.
- **Anything the fixes themselves broke:** a fix that changed a shared function (`setBidStates`' return, the Sheet's
  keyboard handling, the phone-hold swallow in `select.ts`, the timeline hook) — every caller.

## What to hand back

A ranked list of findings. For each: the setup, the action, what happens, what should happen and by which ruling, the
file and function, whether it is new on this branch or already on `main` (compare against `main` — `git show
main:<path>`), and **exact, step-by-step fix instructions** (not a direction). Then **explicit negatives**: for each
bullet above, "I checked X and found nothing" where that is so. Write your report to the file named in your prompt.
Read only — change no file but that report.
