# S2 step U2, fix round 3 — ADDENDUM: his ruling D2903 changes the rule mid-round (chat A212, 28 Nov 26, about 15:00)

**This addendum wins over `2026-11-28-msq-s2-u2fix3-brief.md` wherever they differ.** Fold it into the round you are
building; if a fix it removes is already built, take it out again.

## The ruling (his answer of 28 Nov 26 to question 47, "as recommended" — D2903, recorded by the coordinator)

**Switching a suspended, archived or posted-out admin back on is NOT making an admin.** Enable, Restore, "Restore as",
the Leave War's "Undo post out", a posting's date or outcome changed so that its archive or suspension is taken back,
and the Undo of a Suspend or an Archive: whoever may manage that squadron's people may do it, and the man returns with
the role he had. **Making a member an admin stays with the squadron's own admins or a master admin** (D2806), by every
door and by Undo and Redo (D2807 — the Undo of "made a member" by a Plan holder is still refused in its sentence).
The example he answered: Kestrel (149's admin) suspends Osprey (149's admin); Hunter (142's admin, Plan of 149)
presses Enable — allowed; Osprey is 149's admin again.

So "made an admin" is now ONE thing everywhere — the gate, the doors, the Undo's check: **a man whose role is newly an
admin's of his squadron** (the role as K3 reads it — `levelFrom(...) === 'admin'` in his home — whatever his sign-in's
switch, his archive or any other mark). Whether he is "in force" no longer enters into it.

## What comes OUT (round 1's fix 4 and everything grown on it)

1. `state/accounts.ts updateAccount`: the whole "ENABLE IS MAKING AN ADMIN" block (round 1's fix 4, re-pointed by
   round 2's fix 1). Enable asks nothing about making an admin.
2. `leavewar/sync.ts`: `restoreMakesAdminProblem`, `postingBringsAdminProblem`, `postOutChangeProblem` and every call
   of them (`restoreProblem`, `restoreArchivedAs`, `restoreArchivedPerson`, `undoPostOutProblem`, `postOut`);
   `postingKeeps` may stay if `postOut` reads cleaner with it, else put `keep` back as it was.
3. `leavewar/ui/Matrix.tsx`: `postOutOr`'s call of `postOutChangeProblem` and its import. **KEEP** the sheet's
   `onUndo` honouring a false return (`'That did not save'`, the sheet stays open) — that is right whatever refuses.
4. `state/units-model.ts madeAdminsIn` and `inForceOn`: the in-force half goes. A man is "made" where his role is
   newly an admin's of his squadron whatever his switch (this brief's fix 2 — now the whole rule). Delete `inForceOn`
   and the people it was handed if nothing else reads them.
5. `state/perms.ts madeAdminViolation`: the archived-mark trigger (`archCh`) goes, and **this brief's fix 1 is NOT
   built** (no mark is watched: a mark no longer decides anything). The security reader's S1 must still end refused —
   by fix 2: step 2 of its three writes (the role set to admin on a placeholder) is itself "made an admin" now. Keep
   `security/zz-security-proof-5`'s first case as a test (refused at the role write); its "Enable twin" is no longer a
   hole (Hunter may simply Enable) — drop that case and say so.
6. `state/undo-wire.ts makeAdminStuck`: the same one rule; no mark road. The Undo of a Suspend or an Archive of an
   admin by a Plan holder goes through.
7. **This brief's fixes 3 and 4 are NOT built** (the take-backs ask nothing now). Fable's finding 4 (a master admin's
   posting taken back by one who is not a master admin says the backstop words) is left as it is: the gate still
   refuses it (D2205), the sheet says "That did not save" — name it in the report as left; the orchestrator files it.

## What STAYS

- This brief's fix 2 (with the Redo lead's test) and fix 5 (a move told once; `restoreIntoForce`'s two more cases).
- Round 2's `liveAt` (fix 3 of round 2) as built, and round 2's fix 4 (the comment).
- Rounds 1's other fixes (1, 2, 3, 5, 6, 7, 8, 9) untouched.

## Tests — a ruling changes some expectations; that is not weakening, but say each one in the report

- `state/msq-s2-u2fix-enable.test.ts` (round 1, fix 4): its "refused to a Plan holder" cases now expect the Enable and
  the Restore to GO THROUGH, Osprey 149's admin again; the gate-forged-Enable case likewise passes the gate. Rename
  the describe to say D2903. Keep any case that is about making a MEMBER an admin (still refused).
- `state/msq-s2-u2fix2-enable.test.ts` (the moved member): stays green as it is.
- `state/msq-s2-u2fix2-posting.test.ts` and `ui/msq-s2-u2fix2-postsheet.test.tsx`: the Plan holder's "Undo post out"
  and later date of a 149 ADMIN now go through. For "the sheet stays open on a refusal", use a refusal that still
  exists: a master admin's posting taken back by one who is not a master admin (the gate refuses, the sheet shows
  "That did not save" and stays open).
- New, in `src/state/msq-s2-u2fix3-d2903.test.ts`: his example, door and gate — Kestrel suspends Osprey (149's admin),
  Hunter enables him: saved, Osprey an admin of 149 again, told on his own bell as today; the same for Restore after
  an Archive, "Restore as", "Undo post out" and a posting moved later; Hunter's Undo of his own Suspend of Osprey goes
  through. And the other side, still refused in D2806's sentence: Hunter picks Admin for a member; Hunter writes an
  admin's role on a switched-off or archived member (fix 2, the gate); Hunter's Undo of "made a member" (D2807).
- The readers' proofs that the ruling answers the other way — `opus/zz-opus-proof-1`, `astra/zz-astra-proof-3`,
  `fable/zz-fable-proof-3` — should now pass as written (the take-back goes through): keep them as tests.
  `fable/zz-fable-proof-5` (the master words): not built, leave it out and say so.

## Records

- `docs/data-model.md` §11 and any line of `docs/notifications-register.md` that says Enable or Restore "makes an
  admin": correct to D2903. **Leave `docs/ui-contracts.md` to the orchestrator.** In code comments, where round 1's
  fix 4 was called "the agent's reading", say what is true now and cite D2903.
- No new words on screen. If removing fix 4 leaves a sentence nothing can say any more, say so in the report.
