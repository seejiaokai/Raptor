# Fresh, blind Opus read — round 3 (copy `D:/raptor-work/c156-read3`, branch head `330ded7df`)

**Read:** `BRIEF.md`; the round's brief §1 (`docs/superpowers/briefs/2026-11-24-sans-words-read-brief.md`); `FIXES-CLAIMED.md`;
the four round-2 reports for their cases; `FIX.diff` whole; and whole or in the parts that matter: `leavewar/sansunfiled.ts`
(all of it), `leavewar/sync.ts` (`warNoticesReversed`, `warLineCovered`, `followUpsFor`/`followUpsOwed`, the posting runs),
`state/notices.ts` (`noticeSansBack`, `sansStillHidden`, `sansBackLeft`), `state/perms.ts` (`adminOwnerViolation`'s war-line
door, `sansBackEraseViolation`, `sansPlanViolation`), `undo/timeline.ts` (`applyingRestore`, `verifiedReplay`,
`applyRestore`, `restoreCommit`, the abandon rule), `command/commit.ts` (`dispatch`, `enqueue`, `runPipeline`,
`commitProjection`, the begin hooks), `engine/overlay.ts` (`viewOfWeek`, `landRequests`, the three signatures),
`engine/weekstash.ts` (`stashDays`, `rowElsewhere`, the source memo), `engine/hooks.ts` (`store`), `storage/adapters.ts`
(`settingsAdapter`), `state/undo-wire.ts` (the `reversed` hook). Nothing in the app's code was left changed (two one-line
probes, below, were put back; `git status` shows only the new test folder).

**Tests.** `raptor-port/src/r3-opus/` — `o3-1.test.tsx`, `o3-2.test.tsx`, `o3-c.test.tsx` (each the fixture of
`leavewar/sans-reads-156.test.tsx`, its first 111 lines, word for word, paths pointed one folder over), config
`vitest.r3.config.mts` beside them (the Leave War project's settings: jsdom, its setup, TZ Pacific/Midway). Run from
`raptor-port`: `npx vitest run --config src/r3-opus/vitest.r3.config.mts`. Result on this commit: **2 fail, as they should,
each at its last assertion; 4 pass** (two controls, a timing print, and the control half of O3-1). The builder's
`sans-reads-156`, `sansplan-sec156`, `sans-words-156` pass under the app's own config (133/133).

---

## Findings

### O3-1 — after Saber unticks Hex and presses Undo then Redo, the end of Hex's SANS no longer counts: when he is ticked SANS again later, his reminder comes back already read (this round's `dueBase` change broke it)

- **Where:** `leavewar/sansunfiled.ts dueBase` — the new `&& !retracted(x)`; `retracted` beside it.
- **The concrete case (demo, today Wed 15 Jul 26):** Hex (`rocky`) is planned on Sat 18. Saber ticks Hex SANS on Quals;
  Hex reads his reminder. Saber unticks him — Hex gets "You're no longer SANS. · Saber" and reads it. Saber presses Undo
  (Hex SANS again; the line is struck "taken back") and then Redo (the untick stands again; the line is told again,
  unread). Later Saber ticks Hex SANS again (a new step).
- **What goes wrong:** Hex's reminder "You're planned on Sat 18 Jul with nothing filed" comes back **already read — no
  unread mark on his bell.** Without the Undo + Redo in the middle (untick, then tick again) the same reminder comes back
  **unread**, as the build means it to ("the same posting made again is NEWS" — the reminder's base counts every line that
  ended his SANS). An Undo followed by its Redo, which changes nothing in the end, changes what his bell does later; he can
  miss that he must file for Sat 18 again.
- **Cause:** the fix excludes from the count any line a "taken back" names, meant for the line an admin's Undo of a tick
  writes and its Redo strikes. But the untick's own line gets a "taken back" too when its Undo runs (`followUpsFor`:
  `back: true, ref: <the line>`), and its Redo puts the line back with an "again" copy — the "taken back" stays on the bell.
  So the untick line, back and in force, is now "retracted": `dueBase` skips it, and the "again" copy is skipped as a copy.
  Nothing counts the end of his SANS. (Shown by probe: with the one condition taken out of `dueBase`, both tests pass.)
- **The fix, step by step:**
  1. In `sansunfiled.ts`, make `retracted(x)` mean "the last word on this line is a take-back": true only when some line
     of his has `k: 'sansback', back: true, ref: x.id` **and no line of his has `k: 'sansback', again: true, ref: x.id`
     later than it** (later as `state/notices.ts sansLater` reads it: time, then the list's order). An Undo's own line never
     gets an "again" copy, so it stays retracted; an untick's line put back by its Redo is not.
  2. Give `state/notices.ts sansRetracted` the same rule (export one body from `notices.ts` and use it in both files, so
     the bell and the reminder's base cannot disagree). Today `sansBackLeft` and `sansLineOut` happen to give the right
     answer for the untick chain (its "again" copy hides the original and claims its days), but only by accident.
  3. Keep `sansUndoToldNow`'s use as it is (it asks whether a remembered Undo line was already struck).
  4. Run `src/r3-opus/o3-1.test.tsx` (the control and the case), then the builder's `sans-reads-156` "R2-1" block.
- **Test:** `src/r3-opus/o3-1.test.tsx`, "the same, but Saber presses Undo and Redo on the untick between" — fails
  `expected +0 to be 1` at its last line; its control in the same file passes.

### O3-2 — speed: the held weeks' new key changes on every plain row added to or removed from the loaded week's Ground Programme, so every held week ahead is read again (low)

- **Where:** `engine/overlay.ts loadedSrcSig` (moved here this round), as used in `leavewar/sansunfiled.ts weeksHeld`; also
  the `cur` part of the key.
- **The concrete case:** Hex ticked SANS; 40 saved weeks ahead (each edited once). With the week of 13 Jul on screen
  Saber adds one briefing row for Bane on Thu 16 — no request, no saved week touched. The next reading of Hex's reminder
  (his own bell, or the start of any Quals / Admin → Users / posting command on Saber's desk) reads all 40 weeks again:
  **about 140–160 ms and 14,440 week parses** on this PC, against **about 1.5 ms** when the key holds. With 6 held weeks:
  330 parses instead of 0.
- **Cause:** `loadedSrcSig` writes one entry per Ground Programme row, empty for a row with no request (`'' ` joined by
  commas), so adding or removing *any* row changes the string though no request's row moved. The key also carries the
  week on screen (`cur`), so every week change re-reads them all; only its year is read by a held week (its labels), the
  rest is in `loadedSrcSig`. (Probe: with empty entries left out, the test passes; nothing else changed.)
- **What it costs:** not a wrong answer — the regression is in what item 9 fixed. The key itself is cheap (0.05 ms with the
  demo's 28 inputs; it grows with the inputs list, a few ms at a few thousand).
- **The fix, step by step:**
  1. In `loadedSrcSig`, leave out rows with no request: `.map(g => (g && g.src) || '').filter(Boolean).join(',')` per day
     (the peek, which shares it, is unharmed: a row with no request lands nothing).
  2. In `weeksHeld`'s key, replace `cur` with the year of the week on screen (`String(cur).split('/')[2]`), keeping
     `loadedSrcSig` for which week's rows stand.
  3. Add the edit to the builder's test 9 ("parsed once"): a `plan(1, 'bane')` between the two readings must read 0 weeks;
     `src/r3-opus/o3-2.test.tsx` first test is that case.
- **Older, said so it can be weighed:** the re-read, when it happens, is quadratic past 32 held weeks — `weekstash.ts`
  `stashRowsBySrc` clears its whole memo once it holds more than 32 weeks, and `rowElsewhere` walks every saved week for
  each request to land, so 40 weeks cost 14,440 parses, not 40.
- **Test:** `src/r3-opus/o3-2.test.tsx`, first test — fails `expected 330 to be +0`; the second prints the timings.

---

## Questions (no concrete failure staged)

- **Q1 — the held weeks' key leaves out two inputs of a saved week's reading.** (a) Another saved week's rows: whether a
  request lands in held week A depends on whether its row stands in saved week B (`rowElsewhere`); a change to B's saved
  copy alone (an off-week Undo, written to the saved copy while another week is on screen) refreshes B but not A. Every
  ordinary path I traced that moves such a row also changes the request (`acc`, its date) and so `requestsSig`; I could
  not find one that does not, so this may be safe — Fable's round-2 fix step 2 asked for it explicitly. (b) A man's home
  squadron by date (`inputOnDay` → `homeUnitOf(p, day)`): a transfer dated ahead changes where his requests land without
  touching the key. Cheap to close: add every held week's blob to the key (or clear `HELD` when any held blob changed), and
  the home rows' signature.
- **Q2 — a day planned while the Undo had taken his SANS away does not light after the Redo.** Saber ticks Hex, Hex reads,
  Saber presses Undo, plans Hex on Mon 20, presses Redo: the reminder names Sat 18 and Mon 20 and is already read (no mark is
  written for a man not SANS when planned; the Redo is rightly no news). Round 2 lit it by accident (the line it left
  standing bumped the base). It follows the builder's reading "his date moving is not news; only a newly planned day",
  where "newly planned" means planned while SANS — for the owner to confirm, not a fault against the reading.
- **Q3 — a man archived by his posting (overseas) keeps his planning rows** (round 2's Opus R5 aside). Right if he can be
  restored; unbounded only by archived men. Not addressed by the fix; say so or prune at the database step.
- **Q4 — the builder's "after a reload" tests do not reload the bell from storage** (`reboot()` re-sorts the bell in
  memory). My `o3-c.test.tsx` checks instead that the Redo's own saved command carries the take-back (the delete, or the
  struck line) — both pass, so the change is saved with the Redo.

---

## Per-item verdicts (§3.1)

| Round-2 finding (as `FIXES-CLAIMED.md` names it) | Verdict | Why |
|---|---|---|
| Redo takes back the line its step's Undo wrote — Astra F1 = Opus R2 (A, B, C) = Fable F2 | **CLOSED, but the fix broke something** | The builder's tests are the cases (unread: gone; read: struck, unread; Undo/Redo/Undo read: one line; repeated unread: none; reminder stays read). I checked the Redo's own saved command carries the change (`o3-c`). The gate lets only that line through, only in that person's Redo of that step. The new "taken back ends nothing" rule also catches the untick's own line after its Redo — **O3-1**. |
| Held weeks kept by everything their reading uses — Astra F3 = Opus R1 = Fable F1 (1a, 1b, 1c) | **CLOSED** (speed regressed — **O3-2**; Q1) | Each case is the reader's own, word for word (Astra's with its Undo/Redo). The key now changes too often (plain rows, every week change). |
| Planning mark owed by its cause — security RR-SEC-1 = Opus R4 (cases 1, 2) | **CLOSED** | A projection from outside any command has no cause: refused; one from a subscriber of an unrelated command owes nothing: refused; a subscriber of a real planning can only write that very day's stamp, higher — no relight without a planning, no put-out of a lit day. The real planning still marks (tests). |
| Hidden sentence through repeated Undo / Redo — Astra F2, security Q2 | **CLOSED** | Astra's case and its read counterpart pass, with the bell re-sorted as a reload does. Note: the tests run on a frozen clock, so "later by time" reduces to list order there; I traced the real-clock orders (a Redo copy newer than an independent line between; an original put back older than it) — one line says each day in each. |
| A man deleted by his posting's run takes his planning rows — Astra F4 = Opus R5; Fable F3 | **CLOSED** (Q3 for archive) | The run's projection may take away only the rows of men it deletes. Fable F3: the app's settings door removes a key saved as nothing (`storage/adapters.ts`), so the fixture's change is right. |
| Opus R3 (top bar's Undo of a posting silent) | **CLOSED — no fault** | Confirmed: a posting is never a step of the top bar's Undo (D321, D350); the case's Undo took back the planning, and a day leaving is no take-back. Two comments still say otherwise (tidiness 3). |
| Fable Q5 (today read outside the hook's guard); stale comments; the erase refusal's words | **CLOSED** | `effectiveToday()` is inside the `try`; header and `keyowner.ts` comments fixed; the refusal now says "no Undo or Redo of its own step". |

**§3.3, the permission gate:** `setSansUndoTold` vouches only inside the restore the timeline is applying now
(`applyingRestore`: live `APPLYING`, `undo.restore`, `causedBy` = the step), only a Redo, only the same person's step, only
a line id that step's Undo itself pushed (remembered in memory against the timeline entry), and only its exact deletion
(unread by his saved record) or its one exact struck copy (read). `setSansPlanOwed` finds the cause by `causedBy` in the
command stream, never by the projection's own label; a person's own command must newly put the man on that day; the
posting run may only take away a deleted man's rows. I found no command, hand-built or console-raised, that passes as
any of these. Each exception is as narrow as the case needs.

**§3.4 saved data:** every write goes through a command (the Redo's take-back is in the Redo's own envelope; the marks
through the `sans.planned` projection); nothing is removed but the unread Undo line and the named planning rows; growth is
one struck line per read Undo line retracted.

**§3.5 speed:** the key costs far less than the reading it saves when it holds (0.05 ms against 140 ms on 40 weeks), but
it does not hold across a plain Ground Programme edit or a week change — O3-2.

---

## Tidiness note (D489 — filed, not fixed)

1. **Duplicated:** "is this line named by a taken back" is written three times — `retracted` (sansunfiled.ts),
   `sansRetracted` (notices.ts) and the count inside `setSansUndoTold`; O3-1's fix should make it one body. `PLAN_KEY`
   (sansunfiled.ts) repeats `SANSPLAN_ID` (perms.ts). What a command owes in marks is worked out three times per command
   (the subscriber's test, the projection's apply, the gate), and `planOwedBy` works out every `put` for the posting run
   only to throw it away.
2. **Harder to follow than it needs to be:** `rememberUndoTold(NOTICES[NOTICES.length - 1]!.id)` relies on
   `noticeSansBack` pushing at the end; returning the new id from `noticeSansBack` would say it. The held weeks' key mixes
   what changes a reading (requests, rows with a request) with what only looks like it (rows without one, the whole week
   key) — O3-2.
3. **Saying what is no longer so:** `sansunfiled.ts` (the "THE LINE AN UNDO WROTE" block) and `perms.ts` (the comment
   above `SansUndoToldProbe`) both say an admin's Undo "of a SANS posting" tells the man; `sync.ts` (rightly) says no
   posting is a step of the top bar's Undo. The builder's "after a reload" tests re-sort the bell in memory rather than
   read it back (Q4).

**2 findings (O3-1, O3-2), 4 questions. Fix O3-1 first (a wrong bell after a plain Undo and Redo, brought in by this
round's fix), then O3-2 (speed only).**
