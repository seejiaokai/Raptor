# Job 2 — Fable's read of the hard fixes (Agent tool, model fable — the owner's call, D2208; 19 Nov 26; proof tests one file at a time)

Read of an exported copy of `claude/multi-sqn-b1-107` at `2b792ebc5` (job 1 = `b63195c56..2b792ebc5`), brief `…-job2-read-brief.md` (the readers' shared brief, saved beside this file). Blind to the walk of the running app and to every other reader's report. Saved here by the check lead after all four had reported (19 Nov 26); the report below is unchanged.

---

# Fable's read of job 1's finished code — multi-squadron batch 1, the fixread2 faults (19 Nov 26)

Read blind: I opened no other reader's report, no `JOB2-*` file but the brief, and not `src/__proof_opus__/`.
Read in the copy only (`scratchpad/job2/copy`, branch at `2b792ebc5`); nothing under the live checkout touched; no file
under `raptor-port/src` changed other than my own proof folder `src/__proof_fable__/` (copies in
`scratchpad/job2/proof-fable/`).

**A handoff block was offered to me after a compaction** (the start hook said to open this chat's block in
`HANDOFF.md`). I did not open or read it, as the brief orders.

Proof files, each run alone with `npx vitest run <file>` from the copy's `raptor-port/`:

| File | Result |
|---|---|
| `src/__proof_fable__/f1-lock-pending-move.test.ts` | RED — 2 of 2 fail |
| `src/__proof_fable__/f2-own-input-after-move.test.ts` | RED — 2 of 3 fail (the third is the control, and passes) |
| `src/__proof_fable__/f3-a3-foreign.test.ts` | GREEN — 5 of 5 (explicit negatives for A3) |

Two findings, both real going forward, both reachable today only through the `home.set` command: `setHome`, `setGrant`,
`removeGrant` and `addUnit` have no caller on any screen yet. They become reachable from a screen the day a move of
squadron is offered (the next batches). Nothing I found is reachable from today's screens.

---

## F1 — MEDIUM-HIGH — the last-admin lock misses a later step when a move is already saved for a future date (proof RED)

**The promise.** D2184 Q10: a squadron is never left with no admin of its own, "and so is any later step that would
cause it, such as removing another admin". G3 claims "the last admin of a squadron today and on every new home date".

**Setup, action, wrong result** (`f1-lock-pending-move.test.ts`):
1. Saber (master) makes Osprey (149 member, account `acus9`) an admin: `updateAccount('acus9', {role:'admin'})`. 149 now
   has two able admins, Kestrel and Osprey.
2. Saber moves Kestrel to 142: `setHome('kes9', 'u142')` — allowed, rightly: it counts from tomorrow (D2119) and Osprey
   remains.
3. Saber then switches Osprey's account off (`updateAccount('acus9', {on:false})`), or — second test — makes him a member
   again (`{role:'main'}`).

Expected: step 3 refused with the lock's words. Got: `null` (allowed) from both the door and the gate. From tomorrow
149 has no able admin of its own (`able149On(tomorrow)` is empty).

**Cause.**
- `src/state/perms.ts` `lastAdminViolation` (line 1528 on): the dates judged are today, plus the `from` dates of home
  rows **only of the people whose home rows this command changes** (`movedPids`). A command that changes only an
  account judges today alone — and today Kestrel is still 149's, so the lock sees an admin left.
- `src/state/accounts.ts` `lockProblem` (line 290): reads `homeOn(x.pid)` for today only, so the door agrees with the
  gate and says nothing. (`lastAdminIfGone` and the posting's held-reason read the same way.)

**Fix, step by step.**
1. In `lastAdminViolation`, build `dates` as: today, plus every home row with `from >= today` on **either** side
   (before and after) belonging to **any person who holds an able admin account on either side** — not only the men this
   command moves. (Simplest correct form: every home row dated today or later, of anyone.)
2. Keep the per-date comparison as it is (a squadron that had an able admin of its own on that date before, and has none
   after, is refused).
3. In `accounts.ts` `lockProblem`, ask the same question on those same dates (pass the dates in, or loop `homeOn(x.pid,
   d)`), so the door refuses with the lock's sentence and the gate is the backstop, not the first to speak.
4. Do the same in `lastAdminIfGone` / the posting's held reason, so Archive, Delete and a posting out of the remaining
   admin are caught the same way (I did not prove those doors red; they read today's home the same way).
5. Test: the proof file as it stands, plus the same with Archive and with a posting out of Osprey.

**Job 1 or older?** Job 1 built the dated lock (G3) and left this gap; before job 1 there was no dated lock at all.

---

## F2 — MEDIUM — the inputs gate (7c) refuses a member his own input across a move of squadron (proof RED)

**The promise.** §11: a member's own input is his to make, change and delete. D2132: his inputs stay on his own
squadron. 7c claims inputs are "judged by their people's squadrons, members too".

**Setup, action, wrong result** (`f2-own-input-after-move.test.ts`):
- Case A — Ranger (142 member) has an input of his own dated some days ahead. Saber saves his move to 149
  (`setHome('bane','u149')`, counts from tomorrow). Today Ranger changes the remarks on that input. Refused: his remarks
  stay as they were.
- Case B — the input is dated today; the move is saved; two days later Ranger (now 149's) changes the remarks on that
  earlier input of his. Refused.
- Control — no move: the same change goes through.

**Cause.** `src/state/perms.ts` `inputUnitViolation` (line 1274 on): the input's squadron is read off its people's home
**on the input's date** (`homeBefore(p, iso, before)`, `iso = inputAtIso(r.date, r.yr) || today`), but the actor's
level there is read **today** (line 1301, `levelInForce(a, u, today, before)`). Across a move the two dates disagree:
in case A the input is 149's and he is still 142's; in case B the input is 142's and he is now 149's. The D755
exception covers only a member taking himself out of an input, not his own whole input.

**Fix, step by step.**
1. In `inputUnitViolation`, before the squadron test: if the actor is a member and the input names only the actor, on
   both sides (before and after), skip the squadron test — the member rules further down already hold him to his own.
2. For everything else read the level on the same date as the input: `levelInForce(a, u, iso, before)` per input, in
   place of `today`.
3. Test: the proof file as it stands.

**Neighbours of the same cause, not proven:** after a move, an input naming men of both squadrons can be changed only by
a master; and an admin's Delete of his own man who sits in such an input may be refused whole, because the Delete's own
tidy of that input is judged by the other squadron. Worth one test each when F2 is fixed.

**Job 1 or older?** Job 1 introduced it (7c is new).

---

## Notes — low, no proof test, for the host to weigh

- **N1 — D2203 is held at the door, not at the gate.** The mover's other rights are dropped inside `setHome`
  (`state/units.ts`); `homeUnitViolation` does not require it, so a hand-made `home.set` command that moves a man and
  keeps his grants is accepted. Only a forged command reaches it, and only a master or the man's own admin can send
  one. Fix: in `homeUnitViolation`, refuse a move whose after-side still carries a grant row for the mover.
- **N2 — an Undo of an account change to another squadron's man may file its history line in the squadron in view.**
  The line's squadron is taken from the people changed; a command that changes only an account names no person row. I
  did not run it. An older neighbour of Astra 5, not something job 1 made worse.
- **N3 — a posting set on 142's war for a man since moved to 149 is refused by the posting pass and held with no
  words.** This is the out-of-scope item (Opus F2, the words waiting for his drawing); named only so it is not lost.

---

## Explicit negatives — what I checked and found nothing

**A3, the store per unloaded squadron** (`leavewar/state/foreign.ts` and its callers) — five probes, all green
(`f3-a3-foreign.test.ts`), and job 1's own twelve A3 tests green in the copy:
- After the master's Delete of a 149 man, 149's admin next opens his war: the past record and past OIL award are there,
  the future record and future award are gone, the man shows as gone with his window closed the day before.
- The master's Archive replaces a Delete posting still to come; 149's posting pass later does not delete him.
- Archive, Restore, Archive again on one page: each reads the stored war fresh; the last window is the one stored.
- The master's Restore, then 149 opens: the man is on the war from his post-in date.
- A stale copy is never written back: 149's admin changes the man after the master's first act, the master then acts on
  another 149 man — the first man's stored rows are untouched.
- Read, not run: a world never opened (the early read keeps a never-started world's profiles); the rows are written in
  the same command, so a refused command writes nothing to the other squadron; two squadrons in one command each get
  their own store.

**G0–G3 (the guardrail), other than F1.** Both sides are read through the same loader reading; a forged older row, a
duplicate person or sign-in name, and a row the loader would drop or re-key are refused; the master mark and a master's
account are changed only by a master (D2205), the master sentence first; a home move dated ahead is judged on its own
date for the men it moves.

**7b, the war's squadron.** The gate is told the loaded world by the war itself. After a sign-in the war is swapped to
the person's own squadron inside the one session-change path. **A reload:** no session is remembered across a reload —
the page comes back at sign-in — so there is no path where a 149 person works on 142's loaded war after a reload.
Sign-out reloads the page; where a save is still waiting the reload is owed and happens when it lands. A master's
posting is a master's only.

**7c other than F2.** ALL / ALL AVAIL rows, an input with people of both squadrons with no move, and a member taking
himself out (D755) read as intended.

**`settleWorld()`.** All 37 call sites checked by where they sit: each is in the set-up after the reset, or directly
after an out-of-command reset inside a test and before the action under test. None sits between an action and its
assertion; I found no test left testing nothing. In the app the same baseline is taken at boot, save, squadron switch
and session change, so I found no app path that leaves it stale.

**The history lines (Astra 5, H5).** The line's squadron is fixed at push from the change's own people on the line's
date; Undo and Redo reuse the squadron recorded with the change, so an Undo after midnight files where the change was
filed; a raw write of a history row inside a command is refused by the write guard; lines written outside a command are
held by the push-time check. Nothing found beyond N2.

**7e, 7f.** Bell lines and read marks go to the admin's own squadron's people (the cross-squadron case only where it
concerns both, D2194); the Tracker is changed only by its own squadron, and keeps its squadron for the life of the page.

**Not looked at** (out of scope by the brief): Plan in place of the admin grant, per-squadron holidays, the time-zone
gate, the master's squadron menu, Admin → Squadrons / Users by squadron, the two database-step items, `accessreq:`.
Not run: any browser test, the whole suite, a build.
