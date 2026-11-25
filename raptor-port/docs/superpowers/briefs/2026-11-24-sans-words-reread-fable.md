## Fable's blind re-read — the fix round of the new SANS words (copy `D:/raptor-work/c156-read2`, commit `f73602f9f`)

**In one line:** 3 findings (one a regression the speed fix brought in, one a gap beside item 4's fix, one "closed only in part"), 5 questions. Of the 11 items to judge: **9 CLOSED, 0 NOT CLOSED, 2 CLOSED ONLY IN PART** (items 1 and 9). The new "stamp that only grows" held in every order I tried; I found no door through the replay probe or the command-layer hook.

**What I read.** `BRIEF.md`, `FINDINGS.md`, `FIX.diff` whole, the round-1 brief §1, the four round-1 reports' cases, and whole: `leavewar/sansunfiled.ts`, `state/noticeseen.ts`; the parts the fix touches of `state/perms.ts`, `command/commit.ts`, `undo/timeline.ts` (the restore, `applyingRestore`, `verifiedReplay`), `leavewar/sync.ts` (`warNoticesReversed`, `takeBack`, `retractPostingLines`), `state/notices.ts`, `engine/weekstash.ts` (`stashDays`), `engine/overlay.ts` (`viewOfWeek`), `engine/hooks.ts` (`store`). Nothing changed in the copy.

**How it was proved.** The copy runs the app's own tests as it stands this time (the builder's five SANS files: 158 of 158 pass). My tests sit outside it: `D:/raptor-work/c156-reread-fable/fable-reread.test.tsx` (built by `run.sh` from the fixture of `sans-reads-156.test.tsx`, its first 106 lines, plus `fable-reread-body.txt`), config `vitest.config.mjs` beside it. From `raptor-port`: `npx vitest run --config D:/raptor-work/c156-reread-fable/vitest.config.mjs fable-reread.test`. **6 tests, all 6 fail on this commit**, each at the line marked "receives". For finding 1 there is also a control: `old.test.tsx` runs the same three tests against round 1's reader (`sansunfiled-old.ts`, this file with `FIX.diff` taken back) and **all three pass** — so finding 1 came in with this round's fix.

---

### Finding 1 — the reminder now misses, or keeps, days in a week that is not on screen (a regression from item 9's speed fix) — REPRODUCED, 3 tests

- **Where:** `leavewar/sansunfiled.ts`, `weeksHeld` and the new `HELD` map ("a saved week ahead is read once and kept … until its saved copy changes").
- **Case 1a.** Hex is ticked SANS. The week of Mon 20 Jul has been edited, so the app holds a saved copy of it; the week of Mon 13 Jul is on screen. Saber (or Hex) files a meeting for Hex on Thu 23 Jul. The saved week, read now, names Hex on Thu 23 (the request lands as a row on read) — but Hex's reminder does not list Thu 23. It appears only after a reload, or once somebody edits that week.
- **Case 1b, the other way.** The meeting on Fri 24 Jul is deleted. Hex's reminder goes on saying he is planned on Fri 24 with nothing filed. He can only clear it by filing for a day he is no longer on.
- **Case 1c, the New Year.** Today Tue 22 Dec 26. Hex is on Tue 12 Jan 27, in a held week; he looked at his bell while a January week was on screen. With the week of 21 Dec on screen he files SANS availability for Tue 12 Jan. The reminder still says Tue 12 Jan has nothing filed, until a January week is loaded again.
- **Cause.** What a saved week names is not a function of its saved copy alone. `stashDays` works the week out on read (`engine/overlay.ts viewOfWeek`): the activity requests as they stand now (landed, re-dated, handed on, deleted — and whether a request's row already stands in the loaded week or another saved week, `rowElsewhere`), and it re-labels each day's `dt` for the year of the week on screen ("Jan 12" under a 2027 week, "Jan 12 2027" under a 2026 one). `HELD` keeps the worked-out days, and who each names, while the blob string is unchanged — so a request filed or deleted, or a week of another year loaded, leaves a stale answer. In 1c the kept label "Jan 12" is then read as 12 Jan 2026 by `sansAvailOn`. Round 1's code re-read the weeks on every change of the app, so it was slow but right.
- **Fix, step by step.**
  1. In `weeksHeld`, work out one mark for everything a held week's reading depends on besides its own blob: `requestsSig()` (already exported by `engine/overlay.ts` for exactly this — the peek keys its memo on it), the week on screen (`CURWEEK`, which carries the year), the squadron in view (`UNIT`), and the ids of the request rows standing in the loaded week (`DAYS` rows with `src`) — or, simpler and safe, the store's version whenever the change touched inputs or any week.
  2. Keep that mark beside `HELD`; when it differs, `HELD.clear()` before the loop. A blob change of any one held week should also drop the others (a request's row moving between two saved weeks changes both readings).
  3. Bring tests 1a–1c onto the branch (they are written in the app's own style) and see them fail first.
  4. Re-measure item 9's own test ("parsed once, not again on a change that leaves them as they are") — a schedule edit of the loaded week that moves no request row must still cost no week read.

### Finding 2 — Saber's Redo leaves "You're no longer SANS." unread on Hex's bell while Hex is SANS again, and lights his read reminder (beside item 4's fix) — REPRODUCED, 2 tests

- **Where:** `leavewar/sync.ts warNoticesReversed` (the new `unticked` branch writes a line on the Undo; nothing answers it on the Redo); `leavewar/sansunfiled.ts dueBase`.
- **Case.** Hex is on Sat 18 Jul. Saber ticks SANS for Hex on Quals; Hex reads his reminder. Saber presses Undo — Hex is told "You're no longer SANS. · Saber" (item 4's fix, right). Saber presses Redo.
- **What goes wrong.** Hex is SANS again, yet his bell still shows "You're no longer SANS. · Saber", unread, and beside it his reminder, lit again although nothing was newly planned. Two lines that contradict each other, from one Undo and one Redo. The round's own reading is "a Redo is no news"; D1693 says every bell line is taken back by the undo of what made it — an unread one simply goes.
- **Cause.** The line is written inside the Undo's restore, so it belongs to no step: the Redo's replay cannot take it away, and `followUpsOwed` only knows lines a step itself put. The line is marked `ended`, so `dueBase` counts it for good and the reminder moves to a base Hex never read.
- **Fix, step by step.**
  1. When the Undo writes the line (the `unticked` loop), keep its id on the step being undone (a small field on the undo entry, e.g. `told: string[]`; `applyingRestore(env).entry` is in reach).
  2. On the Redo of that step (`dir === 'redo'`, a forward change that puts `san` on), take those lines back as D1693 says: one he has not read (his read record as saved) is removed; one he has read gets the existing struck "taken back" line (`back: true`).
  3. Let the gate allow exactly that: in `sansBackEraseViolation`, pass a delete when the restore being applied is the Redo of the same person's step and the line's id is one that step recorded in step 1 — nothing wider.
  4. With the line gone `dueBase` falls back by itself, so his reminder is the one he read: dark. Tests: the two in "RE-READ 2".

### Finding 3 — "past days dropped" and "a deleted man's rows go with him" blank the rows; the rows stay (item 1, round 1's F6: closed only in part) — REPRODUCED, 1 test

- **Where:** `leavewar/sansunfiled.ts`, the `sans.planned` projection (`store.set(k, null)`); `engine/hooks.ts store.set` writes the text `null` under the key, it never removes it.
- **Case.** Hex is marked for Sat 18 Jul; on Sun 19 the app marks Sun 19 and "drops" Sat 18. The store still lists `sansplan:rocky:2026-07-18`, holding nothing. Same after Hex is deleted. One row for every SANS man and every day he was ever newly planned stays for good; `dueToken` and the projection list all of them on every reminder drawn and every marking (the projection also re-"drops" every blank row each time).
- **Why the builder's tests pass:** their helper `plans()` filters out rows holding nothing, so "expect only Sun 19" is true of values, not of rows.
- **Fix.** Either (1) say so plainly — the settings store has no removal, every setting taken away leaves a blank row, and the database step's table drops them — and file it for that step; or (2) give the settings store a real removal for these rows (the browser backend has `removeItem`) and use it here. Until then, in `dueToken` and the projection skip blank rows before parsing, and do not push an already-blank row into `drop`. Low: slow growth, no wrong behaviour.

---

### What I weighed and found holding

**The stamp that only grows.** Tried, each as a run in the fixture:
- planned, read, Undo, planned afresh with the clock set two hours back → a stamp one higher than the one he read: lit. (The three terms `LAST_STAMP + 1`, `read + 1`, `planOf + 1` each cover a case the clock alone would miss.)
- planned, read, Undo, Redo → the very stamp he read: dark. Planned, not read, Undo, Redo → still unread.
- a reload (the device's last stamp forgotten): the row's own stamp and his read stamps still bound the next one; stamps are only ever compared for the same man and day, so nothing needs to be ordered across rows.
- a step that both marks one day and drops a past one: its Undo puts both rows back exactly, and the gate's probe passes them.
- The probe (`setSansPlanReplay`): passes only while the undo is applying a restore (`APPLYING`), of the same person's step, for a row that step holds, written back to exactly the value recorded. A command that calls itself `undo.restore` through the public `commit` has origin `user` and is refused; `sans.planned` from a person is refused; a bare write throws. An admin can only replay marks the app itself wrote into his own steps, which is the design.
- **The command-layer hook.** The change-history hook (`elogAdoptHeld`) takes no argument and keeps the default "a person's own commands", so it is unchanged. The SANS hook now also runs for restores, reads only, and is handed the envelope it could already reach through `activeEnvelope()`. Joined child commands still run no hook. No new door.
- **`sansBackEraseViolation` without its exception.** I looked for an honest command that still deletes a stored SANS change line (delete, archive, restore, Undo post out, a posting moved, a squadron move): none does — `retractPostingLines` takes only posting lines and the worked-out reminder. Nothing honest is now refused.
- **The `ended` mark, the read record kept and folded, only the latest Redo copy, the hidden sentence on the later line:** the builder's tests are the round-1 cases themselves (I compared each with its report), and the orders I added — ticked and posted with a tick-only day filed, a member unticking himself between two admin lines, Undo and Redo twice — gave one current line and no relit reminder.

### Questions (no concrete failure staged)

- **Q1 — two devices, at the database step.** The stamp is safe while the planner's device can see both the row and Hex's saved read record. A device that sees neither yet (the row blanked by an Undo, his read not yet arrived) and whose clock is behind could write a stamp below one he has read: dark. Nothing in this build shares a store between devices, and D2264 gives server time later; worth a line in the database step's list.
- **Q2 — a change arriving from another device.** `sansPlanViolation` has no pass for an envelope of origin `remote` or `seed`; nothing raises one today. When one does, the planner's mark would be refused on every other device.
- **Q3 — `commitProjection` is exported from the command layer's index.** A top-level call with type `sans.planned` passes the gate as the app. True of every app-only row and reachable only by code, not by a person; said for completeness.
- **Q4 — his read record now only grows too.** One id per reminder base, every day he ever read, never trimmed, and a new base each time his SANS ends; that id is also the reminder's own id on screen. Small, but it is the growth F6 named, moved from the marks to the read record. For `[NOTICE-RETENTION]`.
- **Q5 — the hook runs before the command's own `try`** (`command/commit.ts`, the loop above the pipeline's `try`). `effectiveToday()` in the SANS hook is outside the hook's own `try`; a throw there would skip that pipeline's roll-back path. It was so before for a person's command; it now holds for an Undo and Redo as well.

---

### Verdicts, item by item (§3.1)

| # | Item | Verdict | Note |
|---|---|---|---|
| 1 | The planning mark: a stamp, the app's alone, past days and a deleted man's rows | **CLOSED ONLY IN PART** | F1/A#4, A#1, SEC156-1, SEC156-2, O F4: closed, tests are the cases themselves. F6: the rows are blanked, not removed — finding 3. |
| 2 | The `ended` mark | **CLOSED** | Both of the Opus read's cases, and the gate. |
| 3 | His read of the reminder kept | **CLOSED** | Tap and "Mark all read". (Growth: Q4.) |
| 4 | Saber's Undo of a tick tells him | **CLOSED** | The round-1 case. The Redo after it is finding 2. |
| 5 | The input window says the cut | **CLOSED** | |
| 6 | Only a verified Undo/Redo deletes a SANS line | **CLOSED** | Nothing honest relied on the old exception. |
| 7 | The gate requires `how` and `to` | **CLOSED** | |
| 8 | A#3 (forged read in memory), A#5 (repeated Redo) | **CLOSED** | |
| 9 | Speed | **CLOSED ONLY IN PART** | Fast now, but the kept reading goes stale — finding 1. Past weeks skipped by key, and the note taken only for people-module commands and their Undo/Redo: both right (every door that changes a posting or a tick is a people-module command; I checked each caller). |
| 10 | The cut note cleared in `finally` | **CLOSED** | Pinned only, as the builder says. |
| 12 | W12-1, the hidden sentence on the later line only | **CLOSED** | Worked out at draw, so it holds after a reload. |

(Item 11 is the owner's question.)

### Tidiness note (D489) — filed, not fixed

1. **Duplicated:** the reminder id's small language (`base~day.stamp,…`) is now parsed in four places — `readOf` and `nextStamp` in `sansunfiled.ts`, `reminderOf` and `keepReminders` in `noticeseen.ts` — each with its own base test; `weeksHeld` reads each blob twice (`stashGet`, then `stashDays` gets it again); `dueToken` asks `planOf` twice a row.
2. **Harder to follow than it needs to be:** "lit" is decided in `sansUnfiledLines`, "read" in `dueRead`, "newer than" in `nextStamp`, by three slightly different rules over the same marks; the test names in `sansplan-sec156.test.ts` still describe the fault ("passes, though…", "saved unjudged") while asserting the fix.
3. **Left doing nothing, or saying what is no longer so:** `storage/keyowner.ts` still calls the row "how many times a SANS man was newly put on a day"; the head of `sansunfiled.ts` still says "not before the posting's date" (D2340 changed it); the test helper `plans()` hides blank rows (finding 3).

**3 findings, 5 questions. Fix finding 1 first (it is a regression: the reminder says the wrong days until a reload), then finding 2; finding 3 can be filed for the database step.**
