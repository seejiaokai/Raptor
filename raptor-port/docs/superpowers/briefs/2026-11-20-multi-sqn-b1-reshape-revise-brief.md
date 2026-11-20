# The reshape plan's revision — round 1's three reports folded in (chat 125, 20 Nov 26)

You are a fresh Opus reviser. You did not write the plan and you have not seen this chat. His D2238 (*"reshape and
fable"*): batch 1's open multi-squadron faults are fixed by first reshaping where their families come from; the plan is
read blind by Astra, a fresh Opus reader and Fable before anything is built. Round 1 of that read is done. Your job:
**revise the plan by the three reports**, so that round 2 (the same three readers, blind) finds as little as possible.

Work in `C:\Users\User\projects\Raptor-msq` (branch `claude/multi-sqn-b1-107`). **Write one file only:** the plan,
`raptor-port/docs/superpowers/plans/2026-11-20-multi-sqn-b1-reshape.md`, revised in place (git keeps round 1's version,
`cbdccbd71`). Change no other file; run no git command that writes (no commit, add, stash, switch, reset); build and run
nothing that rebuilds `dist` (no `npm run build`, no Playwright). Reading code and running a single unit test file with
`npx vitest run <file>` is allowed if a claim needs it. Never read a file over ~300 lines whole — grep it, read slices.
**State each decision in your output as you make it** (a run can be stopped); return a short summary at the end.

## Read first

1. The plan as it stands (round 1).
2. The three reports — all three, whole: `raptor-port/docs/superpowers/briefs/2026-11-20-multi-sqn-b1-reshape-read-{fable,astra,opus}.md`,
   and the brief they were given, `…-reshape-read-brief.md` (round 2 gets the same brief; your plan must answer it).
3. As the findings need: the evidence sheet `raptor-port/docs/handpass/2026-11-18-multi-sqn-b1.md` §Fix read 17 (the 35
   and the seven families); the proofs `raptor-port/docs/superpowers/briefs/2026-11-20-multi-sqn-b1-repro/` (README);
   `.claude/rules/decisions/people-accounts.md` §Posting out and §Many squadrons and aircraft types; the scheduler's bell
   lines (D2194, D2195) in `.claude/rules/decisions/scheduler.md`; `raptor-port/docs/data-model.md` §11; the batch plan
   `raptor-port/docs/superpowers/plans/2026-11-17-multi-sqn-build-batches.md` §3.1, §3.4; the transfer design
   `raptor-port/docs/superpowers/specs/2026-11-16-multi-sqn-detachment-design.md` (its §The transfer sheet, about line
   440: "His access to 142 ends" on the transfer's date, put to him as round 6's recommendation and taken whole by D2160).
   A ruling's full row: `grep -h '^| D2203 |' .claude/decisions-full/*.md` (the shell).
4. The code each finding names — verify every claim there before you fold it in.

## What to do

1. **Every finding gets a line** in a new section, "§16 Round 1's findings and what the plan did" — a table: reader and
   id (Fable F1–F12, Astra 1–7, Opus H1, H2, M1–M6, L1–L7) → **taken** (where in the plan, how) / **taken another way**
   (why) / **not taken** (the concrete reason, checked in the code). A finding is never dropped silently. Where two or
   three readers found the same thing, one row may cover them, naming each.
2. **What all three agree on is taken** unless the code shows it wrong: the war's dated stint kept apart from saved
   postings (never written into `postOuts`, never read by the posting tag), with `setPeople` and `reprojectRoster`'s
   carry-over path changed to match — R1 is now fixed on this branch (`19608876a`), so `leavewar/state/store.ts` is free
   to change; Undo and Redo across a squadron change made safe — every Leave War and Tracker step stamped with the
   squadron loaded when it was made and judged by it, as a prerequisite built before the midnight swap is switched on
   (D148: his history is kept, never cleared as a shortcut); the foreign posting pass's whole chain — its gate check
   reading the other squadron's stored posting, the man's home, the bell's readers as that squadron's admins, run only
   in the pass's own command (never joined to another's), its delete through the foreign war, its speed bounded; B1's
   writer for another squadron's planning calendar (rolled back whole on a refusal) and its narrowly bounded gate line;
   the move exception's exact constraints (if a move exception survives your Piece B choice); a new squadron's first
   admin able to move in; Undo and Redo of "+ New squadron"; the missed callers (`oilOpenOn`, `holidayLeft`,
   `atWarHome`, `ownSchedulerIds`, `noticeLeftBell`, `restoredDayHolds`, `perms.ts` ~1243, `editlog.ts` ~449,
   `changelines.ts` ~635 — confirm each and add any more you find); a body that writes never iterates the "touches"
   list (Fable F4); the midnight check fired by the existing midnight wake and on focus, never only by a click.
3. **Astra 6** (the Inputs calendar's notes and day titles, and its write permission, still following the pick): verify;
   if right, give the calendar's reads, writes, change capture and Undo an owning squadron, shared with B1's writer.
4. **Piece B — choose the cut.** Three are on the table: (i) round 1's — a move writes a dated end (`to`, `endedBy`) on
   save; (ii) Fable F12 — no stored end, a reader rule: a right holds only inside the home stint that holds its `from`;
   rights then end at the start of the move day, not on save; (iii) the Opus reader's — no dated grants at all; R3 by the
   timeline vouching for a verified Undo, R2 refused, R4 by refusing a right for a man with a move ahead. Weigh each
   against D2203, D2119/D2160 (a move counts from the next day's start), the transfer design's "His access to 142 ends"
   on the date, batch 4's months-ahead transfer, D148, the bell's retired-line cases (fix reads 7–12), how many of the 17
   grant readers each one touches, and how many round-1 findings each removes by construction. **Recommend one, with
   its reasons and costs, and build the plan on it.** Add a short section of what changes if he picks another. If the
   recommendation changes a ruling's timing or anything a person can see, it becomes one of his questions (§12) — say so,
   with the worked example (a named man, a date, what the screen shows before and after).
5. **Anything new a person would see** needs a drawing shown to him first (D1625): name each in §11 with what it shows.
   At least: A1's moved man's row on his old squadron's Leave War (check first whether round 6's or round 7's transfer
   pictures already draw it — `raptor-port/docs/mock/2026-11-17-multi-sqn-r6/`, `…-r7/` and their draw scripts); what
   happens at the midnight swap to a Leave War window left open with typed work, and to an unsaved Tracker chart edit
   (define the behaviour — never silently discarded, never saved into the new squadron — and the words shown).
6. **The order and the split (§10):** redo it with the new prerequisites (squadron-stamped Undo before the swap; the
   foreign pass's gate work before its caller; B1's gate line and writer in the core's phase; `store.ts` for A1;
   `boot.ts` with one owner). No two jobs built at once share a file; say who owns each shared file.
7. **His questions (§12):** bring the list up to date — C3, C5, R2 (moot or not, by your Piece B choice), A7, B2's
   stop-gap or wait for step 5, the Piece B timing if it changes, A1's look, the midnight swap's words. Each with its
   recommendation, the reason, what the app does until he answers, and one worked example a non-technical reader can
   follow (a named man, a date, what he sees).
8. **Keep:** the 35's accounting adding up (say if a count moves); the held list's reasons; "For him, in five lines" in
   plain words (no file or function names there); the ground rules (§0). Keep the plan as short as its content allows —
   restatement out, no rule dropped. Mark the status line "revised after round 1 (chat 125); for round 2's blind read".

## Not a finding, not your job

A problem living only in data already stored (D56); a scheduler who is not an admin (D785); what later batches build
(detachments, borrowing, shared waves, Transfer to Sqn, Post out from Admin → Users, each person choosing his
notifications); re-arguing a settled ruling. The held items (K2, K3, A3, B7, C7, C10) stay held unless a finding shows the
reshape makes one worse.
