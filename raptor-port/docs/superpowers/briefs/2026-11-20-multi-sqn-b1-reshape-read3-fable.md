# The reshape plan's red team, round 3 (the last, narrow) — Fable's report (blind; copy at `de5de891d`)

Reader: Fable (D2238 — his word, under D903), a background helper of chat 125, blind to Astra and the fresh Opus reader;
brief `2026-11-20-multi-sqn-b1-reshape-read3-brief.md`; its own exported copy holding no reader's report; finished
whole. Read only; no proof tests run. The report as returned:

---

# Round 3 red team (Fable): multi-squadron batch 1 reshape plan

Read only. I changed no file and wrote no proof test: every finding is a trace of the plan's rule through the code as it stands. No handoff block was pasted, so there was nothing to ignore.

**Verdict:** round 2's rows mostly close their failures. One hole remains in "an ended right never comes back" (finding 1), and four smaller faults came from round 2's changes.

## Findings, most important first

### 1. HIGH if built loosely, MEDIUM as written: Undo or Redo of a re-link, for rights that were still live at the re-link
- **Cause:** §4.3's restore rule only leaves out rows that are in the step, meaning rows already ended when the re-link dropped them. Rights that still held "follow the account" and are not in the step, so nothing in the restore handles them if they end later.
- **Setup:** Ranger's sign-in holds Plan of 151, given 12 Jul after his last move. On 18 Jul Saber re-links it to Viper by mistake.
  - **Viper moves 19 Jul, Ranger moves 20 Jul, Undo on 21 Jul.** The restore re-dates the link to today because Ranger has moved (`restoreRedated`, `perms.ts` ~l.1741). The Plan row is untouched, its start becomes 21 Jul, and it holds again for Ranger — Fable 1's original failure.
  - **Viper moves only, then Undo.** The link keeps its old day (`relinkBackHolds`), so the Plan holds again for Ranger from 12 Jul.
  - **Undo at once, Ranger moves, then Redo.** The link is dated today on Viper, and the Plan that ended on Ranger holds for Viper.
- **What happens:** in all three the right held nothing before the command and holds after, and the command never writes the grant row.
  - Read strictly, the gate's before/after rule refuses the honest Undo or Redo, against §4.3's "after both: the sign-in is Ranger's again".
  - Read loosely (the "verified restore" clause), an ended right holds again. Kestrel, a plain admin, can do it too, because G4 now reads the ended row as no right.
- **Why the tests miss it:** §4.4's re-link tests use only the already-ended 150 row.
- **Fix to the plan:**
  - A restore that changes an account's person carries the re-link's own drop: in the same restore command it removes every right of that account that holds nothing on the restore day, read before the restore. The timeline's `postRestore` hook already writes inside the restore.
  - The gate's existing drop-who already lets this through.
  - Say plainly, in §4.3 and §14, that a sign-in re-linked by mistake whose new man then moves comes back without the rights it carried.
  - Add three tests: a right live at the re-link, then each order above.

### 2. MEDIUM: a held foreign posting shows another squadron's man to whoever is signed in
- **Cause:** a held posting is said by a passing note (`tellOnce` → `HOOKS.toast`, `sync.ts` l.2674, l.2769). §6.2 steps 2–5 run the foreign half at boot, at midnight and after account commands on any page, and do not say who is told.
- **Failure:** a 142 member opens the app and reads "Kestrel is 149's last admin. The posting waits until 149 has another admin."
- **Not in §11:** a new thing seen, on a page that never showed it.
- **Fix:** the foreign half shows no passing note. The Admin → Users held note (A6) carries it for a master or 149's admins. Add a test that a 142 member sees nothing.

### 3. MEDIUM: the routed planning record is not whole on a restore (dormant until step 5's menu)
- **Cause:** A-ii routes inside the schedule store's `plan` case, which is the store's `write()` — the restore path. The timeline enlists only the store mapped to the collection (`timeline.ts` l.806–812, l.848).
  - `plan-foreign` is never enlisted, so the whole-world guard throws "un-enlisted store changed" (`commit.ts` guardCheck).
  - Nothing loads the stored before-image before the command.
- **Failure:** a 142 plain admin with View of 149 picks 149, edits a note on his own Inputs calendar, and presses Undo. The Undo fails with the generic refusal; were the guard off, a refused restore would not be rolled back.
- **Why the test misses it:** the plan's test covers only the opposite direction (edited foreign, undone loaded).
- **Fix:** make the stored half part of the schedule store's own capture, restore and records, with a load-before-command step the timeline calls for any `plan` id whose squadron is not loaded. Or give the timeline a per-record store resolver. Add the reverse test, and a refused restore leaving stored and cached copies untouched.

### 4. MEDIUM/LOW: A-v's "it never blocks a step in his new squadron, since their keys differ" is false for mixed steps
- **Cause:** war doors write an input and a war record in one step (`doorApprove`, `doorMoveApproved`). Inputs keep unstamped keys, and `undoConflictOf` (l.745–754) checks every later step sharing a key, whatever squadron is in view.
- **Failure:** at 23:30 Osprey files leave for Viper on Inputs. At 23:50 he moves that leave in 142's Leave War. His own move counts at midnight. In 149 every Undo press says "A later change touches the same thing — undo that first", about a step he can never reach. It is not sticky, so the button stalls on it until he signs out.
- **Fix:** in `undoConflictOf` and `redoConflictOf`, a later step whose stamped world he cannot enter is treated as blocked for good — the existing words "…and can't be undone", sticky, passed over. A master, who can go back, keeps "undo that first". Add the test. No new words.

### 5. LOW: which day `adminsOf` reads
- Step 6 says "at home in that squadron on that day"; §17 says "the loaded pass's set today".
- The gate half is built first (phase 1) and the caller later. If the gate reads the posting's date and the pass reads today, a pass run late is refused on every boot and the posting never runs.
- **Fix:** write "the day the pass runs, read after the outcomes" in step 6 and step 7.

### 6. LOW: the foreign run's command type is unnamed
- The timeline keeps a posting pass out of the user's step only by its type (`timeline.ts` l.193).
- A new type would fold the pass into the master's "make another 149 admin" step, and his Undo would carry the archive.
- **Fix:** state that it reuses `lw.postoutRun` and that the second store's gate door admits it. Test the master's Undo after the held posting ran.

### 7. LOW: Undo of a lowering after the man's move contradicts "dead for good"
- **Failure:** Saber lowers Ranger's Plan of 150 to View on 12 Jul. Ranger moves on 16 Jul, so the row is ended. Undo on 18 Jul re-dates that same row to today as Plan (`grantBackHolds` false → today), and the gate passes it as a giving.
- That is "a restore re-dating the row to today", which §4.3 says is closed.
- **Fix:** the restore also leaves out a put onto a stored row that holds nothing today. Or say plainly that it returns as a giving, as the removal example does. Test whichever is chosen.

### 8. LOW: §10 has tests resting on a job built at the same time
- Piece B's re-link Undo tests (core) need the leave-out wiring (helper "undo & roles").
- A5's "foreign Delete strips every calendar" (war) needs B1 (session).
- A-v's "foreign pass bars Kestrel's Undo" (undo & roles) needs A5's caller (war).
- **Fix:** name each as written at the later job's commit, or by the host at merge.

## Explicit negatives
- **Re-link who-rule (Fable 2):** door, G4 and the drop agree on rights holding today; a forged re-link keeping ended rows is caught by before/after.
- **Forward re-link back to the first man:** safe, the door's drop runs.
- **Undo of a move:** cannot revive a right — after the move day it is refused by "never a day already begun"; before it, nothing has ended.
- **`pidFrom`:** moving it later on the same person is caught by before/after; moving it earlier only ends more.
- **"Moves tomorrow" (Fable 4):** lowering, verified replays and the Undo of a removal pass and end at midnight; no honest step refused.
- **l.1999, `changesIn`, level readers:** rows close. Every level-reader caller passes today, so a Plan holder is not locked out of future weeks before his move.
- **Record identity:** the revision counter, expected-revision check, `revisionOf`, `liveRevision`, `writerOf`, barriers and verified replay are consistent if all go through the one key hook. The world swap writes no command, so a stay-at-home person's keys only gain a constant prefix. `closedAt` and `carrySeen` compare inside the timeline — builder care, not a plan fault.
- **Foreign Delete, both halves (Opus H1):** correct; `applyDelete` already serves the master's Delete of a 149 man.
- **The retry (Astra 4):** bounded — its own command triggers one more run that finds nothing; a refused run commits nothing; it is not woken by notify.
- **C6:** the lifted who-rule matches 7c (l.1349–1389); picker, save and gate ask one body.
- **A7:** contents before and after is right for a list cell.
- **Piece C rows (M4, L4, L5):** nothing found.
- **§10 files:** no two same-phase jobs share a named file.
- **§11:** nothing new seen beyond finding 2.
