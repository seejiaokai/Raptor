# Break tests — round 7 of the SANS words (chat 174), 25 Nov 26

Fresh Opus helper. Checkout `lw-balances-hover-275293`, branch `claude/allavail-sans-postout-141`.

- Start: `git status --short` empty; HEAD `d1d483d94d6f9b6871a1e8985aab19b4dcb710f6`.
- After every break: `git checkout -- <file>` then `git diff --quiet` (exit 0) before the next.
- Group G = the 55 test files under `src/` whose names hold sans / notice / bell / toast / seen
  (`src/engine/sans*.test.ts`, every `src/leavewar/sans-*`, `sansplan-sec156`, `allavail-sans-posted`, `fableoil-sans-crowd*`,
  `holnotice`, `m4bell`, `multi-sqn-fixread4-bells`, `multi-sqn-job2-warbell`, `postout-notice`, `src/state/bell`,
  `corelines-bell-moved-admin`, `demosans`, `multi-sqn-job2-bell`, `sansfly`, `src/tracker/trk-round-seen`,
  `src/ui/bellnotices*`, `msq-fix2-sansday-own-page`, `peek-sans-date`, `pendlist-unseen`, `sans-calendar-model`,
  `sanscal*`, `sanscards`, `sansday`, `sansform`, `sanssettings`, `seen`, `toast*`). Baseline on the clean checkout:
  55 files pass, 900 tests pass, 1 expected fail.

| # | Surface | Break (file — what changed) | Tests run | Result | Failing test(s) |
|---|---|---|---|---|---|
| 1a | Reminder's "planned" test — a cancelled line never counts (D2564/D2568) | `src/engine/avail.ts` daySansSeats — formation check `if(!f‖f.cx)return` → `if(!f)return` (a cancelled formation's crew counts) | G + `src/engine/avail.test.ts` | **RED** (2) | `sans-planned-r5.test.ts` › "a cancelled flight, nothing filed: no reminder day"; › "a cancelled flight: the checks' own collection names him exactly where the reminder's definition does" |
| 1b | same — a cancelled sim | `src/engine/avail.ts` daySansSeats — sim check `if(!o‖o.cx)return` → `if(!o)return` | G + avail.test | **RED** (2) | `sans-planned-r5.test.ts` › "a cancelled sim, nothing filed: no reminder day"; › "a cancelled sim: the checks' own collection names him…" |
| 1c | same — a ground row never counts | `src/engine/avail.ts` daySansSeats — one line added: every uncancelled ground row's man counted | G + avail.test | **RED** (12, 4 files) | `sans-planned-r5.test.ts` › "a ground programme row, nothing filed: no reminder day" (+5 more there); `sans-reads-156.test.tsx` R2-2 ×3; `sans-reads-r3.test.tsx` Astra F2 ×3; `sans-held-weeks-r5.test.tsx` › "…nor for a request filed and deleted, which lands on a ground row and never on a seat" |
| 2a | Relight rule (D2560) — a day dropping off must not relight | `src/leavewar/sansunfiled.ts` sansUnfiledLines — `lit` also true when the read set and today's days differ in size (`… ‖ read.size !== days.length`) | G | **RED** (4, 3 files) | `sans-words-156.test.tsx` › "read, then a day drops off: the bell stays dark"; `sans-reads-r3.test.tsx` D2560 › "a day he saw, taken off and put back … stays read, and lists the day", › "…and once he has read that too, neither day lights it again, in any order"; `sans-reads-156.test.tsx` › "ticked and posted ahead, a tick-only day filed, read, Saber unticks: the posting stands — stays read" |
| 2b | Relight rule (D2560) — a day not in it when read must relight | `src/leavewar/sansunfiled.ts` sansUnfiledLines — `lit = !read` (never lights again once read) | G | **RED** (23, 5 files) | e.g. `sans-reads-156.test.tsx` › "a day new to him still lights it: read with Sat 18, then planned on Sun 19"; `sans-words-156.test.tsx` › "read, then a new day planned: unread, the same one line naming both days"; `sans-reads-r3.test.tsx` › "one day replaced by another at the same count: lit"; `sans-seen-sec-r4.test.ts` › "CONTROL: Saber puts Hex on Sun 19, a day new to him — his read reminder lights again (D2560)" |
| 3a | Reminder's title — "You're SANS from …" vs "Your SANS availability is needed." | `src/state/notices.ts` noticeWords, the `sansdue` branch — `from ?` → `!from ?` (the two titles swapped) | G | **RED** (10, 3 files) | `sans-words-156.test.tsx` › "a man ticked SANS on Quals, with no posting, gets it too, under "Your SANS availability is needed."", › "a posted man: his date, then the days…", reading 5 › "the title becomes "Your SANS availability is needed.", and the change at midnight does not light the bell" (+4); `sans-unfiled.test.ts` ×2; `sans-ahead.test.ts` › "his bell line comes when the posting is saved — one plain sentence (D2342)" |
| 3b | same — the date shown only while it is ahead | `src/leavewar/sansunfiled.ts` sansUnfiledLines — `ahead` drops `from > today` | G | green — **an equivalent break, not a gap**: once his date arrives the posting makes him SANS today, so the remaining `!sansOnP(p, today)` already turns `ahead` off; no state reaches the dropped condition alone. Replaced by 3c. | — |
| 3c | same — no date in the title for a man the tick already makes SANS (W11-1) | `src/leavewar/sansunfiled.ts` sansUnfiledLines — `ahead` drops `!sansOnP(p, today)` | G | **RED** (2) | `sans-words-156.test.tsx` W11-1 › "posted from Fri 17: Wed 15 and Thu 16 the tick covers are named, under "Your SANS availability is needed."", › "posted from Sat 18: no "SANS from Sat 18 Jul." when the tick already covers Fri 17" |
| 4a | Change lines A–E's words (`sansBackWords`) — C, the untick | `src/state/notices.ts` sansBackWords title — `"You're no longer SANS."` → `"You're not SANS any more."` | G | **RED** (12, 3 files) | `sans-words-156.test.tsx` D2391 › "C, Saber unticks SANS on Quals (a new line)" (+5); `sans-reads-156.test.tsx` › "Saber ticks Hex SANS, Hex reads his reminder, Saber Undoes the tick: Hex is told" (+3); `sans-reads-r3.test.tsx` O3-1 ×2 |
| 4b | same — A/D, the date moved | same — `Your SANS date moved to …` → `Your SANS date changed to …` | G | **RED** (10, 3 files) | `sans-words-156.test.tsx` › "A, his date moved later", › "D, his date moved earlier, the reminder read: the title alone, and the live reminder stays" (+8) |
| 4c | same — B/E, the posting undone or another outcome | same — `"You're no longer posted out as SANS."` → `"You're not posted out as SANS any more."` | G | **RED** (8, 3 files) | `sans-words-156.test.tsx` › "B, the posting undone", › "E, another outcome" (+6, incl. "read the reminder, nothing filed, the posting undone: the title alone, not "taken back"") |
| 5a | "Only the days still hidden" — a day SANS again leaves the sentence | `src/state/notices.ts` sansStillHidden — drops `!sansOnP(person, d)` from the filter | G | **RED** (5, 3 files) | `sans-ahead-opusread.test.ts` F4 › "moved to Fri 24 then back to Fri 17: Sat 18 shows again, and the bell no longer says it is hidden"; `sans-reads-156.test.tsx` W12-1 › "his SANS date moved to Sat 18, read; back to Fri 17; to Sat 18 again: one line says Fri 17 is hidden"; `sans-words-156.test.tsx` › "moved twice, then partly back…" (+2) |
| 6 | The cut run at his SANS date (D2388) | `src/ui/inputedit.tsx` sansCut — first guard `if (!draft ‖ …)` → `if (draft ‖ !draft ‖ …)` (never cuts: return early) | G + `src/engine/latecut.test.ts`, `src/ui/inputssettings.test.tsx`, `src/ui/logicdoors.test.tsx`, `src/ui/reqonerow-app.test.tsx` (G6) | **RED** (12, 3 files) | `sans-words-156.test.tsx` D2388 › "Hex files Thu 16 - Sat 18 himself: Fri 17 - Sat 18 saved as one filing, in his own words", › "Saber files it for him…", › "a clipped save is one filing and one Undo step, and Undo brings back no early day", › "an edit in the window stretched back before his date saves from his date", › "the app's note stands alone: the window's "Input added" is not joined to it" (+6) |
| 7 | The shared offer refused, never trimmed (D2394 Q10) | `src/ui/inputedit.tsx` sansCut — drops `idsOf(except).length > 1 ‖` from the "never cut a record of several" guard | G6 | **GREEN — NOT CAUGHT** | none. See finding F1 below. |
| 8a | The greyed "+ Commitment" — its words before his date (D2421) | `src/ui/SansDay.tsx` — `hisNext = !canAdd && mine ? …` → `!canAdd && !mine ? …` (his date never found, the general words shown) | G | **RED** (1) | `sans-words-156.test.tsx` › D2394 Q4, D2421 › "his own day before his SANS date: "You're SANS from Fri 17 Jul."" |
| 8b | same — the grey itself | `src/ui/SansDay.tsx` — `disabled={!canAdd}` → `disabled={false}` | G | **RED** (1) | `sansday.test.tsx` › "a member who is not SANS cannot add one, and is told who can". (The D2421 test above checks the words only; the grey on his own days before his date is held only through this general test and the shared `maySansAdd`.) |
| 9 | The crew list gains no reason line (D2420) | `src/ui/palette-html.ts` rosterPuck — `showWhy=!!(armKey&&why&&!hideWhy)` → `!!(why&&!hideWhy)` (the reason printed with no seat armed) | G + `src/ui/crewunav.test.ts`, `drag.test.tsx`, `editweek.test.tsx`, `palette.test.ts`, `boardcrew.test.tsx` | **RED** (1) — caught only outside G | `src/ui/palette.test.ts` › "the SANS Availability palette section › an unarmed, record-less SANS puck is struck by default, reason in the title" |
| 10a | A read record written only by its owner (round 4, SEC-R4-1) — the owner check | `src/state/perms.ts` the `noticeseen:` gate — `own` drops `String(c.id) === noticeseen:${a.personId}` (any signed-in admin or member may write anyone's) | G + `src/state/perms.test.ts`, `src/state/units-sqn-fixread2.test.ts` | **RED** (5, 3 files) | `sans-seen-sec-r4.test.ts` › "an admin of the man's own squadron, in a command of any type: refused…"; `sansplan-sec156.test.ts` SEC156-1 ×3 (e.g. "at the gate: Kestrel's command writing Hex's read record — the one thing his reminder reads — is refused"); `units-sqn-fixread2.test.ts` › "Hunter (142's plain admin) may not write a bell line to 149's Osprey, nor mark his history or bell read" |
| 10b | same — the app's own actor (the projection door) | same gate — the app's own actor skipped (`… ‖ (a && a.role === 'system')) continue`) | same | **RED** (7) | `sans-seen-sec-r4.test.ts` › "the app's own actor, by a projection: refused", › "the app's own actor, named as the read command: refused", › "HOLE (a): Ranger, a 142 member, cannot put it out — Hex is still told he was put on Sun 19" (+4) |
| 5b | same — a filing taken away is not "hidden" | same — drops the `SANS_FILED` (still filed) check | G | **RED** (1) | `sans-words-156.test.tsx` › "…and where that Undo took the filing away, the line no longer says it is hidden" |
| 11 | The note that already says the save happened (`toastIsReceipt`) | `src/ui/toast.ts` — `if(BATCH)RECEIPTS.push(msg)` → `if(!BATCH)…` (inside a batch the receipt is never recorded) | G + every test file naming `toastHeld`, `saidSaved` or "Input added" (8 more) | **RED** (1) | `sans-words-156.test.tsx` D2388 › "the app's note stands alone: the window's "Input added" is not joined to it" |
| 12a | The merged bell — `firstTwo`'s count (main's D2521) | `src/state/notices.ts` firstTwo — `more = said.length - 2` → `- 1` | G + `m4ride`, `onerecord-perms`, `onerecord-write`, `opus-read-147`, `postout-takeback`, `sec147-read`, `sec147-read2`, `leavewar/ui/halfampm` (the files naming `noticeWords`) | **RED** (9, 2 files) | `bellnotices.test.tsx` round 4 › "Q3: five things — "and 3 more changes"; a name keeps its capital", › "Q3: his real case — moved, renamed and its remark changed in one save: the first two, then "and 1 more change"" (+4); `bellnotices-scenarios.test.tsx` ×3 (OR9, OR45, the filer told) |
| 12b | same — the SANS lines kept beside it, never through `firstTwo` | `src/state/notices.ts` noticeWords — the `sansback` branch deleted (SANS change lines fall through to `firstTwo`) | same | **RED** (42, 7 files) | e.g. `sans-words-156.test.tsx` › "(a) the Quals untick's line, read, then Saber's Undo: struck, "taken back · Saber", unread"; › ""Undo post out" is no Undo step (D350): its line, read, is left as it was by Saber's Undo" |

Row order note: 5b was written after 10b while the file was being filled; the numbers are the surfaces.

## Result

- **Surfaces caught: 11 of 12.** Breaks run: 23 — 21 red, 1 equivalent (3b, no state can reach it), 1 not caught (7).
- **Not caught: surface 7, "the shared offer refused, never trimmed" (D2394 Q10).**

## Finding F1 — the "never cut a record of several" guard in the SANS cut has no test

- The guard: `src/ui/inputedit.tsx` sansCut, `if (except && (idsOf(except).length > 1 || !holds(except, who))) return null`.
  Dropping `idsOf(except).length > 1` turned no test red in G6 (59 files, 945 tests).
- **Proved reachable through the one-record edit door.** A probe (written to the scratchpad, copied in as
  `src/leavewar/zz-probe7.test.tsx` only for the run and deleted straight after, the setup copied from
  `sans-words-156.test.tsx`): Hex posted SANS from Fri 24 Jul, Bane from Fri 17; one shared offer Fri 24 – Sat 25 for
  [Hex, Bane]; then its start moved to Thu 23.
  - P1, the shared door (`commitInput` with both men — what the input window uses for a record that holds several):
    refused on clean code AND with the break — the up-front refusal ("…Take him out of this offer…") stops it first.
  - P2, the one-record door (`commitInputEdit(rec, {…draftOf(rec), start: Thu 23})`): refused on clean code; **with the
    break it saves (true) — the shared offer is trimmed** — "expected true to be false".
- **How much it matters:** in the app as built the input window sends a record that holds several through the shared
  door, so a person pressing buttons today reaches P1, not P2; the drag (`moved`) and schedule-row (`sched`) callers of
  the one-record door never cut. So the guard is a backstop for the one-record door (a direct call, or a future
  caller), and nothing pins it. A test of P2's shape would hold it. For the host to judge: a test only, no app fault seen.

## Other notes for the host (not findings)

- 3b: dropping `from > today` from the reminder's "date ahead" test is equivalent — once his date arrives the posting
  makes him SANS today, and the remaining `!sansOnP(p, today)` already turns it off. 3c (dropping the tick check) is red.
- 8b: the grey of "+ Commitment" is caught only by the general sansday test (a member who is not SANS); the D2421 test
  checks the words, not the grey, on his own days before his date. Both read the one `maySansAdd`, so it holds today.
- 9: the D2420 break is caught only by `src/ui/palette.test.ts`, which is outside the 64 SANS and bell files the sheet
  §18.12 names as run on his PC — worth adding to that set.

## The checkout

- End: `git status --short` empty; HEAD `d1d483d94d6f9b6871a1e8985aab19b4dcb710f6` unchanged; branch
  `claude/allavail-sans-postout-141`. Every break restored by `git checkout -- <file>` and `git diff --quiet` (exit 0)
  before the next. No commit, push, build, full suite or `dist/` touched; no test file edited (the one probe file was
  new, run, and deleted; it is kept at the scratchpad, not in the repo).
