# Fresh Opus reader, narrow read of the second fix (diff 55c87b1dc..100fa3bb7); tests run: allavail-sans-posted.test.ts (with the fix: 18 pass + 1 expected fail; with the two lines put back to the old `if (lw && !inSquadron(lw, iso)) continue`: the three F1/F2 tests fail, all else as before), zz-fix2-proof-1.test.ts (6 proofs P1–P6: with the fix, on the pre-fix code, and with the repair proposed below)

All runs were in `D:\raptor-work\c141-read-o` only. `sync.ts` there is back to the fixed version (a backup sits at `raptor-port/.sync-fixed.bak`). The proof file is `raptor-port/src/leavewar/zz-fix2-proof-1.test.ts`.

## Finding 1 — NEW with this fix: a hand-ticked SANS man with a posting dated ahead (Overseas, or Delete) counts in the crowd of the days after the posting's date until the posting runs, then drops out. A day published in that time reads pending once the posting runs.

- **What goes wrong:** nick is ticked SANS on Quals. On Wed 15 Jul he is posted out Overseas Sqn from Fri 17 Jul, which has not run yet. He is named on Sat 18 Jul's programme. Sat's ALL AVAIL crowd now has him, with "+ SANS" off and with it on. Sat is published with him in it. On Fri the posting runs and archives him (`archivedBy 'po'`, `archivedOn` 2026-07-17). Sat's crowd then loses him. The published Saturday reads pending (2 pending items against 1 before the fix), and its next amendment changes his OIL. Before this fix his window (`to` = Thu) kept him out of Sat from the start, both ways, so the day never moved. A Delete posting dated ahead does the same: in before it runs, out once `deletedFrom` is set (P6).
- **Proof:** `zz-fix2-proof-1.test.ts` P1 (Overseas) and P6 (Delete). With the fix both fail on "the crowd of the published Saturday is the same after the posting runs": the expected crowd has `nick` and the received one does not. P1 logs `before-run off/on has nick: [true,true]`, `after-run has nick: false`, `pending after run: 2`. On the pre-fix code P1 passes: `before-run [false,false]`, after `false`, pending 1.
- **Cause:** `raptor-port/src/leavewar/sync.ts` `availableFor`, line 2108. For `sansWithUs` the whole posting window is set aside, its departure end (`to`) as well as its start. F1 and F2 needed only two things: the archive's rewritten `to` replaced by `archivedOn`, and a post-in date to come not to count. A departure that has not run yet still has to.
- **Fix, step by step:**
  1. In `availableFor`, change line 2108 to:
     `const ours = !lw || (sansWithUs ? atHome(lw, iso) && (p.archived ? iso < String(p.archivedOn) : !(lw.to != null && iso > lw.to)) : inSquadron(lw, iso))`
     An archived man is then ended by his archive's date. Anyone else is ended by his posting's departure date: `windowFor(posting, true)` already lays no `to` for a SANS posting that has run, so F1's case before the archive is untouched. A post-in date still to come (`from`) and gaps between earlier stints are still not asked, so F2 holds.
  2. Add P1 and P6 to `allavail-sans-posted.test.ts` under "left as it was". Each must fail before step 1.
  3. I ran this repair in my copy: all six proofs pass, P1 and P6 included, and `allavail-sans-posted.test.ts` stays at 18 passed + 1 expected fail.

## Behaviour change to put to him (not proved wrong): a SANS man posted "off the manpower" (no outcome) and named after the posting's date is now IN the crowd, both ways. Before the fix he was out, both ways.

- **Proof:** P2 (nick, posted with no outcome from Wed, so it runs today, named Thu). With the fix it logs `off/on has nick: [true,true]`; on the pre-fix code, `[false,false]`. Both runs pass, because the test only checks that the switch gives the same answer both ways.
- This contradicts the fix's own comment ("everyone else … is read by the posting window as before"). The file's test "posted out with no outcome … out from the date, though named on the day" only covers rocky, who is not SANS, so it does not guard this case.
- The repair in Finding 1 puts it back to out, both ways (P2 then logs `[false,false]`). Whether a SANS man off our manpower and named with us should count is a rulings question (D303 against D27). I recommend the repair; it is his call.

## Q1 — is each fix right and complete for its finding?
- **F1: right.** A SANS posting runs and then he is archived. Every day before the archive keeps him, both ways (the fix's own F1 tests). The crowd a published day kept before the archive still matches. On and after the archive day he is out: the SANS stretch ends that morning (`sansStop`), and `iso >= archivedOn` catches any SANS still held by hand (P5: a hand-ticked man archived Wed and named Wed is out, both ways).
- **F2: right.** A SANS man with a post-in date to come, named before it, is in, both ways.
- **Over-reach:** the departure end of a posting not yet run is set aside as well (Finding 1).

## Q2 — what broke beside it, state by state
- **SANS man restored after an archive, posting date given (P3, rocky: SANS posting Mon, archived Wed, restored with post-in Fri):** Tue stays in after the restore, both ways, and `archivedOn` is cleared. Before the fix he was out on all four reads. Not broken; better.
- **Hand-ticked SANS man archived, then restored with post-in Fri, named Thu (P4):** after the restore he is in, both ways. Before the fix it was off `true` / on `false`, so the switch changed the crowd. Matches (o). Not broken; better.
- **Restore with no post-in date (Undo post out):** `takeBack` and `restoreBody` both delete `archivedOn` (sync.ts lines 3448 and 3865). Read in the code, not run.
- **Archived by an Overseas posting (`archivedBy 'po'`, `archivedOn` = the posting date):** out from the posting date, through `iso >= archivedOn`. That is correct once the posting has run. Before it runs, see Finding 1.
- **`archivedOn` meaning:** an admin archive writes `effectiveToday()` (line 3691), the first day out. `stintClosed` closes his stint the day before, so the two agree. A posting writes `d.poDate`, its first day away (lines 3036 and 3214), and leaves an archive already there untouched. The guard `!(p.archived && !p.archivedOn)` falls back to the window. Consistent.
- **Deleted SANS man:** a delete that has run is still read by `deletedFrom` above the changed lines, so nothing changed there. A Delete posting dated ahead, not yet run: Finding 1 (P6).
- **Another squadron, or moved between squadrons:** `atHome(lw, iso)` is still asked of a SANS man named with us. Another squadron's men are already left out by `rosterOf(UNIT, iso)`. Read in the code, not run; no change found.
- **SANS man with a no-outcome posting, named after it:** changed from out to in (the behaviour note above, P2).
- **Man with no war row:** `!lw` means ours, exactly as before. An archived man with no row is still left out by the earlier line. No change.
- **"+ SANS" on against off:** every proof compared both ways. With the fix the two always agreed, except P1/P6 changing over time, and those change the same way both ways.

## Q3 — do the new tests prove what their names say, and would each fail without the fix?
- With the two changed lines put back to the old line, **F1 (two tests) and F2 fail**. They are real failing-before-the-fix tests.
- **"A hand-ticked SANS man, archived …" passes without the fix.** It is a guard, not a proof of the fix, and its name does not claim to be one.
- **The "(m)" `it.fails` test** behaves as described.
- **Weak spot:** the F1 published-day test checks "no pending line about OIL" with a `/oil/i` match on the pending items. Its crowd-equality check is what actually fails without the fix. Asserting `dayPendingItems(TUE).length` is 0 would be firmer.
- No test covers a SANS man with a non-SANS posting, run or still to come (P1, P2, P6).

Known and filed items (m), (n), (o) and (p) were not raised.
