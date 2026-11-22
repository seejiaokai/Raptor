# Fix read 17 — the security reader's report (blind; copy at `7dbc13fd0`, whose app code is `6e08cdf25`'s)

Reader: a fresh Opus security reader (D1411), a background helper of chat 124, blind to the other three readers and to the
builder's report; brief `2026-11-20-multi-sqn-b1-fixread17-brief.md`, with its scope (holes only) in its own prompt; its
own exported copy; finished whole (about 7 minutes). Proof test kept outside `src` at
`…\scratchpad\fr17\sec17-proof.test.ts.txt` (chat 124's scratchpad). The report as returned:

---

**Fix read 17 — security reader report**

I worked only in the exported copy. There was no handoff block after a compaction to ignore. My temporary proof test has been deleted from `raptor-port/src`. A copy is kept at …\scratchpad\fr17\sec17-proof.test.ts.txt. I ran it as one vitest file in jsdom, using the same harness as `units-sqn-fixread16.test.ts`. On 7dbc13fd0 it gave 4 red and 1 green control.

## Confirmed findings, worst first

### S17-1 — A man who never moves can be stripped of a third squadron's right. Introduced by 7a1166124.

**Who can do it:** an admin of the man's own squadron who also holds admin (Plan) of one other squadron. Hunter fits: he is 142's admin and has Plan of 149. He can remove a View or Plan that squadron 150 gave to a 142 man, while the man never actually moves.

**Input (red), on 15 Jul:**
1. As `ad`: `addUnit('150')`, then `setGrant('acus', u150, 'view', 'bane')` and `setGrant('acad2', 'u149', 'admin', 'prowler')`.
2. As `ad2` (Hunter): `setHome('bane','u149')` returns ok, and the 150 View is dropped.
3. As `ad2`: `setHome('bane','u142')` returns ok. This replaces the saved move on the same day.

**Result:** on 16 Jul Ranger's home is still u142, but `levelIn('acus', u150)` is null. Expected: `'view'`.

**One-command forged variant (also red):** home rows u142 from the 15th, u149 from the 16th, u142 from the 17th, plus a delete of the 150 grant. The gate accepts it.

**Cause:** the new exemption in `perms.ts unitRowViolation` (WHO branch, "A MOVE TAKES THEM THE SAME WAY") lets a right's removal pass in any command that changes the man's squadron from tomorrow. The gate does not look across commands, so a move saved and then replaced on the same day leaves the drop standing. The only way back that restores the right is Undo, and S17-2 shows that Undo is refused. Before this commit, step 2 was refused whole, because Hunter is not an admin of 150.

**Fix:**
1. In `units.ts setHome`: when `homeOn(pid) === unit` and `homeOn(pid, from) !== unit` (the change would cancel a saved move), refuse with "Undo the move to cancel it — that gives back his rights".
2. In `perms.ts homeUnitViolation`: for a man not made in this command, refuse any home change that is not a verified replay where `homeBefore(pid, tomorrow, before) !== homeBefore(pid, today, before)` and `homeBefore(pid, tomorrow, after) === homeBefore(pid, today, after)`. That is, a same-day cancel is allowed only through `REPLAY(env)?.(c)` on each home change.
3. Apply S17-2's fix, so the Undo does work.
4. Add a test: the A input, step 3, is refused, and Undo instead puts back u142 and the 150 View.

The one-day move done in one command is arguably a real move under D2203 (he is 149's for a day). I name it but would not fix it beyond step 2.

### S17-2 — Undo of a move that dropped a third-squadron right is refused (D148). Introduced by 7a1166124.

**Input (red):** the same set-up as S17-1. Hunter calls `setHome('bane','u149')`, then `globalUndo()`. The result is `{ok:false, "That couldn't be completed just now."}`. Ranger stays u149 from the 16th and the 150 View stays gone.

**Control (green):** the same move with no third-squadron right undoes cleanly. The batch's own "move undone" control passes only because it signs in as the master.

**Cause:** the removal is exempt, but the put-back is not. The Undo's grant put (`b == null`, `n != null`) is judged by `adminOf(n.unit)` in the WHO loop, and Hunter holds nothing in 150. This also feeds S17-1: the right cannot come back by Undo, and the manual move back leaves it lost for good.

**Fix:** in `unitRowViolation`'s WHO branch, add the mirror case before the admin loop:
- **Condition:** `id.startsWith(GRANT_PFX) && b == null && n != null`, and `env.origin === 'restore' && REPLAY && REPLAY(env)?.(c)`, and the same command puts the man's tomorrow home back to his today's (`homeBefore(mp, tm, before) !== homeBefore(mp, tm, after) && homeBefore(mp, tm, after) === homeBefore(mp, today, after)`), with `mp = accountPidBefore(env, n.account)`.
- **Then:** `continue`.
- **Test:** Hunter's Undo restores u142 and the View; Redo drops it again; a forged non-replay put of the same right is still refused.

### S17-3 — The "no right given before his move" window covers tomorrow only. Not introduced; Sample 1's fix is incomplete.

**Input (red):**
1. As `ad`: a forged `home.set` writes u142 from the 15th and u149 from the 20th. The gate accepts it, because section 8 allows any date from tomorrow on.
2. On the 16th, 150's door calls `setGrant('acus', u150, 'view', 'bane')`. It returns ok.
3. On the 20th: home u149, and `levelIn` still gives `'view'`.

**Result:** a right outlives his move (D2203).

**Cause:** `setGrant` and the gate's new check compare only `moveFrom(today)` with today. `homeUnitViolation` accepts home rows dated after tomorrow, which `setHome` never writes.

**Fix (either):**
- (a) In `homeUnitViolation`, refuse a changed squadron on any date greater than `tomorrow` (`return 'a move dated past tomorrow'`). A verified replay is exempt.
- (b) In `setGrant` and in the gate, check the man's home on every home-row date after today, not only tomorrow.

(a) is the smaller change. **Exposure:** forged writes only, by an admin of both squadrons.

## The builder's choices, judged (security view)

- **(4) Move window and exemption:**
  - Window: supported for the app's own door (`setHome` always writes tomorrow); incomplete per S17-3.
  - Exemption: wrong as it stands (S17-1, S17-2).
  - Checked and sound:
    - A home row written and taken back in one command: no net change, so no exemption.
    - A move of another man: `mp` is read from the grant's own account as it was before the command, so re-pointing the account in the same command does not help.
    - An account with no person: no exemption.
    - A forged home row by someone who may not make it: still refused by section 6 (the unit it names) and section 8 (the squadron he leaves) in the same gate run.
    - Master and system: unchanged.
- **(3) The request-state rule in `stampForged`:** supported. Checked:
  - Refused put back to pending with the same id, moved to another cell: `same` is found across cells, so refused.
  - A new id carrying the old `placedAt`: refused by the placed-stamp test.
  - A copy kept in two cells: treated as a fresh bid, pending, stamped now.
  - Re-typing never inherits "refused", because `replaced` excludes it. "acknowledged" reads as pending (Ack retired, D1158).
  - Only members pass through this check, so no admin action changes.
  - Clearing his refused bid and bidding again gives a fresh, last-in-queue bid. That is honest.
- **(1, 2) `foldedInto` and `joinFilerImgs`:** no security hole found.
  - `toldBy` now judges a folded leave's filer over `[x]` alone. That is narrower than before, so it gives no new reach.
  - The gate's mark (`fu`) choice matches the pass's in the cases I traced: one man filed both; the standing words unchanged while the folded leave's changed; the filer also named. Where the standing leave's filer is not told, `filerVia` returns null, and the gate refuses rather than accepts.
  - A survivor with no before-image folds nothing, so the removed leaves' filers are told only on their own records, never on the survivor. That fails closed.
  - Possible correctness edge, not security: `filerMarkOk` reads `ch.after` from the first change of the input, while `foldedFor` reads the last. With two writes of one input in a command, the gate could refuse a line the pass wrote.

## Explicit negatives

- No route found for a member to write a decision or state on his own bid after S16-2.
- No bell line reaching another squadron's person through the folded-leave changes.
- No right given in the move window through `setGrant`, a forged write or a Redo, for a move dated tomorrow. A Redo of a grant after the move was saved is refused.
- No exemption without a change to his tomorrow home.
- No fail-open on an unset `REPLAY` hook: the new move branch does not depend on it.

## Rulings and lessons

Rulings: none this session (a read-only review). No §7.11 lessons added, since nothing he found was involved.
