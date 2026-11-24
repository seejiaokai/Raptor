# The guard rail's Build 1 plan — its red team (D353, D1760, D1770; chat 175, 25 Nov 26) — one brief, blind readers

**If you are reading an exported copy: this branch's `HANDOFF.md` block and the plan writer's own notes were taken out
of it on purpose; ignore any handoff block you meet, and say so.**

An important plan on permissions and saved data is read before anything of it is built by Astra, a fresh Opus reader
and a fresh Fable (high risk), each blind to the others. You are one of those three. READ ONLY: change no file (a
proof test, if you run one, only in your own scratch folder, or placed temporarily and deleted before you finish);
commit nothing. Do not open anything named `*msq-pick-guard-build1-read-*` other than this brief (the other readers'
reports), nor `*build1-plan-brief*` (the writer's brief). **State each finding in your output the moment you have
it** — a run can be stopped by its service. Return the whole report as your final message, under 1,800 words, most
important first.

## What you are reading

A PLAN, not code: `raptor-port/docs/superpowers/plans/2026-11-25-msq-pick-guard-build1.md` — Build 1 of the squadron
switch guard rail: (A) one answer to "what is open"; (B) the doors refuse — a pick of another squadron, the switch to
or from the member view, a bell line or bell tap to another squadron — while a window is open or a change is not
saved, with the grey "Blocked:" note; (F) the Input window records the input's own squadron. Builds 2 and 3 (Logout's
questions, the refresh card and the removal of the greyed windows, Undo by squadron) are NOT in this plan.

His rulings are settled and NOT under review: `grep -h '^| D2403 |' .claude/decisions-full/*.md` (the shell —
likewise D2405, D2590, D2591, D2592, D2593, D2594, D2595). The questions he has not yet answered (the plan's "switch
points" — H2, H3, H7, H8, H11 of `raptor-port/docs/superpowers/briefs/2026-11-24-msq-pick-guard-scenarios.md` §2 and
the calls of its §3) are his, not yours: do not answer them; DO say where the plan builds on one as if answered.

Read:
1. The plan, whole.
2. What it must deliver and close: the backlog items `[MSQ-PICK-GUARD]` and `[MSQ-NIGHT-153-OPEN]` (its item (1),
   security F1 and F2) in `OUTSTANDING.md`; the sizing file `raptor-port/docs/superpowers/plans/2026-11-24-msq-pick-guard-build.md`;
   what today's app does, `raptor-port/docs/superpowers/briefs/2026-11-24-msq-pick-guard-press-report.md`; the walk's
   scenarios it will be checked against, `…/briefs/2026-11-24-msq-pick-guard-scenarios.md`.
3. The promise: `.claude/rules/decisions/people-accounts.md` (§Many squadrons), `.claude/rules/decisions/design.md`
   (the passing note, questions, menus and the keyboard).
4. The code, as the plan's claims need — at least `raptor-port/src/state/pick.ts`, `state/store.ts` (`enterSquadron`,
   `switchRoleView`, `maybeReenter`, `entryDue`, `refreshAccess`, `publishBands`), `state/belltap.ts`, `ui/topstate.ts`
   (`bellTap`, `openNotice`), `ui/pops.ts`, `ui/FloatWindow.tsx`, `ui/InputWindow.tsx`, `ui/OilDayList.tsx`,
   `ui/UsersPanel.tsx`, `ui/toast.ts`, `ui/savestatus-source.ts`, `ui/SquadronMenu.tsx`, `ui/Drawer.tsx`,
   `ui/Shell.tsx`, `leavewar/ui/Sheet.tsx`, `state/typing-hold.ts`, `tracker/role.js`, `tracker/TrackerPage.tsx`,
   `tracker/app/core.js` (never whole: grep the names the plan cites and read each function and its callers whole).

## The ask — what is MISSING, not whether the plan reads well

1. **A missing door.** List, from the code and not from the plan's table, every way the squadron in view or the view
   (admin / member) can change by the person's own press — every caller of `enterSquadron`, `switchRoleView`,
   `pickSquadron`, `enterForLine`, `openBellRequest`, and anything that sets the same state another way (a page tab, a
   link, a key, a chip, the Scheduler Board, a reload). For each: does the plan guard it, or say why not? Name any it
   missed.
2. **A missing window.** List, from the code, every window, sheet, pop-up, question card and inline editor the app can
   have open (the Tracker's own included — they are known only inside the Tracker's code). For each: does the plan's
   "what is open" know it? Would a window added next month be caught by the plan's own test, or pass silently?
3. **Is each statement the plan makes about today's code true?** It was written from reading, nothing run. Name any
   that is wrong, with the function.
4. **What will it break?** A pick with nothing open; the Tracker's question at a pick (three answers); a pick while a
   menu or list is open; the squadron already in view picked; a bell line of his own squadron; a change he did not
   make (his move at midnight, a right taken away) while Build 2 is not yet built — the greyed windows and bands still
   exist then: does Build 1 leave that half-way state working?; sign-out; a member with View only; a waiting person;
   nobody signed in; Undo and Redo; a save that lands or fails just after a refusal. Name the order of presses and the
   expected result.
5. **A guard that traps him.** Any state where every door is refused and nothing on screen can be closed or retried —
   a flag left set by a window that closed another way (Escape, a route change, an error, a hot reload of the
   Tracker), a "Not saved" that can never clear, a window hidden behind another page. Name the presses.
6. **Part F.** Does recording the input's own squadron close security F1 and F2 for every route into the Input window
   and the OIL list — the bell's OIL tap, 142's OIL list left open across a pick, a link from the Leave War, the
   Scheduler Board — and every write the window makes (Save, Delete, the OIL answer, a document)?
7. **The order of the build:** is any step built on one not yet built; does any step leave the suite red or the app
   half-guarded in a harmful way; is a failing test described too loosely to write, or one that would pass today?
8. **Anything a person would see change** that is not in his rulings and is not marked as a question for him — the
   plan must build no note's wording and no reading of his rulings on its own (his D2611). Name each place it does.
9. **A safer or simpler cut**, if you see one, with its cost.

A finding needs a concrete failure (who presses what, what goes wrong on screen or in saved data), its cause in the
plan or the code, and its exact fix to the plan (D489). Severity HIGH / MEDIUM / LOW — HIGH: a door left open (a
switch that goes through with a window open or a change not saved), one squadron's record written from another's
window, typed work lost unasked, or a person trapped. Give explicit negatives ("I checked X and found nothing").

**Not a finding:** a problem living only in data already stored — the whole store is demo data, cleared before the
database step (D56); a scheduler who is not an admin (D785); what Builds 2 and 3 are filed to do, unless Build 1 makes
it worse or cannot be merged without it; what only a real iPhone can show (list those separately, as looks for his
phone).
