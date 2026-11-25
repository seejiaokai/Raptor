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

## Round 2 (added 25 Nov 26, after the fold of round 1) — for a reader of the REVISED plan

The plan was revised to its first round of reads (its §15 lists every finding and what changed). You are a fresh
reader of round 2, blind to the other two and to round 1's reports (do not open `*build1-read-astra*`, `-opus*`,
`-fable*`; the plan's own §15 is yours to read). Everything above stands. Look hardest at what no reader has seen:

- **The one check at the page door** (`state/store.ts setPage`, §4.1 and §4.5): does every road by which his own
  squadron comes back, or another is entered, by his own press now pass it — and does it refuse anything that changes
  nothing (a press that stays on the squadron in view), or anything a change he did not make needs (the midnight
  move, a right ended, sign-in, sign-out, the first load)? Which callers mark something (a line read, a list closed,
  a flag set) before they ask, and so leave a mark behind a refusal?
- **"Counted means drawn"** (§3.1): for each row, is the predicate named really the one the window is drawn from —
  and can any window now be on screen while its row says it is not (a door left open the other way)?
- **Each round-1 finding marked closed in §15**: closed in the body, or only in the table?
- **The build order (§10)**: does any step now leave the suite red or a door half-guarded; are the pins really green
  today and the failing tests really red today?
- **Part F, split**: are security F1 and F2 closed by the doors alone, before the root lands?
- **New questions N7–N11 and the changed N1, N2, N4**: is any built on before he answers; is a recommended answer one
  that cannot be built or that traps a person?

Same form of finding, same severities, same "not a finding" list. Report file and final message as your prompt says.

## Round 3, the last (added 25 Nov 26, chat 176, after his answers were folded in and `main` was brought in)

The plan was revised again: his answers of 25 Nov (D2596–D2599, D2620–D2636 — read each full row; they are settled and
NOT under review) are folded into its body, §17 lists them with every reading of the agent's and every clash, §18 adds
what rides Build 1 (part G), and §19 splits out **Build 1V — separate squadrons, separate views (part V)**, a build of
its own. `main` was brought into the branch before this read: every claim about today's code is to be checked against
the code as it now stands, not as the plan's earlier rounds read it. You are a fresh reader, blind to the other readers
of this round and to every earlier round's reports (do not open `*build1-read-*`, `*build1-read2-*`, nor the briefs
`*q3-fold-*`, `*q3-merge-*`; the plan's §15 and §16 are yours to read). Everything above stands, with these changes:

- **Builds 2 and 3 and group B** (Logout, Undo by squadron, the refresh card) are still not in this plan, except one
  Undo the plan itself names (row 21 — Undo of "+ New squadron"), put to him as a question.
- **His open questions now** are those of the questions page's round 5 —
  `raptor-port/docs/mock/2026-11-25-msq-pick-guard-q3/page.html`, group E (E1–E9) and group D (the looks to confirm) —
  and the plan's §8 rows still marked open. They are his: do not answer them; DO say where the plan builds on one as if
  answered, and whether each is shaped so either answer is a small change.
- **Three squadrons, always (his D2630):** test every case with 142, 149 and 150, and a person holding rights in several
  (Hunter: 142's admin, Plan of 149, View of 150; Saber a master admin, home 142; Kestrel 149's admin; Mako 150's). Name
  any rule, test or walk step that assumes "the other squadron", one of two.

Look hardest at what no reader has seen:

1. **Part V's permissions (D2625, D2626, D2629, D2631, D2635):** after Build 1V, can a Plan holder of 149 still give,
   end or pass on Plan of 149 by any road — the access line, Undo or Redo of a give, a save that writes several lines
   at once, the commit gate, a stale screen, a row opened before his own rights changed? Can anyone change anything of
   another squadron's man but that squadron's access line from that squadron's page? Who sees the folded headings, and
   can a View holder or a member reach them?
2. **His D2621 (his own inputs off another squadron's Inputs page):** every road to his own 142 input while 149 or 150
   is picked — the list, the calendar's card, "OIL?", the bell, search, a Leave War link, the Scheduler Board, Undo —
   does each now bring 142 into view first or not offer it at all? Is a man who has moved, or who holds only View of his
   old squadron, ever left with an input he must answer and no page that shows it?
3. **The split:** can Build 1 be merged and used for days without Build 1V without a harmful half-state (a door
   refused whose way out is a part-V control; a record written under the wrong squadron's bar; a bell line pointing
   to a screen that does not exist yet)? Name the presses.
4. **The new rows of part G:** the windows that close by themselves (D2596, D2597) — can any of them hold something
   typed or chosen and not saved, and so lose it at a pick? "+ Add a person" counted by the guard and its Cancel; edit
   modes ending at a pick; the fades running at a change he did not make.
5. **Bug reports becoming saved records (§19):** whose reports does each person see, and does a report carry anything
   of another squadron that a reader of it should not see?
6. **Every statement about today's code**, against the code as it now is (`main` brought in). Name each that is wrong,
   with the function.

Same form of finding, same severities, same "not a finding" list. Report file and final message as your prompt says.

**The security reader (his D1411)** reads this round only for holes: what one person can see or change of another
squadron, or of another person, that the rulings do not allow — Plan given or ended, the access line, another
squadron's rows on Admin → Users, bug reports, bell lines, the Inputs page — before and after Build 1V. Not usability,
not wording.
