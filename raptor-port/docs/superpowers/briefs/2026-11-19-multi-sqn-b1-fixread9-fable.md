# Fix read 9 — Fable's report (blind; 19 Nov 26, chat 118; copy at `fc0e95ecf`, code = `ae1af3806`)

Saved whole as handed back (about 8 minutes, 34 tool uses); not yet reproduced by the host. Proof file kept at chat 118's
scratch `fr9-fable/zz-fable9/zz-fable9.test.ts` (run from `raptor-port/src/leavewar/`).

---

# Fix read 9 — Fable's report (blind; no handoff block was pasted, none used)

**Proof file (kept):** `C:/Users/User/AppData/Local/Temp/claude/37df10f156419f1e/9fd34fb7-f6fc-4b49-8eb7-eec4d211d74d/scratchpad/fr9-fable/zz-fable9/zz-fable9.test.ts`
To run it: copy it to `raptor-port/src/leavewar/zz-fable9.test.ts` (its imports are relative to that folder), then `npx vitest run src/leavewar/zz-fable9.test.ts`. I ran it there (8 tests: 6 red, 2 green) and then removed it from `src`. No app source was changed. Harness is fix read 8's own (lines 1–91 of `multi-sqn-fixread8.test.ts`).

## Findings, ranked by consequence

### 1. A Redo (or Undo) of the master mark, pressed after a man's move, brings his retired line back — choice (8) is wrong
- **Introduced by:** fix read 8, fault G (`71c7d3095`). Before it there was no day rule to get round; G added the rule and its one way past.
- **F1 (red, proof line 104, `expected true to be false`):** 15 Jul, Hunter gets his filer line. Saber sets Hunter's master mark and Undoes it the same day. Hunter moves to 149 on 16 Jul; the line leaves (asserted). On 17 Jul Saber presses Redo; the mark returns dated 15 Jul and the retired line is back on Hunter's bell.
- **F1b (red, line 114):** Hunter a master on the 15th; Saber takes the mark off on the 15th; Hunter moves on the 16th (line leaves); on the 17th Saber Undoes the removal — the line is back.
- A fresh `setMaster` on the 17th is dated the 17th and keeps the line off (fix read 8's fault D test), so the replay does what the forward command may not: D2218 / D2223, the same harm as faults P, D and G.
- **Cause:** `undo/timeline.ts verifiedReplay` now vouches for `account:` and `grant:` rows image for image, and `perms.ts` skips the day check for a vouched row (`accountShapeAndMasterViolation` G2; the grant branch of `unitRowViolation`). `notices.ts adminThen` then reads the old day as "held before the move day".
- **Not proven for a grant:** the same door is open, but it needs a man holding Plan of a squadron across a second move ("a right in his own home unit" blocks the simple case). I did not build that test.
- **Fix, step by step:**
  1. In both gate checks, when a restore's vouched row turns a right on (the mark from off to on, or a grant put where none stands or with a changed level), accept the replayed day only if that person has no home row with `from` after the replayed day and up to today (the rows as they stood before the command) whose home differs from the one before it.
  2. Otherwise require today.
  3. In `timeline.ts`, let the restore write today's date in that case, and compare the vouched image ignoring `from` / `masterFrom` for those two row kinds.
  4. Tests: F1 and F1b green; fix read 8's "Undo and Redo a day later" control still green (no move in between).

### 2. Fault W's fix misses a call site: after a write outside every command, an admin's Delete of an unrelated man is refused whole
- **Introduced by:** fix read 8, fault W (`bb4255a9f`), the narrowing of `passMade` in `inputLineUnlike`. Before it the delete saved, wrongly telling the write with no name.
- **F2 (red, line 125):** Ranger files a Training for Ace. Saber signed in; Ace's remark is changed by a bare write; `deletePerson('casper')` (unrelated). The gate answers "a bell line not as the pass writes it" and the screen says "That did not save".
- **Control (green):** the same Delete with no bare write saves.
- **Cause:** `state/person-delete.ts` (line 479) brings the scheduler's starting point up to memory and enlists, but never re-takes the bell's image as `commitInputsWith` now does. The pass still tells the bare write (no maker); the gate, since W, refuses a pass-made line whose input the command does not change. W's own log rejected option (a) because it "could refuse an honest command" — this is that refusal, by another door.
- **Same pattern, unproven:** `leavewar/sync.ts` lines 2922 and 3207 (the posting sheet's Undo post out and take-back: resync then enlist, when they retract lines).
- **Fix:**
  1. Export one helper from `sched-commit.ts` — "resync, then re-take the image if the store is not yet enlisted" — the three lines `commitInputsWith` now holds.
  2. Call it in `person-delete.ts`, `sync.ts` 2661, 2922 and 3207 in place of the bare `resyncSchedBaseline()`.
  3. Test: F2 green, plus the same for Undo post out.
- **Explicit negative, F5 (green):** a posting that runs by itself on its date (`lw.postoutRun`) after a bare write told nobody of it. I did not trace why that door behaves differently.

### 3. Choice (6) leaves an admin untold whom D2223's own words keep told — for the owner to rule
- D2223: "the filer is told only while he is still that man's admin or in the input"; D2225 adds "a moved filer is still no longer told". The code follows the second sentence everywhere.
- **F3 (red, line 138):** Hunter files Ranger's leave; both move to 149 on 16 Jul, Hunter an admin there. On 17 Jul Kestrel changes the remark — Hunter, Ranger's own admin that day, is told nothing.
- **F3b (red, line 144):** Hunter moves to 149 on the 16th and back to 142 on the 18th. On the 19th Saber changes the leave Hunter filed — Hunter, 142's admin again, is never told again of anything he filed before the 16th, for good.
- **Cause:** `notices.ts filerVia`: `atHome` is false once `movedSince` finds any move after the filing day; `adminThen` counts only the mark or a grant.
- **Introduced by:** fix read 8, fault R (on purpose — the host's reading).
- **Recommendation:** put both cases to him. If he wants them told, in `filerVia` count his home when his home today is one of the named man's squadrons and his account's role is admin, and mark the line with that squadron. `noticeLeftBell` then needs the same question on each move day.

### 4. Low — fault B's residue: a clock set back hides a moved man's new squadron's lines for a few minutes
- **F4 (red, line 149):** Hunter moved on 16 Jul; on 20 Jul a 149 "bidding open" line dated 10 minutes ahead reads as left his bell.
- **Cause:** `noticeLeftBell` reads a line dated ahead as written before every move, so anything not about himself is "old squadron's".
- It comes back once the clock passes the line's time less five minutes. A man who never moved is unaffected (B's own tests).
- **Fix:** for a line dated ahead by less than a day, judge it as written today (`wrote = today`, so not left). Keep "before every move" only for one dated a later day; the gate already refuses those (fault N).

## The builders' choices
1. **M's registry — supported.** A `WeakMap` keyed by the command's envelope, written only in `tellPass`; a failed command's envelope is dropped; nothing in an envelope's data can fill it. Since W it vouches only with a changed input — sound, but see finding 2 for what that now refuses.
2. **T on new lines only — supported.** An existing line's time is held by `lineRewritten`.
3. **Fixtures re-dated / `iid: ''` — supported.** I read the two holiday fixtures and the `bellnotices` change; each still pins what it did.
4. **P, no day counts from always — supported** (D56); the gate now refuses a new one.
5. **Unreadable date falls back to today — supported;** no failing input found.
6. **Wrong by D2223's letter, or needs his word** — finding 3.
7. **`isEnlisted` — supported for** a root, a child of an outer command that enlisted, and a failed command (state keyed by envelope). The gap is the doors that resync without it (finding 2). I did not find an honest change left untold through `commitInputsWith`; I did not sweep every screen for a record edited in place before its command opens.
8. **Wrong** — finding 1.

## Checked, nothing found
- **Fault R:** a member filer who moved loses his line; a filer told through Plan keeps it across the move; a master filer still told; the named man moving into the filer's squadron; an input straddling the move (fix read 7's Q17 still expects `['u142']`).
- **The filed-day test:** `filedDay` takes the earliest `at` of both images, so a command cannot move the filing day later to make a moved filer "never moved".
- **Faults D, N, H:** the `from < day` rule with the pass's "now" exception; a line dated just past midnight; a holiday line carrying an input or a mark — each refused as written.
- **Fault G on forward commands:** a new grant, a level change, the mark set, a day with the mark off — each held to today.
- **`lineRewritten`** does not hold a line's words, name or maker. I found no gain over writing a fresh line, which an admin may do for his own man.

## Not examined in depth
- The follow-up lines of fault F (`followUpsOwed`).
- Fault U's member door.
- The 142→149 transfer take-back.
- The bell's screens themselves (unread count, "mark all read", the tap) — I read `noticeLive` as their one body and did not drive them.
