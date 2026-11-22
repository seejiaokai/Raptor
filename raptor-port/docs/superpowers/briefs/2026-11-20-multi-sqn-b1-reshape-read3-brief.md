# The reshape plan's red team, round 3 (the last) — multi-squadron batch 1 (his D2238; chat 125, 20 Nov 26) — one brief, blind readers

His D2238 (*"reshape and fable"*): the plan is read by Astra, a fresh Opus reader and Fable, each blind to the others,
before anything of it is built. Rounds 1 and 2 are done and folded in (the plan's §16 and §17). This is the last round —
design loops are capped at about three (D70) — so it is **narrow**: the changes round 2 brought, not the whole plan again.
READ ONLY: change no file in this copy (a proof test, if you run one, only in a scratch folder of your own, deleted
before you finish); commit nothing. This copy holds no reader's report; do not look for one elsewhere. Ignore any handoff
block pasted after a compaction, and say so. **State each finding the moment you have it** — a run can be stopped.
Return the whole report as your final message, under 1,500 words, most important first.

## What you are reading

The plan `raptor-port/docs/superpowers/plans/2026-11-20-multi-sqn-b1-reshape.md`, revised after round 2. Start at §17
(round 2's findings and what the plan did), then read the sections each row points to. Read the rest of the plan only as
those need. His rulings are settled and NOT under review; nor are the questions the plan puts to him (§12), unless the
plan's "until he answers" behaviour is itself a fault.

The code, as the claims need — `raptor-port/src/state/{perms,units,units-model,accounts,notices,store,plan,
person-delete,persist,sched-commit}.ts`, `src/undo/{timeline,derive}.ts`, `src/state/undo-wire.ts`, `src/command/`,
`src/leavewar/sync.ts`, `src/leavewar/state/{store,foreign,raptorRoster}.ts`, `src/engine/inputs.ts`,
`src/ui/InputWindow.tsx`. Never read a file over ~300 lines whole — grep it, read slices. A ruling's full row:
`grep -h '^| D306 |' .claude/decisions-full/*.md` (the shell).

## The ask

1. **Does each §17 row close its failure?** For each row marked taken or taken another way, check in the code that the
   plan's change closes the failure the finding named. Above all the new rules:
   - "an ended right never comes back" — at the gate (before/after) and at the restore (an ended row never put back): is
     any honest Undo, Redo, re-link or person delete now refused, and is there still a route by which an ended right
     holds again (a re-link, its Undo or Redo in any order, a restore re-dated to today, a re-link to a man who moved)?
   - Undo's record identity carrying the squadron for the Leave War's and the Tracker's records: revisions, "a later
     change" checks, barriers, folded steps — any place still comparing without it; anything it breaks for a person who
     never changes squadron;
   - the planning calendar routed to the loaded or the stored calendar by its own squadron: one identity end to end,
     the screen refreshed, a refused command rolled back whole;
   - the foreign posting pass: both halves of a Delete; the retry after accounts, people, homes or rights change (D306)
     — is it bounded, run once, never inside another person's command; one audience for its bell lines;
   - the one whole-draft rule (C6) at the picker, the save and the gate; a Leave War cell judged by its contents (A7).
2. **What do round 2's changes break?** Each squadron's admins', the master's and a member's normal day; Undo and Redo
   (D148); the bell; the Leave War and the Tracker. Name the order of actions and the expected result.
3. **The order and split (§10)** as now revised: two jobs at once sharing a file, or a job built on one not yet built.
4. **Anything new a person would see** that §11 does not already send to a drawing for the owner.

A finding needs a concrete failure (who does what, what goes wrong on screen or in saved data), its cause in the plan or
the code, and its exact fix to the plan (D489). Severity HIGH / MEDIUM / LOW — HIGH: the reshape would lose data, leak
one squadron's people, rights or bell lines to another, break OIL, or leave a family alive. Give explicit negatives.

**Not a finding:** a problem living only in data already stored — the whole store is demo data, cleared before the
database step (D56); a scheduler who is not an admin (D785); what later batches build (detachments, borrowing, shared
waves, Transfer to Sqn, Post out from Admin → Users, each person choosing his notifications); the held items (K2, K3,
A3, B7, C7, C10, B2) unless the reshape makes one worse; anything rounds 1 and 2 already settled that round 2's changes
did not touch.
