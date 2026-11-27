# Section 1 (the guard rail) — step KR, PLAN ONLY: the refusals dropped (his D2825, 27 Nov 26) (chat 204)

**A planning job. No file under `raptor-port/src` changes.** Write one plan:
`raptor-port/docs/superpowers/plans/2026-11-27-msq-s1-kr-no-blocks-plan.md`.
After it, Astra and a fresh, blind Opus red-team the plan (the Opus sits in the Fable seat, his D2819). Then a builder
builds it red-first. Probably that builder is a fresh chat on the next account (his D2824), so **the plan must stand on
its own**.

## His answers (27 Nov 26, "as recommended", the coordinator's record — D2825–D2827)

- **D2825 (question 29): drop the refusals at every door.** The doors:
  - the squadron pick;
  - the member-view switch, both ways;
  - a bell line;
  - the page door;
  - the OIL list's card;
  - the page an Undo or Redo lands on;
  - the "+ New squadron" Undo.

  What is open closes, and half-typed work is dropped, with **no note**.
  - **"Not saved" still stops them until Retry** (his D2594: an unsaved change refuses a pick, the view switch and a
    bell line until Retry saves; Logout asks; the "Not kept" band never blocks).
  - The Tracker's own question about unsaved chart edits stays.
  - Show-only windows and Logic's and Quals' edit modes close as before.
  - K3's note and K7's test-time checker come out where they become unused.
- **D2826 (question 25):** answer 1. "Add a person", open across his own move at midnight, closes with the passing note
  "You are 150’s from today, so Bandit was not added to 142." (Fable-read words). This is step K5b's add-form half.
- **D2827 (question 24):** A, the way-back words "…switching back to the admin view?" stay. B, the chart editor closes at
  the member-view switch at home too, as on another squadron (K5b's other half).
- **Question 27** (the refusal words) is moot. Keep only words still needed for "Not saved".
- K8b is dropped (D2821).
- **K8c** (an Undo that changes the squadron closes what the guard closes) is being built now, and stays. The plan builds
  on it.
- **K10's root** waits on his question 30. It is not part of KR, but the plan must say how KR and the root meet: a held
  Input window, the band.

## Read (by section; use grep and sed on `raptor-port/src`, the Read tool for documents)

- This chat's block in `HANDOFF.md`, from `### CHAT 204` to its `<!-- /now -->`: every step K0–K10, what each built and
  where.
- The plan `docs/superpowers/plans/2026-11-25-msq-pick-guard-build1.md`:
  - §1, §3.1–§3.2 (part A's table);
  - §4.1–§4.2 (every door, the order of checks);
  - §4.6 (the note);
  - §18;
  - §21.1 with its blocks;
  - §21.5 (files other sections share).
- The code:
  - the guard: `src/state/guard.ts` and `src/ui/guard.ts` (`GUARD_ROWS`, every row and what it says: refuses, closes,
    mode);
  - the doors: `src/state/pick.ts`; `src/state/store.ts` (`switchRoleView`, `setPage`, `stepPage`,
    `ownSquadronFirst`, `maybeReenter`); `src/state/belltap.ts`; `src/ui/topstate.ts openNotice`;
    `src/ui/OilDayList.tsx`; `src/state/undo-wire.ts squadronRefusal`;
  - the wait: `src/state/doorwait.ts`;
  - the note: `src/ui/guardnote.ts`, `src/ui/toast.ts`;
  - the checker: `src/testing/entry-checker.ts`, `src/test-support/raw-entry.ts`;
  - each row's report: `useGuardWork` and its callers. Several live in the Admin → Users section's files
    (`ui/UsersPanel.tsx`, chat 205).
- The rulings, read whole (the shell's `grep -h '^| D2594 |' .claude/decisions-full/*.md`): D2594, D2590, D2627, D2403,
  D2596, D2597, D2654, D2740, D2323, D2389, D2243.

## What the plan must settle

1. **Every row of `GUARD_ROWS` that refuses today: what replaces the refusal.** Give one line per row:
   - its closer, meaning the existing Cancel, ✕ or discard path. Never a new one where one exists;
   - **exactly what is lost**;
   - **whether anything half-saved is left behind.** Two to check: a holiday saved and kept waiting for a leave period
     is a stored record, not typing; a Leave War sheet. Name every such case, and whether dropping it is "half-typed
     work" under D2825 or a saved thing that must not be touched;
   - any that cannot be closed without a change he would see is a **question for him**. Word it, with its situation
     (D2439), for the coordinator.
2. **What stays a refusal:** only "Not saved" (D2594), and anything else a ruling still names. Say which code paths
   remain (`refuse`, the note, the Retry lead) and which go.
3. **The doors:** each door's new order, for example: the wait for a save (stays?), "Not saved" (refuses), the
   Tracker's question, then close everything and enter. Say whether the wait for a save (`doorwait.ts`, D2627 "a save in
   flight is waited for") stays. It is not a refusal.
4. **The bands:** the held Input window, the war under a held window, the member view's bands. Which still have a case
   once nothing refuses, and which code goes.
5. **K3's note, K7's checker, Part A's table:** what is removed, what is kept and why. The table is likely kept to know
   what to close. The checker may become "nothing left open after an entry". Never keep dead code.
6. **The tests:** the files that assert refusals (`msq-guard-doors*.test.tsx`, `msq-guard-g`, `msq-guard-note`,
   `msq-guard-open`, `msq-guard-drawn-*`, `msq-guard-rollcall`, the K0 census files). For each:
   - re-pointed to the new behaviour, each change traced to D2825, renamed, no assertion dropped without its ruling; or
   - deleted with its ruling named.

   Which new tests come first, red: for each door, typed work open, press, the squadron changes, the work is gone, no
   note; and "Not saved" still refuses.
7. **K5b:** D2826's note and D2827 B, as their own sub-steps.
8. **The overlap with chat 205** (Admin → Users): its rows' reports, its own passing notes, its U2 work on the Undo's
   `stuck` hook. List what 205 must change or agree to, file by file. Never plan a change to 205's files without
   naming it.
9. **Order and size:** the sub-steps in order, each small enough for one builder; the checks; the browser tests (K12's)
   that change; the records (file-map lines, the plan's §21.1 rows) to update.
10. **The risks**, each with how the plan answers it. Above all, data lost that was not "half-typed".

## Rules

- Work in `C:/Users/User/projects/Raptor/.claude/worktrees/lw-balances-hover-275293`, on branch
  `claude/msq-s1-guard-6ae5e1`. **Read only, except the plan file.** A builder (K8c) is changing source in this copy:
  never edit, stash, check out or reset anything. **Do not commit.**
- Speak of his rulings by number. Mark any reading of yours as **"the planner's reading"**, never as his rule (lesson 32).
- When done, reply in under 150 words: the plan's path, the number of sub-steps, and every question for him.
