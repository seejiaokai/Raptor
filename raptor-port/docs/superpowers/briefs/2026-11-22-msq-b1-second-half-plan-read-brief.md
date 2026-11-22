# Red team of batch 1's second-half plan — the readers' brief (chat 138, 22 Nov 26)

**First line for every reader: you read an exported copy. Do not read `HANDOFF.md`'s `claude/msq-b1-screens-135`
block (it is replaced in your copy by one line) nor any other reader's report. You are one of two readers, blind to the
other. Read only — change no file.**

## What you are reading

The technical plan `raptor-port/docs/superpowers/plans/2026-11-22-multi-sqn-b1-second-half.md`: the screens of the
multi-squadron build's batch 1 — edit rights by squadron (step A), the "142 ▾" Schedules menu (B), Admin → Users by
squadron (C), Request access asking the squadron (D), Admin → Squadrons (E), the bell (F), a sign-in waiting for the last
save (G). Nothing of it is built. The design it builds is approved by the owner: the page
`raptor-port/docs/mock/2026-11-22-msq-b1-screens/page.html` (its text; its pictures are left out of your copy) and his
rulings D2297–D2311.

## Read these (none loads by itself for you)

- The rulings that bind it: `.claude/rules/decisions/people-accounts.md` (§Roles and permissions, §Admin → Users, §Many
  squadrons), `.claude/rules/decisions/scheduler.md` (§Not built yet), `.claude/rules/decisions/how-we-work.md`. A
  ruling's full row: `grep -h '^| D2303 |' .claude/decisions-full/*.md` (the shell; any number).
- The plans it continues: `raptor-port/docs/superpowers/plans/2026-11-17-multi-sqn-build-batches.md` §3,
  `…/2026-11-19-multi-sqn-b1-rest-files.md`, `…/2026-11-20-multi-sqn-b1-reshape.md` §19 and §19b.
- The roles table and its proofs: `raptor-port/docs/superpowers/briefs/2026-11-22-msq-roles-table.md`.
- The code (under `raptor-port/src/`): `state/perms.ts` (`pageUnit`, `adminOfPage`, `maySchedEditPage`, `mayEditSched`,
  the commit gate's §6, §7, §7e), `state/auth.ts`, `state/store.ts` (`switchUnit`, `enterSquadron`, `entryDue`),
  `state/accounts.ts`, `state/units.ts`, `state/units-model.ts`, `state/lastadmin.ts`, `state/notices.ts`,
  `state/noticeseen.ts`, `leavewar/sync.ts` (the line builders and the posting runner), `tracker/storage.js`,
  `ui/UsersPanel.tsx`, `ui/AccessScreen.tsx`, `ui/AdminPage.tsx`, `ui/topbits.tsx`, `ui/Shell.tsx`, `ui/SchedBoard.tsx`,
  `ui/Login.tsx`, `test-support/msq-world.ts`; `raptor-port/docs/data-model.md` §11.

## What to look for — what is MISSING or WRONG, not style

1. A ruling (D2297–D2311 and the earlier ones the plan cites) the plan leaves out, builds differently from its words,
   or contradicts — and the step where it belongs.
2. A place in the code the plan's steps would leave behind: above all **step A** — an edit control a person with View
   only of another squadron could still reach once the menu exists, or an own-page control the plan would wrongly tie
   to the schedule's squadron; and any reader of "the squadron" the menu's pick would now make wrong.
3. **Step C's one Save** (`saveAccess`): a check of the existing doors it would skip or apply in the wrong order; an
   Undo it would split or merge wrongly.
4. **Step F's audiences:** a line that would reach the wrong person, never reach the right one, or stay on a bell it
   must leave (D2310, D2218); the gate refusing a line the plan needs; the new `acct` line letting anything else through.
5. **Step B's Tracker spike, step E's one-command "+ New squadron", step D's request audience** — what could break.
6. A test the plan needs and does not name; a walk it needs and does not name.
7. Something new on screen the plan builds without a drawing (the owner's rule: anything new he will see is drawn
   and shown first).

## What is not a finding

- A problem that lives only in data already stored (all of it is demo data, cleared before the database step), where
  the code going forward is correct (D56).
- Style, naming, size, or a different way to do something the plan already does correctly.
- Anything about a scheduler who is not an admin (a scheduler is always an admin, D785).
- Detachments, borrowing, Transfer to Sqn, D2220's lines to others — later batches.

## How to report

Numbered findings, most serious first. Each: **what goes wrong** (a concrete case — who, which squadron, which press),
**its cause** (file and line, or the plan's section), **the fix** (exact, step by step, so another builder can apply
it). A claim without a concrete failure is not a finding. End with one line per plan step: holds / holds with the
findings named / does not hold.
