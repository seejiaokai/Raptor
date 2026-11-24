# Fresh, blind Opus read — round 4 (copy `D:/raptor-work/c169-read4`, branch head `0e59ea5f3`)

**Read:** `BRIEF.md`; the job's brief §1 (`docs/superpowers/briefs/2026-11-24-sans-words-read-brief.md`); the full rows of
D2560, D2394, D2423, D2561; `FIXES-CLAIMED.md`; the three round-3 reports for their cases; `FIX.diff`, whole. Read whole
or in the parts that matter: `leavewar/sansunfiled.ts` (all of it), `state/noticeseen.ts` (all of it), `state/notices.ts`
(`noticeSansBack`, `sansChainOf`, `sansLineOut`, `sansLater`, `sansRetracted`, `sansStillHidden`, `sansBackLeft`),
`leavewar/sync.ts` (`followUpsFor`, `followUpsOwed`, `warNoticesReversed`, `retractPostingLines`, `takeBack`),
`state/perms.ts` (the bell-line section's war-line door, `restoreFollowUpOwed`, `followUpOf`, `sansBackEraseViolation`,
the read-record checks in both sections, the member section's `settings` case), `engine/overlay.ts` (`landingRequests`,
`landRequests`, `standingRow`, the four signatures), `engine/roster.ts`, `state/units.ts` (`unitRows`, `homesSignature`),
`state/units-model.ts` (`Home`, `atOn`), `engine/inputs.ts` (`inputOnDay`), `engine/weekstash.ts` (`rowElsewhere`,
`standingRowIn`), `engine/avail.ts` (`dayEngaged`), `ui/peek.ts` (`peekKey`, `peekWeekHTML`). Nothing of the app was
changed; `git status` shows only the three readers' test folders and the two brief files.

**Tests.** `raptor-port/src/r4-opus/r4.test.tsx` (the fixture of `leavewar/sans-reads-r3.test.tsx`, its lines 12–112,
word for word, paths pointed one folder over), config `src/r4-opus/vitest.r4.config.mts` beside it (the Leave War
project's settings: jsdom, its setup, TZ Pacific/Midway). Run from `raptor-port`:
`npx vitest run --config src/r4-opus/vitest.r4.config.mts src/r4-opus/r4.test.tsx`.
Result on this commit: **1 fails, as it should (R4-O1, older), 7 pass** (its control, round 3's O3-1 case word for word
and a second cycle of it, the pinned state of Q-R4-2, and three D2560 checks of my own). The builder's four files —
`sans-reads-r3`, `sans-reads-156`, `sansplan-sec156`, `sans-words-156` — pass under the app's own config: **159/159**.

---

## Findings of this round's change

**None.** Every round-3 finding is closed (table below), and I found no case where D2560 as built lights the reminder
for a day he has seen, or leaves it dark for a day he has not, nor one where the unread line names a day it should not or
misses one it should — beyond what was already so before this round (the questions below say where).

## Older, said so it can be weighed (not counted)

### R4-O1 (older) — the next-week preview keeps a man's request on his old squadron's week after his move: the stale-home gap Astra's F2 found is still open there (brief §3.5)

- **Where:** `ui/peek.ts peekKey` — it keys on `deletedSig() | requestsSig() | loadedSrcSig()` and never on the home rows;
  this round made `engine/overlay.ts landingSig()` ("a reader that keeps a week's reading keys on this") for exactly this,
  and gave it only to the SANS reminder.
- **The concrete case (demo, Wed 15 Jul 26, desktop width, 142 and the week of 13 Jul on screen):** Hex files a Meeting
  for Tue 21 Jul, 09:00–10:00. The preview of next week (20 Jul) under the week shows it on his row. Saber moves Hex's home
  to 149 from Thu 16 Jul (Admin → Users).
- **What goes wrong:** 142's preview of next week still shows Hex's Meeting on Tue 21. Worked out afresh, 142's week of
  20 Jul no longer holds it (it now lands on 149's). The preview keeps the old drawing until something else in its key
  changes (a request filed, a week saved, the week changed); Undo of the move the same in reverse.
- **Cause:** the preview's drawing is kept by a key that leaves out whose week a request lands on (each named man's home
  on its first day — `engine/inputs.ts inputOnDay`). It is older than this job; this round did not touch it.
- **The fix, step by step:**
  1. In `ui/peek.ts peekKey`, replace `'|' + deletedSig() + '|' + requestsSig() + '|' + loadedSrcSig()` with
     `'|' + landingSig()` (import it from `../engine/overlay`; drop the three imports it replaces if nothing else uses them).
     The one signature then carries the homes, as it does for the reminder, and any later addition reaches both.
  2. Run `src/r4-opus/r4.test.tsx` — "R4-O1 … Hex moved to 149 …" turns green, its control stays green.
- **Test:** `src/r4-opus/r4.test.tsx`, "Hex moved to 149 from Thu 16 Jul: the preview no longer shows his Meeting" —
  fails at `expect(peekKey()).not.toBe(k1)`; the fresh reading in the same test shows 142's week no longer holds him.

### Also older (no test): a read record written whole from one device's copy

`state/noticeseen.ts write` replaces the whole record with this device's copy plus the new read. Today one browser holds
one store, so no harm. At the database step, two devices of his (phone and PC) can each write from a stale copy, and the
later write drops the days the other read — by D2560 those days would light his bell again. Worth one line for
`handover-dataverse.md`: the reminder days in `noticeseen` are merged (union per reminder base), never replaced. Not a
finding now.

---

## Questions (no failure against a ruling's words)

- **Q-R4-1 — the builder's answer (d): days of the week on screen enter his reminder, and so his read record.** Hex, on his
  own device, opens the week of 20 Jul (no saved copy; the demo week names him): his bell lights; he goes back to 13 Jul and
  it is read again. This follows D2560's words, but his bell lights and goes dark as he pages through weeks. And the other
  side of it: if he presses "Mark all read" while 20 Jul is on screen, those days are now "days he saw" — if Saber then
  actually plans him on them and saves the week, nothing lights. Whether a week never saved can name him outside the demo
  depends on how such a week is seeded in real use. For the owner, with this case: should the reminder name only days of
  saved weeks and the week on screen of his own squadron, as now, or only saved weeks?
- **Q-R4-2 — the builder's answer (a) when he does it himself.** Sat and Sun planned, Sat filed, Hex reads (the line names
  Sun only). Hex himself deletes his Sat filing on the Inputs page: his own bell lights, for his own act (Sat was not in the
  line when he read it). Follows D2560's words; probably surprises him. One line of the rule could leave a day out of the
  lighting when the man himself took its filing away.
- **Q-R4-3 — "when he last read it" against "a day he already saw".** Hex reads [Sat]; Sat taken off, Sun put on; he reads
  [Sun]; Sat put back. By "a day not in it when he LAST read it" this lights (Sat was not in his last read); by "a day he
  already saw … does not relight it" it does not. The build reads every day he ever read of that reminder (the second
  clause; builder's test "neither day lights it again, in any order"). I think that is the ruling's intent; say so to him.
- **Q-R4-4 — a SANS that ended with no line to him, then began again, comes back already read.** Saber ticks Hex SANS, Hex
  reads [Sat]. Hex unticks himself on Quals (a member may, D149) — he tells himself nothing, so no line ends the reminder's
  run. Saber ticks him again: his reminder [Sat] comes back read, with no mark on his bell. Same where his SANS ends while
  he had read none of the days then standing and nothing filed was hidden (no line is owed), and he is made SANS again.
  Follows D2560's words (Sat is a day he saw) and was so under the old mark too (older). But the builder's own claim "the
  same posting made again is news" holds only where a line ended the run.
- **Q-R4-5 — two Undos back to a SANS man (round 2's line, not this round's).** Saber ticks Hex (he reads), unticks him (he
  reads "You're no longer SANS."), ticks him again (he reads), then presses Undo twice. Hex is SANS again, his reminder is
  back (read). His bell holds the untick's line struck "taken back" and, unstruck, the "You're no longer SANS." the first
  Undo wrote. By D1693 that line goes only with the Redo of the step whose Undo wrote it, so it may be right; read top
  down, the newest struck line reads as that news undone. For the owner if it confuses on the walk. Pinned (passes) in
  `r4.test.tsx`, "Q-R4-5 — tick, untick, tick, then Undo, Undo".
- **Q-R4-6 — speed: a change of week still reads every held week ahead again** (O3-2's step 2, not taken; the builder says
  so). On a SANS man's own device each week he pages to costs one full re-read (round 3 measured ~150 ms at 40 held weeks);
  on an admin's desk, the first people command after a week change pays it. The week on screen's year is all a held week's
  labels take from it, but the landing skips the week on screen when looking for a request's row elsewhere
  (`weekstash.ts rowElsewhere`), so keeping the whole week in the key is the safe choice. Fine as it is unless a walk on
  his slow PC shows the page turn lagging.

---

## Per-item verdicts (§3.1)

| Round-3 finding | Verdict | Why |
|---|---|---|
| Astra F1 (a member lights another man's reminder by naming a finished planning as his projection's cause) | **CLOSED** | Its cause is gone: nothing reads a `sansplan:` row (searched: no reader in the app). The builder's test runs both of Astra's routes (`commitAs` with the old cause; `commitProjection` rewriting its own envelope) as Ranger and Hex's read reminder stays read; a member's write of the row is refused anyway ("an admin's record"). The reminder now reads only Hex's own read record, which only `notices.seen` of his own may write (member section) — an admin's write of it in another command is the filed item. |
| Astra F2 (a man moved squadron kept a stale reminder day) | **CLOSED** | The builder's test is Astra's case word for word (Meeting Tue 28 Jul, move to 149 from Thu 16, 142 and 13 Jul on screen), plus Undo/Redo and both squadrons' views, each against a fresh reading. `homesSignature` covers every field a home is judged by (`id`, `pid`, `unit`, `from`) and the fallback; it is rebuilt on every new set of rows. Not closed in the preview (R4-O1, older). |
| SEC-R3-1 (a member's own read record froze the device's stamp clock) | **CLOSED** | No clock and no stamp any more. What a man writes in his own record is read only for his own reminder (`readOf` asks only ids with his own base); `reminderDays` takes only `YYYY-MM-DD` tokens and cannot throw (my test: junk ids, another man's ids and another base's ids in Hex's record — Hex's reminder still lit). The builder's test: Hex's record holding 1e300 and Ranger's ids; Ranger is still told of a day new to him. |
| SEC-R3-2 (the planner's own page froze a man's mark for good) | **CLOSED** | Cause removed with the mark; nothing stored decides "newly planned" any more. |
| Opus O3-1 (untick, Undo, Redo: the end of his SANS stopped counting) | **CLOSED** | My round-3 case, step for step (no read after the Redo), passes: ticked again, his reminder is lit. One body now (`state/notices.ts sansRetracted`, the last word by time then list order); `dueBase` and `sansUndoToldNow` use it. I traced the second Undo/Redo cycle and the unread variants: the count is right in each (an unread line's Undo removes it, its Redo puts it back with no "again"; a read one gets a "taken back" then an "again" that is later and wins). |
| Opus O3-2 (a plain Ground Programme row made every held week be read again) | **CLOSED for its case** | `loadedSrcSig` now leaves out rows no request landed; the builder's test counts 0 week reads after a plain row added and taken off, and >0 after a request lands a row. The week-change re-read (my fix's step 2) was left on purpose — Q-R4-6. |

**§3.2, D2560 as built.** Lit exactly when he has read none of the reminder, or a day it names now is not among every day
he has read of that reminder (one reminder = one base: the man, and how many lines ended his SANS). Checked, each against
its words: a day taken off and put back by Undo, by hand, by a filing deleted, by his date moving (dark); a day new to him,
by planning or his date moving earlier (lit); "Mark all read" twice over (keeps every day); a reload between (my test);
a record in the older stamped shape, and one holding both shapes (union); a reminder that ended with a line told and began
again (a new base, lit); Undo / Redo of the planning (a Redo is no news), of his tick (a Redo's take-back returns the base),
and his posting's take-back and making again. While unread it is one line, its id naming its days, so it stays unread as
days come and go. The builder's four changed answers (a)–(d) each follow D2560's words; (a) and (d) are questions above
(Q-R4-2, Q-R4-1). Two devices: Q above (older).

**§3.3, the gate.** `sansplan:` is no longer a listed settings row (`SETTINGS_ROW_PREFIXES`, `keyowner.ts`): a member's
write is refused ("an admin's record"); an admin may still write one in a settings command, and nothing reads it. The read
record: only its owner's `notices.seen` (member section); another squadron's admin refused (`noticeseen:` in the admin
section); the filed item stands. `reminderDays` trusts nothing in an id. `sansRetracted` and `SANS_UNDO_TOLD`: only a
restore's owed follow-up (`restoreFollowUpOwed`, through `followUpsOwed`) or a Redo's exact retraction of a line its own
step's Undo wrote can write a "taken back" or an "again"; a forward SANS line carrying `back`, `again` or `ref` is refused
(`sansBackCovered`). So no one can revive or retract another man's line, and so no one can move his reminder's base. Each
door is as narrow as the case needs.

**§3.4, saved data.** Nothing new is stored; nothing is written outside a command; what this round removes is the
`sansplan:` writer (and the stamp part of each reminder token, folded away on his next read). The read record's growth is
one id per reminder base, as filed.

**§3.5, speed.** `landingSig` is built once a change and only where a week ahead is held; `homesSignature` once a set of
rows. Nothing new is read on every draw: `dueBase` now asks `sansRetracted` per ended line of his (a pass over the bell
each), small. Week change: Q-R4-6. The preview: R4-O1.

---

## Tidiness note (D489 — filed, not fixed)

1. **Duplicated:** "a line a taken back names" is still written three ways — `sansRetracted` (the last word, `notices.ts`),
   `sansBackLeft`'s own `q.back === true && q.ref === n.id` (any taken back, beside it), and the "one taken back a line"
   count inside `setSansUndoTold` (`sansunfiled.ts`). The first two answer differently for an untick's line put back by
   its Redo; the bell happens to agree only because the "again" copy also hides the line. The preview builds its own key
   from three of `landingSig`'s four parts (R4-O1).
2. **Harder to follow than it needs to be:** the header of `sansunfiled.ts` and the comment blocks over `dueBase`,
   `weeksHeld` and `readOf` now carry four rounds of history (what was, what was found, what replaced it) before the rule
   as it stands; the rule could lead, the history move to the commit messages.
3. **Left doing nothing:** most of `sansplan-sec156.test.ts`'s re-aimed cases, and several in `sans-reads-156` (block 1,
   R2-3, R2-5), now write a row nothing reads inside `try { … } catch {}` and assert nothing changed — they cannot fail
   whatever the gate does. The ones that test Hex's read record (who may write it) still mean something; the rest could go
   or be folded into one "nothing reads `sansplan:`" test.

**0 findings of this round's change; 1 older fault with a failing test (R4-O1, the preview — a one-line fix, worth doing
now); 6 questions. Fix R4-O1 first; put Q-R4-1 and Q-R4-2 to the owner with their cases.**
