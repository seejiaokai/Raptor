# Fix read 15 — Fable's report (blind), returned 20 Nov 26 (saved by the host from its final message; no handoff block was pasted, none used)

Read: BRIEF.md, FIXES.patch, FIXES-LOG.txt, the changed bodies in `state/perms.ts` and `state/notices.ts`, and the writers
around them (`sched-commit.ts`, `persist.ts`, `holderbase.ts`, `engine/drafts.ts`, `engine/inputs.ts`, `leavewar/sync.ts`,
`person-delete.ts`). I did not open the fix read 14 reports or any `*fixread15*` file.

Ran: the builder's `multi-sqn-fixread14.test.ts` — 13 of 13 green. My own probe file (14 tests, the builder's harness
copied) was placed temporarily in `src/leavewar/`, run with TMP/TEMP inside the copy, and deleted. No app file was
changed. The probe bodies are kept at the copy's root as `probe-tail.txt`, `probe-tail2.txt`, `probe-tail3.txt` (append
them after lines 1–80 of `multi-sqn-fixread14.test.ts` to re-run).

---

### Finding 1 (the only one) — item A is incomplete: a member can still take a scheduler's Reject off his own input through an edit then Undo

**Builder's choice (1) is wrong in part: `acc` and `odGround` are not "what memory holds on purpose and never saves".**
Only `acc: 'g'` is worked out after a command and never saved. `acc: 'r'` (a scheduler's Reject) and `acc: 'u'` (filed
under Unavailable) are saved decisions, and `odGround` is a saved mark; every honest writer of them runs inside a command.

**Failing input (run, red — probe P1):**
1. Ranger files his own Meeting on 27 Jul (saved).
2. Hunter rejects it (a batch setting `acc = 'r'`); the saved row reads `acc: 'r'`.
3. Control (green): Ranger's command that drops `acc` and changes the remark is refused — "where a scheduler put an input".
4. Ranger deletes `acc` on the row in memory, outside every command.
5. Ranger saves an edit that writes `acc = 'r'` back and changes the remark: accepted. The first pass sees no Reject
   before, so nothing is held; the second pass sees the Reject before and after.
6. Ranger presses Undo: accepted.
- Expected: the saved row still reads `acc: 'r'`.
- Got: the saved row has no `acc` — the Reject is gone and the request stands as a fresh one again.

**Cause:** `withLanding` in `storedRowViolation` copies memory's `acc` and `odGround` — present or absent, whatever their
value — onto the saved before-image. The Undo step records "no `acc`", and a restore is never asked about marks
(`inputBreach` returns at `replayed`).

**Introduced by these commits?** No. Before `c96246bd1` a put kept memory's whole before-image, so the same steps gave the
same result (by reading; I did not run the old code). But this is the same harm SEC14-1 named — a mark memory held, saved
by Undo — and `LANDING_ONLY` leaves that door open on purpose.

**Fix, step by step (`state/perms.ts withLanding`):**
1. Carry from memory only the derived landing: where memory's `acc` is `'g'` and the saved row has none, set `'g'`; where
   memory has none and the saved row's is `'g'`, remove it.
2. In every other case — `'r'` or `'u'` on either side — the saved row's `acc` stands.
3. Never take `odGround` from memory; the saved row's stands. Its honest writers (`engine/slots.ts` accept and reject,
   `engine/drafts.ts loadVersionToWorkingCopy`) all run inside a command that saves.
4. Correct the comment and `data-model.md` §11: the landing-only field is `acc: 'g'` alone (as `perms.ts said()` and
   `sched-commit.ts`'s restore already read it).
5. Add P1 as the red-first test; keep the builder's "landing mark" control but with `acc = 'g'` (it uses `'u'`, which is
   not a landing mark).

**Checked beside it, nothing found:**
- A member may put `acc: 'u'` on his own Meeting and `odGround` on his own overseas duty directly in a command (controls
  K1, K2, both accepted). So my probes P2 and P3, which bring those back through Undo, show no harm beyond what he may
  already do.
- A Meeting a scheduler moved under Unavailable with the moved mark (`schedPlaced`) is held: the same trick is refused at
  step 5 (P1c).
- Honest admin edit, then Undo: remark back, Reject kept, memory and saved row agree (P4).

---

### The builder's choices, judged

**(1) A — supported except for Finding 1.**
- Honest memory-only changes to a request that I could find: only `acc: 'g'` (`holderbase.ts` after each command;
  `store.ts` clearing it on a week load). Nothing else is written to a request outside a command, so no honest
  edit-then-Undo puts back anything wrong, and the history line reads no change that was not made.
- Carrying no before-image for a record never saved: I found no honest path that leaves a request in memory without a
  saved row once the saved copy is whole. The seed writes every request; the boot sync runs after the rows are wired; a
  tried save is thrown away; the three exemptions (copy not whole, restore, remote record) still stand.
- A bell-line put judged against the saved row now also carries the saved row whole (the `collection !== 'inputs'` branch
  returns the judged change). That is right, but the commit message does not say it.
- Refuse-outright is not needed: with step 1–3 above, the carried image is the saved one in every field a person can decide.
- Not run, named only: a remote edit of a request that already has a local saved row. Nothing in production raises a
  remote change today. If the database step applies one to memory without the saved copy, the next local edit's Undo
  would put back the stale saved image — another person's change undone (D148). One to note for that step, not a finding now.

**(2) B — supported.**
- Each image alone loses nobody D2225 or D2228 names: a filer who never moved is still told through the before-image's
  days; a filer who moved with the man through the after-image's.
- Several-man inputs are the union of each image's own men on its own days.
- An image naming nobody reads its filer's home on its own date, which is wider than before (the builder's ALL AVAIL
  test), never narrower.
- The only pairs dropped are ones no image ever had.
- The pass, the gate and the line's mark still read the one body. I ran no extra probe here beyond the builder's three.

**(3) C — supported.**
- Probe C1 (the A2 Approve with words): Ranger gets one line of the decision and one line of the words; Hunter one line
  of the words, marked 142; Saber, who typed them, none. Nobody is told of the words twice.
- Probe C2 (Saber un-approves the 28th of a two-day leave whose words were typed with "till 28 Jul"): one put-back line,
  no line of words.
- By reading: a join happens only where the two remarks already match, a cut or move copies the words through the same
  "typed words" reader the comparison uses, and a till tick the dates alone turn is not counted. A posting, its take-back
  and a delete are not war doors, so they are untouched by this change.
- One thing to know, not a fault: the named man now gets two lines from one Approve (the decision and the words), as the
  commit says.

**(4) D — supported.**
- D1: Quals edit of Casper, delete, Undo → refused with "has been deleted — that change can't be undone"; all four marks
  stand; nothing to Redo.
- D2: archive, delete, Undo → refused with the standing words; a Quals edit of the deleted man still saves; Restore refused.
- By reading: the posting pass skips an already-archived man; the posting's take-back and Restore act only on
  `archivedBy: 'po'` or `'admin'`, never `'del'`; the delete itself has no deleted before-image, so it is not asked.
- No honest action found that now fails.

---

### The brief's five questions
1. **Complete?** B, C and D yes. A no — Finding 1.
2. **Narrow and sound / fail open?** Nothing new fails open. The unset-probe, not-whole and remote exemptions are unchanged
   from fix reads 11–13. Finding 1 is the one way a mark still changes on a man's own input against a scheduler's decision.
3. **Match the rulings?** B and C match D2228, D2223, D2225 and D2194 as I read them. D matches D350, D290 and D297. A
   matches D148 except Finding 1.
4. **Do the rounds fit?** Yes. Fix read 13's item A (removals carry the saved row) is kept; the new put branch sits beside it.
   The restore exemption is unchanged.
5. **What broke?** Nothing found. The builder's file is green and my honest controls are green.

**Not run:** the wider suites the commit messages cite (one file at a time was the limit); the old code for Finding 1's
"not introduced" (reasoned from the patch).

---
**Host's note (chat 122):** the same fault as SEC15-1 and O15-1, found independently; reproduced red by the host
(`multi-sqn-fixread15.test.ts`, "SEC15-1"). Its note on a remote edit of a request with a local saved row is filed for
the database step under `[MSQ-FIXREAD10-LEFT]`.
