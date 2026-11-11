# Re-walk of the rules check's fixes (12 Nov 26)

Sonnet walker, frozen build of commit 2543c77c4 at http://localhost:4292/ (every run printed its bundle: `index-M7uAG4yZ.js`). Admin `ad` / `a`; Ranger is `bane`. Each scenario ran in a NEW browser context with real storage. Desktop 1536 x 864; phone 402 x 874 (dsf 3, touch) for R3 step 2 and R4. Real clicks and taps through the app's own controls; fixtures that read `window.DAYS` / classes only read them.

Scripts (`raptor-port/scripts/handpass/rcf/`): `rcf-rw-lib.mjs`, `rcf-rw-r1.mjs`, `rcf-rw-r2.mjs`, `rcf-rw-r3.mjs`, `rcf-rw-r4.mjs`, `rcf-rw-r4b.mjs` (where the old phrase still stands), `rcf-rw-r5.mjs`, `rcf-rw-r5probe.mjs` (how to reach next week; scaffolding).

**Cited final runs** (pictures under `raptor-port/docs/img/handpass/2026-11-12-rules-check-fixes/rewalk/`): `r1b/` (22) · `r2a/` (11) · `r3-desktop-b/` (17) · `r3-phone-a/` (6) · `r4a/` (6) · `r5c/` (12). Not cited, earlier attempts: `r1a` (my own too-narrow assertions, see R1), `r3-desktop-a` (its week picture was garbled by the sticky bars), `r4b`, `r5-probe*`, `r5b` (R5 without the control read).

Severity is read off the list line's class (`wln hard` = RED, `wln adv` = AMBER) and the puck's class (`hard` = red ring, `warn` alone = amber).

## Summary

| | verdict |
|---|---|
| R1 two clashes worded the same, one hidden | PASS (both variants) |
| R2 a flying shift under Advisory | PASS; step 4 as worded (PM times "back") has no overlap, so no clash exists: RECORD, with the overlapping variant PASS |
| R3 the desk of a flying AVALON wave | PASS desktop (board and week), PASS phone (board) |
| R4 the Logic page's two lines | PASS desktop and phone |
| R5 next week's published Monday and this week's Sunday | RECORD. Sunday's published face: PASS. Monday's published face carries a "Tight turning — crew rest" line for Ranger that is there BEFORE the raise, unchanged by it (for the host to judge against "no crew-rest line") |

## Table

| scenario | what I did (controls pressed) | verdict | what the screen showed | pictures |
|---|---|---|---|---|
| R1A.0 fixture | Friday (clean weekday). + Wave → Flying wave, typed VL / BFM / 12:00 / 13:00, armed FCP seat, pressed Ranger in the crew list; + Item (Ground), typed BRIEFING 12:00-12:30, armed its people cell, pressed Ranger | PASS | One line "Ranger — VL BFM & BRIEFING clash", RED live; both his pucks red on the board and on the week behind it | r1b/r1A-0-built.png, r1A-0-board.png |
| R1A.1 hide | pressed the line's ✕ | PASS | Line stays, struck, with the Reset arrow ("reset"); head "1 issue"; both pucks plain on board and week | r1b/r1A-1-hidden.png |
| R1A.2-4 second clash worded the same | + Wave, VL BFM 15:00-16:00, + Item BRIEFING 15:00-15:30, Ranger on both | PASS | The clash line shows live and RED: "Ranger — VL BFM & BRIEFING clash", head "2 issues · 1 warning". It is ONE merged line — the struck line is not drawn beside it (so "a second line" does not exist, the one line is live again). Ranger's pucks RED on the board (4.0.0.0.p, 4.1.0.0.p, g:4.2, g:4.3) and on the week behind it (same four) | r1b/r1A-2-list.png, r1A-3-board.png, r1A-4-week.png |
| R1A.5 delete the second BRIEFING row | pressed that row's delete (its ✕ on the ground row; ground rows 4 to 3) | PASS | The line is struck again (hidden, Reset arrow shown), head "1 issue"; all three of Ranger's pucks plain on board and week | r1b/r1A-5-deleted.png, r1A-5-deleted-board.png |
| R1A.6 Reset arrow | pressed the struck line's Reset arrow | PASS | Line live and RED again; pucks red (4.0.0.0.p, 4.1.0.0.p, g:4.2) on board and week | r1b/r1A-6-reset.png, r1A-6-reset-board.png |
| R1B (variant: the second BRIEFING row 12:10-12:40 overlapping the first VL line, no second VL line) | same steps | PASS (all 7 checks) | Hide, second clash live and RED (head "2 issues · 2 warnings"; pucks red on the sortie and both BRIEFING rows, board and week), delete second BRIEFING → struck and plain, Reset → live red | r1b/r1B-*.png |
| R2.1 Logic | Logic → ✎ Edit, unticked "another shift" under "SC MAIN clashes" | PASS | "another shift Advisory" | r2a/r2-1-logic-adv.png |
| R2.2 | Saturday. + Wave → SC; AM R typed 06:30, PM START 09:00 END 15:00 (PM defaults were 13:00-19:00), Ranger on the MAIN seat of both | PASS | ONE line "Ranger — SC PM & SC AM clash", RED (`wln hard`); both pucks red (5.0.0.0.p, 5.0.1.0.p) | r2a/r2-2-flying-red.png, r2-2-board.png |
| R2.3 | cleared AM's R | PASS | "Ranger — Ranger is on SC AM (07:00–13:00) and also down for SC PM", AMBER; both pucks AMBER, no red | r2a/r2-3-standby-amber.png |
| R2.4a | typed AM's R again | PASS | Red line again "Ranger — SC PM & SC AM clash"; pucks red | r2a/r2-4a-R-again.png |
| R2.4b / 4c | PM times put back to what the wave drew (13:00-19:00; AM stays 07:00-13:00), AM R cleared, ticked the PM MAIN row's FLIES | RECORD | With the times back the two shifts only touch at 13:00, so there is no clash at all: no line for Ranger, pucks plain, both before and after the FLIES tick. I read this as "no overlap, nothing to judge", not a fault | r2a/r2-4b-times-back.png, r2-4c-flies-ticked.png |
| R2.4d the overlapping variant | PM FLIES ticked (stays ticked), PM times typed 09:00-15:00 again, AM R cleared | PASS | "Ranger — SC AM & SC PM clash" RED; pucks red | r2a/r2-4d-flies-overlap.png |
| R2.5 restore | Logic → ✎ Edit, ticked "another shift" | PASS | "another shift Warning" | r2a/r2-5-logic-restored.png |
| R3.0 fixture | Saturday. AVALON wave; "+ Block" → AVALON; seated Ranger on the SXO desk 19:00-07:00 and on VIPER 20:00-21:00 in another wave; Comet on the AVALON MAIN seat | PASS | Desk SXO 19:00-07:00 Ranger, sortie 20:00-21:00 Ranger | r3-desktop-b/r3-1-standby-desk-d.png |
| R3.1 standing by | read the board | PASS | No clash line for Ranger (only "This day is not published yet…"); his desk puck "puck sm" plain | r3-1-standby-warn-d.png, r3-1-standby-desk-d.png |
| R3.2 R typed 18:00 | typed the AVALON formation's R | PASS | Red list line "Ranger — VIPER & SXO duty clash"; Ranger's puck ON THE DESK "puck sm warn hard boxred" (red ring) on the board; on Edit Schedule's week the desk puck "puck sm warn hard boxred" and the seat puck the same; his desk puck wears the red ring in the cropped picture | r3-desktop-b/r3-2-R-warn-d.png, r3-2-R-desk-d.png, r3-2-R-week-d.png, r3-2-R-week-full-d.png |
| R3.3 R cleared | cleared R | PASS | No clash line, desk puck plain | r3-3-R-cleared-desk-d.png |
| R3.4 flies by the FLIES tick | ticked FLIES on the AVALON MAIN row | PASS | Same red clash line; desk puck "warn hard boxred" on board and week | r3-4-flies-desk-d.png, r3-4-flies-week-d.png |
| R3 phone step 2 | phone 402; same fixture by touch taps; typed R 18:00 | PASS | Same red clash line; desk puck "puck sm warn hard boxred" on the phone board (red ring in the picture). Phone tap-pictures not taken for this one (a read of the settled board only) | r3-phone-a/r3-2-R-desk-p.png, r3-2-R-board-p.png, r3-2-R-warn-p.png |
| R4.1 | Logic, opened every "How it works" fold (4), read the line | PASS desktop and phone | "…but his in-time or rally, or his B where neither is typed, is later, so his rest clears." | r4a/r4-1-tight-turn-d.png, r4-1-tight-turn-p.png |
| R4.2 | same | PASS desktop and phone | "A shift with its B or R typed flies, every row on it; a row ticked FLIES on the Scheduler Board flies on its own. A row that flies has its clashes and turns checked as a sortie's are, counts as a jet and a sortie, and earns OIL by default. A row with nobody on it counts nothing; one that does not come in is cancelled with CX." | r4a/r4-2-row-flies-d.png, r4-2-row-flies-p.png |
| R4 note | searched the page for the old wording | RECORD | The heading of that note still reads "Note: A standby row that flies" (the heading word, not the changed line); a second note, "In-time window cut", reads "A standby row that flies has a typed B … or R …" — its own different line. On the phone I reached Logic by a script click on the page's link (the side menu was not driven) | r4b/old-phrase-0.png |
| R5 fixture | Week of 20 Jul via the date calendar. Monday already had Ranger on two waves (5:40 and later lines) so I took him off both seats by dragging, then + Wave VL BFM 12:00-13:00, B blank, Ranger; four sign-offs, Publish day. Week of 13 Jul: Sunday had no Ranger; + Row on the duty block, role SXO 13:00-21:30, Ranger | RECORD | Monday 20 Jul View-only Sched head "Monday Jul 20 ORIG 4 X 2 X 1 Original — as issued … SIGNED ORIG"; the Sunday row "SXO 13:00 21:30 Ranger" | r5c/r5-2-monday-published-viewonly.png, r5-3-sunday-built.png |
| R5.4 View-only Sunday, default setting | opened View-only Sched | PASS | No "Breaks Monday" box for Ranger; only "OIL waiting — this day is not published"; his puck "puck sm oilbar" | r5c/r5-4-before-sunday-viewonly.png |
| R5.4 working copy | Edit Schedule, Sunday | RECORD | Same: no Breaks box | r5c/r5-4-before-sunday-working.png |
| R5.5 raise | Logic → Edit, "Brief before take-off" 2h20 → 3h20 (200 minutes) | done | read back "3h20" | r5c/r5-5-logic-raised.png |
| R5.6a View-only Sunday after | opened View-only Sched | PASS | Still NO "Breaks Monday" box; strip unchanged ("OIL waiting …"); Ranger's puck "puck sm oilbar" | r5c/r5-6-after-sunday-viewonly.png |
| R5.6b working copy Sunday after | Edit Schedule | RECORD | The working copy DOES flag: red-edged box "Breaks Monday — Ranger — had to leave by 20:40. Crew rest breach — Sunday ended 21:30 → crew rest clear at 09:30, but told to report 08:40 — only 11h10 rest."; his puck "puck sm boxdot" | r5c/r5-6-after-sunday-working.png |
| R5.6c Monday 20 Jul published face, View-only Sched, after the raise | opened View-only Sched, Monday 20 Jul | FAIL against "no crew-rest line", but see next row | A line for Ranger: "Tight turning — crew rest — Ranger — Tight turning — T/O 12:00 puts the 3h report at 09:00, inside 12h. Sunday ended 21:30 → crew rest clear at 09:30" (list has 10 issues, 2 warnings) | r5c/r5-6-monday-viewonly-after.png |
| R5.4b control, same face BEFORE the raise (Sunday already built) | same | RECORD | The SAME line, word for word, before the raise (picture 4b), after the raise, and after the setting was restored (picture 7). So the raise did not start this line; it comes from the 3h default rally, not from "Brief before take-off". Whether it should be on a published Monday at all is for the host | r5c/r5-4b-before-raise-monday-viewonly.png, r5-6-monday-viewonly-after.png, r5-7-after-restore-monday-viewonly.png |
| R5.6d working copy Monday after the raise | Edit Schedule, Monday 20 Jul | RECORD | "Crew rest (<12h) Ranger — Crew rest breach — Sunday ended 21:30 → crew rest clear at 09:30, but told to report 08:40 — only 11h10 rest. new once signed" and "Tight turning — crew rest Ranger goes away once signed"; his pucks red-ringed | r5c/r5-6-monday-working-after.png |
| R5.7 restore | Logic "Brief before take-off" back to 2h20 | PASS | read back "2h20" | (log) |

## Notes and scripts' own faults

- R1: my first run (`r1a`) FAILED two assertions that were the script's own: I expected a struck line to stay beside the new live line (the app draws ONE merged line, live) and I assumed Friday had one ground row before I added mine (it has three). Final run `r1b` has the corrected assertions; the pictures `r1a` agree with it.
- The R1 "second clash worded the same" shows ONE merged line, not two lines. Before the fix (W2) the same fixture showed the old struck line and nothing live; now the one line is live and red.
- R5: Monday 20 Jul in the demo is not a blank day — it already had two waves with Ranger on them and many conflicts (publishing was not refused). I cleared Ranger's seats first, as the brief says for Sunday.
- R3: the first run's week picture was garbled (sticky bars over a tall day); `r3-desktop-b` clips around the desk puck.

## Browser console

No console errors, page errors or 4xx responses in any final run (r1b, r2a, r3-desktop-b, r3-phone-a, r4a, r5c).

## Not walked

- R3 on the phone beyond step 2 (steps 1, 3, 4 not asked for there); no phone tap-pictures for R3.
- R1 on the phone (desktop only, as the brief says).
- R5 on the phone (not asked).
- R5 "Monday's published face" judged only by the warning strip and the day's box labels; I did not compare the printed B on Monday's face before and after (it was blank and the strip is what the brief asks).
