# The reshape plan's red team, round 3 (the last, narrow) — the fresh Opus reader's report (blind; copy at `de5de891d`)

Reader: a fresh Opus reader (D790), a background helper of chat 125, blind to Astra and Fable; brief
`2026-11-20-multi-sqn-b1-reshape-read3-brief.md`; its own exported copy holding no reader's report; finished whole. Read
only; no tests run. The report as returned:

---

Round 3 red-team read of the multi-squadron batch 1 reshape plan (§17 first, then the sections its rows point to). I checked the code in the exported copy only and changed no file. No handoff block was pasted into my context.

## 1. HIGH (narrow): a re-link carrying a right that still holds. The plan's gate either refuses the Undo or Redo, or lets a moved man keep the right
The plan only covers rights that had already ended at the re-link: the drop takes those out and the restore leaves them out. A right that still holds goes with the sign-in to the new man, which is "as built". The before/after gate rule (§4.3) judges each account, not each man.

- **(a) Leak.** Ranger is 142's and holds Plan of 149. The master re-links Ranger's sign-in to Viper by mistake. Ranger is then moved to 150, and the master presses Undo.
  - Ranger has moved since the step, so `relinkBackHolds` is false and `restoreRedated` (perms.ts l.1729) re-dates the link to today.
  - The right now starts today, after his move, so it holds again.
  - Before and after the Undo the right "holds", so the before/after rule never judges it.
  - Result: Ranger, now 150's, holds Plan of 149. That breaks D2203, and the plan's own line "neither man holds anything".
- **(b) Honest Undo refused.** The same re-link, but Viper is moved before the Undo.
  - Viper's move ends the right while it is his.
  - The Undo keeps Ranger's recorded link day, because Ranger has not moved. The right then holds again for Ranger.
  - The restore never writes that right, so the rule ("holds after only where the command puts it, or a verified restore puts it back") refuses the whole Undo. He sees the generic refusal.
- **(c) Honest Redo refused.** Undo at once, then Ranger moves, then Redo.
  - The right ended with Ranger's move. The Redo links the sign-in from today, which would revive it.
  - The original step's drop removed nothing, so the Redo removes nothing either, and the gate refuses it.
  - A fresh re-link at that point would pass, because it drops the ended right.

**Fix (§4.3):**
- When a command changes an account's man, judge each right of that account against the man it names afterwards. After a verified Undo that keeps his recorded link day, a right passes only if it held for him at the step's moment. Otherwise it is a giving dated today, judged by the who-rule (G4).
- Every Undo or Redo of a re-link runs the drop again inside the restore: it removes every right of that account that would hold nothing for the man it is put on. That covers (a) and (c). The removal passes under the drop's who-rule.
- Tests: a right still holding at the re-link × {Undo at once, after Ranger moves, after Viper moves, Redo after either}.

## 2. MEDIUM: one bad foreign posting holds every other squadron's postings, and is retried after every change of people or rights
§6.2 steps 4–5 keep owed work "until a run completes" and re-run it after any command that changes accounts, people, homes or rights. The plan says nothing about how the loaded pass protects itself today: one retry, then one posting at a time, then giving up on that posting for the session (`PO_RETRIED` and `PO_REFUSED`, sync.ts l.2884–2893).

- **Concrete case:** a 149 posting of Viper (Overseas, 30 Jul), then Viper is moved to 142 from 16 Jul.
  - The plan's own gate line (step 7: "the man's home before the pass must be that squadron") refuses the run.
  - A1 admits such postings exist ("a saved posting dated past the move").
- If the foreign postings share one command, every other squadron's due postings roll back with it, and are retried and refused again after every later command. That breaks D306's "runs by itself".
- **Fix:**
  - Both passes skip a posting whose man is not at home in that squadron.
  - The foreign run keeps one posting per command, or the loaded pass's one retry then one-at-a-time fallback.
  - A refused posting is not retried this session.
  - Tests: two squadrons' postings with one bad one.

## 3. MEDIUM: a held foreign posting's warning could reach another squadron's people
- When a posting is held, the loaded pass calls `tellOnce` (sync.ts l.2770), which shows a warning to whoever is signed in.
- Step 3 says to run foreign postings "as the loaded pass runs them", and is silent on held ones.
- Built that way, a 142 member gets, at sign-in and after commands, "Viper is 149's last admin. The posting waits until 149 has another admin." That leaks 149's people and admin status to 142.
- §11 does not draw this warning.
- **Fix:** the foreign run shows no warning. A held foreign posting is shown only by A6's held note on Admin → Users.

## 4. MEDIUM: the routed planning-calendar record has no safe path through Undo when its squadron is not loaded
- The Undo system maps the planning-calendar record type to the schedule store alone (timeline.ts l.125–127), and the restore puts only that store into the transaction (l.825).
- The schedule store's saved records and rollback come from the loaded calendar's snapshot (sched-commit.ts l.432–435). Inside the schedule store's write there is no way to add the new stored-calendar store (`plan-foreign`) to the transaction.
- So an Undo routed to a calendar that is not loaded:
  - produces no recorded change, so nothing is written to storage;
  - is not rolled back if the restore is refused.
- The live case: a plain admin with View of 149 picks 149 and undoes an edit to a note on his own 142 calendar. That is dormant until step 5's squadron menu, but the plan builds for it and tests it.
- §3.4's test covers only the other direction: the note edited while 149 is picked, then undone with 142 loaded.
- The plan also never says the stored half must load the record before it joins the transaction. Without that, an edit is saved as "created", and its Undo deletes the whole note.
- **Fix:**
  - The restore picks the store per change, so a planning record of a squadron not loaded goes to the stored half.
  - The stored half loads the record ids before it joins the transaction.
  - Name the Undo-side change under "undo & roles" in §10, after "session".
  - Test both directions.

## 5. MEDIUM: one stored war row still has two Undo identities (the family left alive)
- Only the posting row from Admin → Users' doors and the foreign pass (`lwx.profile`) is matched to the war's own posting record.
- The same doors' OIL ledger rows (`lwx.ledger/<u>@<id>`) are the very row the loaded war records as `lw.ledger/<id>`. Their war records (`lwx.rec`) are the loaded war's cell records.
- **Failure:** once the master can pick a squadron:
  1. The master picks 149 and clears Viper's OIL award (his step).
  2. He picks 142 and deletes Viper from Admin → Users. This takes the foreign path and drops the award.
  3. He picks 149 again and presses Undo.
  - No "later change" is seen, and no background block applies. The award is written back for a deleted man, which is wrong OIL.
  - The deleted-person check (person-delete.ts l.388ff) names cells and inputs, not ledger rows.
- **Fix:**
  - Treat `lwx.ledger` as the same record as `lw.ledger/<u>@<id>`.
  - Derive the cell record (`lw.cell/<u>@<period>:<pid>:<date>`) from each `lwx.rec` value.
  - Add a test of this sequence.

## 6. LOW: two record comparisons the plan does not name
- `verifiedWarRestore` (timeline.ts l.615–628) and `carrySeen` (l.233–246) both compare records by their Undo key.
  - `verifiedWarRestore` checks `closed.has(recordKey(c))` against the closed-day keys, which the plan does qualify with the squadron.
  - If that lookup stays unqualified, a member's Undo of his own pending bid on a closed day (D1263) breaks for everyone, including people who never move.
- The squadron stamp is empty when no world door is set (perms.ts l.1446–1458), so existing tests without a door never exercise the qualified path.
- **Fix:** name both functions, and run the D1263 and seen-mark tests in the multi-squadron test world.

## 7. LOW: order and ownership (§10)
- Piece B's Undo and Redo tests (§4.4) can only go green after "undo & roles" wires the leave-out. Name which builder owns them, or the core commits them red.
- A-v's test "a posting run by the foreign pass, then Kestrel's Undo" needs "war"'s A5, which is built at the same time. Use an Admin → Users door instead, which exists today.
- A7's refusal words have no file owner: the gate's restore refusal is in core `perms.ts` or in the Undo wiring, not in "war"'s files.

## 8. LOW: "that day" in `adminsOf` is not named
- Step 6 (who gets the bell line) and step 7 (the gate) each say "that day".
- If the pass uses today and the gate uses the posting date, a run that is catching up is refused whole.
- **Fix:** say "the run's day (today)" in both, per D2218.

## Explicit negatives (checked, no fault)
- **"Moves tomorrow" (gives or raises only, verified replay exempt):** lowering a right, the Undo of a removal and the Redo of a giving on the save day all pass. The Undo of a giving is a removal, never judged.
- **l.1999 (holding rights only):** an ended row no longer blocks the Undo of "+ New squadron".
- **`changesIn` against the day before:** the baseline row (units.ts l.239), a same-day take-back and a first placing make no change.
- **One who-rule:**
  - Kestrel's re-link passes the door, G4 and the drop alike.
  - The drop's exemption is limited to commands that change the account's man.
  - A forged re-link that keeps ended rows is refused.
- **The plan's own re-link scenarios** (the right already ended when re-linked), in every Undo and Redo order: the leave-out and "never remove a grant row not stored" keep it dead.
- **A removal undone after the move:** dated today and judged as a giving, consistently.
- **Squadron stamp:** inputs filed at 23:50 can still be undone after midnight. The posting-row alias closes the foreign pass's barrier gap.
- **Foreign pass:**
  - It runs once, through the done mark in the stored war.
  - Re-runs are bounded: a run that is done or held commits nothing, so it does not trigger itself.
  - Both halves of a Delete are named.
- **A7:** an ordinary removal passes (Undo of one of two entries, or the last entry). "OK, seen" passes because it only removes notices.
- **C6:** one body for the picker, the save door and the gate.
- **Piece C:** M4's every-date check and L4/L5 hold.
- **§10:** no two jobs built at the same time share a file.

## §11 (new on screen, not drawn)
- The held warning in another squadron's session (item 3).
- The generic refusal of honest re-link Undos and Redos (item 1).

I found nothing else.
