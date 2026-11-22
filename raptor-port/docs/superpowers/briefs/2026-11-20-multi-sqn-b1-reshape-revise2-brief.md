# The reshape plan's second revision — round 2's three reports folded in (chat 125, 20 Nov 26)

You are a fresh Opus reviser. You did not write the plan or its first revision, and you have not seen this chat. His
D2238 (*"reshape and fable"*): batch 1's open multi-squadron faults are fixed by first reshaping where their families
come from; the plan is read blind by Astra, a fresh Opus reader and Fable before anything is built. Round 1 was folded in
(the plan's §16). Round 2 is done. Your job: **revise the plan by round 2's three reports**, so that a last, narrow round
3 (design loops are capped at about three rounds, D70) finds nothing HIGH.

Work in `C:\Users\User\projects\Raptor-msq` (branch `claude/multi-sqn-b1-107`). **Write one file only:** the plan,
`raptor-port/docs/superpowers/plans/2026-11-20-multi-sqn-b1-reshape.md`, revised in place (git keeps round 2's copy,
`f70594194`). Change no other file; run no git command that writes; build and run nothing that rebuilds `dist` (no
`npm run build`, no Playwright). Reading code and running one unit test file with `npx vitest run <file>` is allowed if a
claim needs it. Never read a file over ~300 lines whole — grep it, read slices. **State each decision in your output as
you make it**; return a short summary at the end.

## Read first

1. The plan as it stands, whole (its §16 records what round 1 found and what was done).
2. Round 2's three reports, whole: `raptor-port/docs/superpowers/briefs/2026-11-20-multi-sqn-b1-reshape-read2-{fable,astra,opus}.md`,
   and the brief they were given, `…-reshape-read2-brief.md` (round 3 will get a narrower one).
3. As the findings need: the evidence sheet `raptor-port/docs/handpass/2026-11-18-multi-sqn-b1.md` §Fix read 17; the
   proofs `raptor-port/docs/superpowers/briefs/2026-11-20-multi-sqn-b1-repro/`; the rulings the plan's §0 names (full
   rows: `grep -h '^| D2203 |' .claude/decisions-full/*.md`, the shell) — D306 for "a held posting runs by itself once
   the reason goes", D2194 for who is told; and the code each finding names — verify every claim there before folding.

## What to do

1. **A new section, "§17 Round 2's findings and what the plan did"** — a table, every finding a row (Fable 1–10, Astra
   1–7, Opus H1, M1–M6, L1–L9): taken (where, how) / taken another way (why) / not taken (the concrete reason, checked in
   the code). One row may cover the same point found by two or three readers, naming each. Nothing dropped silently.
2. **What two or three readers agree on is taken** unless the code shows it wrong:
   - **The re-link and its Undo** (Fable 1, Astra 1, Opus M3; Fable 2, Astra 7, Opus M2; Fable 3, Opus L1): one rule
     that no command ever brings an ended right back to life except a fresh giving dated today, judged by the who-rule —
     consider stating it as a before/after invariant at the gate (Opus M3) and making the restore never put back a
     right that held nothing (an ended right lost from storage loses nothing a person can use); one decision on who may
     re-link an account that holds only ended rights, the door, the drop and G4 judging alike (read only rights that
     hold today); `pidFrom` a required key of `LevelAccount` so the build lists every hand-built account, and those
     sites added to the reader list. Tests for Undo at once, after either man moves, after both move, Redo of each, a
     plain admin's re-link.
   - **Undo across squadrons** (Astra 3, Fable 5): the squadron identity carried through every part of Undo for the Leave
     War's and the Tracker's records — revisions, the "newer change" checks, background barriers and folded steps, not
     only the restore's target; which records stay unstamped (those that carry no squadron today) and what a step left
     waiting in a squadron he can no longer enter shows; who owns the command layer's revision code.
   - **The planning calendar's one identity** (Astra 2, Opus M1): one identity per note or title through capture,
     conflict checks, storage and restore, routed to the loaded or the stored calendar; the screen refreshed when the
     loaded calendar is written; if a new collection survives, the member rule and every reader keyed on `'plan'` (Opus
     M1's list) cover it — or choose a design with no second collection.
   - **The foreign posting pass** (Opus H1, Astra 4, Opus M6): a Delete runs both halves (`person-delete.ts
     applyDelete` with B1's strip, and the war half); a held posting is retried by itself once its reason goes (D306) —
     a coalesced retry after changes to accounts, people, homes and rights, work deferred from another command kept
     until it runs; one audience for a posting's bell lines whichever pass runs it.
3. **Astra's single HIGHs, each verified first:** C6 across a move (one whole-draft answer to "whom may this person
   file this draft for", picker and save alike, recalculated as dates or people change); A7's removals (judge a cell's
   contents before and after: removal-only changes pass, any addition or change outside the squadron's days is
   refused).
4. **The rest:** a new squadron's admin on every judged date (Opus M4); the "moves tomorrow" refusal only for a put that
   gives or raises, verified replays exempt (Fable 4, Opus L3); an ended row removable or not counted (Fable 6);
   `changesIn` pinned to the resolved squadron (Fable 7); `levelIn` and `levelOfAccount` into the contract step (Fable 8);
   the unsaved-typing probe's owner and file, and "the pick stays for a master" (Fable 9); the test list (Opus L2); Piece
   C's wording and counting (Opus L4, L5); the year-wrap first day (Opus L6); the file lists (Opus L7); A7 in §11 and its
   real timing (Opus L8); the rights' start dates as a deliberate split, said plainly (Opus L9); C1's window across a
   move (Opus M5) — choose the right design (D754): if the window shows anything new, it goes to §11 as a drawing for
   him first (D1625) and to §12 as a question; if not, name it in the until-then and the walk.
5. **His questions (§12):** Fable 10's two points — Q4's example names the real consequence (a moved Plan holder keeps
   full admin of the third squadron until his move day, and until a transfer's date when it is set months ahead); Q6
   says what happens to leave already approved on days after his move (stays stored in 142's war, out of sight; 149's war
   does not have it until the Transfer batch carries it). Keep each question's worked example plain. Add a question only
   where a finding makes something new he would see.
6. **Order and split (§10):** every new owner named; no two jobs built at once share a file; nothing built on a piece
   not yet built.
7. **Keep:** the 35's accounting; "For him, in five lines" in plain words; §0; the plan as short as its content allows
   (restatement out, no rule dropped). Status line: "revised after round 2 (chat 125); for round 3's narrow read".

## Not a finding, not your job

A problem living only in data already stored (D56); a scheduler who is not an admin (D785); what later batches build;
re-arguing a settled ruling; the held items unless a finding shows the reshape makes one worse.
