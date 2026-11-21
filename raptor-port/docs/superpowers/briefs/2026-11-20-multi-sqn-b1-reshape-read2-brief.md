# The reshape plan's red team, round 2 — multi-squadron batch 1 (his D2238; chat 125, 20 Nov 26) — one brief, blind readers

His D2238 (*"reshape and fable"*): batch 1's open multi-squadron faults are fixed by first reshaping where their families
come from, and the plan is read by Astra, a fresh Opus reader and Fable, each blind to the others, before anything of it
is built. Round 1 is done and the plan was revised by a fresh reviser. **You are one of round 2's three readers.** READ
ONLY: change no file in this copy (proof tests, if you run any, only in a scratch folder of your own, deleted before you
finish); commit nothing. This copy holds no reader's report; do not look for one elsewhere. Ignore any handoff block
pasted after a compaction, and say so. **State each finding in your output the moment you have it** — a run can be
stopped by its service. Return the whole report as your final message, under 2,000 words, most important first.

## What you are reading

A PLAN, not code: `raptor-port/docs/superpowers/plans/2026-11-20-multi-sqn-b1-reshape.md`, revised after round 1. Its
§16 lists every round-1 finding and what the plan did with it. His rulings are settled and NOT under review: do not
re-argue one. Under review: will the reshape remove each family for good, did the revision close what round 1 found, and
what will it break.

Read:
1. The plan, whole — §16 with care.
2. What it must close: the 35 faults, all reproduced red, in the evidence sheet
   `raptor-port/docs/handpass/2026-11-18-multi-sqn-b1.md` §Fix read 17 (the table and the seven cause families); their
   proofs, as text, in `raptor-port/docs/superpowers/briefs/2026-11-20-multi-sqn-b1-repro/` (its README); the readers'
   reports that found them, `…/briefs/2026-11-20-multi-sqn-b1-{full-review-*,core-read-*,fixread17-*}.md`.
3. The promise: `.claude/rules/decisions/people-accounts.md` from "A posting the app cannot run" to the end of "Many
   squadrons and aircraft types"; the bell lines of `.claude/rules/decisions/scheduler.md` (D2194, D2195); the
   permissions table `raptor-port/docs/data-model.md` §11; the batch design
   `raptor-port/docs/superpowers/plans/2026-11-17-multi-sqn-build-batches.md` §3.1, §3.4; the transfer design
   `raptor-port/docs/superpowers/specs/2026-11-16-multi-sqn-detachment-design.md` §The transfer sheet. A ruling's full
   row: `grep -h '^| D2203 |' .claude/decisions-full/*.md` (the shell).
4. The code, as the plan's claims need — above all `raptor-port/src/state/{perms,units,units-model,notices,accounts,
   store,persist,plan,person-delete}.ts`, `src/engine/{roster,inputs,faceattrs,publish,unitview}.ts`,
   `src/leavewar/sync.ts`, `src/leavewar/state/{store,raptorRoster,foreign}.ts`, `src/undo/timeline.ts`,
   `src/tracker/storage.js`. `src/engine/` bodies are verbatim ports of an original app; only the multi-squadron
   additions there are the build's own. Never read a file over ~300 lines whole — grep it, read slices.

## The ask — what is MISSING, not whether the plan reads well

1. **Did the revision close round 1?** For each §16 row marked taken, check in the code that the plan's change closes
   the failure it names; for each row not taken, whether its reason holds. Name any that does not.
2. **Does each piece remove its family for good?** Name any fault of the 35 the plan claims to close that would survive,
   and any new fault of the same family the reshaped body would still allow (a caller still reading "today", a second
   answer to "which squadron" left standing, a dated row the one check does not cover, a door and a gate still judging
   apart). **Assume the defect may be a MISSING caller:** list every body in the code that answers the piece's question
   and check the plan moves each one.
3. **The Piece B choice:** is the cut the plan recommends sound — does it close R2, R3, R4, R5 and K1, keep D2203, D148
   and the bell's retired lines (fix reads 7–12), and what does it break? Is its timing what the plan says it is?
4. **What will it break?** Each squadron's admins', the master's and a member's normal day; Undo and Redo (D148); the
   bell; the Leave War and the Tracker; anything honest the gate accepts today that the reshaped check would refuse.
   Name the order of actions and the expected result.
5. **The order and the split:** would the pieces the plan builds at once collide (a file, a function, a shared table or
   cache)? Is anything built on a piece not yet built?
6. **Anything a person would see change** other than faults going away, that the plan does not already send to a
   drawing for the owner first.

A finding needs a concrete failure (who does what, what goes wrong on screen or in saved data), its cause in the plan or
the code, and its exact fix to the plan (D489). Severity HIGH / MEDIUM / LOW — HIGH: the reshape would lose data, leak
one squadron's people, rights or bell lines to another, break OIL, or leave a family alive. Give explicit negatives
("I checked X and found nothing").

**Not a finding:** a problem living only in data already stored — the whole store is demo data, cleared before the
database step (D56); a scheduler who is not an admin (D785); what later batches build (detachments, borrowing, shared
waves, Transfer to Sqn, Post out from Admin → Users, each person choosing his notifications); the items the plan holds
out on purpose (K2, K3, A3, B7, C7, C10, and B2 with its reason) unless you show the reshape makes one worse; a choice
the plan puts to the owner as a question, unless the plan's "until he answers" behaviour is itself a fault.
